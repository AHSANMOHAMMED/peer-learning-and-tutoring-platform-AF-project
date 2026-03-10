import React from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx'
import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'
import Home from './pages/Home'
import LoginView from './views/LoginView'
import RegisterView from './views/RegisterView'
import ForgotPasswordView from './views/ForgotPasswordView'
import StudentDashboard from './views/StudentDashboard'
import TutorDashboard from './views/TutorDashboard'
import BrowseTutors from './views/BrowseTutors'
import SessionRoom from './components/SessionRoom'
import ResourceLibrary from './components/ResourceLibrary'
import AdminDashboard from './views/AdminDashboard_new'
import ModeratorDashboard from './components/ModeratorDashboard'
import UserManagementView from './views/UserManagementView'

// NEW: MVC Views - Materials
import UploadMaterial from './views/Materials/UploadMaterial'
import MaterialList from './views/Materials/MaterialList'
import MaterialDetail from './views/Materials/MaterialDetail'

// NEW: MVC Views - Tutoring
import ScheduleSession from './views/Tutoring/ScheduleSession'
import MySessions from './views/Tutoring/MySessions'
import TutoringSessionRoom from './views/Tutoring/SessionRoom'

// NEW: MVC Views - Moderation
import ModerationQueue from './views/Moderation/ModerationQueue'
import ReportForm from './views/Moderation/ReportForm'

// NEW: Phase 1 - Peer Tutoring & Group Rooms
import PeerMatchingPage from './pages/PeerMatchingPage'
import GroupStudyPage from './pages/GroupStudyPage'

// NEW: Phase 2 - Lecture Courses & Advanced Session Room
import LectureCatalogPage from './pages/LectureCatalogPage'
import CourseDetailPage from './pages/CourseDetailPage'
import SessionRoom from './pages/SessionRoom'

// NEW: Dashboard Layout and Components
import DashboardLayout from './components/Dashboard/DashboardLayout'
import DashboardHome from './components/Dashboard/DashboardHome'
import TutorApprovalQueue from './views/Admin/TutorApprovalQueue'
import ReportsModeration from './components/Admin/ReportsModeration'
import AnalyticsOverview from './components/Admin/AnalyticsOverview'
import UserManagement from './components/Admin/UserManagement'

// Unauthorized Page
const UnauthorizedPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full text-center">
      <div className="text-6xl mb-4">🚫</div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
      <p className="text-gray-600 mb-6">
        You don't have permission to access this page. Please contact an administrator if you believe this is an error.
      </p>
      <a href="/" className="btn-primary inline-block">
        Go Home
      </a>
    </div>
  </div>
);

// Protected Route Component - checks authentication only
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Role Protected Route Component - checks authentication AND role
const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    // Redirect to unified dashboard
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            
            {/* Auth Routes */}
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
            <Route
              path="/forgot-password"
              element={
                <PublicRoute>
                  <ForgotPasswordView />
                </PublicRoute>
              }
            />
            
            {/* Unauthorized Page */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            
            {/* ==========================================
                NEW: Unified Dashboard Routes with Layout
                ========================================== */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* Dashboard Home - Role-aware rendering */}
              <Route index element={<DashboardHome />} />
              
              {/* Student Routes */}
              <Route path="student/bookings" element={<MySessions />} />
              <Route path="student/tutors" element={<BrowseTutors />} />
              <Route path="student/sessions" element={<MySessions />} />
              <Route path="student/materials" element={<MaterialList />} />
              <Route path="student/progress" element={<DashboardHome />} />
              <Route path="student/calendar" element={<DashboardHome />} />
              
              {/* Tutor Routes */}
              <Route path="tutor/sessions" element={<MySessions />} />
              <Route path="tutor/requests" element={<MySessions />} />
              <Route path="tutor/availability" element={<DashboardHome />} />
              <Route path="tutor/earnings" element={<DashboardHome />} />
              <Route path="tutor/reviews" element={<DashboardHome />} />
              
              {/* Shared Routes - Materials */}
              <Route path="materials" element={<MaterialList />} />
              <Route path="materials/upload" element={<UploadMaterial />} />
              <Route path="materials/:id" element={<MaterialDetail />} />
              
              {/* Shared Routes - Tutoring */}
              <Route path="tutoring/schedule" element={<ScheduleSession />} />
              <Route path="tutoring/sessions" element={<MySessions />} />
              <Route path="sessions/:sessionId" element={<TutoringSessionRoom />} />
              
              {/* NEW: Phase 1 - Peer Tutoring & Group Rooms */}
              <Route path="peer/matching" element={<PeerMatchingPage />} />
              <Route path="peer/sessions/:sessionId" element={<SessionRoom />} />
              <Route path="groups" element={<GroupStudyPage />} />
              <Route path="groups/:groupId" element={<SessionRoom />} />
              
              {/* NEW: Phase 2 - Lecture Courses */}
              <Route path="lectures" element={<LectureCatalogPage />} />
              <Route path="lectures/:courseId" element={<CourseDetailPage />} />
              <Route path="lectures/:courseId/sessions/:sessionId" element={<SessionRoom />} />
              
              {/* Moderator Routes */}
              <Route 
                path="moderation/queue" 
                element={
                  <RoleProtectedRoute allowedRoles={['admin', 'moderator']}>
                    <ModerationQueue />
                  </RoleProtectedRoute>
                } 
              />
              <Route 
                path="moderation/reports" 
                element={
                  <RoleProtectedRoute allowedRoles={['admin', 'moderator']}>
                    <ReportsModeration />
                  </RoleProtectedRoute>
                } 
              />
              
              {/* Admin Routes */}
              <Route 
                path="admin/analytics" 
                element={
                  <RoleProtectedRoute allowedRoles={['admin', 'moderator']}>
                    <AnalyticsOverview />
                  </RoleProtectedRoute>
                } 
              />
              <Route 
                path="admin/tutor-approvals" 
                element={
                  <RoleProtectedRoute allowedRoles={['admin', 'moderator']}>
                    <TutorApprovalQueue />
                  </RoleProtectedRoute>
                } 
              />
              <Route 
                path="admin/reports" 
                element={
                  <RoleProtectedRoute allowedRoles={['admin', 'moderator']}>
                    <ModerationQueue />
                  </RoleProtectedRoute>
                } 
              />
              <Route 
                path="admin/users" 
                element={
                  <RoleProtectedRoute allowedRoles={['admin', 'moderator']}>
                    <UserManagement />
                  </RoleProtectedRoute>
                } 
              />
              <Route 
                path="admin/moderation" 
                element={
                  <RoleProtectedRoute allowedRoles={['admin', 'moderator']}>
                    <ModerationQueue />
                  </RoleProtectedRoute>
                } 
              />
            </Route>
            
            {/* Shared Protected Routes - Multiple Roles */}
            <Route 
              path="/browse-tutors" 
              element={
                <RoleProtectedRoute allowedRoles={['student', 'parent']}>
                  <BrowseTutors />
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/tutoring/schedule" 
              element={
                <ProtectedRoute>
                  <ScheduleSession />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/sessions/:sessionId" 
              element={
                <ProtectedRoute>
                  <TutoringSessionRoom />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/materials" 
              element={
                <ProtectedRoute>
                  <MaterialList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/materials/upload" 
              element={
                <ProtectedRoute>
                  <UploadMaterial />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/materials/:id" 
              element={
                <ProtectedRoute>
                  <MaterialDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/report" 
              element={
                <ProtectedRoute>
                  <ReportForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/resources" 
              element={
                <ProtectedRoute>
                  <ResourceLibrary />
                </ProtectedRoute>
              } 
            />
            
            {/* Legacy Routes - Redirect to new dashboard */}
            <Route path="/student/dashboard" element={<Navigate to="/dashboard" />} />
            <Route path="/tutor/dashboard" element={<Navigate to="/dashboard" />} />
            <Route path="/admin/dashboard" element={<Navigate to="/dashboard" />} />
            <Route path="/parent/dashboard" element={<Navigate to="/dashboard" />} />
            <Route path="/moderation" element={<Navigate to="/dashboard/admin/moderation" />} />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  )
}

export default App
