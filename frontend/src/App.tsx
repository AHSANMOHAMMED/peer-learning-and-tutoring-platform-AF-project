import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Login from './views/Login'
import Register from './views/Register'
import StudentDashboard from './views/StudentDashboard'
import TutorDashboard from './views/TutorDashboard'
import AdminDashboard from './views/AdminDashboard'
import SuperAdminDashboard from './views/SuperAdminDashboard'
import LandingPage from './views/LandingPage'
import TutorBrowsing from './views/TutorBrowsing'
import MaterialsLibrary from './views/MaterialsLibrary'
import SessionRoom from './views/SessionRoom'
import SmartMatch from './views/SmartMatch'
import MyBookings from './views/MyBookings'
import Settings from './views/Settings'
import TutorWorkspace from './views/TutorWorkspace'
import ModerationHub from './views/ModerationHub'
import MyBadges from './views/MyBadges'
import TutorQAForumPage from './views/TutorQAForumPage'
import AIHomeworkChat from './views/AIHomeworkChat'
import GamificationDashboard from './views/GamificationDashboard'
import CourseMarketplace from './views/CourseMarketplace'
import ParentDashboard from './views/ParentDashboard'
import CertificatesPage from './views/CertificatesPage'
import VirtualClassroom from './views/VirtualClassroom'
import StudyPlanner from './views/StudyPlanner'
import SocialFeed from './views/SocialFeed'
import VoiceTutor from './views/VoiceTutor'
import SchoolManagement from './views/SchoolManagement'
import UserManagement from './views/UserManagement'
import QAForumHome from './views/QAForumHome'
import AttemptQuestionPage from './views/AttemptQuestionPage'
import ProfileView from './views/ProfileView'
import LearningGamesPage from './views/LearningGamesPage'
import { useAuth } from './controllers/useAuth'

import ProtectedRoute from './components/ProtectedRoute'

const DashboardRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  switch (user.role) {
    case 'tutor': return <TutorDashboard />;
    case 'admin': return <AdminDashboard />;
    case 'superadmin': return <SuperAdminDashboard />;
    default: return <StudentDashboard />;
  }
};

const VirtualClassroomWrapper = () => {
  const navigate = useNavigate();
  return <VirtualClassroom roomId="lobby" onClose={() => navigate(-1)} />;
};

function App() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 selection:bg-primary selection:text-white">
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />

        <Route path="/match" element={<ProtectedRoute allowedRoles={['student', 'superadmin']}><SmartMatch /></ProtectedRoute>} />
        <Route path="/badges" element={<ProtectedRoute allowedRoles={['student', 'superadmin']}><MyBadges /></ProtectedRoute>} />
        <Route path="/ai-homework" element={<ProtectedRoute><AIHomeworkChat /></ProtectedRoute>} />
        <Route path="/gamification" element={<ProtectedRoute><GamificationDashboard /></ProtectedRoute>} />
        <Route path="/qa" element={<ProtectedRoute><QAForumHome /></ProtectedRoute>} />
        <Route path="/qa/attempt/:id" element={<ProtectedRoute><AttemptQuestionPage /></ProtectedRoute>} />
        <Route path="/marketplace" element={<ProtectedRoute><CourseMarketplace /></ProtectedRoute>} />
        <Route path="/parent" element={<ProtectedRoute allowedRoles={['parent', 'superadmin']}><ParentDashboard /></ProtectedRoute>} />
        <Route path="/certificates" element={<ProtectedRoute><CertificatesPage /></ProtectedRoute>} />
        <Route path="/vr-classroom" element={<ProtectedRoute><VirtualClassroomWrapper /></ProtectedRoute>} />
        <Route path="/planner" element={<ProtectedRoute><StudyPlanner /></ProtectedRoute>} />
        <Route path="/social" element={<ProtectedRoute><SocialFeed /></ProtectedRoute>} />
        <Route path="/voice-tutor" element={<ProtectedRoute><VoiceTutor /></ProtectedRoute>} />
        <Route path="/school-dashboard" element={<ProtectedRoute allowedRoles={['schoolAdmin', 'superadmin']}><SchoolManagement /></ProtectedRoute>} />
        
        <Route path="/tutor-dashboard" element={<ProtectedRoute allowedRoles={['tutor', 'superadmin']}><TutorDashboard /></ProtectedRoute>} />
        <Route path="/tutor-workspace" element={<ProtectedRoute allowedRoles={['tutor', 'superadmin']}><TutorWorkspace /></ProtectedRoute>} />
        <Route path="/tutor/qa" element={<ProtectedRoute allowedRoles={['tutor', 'superadmin']}><TutorQAForumPage /></ProtectedRoute>} />
        
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin', 'superadmin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin', 'superadmin']}><UserManagement /></ProtectedRoute>} />
        <Route path="/moderation" element={<ProtectedRoute allowedRoles={['admin', 'moderator', 'superadmin']}><ModerationHub /></ProtectedRoute>} />
        <Route path="/super-admin" element={<ProtectedRoute allowedRoles={['superadmin']}><SuperAdminDashboard /></ProtectedRoute>} />
        
        <Route path="/bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/tutors" element={<ProtectedRoute><TutorBrowsing /></ProtectedRoute>} />
        <Route path="/materials" element={<ProtectedRoute><MaterialsLibrary /></ProtectedRoute>} />
        <Route path="/session/:sessionId" element={<ProtectedRoute><SessionRoom /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfileView /></ProtectedRoute>} />
        <Route path="/games" element={<ProtectedRoute><LearningGamesPage /></ProtectedRoute>} />
        <Route path="/games/:gameId" element={<ProtectedRoute><LearningGamesPage /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </div>
  )
}

export default App
