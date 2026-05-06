#include <DHT.h>
#include <ESP32Servo.h>

// Définition des Pins
#define POMPE_PIN   25
#define VENTIL_PIN  26
#define ECLAIRE_PIN 13
#define SERVO_PIN   18
#define WATER_PIN   35 // Ajouté pour éviter l'erreur de compilation

Servo servo; // Déclaration de l'objet servo

void setup() {
  Serial.begin(115200);
  
  pinMode(POMPE_PIN, OUTPUT);
  pinMode(VENTIL_PIN, OUTPUT);
  pinMode(ECLAIRE_PIN, OUTPUT);
  pinMode(SERVO_PIN, OUTPUT); // Configuré en sortie pour la LED de test
  pinMode(WATER_PIN, INPUT);

  servo.attach(SERVO_PIN);
  servo.write(0);
  
  Serial.println("--- TEST DES LEDS (SIMULATION ACTIONNEURS) ---");
}

void loop() {
  while(true) {
    
    servo.write(0);
    digitalWrite(ECLAIRE_PIN, HIGH);
    digitalWrite(VENTIL_PIN, HIGH);
    digitalWrite(POMPE_PIN, HIGH);
    servo.write(90);

    delay(5000);
  }
  // TEST POMPE
  Serial.println("LED Pompe (G25) : ALLUMÉE");
  
  delay(2000);
  digitalWrite(POMPE_PIN, LOW);

  // TEST VENTILATEUR
  Serial.println("LED Ventilateur (G26) : ALLUMÉE");
  digitalWrite(VENTIL_PIN, HIGH);

  // TEST ÉCLAIRAGE
  Serial.println("LED Éclairage (G13) : ALLUMÉE");
  digitalWrite(ECLAIRE_PIN, HIGH);
  delay(2000);
  digitalWrite(ECLAIRE_PIN, LOW);

  // TEST SERVO (via LED)
  Serial.println("LED Servo (G18) : ALLUMÉE");
  digitalWrite(SERVO_PIN, HIGH);
  delay(2000);
  digitalWrite(SERVO_PIN, LOW);

  Serial.println("--- Fin du cycle de test, attente 3s ---");
  delay(3000);
}