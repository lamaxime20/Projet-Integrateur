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

Si la valeur d'un capteur n'a pas varié de 10%, tu ne publies pas la valeur de ce capteur lors du publish des valeurs

Si un capteur est défaillant ou éteint, tu publies 0 comme ses valeurs

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

luminuosité < seuil_min -> ampoule OFF
luminuosite > seuil_max -> ampoule ON
temperature > seuil_max -> ventilateur ON
temperature < seuil_min -> ventilateur OFF
Humidite_sol > seuil_max -> pompe OFF
Humidite_sol < seuil_min -> pompe ON
niveau_eau = LOW -> pompe OFF
int eau_brut = analogRead(WATER_PIN); 

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

### Constitution des rapports
Lis @AGENTS.md  et suis ses instructions pour cette session


Je veux que tu fasse la page @vue/src/components/application/statistiques.jsx 
Elle aura trois sections
La première section est celle du microcontroleur, où il y aura
- Un graphe indiquant les heures où celui ci était actif, et les heures où il était inactif 
- Des champs pour indiquer la période de mesure du graphe, l'état que le graphes doit principalement afficher (Fais des check box avec les états Allumé, éteint comme ça il peut soit afficher soit l'un, soit l'autre, ou les deux) et un bouton générer rapport qui va générer un rapport soit .csv soit .pdf
Le rapport .csv doit indiquer pour chaque date l'enchainement des états du microcontroleurs avec les périodes que chaque état a occupé (Allumé de xh à yh puis éteint de yh à  zh puis allumé de zh à ah)
Le rapport .pdf doit avoir le graphe que le frontend montre actuellement, puis en dessous, le tableau que le .csv devrait présenter 

La génération d'un rapport se fait uniquement par le backend, qui l'envoit au frontend par appel API


### Explication de la mise en place du temps réel côté React
À chaque fois que j’ai besoin d’une donnée en temps réel, je mets en place un mécanisme en deux étapes :

Initialisation via API
Je crée un endpoint API qui retourne la dernière valeur de la donnée stockée en base.
Lorsque le composant se charge, il appelle une fonction externe en lui passant setDonnee.
Cette fonction commence par appeler l’API pour récupérer la valeur actuelle et initialise le state avec setDonnee.
Mise à jour en temps réel via WebSocket
Après l’initialisation, cette même fonction s’abonne à un event WebSocket envoyé par le backend (Laravel) pour cette donnée précise.
À chaque fois que cet event est déclenché (par exemple NouvelleHumidite), le callback met à jour automatiquement la donnée dans le state via setDonnee.
Gestion du cycle de vie (point crucial)
La fonction retourne une fonction de nettoyage (cleanup) qui permet de se désabonner du listener WebSocket lorsque le composant est démonté.
Cela évite :
les abonnements multiples
les mises à jour en double
les fuites mémoire
Utilisation côté composant
Le composant appelle cette fonction dans un useEffect avec un tableau de dépendances vide ([]) pour garantir que :
l’appel API ne se fait qu’une seule fois au montage
l’abonnement WebSocket est proprement enregistré
le cleanup est exécuté automatiquement au démontage

exemple de fonction JS
export function subscribeDonnee(setDonnee) {
    // 1. INIT API
    fetch("/api/donnee/latest")
        .then(res => res.json())
        .then(data => setDonnee(data.valeur));

    // 2. WebSocket
    const channel = echo.channel("capteurs");

    const callback = (e) => {
        setDonnee(e.valeur);
    };

    channel.listen("NouvelleDonnee", callback);

    // 3. CLEANUP (CRUCIAL)
    return () => {
        channel.stopListening("NouvelleDonnee", callback);
    };
}

exemple de useEffect
useEffect(() => {
    const unsubscribe = subscribeDonnee(setDonnee);

    return () => {
        unsubscribe(); // 🔥 nettoyage
    };
}, []);


### Explication de la mise en place du temps réel côté backend
✅ Version corrigée et améliorée
🔥 Fonctionnement côté Laravel

Lorsqu’une nouvelle donnée est envoyée par le microcontrôleur via MQTT :

Réception de la donnée
Laravel est abonné à un topic MQTT (ex: capteurs/humidite).
Quand une nouvelle donnée arrive, elle est récupérée par le backend.
Traitement et stockage
Laravel analyse la donnée reçue puis l’enregistre dans la base de données (historisation).
Cela permet :
de garder un historique pour les graphes 📊
de faire des analyses ou déclencher des règles
Déclenchement d’un événement WebSocket
Après l’enregistrement, Laravel déclenche un event broadcasté (WebSocket) vers le frontend.

👉 Exemple :

NouvelleHumidite
NouvelleTemperature
AlerteCritique

Chaque event contient :

la valeur
le timestamp
éventuellement d’autres infos utiles
Envoi en temps réel vers React
Grâce au système de broadcast (via Laravel WebSockets), cet événement est envoyé instantanément aux clients connectés.



### Explication globale de la mise en place du temps réel
🔥 1. Principe global

👉 Chaque microcontrôleur a son propre “canal” :

capteurs.{microcontroleur_id}

👉 Exemple :

capteurs.1
capteurs.2
🧠 2. Flux complet (très important)
ESP32 → MQTT → Laravel → Base de données → Event → Channel capteurs.X → React
⚙️ 3. Côté Laravel
🧩 Étape 1 — Tu reçois la donnée (MQTT)

Exemple :

$microId = 12;
$humidite = 45;
🧩 Étape 2 — Tu stockes
Mesure::create([
    'microcontroleur_id' => $microId,
    'humidite' => $humidite
]);
🧩 Étape 3 — Tu broadcast
broadcast(new NouvelleHumidite($microId, $humidite));
🧩 Étape 4 — Event
class NouvelleHumidite implements ShouldBroadcast
{
    public $valeur;
    public $microId;

    public function __construct($microId, $valeur)
    {
        $this->microId = $microId;
        $this->valeur = $valeur;
    }

    public function broadcastOn()
    {
        return ['capteurs.' . $this->microId];
    }
}
🔐 4. Sécurité (OBLIGATOIRE)

Dans routes/channels.php :

Broadcast::channel('capteurs.{id}', function ($user, $id) {
    return $user->microcontroleurs->contains($id);
});

👉 Traduction :

✔️ l’utilisateur peut écouter SI le microcontrôleur lui appartient
❌ sinon → refus

⚛️ 5. Côté React
🧩 Connexion au bon channel
const microId = 12;

echo.private(`capteurs.${microId}`)
    .listen("NouvelleHumidite", (e) => {
        setHumidite(e.valeur);
    });
🔁 6. Avec ton système API + WebSocket
useEffect(() => {
    // 1. INIT
    fetch(`/api/humidite/latest/${microId}`)
        .then(res => res.json())
        .then(data => setHumidite(data.valeur));

    // 2. REALTIME
    const channel = echo.private(`capteurs.${microId}`);

    channel.listen("NouvelleHumidite", (e) => {
        setHumidite(e.valeur);
    });

    return () => {
        channel.stopListening("NouvelleHumidite");
    };
}, [microId]);
💥 7. Ce que ça permet
✔️ Multi utilisateurs
User A → micro 1
User B → micro 2

👉 chacun reçoit seulement ses données

✔️ Multi capteurs par user
microIds.forEach(id => {
    echo.private(`capteurs.${id}`)
});


### Gestion des instructions par le microcontroleur
Tu vas abonner le microcontrôleur au topic agriculture/nom_device/instructions Quand Laravel va publier une instruction, elle aura action : allumer/eteindre/redemarrer duree : en secondes actionneur : pompe/ampoule/ventilateur/porte id_instructiom Quand Laravel va publier une instruction, elle aura action : allumer/eteindre/redemarrer duree : en secondes actionneur : pompe/ampoule/ventilateur/porte Quand une instruction arrive, on identifie l'action Si l'action est égale à redemarrer, alors on redemarre simplement le microcontrôleur Sinon, on passe à la deuxième étape On identifie l'actionneur concerné. Dès qu'on connait l'actionneur concerné, interrompt son fonctionnement normal et on exécute l'action durant le nombre de secondes donné Maintenant, si lors de l'execution d'une instruction par un actionneur, une autre instruction concernant le même actionneur arrive on arrête l'instruction précedente, on envoit au backend que l'instruction d'id id a été interrompu, puis on lance la nouvelle instruction


### Gestion des états des capteurs et actionneurs
le microcontroleur doit détecter si un capteur/un actionneur est allumé, éteint, ou défaillant (absent ou ne marche pas) et publish A chaque loop, il vérifie l'état de chaque capteur/actionneur, si l'état d'un change, il envoit un JSON indiquant le capteur/l'actionneur et le nouvel état

### Mécanisme de surveillance de l'état (LWT & Retain)

Pour que le backend Laravel et l'interface React sachent en temps réel si le microcontrôleur est allumé ou éteint, nous utilisons une combinaison de deux fonctionnalités MQTT :

#### 1. Last Will and Testament (LWT)
Lors de la phase de connexion au broker, l'ESP32 définit un "testament". C'est un message que le broker doit publier automatiquement si la connexion avec l'ESP32 est rompue de manière inattendue (panne de courant, perte de Wi-Fi, crash).
- **Topic :** `agriculture/{device_id}/availability`
- **Message :** `offline`
- **QoS :** 1 (pour garantir la livraison)
- **Retain :** true

#### 2. Message de présence (Retained Online)
Dès que la connexion est établie avec succès, l'ESP32 publie lui-même un message sur le même topic.
- **Topic :** `agriculture/{device_id}/availability`
- **Message :** `online`
- **Retain :** true

#### 3. Pourquoi le flag "Retain" ?
Le flag `retain = true` indique au broker de garder en mémoire le dernier message reçu sur ce topic. 
- **Avantage pour React :** Lorsqu'un utilisateur ouvre son dashboard, React s'abonne au topic de disponibilité. Grâce au flag Retain, le broker envoie immédiatement le dernier état connu (online ou offline) sans attendre que l'ESP32 n'envoie un nouveau message.
- **Avantage pour Laravel :** Si le backend redémarre, il récupère instantanément l'état de tous les microcontrôleurs du parc.

#### 4. Flux de détection côté Backend
1. Le broker détecte la perte du signal "KeepAlive" de l'ESP32.
2. Le broker publie `offline` sur le topic `availability`.
3. Laravel, abonné à ce topic, reçoit le message.
4. Laravel met à jour la base de données (champ `is_active` ou `last_seen`).
5. Laravel broadcast un événement WebSocket vers React pour mettre à jour l'interface (ex: passage d'une icône au rouge).

Ce mécanisme est bien plus efficace qu'un système de "ping" manuel car il ne consomme aucune bande passante supplémentaire et repose sur la détection native du protocole MQTT.*


### Structure du Dashboard
1. Surveillance en temps réel (Le Cœur du Système)
C'est ici que l'utilisateur voit l'état de santé immédiat de son exploitation.

KPI Circulaires (Grandeurs Physiques) : Des indicateurs visuels pour l'Humidité du sol (%), la Température (°C), le Taux de CO2 (ppm) et la Luminosité (lux).
Indicateur de Disponibilité : Un badge dynamique indiquant si le microcontrôleur est "En ligne" ou "Hors ligne" (utilisant le mécanisme LWT/Retain que tu as défini).
Niveau de Réservoir : Une jauge visuelle pour le capteur de niveau d'eau, essentielle pour l'irrigation.
2. Contrôle et Automatisation (Actionneurs)
Cette section permet de passer de la lecture à l'action.

État des Actionneurs : Des cartes affichant le statut actuel (Allumé/Éteint) de la pompe, du ventilateur et de l'éclairage.
Commandes Manuelles : Des boutons permettant d'envoyer des instructions immédiates (ex: "Allumer pompe pendant 60s") via MQTT.
3. Analyses et Rapports (Statistiques)
Pour aider l'agriculteur à prendre des décisions basées sur les données.

Graphe de Courbe Interactif : Visualisation de l'évolution des mesures (température, humidité_sol, lumiere, taux co2) sur les dernières 24h ou la semaine.
Graphe d'Activité du Microcontrôleur : Un graphique dédié indiquant les périodes d'activité/inactivité du système.
Générateur de Rapports : Un module pour exporter les données en PDF (avec graphes) ou CSV (historique brut des états) pour une analyse externe.
4. Alertes et Historique
Pour la traçabilité et la réactivité.

Centre de Notifications : Un flux d'alertes en temps réel (ex: "Alerte : Température trop élevée !").
Journal des Événements : Un tableau filtrable listant toutes les actions passées (ex: "Pompe activée automatiquement à 14:02").
5. Expérience Utilisateur (UI/UX)
Design Responsive : Une interface qui s'adapte parfaitement au mobile (pour l'agriculteur sur le terrain) et au desktop (pour l'analyse au bureau).
Branding Nature/Tech : Utilisation de ta palette (Vert #2E7D32 pour la nature, Bleu #0288D1 pour l'IoT) pour renforcer la confiance.