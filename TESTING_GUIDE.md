# Guide de Test - Plateforme E-Learning

Ce document fournit des instructions détaillées pour tester toutes les fonctionnalités de la plateforme e-learning.

## Prérequis

Avant de commencer les tests, assurez-vous que:
1. Keycloak est démarré et configuré (voir KEYCLOAK_SETUP.md)
2. Le backend Spring Boot est en cours d'exécution sur le port 8080
3. Le frontend React est en cours d'exécution sur le port 3000

## Vérification de l'état des services

```bash
# Vérifier Keycloak
curl http://localhost:8180/realms/elearning-realm/.well-known/openid-configuration

# Vérifier Backend (devrait retourner 401 sans token)
curl http://localhost:8080/courses

# Vérifier Frontend
curl http://localhost:3000
```

## Tests de l'Interface Utilisateur

### Test 1: Connexion en tant qu'Étudiant

1. Ouvrir `http://localhost:3000` dans le navigateur
2. Vous serez redirigé vers Keycloak
3. Se connecter avec:
   - Username: `user1`
   - Password: `user1`
4. **Résultat attendu:**
   - Redirection vers l'application
   - Affichage du profil utilisateur avec:
     - Username: user1
     - Name: John Student
     - Email: user1@elearning.com
     - Roles: STUDENT

### Test 2: Consultation des Cours (Étudiant)

1. Connecté en tant que `user1`
2. Onglet "Available Courses" doit être visible
3. Onglet "Course Management" ne doit PAS être visible
4. **Résultat attendu:**
   - Liste de 4 cours s'affiche:
     - Introduction to Spring Boot
     - React for Beginners
     - OAuth2 and OpenID Connect
     - Microservices Architecture

### Test 3: Déconnexion

1. Cliquer sur le bouton "Logout"
2. **Résultat attendu:**
   - Redirection vers Keycloak
   - Déconnexion réussie
   - Retour à la page de login

### Test 4: Connexion en tant qu'Administrateur

1. Ouvrir `http://localhost:3000`
2. Se connecter avec:
   - Username: `admin1`
   - Password: `admin1`
3. **Résultat attendu:**
   - Affichage du profil avec:
     - Username: admin1
     - Name: Alice Admin
     - Email: admin1@elearning.com
     - Roles: ADMIN

### Test 5: Gestion des Cours (Administrateur)

1. Connecté en tant que `admin1`
2. Les deux onglets doivent être visibles:
   - Available Courses
   - Course Management
3. Cliquer sur "Course Management"
4. Remplir le formulaire:
   - Title: "Test Course"
   - Description: "This is a test course"
   - Instructor: "Test Instructor"
   - Duration: 15
5. Cliquer sur "Create Course"
6. **Résultat attendu:**
   - Message de succès "Course created successfully!"
   - Formulaire réinitialisé
7. Retourner à l'onglet "Available Courses"
8. **Résultat attendu:**
   - Le nouveau cours "Test Course" apparaît dans la liste

## Tests API avec Postman

### Configuration Postman

1. Créer une nouvelle collection "E-Learning API Tests"
2. Créer une variable d'environnement `access_token`

### Test API 1: Obtenir un Token (Étudiant)

**Request:**
- Method: POST
- URL: `http://localhost:8180/realms/elearning-realm/protocol/openid-connect/token`
- Headers:
  - Content-Type: application/x-www-form-urlencoded
- Body (x-www-form-urlencoded):
  - client_id: `react-client`
  - username: `user1`
  - password: `user1`
  - grant_type: `password`

**Résultat attendu:**
- Status: 200 OK
- Body contient:
  - access_token
  - refresh_token
  - expires_in: 300
  - token_type: Bearer

**Post-test script (Postman):**
```javascript
var jsonData = pm.response.json();
pm.environment.set("access_token", jsonData.access_token);
```

### Test API 2: GET /courses (Étudiant)

**Request:**
- Method: GET
- URL: `http://localhost:8080/courses`
- Headers:
  - Authorization: `Bearer {{access_token}}`

**Résultat attendu:**
- Status: 200 OK
- Body: Array de cours
```json
[
  {
    "id": 1,
    "title": "Introduction to Spring Boot",
    "description": "Learn the basics of Spring Boot framework",
    "instructor": "John Doe",
    "duration": 20
  },
  ...
]
```

### Test API 3: POST /courses (Étudiant - Doit échouer)

**Request:**
- Method: POST
- URL: `http://localhost:8080/courses`
- Headers:
  - Authorization: `Bearer {{access_token}}`
  - Content-Type: `application/json`
- Body:
```json
{
  "title": "Unauthorized Course",
  "description": "This should fail",
  "instructor": "Test",
  "duration": 10
}
```

**Résultat attendu:**
- Status: 403 Forbidden
- Message: Accès interdit (rôle insuffisant)

### Test API 4: GET /me (Étudiant)

**Request:**
- Method: GET
- URL: `http://localhost:8080/me`
- Headers:
  - Authorization: `Bearer {{access_token}}`

**Résultat attendu:**
- Status: 200 OK
- Body contient les informations utilisateur:
```json
{
  "sub": "...",
  "email": "user1@elearning.com",
  "name": "John Student",
  "preferred_username": "user1",
  "given_name": "John",
  "family_name": "Student",
  "roles": ["STUDENT"]
}
```

### Test API 5: Obtenir un Token (Administrateur)

**Request:**
- Method: POST
- URL: `http://localhost:8180/realms/elearning-realm/protocol/openid-connect/token`
- Body (x-www-form-urlencoded):
  - client_id: `react-client`
  - username: `admin1`
  - password: `admin1`
  - grant_type: `password`

**Résultat attendu:**
- Status: 200 OK
- Nouveau access_token avec rôle ADMIN

### Test API 6: POST /courses (Administrateur - Doit réussir)

**Request:**
- Method: POST
- URL: `http://localhost:8080/courses`
- Headers:
  - Authorization: `Bearer {{access_token}}` (token admin)
  - Content-Type: `application/json`
- Body:
```json
{
  "title": "Advanced Keycloak",
  "description": "Deep dive into Keycloak configuration",
  "instructor": "Security Expert",
  "duration": 25
}
```

**Résultat attendu:**
- Status: 201 Created
- Body: Le cours créé avec ID généré
```json
{
  "id": 5,
  "title": "Advanced Keycloak",
  "description": "Deep dive into Keycloak configuration",
  "instructor": "Security Expert",
  "duration": 25
}
```

### Test API 7: GET /me (Administrateur)

**Request:**
- Method: GET
- URL: `http://localhost:8080/me`
- Headers:
  - Authorization: `Bearer {{access_token}}` (token admin)

**Résultat attendu:**
- Status: 200 OK
- Roles contient "ADMIN"
```json
{
  "sub": "...",
  "email": "admin1@elearning.com",
  "name": "Alice Admin",
  "preferred_username": "admin1",
  "given_name": "Alice",
  "family_name": "Admin",
  "roles": ["ADMIN"]
}
```

## Tests de Sécurité

### Test Sécurité 1: Accès sans Token

**Request:**
- Method: GET
- URL: `http://localhost:8080/courses`
- Headers: (AUCUN header Authorization)

**Résultat attendu:**
- Status: 401 Unauthorized

### Test Sécurité 2: Token Invalide

**Request:**
- Method: GET
- URL: `http://localhost:8080/courses`
- Headers:
  - Authorization: `Bearer invalid_token_12345`

**Résultat attendu:**
- Status: 401 Unauthorized

### Test Sécurité 3: Token Expiré

1. Obtenir un token
2. Attendre 6 minutes (expiration par défaut: 5 minutes)
3. Utiliser le token expiré

**Résultat attendu:**
- Status: 401 Unauthorized
- L'application frontend devrait automatiquement rafraîchir le token

### Test Sécurité 4: Vérification CORS

**Request depuis un autre domaine:**
```javascript
// À tester depuis la console du navigateur sur un autre site
fetch('http://localhost:8080/courses', {
  headers: {
    'Authorization': 'Bearer <token>'
  }
})
```

**Résultat attendu:**
- Si l'origine n'est pas `http://localhost:3000`: Erreur CORS

## Tests de Gestion des Erreurs (Frontend)

### Test Erreur 1: Backend Non Disponible

1. Arrêter le backend Spring Boot
2. Se connecter au frontend
3. Essayer d'accéder aux cours

**Résultat attendu:**
- Message d'erreur: "Failed to load courses"

### Test Erreur 2: Keycloak Non Disponible

1. Arrêter Keycloak
2. Ouvrir `http://localhost:3000`

**Résultat attendu:**
- Erreur de connexion
- Impossible de se connecter

## Checklist des Tests

- [ ] Connexion Étudiant réussie
- [ ] Consultation cours (Étudiant)
- [ ] Déconnexion
- [ ] Connexion Admin réussie
- [ ] Création de cours (Admin)
- [ ] GET /courses avec token étudiant (200)
- [ ] POST /courses avec token étudiant (403)
- [ ] POST /courses avec token admin (201)
- [ ] GET /me pour les deux utilisateurs
- [ ] Accès sans token (401)
- [ ] Token invalide (401)
- [ ] CORS depuis autre origine (bloqué)
- [ ] Refresh automatique du token
- [ ] Gestion erreur backend indisponible

## Vérification du Token JWT

Pour inspecter le contenu d'un token JWT:

1. Copier l'access_token
2. Aller sur https://jwt.io
3. Coller le token
4. Vérifier les claims:
   - `iss`: doit être `http://localhost:8180/realms/elearning-realm`
   - `realm_access.roles`: doit contenir `STUDENT` ou `ADMIN`
   - `preferred_username`: nom d'utilisateur
   - `email`, `name`, etc.

## Captures d'écran à Réaliser

Pour le rapport, capturer:

1. **Keycloak Login Page**: Page de connexion Keycloak
2. **Student View**: Interface complète en tant qu'étudiant
3. **Student Profile**: Profil avec rôle STUDENT
4. **Course List**: Liste des cours disponibles
5. **Admin View**: Interface avec les deux onglets (admin)
6. **Admin Profile**: Profil avec rôle ADMIN
7. **Course Creation Form**: Formulaire de création de cours
8. **Success Message**: Message après création d'un cours
9. **Postman GET Success**: Requête GET réussie
10. **Postman POST Forbidden**: Requête POST interdite (étudiant)
11. **Postman POST Success**: Requête POST réussie (admin)
12. **JWT Token**: Token décodé sur jwt.io

## Résolution de Problèmes

### Problème: Les rôles ne sont pas dans le token
- Vérifier que les rôles sont assignés dans Keycloak
- Vérifier la configuration du client
- Vérifier que le mapper "realm roles" est activé

### Problème: CORS errors
- Vérifier que CORS est configuré dans SecurityConfig
- Vérifier que l'origine est exactement `http://localhost:3000`

### Problème: 401 avec token valide
- Vérifier que l'issuer-uri est correct dans application.yml
- Vérifier que Keycloak est accessible depuis le backend
- Vérifier les logs Spring Security (DEBUG level)
