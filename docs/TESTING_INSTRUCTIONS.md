# Testing Instruction Report: Aura Luminous Platform
## SE3040 – Application Frameworks (Advanced Unit)

This report outlines the testing methodologies, suite configurations, and execution procedures for the Aura Luminous ecosystem.

---

## 1. Testing Philosophy

Aura Luminous employs a multi-tiered testing strategy to ensure absolute data integrity and platform stability:
- **Unit Testing**: Isolated logic verification for core services.
- **Integration Testing**: End-to-end API node verification.
- **Performance Testing**: Concurrency and latency stress simulations.

---

## 2. Environment Configuration

### 2.1 Test Database
For unit and integration tests, a **MongoDB Memory Server** is utilized. This ensures that the testing process does not mutate the production or local development databases.

### 2.2 Global Settings
Testing environment variables are managed via `cross-env` to ensure `NODE_ENV` is set to `test`, triggering specific configurations in the Mongoose connection layer.

---

## 3. Unit & Integration Testing (Jest)

The primary testing engine for the backend is **Jest** combined with **Supertest**.

### 3.1 Execution Commands
Navigate to the `/backend` directory to initialize the audit:

```bash
# Execute full testing suite with coverage report
npm run test

# Execute tests in watch mode for active development
npm run test:watch
```

### 3.2 Coverage Focus
- **Gamification Logic**: `services/pointsService.js` (Badge issuance and streak logic).
- **Authentication Flow**: `controllers/authController.js` (Token issuance and password hashing).
- **Core CRUD Node**: Tutors, Students, and Question management routes.

---

## 4. Performance Testing (Artillery)

High-concurrency stress testing is conducted via **Artillery.io** to simulate heavy user loads.

### 4.1 Configuration Details
The simulation is defined in `backend/performance/artillery.yml` and consists of two phases:
1. **Warm-up Phase**: Gradual ramp-up from 5 to 20 virtual users over 60 seconds.
2. **Sustained Load Phase**: Constant throughput of 20 virtual users over 60 seconds.

### 4.2 Execution Command
From the `/backend` directory:

```bash
npm run test:perf
```

### 4.3 Key Metrics Monitored
- **vuser.session_length**: Time taken for a complete browsing sequence.
- **http.response_time**: Latency for primary API nodes (target < 200ms).
- **http.codes.200**: Success rate of concurrent requests.

---

## 5. Interpreting Results

After test execution, reports are generated in the following formats:
- **Jest**: Terminal-based coverage table summarizing statement, branch, and line coverage.
- **Artillery**: JSON/Terminal summary detailing throughput, latency, and error counts.

---
**Report Finalized: April 12, 2026**
