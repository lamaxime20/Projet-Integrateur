/*
 * ============================================================
 *  AGRICULTURE INTELLIGENTE — ESP32 (VERSION AVANCÉE)
 *  Token + Seuils MQTT + Gestion intelligente des instructions
 * ============================================================
 */

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <ESP32Servo.h>

// ============================================================
// WIFI
// ============================================================
const char* ssid     = "Avengers";
const char* password = "Lamine19yamal";

// ============================================================
// API TOKEN
// ============================================================
const char* apiUrl = "https://projet-integrateur-do3r.onrender.com/api/device/token";
String identifiant_user = "user_123";
String token = "";

// ============================================================
// MQTT
// ============================================================
const char* mqtt_server = "b1d946f5edb84d23ade6058bd316610b.s1.eu.hivemq.cloud";
const int   mqtt_port   = 8883;
const char* mqtt_user   = "agrico-tech";
const char* mqtt_pass   = "Max123456";

String device_id = "esp32_01";

#define TOPIC_SEUILS "agriculture/esp32_01/seuils"
#define TOPIC_DATA   "agriculture/esp32_01/data"
#define TOPIC_INSTR  "agriculture/esp32_01/instructions"
#define TOPIC_STATUS "agriculture/esp32_01/status"

// ============================================================
// PINS
// ============================================================
#define SOIL_PIN 36
#define LDR_PIN 39
#define CO2_PIN 34
#define WATER_PIN 2
#define DHT_PIN 4

#define POMPE_PIN 5
#define VENTIL_PIN 6
#define ECLAIRE_PIN 7
#define SERVO_PIN 18

// ============================================================
// OBJETS
// ============================================================
#define DHT_TYPE DHT22
DHT dht(DHT_PIN, DHT_TYPE);
Servo servoPorte;
WiFiClientSecure espClient;
PubSubClient client(espClient);

// ============================================================
// SEUILS
// ============================================================
struct Seuils {
  float lum_min = 20;
  float lum_max = 80;
  float hum_min = 30;
  float hum_max = 70;
  float temp_min = 18;
  float temp_max = 35;
  float co2_min = 20;
  float co2_max = 70;
};

Seuils seuils;

// ============================================================
// 🔥 GESTION DES INSTRUCTIONS
// ============================================================
struct InstructionState {
  bool actif;
  String id_instruction;
  String action;
  unsigned long endTime;
};

InstructionState pompeState  = {false,"","",0};
InstructionState lampeState  = {false,"","",0};
InstructionState ventilState = {false,"","",0};
InstructionState porteState  = {false,"","",0};

// ============================================================
// UTILS
// ============================================================
float readAverage(int pin) {
  long sum = 0;
  for (int i = 0; i < 5; i++) {
    sum += analogRead(pin);
    delay(5);
  }
  return sum / 5.0;
}

// ============================================================
// WIFI
// ============================================================
void setup_wifi() {
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
}

// ============================================================
// TOKEN
// ============================================================
void getToken() {
  HTTPClient http;
  http.begin(apiUrl);
  http.addHeader("Content-Type","application/json");

  StaticJsonDocument<200> doc;
  doc["identifiant_user"] = identifiant_user;

  String body;
  serializeJson(doc, body);

  int code = http.POST(body);

  if(code > 0){
    StaticJsonDocument<256> res;
    deserializeJson(res, http.getString());
    token = res["token"].as<String>();
  }
  http.end();
}

// ============================================================
// STATUS MQTT
// ============================================================
void publierStatutInstruction(String id, String status) {
  StaticJsonDocument<200> doc;
  doc["device_id"] = device_id;
  doc["id_instruction"] = id;
  doc["status"] = status;

  String payload;
  serializeJson(doc, payload);
  client.publish(TOPIC_STATUS, payload.c_str());
}

// ============================================================
// CALLBACK MQTT
// ============================================================
void callback(char* topic, byte* payload, unsigned int length) {

  String topicStr = String(topic);
  String message = "";

  for (int i=0;i<length;i++) message += (char)payload[i];

  // ===== SEUILS =====
  if (topicStr == TOPIC_SEUILS) {
    StaticJsonDocument<512> doc;
    if (!deserializeJson(doc, message)) {
      if (doc.containsKey("lum_min")) seuils.lum_min = doc["lum_min"];
      if (doc.containsKey("lum_max")) seuils.lum_max = doc["lum_max"];
      if (doc.containsKey("hum_min")) seuils.hum_min = doc["hum_min"];
      if (doc.containsKey("hum_max")) seuils.hum_max = doc["hum_max"];
      if (doc.containsKey("temp_min")) seuils.temp_min = doc["temp_min"];
      if (doc.containsKey("temp_max")) seuils.temp_max = doc["temp_max"];
      if (doc.containsKey("co2_min")) seuils.co2_min = doc["co2_min"];
      if (doc.containsKey("co2_max")) seuils.co2_max = doc["co2_max"];
    }
  }

  // ===== INSTRUCTIONS =====
  if (topicStr == TOPIC_INSTR) {

    StaticJsonDocument<256> doc;
    if (deserializeJson(doc, message)) return;

    String id = doc["id_instruction"];
    String action = doc["action"];
    String cible = doc["actionneur"];
    int duree = doc["duree"];

    // REDÉMARRAGE
    if (action == "redemarrer") {
      ESP.restart();
    }

    InstructionState* state = nullptr;

    if (cible == "pompe") state = &pompeState;
    else if (cible == "ampoule") state = &lampeState;
    else if (cible == "ventilateur") state = &ventilState;
    else if (cible == "porte") state = &porteState;

    if (state == nullptr) return;

    // INTERRUPTION
    if (state->actif) {
      publierStatutInstruction(state->id_instruction, "interrompue");
    }

    // NOUVELLE INSTRUCTION
    state->actif = true;
    state->id_instruction = id;
    state->action = action;
    state->endTime = millis() + (duree * 1000);
  }
}

// ============================================================
// MQTT
// ============================================================
void reconnect() {
  while (!client.connected()) {
    if (client.connect(device_id.c_str(), mqtt_user, mqtt_pass)) {
      client.subscribe(TOPIC_SEUILS);
      client.subscribe(TOPIC_INSTR);
    } else {
      delay(5000);
    }
  }
}

// ============================================================
// AUTO MODE (avec blocage si manuel actif)
// ============================================================
void appliquerActionneurs(float lum, float hum, float temp, float co2, int eau) {

  if (!lampeState.actif) {
    if (lum < seuils.lum_min) digitalWrite(ECLAIRE_PIN, HIGH);
    else if (lum > seuils.lum_max) digitalWrite(ECLAIRE_PIN, LOW);
  }

  if (!pompeState.actif) {
    if (eau == LOW) digitalWrite(POMPE_PIN, LOW);
    else if (hum < seuils.hum_min) digitalWrite(POMPE_PIN, HIGH);
    else if (hum > seuils.hum_max) digitalWrite(POMPE_PIN, LOW);
  }

  if (!ventilState.actif && !isnan(temp)) {
    if (temp < seuils.temp_min || temp > seuils.temp_max)
      digitalWrite(VENTIL_PIN, HIGH);
    else digitalWrite(VENTIL_PIN, LOW);
  }

  if (!porteState.actif) {
    if (co2 < seuils.co2_min) servoPorte.write(0);
    else if (co2 > seuils.co2_max) servoPorte.write(90);
  }
}

// ============================================================
// SETUP
// ============================================================
void setup() {

  Serial.begin(115200);

  pinMode(POMPE_PIN, OUTPUT);
  pinMode(VENTIL_PIN, OUTPUT);
  pinMode(ECLAIRE_PIN, OUTPUT);
  pinMode(WATER_PIN, INPUT);

  dht.begin();
  servoPorte.attach(SERVO_PIN);

  setup_wifi();
  espClient.setInsecure();
  getToken();

  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
}

// ============================================================
// LOOP
// ============================================================
void loop() {

  if (!client.connected()) reconnect();
  client.loop();

  float hum_sol = map(readAverage(SOIL_PIN),4095,0,0,100);
  float temp = dht.readTemperature();
  float lum = map(readAverage(LDR_PIN),0,4095,0,100);
  float co2 = map(readAverage(CO2_PIN),0,4095,0,100);
  int eau = digitalRead(WATER_PIN);

  appliquerActionneurs(lum, hum_sol, temp, co2, eau);

  unsigned long now = millis();

  // ===== EXECUTION MANUELLE =====
  if (pompeState.actif) {
    digitalWrite(POMPE_PIN, pompeState.action == "allumer");
    if (now >= pompeState.endTime) {
      publierStatutInstruction(pompeState.id_instruction,"terminee");
      pompeState.actif = false;
    }
  }

  if (lampeState.actif) {
    digitalWrite(ECLAIRE_PIN, lampeState.action == "allumer");
    if (now >= lampeState.endTime) {
      publierStatutInstruction(lampeState.id_instruction,"terminee");
      lampeState.actif = false;
    }
  }

  if (ventilState.actif) {
    digitalWrite(VENTIL_PIN, ventilState.action == "allumer");
    if (now >= ventilState.endTime) {
      publierStatutInstruction(ventilState.id_instruction,"terminee");
      ventilState.actif = false;
    }
  }

  if (porteState.actif) {
    servoPorte.write(pompeState.action == "allumer" ? 90 : 0);
    if (now >= porteState.endTime) {
      publierStatutInstruction(porteState.id_instruction,"terminee");
      porteState.actif = false;
    }
  }
}