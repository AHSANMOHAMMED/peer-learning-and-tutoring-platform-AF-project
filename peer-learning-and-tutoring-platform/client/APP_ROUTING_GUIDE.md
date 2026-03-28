# App.jsx Routing Guide - MVC Refactor

## Updated Routing Structure

Replace all old routing with this new structure in `App.jsx`:

```javascript
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

// Contexts
import { AuthProvider } from './contexts/AuthContext';
import { useAuthContext } from './contexts/AuthContext';

// HOCs & Components
import { RoleProtectedRoute, useHasRole } from './components/auth/RoleProtectedRoute';

// Pages - Auth
import LoginView from './views/LoginView';
import RegisterView from './views/RegisterView';

// Pages - Dashboard
import Dashboard from './pages/Dashboard';

// Pages - Materials
import MaterialListPage from './pages/materials/MaterialListPage';
import MaterialDetailPage from './pages/materials/MaterialDetailPage';
import UploadMaterialPage from './pages/materials/UploadMaterialPage';

// Pages - Sessions
import ScheduleSessionPage from './pages/sessions/ScheduleSessionPage';
import MySessionsPage from './pages/sessions/MySessionsPage';
import SessionRoomPage from './pages/sessions/SessionRoomPage';

// Pages - Moderation
import ModerationDashboardPage from './pages/moderation/ModerationDashboardPage';
import ApprovalQueuePage from './pages/moderation/ApprovalQueuePage';

// Pages - Admin
import AdminDashboard from './views/AdminDashboard';

// Other
import Home from './pages/Home';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

/**
 * Protected Route Component
 * Redirects unauthenticated users to login
 */
const ProtectedRoute = ({ children }) => {
  const { user } = useAuthContext();
  return user ? children : <Navigate to="/login" replace />;
};

/**
 * Public Route Component
 * Redirects authenticated users to dashboard
 */
const PublicRoute = ({ children }) => {
  const { user } = useAuthContext();
  return !user ? children : <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-center" />
        
        <Routes>
          {/* ============ PUBLIC ROUTES ============ */}
          
          {/* Home */}
          <Route path="/" element={<Home />} />

          {/* Auth */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginView />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterView />
              </PublicRoute>
            }
          />

          {/* ============ PROTECTED ROUTES ============ */}

          {/* Dashboard (All Authenticated Users) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* ============ MATERIALS (All Users) ============ */}
          <Route
            path="/materials"
            element={
              <ProtectedRoute>
                <MaterialListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/materials/:id"
            element={
              <ProtectedRoute>
                <MaterialDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/materials/upload"
            element={
              <ProtectedRoute>
                <UploadMaterialPage />
              </ProtectedRoute>
            }
          />

          {/* ============ SESSIONS (Student & Tutor) ============ */}
          <Route
            path="/sessions/schedule"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute
                  roles={['student', 'parent']}
                  fallbackPath="/dashboard"
                >
                  <ScheduleSessionPage />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/sessions/my-sessions"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute
                  roles={['student', 'tutor', 'parent']}
                  fallbackPath="/dashboard"
                >
                  <MySessionsPage />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/sessions/:sessionId/room"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute
                  roles={['student', 'tutor']}
                  fallbackPath="/sessions/my-sessions"
                >
                  <SessionRoomPage />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />

          {/* ============ MODERATION (Moderator & Admin) ============ */}
          <Route
            path="/moderation"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute
                  roles={['moderator', 'admin']}
                  fallbackPath="/dashboard"
                >
                  <ModerationDashboardPage />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/moderation/reports"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute
                  roles={['moderator', 'admin']}
                  fallbackPath="/dashboard"
                >
                  <ModerationDashboardPage />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/moderation/materials"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute
                  roles={['moderator', 'admin']}
                  fallbackPath="/dashboard"
                >
                  <ApprovalQueuePage />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />

          {/* ============ ADMIN ============ */}
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute
                  roles={['admin']}
                  fallbackPath="/dashboard"
                >
                  <AdminDashboard />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />

          {/* ============ CATCH ALL ============ */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Global Footer */}
        <Footer />
      </AuthProvider>
    </Router>
  );
}

export default App;
```

## Route Mapping Summary

### Public Routes
- `GET /` → Home
- `GET /login` → LoginView
- `GET /register` → RegisterView

### Protected Routes (Authenticated Users)

#### Dashboard
- `GET /dashboard` → Dashboard (all roles)

#### Materials
- `GET /materials` → MaterialListPage (all roles)
- `GET /materials/:id` → MaterialDetailPage (all roles)
- `GET /materials/upload` → UploadMaterialPage (all roles)

#### Sessions
- `GET /sessions/schedule` → ScheduleSessionPage (student, parent)
- `GET /sessions/my-sessions` → MySessionsPage (student, tutor, parent)
- `GET /sessions/:sessionId/room` → SessionRoomPage (student, tutor)

#### Moderation
- `GET /moderation` → ModerationDashboardPage (moderator, admin)
- `GET /moderation/reports` → ModerationDashboardPage (moderator, admin)
- `GET /moderation/materials` → ApprovalQueuePage (moderator, admin)

#### Admin
- `GET /admin/users` → AdminUserManagement (admin only)

## Key Features

1. **AuthProvider Wrapper**: All routes wrapped in AuthProvider for context access
2. **Protected Routes**: ProtectedRoute HOC checks authentication
3. **Role-Based Access**: RoleProtectedRoute enforces role restrictions
4. **Redirect Logic**:
   - Unauthenticated → `/login`
   - Admin trying to access student route → `/dashboard`
   - Already logged in accessing `/login` → `/dashboard`
5. **Catch-All**: Unmapped routes → `/`

## Usage in Components

```javascript
// Check if user has role
import { useHasRole } from './components/auth/RoleProtectedRoute';

const MyComponent = () => {
  const isModerator = useHasRole('moderator');
  
  return (
    <div>
      {isModerator && <ModeratorPanel />}
    </div>
  );
};

// OR inline check
import { canAccess } from './components/auth/RoleProtectedRoute';

return <div>{canAccess('moderator', user.role) && <Panel />}</div>;
```

## Environment Variables

Add to `.env`:
```
REACT_APP_JITSI_JWT=<your-jitsi-jwt-token-if-using-authenticated-jitsi>
REACT_APP_API_URL=http://localhost:5000
```

## Backend Assumptions

The backend APIs must support these endpoints (already implemented):

### Materials
- `GET /api/materials` (filter by subject, tags, status)
- `GET /api/materials/:id`
- `POST /api/materials` (FormData with file)
- `PUT /api/materials/:id`
- `DELETE /api/materials/:id`
- `PUT /api/materials/:id/approve` (mod only)
- `PUT /api/materials/:id/reject` (mod only)

### Sessions
- `GET /api/sessions` (with filters)
- `GET /api/sessions/:id`
- `POST /api/sessions` (create booking)
- `PUT /api/sessions/:id/accept` (tutor only)
- `PUT /api/sessions/:id/reject` (tutor only)
- `PUT /api/sessions/:id/join`
- `PUT /api/sessions/:id/end`
- `POST /api/sessions/:id/feedback`
- `PUT /api/sessions/:id/cancel` (student only)

### Moderation
- `GET /api/moderation/reports` (with filters)
- `GET /api/moderation/reports/:id`
- `POST /api/moderation/reports` (any user)
- `PUT /api/moderation/reports/:id` (mod only - approve/dismiss)
- `DELETE /api/moderation/reports/:id` (mod only)

### Users
- `GET /api/users/tutors` (list tutors)
- `PUT /api/users/:id/ban` (mod only)
- `PUT /api/users/:id/suspend` (mod only)
- `PUT /api/users/:id/warn` (mod only)

## Next Steps

1. Create missing page components:
   - `Dashboard.jsx` - Home dashboard (role-aware)
   - `MaterialDetailPage.jsx` - Single material view
   - `UploadMaterialPage.jsx` - Material upload form
   - `ApprovalQueuePage.jsx` - Mod: Pending materials

2. Update `AuthContext.jsx` to export `useAuthContext` hook

3. Ensure `services/*.js` files have all necessary API calls

4. Test routing with different user roles

5. implement error boundaries for 404 pages
