# APP.JSX INTEGRATION GUIDE

**Purpose**: Step-by-step instructions to integrate all new Member C features into App.jsx  
**Time Required**: 1-2 hours  
**Difficulty**: Medium  

---

## 📋 Overview

Your current `App.jsx` likely has basic routing. This guide shows how to add all the new pages while maintaining backward compatibility with existing pages.

---

## Step 1: Import All New Components & Pages

Add these imports at the top of `/client/src/App.jsx`:

```javascript
// ===== NEW IMPORTS FOR MEMBER C FEATURES =====

// Controllers (if needed for initial data loading)
import { useAuthContext } from './contexts/AuthContext';

// Layout Components
import { DashboardLayout } from './components/layout/DashboardLayout';
import { RoleProtectedRoute, useHasRole } from './components/RoleProtectedRoute';

// Material Pages
import MaterialListPage from './pages/materials/MaterialListPage';
import UploadMaterialPage from './pages/materials/UploadMaterialPage';
import ApprovalQueuePage from './pages/materials/ApprovalQueuePage';

// Session Pages
import SessionRoomPage from './pages/sessions/SessionRoomPage';
import ScheduleSessionPage from './pages/sessions/ScheduleSessionPage';
import MySessionsPage from './pages/sessions/MySessionsPage';

// Moderation Pages
import ModerationDashboardPage from './pages/moderation/ModerationDashboardPage';

// Views
import Dashboard from './views/Dashboard';

// Existing imports (keep as-is)
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// ... your other existing imports ...
```

---

## Step 2: Create Route Helper Components

Add these helper components inside App.jsx (or in a separate `/client/src/utils/RouteHelpers.jsx`):

```javascript
/**
 * PublicRoute: Routes only accessible to logged-out users
 * (Login, Register pages)
 */
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuthContext();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-2xl">⏳</p>
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  // Redirect logged-in users to dashboard
  return user ? <Navigate to="/dashboard" /> : children;
};

/**
 * ProtectedRoute: Routes only accessible to authenticated users
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthContext();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-2xl">⏳</p>
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  // Redirect logged-out users to login
  return user ? children : <Navigate to="/login" />;
};

/**
 * AdminRoute: Routes only accessible to admins
 */
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuthContext();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }
  
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" />;
  
  return children;
};
```

---

## Step 3: Define Route Structure

Replace your Routes section with this comprehensive structure:

```javascript
function App() {
  return (
    <Router>
      <Routes>
        {/* ===== PUBLIC ROUTES ===== */}
        
        <Route path="/" element={<Navigate to="/dashboard" />} />
        
        {/* Assuming you have LoginView and RegisterView */}
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

        {/* ===== PROTECTED ROUTES (All Authenticated Users) ===== */}
        
        {/* Dashboard - Home Page (Role-aware content) */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        {/* ===== MATERIAL ROUTES ===== */}
        
        {/* Browse all materials (everyone can browse) */}
        <Route 
          path="/materials" 
          element={
            <ProtectedRoute>
              <MaterialListPage />
            </ProtectedRoute>
          } 
        />

        {/* Upload material (students & tutors only) */}
        <Route 
          path="/materials/upload" 
          element={
            <ProtectedRoute>
              <RoleProtectedRoute roles={['student', 'tutor']}>
                <UploadMaterialPage />
              </RoleProtectedRoute>
            </ProtectedRoute>
          } 
        />

        {/* Approval queue (moderators & admins only) */}
        <Route 
          path="/materials/approval-queue" 
          element={
            <ProtectedRoute>
              <RoleProtectedRoute roles={['moderator', 'admin']}>
                <ApprovalQueuePage />
              </RoleProtectedRoute>
            </ProtectedRoute>
          } 
        />

        {/* ===== SESSION ROUTES ===== */}
        
        {/* Schedule a new session (students only) */}
        <Route 
          path="/sessions/schedule" 
          element={
            <ProtectedRoute>
              <RoleProtectedRoute roles={['student']}>
                <ScheduleSessionPage />
              </RoleProtectedRoute>
            </ProtectedRoute>
          } 
        />

        {/* My sessions / Session requests (students & tutors) */}
        <Route 
          path="/sessions/my-sessions" 
          element={
            <ProtectedRoute>
              <RoleProtectedRoute roles={['student', 'tutor']}>
                <MySessionsPage />
              </RoleProtectedRoute>
            </ProtectedRoute>
          } 
        />

        {/* Session video room (authenticated users in an active session) */}
        <Route 
          path="/sessions/room/:sessionId" 
          element={
            <ProtectedRoute>
              <SessionRoomPage />
            </ProtectedRoute>
          } 
        />

        {/* ===== MODERATION ROUTES ===== */}
        
        {/* Moderation dashboard (moderators & admins only) */}
        <Route 
          path="/moderation/dashboard" 
          element={
            <ProtectedRoute>
              <RoleProtectedRoute roles={['moderator', 'admin']}>
                <ModerationDashboardPage />
              </RoleProtectedRoute>
            </ProtectedRoute>
          } 
        />

        {/* ===== CATCH-ALL (Keep this last!) ===== */}
        
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
```

---

## Step 4: Complete Example App.jsx

Here's a complete `App.jsx` with all routes integrated:

```javascript
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthContext } from './contexts/AuthContext';

// ===== IMPORTS - New Member C Components =====
import Dashboard from './views/Dashboard';
import MaterialListPage from './pages/materials/MaterialListPage';
import UploadMaterialPage from './pages/materials/UploadMaterialPage';
import ApprovalQueuePage from './pages/materials/ApprovalQueuePage';
import SessionRoomPage from './pages/sessions/SessionRoomPage';
import ScheduleSessionPage from './pages/sessions/ScheduleSessionPage';
import MySessionsPage from './pages/sessions/MySessionsPage';
import ModerationDashboardPage from './pages/moderation/ModerationDashboardPage';
import { RoleProtectedRoute } from './components/RoleProtectedRoute';

// ===== IMPORTS - Existing Views =====
import LoginView from './views/LoginView';
import RegisterView from './views/RegisterView';
import BrowseTutors from './views/BrowseTutors';
import StudentDashboard from './views/StudentDashboard';
import TutorDashboard from './views/TutorDashboard';
import AdminDashboard from './views/AdminDashboard_new';
// ... other existing imports ...

/**
 * Route Protection Helpers
 */
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuthContext();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><p>Loading...</p></div>;
  return user ? <Navigate to="/dashboard" /> : children;
};

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthContext();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><p>Loading...</p></div>;
  return user ? children : <Navigate to="/login" />;
};

/**
 * Main App Component
 */
function App() {
  return (
    <Router>
      <Routes>
        {/* ===== PUBLIC ROUTES ===== */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route 
          path="/login" 
          element={<PublicRoute><LoginView /></PublicRoute>} 
        />
        <Route 
          path="/register" 
          element={<PublicRoute><RegisterView /></PublicRoute>} 
        />

        {/* ===== PROTECTED ROUTES - NEW MEMBER C ===== */}
        
        {/* Home Dashboard (role-aware) */}
        <Route 
          path="/dashboard" 
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
        />

        {/* Materials */}
        <Route 
          path="/materials" 
          element={<ProtectedRoute><MaterialListPage /></ProtectedRoute>} 
        />
        <Route 
          path="/materials/upload" 
          element={
            <ProtectedRoute>
              <RoleProtectedRoute roles={['student', 'tutor']}>
                <UploadMaterialPage />
              </RoleProtectedRoute>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/materials/approval-queue" 
          element={
            <ProtectedRoute>
              <RoleProtectedRoute roles={['moderator', 'admin']}>
                <ApprovalQueuePage />
              </RoleProtectedRoute>
            </ProtectedRoute>
          } 
        />

        {/* Sessions */}
        <Route 
          path="/sessions/schedule" 
          element={
            <ProtectedRoute>
              <RoleProtectedRoute roles={['student']}>
                <ScheduleSessionPage />
              </RoleProtectedRoute>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/sessions/my-sessions" 
          element={
            <ProtectedRoute>
              <RoleProtectedRoute roles={['student', 'tutor']}>
                <MySessionsPage />
              </RoleProtectedRoute>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/sessions/room/:sessionId" 
          element={<ProtectedRoute><SessionRoomPage /></ProtectedRoute>} 
        />

        {/* Moderation */}
        <Route 
          path="/moderation/dashboard" 
          element={
            <ProtectedRoute>
              <RoleProtectedRoute roles={['moderator', 'admin']}>
                <ModerationDashboardPage />
              </RoleProtectedRoute>
            </ProtectedRoute>
          } 
        />

        {/* ===== EXISTING ROUTES (keep as-is for backward compatibility) ===== */}
        <Route 
          path="/tutors" 
          element={<ProtectedRoute><BrowseTutors /></ProtectedRoute>} 
        />
        <Route 
          path="/student-dashboard" 
          element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} 
        />
        <Route 
          path="/tutor-dashboard" 
          element={<ProtectedRoute><TutorDashboard /></ProtectedRoute>} 
        />
        <Route 
          path="/admin-dashboard" 
          element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} 
        />
        
        {/* ===== Fallback Route ===== */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
```

---

## Step 5: Verify Imports

Make sure all imported components exist at these paths:

```
✓ /client/src/views/Dashboard.jsx
✓ /client/src/pages/materials/MaterialListPage.jsx
✓ /client/src/pages/materials/UploadMaterialPage.jsx
✓ /client/src/pages/materials/ApprovalQueuePage.jsx
✓ /client/src/pages/sessions/SessionRoomPage.jsx
✓ /client/src/pages/sessions/ScheduleSessionPage.jsx
✓ /client/src/pages/sessions/MySessionsPage.jsx
✓ /client/src/pages/moderation/ModerationDashboardPage.jsx
✓ /client/src/components/RoleProtectedRoute.jsx
✓ /client/src/contexts/AuthContext.jsx (with useAuthContext hook)

✓ /client/src/views/LoginView.jsx (existing)
✓ /client/src/views/RegisterView.jsx (existing)
```

If any are missing, adjust import paths accordingly.

---

## Step 6: Test the Integration

```bash
# 1. Build to check for errors
cd /client
npm run build

# If there are errors, fix import paths
# Common issues:
# - Import path doesn't match actual file location
# - Missing file extensions (.jsx)
# - Incorrect relative paths

# 2. Run dev server
npm run dev

# 3. Open browser to http://localhost:3000
# 4. You should be redirected to /login
# 5. Login with test account
# 6. You should see Dashboard (/dashboard)
# 7. Sidebar should show role-appropriate navigation links
# 8. Click links to test all new pages load correctly
```

---

## Step 7: Navigation Testing

Test these navigation paths by clicking links in the Sidebar:

**As Student:**
- Dashboard → See "Upcoming Sessions", "Browse Tutors", "Schedule Session" quick actions
- Browse Tutors → See tutor list (BrowseTutors page)
- Schedule Session → See ScheduleSessionPage with form
- My Sessions → See MySessionsPage with student view
- Materials → See MaterialListPage
- Upload → See UploadMaterialPage

**As Tutor:**
- Dashboard → See "Session Requests", "My Sessions", action cards
- Session Requests → See MySessionsPage tutor view (Incoming Requests tab)
- My Sessions → See MySessionsPage (My Sessions tab)
- Materials → See MaterialListPage
- Upload → See UploadMaterialPage

**As Moderator:**
- Dashboard → See ⚠️ "Pending Reports", 📋 "Pending Materials" stat cards
- Moderation → See ModerationDashboardPage with reports table
- Approve Materials → See ApprovalQueuePage with pending materials queue
- Materials → See MaterialListPage

---

## Common Integration Issues & Fixes

### Issue: "Cannot find module" for new components

**Error**: `Error: ENOENT: no such file or directory`

**Fix**: Check that file path matches exactly (case-sensitive on Linux/Mac)
```javascript
// ❌ Wrong
import Dashboard from './views/dashboard';

// ✅ Correct
import Dashboard from './views/Dashboard';
```

### Issue: "useAuthContext is not a function"

**Error**: `useAuthContext is not a function`

**Fix**: Verify hook is exported from AuthContext.jsx
```javascript
// In /client/src/contexts/AuthContext.jsx
export const useAuthContext = () => { ... };

// In App.jsx
import { useAuthContext } from './contexts/AuthContext';
```

### Issue: "RoleProtectedRoute is not rendering children"

**Error**: Pages wrapped in RoleProtectedRoute don't load, infinite redirect

**Fix**: Check that AuthContext has correct user.role values:
```javascript
// AuthContext.jsx should set user.role to one of:
// 'student', 'tutor', 'moderator', 'admin', 'parent'

// Sidebar.jsx has switch cases matching these values
```

### Issue: "Build fails with syntax errors"

**Error**: `SyntaxError: Unexpected token...`

**Fix**: Check for missing closing braces, semicolons, etc.
```bash
# Run build with verbose output
npm run build -- --verbose

# Look for file path in error message
# Open that file and check syntax (matching braces, quotes, etc.)
```

---

## Verification Checklist

After completing all steps:

- [ ] All imports added to App.jsx
- [ ] Route helper components created (PublicRoute, ProtectedRoute)
- [ ] All new routes added
- [ ] npm run build completes without errors
- [ ] npm run dev starts without errors
- [ ] Login redirects to dashboard
- [ ] Dashboard loads and shows role-aware content
- [ ] Sidebar navigation shows role-appropriate links
- [ ] Clicking sidebar links navigates to correct pages
- [ ] All role-protected routes properly restrict access
- [ ] Non-existent routes redirect to dashboard

---

## Next Steps After Integration

1. ✅ Backend API endpoint verification (see MVC_REFACTORING_COMPLETION_SUMMARY.md)
2. ✅ User flow testing (see Testing Checklist)
3. ✅ Deploy to staging/production
4. ✅ Monitor for errors in browser console & backend logs

---

**Ready to test?** Open http://localhost:3000 in your browser! 🚀
