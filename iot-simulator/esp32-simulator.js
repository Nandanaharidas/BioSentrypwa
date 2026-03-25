/**
 * ESP32 Health Monitor Simulator
 * ──────────────────────────────
 * Mimics the real ESP32 device (iot/esp32.ino):
 *   - Generates realistic sensor values (BPM, SpO2, Temp, EMG, GSR)
 *   - Writes to Firebase RTDB at `devices/device_01` every 5 seconds
 *   - Serves a QR code page for device pairing
 *
 * Usage:  node esp32-simulator.js
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const QRCode = require('qrcode');

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getDatabase, ref, set } = require('firebase/database');

// ─── Config ─────────────────────────────────────────────────────────────────
const DEVICE_ID = process.env.DEVICE_ID || 'device_01';
const PWA_URL = process.env.PWA_URL || 'http://localhost:5173';
const PORT = process.env.PORT || 3001;
const PUSH_INTERVAL = 5000; // 5 seconds — matches ESP32 loop

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    authDomain: 'biosentry-3dabf.firebaseapp.com',
    projectId: 'biosentry-3dabf',
};

// ─── Firebase init ──────────────────────────────────────────────────────────
const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);
const db = getDatabase(firebaseApp);
let firebaseReady = false;

// ─── Sensor state (mirrors ESP32 volatile globals) ──────────────────────────
let beatAvg = 0;
let spo2Val = 0;
let tempVal = 0;
let emgVal = 0;
let gsrVal = 0;
let fingerDetected = false;

// ─── Sensor simulation ─────────────────────────────────────────────────────
// Mimics the smoothing / jitter from the real MAX30102 + analog reads

function clamp(val, min, max) {
    return Math.min(max, Math.max(min, val));
}

/** Simulates the sensor task that runs on Core 0 of the ESP32 */
function simulateSensors() {
    // ~70 % chance the finger is on the sensor
    fingerDetected = Math.random() < 0.7;

    if (fingerDetected) {
        // BPM: rolling average with ±3 bpm jitter around 72
        const target = 72 + (Math.random() - 0.5) * 6;
        beatAvg = beatAvg === 0
            ? target
            : +(beatAvg * 0.7 + target * 0.3).toFixed(1);

        // SpO2: smoothed around 97 %
        const rawSpo2 = clamp(97 + (Math.random() - 0.5) * 3, 70, 100);
        spo2Val = spo2Val === 0
            ? rawSpo2
            : +(spo2Val * 0.6 + rawSpo2 * 0.4).toFixed(1);

        // Temperature: readTemperature() - 2.2 offset, around 36.5 °C
        tempVal = +(36.5 + (Math.random() - 0.5) * 0.6 - 2.2 + 2.2).toFixed(1);
    } else {
        beatAvg = 0;
        spo2Val = 0;
        tempVal = 0;
    }

    // EMG and GSR update every second regardless (like the ESP32 loop)
    // EMG: analogRead → voltage → mV  (typical 200-800 mV)
    emgVal = +(400 + (Math.random() - 0.5) * 300).toFixed(0);

    // GSR: resistance in kΩ  (typical 1-10 kΩ)
    gsrVal = +(3.5 + (Math.random() - 0.5) * 2).toFixed(2);
}

// Update simulated values every 1 s (mirrors ESP32's lastSensorUpdate > 1000)
setInterval(simulateSensors, 1000);

// ─── Firebase push (mirrors uploadToFirebase()) ─────────────────────────────
async function uploadToFirebase() {
    if (!firebaseReady) return;

    const payload = {
        bpm: beatAvg,
        spo2: spo2Val,
        temp: tempVal,
        emg: emgVal,
        gsr: gsrVal,
        finger_detected: fingerDetected,
    };

    try {
        // setJSON → devices/device_01  (same path as ESP32)
        await set(ref(db, `devices/${DEVICE_ID}`), payload);
        console.log(`[Firebase] ✅ Pushed →  devices/${DEVICE_ID}`, payload);
    } catch (err) {
        console.error('[Firebase] ❌ Push failed:', err.message);
    }
}

// Push every 5 seconds (mirrors ESP32's lastFirebaseUpdate > 5000)
let pushTimer = null;

// ─── Express (QR page + status API) ─────────────────────────────────────────
const app = express();
app.use(cors());

app.get('/', async (_req, res) => {
    // QR code contains just the device ID — the scan-device page extracts it
    let qrDataUrl;
    try {
        qrDataUrl = await QRCode.toDataURL(DEVICE_ID, { width: 260, margin: 2 });
    } catch {
        return res.status(500).send('QR generation failed');
    }

    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>BioSentry IoT Device</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      font-family: 'Segoe UI', system-ui, sans-serif;
      color: #e2e8f0;
    }
    .card {
      background: rgba(255,255,255,0.05);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 24px;
      padding: 40px 36px;
      max-width: 380px; width: 90%;
      text-align: center;
      box-shadow: 0 24px 48px rgba(0,0,0,0.4);
    }
    .logo { font-size: 1rem; letter-spacing: 0.2em; text-transform: uppercase; color: #818cf8; font-weight: 600; margin-bottom: 6px; }
    h1 { font-size: 1.6rem; font-weight: 700; margin-bottom: 4px; }
    .device-id { font-size: 0.75rem; color: #64748b; margin-bottom: 28px; font-family: monospace; }
    .qr-wrapper { background: #fff; border-radius: 16px; padding: 16px; display: inline-block; margin-bottom: 24px; box-shadow: 0 0 0 4px rgba(129,140,248,0.25); }
    .qr-wrapper img { display: block; border-radius: 8px; }
    .instruction { font-size: 0.85rem; color: #94a3b8; margin-bottom: 20px; line-height: 1.5; }
    .status { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.06); border-radius: 99px; padding: 8px 18px; font-size: 0.85rem; font-weight: 600; border: 1px solid rgba(255,255,255,0.1); }
    .dot { width: 10px; height: 10px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 8px #22c55e; }
    .meta { margin-top: 24px; font-size: 0.72rem; color: #475569; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">BioSentry</div>
    <h1>IoT Device</h1>
    <div class="device-id">${DEVICE_ID}</div>
    <div class="qr-wrapper">
      <img src="${qrDataUrl}" alt="Device QR Code" width="228" height="228" />
    </div>
    <p class="instruction">
      Open the <strong>BioSentry PWA</strong> → Scan Device,<br/>
      point your camera at this QR code to pair.
    </p>
    <div class="status">
      <div class="dot"></div>
      <span>Broadcasting every 5 s</span>
    </div>
    <div class="meta">
      Sensor data pushes to <code>devices/${DEVICE_ID}</code> every 5 seconds.
    </div>
  </div>
</body>
</html>`);
});

app.get('/api/status', (_req, res) => {
    res.json({
        deviceId: DEVICE_ID,
        fingerDetected,
        sensors: { bpm: beatAvg, spo2: spo2Val, temp: tempVal, emg: emgVal, gsr: gsrVal },
        timestamp: Date.now(),
    });
});

// ─── Startup ────────────────────────────────────────────────────────────────
async function start() {
    console.log('[ESP32-Sim] 🚀  Starting BioSentry ESP32 Simulator...');
    console.log(`[ESP32-Sim] Device ID : ${DEVICE_ID}`);
    console.log(`[ESP32-Sim] RTDB path : devices/${DEVICE_ID}`);

    // Sign in (ESP32 uses anonymous sign-up; simulator uses email/password)
    try {
        await signInWithEmailAndPassword(
            firebaseAuth,
            process.env.IOT_USER_EMAIL,
            process.env.IOT_USER_PASSWORD,
        );
        console.log(`[Firebase] ✅ Signed in as ${process.env.IOT_USER_EMAIL}`);
        firebaseReady = true;

        // Start pushing immediately, then every 5 s
        uploadToFirebase();
        pushTimer = setInterval(uploadToFirebase, PUSH_INTERVAL);
    } catch (err) {
        console.warn(`[Firebase] ⚠️  Sign-in failed: ${err.message}`);
        console.warn('[Firebase] Running offline — Firebase push disabled.');
    }

    app.listen(PORT, () => {
        console.log(`\n[ESP32-Sim] ✅ Running at http://localhost:${PORT}`);
        console.log(`[ESP32-Sim] 📱 QR code page: http://localhost:${PORT}/`);
        console.log(`[ESP32-Sim] 🔄 Pushing to devices/${DEVICE_ID} every 5 s\n`);
    });
}

start();
