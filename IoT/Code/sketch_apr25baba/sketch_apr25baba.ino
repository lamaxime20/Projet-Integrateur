#include <DHT.h>
#include <Wire.h>
#include <SensirionI2cScd4x.h>

// ===== PINS CAPTEURS =====
#define SOIL_PIN    36   // A0 = GPIO36
#define DHT_PIN      4   // D4 = GPIO4
#define LDR_PIN     39   // A1 = GPIO39
#define WATER_PIN    3   // D0 = GPIO3

// ===== PINS ACTIONNEURS =====
#define POMPE_PIN    5   // D5 = GPIO5
#define VENTIL_PIN   6   // D6 = GPIO6
#define ECLAIRE_PIN  7   // D7 = GPIO7

// ===== OBJETS =====
#define DHT_TYPE DHT22
DHT dht(DHT_PIN, DHT_TYPE);
SensirionI2cScd4x scd4x;

void setup() {
  Serial.begin(115200);

  // Capteurs
  dht.begin();
  Wire.begin();
  scd4x.begin(Wire, SCD41_I2C_ADDR_62);  // ✅ adresse I2C ajoutée
  scd4x.startPeriodicMeasurement();

  // Actionneurs
  pinMode(POMPE_PIN,   OUTPUT);
  pinMode(VENTIL_PIN,  OUTPUT);
  pinMode(ECLAIRE_PIN, OUTPUT);
  pinMode(WATER_PIN,   INPUT);

  // Tout éteint au démarrage
  digitalWrite(POMPE_PIN,   LOW);
  digitalWrite(VENTIL_PIN,  LOW);
  digitalWrite(ECLAIRE_PIN, LOW);

  Serial.println("=== Système démarré ===");
}

void loop() {
  Serial.println("\n--- Nouvelle lecture ---");

  // ================================
  // 1. YL-69 — Humidité du sol
  // ================================
  int sol_brut = analogRead(SOIL_PIN);
  int humidite_sol = map(sol_brut, 4095, 0, 0, 100);
  Serial.print("Humidité sol : ");
  Serial.print(humidite_sol);
  Serial.println(" %");

  // ================================
  // 2. DHT22 — Température & Humidité air
  // ================================
  float temperature = dht.readTemperature();
  float humidite_air = dht.readHumidity();

  if (isnan(temperature) || isnan(humidite_air)) {
    Serial.println("❌ Erreur DHT22 !");
  } else {
    Serial.print("Température : ");
    Serial.print(temperature);
    Serial.println(" °C");
    Serial.print("Humidité air : ");
    Serial.print(humidite_air);
    Serial.println(" %");
  }

  // ================================
  // 3. LDR — Luminosité
  // ================================
  int ldr_brut = analogRead(LDR_PIN);
  int luminosite = map(ldr_brut, 0, 4095, 0, 100);
  Serial.print("Luminosité : ");
  Serial.print(luminosite);
  Serial.println(" %");

  // ================================
  // 4. SCD41 — CO₂
  // ================================
  uint16_t co2 = 0;
  float temp_scd = 0, hum_scd = 0;
  bool dataReadyStatus = false;

  // ✅ getDataReadyStatus au lieu de getDataReadyFlag
  scd4x.getDataReadyStatus(dataReadyStatus);

  if (dataReadyStatus) {
    scd4x.readMeasurement(co2, temp_scd, hum_scd);
    Serial.print("CO₂ : ");
    Serial.print(co2);
    Serial.println(" ppm");
  }

  // ================================
  // 5. TANK-B LEVEL — Niveau eau
  // ================================
  int niveau_eau = digitalRead(WATER_PIN);
  Serial.print("Niveau eau : ");
  Serial.println(niveau_eau == HIGH ? "OK" : "Bas !");

  // ================================
  // ACTIONNEURS — Logique automatique
  // ================================

  // Pompe ON si sol trop sec ET eau disponible
  if (humidite_sol < 30 && niveau_eau == HIGH) {
    digitalWrite(POMPE_PIN, HIGH);
    Serial.println("Pompe : ON");
  } else {
    digitalWrite(POMPE_PIN, LOW);
    Serial.println("Pompe : OFF");
  }

  // Ventilation ON si température trop élevée
  if (!isnan(temperature) && temperature > 35) {
    digitalWrite(VENTIL_PIN, HIGH);
    Serial.println("Ventilation : ON");
  } else {
    digitalWrite(VENTIL_PIN, LOW);
    Serial.println("Ventilation : OFF");
  }

  // Éclairage ON si luminosité trop faible
  if (luminosite < 30) {
    digitalWrite(ECLAIRE_PIN, HIGH);
    Serial.println("Eclairage : ON");
  } else {
    digitalWrite(ECLAIRE_PIN, LOW);
    Serial.println("Eclairage : OFF");
  }

  delay(3000);
}
