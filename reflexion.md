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
