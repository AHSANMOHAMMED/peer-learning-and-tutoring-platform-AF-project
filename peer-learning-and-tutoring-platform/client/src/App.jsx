import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx'
import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'
import Home from './pages/Home'
import LoginView from './views/LoginView'
import RegisterView from './views/RegisterView'
import StudentDashboard from './views/StudentDashboard'
import TutorDashboard from './views/TutorDashboard'
import BrowseTutors from './views/BrowseTutors'
import SessionRoom from './components/SessionRoom'
import ResourceLibrary from './components/ResourceLibrary'
import ModeratorDashboard from './components/ModeratorDashboard'
import AdminDashboard from './views/AdminDashboard'
import ParentDashboard from './views/ParentDashboard'
import ModeratorDashboard from './components/ModeratorDashboard'

// Forum Components
import QuestionList from './components/forum/QuestionList'
import QuestionDetail from './components/forum/QuestionDetail'
import AskQuestion from './components/forum/AskQuestion'

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
    // Redirect to role-appropriate dashboard
    const roleRoutes = {
      admin: '/admin/dashboard',
      tutor: '/tutor/dashboard',
      parent: '/parent/dashboard',
      student: '/student/dashboard'
    };
    return <Navigate to={roleRoutes[user?.role] || '/student/dashboard'} />;
  }
  
  return children;
};

// Dynamic Dashboard Router - renders correct dashboard based on user role
const DashboardRouter = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  const roleDashboards = {
    admin: <AdminDashboard />,
    tutor: <TutorDashboard />,
    parent: <ParentDashboard />,
    student: <StudentDashboard />
  };
  
  return roleDashboards[user?.role] || <StudentDashboard />;
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
            
            {/* Unauthorized Page */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            
            {/* Dynamic Dashboard Route */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardRouter />
                </ProtectedRoute>
              } 
            />
            
            {/* Role-Specific Dashboard Routes */}
            <Route 
              path="/student/dashboard" 
              element={
                <RoleProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/tutor/dashboard" 
              element={
                <RoleProtectedRoute allowedRoles={['tutor']}>
                  <TutorDashboard />
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/admin/dashboard" 
              element={
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/parent/dashboard" 
              element={
                <RoleProtectedRoute allowedRoles={['parent']}>
                  <ParentDashboard />
                </RoleProtectedRoute>
              } 
            />
            
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
              path="/session/:id" 
              element={
                <ProtectedRoute>
                  <SessionRoom />
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
            {/* Admin/Moderator Only Routes */}
            <Route 
              path="/moderation" 
              element={
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <ModeratorDashboard />
                </RoleProtectedRoute>
              } 
            />

            {/* Forum Routes */}
            <Route path="/forum" element={<QuestionList />} />
            <Route path="/forum/ask" element={<AskQuestion />} />
            <Route path="/forum/question/:id" element={<QuestionDetail />} />
            
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
