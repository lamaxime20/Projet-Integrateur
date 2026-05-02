-- ==========================================================
-- Insertion des données de base (Grandeurs et Unités)
-- Basé sur Code.ino et reflexion.md
-- ==========================================================

-- 1. Insertion des Grandeurs Physiques
INSERT INTO grandeurs (name) VALUES ('Température de l''air');
INSERT INTO grandeurs (name) VALUES ('Humidité de l''air');
INSERT INTO grandeurs (name) VALUES ('Humidité du sol');
INSERT INTO grandeurs (name) VALUES ('Luminosité');
INSERT INTO grandeurs (name) VALUES ('Qualité de l''air');
INSERT INTO grandeurs (name) VALUES ('Niveau d''eau');

-- 2. Insertion des Unités associées
-- Note : On utilise des sous-requêtes pour lier dynamiquement aux IDs générés

INSERT INTO unites (name, grandeur_physique) VALUES ('°C', (SELECT id FROM grandeurs WHERE name = 'Température de l''air'));
INSERT INTO unites (name, grandeur_physique) VALUES ('%', (SELECT id FROM grandeurs WHERE name = 'Humidité de l''air'));
INSERT INTO unites (name, grandeur_physique) VALUES ('%', (SELECT id FROM grandeurs WHERE name = 'Humidité du sol'));
INSERT INTO unites (name, grandeur_physique) VALUES ('%', (SELECT id FROM grandeurs WHERE name = 'Luminosité'));
INSERT INTO unites (name, grandeur_physique) VALUES ('%', (SELECT id FROM grandeurs WHERE name = 'Qualité de l''air'));
INSERT INTO unites (name, grandeur_physique) VALUES ('État', (SELECT id FROM grandeurs WHERE name = 'Niveau d''eau'));