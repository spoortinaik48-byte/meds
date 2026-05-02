import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

// Pages (will create these next)
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import PatientDashboard from './pages/patient/Dashboard';
import PatientUpload from './pages/patient/Upload';
import PatientTimeline from './pages/patient/Timeline';
import DoctorDashboard from './pages/doctor/Dashboard';
import PatientView from './pages/doctor/PatientView';

function ProtectedRoute({ children, role }: { children: React.ReactNode, role?: 'patient' | 'doctor' }) {
  const { user, userData, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  if (userData && !userData.onboarded && window.location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" />;
  }

  if (role && userData && userData.role !== role) {
    return <Navigate to={userData.role === 'patient' ? '/patient/dashboard' : '/doctor/dashboard'} />;
  }

  return <>{children}</>;
}

function AppContent() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {user && <Navbar />}
      <main className="container mx-auto px-4 pb-20 pt-4 max-w-md">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          } />
          
          {/* Patient Routes */}
          <Route path="/patient/dashboard" element={
            <ProtectedRoute role="patient">
              <PatientDashboard />
            </ProtectedRoute>
          } />
          <Route path="/patient/upload" element={
            <ProtectedRoute role="patient">
              <PatientUpload />
            </ProtectedRoute>
          } />
          <Route path="/patient/timeline" element={
            <ProtectedRoute role="patient">
              <PatientTimeline />
            </ProtectedRoute>
          } />

          {/* Doctor Routes */}
          <Route path="/doctor/dashboard" element={
            <ProtectedRoute role="doctor">
              <DoctorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/doctor/patient/:id" element={
            <ProtectedRoute role="doctor">
              <PatientView />
            </ProtectedRoute>
          } />

          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
