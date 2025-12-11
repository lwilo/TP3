# Architecture Diagram - E-Learning Platform

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           E-Learning Platform                                │
│                     OAuth2 / OpenID Connect Architecture                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────┐          ┌──────────────────────┐
│                       │          │                      │
│   Browser Client      │          │   Keycloak Server    │
│   (User Agent)        │          │   Identity Provider  │
│                       │          │   (IdP)              │
└───────────┬───────────┘          └──────────┬───────────┘
            │                                 │
            │  1. User navigates to app       │
            │─────────────────────────────────▶
            │                                 │
            │  2. Redirect to login           │
            │◀─────────────────────────────────
            │                                 │
            │  3. User enters credentials     │
            │─────────────────────────────────▶
            │                                 │
            │  4. Authorization Code          │
            │◀─────────────────────────────────
            │                                 │
            │  5. Exchange code for tokens    │
            │─────────────────────────────────▶
            │                                 │
            │  6. ID Token + Access Token     │
            │◀─────────────────────────────────
            │                                 │
            ▼                                 │
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│                    React Frontend SPA                         │
│                    (http://localhost:3000)                    │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Keycloak-js Client                                     │ │
│  │  - Manages OIDC flow                                    │ │
│  │  - Stores tokens                                        │ │
│  │  - Auto-refreshes tokens                                │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Components                                             │ │
│  │  - UserProfile (shows user info & roles)                │ │
│  │  - CourseList (displays courses - STUDENT/ADMIN)        │ │
│  │  - CourseManagement (create courses - ADMIN only)       │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  API Service                                            │ │
│  │  - Injects Bearer token in requests                     │ │
│  │  - Handles 401/403 errors                               │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
└───────────────────┬───────────────────────────────────────────┘
                    │
                    │  7. API Request + Bearer Token
                    │     Authorization: Bearer <JWT>
                    ▼
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│              Spring Boot Backend API                          │
│              (http://localhost:8080)                          │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Security Configuration                                 │ │
│  │  - OAuth2 Resource Server                               │ │
│  │  - JWT Validation (signature, issuer, expiration)       │ │
│  │  - Role extraction from JWT claims                      │ │
│  └─────────────────────────────────────────────────────────┘ │
│                          │                                    │
│                          ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Controllers (with @PreAuthorize)                       │ │
│  │  - CourseController                                     │ │
│  │    * GET /courses (STUDENT, ADMIN)                      │ │
│  │    * POST /courses (ADMIN only)                         │ │
│  │  - UserController                                       │ │
│  │    * GET /me (authenticated users)                      │ │
│  └─────────────────────────────────────────────────────────┘ │
│                          │                                    │
│                          ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Service Layer & Repository                             │ │
│  │  - CourseRepository (JPA)                               │ │
│  │  - H2 In-Memory Database                                │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
└───────────────────────────────────────────────────────────────┘
                    │
                    │  8. JWT Validation
                    │     (verify signature with JWKS)
                    ▼
            ┌──────────────────┐
            │   Keycloak       │
            │   JWKS Endpoint  │
            │   /certs         │
            └──────────────────┘

## Authentication Flow (OIDC Standard Flow)

1. **User Access**: User navigates to http://localhost:3000
2. **Login Redirect**: Frontend detects no authentication, redirects to Keycloak
3. **User Login**: User enters credentials (user1/admin1)
4. **Authorization Code**: Keycloak validates and returns authorization code
5. **Token Exchange**: Frontend exchanges code for ID token and access token
6. **Store Tokens**: Keycloak-js stores tokens in memory
7. **API Calls**: Frontend includes access token in Authorization header
8. **Token Validation**: Backend validates JWT signature and claims
9. **Role Check**: Backend checks user roles via @PreAuthorize
10. **Response**: Backend returns data if authorized, 403 if not

## Security Layers

### Layer 1: Keycloak (Identity Provider)
- User authentication
- Token issuance (JWT)
- User management
- Role management
- Session management

### Layer 2: Frontend (React)
- OIDC client (keycloak-js)
- Token storage and refresh
- UI-level role-based rendering
- Secure token transmission

### Layer 3: Backend (Spring Boot)
- JWT signature validation
- Token expiration check
- Issuer validation
- Role-based authorization (@PreAuthorize)
- CORS protection

### Layer 4: Database (H2)
- Application data storage
- No user credentials stored

## Data Flow Example: Student Views Courses

```
1. Frontend: User clicks "Available Courses"
   ↓
2. apiService.getCourses() called
   ↓
3. axios.get('/courses', { 
     headers: { Authorization: 'Bearer eyJhbGci...' }
   })
   ↓
4. Backend: SecurityFilterChain intercepts request
   ↓
5. JWT Validation:
   - Verify signature with Keycloak public key
   - Check expiration
   - Check issuer == 'http://localhost:8180/realms/elearning-realm'
   ↓
6. Extract roles from realm_access.roles claim
   ↓
7. @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')") check
   ↓
8. User has STUDENT role → PASS
   ↓
9. CourseController.getAllCourses() executes
   ↓
10. CourseRepository.findAll() → Query H2 database
   ↓
11. Return List<Course> as JSON
   ↓
12. Frontend receives data and displays courses
```

## Data Flow Example: Student Tries to Create Course (Forbidden)

```
1. Frontend: (Admin UI hidden, but could be called via API)
   ↓
2. apiService.createCourse(courseData)
   ↓
3. axios.post('/courses', courseData, { 
     headers: { Authorization: 'Bearer eyJhbGci...' }
   })
   ↓
4. Backend: SecurityFilterChain intercepts
   ↓
5. JWT Validation: PASS (token valid)
   ↓
6. Extract roles: ['STUDENT']
   ↓
7. @PreAuthorize("hasRole('ADMIN')") check
   ↓
8. User has STUDENT role only → FAIL
   ↓
9. Return 403 Forbidden
   ↓
10. Frontend catches error, shows appropriate message
```

## Token Structure (JWT)

### Access Token Claims:
```json
{
  "exp": 1701234567,
  "iat": 1701234267,
  "jti": "abc-123-xyz",
  "iss": "http://localhost:8180/realms/elearning-realm",
  "aud": "account",
  "sub": "user-uuid-1234",
  "typ": "Bearer",
  "azp": "react-client",
  "realm_access": {
    "roles": ["STUDENT"]  // or ["ADMIN"]
  },
  "scope": "openid profile email",
  "email_verified": true,
  "name": "John Student",
  "preferred_username": "user1",
  "given_name": "John",
  "family_name": "Student",
  "email": "user1@elearning.com"
}
```

## Technology Stack

| Layer | Technology | Port |
|-------|-----------|------|
| Identity Provider | Keycloak 23.0.0 | 8180 |
| Backend API | Spring Boot 3.2.0 | 8080 |
| Frontend SPA | React 18.2.0 | 3000 |
| Database | H2 (in-memory) | - |
| OAuth2/OIDC Client | keycloak-js 23.0.0 | - |
| HTTP Client | Axios 1.6.0 | - |

## Network Communication

### Frontend → Keycloak
- Protocol: HTTPS (HTTP in dev)
- Purpose: Authentication, Token retrieval, User info, Logout

### Frontend → Backend
- Protocol: HTTPS (HTTP in dev)
- Authentication: Bearer Token (JWT)
- CORS: Enabled for http://localhost:3000

### Backend → Keycloak
- Protocol: HTTPS (HTTP in dev)
- Purpose: JWT signature validation (JWKS)
- No direct user authentication

## Security Features

1. **OAuth2 Authorization Code Flow**: Industry standard
2. **JWT Tokens**: Stateless authentication
3. **Token Expiration**: 5 minutes default
4. **Automatic Token Refresh**: 1-minute interval
5. **Role-Based Access Control (RBAC)**: Fine-grained permissions
6. **CORS Protection**: Only localhost:3000 allowed
7. **CSRF Protection**: Disabled (stateless JWT)
8. **Same-Origin Policy**: Enforced by browser
9. **No Password Storage**: All auth handled by Keycloak
10. **Centralized User Management**: Single source of truth

## Scalability Considerations

- **Stateless Backend**: Can scale horizontally
- **Centralized Auth**: Keycloak can be clustered
- **In-Memory Database**: Should be replaced with persistent DB in production
- **Token Caching**: Reduces calls to Keycloak
- **CDN for Frontend**: Can serve static React files

## Production Recommendations

1. Use HTTPS everywhere
2. Replace H2 with PostgreSQL/MySQL
3. Enable Keycloak clustering
4. Use shorter token expiration
5. Implement refresh token rotation
6. Add request rate limiting
7. Implement audit logging
8. Use environment-specific configurations
9. Add monitoring and alerting
10. Implement proper secret management
