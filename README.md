# Inventory Auth & User Management Service

A production-ready, highly secure **Spring Boot 3** (using **Java 21**) backend service providing authentication, token-based session management, and Role-Based Access Control (RBAC) with granular inventory permissions.

---

## Technical Stack & Architecture

- **Core**: Java 21, Spring Boot 3.3.0
- **Security**: Spring Security (Stateless, Stateless session, BCrypt password hashing, JWT Bearer authentication)
- **Session Renewal**: UUID Database-backed Refresh Token rotation
- **Database**: PostgreSQL, Spring Data JPA, Flyway migrations
- **Documentation**: OpenAPI 3 / Swagger-UI (fully interactive with JWT Authorize button)
- **Orchestration**: Docker & Docker Compose
- **Boilerplate reduction**: Lombok, MapStruct (DTO-Entity mapping)
- **Unit Testing**: JUnit 5, Mockito, Spring WebMvcTest

---

## Setup & Running the Application

## 1. Prerequisites
Make sure you have installed:
- **Java 21 SDK**
- **Maven 3.x**
- **Docker & Docker Compose** (Optional, for simplified PostgreSQL startup)

### 2. Standard Local Startup
1. Make sure a PostgreSQL server is running locally on port `5432` with database name `inventory-service` and credentials `postgres`/`postgres` (or edit these values in `src/main/resources/application.yml`).
2. Run the application from the root folder:
   ```powershell
   mvn spring-boot:run
   ```

### 3. Running with Docker Compose
To launch both PostgreSQL and the Spring Boot application in a unified, isolated network container:
```powershell
docker-compose up --build
```
This automatically spins up the database, checks for readiness, applies the Flyway migrations, and boots the application on `http://localhost:8080`.

### 4. Running the Tests
To execute the comprehensive unit test suite:
```powershell
mvn clean test
```

---

## Seed Data

Upon startup, `DatabaseSeeder` checks and seeds the following:
- **Roles**: `ROLE_SUPER_ADMIN` and `ROLE_USER`
- **Granular Permissions**:
  - `VIEW_PRODUCTS`, `CREATE_PRODUCTS`, `UPDATE_PRODUCTS`, `DELETE_PRODUCTS`
  - `VIEW_STOCK`, `UPDATE_STOCK`
  - `VIEW_ORDERS`, `CREATE_ORDERS`, `DELETE_ORDERS`
- **Default Super Admin User**:
  - **Username**: `superadmin`
  - **Password**: `SuperAdmin@123` (hashed using BCrypt)
  - **Role**: `ROLE_SUPER_ADMIN` (e.g. holds all 9 inventory permissions automatically)

---

## Interactive Swagger UI Documentation

Once the application is running, open your browser and navigate to:
`http://localhost:8080/swagger-ui/index.html`

> [!TIP]
> **Testing protected APIs**: 
> 1. Call `/api/auth/login` to obtain the `accessToken`.
> 2. Copy the token.
> 3. Click the **"Authorize"** lock button in Swagger UI, enter `Bearer YOUR_ACCESS_TOKEN`, and click Authorize.
> 4. You can now execute any protected user management endpoints!

---

## API Documentation & Examples

### 1. Authentication Endpoints (Public)

#### **Login**
* **Endpoint**: `POST /api/auth/login`
* **Request Body**:
```json
{
  "username": "superadmin",
  "password": "SuperAdmin@123"
}
```
* **Response Payload**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "4a713b19-f9c3-424a-9b16-cd3c16260ab5",
  "tokenType": "Bearer",
  "expiryDurationMs": 900000,
  "username": "superadmin",
  "role": "ROLE_SUPER_ADMIN",
  "permissions": [
    "CREATE_PRODUCTS",
    "VIEW_PRODUCTS",
    "DELETE_PRODUCTS",
    "UPDATE_PRODUCTS",
    "VIEW_STOCK",
    "UPDATE_STOCK",
    "VIEW_ORDERS",
    "CREATE_ORDERS",
    "DELETE_ORDERS"
  ]
}
```

#### **Token Refresh**
* **Endpoint**: `POST /api/auth/refresh`
* **Request Body**:
```json
{
  "refreshToken": "4a713b19-f9c3-424a-9b16-cd3c16260ab5"
}
```

#### **Logout**
* **Endpoint**: `POST /api/auth/logout`
* **Request Body**:
```json
{
  "refreshToken": "4a713b19-f9c3-424a-9b16-cd3c16260ab5"
}
```

---

### 2. User Management Endpoints (Strictly Restricted to `ROLE_SUPER_ADMIN`)

*Headers required: `Authorization: Bearer <accessToken>`*

#### **Create User**
* **Endpoint**: `POST /api/users`
* **Request Body**:
```json
{
  "username": "inventory_manager",
  "password": "ManagerPassword@123",
  "enabled": true,
  "roleNames": ["ROLE_USER"]
}
```

#### **Get All Users**
* **Endpoint**: `GET /api/users`

#### **Get User by ID**
* **Endpoint**: `GET /api/users/{id}`

#### **Update User**
* **Endpoint**: `PUT /api/users/{id}`
* **Request Body** (All fields optional for partial edits):
```json
{
  "username": "updated_manager",
  "enabled": false
}
```

#### **Delete User**
* **Endpoint**: `DELETE /api/users/{id}`

#### **Assign Direct Custom Permissions (Inventory Privileges Override)**
* **Endpoint**: `PUT /api/users/{id}/permissions`
* **Request Body**:
```json
{
  "permissionNames": [
    "VIEW_PRODUCTS",
    "VIEW_STOCK",
    "UPDATE_STOCK"
  ]
}
```
* **Response Payload**:
```json
{
  "id": 2,
  "username": "updated_manager",
  "enabled": true,
  "roles": ["ROLE_USER"],
  "directPermissions": [
    "VIEW_PRODUCTS",
    "VIEW_STOCK",
    "UPDATE_STOCK"
  ],
  "effectivePermissions": [
    "VIEW_PRODUCTS",
    "VIEW_STOCK",
    "UPDATE_STOCK"
  ],
  "createdAt": "2026-06-01T23:10:00",
  "updatedAt": "2026-06-01T23:15:30"
}
```

---

## Recommended Development Setup
Once this project structure is generated, we recommend you configure the active workspace in your IDE to point directly to `C:\Users\balakrishna\.gemini\antigravity-ide\scratch\inventory-auth-service`. This will enable IDE linting, compilation, and terminal context configurations to locate and resolve the project automatically.

---

## React Frontend Console

A state-of-the-art Single Page Application (SPA) built using **React** and **Vite** is included in the [frontend directory](file:///c:/Users/balakrishna/.gemini/antigravity-ide/scratch/inventory-auth-service/frontend) to administer and interact with the service.

### 1. Key Features
* **Modern Dark Theme Aesthetic**: Glassmorphism dashboard panel design, styled with tailored HSL variables and buttery-smooth CSS micro-animations.
* **JWT Access & Refresh Token Rotation**: Implements a custom Axios interceptor to securely store tokens in `localStorage` and automatically call `/api/auth/refresh` on `401 Unauthorized` responses to silently rotate access tokens.
* **Reactive Auth Guard & Routing**: Automatically directs visitors to the glassmorphic login panel or redirects logged-out sessions when tokens expire.
* **Super Admin Console (ROLE_SUPER_ADMIN)**:
  * **Real-time Stats Overview**: Showcases accounts, admin counts, and active statuses.
  * **User Directory Grid**: Lists all registered accounts, includes search-by-username filters, and features interactive state-switch toggles to enable or suspend accounts instantaneously.
  * **Granular Override matrix**: Allocates direct custom privileges (`VIEW_PRODUCTS`, `UPDATE_STOCK`, etc.) on top of basic role credentials using an intuitive checkbox layout.
  * **Interactive Creation Wizard**: Registers new accounts and sets primary roles (`ROLE_USER` vs. `ROLE_SUPER_ADMIN`).
* **Personal Profile Portal (ROLE_USER)**: Showcases active credentials, role groups, and visual clouds of effective, verified permissions.

### 2. Launching the Frontend
1. Navigate to the frontend directory:
   ```powershell
   cd frontend
   ```
2. Launch the Vite development server:
   ```powershell
   npm run dev
   ```
3. Open your browser and navigate to `http://localhost:5173`.

### 3. API Proxy Configuration
To completely eliminate CORS configuration errors during local developer runs, the Vite configuration contains a reverse proxy inside [vite.config.js](file:///c:/Users/balakrishna/.gemini/antigravity-ide/scratch/inventory-auth-service/frontend/vite.config.js):
```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
      secure: false
    }
  }
}
```
All React API requests targeting `/api/*` are automatically redirected to `http://localhost:8080/*` on the server layer.
