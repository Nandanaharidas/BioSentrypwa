#include <WiFi.h>
#include <WebServer.h>
#include <Wire.h>
#include "MAX30105.h"
#include "heartRate.h"
#include <Firebase_ESP_Client.h>
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

const char* ssid = "Medi";
const char* password = "12345678";
#define API_KEY "AIzaSyBRmISgUpEIY_ZBit3Mb753GbXw0QpumLs"
#define DATABASE_URL "https://esp32-health-monitor-9cea4-default-rtdb.asia-southeast1.firebasedatabase.app"

WebServer server(80);
MAX30105 particleSensor;
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;
bool signupOK = false;

#define EMG_PIN 34
#define GSR_PIN 35
#define ADC_MAX 4095.0
#define VREF 3.3

volatile float bpm = 0;
volatile float beatAvg = 0;
volatile float spo2Val = 0;
volatile float emgVal = 0;
volatile float gsrVal = 0;
volatile float tempVal = 0;
volatile bool fingerDetected = false;

unsigned long lastSensorUpdate = 0;
unsigned long lastFirebaseUpdate = 0;
TaskHandle_t SensorTask;

void sensorTaskCode(void * pvParameters) {
  long lastBeat = 0;
  
  uint32_t irMin = 999999, irMax = 0;
  uint32_t redMin = 999999, redMax = 0;
  unsigned long lastSpO2Calc = 0;

  for(;;) {
    particleSensor.check(); 
    
    while (particleSensor.available()) {
      long irValue = particleSensor.getFIFOIR();
      long redValue = particleSensor.getFIFORed();
      particleSensor.nextSample(); 

      if (irValue > 50000) { 
        fingerDetected = true;

        if (irValue < irMin) irMin = irValue;
        if (irValue > irMax) irMax = irValue;
        if (redValue < redMin) redMin = redValue;
        if (redValue > redMax) redMax = redValue;

        if (checkForBeat(irValue)) {
          long delta = millis() - lastBeat;
          lastBeat = millis();
          
          float currentBpm = 60 / (delta / 1000.0);
          if (currentBpm > 20 && currentBpm < 255) {
            beatAvg = (beatAvg * 0.7) + (currentBpm * 0.3); // Smooth rolling average
          }

          if (millis() - lastSpO2Calc > 500) {
            float irAC = irMax - irMin;
            float irDC = (irMax + irMin) / 2.0;
            float redAC = redMax - redMin;
            float redDC = (redMax + redMin) / 2.0;

            if (irAC > 0 && redAC > 0 && irDC > 0 && redDC > 0) {
              float ratio = (redAC / redDC) / (irAC / irDC);
              float estimatedSpO2 = 104.0 - (17.0 * ratio); 
              
              if (estimatedSpO2 > 100.0) estimatedSpO2 = 100.0;
              if (estimatedSpO2 < 70.0) estimatedSpO2 = 70.0;
              
              if (spo2Val == 0) spo2Val = estimatedSpO2;
              else spo2Val = (spo2Val * 0.6) + (estimatedSpO2 * 0.4);
            }
            irMin = 999999; irMax = 0;
            redMin = 999999; redMax = 0;
            lastSpO2Calc = millis();
          }
        }
      } else {
        fingerDetected = false;
        bpm = 0;
        beatAvg = 0;
        spo2Val = 0;
      }
    }
    vTaskDelay(2 / portTICK_PERIOD_MS); 
  }
}

float readEMG() {
  int raw = analogRead(EMG_PIN);
  return ((raw / ADC_MAX) * VREF) * 1000.0; 
}

float readGSR() {
  int raw = analogRead(GSR_PIN);
  if (raw < 10) return -1;
  float voltage = (raw / ADC_MAX) * VREF;
  return ((VREF - voltage) * 10000 / voltage) / 1000.0;
}

float getTemp() {
  float rawTemp = particleSensor.readTemperature();
  return rawTemp - 2.2; 
}

// --- FIREBASE ---
void uploadToFirebase() {
  if (Firebase.ready() && signupOK) {
    FirebaseJson json;
    json.set("bpm", beatAvg);
    json.set("spo2", spo2Val);
    json.set("temp", tempVal);
    json.set("emg", emgVal);
    json.set("gsr", gsrVal);
    json.set("finger_detected", fingerDetected);
    
    if (Firebase.RTDB.setJSON(&fbdo, "Patients/Patient_01", &json)) {
      Serial.println("Firebase Update Success");
    } else {
      Serial.println("Firebase Error");
    }
  }
}

void handleData() {
  String json = "{";
  json += "\"emg\":" + String(emgVal) + ",";
  json += "\"gsr\":" + String(gsrVal) + ",";
  json += "\"bpm\":" + String(beatAvg) + ",";
  json += "\"spo2\":" + String(spo2Val) + ",";
  json += "\"temp\":" + String(tempVal) + ",";
  // Send finger data as boolean
  json += "\"finger\":" + String(fingerDetected ? "true" : "false");
  json += "}";
  server.send(200, "application/json", json);
}

void handleRoot() {
  String html = R"rawliteral(
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>ESP32 Medical Monitor</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
      :root { --bg: #0f172a; --card-bg: #1e293b; --text-main: #f8fafc; --text-muted: #94a3b8; --accent-red: #ef4444; --accent-blue: #3b82f6; --accent-green: #10b981; --accent-cyan: #06b6d4; --accent-purple: #8b5cf6; --accent-yellow: #f59e0b; }
      body { font-family: sans-serif; background: var(--bg); color: var(--text-main); padding: 20px; margin: 0; }
      .container { max-width: 1200px; margin: 0 auto; }
      .header { text-align: center; margin-bottom: 30px; }
      .header h1 { margin: 0; font-weight: 600; color: #10b981;}
      .status-badge { display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 0.9rem; margin-top: 10px; font-weight: bold; transition: all 0.3s ease; }
      .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; }
      .card { background: var(--card-bg); padding: 20px; border-radius: 16px; text-align: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); }
      .icon { font-size: 2rem; margin-bottom: 10px; } .value { font-size: 2rem; font-weight: 700; margin: 5px 0; }
      .unit { font-size: 0.9rem; color: var(--text-muted); } .label { color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase; font-weight: 600; }
      .chart-container { background: var(--card-bg); padding: 20px; border-radius: 16px; height: 250px; }
      .c-red { color: var(--accent-red); } .c-cyan { color: var(--accent-cyan); } .c-blue { color: var(--accent-blue); } .c-green { color: var(--accent-green); } .c-purple { color: var(--accent-purple); }
      .beating { animation: heartbeat 0.8s infinite cubic-bezier(0.215, 0.61, 0.355, 1); }
      @keyframes heartbeat { 0% { transform: scale(0.95); } 5% { transform: scale(1.1); } 39% { transform: scale(0.85); } 45% { transform: scale(1); } 60% { transform: scale(0.95); } 100% { transform: scale(0.95); } }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header"><h1><i class="fa-solid fa-microchip"></i> Local Device Monitor</h1><div class="status-badge" id="finger-status" style="background:rgba(239,68,68,0.2); color:#ef4444;"><i class="fa-solid fa-hand-pointer"></i> Waiting for patient...</div></div>
      <div class="grid">
        <div class="card"><i class="fa-solid fa-heart icon c-red" id="heart-icon"></i><div class="label">Heart Rate</div><div class="value"><span id="bpm">--</span> <span class="unit">BPM</span></div></div>
        <div class="card"><i class="fa-solid fa-lungs icon c-cyan"></i><div class="label">Blood Oxygen</div><div class="value"><span id="spo2">--</span> <span class="unit">% SpO2</span></div></div>
        <div class="card"><i class="fa-solid fa-temperature-half icon c-blue"></i><div class="label">Temperature</div><div class="value"><span id="temp">--</span> <span class="unit">°C</span></div></div>
        <div class="card"><i class="fa-solid fa-wave-square icon c-purple"></i><div class="label">EMG</div><div class="value"><span id="emg">--</span> <span class="unit">mV</span></div></div>
        <div class="card"><i class="fa-solid fa-droplet icon c-green"></i><div class="label">GSR</div><div class="value"><span id="gsr">--</span> <span class="unit">kΩ</span></div></div>
      </div>
      <div class="chart-container"><canvas id="ecgChart"></canvas></div>
    </div>
    <script>
      const ctx = document.getElementById('ecgChart').getContext('2d');
      let ecgData = Array(150).fill(0); 
      let currentBpm = 0, isFingerOn = false, waveTick = 0;
      
      const vitalsChart = new Chart(ctx, { 
        type: 'line', 
        data: { labels: Array(150).fill(''), datasets: [{ data: ecgData, borderColor: '#22c55e', borderWidth: 2.5, pointRadius: 0, tension: 0.2 }] }, 
        options: { responsive: true, maintainAspectRatio: false, animation: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false, min: -1.5, max: 2.5 } } } 
      });

      setInterval(() => {
        let nextPoint = 0;
        if (isFingerOn && currentBpm > 20) {
          let ticksPerBeat = (60 / currentBpm) * 50; 
          waveTick++; 
          let phase = waveTick % ticksPerBeat;
          if (phase < 2) nextPoint = 0.5; 
          else if (phase < 4) nextPoint = -0.5; 
          else if (phase < 6) nextPoint = 2.0; 
          else if (phase < 8) nextPoint = -0.8; 
          else if (phase < 15) nextPoint = 0; 
          else if (phase < 20) nextPoint = 0.3; 
          else nextPoint = 0;
          nextPoint += (Math.random() * 0.04 - 0.02);
        } else { 
          nextPoint = (Math.random() * 0.02 - 0.01); 
          waveTick = 0; 
        }
        ecgData.push(nextPoint); 
        ecgData.shift(); 
        vitalsChart.update();
      }, 20);

      setInterval(() => {
        fetch('/data').then(res => res.json()).then(data => {
          document.getElementById('emg').innerText = data.emg.toFixed(1);
          document.getElementById('gsr').innerText = data.gsr > 0 ? data.gsr.toFixed(1) : '--';
          document.getElementById('temp').innerText = 
          data.temp > 0 ? data.temp.toFixed(1) : '--';
          currentBpm = data.bpm; 
          // FIX: Parses the boolean correctly from JSON!
          isFingerOn = data.finger;
          
          const fingerStatus = document.getElementById('finger-status'); 
          const heartIcon = document.getElementById('heart-icon');
          
          if (isFingerOn) {

            document.getElementById('bpm').innerText = 
                currentBpm > 0 ? data.bpm.toFixed(0) : '...';

            document.getElementById('spo2').innerText = 
                data.spo2 > 0 ? data.spo2.toFixed(0) : '...';

            if (currentBpm > 20) {
                heartIcon.classList.add('beating');
                heartIcon.style.animationDuration = (60 / currentBpm) + 's';
            } else {
                heartIcon.classList.remove('beating');
            }

            fingerStatus.innerHTML = '<i class="fa-solid fa-check-circle"></i> Sensor Active';
            fingerStatus.style.background = 'rgba(16, 185, 129, 0.2)';
            fingerStatus.style.color = '#10b981';
          } else {
            // Finger removed
            document.getElementById('bpm').innerText = '--'; 
            document.getElementById('spo2').innerText = '--';
            document.getElementById('temp').innerText = '--';
            heartIcon.classList.remove('beating'); 
            
            fingerStatus.innerHTML = '<i class="fa-solid fa-hand-pointer"></i> Place finger gently on sensor'; 
            fingerStatus.style.background = 'rgba(239, 68, 68, 0.2)'; 
            fingerStatus.style.color = '#ef4444';
          }
        }).catch(err => console.error(err));
      }, 500); 
    </script>
  </body>
  </html>
  )rawliteral";
  server.send(200, "text/html", html);
}

void setup() {
  Serial.begin(115200);

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.println("\nConnected! Local IP: " + WiFi.localIP().toString());

  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  if (Firebase.signUp(&config, &auth, "", "")) {
    Serial.println("Firebase Auth Success");
    signupOK = true;
  }
  config.token_status_callback = tokenStatusCallback;
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  Wire.begin();
  if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) {
    Serial.println("MAX30102 not found. Check wiring.");
    while (1);
  }
  
  particleSensor.setup((byte)0x3F, (byte)4, (byte)2, 400, 411, 4096); 

  server.on("/", handleRoot);
  server.on("/data", handleData);
  server.begin();

  xTaskCreatePinnedToCore(sensorTaskCode, "SensorTask", 10000, NULL, 1, &SensorTask, 0); 
}

void loop() {
  server.handleClient();
  
  if (millis() - lastSensorUpdate > 1000) {
    lastSensorUpdate = millis();
    emgVal = readEMG();
    gsrVal = readGSR();
    if (fingerDetected) {
      tempVal = getTemp();
    } else {
      tempVal = 0;
    }
  }

  if (millis() - lastFirebaseUpdate > 5000) {
    lastFirebaseUpdate = millis();
    uploadToFirebase();
  }
}
