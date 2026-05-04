-- =========================================
-- JEUX DE TEST COMPLETS
-- =========================================

-- =====================
-- UTILISATEURS
-- =====================
INSERT INTO utilisateurs (id, email, nom, prenom, password, role, status, created_at)
VALUES 
(uuid_generate_v4(), 'admin@test.com', 'Admin', 'Systeme', 'password123', 'admin', 'actif', NOW()),
(uuid_generate_v4(), 'user1@test.com', 'Doe', 'John', 'password123', 'user', 'actif', NOW()),
(uuid_generate_v4(), 'user2@test.com', 'Smith', 'Anna', 'password123', 'user', 'inactif', NOW());

-- =====================
-- MICROCONTROLEURS
-- =====================
-- 1 avec user
INSERT INTO microcontroleurs (id, nom, mac_address, identifiant_user, reference, allume, date_installation, passkey, user_id)
VALUES 
(uuid_generate_v4(), 'ESP32_SERRE_1', 'AA:BB:CC:DD:01', 'user1_device_1', 'ESP32', TRUE, NOW(), 'passkey123', 
 (SELECT id FROM utilisateurs WHERE email='user1@test.com'));

-- 1 SANS USER (IMPORTANT)
INSERT INTO microcontroleurs (id, nom, mac_address, identifiant_user, reference, allume, date_installation, passkey, user_id)
VALUES 
(uuid_generate_v4(), 'ESP32_LIBRE', 'AA:BB:CC:DD:02', 'free_device_1', 'ESP32', FALSE, NOW(), 'passkey456', NULL);

-- =====================
-- CAPTEURS
-- =====================
INSERT INTO capteurs (id, type_mesure, etat, modele, microcontroleur_id)
VALUES 
(uuid_generate_v4(),
 (SELECT id FROM grandeurs WHERE name='Température de l''air'),
 'actif',
 'DHT22',
 (SELECT id FROM microcontroleurs WHERE nom='ESP32_SERRE_1')),

(uuid_generate_v4(),
 (SELECT id FROM grandeurs WHERE name='Humidité du sol'),
 'actif',
 'YL-69',
 (SELECT id FROM microcontroleurs WHERE nom='ESP32_SERRE_1'));

-- =====================
-- ACTIONNEURS
-- =====================
INSERT INTO actionneurs (id, etat, modele, microcontroleur_id)
VALUES 
(uuid_generate_v4(), 'actif', 'Pompe_eau', 
 (SELECT id FROM microcontroleurs WHERE nom='ESP32_SERRE_1'));

-- =====================
-- DONNEES CAPTEURS
-- =====================
INSERT INTO donnees (valeur, date_arrivee, capteur_id)
VALUES 
(25.5, NOW(),
 (SELECT id FROM capteurs WHERE modele='DHT22')),

(60.0, NOW(),
 (SELECT id FROM capteurs WHERE modele='YL-69'));

-- =====================
-- SEUILS
-- =====================
INSERT INTO seuils (type_mesure, valeur_max, valeur_min, updated_at, user_id, microcontroleur_id)
VALUES 
(
 (SELECT id FROM grandeurs WHERE name='Température de l''air'),
 35.0,
 18.0,
 NOW(),
 (SELECT id FROM utilisateurs WHERE email='user1@test.com'),
 (SELECT id FROM microcontroleurs WHERE nom='ESP32_SERRE_1')
);

-- =====================
-- ALERTES
-- =====================
INSERT INTO alertes (type, message, vu, date_arrivee, user_id)
VALUES 
('temperature', 'Température trop élevée', FALSE, NOW(),
 (SELECT id FROM utilisateurs WHERE email='user1@test.com'));

-- =====================
-- LOGS
-- =====================
INSERT INTO logs (type, description, date, source_type, source_id, gravite)
VALUES 
('systeme', 'Connexion microcontroleur', NOW(), 'microcontroleur', 'ESP32_SERRE_1', 'faible');

-- =====================
-- CONSULTATION LOGS
-- =====================
INSERT INTO consultation_logs (user_id, log_id)
VALUES 
(
 (SELECT id FROM utilisateurs WHERE email='user1@test.com'),
 (SELECT id FROM logs LIMIT 1)
);

-- =====================
-- INSTRUCTIONS
-- =====================
INSERT INTO instructions (action, duree, statut, date_arrivee, user_id, actionneur_id)
VALUES 
('arrosage', 30, 'en_attente', NOW(),
 (SELECT id FROM utilisateurs WHERE email='user1@test.com'),
 (SELECT id FROM actionneurs LIMIT 1)
);

-- =====================
-- ETATS CAPTEURS
-- =====================
INSERT INTO etats_capteurs (etat, date_debut_etat, capteur_id)
VALUES 
('actif', NOW(),
 (SELECT id FROM capteurs LIMIT 1));

-- =====================
-- ETATS MICROCONTROLEURS
-- =====================
INSERT INTO etats_microcontroleurs (etat, date_debut_etat, microcontroleur_id)
VALUES 
('actif', NOW(),
 (SELECT id FROM microcontroleurs WHERE nom='ESP32_SERRE_1'));

-- =====================
-- ETATS ACTIONNEURS
-- =====================
INSERT INTO etats_actionneurs (etat, date_debut_etat, actionneur_id)
VALUES 
('actif', NOW(),
 (SELECT id FROM actionneurs LIMIT 1));

-- =====================
-- TOKENS MICROCONTROLEURS
-- =====================
INSERT INTO microcontroleur_tokens (token, microcontroleur_id, created_at, expires_at)
VALUES 
('token_micro_123',
 (SELECT id FROM microcontroleurs WHERE nom='ESP32_SERRE_1'),
 NOW(),
 NOW() + INTERVAL '1 day');

-- =====================
-- SESSIONS
-- =====================
INSERT INTO sessions (token, user_id, role, created_at, expires_at, last_used_at, updated_at)
VALUES 
('session_token_123',
 (SELECT id FROM utilisateurs WHERE email='user1@test.com'),
 'user',
 NOW(),
 NOW() + INTERVAL '1 day',
 NOW(),
 NOW());

-- =====================
-- RESET PASSWORD
-- =====================
INSERT INTO reset_password_codes (user_id, code, created_at, expires_at)
VALUES 
(
 (SELECT id FROM utilisateurs WHERE email='user1@test.com'),
 '123456',
 NOW(),
 NOW() + INTERVAL '10 minutes'
);

-- =====================
-- VERIFICATION EMAIL
-- =====================
INSERT INTO verification_codes (email, code, created_at, expired_at)
VALUES 
('user1@test.com', '654321', NOW(), NOW() + INTERVAL '10 minutes');