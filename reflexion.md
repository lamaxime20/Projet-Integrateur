## Logique d'authentification frontend

### Objectif

Le frontend ne doit plus manipuler le token directement. Dans le comportement cible, le backend renvoie :

```js
user = {
    id: "12345",
    email: "example@mail.com",
    name: "John Doe",
    role: "user",
    jour_expiration: 7
};
```

Le token est stocké en cookie HttpOnly côté serveur. Le frontend envoie ensuite uniquement les `credentials` à chaque requête.

### Ce qui est simulé côté frontend

Comme le backend n'existe pas encore, le frontend simule ce comportement :

1. Au login, on reçoit seulement l'objet `user`.
2. Le token n'est jamais exposé dans le `AuthContext`.
3. Une session simulée est conservée localement pour imiter un cookie HttpOnly déjà posé par le backend.
4. Chaque appel protégé doit d'abord vérifier que la session simulée existe et n'est pas expirée.

### Responsabilités

#### `vue/src/utils/user.js`

Ce fichier centralise la logique métier d'authentification :

- simulation du login
- restauration de session
- simulation du logout
- détection d'expiration
- helper pour requêtes authentifiées

#### `vue/context/AuthContext.jsx`

Le contexte :

- restaure la session au chargement
- expose `isAuthenticated`, `isLoading`, `user`, `login`, `logout`
- démarre un timer de déconnexion automatique
- nettoie la session si elle expire

### Redirection utilisateur

#### Accès à une page protégée

Si un utilisateur tente d'accéder à `/application` sans être connecté :

1. on le redirige vers `/login`
2. on mémorise la page qu'il voulait visiter
3. après connexion, on le renvoie automatiquement vers cette page

#### Cas particulier `/`

La route `/` reste publique. Si la page recherchée est `/`, aucune authentification n'est exigée.

#### Après connexion normale

Si aucune destination protégée n'était demandée avant la connexion, la redirection par défaut est :

```txt
/application
```

### Déconnexion

Si l'utilisateur se déconnecte volontairement ou si sa session expire :

1. la session locale est supprimée
2. l'état d'authentification est vidé
3. toute tentative d'accès à une route protégée renvoie vers `/login`

### Expiration simulée

Pour rendre les tests rapides côté frontend, `jour_expiration` est simulé en minutes.

Donc actuellement :

```txt
jour_expiration: 7
```

correspond à 7 minutes de session dans le frontend de test.


### Logique signup
ça va se passer avec plusieurs form,
- Le premier form aura comme champs, nom, prénom, email
Chaque champ aura une balise <p> pour afficher l'erreur
Le form aura un bouton suivant, en dessous du bouton, il y aura
une balise <p> pour afficher l'erreur global (réseau etc...)
Lorsque on clique sur le bouton suivant, celui ci appelle une fonction dans utils qui va checker avec un lien API si l'email est déjà utilisé ou pas, et si l'email n'est pas utilisé, le backend va renvoyer un code de confirmation  par email et le frontend va renvoyer vers le second form

- Le second form aura 06 champs pour entrer le code de vérification
en dessous du code, il y aura une balise <p> pour afficher l'erreur global (réseau etc...)
avec des boutons précedent et suivant
Lorsqu'on clique sur précédent, on rentre au premier form et là, si l'utilisateur ne change pas d'email et clique sur suivant, on n'envoit plus le lien API et on passe une fois à la vérification du code de vérification, si l'utilisateur change l'email ou bien, si le code de vérification expire, on rappel le lien API et il retournera un nouveau code.
Lorsque on clique sur le bouton suivant, on appelle un lien API pour vérifier le code de vérification, ensuite si c'est ok, le frontend dirige vers le troisième form.

- Le troisième form aura deux champs, un champ mot de passe et un champ de confirmation de mot de passe.
Chaque champ aura une balise <p> pour afficher l'erreur
Et en dessous, il y aura un bouton créer son compte avec une balise <p> pour afficher l'erreur global (réseau etc...)
quand on clique sur créer son compte, on appelle un lien API pour créer le compte et si tout est bon, on appelle un lien API pour login et le backend va retourner un token.
Quand on clique sur précédent, ça doit renvoyer vers le premier form et la logique d'envoi d'email doit être appliqué

- Tout le long de la création de compte, on stocke les infos que l'utilisateur remplit dans le localStorage et on efface tout dans le localStorage à la fin pour que l'utilisateur n'ait pas à recommencer à chaque fois

### Logique vérification mot de passe
Même logique que dans signup,
Un form pour l'email, dès qu'il clique sur suivant, on appelle un lien API pour vérifier l'existence de l'email, créer un code avec expiration dans 01 heure et le renvoyer
Le deuxième form sera là pour confirmer le code avec un bouton précédent et un bouton suivant
Quand on clique sur précédent, on rentre au form 1
Quand on clique sur suivant, on appelle un lien API pour vérifier le code et si tout est ok, on envoit au form 3
Le form 3 aura entrer le nouveau mot de passe, confirmer le mot de passe
Avec un bouton précédent et un bouton changer le mot de passe
Quand on clique sur précédent, on rentre au form 1
Quand on clique sur changer le mot de passe, on appelle un lien API pour changer le mot de passe et si tout est ok, on renvoit vers login
Au form 2, il y a possibilité de renvoyer le code, mais uniquement selon un timer
Lorsqu'on rentre au form 1 après l'envoit du premier code, on ne rappelle le lien API que dans deux conditions : soit, on a changé l'email, soit le code a expiré

### Flow pour la communication MQTT
Lorsqu’un microcontrôleur démarre, il effectue une requête vers une API HTTPS afin de récupérer ses informations d’authentification (token ou credentials).

Ce token n’est pas utilisé dans les messages MQTT, mais sert à s’authentifier lors de la connexion au broker MQTT :

username = token_microcontroleur
password = secret

Ainsi, chaque microcontrôleur est identifié dès la connexion, sans avoir besoin d’envoyer son token dans chaque message.

Une fois connecté au broker MQTT, le microcontrôleur publie les données de ses capteurs sur un topic structuré de manière claire et scalable :

agriculture/{device_id}/data

Exemple :

agriculture/esp32_01/data

Les données sont envoyées uniquement si une variation de ±10% est détectée, afin d’éviter de surcharger inutilement la base de données.

Contrairement à l’approche initiale, les données ne sont pas envoyées une par une, mais sous forme d’un JSON structuré :

{
  "temperature": 28,
  "humidite": 65,
  "co2": 400,
  "luminosite": 300
}

Cela permet de réduire le nombre de messages et d’optimiser les performances globales du système.

Côté backend, Laravel est abonné au topic :

agriculture/+/data

Ainsi, il reçoit automatiquement toutes les données envoyées par les microcontrôleurs.

L’identification du microcontrôleur ne se fait plus via un token dans le message, mais via :

soit le client ID MQTT
soit le username utilisé lors de la connexion

Laravel stocke ensuite les données dans la base de données.

Lorsque l’utilisateur définit de nouveaux seuils, le backend les publie sur un topic dédié :

agriculture/{device_id}/seuils

Exemple :

agriculture/esp32_01/seuils

Le microcontrôleur ne vient pas “chercher” ces données, mais s’abonne à ce topic :

client.subscribe("agriculture/esp32_01/seuils");

Ainsi, dès qu’un nouveau seuil est publié, il est reçu automatiquement.

👉 Ces messages sont envoyés avec l’option retain = true, ce qui permet au microcontrôleur de récupérer immédiatement les derniers seuils même après un redémarrage.

Le même principe est utilisé pour les instructions :

agriculture/{device_id}/instructions

Exemple :

allumer pompe
activer ventilateur
allumer lumière
⚙️ Paramètres importants ajoutés
QoS 1 → pour garantir la réception des données importantes
QoS 0 → pour les données fréquentes

Le microcontrôleur doit également gérer :

la reconnexion automatique au broker
un buffer local en cas de perte de connexion

Lors de sa première connexion au backend, le microcontrolleur doit envoyer (identifiant_user) pour recevoir son token

Pour chaque capteur, on lit sa mesure 05 fois et on fait une moyenne afin que les bruits ne soient pas trop importants

On publie les données si et seulement si la valeur d'un capteur a augmenté ou diminué de 10% par rapport à la dernière mesure