# 🎓 Aura Academic Platform
### SE3040 – Application Frameworks (Advanced Unit)
*BSc (Hons) in Information Technology Specialized in Software Engineering*

Aura is a professional-grade, peer-to-peer and group educational ecosystem designed specifically for the Sri Lankan GCE Advanced Level curriculum. It facilitates seamless collaboration between students and expert tutors through high-fidelity virtual classrooms, intelligent matching, and a robust Q&A forum.

---

## ✨ Primary Features
- **Intelligent Academic Matching**: Advanced algorithm to connect students with specialized mentors based on subjects, grades, and learning styles.
- **Unified Academic Hub**: Modern SaaS interfaces tailored for Students, Tutors, Parents, and Administrators.
- **Secure Authentication**: Hybrid security model supporting Local registration, Google OAuth 2.0, and OTP verification.
- **Live Collaboration**: Real-time virtual classrooms with shared whiteboards and interactive chat.
- **Academic Gamification**: Merit-based badges and reputation scores to encourage active participation.

---

## 🛠️ Setup Instructions

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: A running MongoDB instance (Local or Atlas)
- **Git**: For version control management

### 2. Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd peer-learning-and-tutoring-platform
   ```
2. Configure environment variables:
   - Create a `.env` file in the `/backend` directory:
     ```env
     MONGO_URI=mongodb+srv://surekasiva11_db_user:0ySY8SeKwFG5YQ1P@cluster0.d3uxnzy.mongodb.net/peerlearn?appName=Cluster0
     JWT_SECRET=your_secret_key
     PORT=5001
     ```
   - Create a `.env` file in the `/frontend` directory:
     ```env
     VITE_API_BASE_URL=http://localhost:5001
     ```

3. Initialize the platform (Automated script):
   The platform includes a synchronization script that installs all dependencies and runs the apps.
   ```bash
   chmod +x ./start-all.sh
   ./start-all.sh
   ```

4. Manual Start:
   - Backend: `cd backend && npm install && npm run dev`
   - Frontend: `cd frontend && npm install && npm run dev`

5. Access the Platform:
   - **Frontend**: http://localhost:5173
   - **Backend API**: http://localhost:5001

---

## 📡 API Endpoint Documentation

The Aura platform uses a RESTful JSON API for all integrations.

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| POST | `/register` | Register a new user (Student/Tutor/Parent) | No |
| POST | `/login` | Authenticate and receive a JWT token | No |
| GET | `/profile` | Retrieve the currently authenticated user's profile | Yes |
| POST | `/send-otp` | Send an OTP code to user's email for verification | No |
| GET | `/google` | Initiate Google OAuth 2.0 login flow | No |

### 2. Tutor Management (`/api/tutors`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| GET | `/` | List all approved and verified tutors | No |
| POST | `/` | Register as a tutor (requires admin approval) | Yes |
| GET | `/:id` | Get detailed tutor profile and availability | No |
| PUT | `/:id/moderate` | Approve or reject a tutor registration | Yes (Admin) |

### 3. Academic Forum (`/api/questions`, `/api/answers`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| GET | `/questions` | List all forum questions with filters (subject/grade) | No |
| POST | `/questions` | Post a new academic question | Yes |
| GET | `/questions/:id` | Retrieve a question and its current answers | No |
| POST | `/questions/:id/answers` | Provide an answer to a specific question | Yes |
| POST | `/votes/:type/:id` | Upvote/Downvote a question or answer | Yes |

### 4. Sessions & Bookings (`/api/bookings`, `/api/sessions`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| POST | `/bookings` | Request a tutoring session with a mentor | Yes |
| GET | `/bookings/my-sessions` | List sessions for the current user (Student/Tutor) | Yes |
| GET | `/sessions/:id` | Connect to a virtual classroom instance | Yes |

### 5. Advanced Learning (`/api/ai`, `/api/peer`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| POST | `/ai-homework` | Interaction with the AI Academic Assistant | Yes |
| POST | `/peer/match` | Initiate the SmartMatch intelligent pairing hub | Yes |

---

## 🧪 Testing Instruction Report

This section outlines how to execute tests across the platform logic and endpoints.

### 1. How to Run Unit Tests
Unit tests ensure that individual components and services work correctly in isolation. 
- **Setup**: Ensure MongoDB is available (can be local or mocked).
- **Execution**: 
  ```bash
  cd backend
  npm run test:unit
  ```
- **Scope**: Tests user models, auth logic, and pure utility functions.

### 2. Integration Testing Setup and Execution
Integration tests assure that APIs interact correctly with the database and other services.
- **Setup**: Set your `MONGO_URI` to a test database in the backend `.env.test` file to prevent data loss.
- **Execution**:
  ```bash
  cd backend
  npm run test:integration
  ```
- **Scope**: Tests complete API flows (e.g., User Registration -> Login -> Booking a session).

### 3. Performance Testing Setup and Execution
Performance tests gauge server limits using load testing tools.
- **Setup**: Run the application in production mode or connect to a staging copy.
- **Tools used**: We use `artillery` or `k6` scripts integrated into npm.
- **Execution**:
  ```bash
  cd backend
  npm run test:perf
  ```
- **Scope**: Bombards the `/api/questions` and `/api/auth` endpoints with 200+ concurrent requests.

### 4. Testing Environment Configuration
- Uses `Jest` for backend API testing along with `Supertest`.
- Uses React Testing Library for frontend component testing (`cd frontend && npm test`).
- CI/CD workflow runs tests automatically via GitHub Actions on PRs.

---

## 🚀 Deployment Report
Our deployment strategy uses containerized infrastructure to maintain high availability.

1. **Architecture Overview**:
   - Frontend is built using Vite/React and deployed on Vercel/Netlify or served statically via Nginx.
   - Backend relies on Node/Express, hosted on AWS EC2 or Heroku.
   - Database is hosted natively on **MongoDB Atlas Cluster** (`cluster0.d3uxnzy`).

2. **Docker Deployment**:
   Included in the project is a dockerized solution for deploying both Front and Back ends simultaneously.
   - Build image: `docker-compose build`
   - Start instances: `docker-compose up -d`
   
3. **Current Environment Status**:
   - **Database**: Cloud instances fully synced and operational at `cluster0.d3uxnzy.mongodb.net`.
   - **Latency Optimization**: Redis caching (optional) is tested for heavy API endpoints (like fetching tutors).
   - All legacy components have been successfully migrated to the new SaaS UI architecture, passing all responsiveness audits.
