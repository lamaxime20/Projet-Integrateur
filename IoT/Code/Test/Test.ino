#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// ===== WIFI =====
const char* ssid = "TON_WIFI";
const char* password = "TON_PASSWORD";

// ===== API =====
const char* apiUrl = "https://projet-integrateur-do3r.onrender.com/api/device/token";
String identifiant_user = "user_123";

// ===== MQTT (HiveMQ Cloud) =====
const char* mqtt_server = "b1d946f5edb84d23ade6058bd316610b.s1.eu.hivemq.cloud";
const int mqtt_port = 8883;

const char* mqtt_user = "TON_USERNAME_HIVEMQ";
const char* mqtt_pass = "TON_PASSWORD_HIVEMQ";

WiFiClientSecure espClient;
PubSubClient client(espClient);

// ===== DEVICE =====
String device_id = "esp32_01";
String token = "";
String messageToSend = "Message par défaut";

// ===== TIMER =====
unsigned long lastMsg = 0;
const long interval = 120000; // 2 minutes

// ===== WIFI =====
void setup_wifi() {
  delay(10);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
}

// ===== GET TOKEN =====
void getToken() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;

    http.begin(apiUrl);
    http.addHeader("Content-Type", "application/json");
    http.setTimeout(10000);

    StaticJsonDocument<200> doc;
    doc["identifiant_user"] = identifiant_user;

    String requestBody;
    serializeJson(doc, requestBody);

    int httpResponseCode = http.POST(requestBody);

    if (httpResponseCode > 0) {
      String response = http.getString();

      StaticJsonDocument<200> responseDoc;
      deserializeJson(responseDoc, response);

      token = responseDoc["token"].as<String>();
      Serial.println("Token reçu: " + token);
    } else {
      Serial.println("Erreur HTTP");
    }

    http.end();
  }
}

// ===== MQTT CALLBACK =====
void callback(char* topic, byte* payload, unsigned int length) {
  String message = "";

  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }

  Serial.println("Message reçu: " + message);

  // Mise à jour du message envoyé
  messageToSend = message;
}

// ===== MQTT CONNECT =====
void reconnect() {
  while (!client.connected()) {
    Serial.println("Connexion MQTT...");

    if (client.connect(device_id.c_str(), mqtt_user, mqtt_pass)) {
      Serial.println("MQTT connecté");

      // Subscribe aux instructions
      String topic = "agriculture/" + device_id + "/instructions";
      client.subscribe(topic.c_str());

    } else {
      Serial.print("Erreur MQTT: ");
      Serial.println(client.state());
      delay(5000);
    }
  }
}

// ===== SETUP =====
void setup() {
  Serial.begin(115200);

  setup_wifi();

  // 🔐 TLS (obligatoire pour HiveMQ Cloud)
  espClient.setInsecure(); // mode test (pas de certificat)

  getToken(); // récupération token (utile pour ton système futur)

  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
}

// ===== LOOP =====
void loop() {
  if (!client.connected()) {
    reconnect();
  }

  client.loop();

  unsigned long now = millis();

  if (now - lastMsg > interval) {
    lastMsg = now;

    String topic = "agriculture/" + device_id + "/data";

    StaticJsonDocument<200> doc;
    doc["message"] = messageToSend;
    doc["timestamp"] = millis();

    String payload;
    serializeJson(doc, payload);

    client.publish(topic.c_str(), payload.c_str());

    Serial.println("Message envoyé: " + payload);
  }
}