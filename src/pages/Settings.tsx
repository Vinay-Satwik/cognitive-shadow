import React, { useState } from 'react';
import {
  User,
  Shield,
  Bell,
  Lock,
  Database,
  Save,
  Check,
  Download,
  RotateCcw,
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

export const Settings: React.FC = () => {
  const { user, updateProfile, isSupabaseConfigured } = useAuth();
  const {
    documents,
    assets,
    contacts,
    plans,
    crisisSession,
    temporaryAccessRecords,
    resetToDemoData,
    updateUserProfile,
    userProfile
  } = useApp();

  // Profile fields
  const [name, setName] = useState(userProfile?.name || user?.name || '');
  const [email, setEmail] = useState(userProfile?.email || user?.email || '');
  const [bloodGroup, setBloodGroup] = useState(userProfile?.bloodGroup || '');
  const [allergies, setAllergies] = useState(userProfile?.allergies || '');
  const [medicalNotes, setMedicalNotes] = useState(userProfile?.medicalNotes || '');
  const [validationError, setValidationError] = useState('');

  // Keep fields synchronized if userProfile changes
  React.useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || user?.name || '');
      setEmail(userProfile.email || user?.email || '');
      setBloodGroup(userProfile.bloodGroup || '');
      setAllergies(userProfile.allergies || '');
      setMedicalNotes(userProfile.medicalNotes || '');
    }
  }, [userProfile, user]);

  // Security fields
  const [twoStepTrigger, setTwoStepTrigger] = useState(true);
  const [autoLockMinutes, setAutoLockMinutes] = useState('15');
  const [tokenExpirationHours, setTokenExpirationHours] = useState('24');

  // Notification fields
  const [heartbeatFreq, setHeartbeatFreq] = useState('14');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [expiryWarnings, setExpiryWarnings] = useState(true);

  // Privacy fields
  const [strictLocalOnly, setStrictLocalOnly] = useState(true);
  const [telemetryOptIn, setTelemetryOptIn] = useState(false);

  // Feedback states
  const [saved, setSaved] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [exported, setExported] = useState(false);

  const handleSave = () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const validName = /^[A-Za-z][A-Za-z .'-]{1,79}$/.test(trimmedName);
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
    const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    if (!validName) {
      setValidationError('Enter a valid name using letters, spaces, apostrophes, periods, or hyphens.');
      return;
    }
    if (!validEmail) {
      setValidationError('Enter a valid email address.');
      return;
    }
    if (bloodGroup && !validBloodGroups.includes(bloodGroup)) {
      setValidationError('Select a valid blood group.');
      return;
    }
    setValidationError('');
    updateProfile({ name: trimmedName, email: trimmedEmail });
    updateUserProfile({
      name,
      email,
      bloodGroup,
      allergies,
      medicalNotes
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleExportData = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      user: { name, email, bloodGroup, allergies, medicalNotes },
      settings: {
        twoStepTrigger,
        autoLockMinutes,
        tokenExpirationHours,
        heartbeatFreq,
        emailAlerts,
        expiryWarnings,
        strictLocalOnly,
        telemetryOptIn
      },
      documents,
      assets,
      contacts,
      plans,
      crisisSession,
      temporaryAccessRecords
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cognitive-shadow-dossier-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExported(true);
    setTimeout(() => setExported(false), 2500);
  };

  const handleResetData = () => {
    resetToDemoData();
    setResetConfirmOpen(false);
  };

  return (
    <div className="space-y-10 max-w-4xl">
      {/* 1. Header Surface */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-[#0F1219]/90 to-[#0A0C11]/90 border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-cyan-400">
            <Lock className="w-3.5 h-3.5" />
            <span>Platform Governance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-white">
            Settings & Preferences
          </h1>
          <p className="text-sm text-zinc-400 font-light max-w-lg leading-relaxed">
            Manage your personal profile, standby heartbeat frequencies, security safeguards, notifications, and client data export.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-mono border border-cyan-500/30 flex items-center gap-2 transition-colors cursor-pointer self-start md:self-auto shrink-0 shadow-sm"
        >
          {saved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
          <span>{saved ? 'Preferences Saved' : 'Save Changes'}</span>
        </button>
      </div>

      {/* 2. Organized Sections */}
      <div className="space-y-6">
        {/* Section 1: Profile */}
        <div className="p-7 rounded-3xl bg-[#0B0D12] border border-white/[0.06] space-y-5">
          <div className="flex items-center gap-2.5 text-xs font-mono uppercase tracking-widest text-zinc-400">
            <User className="w-4 h-4 text-cyan-400" />
            <span>1. Profile & Emergency Markers</span>
          </div>

          {validationError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono">
              {validationError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="text-zinc-500 block text-[11px] uppercase mb-1.5">Designated Primary Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => { setName(e.target.value); setValidationError(''); }}
                className="w-full bg-[#08090C] border border-white/[0.08] rounded-xl px-3.5 py-2 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            <div>
              <label className="text-zinc-500 block text-[11px] uppercase mb-1.5">Account Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); setValidationError(''); }}
                className="w-full bg-[#08090C] border border-white/[0.08] rounded-xl px-3.5 py-2 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            <div>
              <label className="text-zinc-500 block text-[11px] uppercase mb-1.5">Emergency Blood Marker</label>
              <select
                value={bloodGroup}
                onChange={(e) => { setBloodGroup(e.target.value); setValidationError(''); }}
                className="w-full bg-[#08090C] border border-white/[0.08] rounded-xl px-3.5 py-2 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500/50"
              >
                <option value="">Select blood group</option>
                <option value="A+">A+</option><option value="A-">A-</option>
                <option value="B+">B+</option><option value="B-">B-</option>
                <option value="AB+">AB+</option><option value="AB-">AB-</option>
                <option value="O+">O+</option><option value="O-">O-</option>
              </select>
            </div>
            <div>
              <label className="text-zinc-500 block text-[11px] uppercase mb-1.5">Critical Allergies / Contraindications</label>
              <input
                type="text"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                className="w-full bg-[#08090C] border border-white/[0.08] rounded-xl px-3.5 py-2 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-zinc-500 block text-[11px] uppercase mb-1.5">Medical & Incident Directive Notes</label>
              <input
                type="text"
                value={medicalNotes}
                onChange={(e) => setMedicalNotes(e.target.value)}
                className="w-full bg-[#08090C] border border-white/[0.08] rounded-xl px-3.5 py-2 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Security */}
        <div className="p-7 rounded-3xl bg-[#0B0D12] border border-white/[0.06] space-y-4">
          <div className="flex items-center gap-2.5 text-xs font-mono uppercase tracking-widest text-zinc-400">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>2. Security & Handover</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div>
                <span className="font-medium text-white">Temporary Access Expiration</span>
                <p className="text-zinc-400 font-light text-[11px] mt-0.5">Emergency share tokens auto-expire after a strict duration</p>
              </div>
              <select
                value={tokenExpirationHours}
                onChange={(e) => setTokenExpirationHours(e.target.value)}
                className="bg-[#0A0C11] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-cyan-300 font-mono"
              >
                <option value="12">12 Hours</option>
                <option value="24">24 Hours (Recommended)</option>
                <option value="48">48 Hours</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div>
                <span className="font-medium text-white">Two-Step Crisis Trigger Confirmation</span>
                <p className="text-zinc-400 font-light text-[11px] mt-0.5">Require deliberate confirmation modal before activating crisis state</p>
              </div>
              <button
                type="button"
                onClick={() => setTwoStepTrigger(!twoStepTrigger)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  twoStepTrigger ? 'bg-cyan-500' : 'bg-zinc-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    twoStepTrigger ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div>
                <span className="font-medium text-white">Idle Standby Lock</span>
                <p className="text-zinc-400 font-light text-[11px] mt-0.5">Auto-lock dashboard session after inactivity</p>
              </div>
              <select
                value={autoLockMinutes}
                onChange={(e) => setAutoLockMinutes(e.target.value)}
                className="bg-[#0A0C11] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-cyan-300 font-mono"
              >
                <option value="5">5 minutes</option>
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="0">Disabled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Notifications */}
        <div className="p-7 rounded-3xl bg-[#0B0D12] border border-white/[0.06] space-y-4">
          <div className="flex items-center gap-2.5 text-xs font-mono uppercase tracking-widest text-zinc-400">
            <Bell className="w-4 h-4 text-cyan-400" />
            <span>3. Notifications & Standby Heartbeat</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div>
                <span className="font-medium text-white">Standby Check-In Frequency</span>
                <p className="text-zinc-400 font-light text-[11px] mt-0.5">Gentle reminder to audit upcoming policy expiries</p>
              </div>
              <select
                value={heartbeatFreq}
                onChange={(e) => setHeartbeatFreq(e.target.value)}
                className="bg-[#0A0C11] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-cyan-300 font-mono"
              >
                <option value="7">Every 7 days</option>
                <option value="14">Every 14 days (Recommended)</option>
                <option value="30">Every 30 days</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div>
                <span className="font-medium text-white">Document Expiration Alerts</span>
                <p className="text-zinc-400 font-light text-[11px] mt-0.5">Warning when policies or IDs enter the 30-day expiry window</p>
              </div>
              <button
                type="button"
                onClick={() => setExpiryWarnings(!expiryWarnings)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  expiryWarnings ? 'bg-cyan-500' : 'bg-zinc-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    expiryWarnings ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div>
                <span className="font-medium text-white">Critical Email Alerts</span>
                <p className="text-zinc-400 font-light text-[11px] mt-0.5">Dispatch security emails when access tokens are viewed</p>
              </div>
              <button
                type="button"
                onClick={() => setEmailAlerts(!emailAlerts)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  emailAlerts ? 'bg-cyan-500' : 'bg-zinc-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    emailAlerts ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Section 4: Privacy */}
        <div className="p-7 rounded-3xl bg-[#0B0D12] border border-white/[0.06] space-y-4">
          <div className="flex items-center gap-2.5 text-xs font-mono uppercase tracking-widest text-zinc-400">
            <Lock className="w-4 h-4 text-cyan-400" />
            <span>4. Privacy & Telemetry Boundary</span>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-3 text-xs leading-relaxed text-zinc-400 font-light">
            <p>
              Cognitive Shadow operates on strict zero-surveillance design. We do not dispatch live emergency services, integrate with public databases, or execute untrusted third-party trackers.
            </p>
            <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
              <div>
                <span className="font-medium text-white block">Active Backend Engine</span>
                <span className="text-[11px] text-zinc-500">
                  {isSupabaseConfigured
                    ? 'Connected to Supabase Cloud (Row Level Security Active)'
                    : 'Local Development Fallback (Supabase unconfigured in .env)'}
                </span>
              </div>
              <span className={`font-mono text-xs ${isSupabaseConfigured ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isSupabaseConfigured ? 'SUPABASE' : 'LOCAL FALLBACK'}
              </span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
              <div>
                <span className="font-medium text-white block">Client-Isolated Storage</span>
                <span className="text-[11px] text-zinc-500">Keep dossiers bound to authenticated user session</span>
              </div>
              <span className="font-mono text-cyan-300 text-xs">Active</span>
            </div>
          </div>
        </div>

        {/* Section 5: Data Management */}
        <div className="p-7 rounded-3xl bg-[#0B0D12] border border-white/[0.06] space-y-4">
          <div className="flex items-center gap-2.5 text-xs font-mono uppercase tracking-widest text-zinc-400">
            <Database className="w-4 h-4 text-cyan-400" />
            <span>5. Data Management & Dossier Portability</span>
          </div>

          <p className="text-xs text-zinc-400 font-light leading-relaxed">
            Download an offline backup copy of your entire Cognitive Shadow vault, contacts, and crisis configuration, or reset the local environment to the default blueprint.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleExportData}
              className="px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 text-xs font-mono border border-white/[0.08] flex items-center gap-2 transition-colors cursor-pointer"
            >
              {exported ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{exported ? 'Dossier Exported' : 'Export JSON Dossier Backup'}</span>
            </button>

            <button
              onClick={() => setResetConfirmOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-mono border border-rose-500/20 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              <span>Reset Local Demo Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-3xl bg-[#0D0F16] border border-rose-900/60 shadow-2xl space-y-5">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <h3 className="text-lg font-medium text-white">Reset Local Data?</h3>
            </div>

            <p className="text-xs text-zinc-400 font-light leading-relaxed">
              This will restore all documents, assets, emergency contacts, plans, and crisis records to the default demo state. Any custom modifications will be cleared.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setResetConfirmOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-mono text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResetData}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-medium transition-colors shadow-lg shadow-rose-600/20"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
