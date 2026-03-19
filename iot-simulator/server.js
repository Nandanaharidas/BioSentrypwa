require('dotenv').config();
const express = require('express');
const cors = require('cors');
const QRCode = require('qrcode');

// Firebase client SDK (same pattern as ESP32 FirebaseClient library)
const { initializeApp } = require('firebase/app');
const {
    getAuth,
    signInWithEmailAndPassword,
} = require('firebase/auth');
const {
    getDatabase,
    ref,
    set,
    push,
    onValue,
} = require('firebase/database');

// ─── Config ────────────────────────────────────────────────────────────────
const DEVICE_ID    = process.env.DEVICE_ID        || 'biosentry-device-002';
const PWA_URL      = process.env.PWA_URL           || 'http://localhost:5173';
const PORT         = 3001;
const PUSH_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes

const firebaseConfig = {
    apiKey:      process.env.FIREBASE_API_KEY,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    // reuse existing project details from the PWA
    authDomain:  'biosentry-3dabf.firebaseapp.com',
    projectId:   'biosentry-3dabf',
};

// ─── State ──────────────────────────────────────────────────────────────────
let pairedUID     = null;
let pushInterval  = null;
let metrics = {
    temp:             36.5,
    pressure:         120,
    o2:               98,
    skin_conductance: 0.4,
};

// ─── Firebase init ──────────────────────────────────────────────────────────
const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);
const db = getDatabase(firebaseApp);

// ─── Sensor simulation ──────────────────────────────────────────────────────
function jitter() {
    metrics.temp             = +(metrics.temp + (Math.random() - 0.5) * 0.2).toFixed(2);
    metrics.pressure         = Math.round(metrics.pressure + (Math.random() - 0.5) * 2);
    metrics.o2               = Math.min(100, Math.max(90, Math.round(metrics.o2 + (Math.random() - 0.5))));
    metrics.skin_conductance = +(metrics.skin_conductance + (Math.random() - 0.5) * 0.05).toFixed(2);
}

// Update simulated values every second (local only, not pushed yet)
setInterval(jitter, 1000);

// ─── Firebase push ───────────────────────────────────────────────────────────
async function pushSensorData() {
    if (!pairedUID) return;

    const readingRef = ref(db, `users/${pairedUID}/devices/${DEVICE_ID}/readings`);
    const payload = {
        ...metrics,
        deviceId:  DEVICE_ID,
        timestamp: Date.now(),
    };

    try {
        await push(readingRef, payload);
        // Also keep a "latest" snapshot for quick reads
        await set(ref(db, `users/${pairedUID}/devices/${DEVICE_ID}/latest`), payload);
        console.log(`[Firebase] ✅ Pushed sensor data for uid=${pairedUID}`, payload);
    } catch (err) {
        console.error('[Firebase] ❌ Push failed:', err.message);
    }
}

// ─── Pairing listener ────────────────────────────────────────────────────────
function startPairingListener() {
    const pairingRef = ref(db, `pairedDevices/${DEVICE_ID}`);

    onValue(pairingRef, (snapshot) => {
        const data = snapshot.val();
        if (!data || !data.uid) return;

        if (data.uid !== pairedUID) {
            pairedUID = data.uid;
            console.log(`[Pairing] ✅ Device paired to uid=${pairedUID} (${data.email})`);

            // Clear any existing interval and start fresh
            if (pushInterval) clearInterval(pushInterval);

            // Push immediately on pairing, then every 2 minutes
            pushSensorData();
            pushInterval = setInterval(pushSensorData, PUSH_INTERVAL_MS);
        }
    });
}

// ─── Express app ────────────────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

// Basic Auth middleware (for /metrics backward compat)
const AUTH_USERNAME = 'admin';
const AUTH_PASSWORD = 'biosentry123';
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.setHeader('WWW-Authenticate', 'Basic realm="BioSentry IoT"');
        return res.status(401).json({ error: 'Authentication required' });
    }
    const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    if (auth[0] === AUTH_USERNAME && auth[1] === AUTH_PASSWORD) {
        next();
    } else {
        res.setHeader('WWW-Authenticate', 'Basic realm="BioSentry IoT"');
        return res.status(401).json({ error: 'Invalid credentials' });
    }
};

// ─── Routes ─────────────────────────────────────────────────────────────────

// QR Code pairing page (shown on the IoT device screen / browser)
app.get('/', async (req, res) => {
    const pairingUrl = `${PWA_URL}/pair-device?deviceId=${DEVICE_ID}`;
    let qrDataUrl;
    console.log(pairingUrl)
    try {
        qrDataUrl = await QRCode.toDataURL(pairingUrl, { width: 260, margin: 2 });
    } catch (err) {
        return res.status(500).send('QR generation failed');
    }

    const statusColor = pairedUID ? '#22c55e' : '#f59e0b';
    const statusText  = pairedUID ? `Paired ✅` : 'Waiting for pairing…';

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
      max-width: 380px;
      width: 90%;
      text-align: center;
      box-shadow: 0 24px 48px rgba(0,0,0,0.4);
    }
    .logo {
      font-size: 1rem;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: #818cf8;
      font-weight: 600;
      margin-bottom: 6px;
    }
    h1 { font-size: 1.6rem; font-weight: 700; margin-bottom: 4px; }
    .device-id {
      font-size: 0.75rem;
      color: #64748b;
      margin-bottom: 28px;
      font-family: monospace;
    }
    .qr-wrapper {
      background: #fff;
      border-radius: 16px;
      padding: 16px;
      display: inline-block;
      margin-bottom: 24px;
      box-shadow: 0 0 0 4px rgba(129,140,248,0.25);
    }
    .qr-wrapper img { display: block; border-radius: 8px; }
    .instruction {
      font-size: 0.85rem;
      color: #94a3b8;
      margin-bottom: 20px;
      line-height: 1.5;
    }
    .status {
      display: inline-flex; align-items: center; gap: 8px;
      background: rgba(255,255,255,0.06);
      border-radius: 99px;
      padding: 8px 18px;
      font-size: 0.85rem;
      font-weight: 600;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .dot {
      width: 10px; height: 10px; border-radius: 50%;
      background: ${statusColor};
      box-shadow: 0 0 8px ${statusColor};
    }
    .meta {
      margin-top: 24px;
      font-size: 0.72rem;
      color: #475569;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">BioSentry</div>
    <h1>IoT Device</h1>
    <div class="device-id">${DEVICE_ID}</div>

    <div class="qr-wrapper">
      <img src="${qrDataUrl}" alt="Pairing QR Code" width="228" height="228" />
    </div>

    <p class="instruction">
      Open the <strong>BioSentry PWA</strong> on your phone,<br/>
      then scan this QR code to register this device.
    </p>

    <div class="status">
      <div class="dot"></div>
      <span>${statusText}</span>
    </div>

    <div class="meta">
      Sensor data pushes to Firebase every 2 minutes after pairing.<br/>
      Refresh this page to check pairing status.
    </div>
  </div>
</body>
</html>`);
});

// Device status API
app.get('/api/status', (req, res) => {
    res.json({
        deviceId: DEVICE_ID,
        paired:   !!pairedUID,
        pairedTo: pairedUID || null,
        sensors:  { ...metrics, timestamp: Date.now() },
    });
});

// Legacy metrics endpoint (backward compat)
app.get('/metrics', authenticate, (req, res) => {
    console.log('[IoT-Simulator] Serving metrics to authenticated user:', metrics);
    res.json({ ...metrics, timestamp: Date.now() });
});

// ─── Startup ─────────────────────────────────────────────────────────────────
async function start() {
    console.log('[IoT-Simulator] 🚀 Starting BioSentry IoT Simulator...');
    console.log(`[IoT-Simulator] Device ID: ${DEVICE_ID}`);

    // Sign into Firebase (like ESP32 FirebaseClient with email/password)
    try {
        await signInWithEmailAndPassword(
            firebaseAuth,
            process.env.IOT_USER_EMAIL,
            process.env.IOT_USER_PASSWORD
        );
        console.log(`[Firebase] ✅ Signed in as ${process.env.IOT_USER_EMAIL}`);
        startPairingListener();
    } catch (err) {
        console.warn(`[Firebase] ⚠️  Could not sign in: ${err.message}`);
        console.warn('[Firebase] Running in offline mode — Firebase push disabled.');
        console.warn('[Firebase] Create a .env file from .env.example to enable Firebase.');
    }

    app.listen(PORT, () => {
        console.log(`\n[IoT-Simulator] ✅ Running at http://localhost:${PORT}`);
        console.log(`[IoT-Simulator] 📱 Scan the QR code page at http://localhost:${PORT}/`);
        console.log(`[IoT-Simulator] 🔄 Will push sensor data every 2 minutes after pairing\n`);
    });
}

start();
