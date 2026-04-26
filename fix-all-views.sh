#!/bin/bash

# Script to fix all views to use proper API services instead of direct api calls
# This will make frontend-backend communication work properly

FRONTEND_SRC="/Users/ahsan/peer-learning-and-tutoring-platform/frontend/src"

echo "Fixing all views to use proper API services..."

# Fix TutorDashboard - fix unanswered questions API call
sed -i '' 's|const res = await api\.get|/\questions?unanswered=true&limit=5|);|const res = await questionApi\.getAll({ unanswered: true, limit: 5 \});|g' "$FRONTEND_SRC/views/TutorDashboard.jsx"

# Fix ForumPage
sed -i '' 's|const res = await api\.get|/\questions|);|const res = await questionApi\.getAll();|g' "$FRONTEND_SRC/views/ForumPage.jsx"

# Fix ForumPage post question
sed -i '' 's|const res = await api\.post|/\questions|\({|const res = await questionApi\.create(|g' "$FRONTEND_SRC/views/ForumPage.jsx"

# Fix NationalMerit
sed -i '' 's|api\.get(`/gamification/leaderboard?type=global&limit=10&subject=${selectedStream}`)|gamificationApi\.getLeaderboard({ type: \"global\", limit: 10, subject: selectedStream })|g' "$FRONTEND_SRC/views/NationalMerit.jsx"
sed -i '' 's|api\.get|/\gamification/leaderboard/districts|)|gamificationApi\.getDistrictLeaderboard()|g' "$FRONTEND_SRC/views/NationalMerit.jsx"

# Fix CertificatesPage
sed -i '' 's|const response = await api\.get|/\certificates/my-certificates|);|const response = await certificateApi\.getAll({ my: true \});|g' "$FRONTEND_SRC/views/CertificatesPage.jsx"

# Fix VirtualClassroom
sed -i '' 's|const startRes = await api\.post|/\ai-homework/start|\({|const startRes = await aiApi\.homeworkHelp(|g' "$FRONTEND_SRC/views/VirtualClassroom.jsx"

# Fix AttemptQuestionPage
sed -i '' 's|const res = await api\.get|/\qa/questions/${id}|);|const res = await qaApi\.getById(id);|g' "$FRONTEND_SRC/views/AttemptQuestionPage.jsx"
sed -i '' 's|const res = await api\.post|/\qa/submissions|\({|const res = await qaApi\.create(|g' "$FRONTEND_SRC/views/AttemptQuestionPage.jsx"

# Fix GamificationDashboard (already partially fixed, but check)
# Fix ResetPassword
sed -i '' 's|await api\.post|/\auth/reset-password|\({|await authApi\.resetPassword(|g' "$FRONTEND_SRC/views/ResetPassword.jsx"

# Fix SuperAdminDashboard
sed -i '' 's|const { data } = await api\.get|/\health|;|const { data } = await systemApi\.getPulse();|g' "$FRONTEND_SRC/views/SuperAdminDashboard.jsx"

# Fix ForumThreadPage
sed -i '' 's|api\.get(`/questions/${id}`)|questionApi\.getById(id)|g' "$FRONTEND_SRC/views/ForumThreadPage.jsx"
sed -i '' 's|api\.get(`/answers/question/${id}`)|answerApi\.getAll({ questionId: id })|g' "$FRONTEND_SRC/views/ForumThreadPage.jsx"
sed -i '' 's|api\.post(`/answers/question/${id}`, { body: answerDraft })|answerApi\.create({ ...answerDraft, questionId: id })|g' "$FRONTEND_SRC/views/ForumThreadPage.jsx"

# Fix ForgotPassword
sed -i '' 's|await api\.post|/\auth/forgot-password|\({|await authApi\.forgotPassword(|g' "$FRONTEND_SRC/views/ForgotPassword.jsx"

# Fix ProfileSetup
sed -i '' 's|const response = await api\.put|/\auth/profile|\({|const response = await authApi\.updateProfile(|g' "$FRONTEND_SRC/views/ProfileSetup.jsx"

# Fix ProfileView
sed -i '' 's|const response = await api\.put|/\users/profile|\({|const response = await userManagementApi\.updateProfile(|g' "$FRONTEND_SRC/views/ProfileView.jsx"

# Fix CourseMarketplace
sed -i '' 's|api\.get|/\marketplace/featured?limit=4|)|marketplaceApi\.getAll({ featured: true, limit: 4 })|g' "$FRONTEND_SRC/views/CourseMarketplace.jsx"
sed -i '' 's|api\.get|/\marketplace/categories|)|marketplaceApi\.getAll({ categories: true })|g' "$FRONTEND_SRC/views/CourseMarketplace.jsx"
sed -i '' 's|const response = await api\.get|/\marketplace/search?${params\.toString()}|);|const response = await marketplaceApi\.getAll({ search: params.get(\"search\") });|g' "$FRONTEND_SRC/views/CourseMarketplace.jsx"

# Fix TutorQAForumPage
sed -i '' 's|const res = await api\.get|/\questions|);|const res = await questionApi\.getAll();|g' "$FRONTEND_SRC/views/TutorQAForumPage.jsx"
sed -i '' 's|const res = await api\.post|/\answers/question/${selectedId}|\({|const res = await answerApi\.create({ ...(|g' "$FRONTEND_SRC/views/TutorQAForumPage.jsx"

# Fix AIHomeworkChat
sed -i '' 's|const response = await api\.get|/\ai-homework/sessions/history|);|const response = await aiApi\.homeworkHelp({ action: \"getHistory\" });|g' "$FRONTEND_SRC/views/AIHomeworkChat.jsx"

echo "Done! Now rebuilding frontend..."
cd "$FRONTEND_SRC/.." && npm run build
