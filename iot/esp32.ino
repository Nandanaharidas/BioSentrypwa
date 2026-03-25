#include <WiFi.h>
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
    
    //if (Firebase.RTDB.setJSON(&fbdo, "Patients/Patient_01", &json)) {
    if (Firebase.RTDB.setJSON(&fbdo, "devices/device_01", &json)) {
      Serial.println("Firebase Update Success");
    } else {
      Serial.println("Firebase Error");
    }
  }
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


  xTaskCreatePinnedToCore(sensorTaskCode, "SensorTask", 10000, NULL, 1, &SensorTask, 0); 
}

void loop() {
  
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
