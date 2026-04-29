-- =========================================
-- EXTENSION UUID
-- =========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================
-- DOMAINES GENERIQUES
-- =========================================

CREATE DOMAIN dom_uuid AS UUID;

CREATE DOMAIN dom_string AS VARCHAR(255)
CHECK (LENGTH(TRIM(VALUE)) > 0);

CREATE DOMAIN dom_email AS VARCHAR(255)
CHECK (POSITION('@' IN VALUE) > 1);

CREATE DOMAIN dom_password AS TEXT
CHECK (LENGTH(VALUE) >= 8);

CREATE DOMAIN dom_role AS VARCHAR(50)
CHECK (VALUE IN ('admin', 'user'));

CREATE DOMAIN dom_status AS VARCHAR(50)
CHECK (VALUE IN ('actif', 'inactif'));

CREATE DOMAIN dom_timestamp AS TIMESTAMP;

CREATE DOMAIN dom_bool AS BOOLEAN;

CREATE DOMAIN dom_float AS DOUBLE PRECISION;

-- =========================================
-- DOMAINES METIER
-- =========================================

CREATE DOMAIN dom_type_log AS VARCHAR(50);

CREATE DOMAIN dom_gravite AS VARCHAR(50)
CHECK (VALUE IN ('faible', 'moyenne', 'critique'));

CREATE DOMAIN dom_type_source AS VARCHAR(50);

CREATE DOMAIN dom_etat AS VARCHAR(50)
CHECK (VALUE IN ('actif', 'inactif', 'defaillant'));

CREATE DOMAIN dom_action AS VARCHAR(50);

CREATE DOMAIN dom_statut_instruction AS VARCHAR(50)
CHECK (VALUE IN ('en_attente', 'executee', 'echouee'));

CREATE DOMAIN dom_mac_address AS VARCHAR(50);

CREATE DOMAIN dom_valeur_positive AS DOUBLE PRECISION
CHECK (VALUE >= 0);

-- =========================================
-- TABLE utilisateurs
-- =========================================

CREATE TABLE utilisateurs (
  id dom_uuid NOT NULL DEFAULT uuid_generate_v4(),
  email dom_email NOT NULL,
  nom dom_string NOT NULL,
  prenom dom_string NOT NULL,
  password dom_password NOT NULL,
  role dom_role NOT NULL,
  status dom_status NOT NULL,
  created_at dom_timestamp NOT NULL,
  updated_at dom_timestamp NULL,

  CONSTRAINT utilisateurs_pk001 PRIMARY KEY (id),
  CONSTRAINT utilisateurs_email_unique UNIQUE (email)
);

-- =========================================
-- TABLE logs
-- =========================================

CREATE TABLE logs (
  id dom_uuid NOT NULL DEFAULT uuid_generate_v4(),
  type dom_type_log NOT NULL,
  description dom_string NOT NULL,
  date dom_timestamp NOT NULL,
  source_type dom_type_source NOT NULL,
  source_id dom_string NOT NULL,
  gravite dom_gravite NOT NULL,

  CONSTRAINT logs_pk001 PRIMARY KEY (id)
);

-- =========================================
-- TABLE consultation_logs
-- =========================================

CREATE TABLE consultation_logs (
  user_id dom_uuid NOT NULL,
  log_id dom_uuid NOT NULL,

  CONSTRAINT consultation_logs_pk001 PRIMARY KEY (user_id, log_id),

  CONSTRAINT consultation_logs_fk001 FOREIGN KEY (user_id)
    REFERENCES utilisateurs(id),

  CONSTRAINT consultation_logs_fk002 FOREIGN KEY (log_id)
    REFERENCES logs(id)
);

-- =========================================
-- TABLE alertes
-- =========================================

CREATE TABLE alertes (
  id dom_uuid NOT NULL DEFAULT uuid_generate_v4(),
  type dom_string NOT NULL,
  message dom_string NOT NULL,
  vu dom_bool NOT NULL,
  date_arrivee dom_timestamp NOT NULL,
  date_lu dom_timestamp NULL,
  user_id dom_uuid NOT NULL,

  CONSTRAINT alertes_pk001 PRIMARY KEY (id),

  CONSTRAINT alertes_fk001 FOREIGN KEY (user_id)
    REFERENCES utilisateurs(id)
);

-- =========================================
-- TABLE microcontroleurs
-- =========================================

CREATE TABLE microcontroleurs (
  id dom_uuid NOT NULL DEFAULT uuid_generate_v4(),
  nom dom_string NOT NULL,
  mac_address dom_mac_address NOT NULL,
  identifiant_user dom_string NOT NULL,
  reference dom_string NOT NULL,
  allume dom_bool NOT NULL,
  last_connexion dom_timestamp NULL,
  date_installation dom_timestamp NOT NULL,
  passkey dom_string NOT NULL,
  user_id dom_uuid,

  CONSTRAINT microcontroleurs_pk001 PRIMARY KEY (id),
  CONSTRAINT microcontroleurs_mac_unique001 UNIQUE (mac_address),
  CONSTRAINT microcontroleurs_nom_user_unique001 UNIQUE (nom, user_id),
  CONSTRAINT microcontroleurs_passkey_unique001 UNIQUE (passkey),
  CONSTRAINT microcontroleurs_identifiant_unique001 UNIQUE (identifiant_user),

  CONSTRAINT microcontroleurs_fk001 FOREIGN KEY (user_id)
    REFERENCES utilisateurs(id)
);

-- =========================================
-- TABLE grandeurs
-- =========================================

CREATE TABLE grandeurs (
  id dom_uuid NOT NULL DEFAULT uuid_generate_v4(),
  name dom_string NOT NULL,

  CONSTRAINT grandeurs_pk001 PRIMARY KEY (id)
);

-- =========================================
-- TABLE unites
-- =========================================

CREATE TABLE unites (
  id dom_uuid NOT NULL DEFAULT uuid_generate_v4(),
  name dom_string NOT NULL,
  grandeur_physique dom_uuid NOT NULL,

  CONSTRAINT unites_pk001 PRIMARY KEY (id),

  CONSTRAINT unites_fk001 FOREIGN KEY (grandeur_physique)
    REFERENCES grandeurs(id)
);

-- =========================================
-- TABLE seuils
-- =========================================

CREATE TABLE seuils (
  id dom_uuid NOT NULL DEFAULT uuid_generate_v4(),
  type_mesure dom_uuid NOT NULL,
  valeur_max dom_float NOT NULL,
  valeur_min dom_float NOT NULL,
  updated_at dom_timestamp NOT NULL,
  user_id dom_uuid NOT NULL,
  microcontroleur_id dom_uuid NOT NULL,

  CONSTRAINT seuils_pk001 PRIMARY KEY (id),

  CONSTRAINT seuils_check001 CHECK (valeur_min < valeur_max),

  CONSTRAINT seuils_fk001 FOREIGN KEY (type_mesure)
    REFERENCES grandeurs(id),

  CONSTRAINT seuils_fk002 FOREIGN KEY (user_id)
    REFERENCES utilisateurs(id),

  CONSTRAINT seuils_fk003 FOREIGN KEY (microcontroleur_id)
    REFERENCES microcontroleurs(id)
);

-- =========================================
-- TABLE actionneurs
-- =========================================

CREATE TABLE actionneurs (
  id dom_uuid NOT NULL DEFAULT uuid_generate_v4(),
  etat dom_etat NOT NULL,
  last_seen dom_timestamp NULL,
  modele dom_string NOT NULL,
  microcontroleur_id dom_uuid NOT NULL,

  CONSTRAINT actionneurs_pk001 PRIMARY KEY (id),

  CONSTRAINT actionneurs_fk001 FOREIGN KEY (microcontroleur_id)
    REFERENCES microcontroleurs(id)
);

-- =========================================
-- TABLE capteurs
-- =========================================

CREATE TABLE capteurs (
  id dom_uuid NOT NULL DEFAULT uuid_generate_v4(),
  type_mesure dom_uuid NOT NULL,
  etat dom_etat NOT NULL,
  last_seen dom_timestamp NULL,
  modele dom_string NOT NULL,
  microcontroleur_id dom_uuid NOT NULL,

  CONSTRAINT capteurs_pk001 PRIMARY KEY (id),

  CONSTRAINT capteurs_fk001 FOREIGN KEY (type_mesure)
    REFERENCES grandeurs(id),

  CONSTRAINT capteurs_fk002 FOREIGN KEY (microcontroleur_id)
    REFERENCES microcontroleurs(id)
);

-- =========================================
-- TABLE donnees
-- =========================================

CREATE TABLE donnees (
  id dom_uuid NOT NULL DEFAULT uuid_generate_v4(),
  valeur dom_float NOT NULL,
  date_arrivee dom_timestamp NOT NULL,
  capteur_id dom_uuid NOT NULL,

  CONSTRAINT donnees_pk001 PRIMARY KEY (id),

  CONSTRAINT donnees_fk001 FOREIGN KEY (capteur_id)
    REFERENCES capteurs(id)
);

-- =========================================
-- TABLE instructions
-- =========================================

CREATE TABLE instructions (
  id dom_uuid NOT NULL DEFAULT uuid_generate_v4(),
  action dom_action NOT NULL,
  duree INTEGER NULL,
  statut dom_statut_instruction NOT NULL,
  date_arrivee dom_timestamp NOT NULL,
  user_id dom_uuid NOT NULL,
  actionneur_id dom_uuid NOT NULL,

  CONSTRAINT instructions_pk001 PRIMARY KEY (id),

  CONSTRAINT instructions_fk001 FOREIGN KEY (user_id)
    REFERENCES utilisateurs(id),

  CONSTRAINT instructions_fk002 FOREIGN KEY (actionneur_id)
    REFERENCES actionneurs(id)
);

-- =========================================
-- TABLE TOKENS MICROCONTROLEURS
-- =========================================

CREATE TABLE microcontroleur_tokens (
  id dom_uuid NOT NULL DEFAULT uuid_generate_v4(),
  token dom_string NOT NULL,
  microcontroleur_id dom_uuid NOT NULL,
  created_at dom_timestamp NOT NULL,
  expires_at dom_timestamp NOT NULL,
  is_revoked dom_bool NOT NULL DEFAULT FALSE,

  CONSTRAINT micro_tokens_pk001 PRIMARY KEY (id),
  CONSTRAINT micro_tokens_unique UNIQUE (token),

  CONSTRAINT micro_tokens_fk001 FOREIGN KEY (microcontroleur_id)
    REFERENCES microcontroleurs(id)
);

-- =========================================
-- TABLE SESSIONS UTILISATEURS
-- =========================================

CREATE TABLE sessions (
  id dom_uuid NOT NULL DEFAULT uuid_generate_v4(),
  token dom_string NOT NULL,
  user_id dom_uuid NOT NULL,
  role dom_role NOT NULL,
  created_at dom_timestamp NOT NULL,
  expires_at dom_timestamp NOT NULL,
  is_revoked dom_bool NOT NULL DEFAULT FALSE,

  CONSTRAINT sessions_pk001 PRIMARY KEY (id),
  CONSTRAINT sessions_token_unique UNIQUE (token),

  CONSTRAINT sessions_fk001 FOREIGN KEY (user_id)
    REFERENCES utilisateurs(id)
);

-- =========================================
-- TABLE RESET PASSWORD (CODE 15 MIN)
-- =========================================

CREATE TABLE reset_password_codes (
  id dom_uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id dom_uuid NOT NULL,
  code dom_string NOT NULL,
  created_at dom_timestamp NOT NULL,
  expires_at dom_timestamp NOT NULL,
  is_used dom_bool NOT NULL DEFAULT FALSE,

  CONSTRAINT reset_password_pk001 PRIMARY KEY (id),

  CONSTRAINT reset_password_expiration_check
    CHECK (expires_at <= created_at + INTERVAL '15 minutes'),

  CONSTRAINT reset_password_fk001 FOREIGN KEY (user_id)
    REFERENCES utilisateurs(id)
);