/*
 * ============================================================
 *  AGRICULTURE INTELLIGENTE — ESP32
 *  Version corrigée — accord backend + reflexion.md
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
// CONFIGURATION
// ============================================================
const char* ssid        = "Orange-9173";
const char* password    = "6NAEhdHhFR9";
const char* apiUrl      = "https://amused-presence-production-a3ec.up.railway.app/api/device/token";
const char* mqtt_server = "b1d946f5edb84d23ade6058bd316610b.s1.eu.hivemq.cloud";
const int   mqtt_port   = 8883;
const char* mqtt_user   = "agrico-tech";
const char* mqtt_pass   = "Max123456";

String identifiant_user = "user_123";
String device_id        = "esp32_01";

String TOPIC_DATA, TOPIC_INSTR, TOPIC_STATUS;
String TOPIC_AVAILABILITY, TOPIC_COMPONENTS, TOPIC_SEUILS;

// ============================================================
// PINS
// ============================================================
#define SOIL_PIN    34
#define LDR_PIN     39
#define CO2_PIN     36
#define WATER_PIN   35
#define DHT_PIN      4

#define POMPE_PIN   25
#define VENTIL_PIN  26
#define ECLAIRE_PIN 13
#define SERVO_PIN   18

#define ACTIONNEUR_ON  HIGH
#define ACTIONNEUR_OFF LOW

// ============================================================
// OBJETS
// ============================================================
#define DHT_TYPE DHT11
DHT dht(DHT_PIN, DHT_TYPE);
Servo servoPorte;
WiFiClientSecure espClient;
PubSubClient client(espClient);

// ============================================================
// SEUILS — valeurs par défaut, mis à jour via MQTT retain
// ============================================================
struct Seuils {
  float lum_min  = 20.0f;   // % — lum < min  → ampoule OFF
  float lum_max  = 80.0f;   // % — lum > max  → ampoule ON
  float hum_min  = 30.0f;   // % — hum < min  → pompe ON
  float hum_max  = 70.0f;   // % — hum > max  → pompe OFF
  float temp_min = 18.0f;   // °C — temp < min → ventilateur OFF
  float temp_max = 35.0f;   // °C — temp > max → ventilateur ON
  float co2_min  = 30.0f;   // % — co2 < min  → porte fermée
  float co2_max  = 70.0f;   // % — co2 > max  → porte ouverte
};
Seuils seuils;

// ============================================================
// INSTRUCTIONS
// ============================================================
struct Instruction {
  bool          actif  = false;
  String        id;
  String        action;
  unsigned long finMs  = 0;
};

Instruction instrPompe, instrLampe, instrVentil, instrPorte;

// ============================================================
// ÉTATS COMPOSANTS — détection des changements
// Index : 0=pompe 1=ampoule 2=ventilateur 3=porte
//         4=humidite_sol 5=temperature 6=luminosite 7=co2 8=niveau_eau
// ============================================================
struct EtatComposant {
  const char* nom;
  const char* type;
  String      etatPrecedent;
};

EtatComposant etats[] = {
  {"pompe classique",        "actionneur", ""},
  {"ampoule classique",      "actionneur", ""},
  {"ventilateur classique",  "actionneur", ""},
  {"servomoteur classique", "actionneur", ""},
  {"humidite_sol", "capteur",    ""},
  {"temperature",  "capteur",    ""},
  {"luminosite",   "capteur",    ""},
  {"co2",          "capteur",    ""},
  {"niveau_eau",   "capteur",    ""},
};

// ============================================================
// COMPTEURS PERSISTANTS — détection état capteurs DHT
// ============================================================
static int   nanCountTemp    = 0;
static int   frozenCountTemp = 0;
static float prevTempVal     = NAN;

// ============================================================
// DERNIÈRES VALEURS PUBLIÉES — filtre variation 10%
// ============================================================
static float pubTemp = NAN;
static float pubHum  = NAN;
static float pubLum  = NAN;
static float pubCO2  = NAN;
static float pubEau  = NAN;

bool porteOuverte = false;

// ============================================================
// UTILITAIRES
// ============================================================
float mapFloat(float x, float in_min, float in_max, float out_min, float out_max) {
  if (fabs(in_max - in_min) < 0.001f) return out_min;
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

// Lit 5 fois, retire le min et le max, moyenne des 3 restants.
// Si les 5 lectures sont identiques ET bloquées à 0 ou 4095 → capteur absent/court-circuit.
float readAvgAnalog(int pin, bool* defaillant) {
  int vals[5];
  int mn = 4095, mx = 0;
  for (int i = 0; i < 5; i++) {
    vals[i] = analogRead(pin);
    if (vals[i] < mn) mn = vals[i];
    if (vals[i] > mx) mx = vals[i];
    delay(5);
  }
  if (defaillant) {
    *defaillant = (mx == mn) && (mn == 0 || mx == 4095);
  }
  if (mn == mx) return (float)mn;

  long  sum = 0;
  int   cnt = 0;
  bool  skipMin = false, skipMax = false;
  for (int i = 0; i < 5; i++) {
    if (!skipMin && vals[i] == mn) { skipMin = true; continue; }
    if (!skipMax && vals[i] == mx) { skipMax = true; continue; }
    sum += vals[i];
    cnt++;
  }
  if (cnt == 0) return (float)mn;
  return (float)sum / (float)cnt;
}

// Moyenne DHT sur 5 lectures — ignore les NaN transitoires
float readDHTTemp() {
  float sum = 0.0f;
  int   cnt = 0;
  for (int i = 0; i < 5; i++) {
    float v = dht.readTemperature();
    if (!isnan(v)) { sum += v; cnt++; }
    delay(20);
  }
  return cnt > 0 ? sum / (float)cnt : NAN;
}

bool variationSuffisante(float val, float dernier) {
  if (isnan(val))     return false;
  if (isnan(dernier)) return true;
  if (dernier == 0)   return val != 0;
  return fabs(val - dernier) >= fabs(dernier) * 0.10f;
}

String normaliser(String s) {
  s.replace("\r", ""); s.replace("\n", ""); s.trim(); s.toLowerCase();
  while (s.indexOf("  ") >= 0) s.replace("  ", " ");
  return s;
}

bool demandeAllumage(String action) {
  action = normaliser(action);
  return action == "allumer" || action == "ouvrir";
}

// ============================================================
// DÉTECTION ÉTAT CAPTEURS
// ============================================================

// DHT : NaN répétés (≥3) → défaillant ; lecture gelée longtemps (>100) → défaillant
String etatDHT(float val) {
  if (isnan(val)) {
    nanCountTemp = min(nanCountTemp + 1, 200);
    return (nanCountTemp >= 3) ? "defaillant" : "actif";
  }
  nanCountTemp = 0;
  if (!isnan(prevTempVal) && fabs(val - prevTempVal) < 0.05f) {
    frozenCountTemp = min(frozenCountTemp + 1, 200);
  } else {
    frozenCountTemp = 0;
  }
  prevTempVal = val;
  return (frozenCountTemp > 100) ? "defaillant" : "actif";
}

// Capteur analogique : défaillant détecté par zéro-variance aux extrêmes ADC
String etatAnalog(bool defaillantDetecte) {
  return defaillantDetecte ? "defaillant" : "actif";
}

// ============================================================
// PUBLICATIONS MQTT
// ============================================================
void publierEtatComposant(const char* nom, const char* type, String etat) {
  StaticJsonDocument<200> doc;
  doc["device_id"] = device_id;
  doc["nom"]       = nom;
  doc["type"]      = type;
  doc["etat"]      = etat;
  String payload;
  serializeJson(doc, payload);
  client.publish(TOPIC_COMPONENTS.c_str(), payload.c_str());
}

void publierSiChangement(EtatComposant& comp, String nouvelEtat) {
  if (comp.etatPrecedent != nouvelEtat) {
    comp.etatPrecedent = nouvelEtat;
    publierEtatComposant(comp.nom, comp.type, nouvelEtat);
  }
}

void publierStatutInstruction(String id, String status) {
  StaticJsonDocument<200> doc;
  doc["device_id"]      = device_id;
  doc["id_instruction"] = id;
  doc["status"]         = status;
  String payload;
  serializeJson(doc, payload);
  client.publish(TOPIC_STATUS.c_str(), payload.c_str());
}

// ============================================================
// WIFI + TOKEN
// ============================================================
void setup_wifi() {
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.println("\nWiFi OK — IP: " + WiFi.localIP().toString());
}

void getToken() {
  HTTPClient http;
  http.begin(apiUrl);
  http.addHeader("Content-Type", "application/json");
  StaticJsonDocument<200> doc;
  doc["identifiant_user"] = identifiant_user;
  String body;
  serializeJson(doc, body);
  int code = http.POST(body);
  if (code > 0) {
    StaticJsonDocument<256> res;
    deserializeJson(res, http.getString());
    Serial.println("Token reçu : " + res["token"].as<String>());
  } else {
    Serial.println("Impossible de récupérer le token.");
  }
  http.end();
}

// ============================================================
// HELPERS INSTRUCTIONS
// ============================================================
Instruction* trouverInstruction(String cible) {
  cible = normaliser(cible);
  if (cible.indexOf("pompe classique")        >= 0) return &instrPompe;
  if (cible.indexOf("ampoule classique")      >= 0) return &instrLampe;
  if (cible.indexOf("ventilateur classique")  >= 0) return &instrVentil;
  if (cible.indexOf("porte")        >= 0 ||
      cible.indexOf("servomoteur classique")        >= 0) return &instrPorte;
  return nullptr;
}

int indexActionneur(String cible) {
  cible = normaliser(cible);
  if (cible.indexOf("pompe")       >= 0) return 0;
  if (cible.indexOf("ampoule")     >= 0) return 1;
  if (cible.indexOf("ventilateur") >= 0) return 2;
  if (cible.indexOf("porte")       >= 0 ||
      cible.indexOf("servo")       >= 0) return 3;
  return -1;
}

void appliquerPin(String cible, bool allumer) {
  cible = normaliser(cible);
  if (cible.indexOf("pompe classique")       >= 0)
    digitalWrite(POMPE_PIN,   allumer ? ACTIONNEUR_ON : ACTIONNEUR_OFF);
  else if (cible.indexOf("ampoule classique") >= 0)
    digitalWrite(ECLAIRE_PIN, allumer ? ACTIONNEUR_ON : ACTIONNEUR_OFF);
  else if (cible.indexOf("ventilateur classique") >= 0)
    digitalWrite(VENTIL_PIN,  allumer ? ACTIONNEUR_ON : ACTIONNEUR_OFF);
  else if (cible.indexOf("porte") >= 0 || cible.indexOf("servomoteur classique") >= 0)
    servoPorte.write(allumer ? 90 : 0); porteOuverte = allumer;
}

// ============================================================
// CALLBACK MQTT
// ============================================================
void callback(char* topic, byte* payload, unsigned int length) {
  String topicStr = String(topic);
  String msg = "";
  for (unsigned int i = 0; i < length; i++) msg += (char)payload[i];

  // ——— Seuils (retain) ———
  if (topicStr == TOPIC_SEUILS) {
    StaticJsonDocument<512> doc;
    if (!deserializeJson(doc, msg)) {
      if (doc.containsKey("lum_min"))  seuils.lum_min  = doc["lum_min"];
      if (doc.containsKey("lum_max"))  seuils.lum_max  = doc["lum_max"];
      if (doc.containsKey("hum_min"))  seuils.hum_min  = doc["hum_min"];
      if (doc.containsKey("hum_max"))  seuils.hum_max  = doc["hum_max"];
      if (doc.containsKey("temp_min")) seuils.temp_min = doc["temp_min"];
      if (doc.containsKey("temp_max")) seuils.temp_max = doc["temp_max"];
      if (doc.containsKey("co2_min"))  seuils.co2_min  = doc["co2_min"];
      if (doc.containsKey("co2_max"))  seuils.co2_max  = doc["co2_max"];
      Serial.println("[MQTT] Seuils mis à jour.");
    }
    return;
  }

  // ——— Instructions ———
  if (topicStr == TOPIC_INSTR) {
    StaticJsonDocument<256> doc;
    if (deserializeJson(doc, msg)) return;

    String id     = doc["id_instruction"].as<String>();
    String action = normaliser(doc["action"].as<String>());
    String cible  = normaliser(doc["actionneur"].as<String>());
    unsigned long duree = (unsigned long)(doc["duree"] | 0);

    Serial.println("[MQTT] Instruction : " + action + " | " + cible + " | " + String(duree) + "s");

    if (action == "redemarrer") { ESP.restart(); return; }

    Instruction* instr = trouverInstruction(cible);
    if (!instr) {
      Serial.println("[MQTT] Actionneur inconnu : " + cible);
      publierStatutInstruction(id, "interrompue");
      return;
    }

    // Interrompre l'instruction précédente sur le même actionneur
    if (instr->actif) {
      publierStatutInstruction(instr->id, "interrompue");
    }

    instr->actif  = true;
    instr->id     = id;
    instr->action = action;
    instr->finMs  = millis() + duree * 1000UL;

    bool allumer = demandeAllumage(action);
    appliquerPin(cible, allumer);

    // Publier l'état immédiatement via publierSiChangement (évite le doublon dans loop)
    int idx = indexActionneur(cible);
    if (idx >= 0) {
      String nouvelEtat = (idx == 3)
        ? (allumer ? "ouverte" : "fermee")
        : (allumer ? "allume"  : "eteint");
      publierSiChangement(etats[idx], nouvelEtat);
    }
  }
}

// ============================================================
// RECONNEXION MQTT
// ============================================================
void reconnect() {
  while (!client.connected()) {
    Serial.print("[MQTT] Connexion... ");
    if (client.connect(device_id.c_str(), mqtt_user, mqtt_pass,
                       TOPIC_AVAILABILITY.c_str(), 1, true, "offline")) {
      Serial.println("OK");
      client.publish(TOPIC_AVAILABILITY.c_str(), "online", true);
      client.subscribe(TOPIC_SEUILS.c_str());
      client.subscribe(TOPIC_INSTR.c_str());
    } else {
      Serial.println("Echec rc=" + String(client.state()) + " — 5s...");
      delay(5000);
    }
  }
}

// ============================================================
// LOGIQUE AUTO ACTIONNEURS — conforme reflexion.md
// ============================================================
void appliquerActionneurs(float lum, float hum, float temp, float co2, bool eauOK) {
  // Ampoule : luminosité < min → OFF | luminosité > max → ON
  if (!instrLampe.actif) {
    Serial.print("lumiere ");
    Serial.println(lum);
    if      (lum < seuils.lum_min) {
      digitalWrite(ECLAIRE_PIN, ACTIONNEUR_OFF);
      publierSiChangement(etats[1], "eteint");
    }
    else if (lum > seuils.lum_max) {
      digitalWrite(ECLAIRE_PIN, ACTIONNEUR_ON);
      publierSiChangement(etats[1], "allume");
    }
  }

  // Pompe : eau basse → OFF (prioritaire) | hum < min → ON | hum > max → OFF
  if (!instrPompe.actif) {
    Serial.print("humidite du sol ");
    Serial.println(hum);
    if      (!eauOK)               {
      Serial.println("eau vide");
      digitalWrite(POMPE_PIN, ACTIONNEUR_OFF);
      publierSiChangement(etats[0], "eteint");
    }
    else if (hum < seuils.hum_min) {
      digitalWrite(POMPE_PIN, ACTIONNEUR_ON);
      publierSiChangement(etats[0], "allume");
    }
    else if (hum > seuils.hum_max) {
      digitalWrite(POMPE_PIN, ACTIONNEUR_OFF);
      publierSiChangement(etats[0], "eteint");
    }
  }

  // Ventilateur : temp > max → ON | temp < min → OFF
  if (!instrVentil.actif && !isnan(temp)) {
    Serial.print("temperature ");
    Serial.println(temp);
    if      (temp > seuils.temp_max) {
      digitalWrite(VENTIL_PIN, ACTIONNEUR_ON);
      publierSiChangement(etats[2], "allume");
    }
    else if (temp < seuils.temp_min) {
      digitalWrite(VENTIL_PIN, ACTIONNEUR_OFF);
      publierSiChangement(etats[2], "eteint");
    }
  }

  // Porte : qualité air (MQ) — co2 > max → ouverte (ventilation) | co2 < min → fermée
  if (!instrPorte.actif) {
    Serial.print("CO2 ");
    Serial.println(co2);
    if      (co2 > seuils.co2_max) {
      servoPorte.write(90);
      publierSiChangement(etats[3], "ouverte");
    }
    else if (co2 < seuils.co2_min) {
      servoPorte.write(0);
      publierSiChangement(etats[3], "fermee");
    }
  }
}

// ============================================================
// SETUP
// ============================================================
void setup() {
  Serial.begin(115200);
  Serial.println("--- DEMARRAGE ---");

  pinMode(POMPE_PIN,   OUTPUT);
  pinMode(VENTIL_PIN,  OUTPUT);
  pinMode(ECLAIRE_PIN, OUTPUT);
  pinMode(WATER_PIN,   INPUT);

  digitalWrite(POMPE_PIN,   ACTIONNEUR_OFF);
  digitalWrite(VENTIL_PIN,  ACTIONNEUR_OFF);
  digitalWrite(ECLAIRE_PIN, ACTIONNEUR_OFF);

  dht.begin();
  servoPorte.attach(SERVO_PIN);
  servoPorte.write(0);

  publierSiChangement(etats[0], "eteint");
  publierSiChangement(etats[1], "eteint");
  publierSiChangement(etats[2], "eteint");
  publierSiChangement(etats[3], "fermee");

  TOPIC_DATA         = "agriculture/" + device_id + "/data";
  TOPIC_INSTR        = "agriculture/" + device_id + "/instructions";
  TOPIC_STATUS       = "agriculture/" + device_id + "/status";
  TOPIC_AVAILABILITY = "agriculture/" + device_id + "/availability";
  TOPIC_COMPONENTS   = "agriculture/" + device_id + "/components";
  TOPIC_SEUILS       = "agriculture/" + device_id + "/seuils";

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

  // ——— 1. LECTURE CAPTEURS ———
  bool defSol = false, defLDR = false, defCO2 = false;
  float rawSol = readAvgAnalog(SOIL_PIN,  &defSol);
  float rawLDR = readAvgAnalog(LDR_PIN,   &defLDR);
  float rawCO2 = readAvgAnalog(CO2_PIN,   &defCO2);
  float rawEau = readAvgAnalog(WATER_PIN, nullptr);

  float hum_sol = mapFloat(rawSol, 4095.0f, 0.0f,    0.0f, 100.0f);
  float temp    = readDHTTemp();
  float lum     = mapFloat(rawLDR, 0.0f,    4095.0f,  0.0f, 100.0f);
  float co2     = mapFloat(rawCO2, 0.0f,    4095.0f,  0.0f, 100.0f);
  bool  eauOK   = (rawEau > 500.0f);

  // ——— 2. ÉTATS CAPTEURS ———
  String etatHumSol = etatAnalog(defSol);
  String etatTemp   = etatDHT(temp);
  String etatLum    = etatAnalog(defLDR);
  String etatCO2    = etatAnalog(defCO2);

  bool humOK = (etatHumSol == "actif");
  bool tmpOK = (etatTemp   == "actif");
  bool lumOK = (etatLum    == "actif");
  bool co2OK = (etatCO2    == "actif");

  // Valeurs effectives pour la logique auto (0 si capteur défaillant)
  float humEff  = humOK ? hum_sol : 0.0f;
  float tempEff = tmpOK ? temp    : 0.0f;
  float lumEff  = lumOK ? lum     : 0.0f;
  float co2Eff  = co2OK ? co2     : 0.0f;

  // ——— 3. MAINTIEN + FIN DES INSTRUCTIONS ———
  unsigned long now = millis();

  if (instrPompe.actif) {
    digitalWrite(POMPE_PIN, demandeAllumage(instrPompe.action) ? ACTIONNEUR_ON : ACTIONNEUR_OFF);
    if (now >= instrPompe.finMs) {
      publierStatutInstruction(instrPompe.id, "terminee");
      instrPompe.actif = false;
    }
  }
  if (instrLampe.actif) {
    digitalWrite(ECLAIRE_PIN, demandeAllumage(instrLampe.action) ? ACTIONNEUR_ON : ACTIONNEUR_OFF);
    if (now >= instrLampe.finMs) {
      publierStatutInstruction(instrLampe.id, "terminee");
      instrLampe.actif = false;
    }
  }
  if (instrVentil.actif) {
    digitalWrite(VENTIL_PIN, demandeAllumage(instrVentil.action) ? ACTIONNEUR_ON : ACTIONNEUR_OFF);
    if (now >= instrVentil.finMs) {
      publierStatutInstruction(instrVentil.id, "terminee");
      instrVentil.actif = false;
    }
  }
  if (instrPorte.actif) {
    servoPorte.write(demandeAllumage(instrPorte.action) ? 90 : 0);
    if (now >= instrPorte.finMs) {
      publierStatutInstruction(instrPorte.id, "terminee");
      instrPorte.actif = false;
    }
  }

  // ——— 4. LOGIQUE AUTO ACTIONNEURS ———
  appliquerActionneurs(lumEff, humEff, tempEff, co2Eff, eauOK);

  // ——— 5. DONNÉES CAPTEURS — publish si variation ≥10% ———
  {
    float tempP = tmpOK ? temp    : 0.0f;
    float humP  = humOK ? hum_sol : 0.0f;
    float co2P  = co2OK ? co2     : 0.0f;
    float lumP  = lumOK ? lum     : 0.0f;
    float eauP  = eauOK ? 100.0f  : 0.0f;

    StaticJsonDocument<256> dataDoc;
    bool hasData = false;

    if (variationSuffisante(tempP, pubTemp)) { dataDoc["temperature"] = tempP; pubTemp = tempP; hasData = true; }
    if (variationSuffisante(humP,  pubHum))  { dataDoc["humidite"]    = humP;  pubHum  = humP;  hasData = true; }
    if (variationSuffisante(co2P,  pubCO2))  { dataDoc["co2"]         = co2P;  pubCO2  = co2P;  hasData = true; }
    if (variationSuffisante(lumP,  pubLum))  { dataDoc["luminosite"]  = lumP;  pubLum  = lumP;  hasData = true; }
    if (variationSuffisante(eauP,  pubEau))  { dataDoc["niveau_eau"]  = eauP;  pubEau  = eauP;  hasData = true; }

    if (hasData) {
      String payload;
      serializeJson(dataDoc, payload);
      client.publish(TOPIC_DATA.c_str(), payload.c_str());
    }
  }

  // Capteurs : actif / defaillant (+ ok/bas pour le niveau d'eau)
  publierSiChangement(etats[4], etatHumSol);
  publierSiChangement(etats[5], etatTemp);
  publierSiChangement(etats[6], etatLum);
  publierSiChangement(etats[7], etatCO2);
  publierSiChangement(etats[8], eauOK ? "ok" : "bas");
}