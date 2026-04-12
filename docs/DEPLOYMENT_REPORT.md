# Deployment Report: Aura Luminous Platform
## SE3040 – Application Frameworks (Advanced Unit)

This report details the deployment infrastructure, environment configuration, and production readiness of the Aura Luminous platform.

---

## 1. Environment Architecture

The Aura Luminous platform follows a decoupled MERN stack architecture, containerized for scalability and consistent delivery across environments.

### 1.1 Deployment Tiers
- **Live Academic Identity**: Standard Node.js runtime connected to **MongoDB Atlas (Live Cluster)**.
- **Containerized Implementation**: Multi-container orchestration via Docker Compose, utilizing the remote data cloud.
- **Production Readiness**: Nginx proxying, optimized builds, and secure session management.

---

## 2. Setup & Installation

### 2.1 Local Service Provisioning
The platform provides a master synchronization script (`start-all.sh`) to initialize both backend and frontend services sequentially.

**Prerequisites:**
- Node.js (v18.0.0+)
- MongoDB daemon (local) or Atlas Cluster (remote)
- Redis (optional for enhanced caching)

**Initialization Steps:**
1. Clone the repository.
2. Configure `.env` files in both `/backend` and `/frontend`.
3. Give execution permission to the start script: `chmod +x start-all.sh`.
4. Run `./start-all.sh`.

### 2.2 Environment Variables
| Variable | Scope | Description |
| :--- | :--- | :--- |
| `MONGO_URI` | Backend | Connection string for MongoDB (Atlas or Local). |
| `JWT_SECRET` | Backend | High-entropy key for session token signing. |
| `GOOGLE_CLIENT_ID` | Backend | OAuth 2.0 credentials for Google Identity. |
| `EMAIL_USER` | Backend | SMTP username for automated notifications & OTP. |
| `VITE_API_BASE_URL` | Frontend | Endpoint pointer to the backend API node. |

---

## 3. Containerization Strategy

The project utilizes Docker for infrastructure-as-code deployment, ensuring environment parity.

### 3.1 Docker Configuration
- **Dockerfile (Backend)**: Uses `node:18-alpine` for a minimal footprint. Includes multi-stage builds for production optimization.
- **Dockerfile (Frontend)**: Utilizes a custom Nginx build to serve the production-ready Vite bundle.
- **Docker Compose**: Orchestrates the following services:
  - `backend`: Node/Express API.
  - `frontend`: React/Nginx delivery.
  - `mongodb`: Persistence layer.
  - `redis`: Real-time session caching.

**Launch Command:**
```bash
docker-compose up --build -d
```

---

## 4. Production Readiness Audit

| Component | Status | Implementation Detail |
| :--- | :--- | :--- |
| **Security** | ✅ Active | Helmet.js middleware, CORS restriction, Bcrypt hashing. |
| **Scalability** | ✅ Ready | Decoupled architecture, Stateless JWT auth. |
| **Availability** | ✅ Ready | PM2/Nodemon support, Health check endpoints. |
| **Analytics** | ✅ Active | Real-time telemetry feed for system admins. |

---

## 5. Deployment Challenges & Mitigations

1. **Social Login Configuration**: Google OAuth requires pre-registered callback URIs. Redirect logic was standardized to support both local and remote origins.
2. **Real-time Sync**: Socket.io was configured with specific CORS origins to prevent unauthorized socket handshakes.
3. **Database Latency**: Implemented Mongoose connection pooling and indexing on primary search fields (Subject, Grade) to maintain sub-100ms response times.

---
**Report Finalized: April 12, 2026**
