import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Phone,
  Box,
  FileText,
  FileSpreadsheet,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Shield,
  Sparkles,
  HeartPulse
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const { plans, selectPlan } = useApp();

  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Personal Profile
  const [name, setName] = useState(user?.name || 'Alex Morgan');
  const [bloodGroup, setBloodGroup] = useState('O+ (Universal Donor)');
  const [allergies, setAllergies] = useState('Penicillin, Cephalosporins');
  const [location, setLocation] = useState('San Francisco, CA');

  // Step 2: Emergency Contact
  const [contactName, setContactName] = useState('Rahul Morgan');
  const [contactRelationship, setContactRelationship] = useState('Brother / Medical Proxy');
  const [contactPhone, setContactPhone] = useState('+1 (555) 382-9901');
  const [contactEmail, setContactEmail] = useState('rahul.morgan@example.com');

  // Step 3: Critical Asset
  const [assetName, setAssetName] = useState('2024 Tesla Model 3 Long Range');
  const [assetType, setAssetType] = useState('Vehicle');
  const [assetIdentifier, setAssetIdentifier] = useState('CA-7XYZ890 (VIN: 5YJ3E1EB8PF992104)');
  const [assetInsurance, setAssetInsurance] = useState('State Farm Auto #POL-882901');

  // Step 4: Shadow Vault Document
  const [docName, setDocName] = useState('Health Insurance Card & Advance Directive');
  const [docCategory, setDocCategory] = useState('Medical & Health');
  const [docExpiry, setDocExpiry] = useState('2027-12-31');
  const [docRelevance, setDocRelevance] = useState('Immediate Emergency Access');

  // Step 5: Primary Plan
  const [selectedPlanId, setSelectedPlanId] = useState('plan-auto-accident');

  const steps = [
    { number: 1, title: 'Personal Profile', icon: User, desc: 'Medical markers & baseline identity' },
    { number: 2, title: 'Emergency Contact', icon: Phone, desc: 'Primary proxy & care coordinator' },
    { number: 3, title: 'Critical Asset', icon: Box, desc: 'Vehicle, property or primary device' },
    { number: 4, title: 'Shadow Vault', icon: FileText, desc: 'Essential emergency document' },
    { number: 5, title: 'Emergency Plan', icon: FileSpreadsheet, desc: 'Pre-configured response blueprint' },
  ];

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    selectPlan(selectedPlanId);
    updateProfile({
      name,
      hasCompletedOnboarding: true,
    });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-zinc-100 flex flex-col justify-between selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Top Header */}
      <header className="h-16 px-6 sm:px-10 border-b border-white/[0.06] bg-[#090A0E]/80 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
          <span className="text-sm font-medium tracking-wider uppercase text-zinc-200">
            Cognitive Shadow
          </span>
          <span className="hidden sm:inline-block text-zinc-600">/</span>
          <span className="hidden sm:inline-block text-xs font-mono uppercase tracking-widest text-zinc-400">
            Onboarding Protocol
          </span>
        </div>

        <button
          onClick={handleComplete}
          className="text-xs font-mono text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Skip to Dashboard
        </button>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex flex-col justify-center max-w-3xl w-full mx-auto px-6 py-10">
        {/* Progress Bar & Indicators */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3 text-xs font-mono">
            <span className="text-cyan-400 font-medium">STEP {currentStep} OF 5</span>
            <span className="text-zinc-500">{steps[currentStep - 1].title}</span>
          </div>
          
          <div className="w-full h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300 rounded-full"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>

          {/* Stepper Dots */}
          <div className="grid grid-cols-5 gap-2 mt-4">
            {steps.map((step) => {
              const Icon = step.icon;
              const isPast = step.number < currentStep;
              const isCurrent = step.number === currentStep;

              return (
                <button
                  key={step.number}
                  onClick={() => setCurrentStep(step.number)}
                  className={cn(
                    "text-left p-2.5 rounded-xl border transition-all cursor-pointer",
                    isCurrent
                      ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-300"
                      : isPast
                      ? "bg-white/[0.02] border-white/[0.06] text-zinc-300"
                      : "bg-transparent border-transparent text-zinc-600 hover:text-zinc-400"
                  )}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono uppercase">0{step.number}</span>
                  </div>
                  <p className="text-xs font-medium truncate hidden md:block">{step.title}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step Card */}
        <div className="p-8 sm:p-10 rounded-3xl bg-[#0B0D12] border border-white/[0.08] shadow-2xl relative overflow-hidden">
          {/* Subtle glow effect */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* STEP 1: PERSONAL PROFILE */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono mb-2">
                  <User className="w-3.5 h-3.5" />
                  <span>Principal Identity</span>
                </div>
                <h2 className="text-2xl font-light text-white tracking-tight">Personal & Emergency Profile</h2>
                <p className="text-sm text-zinc-400 font-light mt-1">
                  Establish your baseline identity markers and critical emergency medical instructions.
                </p>
              </div>

              <div className="space-y-4 text-xs font-mono">
                <div>
                  <label className="text-zinc-400 block mb-1.5 uppercase text-[11px]">Primary Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#08090C] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-zinc-400 block mb-1.5 uppercase text-[11px]">Blood Group</label>
                    <input
                      type="text"
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full bg-[#08090C] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1.5 uppercase text-[11px]">Primary City / Region</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-[#08090C] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1.5 uppercase text-[11px]">Allergies / Critical Contraindications</label>
                  <input
                    type="text"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    className="w-full bg-[#08090C] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                  />
                  <p className="text-[11px] text-zinc-500 font-sans mt-1">
                    Rendered directly at the top of your Emergency Brief during acute crises.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: EMERGENCY CONTACT */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono mb-2">
                  <Phone className="w-3.5 h-3.5" />
                  <span>Designated Proxy</span>
                </div>
                <h2 className="text-2xl font-light text-white tracking-tight">Primary Emergency Contact</h2>
                <p className="text-sm text-zinc-400 font-light mt-1">
                  The person your Shadow coordinates with first if you are unresponsive or in distress.
                </p>
              </div>

              <div className="space-y-4 text-xs font-mono">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-zinc-400 block mb-1.5 uppercase text-[11px]">Full Name</label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full bg-[#08090C] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1.5 uppercase text-[11px]">Relationship & Role</label>
                    <input
                      type="text"
                      value={contactRelationship}
                      onChange={(e) => setContactRelationship(e.target.value)}
                      className="w-full bg-[#08090C] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-zinc-400 block mb-1.5 uppercase text-[11px]">Phone Number</label>
                    <input
                      type="text"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full bg-[#08090C] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1.5 uppercase text-[11px]">Secure Email</label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full bg-[#08090C] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-cyan-300 font-sans text-xs flex items-start gap-2.5">
                  <Shield className="w-4 h-4 shrink-0 text-cyan-400 mt-0.5" />
                  <span>
                    Designated as <strong>Medical Proxy & Incident Lead</strong>. This contact receives priority access to relevant documents during active crisis mode.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: CRITICAL ASSET */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono mb-2">
                  <Box className="w-3.5 h-3.5" />
                  <span>Tangible Asset</span>
                </div>
                <h2 className="text-2xl font-light text-white tracking-tight">Primary Critical Asset</h2>
                <p className="text-sm text-zinc-400 font-light mt-1">
                  Link an asset that frequently requires insurance, registration, or recovery information.
                </p>
              </div>

              <div className="space-y-4 text-xs font-mono">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-zinc-400 block mb-1.5 uppercase text-[11px]">Asset Name</label>
                    <input
                      type="text"
                      value={assetName}
                      onChange={(e) => setAssetName(e.target.value)}
                      className="w-full bg-[#08090C] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1.5 uppercase text-[11px]">Category</label>
                    <select
                      value={assetType}
                      onChange={(e) => setAssetType(e.target.value)}
                      className="w-full bg-[#08090C] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                    >
                      <option value="Vehicle">Vehicle</option>
                      <option value="Property">Real Estate / Home</option>
                      <option value="Hardware">Primary Device</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1.5 uppercase text-[11px]">Serial Number or Registration</label>
                  <input
                    type="text"
                    value={assetIdentifier}
                    onChange={(e) => setAssetIdentifier(e.target.value)}
                    className="w-full bg-[#08090C] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1.5 uppercase text-[11px]">Insurer & Policy Number</label>
                  <input
                    type="text"
                    value={assetInsurance}
                    onChange={(e) => setAssetInsurance(e.target.value)}
                    className="w-full bg-[#08090C] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: SHADOW VAULT DOCUMENT */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono mb-2">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Encrypted Dossier</span>
                </div>
                <h2 className="text-2xl font-light text-white tracking-tight">Essential Vault Document</h2>
                <p className="text-sm text-zinc-400 font-light mt-1">
                  Ensure your highest-priority document is categorized and ready for instant sharing.
                </p>
              </div>

              <div className="space-y-4 text-xs font-mono">
                <div>
                  <label className="text-zinc-400 block mb-1.5 uppercase text-[11px]">Document Name</label>
                  <input
                    type="text"
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    className="w-full bg-[#08090C] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-zinc-400 block mb-1.5 uppercase text-[11px]">Category</label>
                    <input
                      type="text"
                      value={docCategory}
                      onChange={(e) => setDocCategory(e.target.value)}
                      className="w-full bg-[#08090C] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1.5 uppercase text-[11px]">Policy Expiry Date</label>
                    <input
                      type="date"
                      value={docExpiry}
                      onChange={(e) => setDocExpiry(e.target.value)}
                      className="w-full bg-[#08090C] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1.5 uppercase text-[11px]">Emergency Access Level</label>
                  <input
                    type="text"
                    value={docRelevance}
                    onChange={(e) => setDocRelevance(e.target.value)}
                    className="w-full bg-[#08090C] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: EMERGENCY PLANS */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono mb-2">
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Contingency Blueprints</span>
                </div>
                <h2 className="text-2xl font-light text-white tracking-tight">Select Default Emergency Plan</h2>
                <p className="text-sm text-zinc-400 font-light mt-1">
                  Choose which contingency blueprint your Shadow prepares as the immediate default.
                </p>
              </div>

              <div className="space-y-3">
                {plans.map((p) => {
                  const isSelected = selectedPlanId === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPlanId(p.id)}
                      className={cn(
                        "p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4",
                        isSelected
                          ? "bg-cyan-500/10 border-cyan-500/40 text-white"
                          : "bg-white/[0.02] border-white/[0.06] text-zinc-300 hover:border-white/10"
                      )}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{p.name}</span>
                          {isSelected && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-cyan-500/20 text-cyan-300">
                              Selected
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 font-light line-clamp-1">{p.description}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[11px] font-mono text-zinc-500 block">
                          {p.defaultTasks.length} steps
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="mt-8 pt-6 border-t border-white/[0.06] flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={cn(
                "px-4 py-2.5 rounded-xl border text-xs font-mono flex items-center gap-2 transition-colors",
                currentStep === 1
                  ? "border-transparent text-zinc-600 cursor-not-allowed"
                  : "border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.04] cursor-pointer"
              )}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-black font-semibold text-xs font-mono flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              <span>{currentStep === 5 ? 'Launch Shadow Standby' : 'Next Step'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center border-t border-white/[0.04] text-[11px] font-mono text-zinc-600">
        Cognitive Shadow Standby Operating System • All profiles stored locally
      </footer>
    </div>
  );
};
