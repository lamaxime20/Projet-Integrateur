/*
 * ============================================================
 *  AGRICULTURE INTELLIGENTE — ESP32
 *  Version 1 : Token + Seuils via MQTT + Contrôle actionneurs
 * ============================================================
 *
 *  Capteurs utilisés :
 *    - YL-69      : Humidité du sol        (A0 → GPIO 36)
 *    - DHT22      : Température & hum. air (GPIO 4)
 *    - LDR        : Luminosité             (A1 → GPIO 39)
 *    - SEN0159    : CO2                    (A2 → GPIO 34)
 *    - Niveau eau : Flotteur digital       (GPIO 2)
 *
 *  Actionneurs :
 *    - Pompe       : GPIO 5
 *    - Ventilateur : GPIO 6
 *    - Éclairage   : GPIO 7
 *    - Servomoteur : GPIO 18  (porte CO2)
 *
 *  Communication :
 *    - HTTP  : Récupération du token au démarrage
 *    - MQTT  : Abonnement aux seuils + publication des données
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
//  PARAMÈTRES WIFI
// ============================================================
const char* ssid     = "Avengers";
const char* password = "Lamine19yamal";

// ============================================================
//  PARAMÈTRES API (token)
// ============================================================
const char* apiUrl         = "https://projet-integrateur-do3r.onrender.com/api/device/token";
String      identifiant_user = "user_123";
String      token            = "";

// ============================================================
//  PARAMÈTRES MQTT (HiveMQ Cloud)
// ============================================================
const char* mqtt_server = "b1d946f5edb84d23ade6058bd316610b.s1.eu.hivemq.cloud";
const int   mqtt_port   = 8883;
const char* mqtt_user   = "agrico-tech";
const char* mqtt_pass   = "Max123456";

String device_id = "esp32_01";

// Topics MQTT
// → Le backend publie les seuils ici
#define TOPIC_SEUILS   "agriculture/esp32_01/seuils"
// → L'ESP32 publie ses mesures ici
#define TOPIC_DATA     "agriculture/esp32_01/data"
// → Topic générique d'instructions (déjà présent dans Test.ino)
#define TOPIC_INSTR    "agriculture/esp32_01/instructions"

// ============================================================
//  PINS CAPTEURS
// ============================================================
#define SOIL_PIN    36   // YL-69     (analogique)
#define LDR_PIN     39   // LDR       (analogique)
#define CO2_PIN     34   // SEN0159   (analogique)
#define WATER_PIN    2   // Flotteur  (digital)
#define DHT_PIN      4   // DHT22     (digital)

// ============================================================
//  PINS ACTIONNEURS
// ============================================================
#define POMPE_PIN    5
#define VENTIL_PIN   6
#define ECLAIRE_PIN  7
#define SERVO_PIN   18   // Servomoteur porte CO2

// ============================================================
//  OBJETS
// ============================================================
#define DHT_TYPE DHT22
DHT          dht(DHT_PIN, DHT_TYPE);
Servo        servoPorte;
WiFiClientSecure espClient;
PubSubClient     client(espClient);

// ============================================================
//  SEUILS — VALEURS PAR DÉFAUT
//  (seront mis à jour dès réception depuis le broker MQTT)
// ============================================================
struct Seuils {
  // Luminosité (%)
  float lum_min  = 20.0;
  float lum_max  = 80.0;

  // Humidité du sol (%)
  float hum_min  = 30.0;
  float hum_max  = 70.0;

  // Température (°C)
  float temp_min = 18.0;
  float temp_max = 35.0;

  // CO2 (valeur relative 0-100, adaptez à votre capteur)
  float co2_min  = 20.0;
  float co2_max  = 70.0;

  // Niveau d'eau : digital (1 = OK, 0 = bas) — pas de min/max
  // Le seuil min est implicitement : niveau_eau == LOW → pompe OFF
};

Seuils seuils;   // instance globale des seuils

// ============================================================
//  DERNIÈRES VALEURS PUBLIÉES (pour détection de variation)
//  Initialisées à des valeurs invalides pour forcer la première publication.
// ============================================================
float last_published_luminosite   = -1.0;
float last_published_humidite_sol = -1.0;
float last_published_temperature  = -1.0;
float last_published_co2          = -1.0;
int   last_published_niveau_eau   = -1;

// Gestion du temps (non-bloquant)
unsigned long lastSensorRead = 0;
const long sensorInterval = 1000; // 1 seconde

// ============================================================
//  WIFI
// ============================================================
void setup_wifi() {
  delay(10);
  Serial.print("Connexion au WiFi : ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connecté !");
  Serial.print("IP locale : ");
  Serial.println(WiFi.localIP());
}

// ============================================================
//  RÉCUPÉRATION DU TOKEN (HTTP POST)
// ============================================================
void getToken() {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin(apiUrl);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(10000);

  StaticJsonDocument<200> reqDoc;
  reqDoc["identifiant_user"] = identifiant_user;
  String requestBody;
  serializeJson(reqDoc, requestBody);

  Serial.println("Récupération du token...");
  int httpCode = http.POST(requestBody);

  if (httpCode > 0) {
    String response = http.getString();
    Serial.println("Réponse API : " + response);

    StaticJsonDocument<256> resDoc;
    DeserializationError err = deserializeJson(resDoc, response);

    if (!err && resDoc.containsKey("token")) {
      token = resDoc["token"].as<String>();
      Serial.println("✅ Token reçu : " + token);
    } else {
      Serial.println("⚠️  Impossible de parser le token.");
    }
  } else {
    Serial.print("❌ Erreur HTTP : ");
    Serial.println(httpCode);
  }

  http.end();
}

// ============================================================
//  FONCTION DE FILTRAGE (Moyenne sur 5 lectures)
// ============================================================
float readAverage(int pin) {
  long sum = 0;
  const int numReadings = 5;
  for (int i = 0; i < numReadings; i++) {
    sum += analogRead(pin);
    delay(5); // Petite pause pour la stabilisation de l'ADC
  }
  return (float)sum / numReadings;
}

// ============================================================
//  FONCTION DE DÉTECTION DE VARIATION
// ============================================================
// Retourne true si la nouvelle valeur a une variation >= threshold % par rapport à la dernière valeur.
// Gère les cas de première lecture et de division par zéro.
bool hasSignificantVariation(float newValue, float lastValue, float threshold) {
  // Pour la toute première lecture, ou si lastValue était initialisé à un état invalide, on considère qu'il y a variation.
  if (lastValue == -1.0) {
    return true;
  }

  // Si les deux valeurs sont zéro, il n'y a pas de variation significative.
  if (newValue == 0.0 && lastValue == 0.0) {
    return false;
  }

  // Si la dernière valeur était zéro et la nouvelle ne l'est pas, c'est un changement significatif.
  if (lastValue == 0.0 && newValue != 0.0) {
    return true;
  }

  float variation = abs((newValue - lastValue) / lastValue) * 100.0;
  return variation >= threshold;
}

// ============================================================
//  CALLBACK MQTT — Réception des seuils depuis le broker
// ============================================================
void callback(char* topic, byte* payload, unsigned int length) {
  String topicStr  = String(topic);
  String message   = "";
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }

  Serial.println("\n📨 Message MQTT reçu :");
  Serial.println("   Topic   : " + topicStr);
  Serial.println("   Payload : " + message);

  // ——— Mise à jour des seuils ———
  if (topicStr == TOPIC_SEUILS) {
    StaticJsonDocument<512> doc;
    DeserializationError err = deserializeJson(doc, message);

    if (err) {
      Serial.println("❌ Erreur parsing JSON seuils : " + String(err.c_str()));
      return;
    }

    // On met à jour uniquement les champs présents dans le message
    if (doc.containsKey("lum_min"))  seuils.lum_min  = doc["lum_min"].as<float>();
    if (doc.containsKey("lum_max"))  seuils.lum_max  = doc["lum_max"].as<float>();
    if (doc.containsKey("hum_min"))  seuils.hum_min  = doc["hum_min"].as<float>();
    if (doc.containsKey("hum_max"))  seuils.hum_max  = doc["hum_max"].as<float>();
    if (doc.containsKey("temp_min")) seuils.temp_min = doc["temp_min"].as<float>();
    if (doc.containsKey("temp_max")) seuils.temp_max = doc["temp_max"].as<float>();
    if (doc.containsKey("co2_min"))  seuils.co2_min  = doc["co2_min"].as<float>();
    if (doc.containsKey("co2_max"))  seuils.co2_max  = doc["co2_max"].as<float>();

    Serial.println("✅ Seuils mis à jour :");
    Serial.printf("   Luminosité  : [%.1f - %.1f]\n", seuils.lum_min,  seuils.lum_max);
    Serial.printf("   Humidité sol: [%.1f - %.1f]\n", seuils.hum_min,  seuils.hum_max);
    Serial.printf("   Température : [%.1f - %.1f]\n", seuils.temp_min, seuils.temp_max);
    Serial.printf("   CO2         : [%.1f - %.1f]\n", seuils.co2_min,  seuils.co2_max);
  }
}

// ============================================================
//  RECONNEXION MQTT
// ============================================================
void reconnect() {
  while (!client.connected()) {
    Serial.println("🔄 Connexion MQTT...");

    if (client.connect(device_id.c_str(), mqtt_user, mqtt_pass)) {
      Serial.println("✅ MQTT connecté !");

      // Abonnement aux seuils (priorité absolue)
      client.subscribe(TOPIC_SEUILS);
      Serial.println("📡 Abonné au topic : " + String(TOPIC_SEUILS));

      // Abonnement aux instructions génériques
      client.subscribe(TOPIC_INSTR);
      Serial.println("📡 Abonné au topic : " + String(TOPIC_INSTR));

    } else {
      Serial.print("❌ Erreur MQTT (état : ");
      Serial.print(client.state());
      Serial.println("). Nouvelle tentative dans 5s...");
      delay(5000);
    }
  }
}

// ============================================================
//  CONTRÔLE DES ACTIONNEURS selon les seuils
// ============================================================
void appliquerActionneurs(float luminosite, float humidite_sol,
                          float temperature, float co2,
                          int   niveau_eau) {

  Serial.println("\n--- Évaluation des actionneurs ---");

  // ——— 1. ÉCLAIRAGE (ampoule) / Luminosité ———
  if (luminosite < seuils.lum_min) {
    digitalWrite(ECLAIRE_PIN, HIGH);
    Serial.println("💡 Éclairage : ON  (luminosité basse)");
  } else if (luminosite > seuils.lum_max) {
    digitalWrite(ECLAIRE_PIN, LOW);
    Serial.println("💡 Éclairage : OFF (luminosité haute)");
  }
  // Entre lum_min et lum_max : on ne touche pas à l'état actuel

  // ——— 2. POMPE / Humidité du sol ———
  // Sécurité absolue : si niveau d'eau bas → pompe OFF
  if (niveau_eau == LOW) {
    digitalWrite(POMPE_PIN, LOW);
    Serial.println("💧 Pompe : OFF  (réservoir vide — sécurité)");
  } else if (humidite_sol < seuils.hum_min) {
    digitalWrite(POMPE_PIN, HIGH);
    Serial.println("💧 Pompe : ON   (sol trop sec)");
  } else if (humidite_sol > seuils.hum_max) {
    digitalWrite(POMPE_PIN, LOW);
    Serial.println("💧 Pompe : OFF  (sol suffisamment humide)");
  }

  // ——— 3. VENTILATEUR / Température ———
  if (!isnan(temperature)) {
    if (temperature < seuils.temp_min) {
      digitalWrite(VENTIL_PIN, HIGH);
      Serial.println("🌀 Ventilateur : ON  (température trop basse)");
    } else if (temperature > seuils.temp_max) {
      digitalWrite(VENTIL_PIN, HIGH);
      Serial.println("🌀 Ventilateur : ON  (température trop haute)");
    } else {
      digitalWrite(VENTIL_PIN, LOW);
      Serial.println("🌀 Ventilateur : OFF (température normale)");
    }
  }

  // ——— 4. SERVO (porte) / CO2 ———
  if (co2 < seuils.co2_min) {
    servoPorte.write(0);   // porte fermée
    Serial.println("🚪 Porte : FERMÉE (CO2 bas)");
  } else if (co2 > seuils.co2_max) {
    servoPorte.write(90);  // porte ouverte à 90°
    Serial.println("🚪 Porte : OUVERTE (CO2 élevé)");
  }
}

// ============================================================
//  PUBLICATION DES DONNÉES CAPTEURS vers le broker
// ============================================================
void publierDonnees(float luminosite, float humidite_sol,
                    float temperature, float humidite_air,
                    float co2, int niveau_eau) {

  StaticJsonDocument<384> doc;
  doc["device_id"]     = device_id;
  doc["token"]         = token;
  doc["timestamp"]     = millis();
  doc["luminosite"]    = luminosite;
  doc["humidite_sol"]  = humidite_sol;
  doc["temperature"]   = temperature;
  doc["humidite_air"]  = humidite_air;
  doc["co2"]           = co2;
  doc["niveau_eau"]    = (niveau_eau == HIGH) ? "OK" : "Bas";

  String payload;
  serializeJson(doc, payload);

  if (client.publish(TOPIC_DATA, payload.c_str())) {
    Serial.println("\n📤 Données publiées : " + payload);
  } else {
    Serial.println("❌ Échec publication MQTT.");
  }
}

// ============================================================
//  SETUP
// ============================================================
void setup() {
  Serial.begin(115200);
  Serial.println("\n========================================");
  Serial.println("  Agriculture Intelligente — Démarrage");
  Serial.println("========================================");

  // — Actionneurs —
  pinMode(POMPE_PIN,   OUTPUT);
  pinMode(VENTIL_PIN,  OUTPUT);
  pinMode(ECLAIRE_PIN, OUTPUT);
  // Tout éteint au démarrage
  digitalWrite(POMPE_PIN,   LOW);
  digitalWrite(VENTIL_PIN,  LOW);
  digitalWrite(ECLAIRE_PIN, LOW);

  // — Capteurs —
  pinMode(WATER_PIN, INPUT);
  dht.begin();

  // — Servomoteur —
  servoPorte.attach(SERVO_PIN);
  servoPorte.write(0);  // porte fermée par défaut

  // — WiFi —
  setup_wifi();

  // — TLS (mode test sans certificat) —
  espClient.setInsecure();

  // — Token HTTP (avant MQTT) —
  getToken();

  // — MQTT —
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
  client.setBufferSize(512);  // buffer suffisant pour les seuils JSON
}

void loop() {
  // Maintenir la connexion MQTT
  if (!client.connected()) {
    reconnect();
  }
  client.loop();  // traite les messages entrants (seuils, instructions)

  unsigned long now = millis();
  if (now - lastSensorRead >= sensorInterval) {
    lastSensorRead = now;

    // --- 1. Lecture des capteurs avec filtrage ---
    float sol_avg      = readAverage(SOIL_PIN);
    float humidite_sol = map((int)sol_avg, 4095, 0, 0, 100);

    float temperature   = dht.readTemperature();
    float humidite_air  = dht.readHumidity();

    float ldr_avg    = readAverage(LDR_PIN);
    float luminosite = map((int)ldr_avg, 0, 4095, 0, 100);

    float co2_avg = readAverage(CO2_PIN);
    float co2     = map((int)co2_avg, 0, 4095, 0, 100);

    int niveau_eau = digitalRead(WATER_PIN);

    // --- 2. Application IMMÉDIATE des actionneurs (Réactivité temps réel) ---
    appliquerActionneurs(luminosite, humidite_sol, temperature, co2, niveau_eau);

    // --- 3. Logique de publication (Optimisation réseau) ---
    bool should_publish = false;
    const float VARIATION_THRESHOLD = 10.0;

    // Forcer la première publication
    if (last_published_luminosite == -1.0) {
      should_publish = true;
    } else {
      if (hasSignificantVariation(luminosite, last_published_luminosite, VARIATION_THRESHOLD)) should_publish = true;
      if (hasSignificantVariation(humidite_sol, last_published_humidite_sol, VARIATION_THRESHOLD)) should_publish = true;
      if (hasSignificantVariation(co2, last_published_co2, VARIATION_THRESHOLD)) should_publish = true;
      if (niveau_eau != last_published_niveau_eau) should_publish = true;
      
      // Gestion sécurisée de la température (éviter NaN)
      if (!isnan(temperature)) {
        if (hasSignificantVariation(temperature, last_published_temperature, VARIATION_THRESHOLD)) {
          should_publish = true;
        }
      }
    }

    if (should_publish) {
      Serial.println("\n--- [PUBLICATION] Variation détectée ---");
      
      Serial.printf("🌱 Humidité sol  : %.1f %%\n", humidite_sol);
      if (isnan(temperature)) {
        Serial.println("⚠️  Température : NaN (Ignorée)");
      } else {
        Serial.printf("🌡️  Température  : %.1f °C\n", temperature);
      }
      Serial.printf("☀️  Luminosité   : %.1f %%\n", luminosite);
      Serial.printf("🌫️  CO2          : %.1f %%\n", co2);
      Serial.printf("🪣 Niveau eau   : %s\n", (niveau_eau == HIGH ? "OK" : "BAS"));

      // Envoi MQTT
      publierDonnees(luminosite, humidite_sol, temperature, humidite_air, co2, niveau_eau);

      // Mise à jour de l'historique
      last_published_luminosite   = luminosite;
      last_published_humidite_sol = humidite_sol;
      last_published_co2          = co2;
      last_published_niveau_eau   = niveau_eau;
      
      // Mise à jour température UNIQUEMENT si valide
      if (!isnan(temperature)) {
        last_published_temperature = temperature;
      }
    }
  }
}
