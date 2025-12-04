# Screenshots Guide for Report (Part 5)

This guide provides instructions on what screenshots to capture for the final report.

## Required Screenshots

### 1. Architecture Diagram
**What to capture**: System architecture showing Keycloak ↔ React ↔ Spring Boot
**How**: 
- Create a diagram based on the one in ARCHITECTURE.md
- Use tools like Draw.io, Lucidchart, or PowerPoint
- Show the three main components and their interactions
- Include authentication flow arrows

**Elements to include**:
- Keycloak Identity Server (port 8180)
- React Frontend (port 3000)
- Spring Boot Backend (port 8080)
- OAuth2/OIDC flow arrows
- JWT token flow

---

### 2. Keycloak Configuration

#### 2.1 Keycloak Login Page
**URL**: http://localhost:8180
**Capture**: Welcome page with "Administration Console" button

#### 2.2 Keycloak Admin Console
**URL**: http://localhost:8180/admin
**Login**: admin / admin
**Capture**: Main admin dashboard

#### 2.3 Realm Configuration
**Navigation**: Realm settings
**Capture**: elearning-realm configuration page showing realm name

#### 2.4 Client Configuration
**Navigation**: Clients → react-client
**Capture**: 
- Client settings showing:
  - Client ID: react-client
  - Client type: OpenID Connect
  - Valid redirect URIs: http://localhost:3000/*
  - Access settings (Standard flow enabled)

#### 2.5 Roles
**Navigation**: Realm roles
**Capture**: List showing ADMIN and STUDENT roles

#### 2.6 Users
**Navigation**: Users
**Capture**: 
- User list showing user1 and admin1
- user1 details with STUDENT role assignment
- admin1 details with ADMIN role assignment

---

### 3. Application Screenshots

#### 3.1 Login Flow

**Screenshot A: Automatic Redirect**
- Open http://localhost:3000 in incognito/private window
- Capture: Keycloak login page showing the redirect from React app

**Screenshot B: Keycloak Login Form**
- Capture: Login form with username/password fields
- Show URL: http://localhost:8180/realms/elearning-realm/protocol/openid-connect/auth...

#### 3.2 Student User (user1)

**Screenshot C: Successful Login (Student)**
- Login with user1/user1
- Capture: Full page after successful login showing:
  - User Profile section with:
    - Username: user1
    - Name: John Student
    - Email: user1@elearning.com
    - Roles: STUDENT
  - "Available Courses" tab (visible)
  - Course list with 4 sample courses

**Screenshot D: Course List (Student View)**
- Capture: Course cards showing:
  - Course titles
  - Descriptions
  - Instructors
  - Duration
- Notice: Only ONE tab visible (no "Course Management" tab)

**Screenshot E: Student Access Denied (Optional)**
- Try to manually call POST /courses via browser console or Postman
- Capture: 403 Forbidden response

#### 3.3 Admin User (admin1)

**Screenshot F: Logout**
- Click Logout button
- Capture: Redirect back to Keycloak or login page

**Screenshot G: Admin Login**
- Login with admin1/admin1
- Capture: Full page showing:
  - User Profile with:
    - Username: admin1
    - Name: Alice Admin
    - Email: admin1@elearning.com
    - Roles: ADMIN
  - TWO tabs visible:
    - Available Courses
    - Course Management

**Screenshot H: Course Management Form**
- Click "Course Management" tab
- Capture: Form showing:
  - Title field
  - Description field
  - Instructor field
  - Duration field
  - "Create Course" button
  - "Administrator Section" text

**Screenshot I: Create Course Success**
- Fill in the form:
  - Title: "Test Course"
  - Description: "This is a test course for demonstration"
  - Instructor: "Test Instructor"
  - Duration: 15
- Click "Create Course"
- Capture: Success message "Course created successfully!"

**Screenshot J: New Course in List**
- Click "Available Courses" tab
- Capture: Course list now showing the newly created "Test Course"

---

### 4. Postman API Testing

#### 4.1 Get Token (Student)

**Screenshot K: Student Token Request**
- Method: POST
- URL: http://localhost:8180/realms/elearning-realm/protocol/openid-connect/token
- Body showing:
  - client_id: react-client
  - username: user1
  - password: user1
  - grant_type: password
- Response showing:
  - Status: 200 OK
  - access_token (highlight this)
  - expires_in: 300
  - token_type: Bearer

#### 4.2 GET /courses (Student - Success)

**Screenshot L: Student GET Request**
- Method: GET
- URL: http://localhost:8080/courses
- Headers showing: Authorization: Bearer <token>
- Response showing:
  - Status: 200 OK
  - Array of courses in JSON format

#### 4.3 GET /me (Student)

**Screenshot M: User Info Request (Student)**
- Method: GET
- URL: http://localhost:8080/me
- Headers: Authorization: Bearer <token>
- Response showing:
  - Status: 200 OK
  - User information with roles: ["STUDENT"]
  - Email, name, preferred_username

#### 4.4 POST /courses (Student - Forbidden)

**Screenshot N: Student POST Request (DENIED)**
- Method: POST
- URL: http://localhost:8080/courses
- Headers: 
  - Authorization: Bearer <student_token>
  - Content-Type: application/json
- Body:
  ```json
  {
    "title": "Unauthorized Course",
    "description": "Should fail",
    "instructor": "Test",
    "duration": 10
  }
  ```
- Response showing:
  - **Status: 403 Forbidden** (HIGHLIGHT THIS)
  - Error message

#### 4.5 Get Token (Admin)

**Screenshot O: Admin Token Request**
- Same as Screenshot K but with:
  - username: admin1
  - password: admin1
- Response showing new access_token

#### 4.6 POST /courses (Admin - Success)

**Screenshot P: Admin POST Request (ALLOWED)**
- Method: POST
- URL: http://localhost:8080/courses
- Headers:
  - Authorization: Bearer <admin_token>
  - Content-Type: application/json
- Body:
  ```json
  {
    "title": "Advanced Keycloak",
    "description": "Deep dive into Keycloak",
    "instructor": "Security Expert",
    "duration": 25
  }
  ```
- Response showing:
  - **Status: 201 Created** (HIGHLIGHT THIS)
  - Created course object with ID

#### 4.7 GET /me (Admin)

**Screenshot Q: User Info Request (Admin)**
- Method: GET
- URL: http://localhost:8080/me
- Response showing roles: ["ADMIN"]

---

### 5. JWT Token Analysis

**Screenshot R: JWT Token Decoded**
- Go to https://jwt.io
- Paste an access_token (from student or admin)
- Capture: Decoded token showing:
  - Header (algorithm: RS256)
  - Payload with:
    - iss: http://localhost:8180/realms/elearning-realm
    - sub: user ID
    - preferred_username
    - email
    - realm_access.roles: ["STUDENT"] or ["ADMIN"]
    - exp, iat timestamps

---

### 6. Security Testing

**Screenshot S: Unauthorized Access**
- Postman request without Authorization header
- URL: http://localhost:8080/courses
- Capture: Status 401 Unauthorized

**Screenshot T: Invalid Token**
- Postman request with invalid token
- Authorization: Bearer invalid_token_123
- Capture: Status 401 Unauthorized

---

## Screenshot Organization for Report

### Recommended Structure:

**Section 1: Keycloak Configuration (5-6 screenshots)**
- Login page
- Realm configuration
- Client settings
- Roles list
- Users list with role assignments

**Section 2: Application Usage - Student (3-4 screenshots)**
- Student login and profile
- Course list view
- Limited access (only one tab visible)

**Section 3: Application Usage - Admin (4-5 screenshots)**
- Admin login and profile
- Both tabs visible
- Course management form
- Course creation success
- New course in list

**Section 4: API Testing (8-10 screenshots)**
- Token requests (student & admin)
- GET requests (successful)
- POST request (student - denied)
- POST request (admin - allowed)
- User info endpoints
- JWT decoded

**Section 5: Security (2-3 screenshots)**
- Unauthorized access attempts
- 401/403 error responses

## Tips for Quality Screenshots

1. **Use Full Screen**: Capture full browser window or Postman window
2. **Highlight Important Parts**: Use colored boxes or arrows to highlight:
   - Status codes (200, 201, 403, 401)
   - Roles in responses
   - Authorization headers
3. **Clear Text**: Ensure all text is readable
4. **Consistent Theme**: Use same browser/Postman theme throughout
5. **Include Timestamps**: Show that tests were actually performed
6. **URL Visibility**: Show full URLs in browser/Postman address bar

## Screenshot Annotation Checklist

For each screenshot, add a caption explaining:
- [ ] What is being shown
- [ ] Expected result
- [ ] Actual result
- [ ] Why this demonstrates security/functionality

## Example Captions

**Good Caption**:
> "Figure 5: Student attempting to create a course (POST /courses) with valid STUDENT token. Request returns 403 Forbidden, demonstrating that role-based access control correctly prevents students from creating courses."

**Better Caption**:
> "Figure 5: RBAC Enforcement - Student Access Denial
> - User: user1 (STUDENT role)
> - Request: POST /courses
> - Result: 403 Forbidden
> - Explanation: The backend correctly validates the JWT token roles and denies access because the endpoint requires ADMIN role. This demonstrates proper server-side authorization."

## Total Screenshots Needed

**Minimum**: 20-25 screenshots
**Recommended**: 25-30 screenshots

## Tools Recommended

- **Screenshot Tool**: 
  - Windows: Snipping Tool, Snip & Sketch
  - Mac: Screenshot app (Cmd+Shift+4)
  - Linux: Flameshot, GNOME Screenshot
  
- **Annotation Tool**:
  - Greenshot (Windows)
  - Skitch (Mac)
  - GIMP (All platforms)
  - PowerPoint/Word (built-in annotation)

- **Diagram Tool**:
  - Draw.io (https://app.diagrams.net)
  - Lucidchart
  - Microsoft PowerPoint
  - Mermaid (for code-based diagrams)

## Final Checklist

Before submitting your report, verify you have screenshots showing:

- [ ] Keycloak realm configuration
- [ ] Client configuration with redirect URIs
- [ ] Roles (ADMIN, STUDENT)
- [ ] Users with role assignments
- [ ] Student login success
- [ ] Student profile with role
- [ ] Student can view courses
- [ ] Student CANNOT manage courses (403)
- [ ] Admin login success
- [ ] Admin profile with role
- [ ] Admin can view courses
- [ ] Admin can create courses
- [ ] Postman: Get token (both users)
- [ ] Postman: Successful API calls
- [ ] Postman: Failed authorization (403)
- [ ] Postman: Unauthorized access (401)
- [ ] JWT token structure decoded
- [ ] Architecture diagram

---

**Good luck with your screenshots and report!**

Remember: The goal is to demonstrate that your implementation works correctly and securely. Make sure each screenshot clearly shows the feature/security measure you're demonstrating.
