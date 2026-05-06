/*
 * ============================================================
 *  AGRICULTURE INTELLIGENTE — ESP32 (VERSION STABLE DEVKIT)
 * ============================================================
 */

#include <DHT.h>
#include <ESP32Servo.h>

// ============================================================
// PINS CAPTEURS (ADC1 = OK AVEC WIFI)
// ============================================================
#define SOIL_PIN   34
#define LDR_PIN    39
#define CO2_PIN    36
#define WATER_PIN  35
#define DHT_PIN    4

// ============================================================
// ACTIONNEURS
// ============================================================
#define POMPE_PIN   25
#define VENTIL_PIN  26
#define ECLAIRE_PIN 13
#define SERVO_PIN   18

// ============================================================
// OBJETS
// ============================================================
#define DHT_TYPE DHT11   // ✅ CORRECTION ICI
DHT dht(DHT_PIN, DHT_TYPE);

Servo servo;

// ============================================================
// SETUP
// ============================================================
void setup() {
  Serial.begin(115200);

  dht.begin();

  pinMode(POMPE_PIN, OUTPUT);
  pinMode(VENTIL_PIN, OUTPUT);
  pinMode(ECLAIRE_PIN, OUTPUT);
  pinMode(WATER_PIN, INPUT);

  servo.attach(SERVO_PIN);
  servo.write(0);

  digitalWrite(POMPE_PIN, LOW);
  digitalWrite(VENTIL_PIN, LOW);
  digitalWrite(ECLAIRE_PIN, LOW);

  Serial.println("=== SYSTEME ESP32 DEMARRE (DHT11) ===");
}

// ============================================================
// LOOP
// ============================================================
void loop() {
  while(true) {
    digitalWrite(VENTIL_PIN, HIGH);
  }
  Serial.println("\n--- Nouvelle lecture ---");

  // ================================
  // HUMIDITE SOL
  // ================================
  int sol_brut = analogRead(SOIL_PIN);
  int humidite_sol = map(sol_brut, 4095, 0, 0, 100);

  Serial.print("Humidité sol : ");
  Serial.print(humidite_sol);
  Serial.println(" %");

  // ================================
  // DHT11
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
  // LUMINOSITE
  // ================================
  int ldr_brut = analogRead(LDR_PIN);
  int luminosite = map(ldr_brut, 0, 4095, 0, 100);

  Serial.print("Luminosité : ");
  Serial.print(luminosite);
  Serial.println(" %");

  // ================================
  // QUALITE AIR
  // ================================
  int gaz_brut = analogRead(CO2_PIN);
  int qualite_air = map(gaz_brut, 0, 4095, 0, 100);

  Serial.print("Qualité air : ");
  Serial.print(qualite_air);
  Serial.println(" %");

  // ================================
  // NIVEAU EAU
  // ================================
  int niveau_eau = digitalRead(WATER_PIN);

  Serial.print("Niveau eau : ");
  Serial.println(niveau_eau ? "OK" : "BAS");

  int eau_brut = analogRead(WATER_PIN); 

  // On considère qu'il y a assez d'eau si la valeur dépasse 500 
  // (à ajuster selon vos tests, l'air sec = 0)
  bool assez_eau = (eau_brut > 500); 

  Serial.print("Niveau eau (brut) : ");
  Serial.print(eau_brut);
  Serial.print(" -> État : ");
  Serial.println(assez_eau ? "OK" : "BAS / VIDE");
  if(assez_eau) niveau_eau = HIGH;

  // ============================================================
  // LOGIQUE AUTOMATIQUE
  // ============================================================

  // POMPE
  if (humidite_sol < 30 && niveau_eau == HIGH) {
    digitalWrite(POMPE_PIN, HIGH);
    servo.write(90);
    Serial.println("Pompe : ON");
  } else {
    digitalWrite(POMPE_PIN, LOW);
    servo.write(0);
    Serial.println("Pompe : OFF");
  }

  // VENTILATION
  if (!isnan(temperature) && temperature > 25) {
    digitalWrite(VENTIL_PIN, HIGH);
    Serial.println("Ventilation : ON");
  } else {
    digitalWrite(VENTIL_PIN, LOW);
    Serial.println("Ventilation : OFF");
  }

  // ECLAIRAGE
  if (luminosite > 30) {
    digitalWrite(ECLAIRE_PIN, HIGH);
    Serial.println("Eclairage : ON");
  } else {
    digitalWrite(ECLAIRE_PIN, LOW);
    Serial.println("Eclairage : OFF");
  }

  delay(4000); // ✅ DHT11 préfère ≥ 2s (on met 4s pour stabilité)
}