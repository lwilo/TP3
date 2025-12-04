# TP3: Sécurisation d'une Application E-Learning avec OAuth2/OpenID Connect

## Architecture du Projet

Ce projet implémente une plateforme e-learning sécurisée utilisant OAuth2 et OpenID Connect (OIDC) avec l'architecture suivante:

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│                 │         │                  │         │                 │
│  React Frontend │◄────────┤  Keycloak        │────────►│  Spring Boot    │
│  (Port 3000)    │  OIDC   │  Identity Server │   JWT   │  Backend        │
│                 │  Flow   │  (Port 8180)     │  Verify │  (Port 8080)    │
│                 │         │                  │         │                 │
└─────────────────┘         └──────────────────┘         └─────────────────┘
       │                            ▲                            │
       │                            │                            │
       └────────────────────────────┴────────────────────────────┘
              Token Management & Secure API Communication
```

## Fonctionnalités

### Authentification et Autorisation
- **Single Sign-On (SSO)** via Keycloak
- **OAuth2 / OpenID Connect** pour l'authentification
- **JWT (JSON Web Tokens)** pour la sécurisation des APIs
- **Gestion des rôles**: STUDENT et ADMIN

### Contrôle d'accès basé sur les rôles
- **STUDENT**: Peut consulter la liste des cours disponibles
- **ADMIN**: Peut consulter ET créer de nouveaux cours

## Structure du Projet

```
TP3/
├── backend/                    # Spring Boot Backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/elearning/
│   │   │   │   ├── config/
│   │   │   │   │   ├── SecurityConfig.java
│   │   │   │   │   └── DataInitializer.java
│   │   │   │   ├── controller/
│   │   │   │   │   ├── CourseController.java
│   │   │   │   │   └── UserController.java
│   │   │   │   ├── model/
│   │   │   │   │   └── Course.java
│   │   │   │   ├── repository/
│   │   │   │   │   └── CourseRepository.java
│   │   │   │   ├── security/
│   │   │   │   │   └── KeycloakRoleConverter.java
│   │   │   │   └── ElearningApplication.java
│   │   │   └── resources/
│   │   │       └── application.yml
│   │   └── test/
│   └── pom.xml
│
├── frontend/                   # React Frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── CourseList.js
│   │   │   ├── CourseList.css
│   │   │   ├── CourseManagement.js
│   │   │   ├── CourseManagement.css
│   │   │   ├── UserProfile.js
│   │   │   └── UserProfile.css
│   │   ├── services/
│   │   │   └── apiService.js
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   ├── index.css
│   │   └── keycloak.js
│   └── package.json
│
├── docker-compose.yml          # Keycloak Docker configuration
├── KEYCLOAK_SETUP.md          # Keycloak configuration guide
└── README.md                   # This file
```

## Installation et Configuration

### Prérequis

- Java 17+
- Node.js 16+
- Maven 3.6+
- Docker et Docker Compose

### Étape 1: Configuration de Keycloak

1. Démarrer Keycloak avec Docker:
```bash
docker-compose up -d
```

2. Suivre les instructions détaillées dans [KEYCLOAK_SETUP.md](./KEYCLOAK_SETUP.md) pour:
   - Créer le realm `elearning-realm`
   - Configurer le client `react-client`
   - Créer les rôles `ADMIN` et `STUDENT`
   - Créer les utilisateurs `user1` (STUDENT) et `admin1` (ADMIN)

### Étape 2: Démarrage du Backend Spring Boot

1. Naviguer vers le dossier backend:
```bash
cd backend
```

2. Compiler et démarrer l'application:
```bash
mvn clean install
mvn spring-boot:run
```

Le backend sera accessible sur `http://localhost:8080`

### Étape 3: Démarrage du Frontend React

1. Naviguer vers le dossier frontend:
```bash
cd frontend
```

2. Installer les dépendances:
```bash
npm install
```

3. Démarrer l'application:
```bash
npm start
```

Le frontend sera accessible sur `http://localhost:3000`

## Utilisation

### Connexion

1. Ouvrir `http://localhost:3000` dans votre navigateur
2. Vous serez automatiquement redirigé vers la page de connexion Keycloak
3. Utiliser l'un des comptes suivants:

**Compte Étudiant:**
- Username: `user1`
- Password: `user1`
- Rôle: STUDENT

**Compte Administrateur:**
- Username: `admin1`
- Password: `admin1`
- Rôle: ADMIN

### Fonctionnalités par Rôle

#### En tant que STUDENT (user1)
- ✅ Voir le profil utilisateur
- ✅ Consulter la liste des cours disponibles
- ❌ Créer de nouveaux cours (accès interdit)

#### En tant que ADMIN (admin1)
- ✅ Voir le profil utilisateur
- ✅ Consulter la liste des cours disponibles
- ✅ Créer de nouveaux cours via l'interface de gestion

## Endpoints API

### Backend Spring Boot

| Endpoint | Méthode | Rôle requis | Description |
|----------|---------|-------------|-------------|
| `/courses` | GET | STUDENT, ADMIN | Liste tous les cours |
| `/courses` | POST | ADMIN | Créer un nouveau cours |
| `/courses/{id}` | GET | STUDENT, ADMIN | Obtenir un cours par ID |
| `/me` | GET | Authentifié | Informations de l'utilisateur et rôles |

### Keycloak

| Endpoint | Description |
|----------|-------------|
| `/realms/elearning-realm/protocol/openid-connect/auth` | Authentification |
| `/realms/elearning-realm/protocol/openid-connect/token` | Obtention de tokens |
| `/realms/elearning-realm/protocol/openid-connect/userinfo` | Informations utilisateur |
| `/realms/elearning-realm/protocol/openid-connect/logout` | Déconnexion |

## Test avec Postman

### 1. Obtenir un Access Token

**Endpoint:** `POST http://localhost:8180/realms/elearning-realm/protocol/openid-connect/token`

**Body (x-www-form-urlencoded):**
```
client_id: react-client
username: user1  (ou admin1)
password: user1  (ou admin1)
grant_type: password
```

**Réponse:**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI...",
  "expires_in": 300,
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI...",
  "token_type": "Bearer"
}
```

### 2. Tester l'accès aux cours (GET)

**Endpoint:** `GET http://localhost:8080/courses`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Résultat attendu:**
- ✅ user1 (STUDENT): Status 200, liste des cours
- ✅ admin1 (ADMIN): Status 200, liste des cours

### 3. Tester la création de cours (POST)

**Endpoint:** `POST http://localhost:8080/courses`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body:**
```json
{
  "title": "New Course",
  "description": "Course description",
  "instructor": "Test Instructor",
  "duration": 10
}
```

**Résultat attendu:**
- ❌ user1 (STUDENT): Status 403 Forbidden
- ✅ admin1 (ADMIN): Status 201 Created

### 4. Obtenir les informations utilisateur

**Endpoint:** `GET http://localhost:8080/me`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Résultat attendu:**
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

## Gestion des Erreurs

### Frontend
- **401 Unauthorized**: Token invalide ou expiré → Redirection vers login
- **403 Forbidden**: Rôle insuffisant → Message d'erreur approprié
- **Network Error**: Backend non disponible → Message d'erreur

### Backend
- Validation JWT automatique via Spring Security
- Vérification des rôles avec `@PreAuthorize`
- CORS configuré pour accepter les requêtes depuis `http://localhost:3000`

## Sécurité

### Mécanismes de sécurité implémentés

1. **Authentification OAuth2/OIDC**
   - Standard Flow pour l'authentification
   - Tokens JWT signés et vérifiés

2. **Validation JWT côté Backend**
   - Vérification de la signature avec JWKS
   - Validation de l'issuer Keycloak
   - Extraction automatique des rôles

3. **Contrôle d'accès basé sur les rôles**
   - Annotations `@PreAuthorize` sur les endpoints
   - Vérification côté frontend pour l'UI

4. **Token Refresh automatique**
   - Rafraîchissement toutes les minutes
   - Reconnexion automatique si le refresh échoue

5. **CORS configuré**
   - Accepte uniquement `http://localhost:3000`
   - Credentials autorisés

## Captures d'écran

Pour le rapport (PARTIE 5), capturer:

1. **Connexion réussie**: Page d'accueil après login
2. **Profil utilisateur**: Informations affichées (nom, email, rôles)
3. **Liste des cours**: Vue STUDENT avec cours disponibles
4. **Interface Admin**: Formulaire de création de cours (ADMIN uniquement)
5. **Postman - GET courses**: Token STUDENT - Succès (200)
6. **Postman - POST course**: Token STUDENT - Échec (403)
7. **Postman - POST course**: Token ADMIN - Succès (201)

## Développement

### Backend - Ajouter un nouveau endpoint

1. Créer le controller dans `controller/`
2. Ajouter les annotations de sécurité `@PreAuthorize`
3. Tester avec Postman

### Frontend - Ajouter un composant

1. Créer le composant dans `components/`
2. Ajouter les styles CSS associés
3. Intégrer dans `App.js`

## Troubleshooting

### Le frontend ne se connecte pas à Keycloak
- Vérifier que Keycloak est démarré sur le port 8180
- Vérifier la configuration dans `frontend/src/keycloak.js`
- Vérifier les redirect URIs dans Keycloak

### Le backend refuse les requêtes avec 401
- Vérifier que le token est valide (jwt.io)
- Vérifier l'issuer-uri dans `application.yml`
- Vérifier que Keycloak est accessible depuis le backend

### Les rôles ne sont pas extraits
- Vérifier que les rôles sont assignés dans Keycloak
- Vérifier le KeycloakRoleConverter
- Utiliser `/me` pour voir les claims du token

## Technologies Utilisées

### Backend
- Spring Boot 3.2.0
- Spring Security
- OAuth2 Resource Server
- Spring Data JPA
- H2 Database

### Frontend
- React 18.2.0
- Keycloak-js 23.0.0
- Axios 1.6.0

### Infrastructure
- Keycloak 23.0.0 (Docker)
- Java 17
- Node.js 16+

## Auteur

Projet réalisé dans le cadre du TP3 - Sécurisation d'applications avec OAuth2/OIDC

## License

Ce projet est à des fins éducatives uniquement.