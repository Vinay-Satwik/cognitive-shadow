import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ProtectedRoute, PublicOnlyRoute } from './components/auth/RouteGuards';
import { AppLayout } from './components/layout/AppLayout';

// Public Landing Page
import { Landing } from './pages/Landing';

// Authentication Pages
import { Login } from './pages/auth/Login';
import { SignUp } from './pages/auth/SignUp';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';

// First-Time Onboarding
import { Onboarding } from './pages/Onboarding';

// Normal Mode Pages
import { Dashboard } from './pages/Dashboard';
import { ShadowVault } from './pages/ShadowVault';
import { Assets } from './pages/Assets';
import { EmergencyContacts } from './pages/EmergencyContacts';
import { EmergencyPlans } from './pages/EmergencyPlans';
import { Readiness } from './pages/Readiness';
import { CrisisSimulator } from './pages/CrisisSimulator';
import { Settings } from './pages/Settings';
import { CrisisActivation } from './pages/CrisisActivation';

// Crisis Mode Pages
import { CrisisOverview } from './pages/crisis/CrisisOverview';
import { EmergencyBrief } from './pages/EmergencyBrief';
import { CrisisTasks } from './pages/crisis/CrisisTasks';
import { CrisisPeople } from './pages/crisis/CrisisPeople';
import { CrisisDocuments } from './pages/crisis/CrisisDocuments';
import { CrisisAccess } from './pages/crisis/CrisisAccess';
import { CrisisTimeline } from './pages/crisis/CrisisTimeline';

export function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Landing View */}
            <Route path="/" element={<Landing />} />
            <Route path="/landing" element={<Landing />} />

            {/* Public Authentication Routes (Redirect to /dashboard if logged in) */}
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <Login />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicOnlyRoute>
                  <SignUp />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <PublicOnlyRoute>
                  <ForgotPassword />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/reset-password"
              element={
                <PublicOnlyRoute>
                  <ResetPassword />
                </PublicOnlyRoute>
              }
            />

            {/* First-time Onboarding Flow (Protected) */}
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              }
            />

            {/* Protected Internal Application Views inside AppLayout */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              {/* Normal Mode Routes */}
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="vault" element={<ShadowVault />} />
              <Route path="documents" element={<ShadowVault />} />
              <Route path="assets" element={<Assets />} />
              <Route path="contacts" element={<EmergencyContacts />} />
              <Route path="plans" element={<EmergencyPlans />} />
              <Route path="readiness" element={<Readiness />} />
              <Route path="simulator" element={<CrisisSimulator />} />
              <Route path="settings" element={<Settings />} />
              <Route path="activation" element={<CrisisActivation />} />

              {/* Crisis Mode Dedicated Routes */}
              <Route path="crisis" element={<CrisisOverview />} />
              <Route path="crisis/overview" element={<CrisisOverview />} />
              <Route path="crisis/brief" element={<EmergencyBrief />} />
              <Route path="crisis/tasks" element={<CrisisTasks />} />
              <Route path="crisis/people" element={<CrisisPeople />} />
              <Route path="crisis/documents" element={<CrisisDocuments />} />
              <Route path="crisis/access" element={<CrisisAccess />} />
              <Route path="crisis/timeline" element={<CrisisTimeline />} />

              {/* Backward-compatibility Route Aliases */}
              <Route path="command-center" element={<Navigate to="/crisis" replace />} />
              <Route path="brief" element={<Navigate to="/crisis/brief" replace />} />
              <Route path="care-circle" element={<Navigate to="/crisis/people" replace />} />
              <Route path="secure-sharing" element={<Navigate to="/crisis/access" replace />} />
              <Route path="timeline" element={<Navigate to="/crisis/timeline" replace />} />

              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
