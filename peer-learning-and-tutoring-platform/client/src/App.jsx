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

// Forum Components
import QuestionList from './components/forum/QuestionList'
import QuestionDetail from './components/forum/QuestionDetail'
import AskQuestion from './components/forum/AskQuestion'
// import CommentSection from './components/forum/CommentSection'
// import RichTextEditor from './components/forum/RichTextEditor'
// import VoteButtons from './components/forum/VoteButtons'
// import AnswerList from './components/forum/AnswerList'
// import { useQuestionSocket, useSocketEvent } from '../../hooks/useSocket'

// Gamification Components
// import Leaderboard from './components/gamification/Leaderboard'

// Protected Route Component
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

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
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
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <StudentDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tutor-dashboard" 
              element={
                <ProtectedRoute>
                  <TutorDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/browse-tutors" 
              element={
                <ProtectedRoute>
                  <BrowseTutors />
                </ProtectedRoute>
              } 
            />

            {/* Forum Routes */}
            <Route path="/forum" element={<QuestionList />} />
            <Route path="/forum/ask" element={<AskQuestion />} />
            <Route path="/forum/question/:id" element={<QuestionDetail />} />

            {/* Gamification Routes */}
            {/* <Route path="/leaderboard" element={<Leaderboard />} /> */}
            
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
