#include <DHT.h>

// ===== PINS CAPTEURS =====
#define SOIL_PIN    A0
#define LDR_PIN     A1
#define GAS_PIN     A2
#define WATER_PIN   2
#define DHT_PIN     4

// ===== PINS ACTIONNEURS =====
#define POMPE_PIN   5
#define VENTIL_PIN  6
#define ECLAIRE_PIN 7

// ===== OBJETS =====
#define DHT_TYPE DHT11
DHT dht(DHT_PIN, DHT_TYPE);

void setup() {
  Serial.begin(9600); // 🔁 Uno plus stable à 9600

  // Capteurs
  dht.begin();

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
  // 1. Humidité du sol
  // ================================
  int sol_brut = analogRead(SOIL_PIN);
  int humidite_sol = map(sol_brut, 1023, 0, 0, 100); // 🔁 corrigé

  Serial.print("Humidité sol : ");
  Serial.print(humidite_sol);
  Serial.println(" %");

  // ================================
  // 2. DHT22
  // ================================
  float temperature = dht.readTemperature();
  float humidite_air = dht.readHumidity();

  if (isnan(temperature) || isnan(humidite_air)) {
    Serial.println("❌ Erreur DHT !");
  } else {
    Serial.print("Température : ");
    Serial.print(temperature);
    Serial.println(" °C");

    Serial.print("Humidité air : ");
    Serial.print(humidite_air);
    Serial.println(" %");
  }

  // ================================
  // 3. Luminosité
  // ================================
  int ldr_brut = analogRead(LDR_PIN);
  int luminosite = map(ldr_brut, 0, 1023, 0, 100); // 🔁 corrigé

  Serial.print("Luminosité : ");
  Serial.print(luminosite);
  Serial.println(" %");

  // ================================
  // 4. Gaz (MQ-135)
  // ================================
  int gaz_brut = analogRead(GAS_PIN);
  int qualite_air = map(gaz_brut, 0, 1023, 0, 100); // 🔁 corrigé

  Serial.print("Qualité air (approx CO2) : ");
  Serial.print(qualite_air);
  Serial.println(" %");

  // ================================
  // 5. Niveau d’eau
  // ================================
  int niveau_eau = digitalRead(WATER_PIN);

  Serial.print("Niveau eau : ");
  Serial.println(niveau_eau == HIGH ? "OK" : "Bas !");

  // ================================
  // ACTIONNEURS
  // ================================

  // Pompe
  if (humidite_sol < 30 && niveau_eau == HIGH) {
    digitalWrite(POMPE_PIN, HIGH);
    Serial.println("Pompe : ON");
  } else {
    digitalWrite(POMPE_PIN, LOW);
    Serial.println("Pompe : OFF");
  }

  // Ventilation
  if (!isnan(temperature) && temperature > 35) {
    digitalWrite(VENTIL_PIN, HIGH);
    Serial.println("Ventilation : ON");
  } else {
    digitalWrite(VENTIL_PIN, LOW);
    Serial.println("Ventilation : OFF");
  }

  // Éclairage
  if (luminosite < 30) {
    digitalWrite(ECLAIRE_PIN, HIGH);
    Serial.println("Eclairage : ON");
  } else {
    digitalWrite(ECLAIRE_PIN, LOW);
    Serial.println("Eclairage : OFF");
  }

  delay(3000);
}