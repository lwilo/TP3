# Quick Start Guide

This guide will help you get the E-Learning platform up and running in 10 minutes.

## Prerequisites Check

Before starting, ensure you have:
- [ ] Docker and Docker Compose installed
- [ ] Java 17 or higher (`java -version`)
- [ ] Maven 3.6+ (`mvn -version`)
- [ ] Node.js 16+ (`node -version`)
- [ ] npm or yarn (`npm -version`)

## Step-by-Step Setup

### Step 1: Clone the Repository (if not already done)

```bash
git clone https://github.com/lwilo/TP3.git
cd TP3
```

### Step 2: Start Keycloak (2 minutes)

```bash
# Start Keycloak container
docker-compose up -d

# Wait for Keycloak to start (about 30 seconds)
# You can check the logs with:
docker-compose logs -f keycloak

# Press Ctrl+C when you see "Keycloak ... started"
```

Verify Keycloak is running:
```bash
curl http://localhost:8180
# Should return HTML (Keycloak welcome page)
```

### Step 3: Configure Keycloak (5 minutes)

Open Keycloak Admin Console:
1. Navigate to http://localhost:8180
2. Click "Administration Console"
3. Login with:
   - Username: `admin`
   - Password: `admin`

Follow the detailed configuration in [KEYCLOAK_SETUP.md](./KEYCLOAK_SETUP.md):
- Create realm: `elearning-realm`
- Create client: `react-client` (Public, Standard Flow)
- Create roles: `ADMIN`, `STUDENT`
- Create users:
  - `user1` with password `user1` (role: STUDENT)
  - `admin1` with password `admin1` (role: ADMIN)

**Quick verification:**
```bash
curl -X POST 'http://localhost:8180/realms/elearning-realm/protocol/openid-connect/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'client_id=react-client' \
  -d 'username=user1' \
  -d 'password=user1' \
  -d 'grant_type=password'

# Should return JSON with access_token
```

### Step 4: Start Backend (2 minutes)

Open a new terminal:

```bash
cd backend

# Install dependencies and build
mvn clean install -DskipTests

# Start the application
mvn spring-boot:run
```

Wait for the message: "Started ElearningApplication"

Verify backend is running:
```bash
curl http://localhost:8080/courses
# Should return 401 Unauthorized (expected - need token)
```

### Step 5: Start Frontend (1 minute)

Open another new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The application should automatically open in your browser at http://localhost:3000

## First Login Test

### Test as Student:
1. Browser should redirect to Keycloak login
2. Login with:
   - Username: `user1`
   - Password: `user1`
3. You should see:
   - User profile with name "John Student"
   - Role: STUDENT
   - "Available Courses" tab (visible)
   - "Course Management" tab (NOT visible)
   - List of 4 sample courses

### Test as Admin:
1. Logout (click Logout button)
2. Login with:
   - Username: `admin1`
   - Password: `admin1`
3. You should see:
   - User profile with name "Alice Admin"
   - Role: ADMIN
   - Both tabs visible
   - Ability to create new courses in "Course Management" tab

## Verify Everything is Working

Run these checks:

### 1. Keycloak Status
```bash
docker ps | grep keycloak
# Should show running container
```

### 2. Backend Status
```bash
curl http://localhost:8080/actuator/health 2>/dev/null || echo "Backend running on :8080"
```

### 3. Frontend Status
```bash
curl http://localhost:3000 2>/dev/null | grep -q "root" && echo "Frontend running on :3000"
```

### 4. Complete Flow Test
Open http://localhost:3000 and:
- [ ] Login redirects to Keycloak
- [ ] Successful login returns to app
- [ ] User profile displays correctly
- [ ] Courses load successfully
- [ ] Admin can create courses
- [ ] Student cannot create courses
- [ ] Logout works

## Troubleshooting

### Issue: Keycloak not accessible
```bash
# Check if container is running
docker ps

# If not, start it
docker-compose up -d

# Check logs for errors
docker-compose logs keycloak
```

### Issue: Backend won't start
```bash
# Check Java version
java -version
# Should be 17 or higher

# Check if port 8080 is in use
lsof -i :8080 # or: netstat -an | grep 8080

# Try building again
cd backend
mvn clean install
```

### Issue: Frontend won't start
```bash
# Check Node version
node -version
# Should be 16 or higher

# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Issue: CORS errors in browser
- Verify backend CORS configuration includes `http://localhost:3000`
- Check browser console for specific error
- Ensure backend is running on port 8080

### Issue: 401 Unauthorized errors
- Verify Keycloak is running
- Check that issuer-uri in `application.yml` matches Keycloak realm
- Verify user roles are assigned in Keycloak
- Try getting a fresh token

### Issue: Roles not working
- Verify roles are created in Keycloak (exact names: ADMIN, STUDENT)
- Check role assignments in Keycloak user settings
- Use `/me` endpoint to see token claims
- Inspect JWT token at https://jwt.io

## Stopping the Application

```bash
# Stop frontend (in frontend terminal)
Ctrl+C

# Stop backend (in backend terminal)
Ctrl+C

# Stop Keycloak
docker-compose down
```

## Next Steps

1. Read [ARCHITECTURE.md](./ARCHITECTURE.md) to understand the system design
2. Read [TESTING_GUIDE.md](./TESTING_GUIDE.md) for comprehensive testing
3. Try the Postman API tests
4. Explore the source code
5. Customize for your needs

## Common Tasks

### Add a New User
1. Go to Keycloak Admin Console
2. Select `elearning-realm`
3. Users → Add user
4. Set credentials
5. Assign role (STUDENT or ADMIN)

### Add a New Role
1. Keycloak Admin Console
2. Realm roles → Create role
3. Update backend @PreAuthorize annotations
4. Update frontend role checks

### Change Token Expiration
1. Keycloak Admin Console
2. Realm settings → Tokens
3. Access Token Lifespan (default: 5 minutes)

### View Database
Backend uses H2 in-memory database:
1. Navigate to http://localhost:8080/h2-console
2. JDBC URL: `jdbc:h2:mem:elearningdb`
3. Username: `sa`
4. Password: (empty)
5. Click Connect

## Development Tips

### Hot Reload
- Frontend: Automatic with `npm start`
- Backend: Use `spring-boot-devtools` for auto-restart

### Debugging
- Frontend: Use browser DevTools (F12)
- Backend: Use IDE debugger or add logging
- Keycloak: Check container logs

### API Testing
- Use Postman collection (see TESTING_GUIDE.md)
- Use curl commands
- Use browser DevTools Network tab

## Resources

- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [Spring Security OAuth2](https://spring.io/projects/spring-security-oauth)
- [React Keycloak](https://www.npmjs.com/package/keycloak-js)
- [OAuth2 Simplified](https://aaronparecki.com/oauth-2-simplified/)
- [JWT.io](https://jwt.io) - Decode tokens

## Support

For issues or questions:
1. Check [TESTING_GUIDE.md](./TESTING_GUIDE.md)
2. Review logs (backend, frontend, Keycloak)
3. Check GitHub issues
4. Consult documentation

---

**Estimated Total Setup Time:** 10-15 minutes

**Happy Learning! 🚀**
