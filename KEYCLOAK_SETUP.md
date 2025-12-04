# Keycloak Configuration Guide

This guide provides step-by-step instructions for configuring Keycloak as the identity provider for the E-Learning platform.

## Prerequisites

- Docker and Docker Compose installed
- Ports 8180 available (for Keycloak)

## Installation

### Using Docker

1. Create a `docker-compose.yml` file in the project root:

```yaml
version: '3.8'

services:
  keycloak:
    image: quay.io/keycloak/keycloak:23.0.0
    container_name: keycloak
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin
    ports:
      - "8180:8080"
    command:
      - start-dev
```

2. Start Keycloak:

```bash
docker-compose up -d
```

3. Wait for Keycloak to start (about 30 seconds), then access the admin console at:
   - URL: http://localhost:8180
   - Username: admin
   - Password: admin

## Configuration Steps

### Step 1: Create Realm

1. Log into Keycloak Admin Console
2. Click on the dropdown in the top-left corner (currently showing "master")
3. Click "Create Realm"
4. Enter Realm name: `elearning-realm`
5. Click "Create"

### Step 2: Create Client

1. In the `elearning-realm`, navigate to "Clients" from the left menu
2. Click "Create client"
3. Configure the client:
   - **Client ID**: `react-client`
   - **Client type**: OpenID Connect
   - Click "Next"
4. Capability config:
   - **Client authentication**: OFF (Public client)
   - **Authorization**: OFF
   - **Standard flow**: Enabled
   - **Direct access grants**: Enabled
   - Click "Next"
5. Login settings:
   - **Root URL**: `http://localhost:3000`
   - **Home URL**: `http://localhost:3000`
   - **Valid redirect URIs**: `http://localhost:3000/*`
   - **Valid post logout redirect URIs**: `http://localhost:3000/*`
   - **Web origins**: `http://localhost:3000`
6. Click "Save"

### Step 3: Create Roles

1. Navigate to "Realm roles" from the left menu
2. Click "Create role"
3. Create first role:
   - **Role name**: `ADMIN`
   - Click "Save"
4. Click "Create role" again
5. Create second role:
   - **Role name**: `STUDENT`
   - Click "Save"

### Step 4: Create Users

#### User 1 (Student)

1. Navigate to "Users" from the left menu
2. Click "Add user"
3. Configure user:
   - **Username**: `user1`
   - **Email**: `user1@elearning.com`
   - **First name**: `John`
   - **Last name**: `Student`
   - **Email verified**: ON
4. Click "Create"
5. Go to "Credentials" tab:
   - Click "Set password"
   - **Password**: `user1`
   - **Password confirmation**: `user1`
   - **Temporary**: OFF
   - Click "Save"
6. Go to "Role mapping" tab:
   - Click "Assign role"
   - Filter by "Realm roles"
   - Select `STUDENT`
   - Click "Assign"

#### User 2 (Admin)

1. Click "Add user" again
2. Configure user:
   - **Username**: `admin1`
   - **Email**: `admin1@elearning.com`
   - **First name**: `Alice`
   - **Last name**: `Admin`
   - **Email verified**: ON
3. Click "Create"
4. Go to "Credentials" tab:
   - Click "Set password"
   - **Password**: `admin1`
   - **Password confirmation**: `admin1`
   - **Temporary**: OFF
   - Click "Save"
5. Go to "Role mapping" tab:
   - Click "Assign role"
   - Filter by "Realm roles"
   - Select `ADMIN`
   - Click "Assign"

### Step 5: Verify Configuration

1. Test the OpenID Connect endpoints:

```bash
# Get realm configuration
curl http://localhost:8180/realms/elearning-realm/.well-known/openid-configuration

# This should return JSON with all the OIDC endpoints
```

2. Test user authentication and get user info:

```bash
# Get access token for user1
curl -X POST 'http://localhost:8180/realms/elearning-realm/protocol/openid-connect/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'client_id=react-client' \
  -d 'username=user1' \
  -d 'password=user1' \
  -d 'grant_type=password'

# Use the access_token from the response to get user info
curl -X GET 'http://localhost:8180/realms/elearning-realm/protocol/openid-connect/userinfo' \
  -H 'Authorization: Bearer <ACCESS_TOKEN>'
```

The userinfo endpoint should return:
```json
{
  "sub": "...",
  "email_verified": true,
  "name": "John Student",
  "preferred_username": "user1",
  "given_name": "John",
  "family_name": "Student",
  "email": "user1@elearning.com"
}
```

## Important Endpoints

- **Authorization Endpoint**: `http://localhost:8180/realms/elearning-realm/protocol/openid-connect/auth`
- **Token Endpoint**: `http://localhost:8180/realms/elearning-realm/protocol/openid-connect/token`
- **UserInfo Endpoint**: `http://localhost:8180/realms/elearning-realm/protocol/openid-connect/userinfo`
- **End Session Endpoint**: `http://localhost:8180/realms/elearning-realm/protocol/openid-connect/logout`
- **JWKS Endpoint**: `http://localhost:8180/realms/elearning-realm/protocol/openid-connect/certs`

## Troubleshooting

### Issue: Cannot access Keycloak at localhost:8180
- Check if Docker container is running: `docker ps`
- Check logs: `docker logs keycloak`
- Ensure port 8180 is not in use by another application

### Issue: Invalid redirect URI
- Verify that `http://localhost:3000/*` is in the Valid redirect URIs list
- Ensure Web origins includes `http://localhost:3000`

### Issue: Roles not appearing in JWT
- Check that roles are assigned to users in Role mapping
- Verify realm roles are created with exact names: `ADMIN` and `STUDENT`
- Check token claims using jwt.io

## Next Steps

After completing the Keycloak configuration:
1. Start the Spring Boot backend (port 8080)
2. Start the React frontend (port 3000)
3. Test the authentication flow
