import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';

// Auth Pages
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard.jsx';
import StudentGroups from './pages/student/StudentGroups.jsx';
import StudentGroupDetail from './pages/student/StudentGroupDetail.jsx';
import StudentAssignments from './pages/student/StudentAssignments.jsx';
import StudentAssignmentDetail from './pages/student/StudentAssignmentDetail.jsx';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminGroups from './pages/admin/AdminGroups.jsx';
import AdminAssignments from './pages/admin/AdminAssignments.jsx';
import AdminSubmissionTracking from './pages/admin/AdminSubmissionTracking.jsx';
import AdminAnalytics from './pages/admin/AdminAnalytics.jsx';

// Root index redirector
function RootRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#012d1d] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/student/dashboard" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Student Routes */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/groups"
            element={
              <ProtectedRoute allowedRole="student">
                <StudentGroups />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/groups/:groupId"
            element={
              <ProtectedRoute allowedRole="student">
                <StudentGroupDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/assignments"
            element={
              <ProtectedRoute allowedRole="student">
                <StudentAssignments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/assignments/:id"
            element={
              <ProtectedRoute allowedRole="student">
                <StudentAssignmentDetail />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/groups"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminGroups />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/assignments"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminAssignments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/submissions"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminSubmissionTracking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminAnalytics />
              </ProtectedRoute>
            }
          />

          {/* Root & Catch-all */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
