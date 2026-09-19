import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';

// Public Landing Page
import { Landing } from './pages/Landing';

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
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing View */}
          <Route path="/" element={<Landing />} />
          <Route path="/landing" element={<Landing />} />

          {/* Internal Application Views inside AppLayout */}
          <Route element={<AppLayout />}>
            {/* Normal Mode Routes */}
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="vault" element={<ShadowVault />} />
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
  );
}

export default App;
