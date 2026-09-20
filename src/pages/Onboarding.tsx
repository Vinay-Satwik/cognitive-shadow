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
  Plus,
  Trash2,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DocumentCategory, EmergencyContact, Asset, Document } from '../types';
import { cn } from '../lib/utils';

interface OnboardingContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  role: string;
  primary: boolean;
  medicalProxy: boolean;
}

interface OnboardingAsset {
  id: string;
  name: string;
  type: string;
  registrationOrSerial: string;
  insurance: string;
}

interface OnboardingDoc {
  id: string;
  name: string;
  category: DocumentCategory;
  expiryDate: string;
  emergencyRelevance: 'Critical' | 'High' | 'Moderate' | 'Low';
}

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const { plans, selectPlan, setContacts, setAssets, setDocuments, updateUserProfile } = useApp();

  const isDemo = user?.id === 'usr-alex-morgan';

  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Personal Profile
  const [name, setName] = useState(user?.name || (isDemo ? 'Alex Morgan' : ''));
  const [bloodGroup, setBloodGroup] = useState(isDemo ? 'O+ (Universal Donor)' : 'O+');
  const [allergies, setAllergies] = useState(isDemo ? 'Penicillin, Cephalosporins' : 'None declared');
  const [location, setLocation] = useState(isDemo ? 'San Francisco, CA' : '');
  const [medicalNotes, setMedicalNotes] = useState(isDemo ? 'Asthma inhaler in travel kit.' : '');

  // Step 2: Emergency Contacts (Multi-Record Support)
  const [contactsList, setContactsList] = useState<OnboardingContact[]>([
    {
      id: 'con-1',
      name: isDemo ? 'Rahul Morgan' : '',
      relationship: isDemo ? 'Brother / Medical Proxy' : 'Primary Proxy / Family',
      phone: isDemo ? '+1 (555) 382-9901' : '',
      email: isDemo ? 'rahul.morgan@example.com' : '',
      role: 'Primary Incident Coordinator & Proxy',
      primary: true,
      medicalProxy: true
    }
  ]);

  // Step 3: Critical Assets (Multi-Record Support)
  const [assetsList, setAssetsList] = useState<OnboardingAsset[]>([
    {
      id: 'ast-1',
      name: isDemo ? 'Honda City' : '',
      type: 'Vehicle',
      registrationOrSerial: isDemo ? 'CA-7XYZ890' : '',
      insurance: isDemo ? 'National Auto Insurance #POL-882901' : ''
    }
  ]);

  // Step 4: Shadow Vault Documents (Multi-Record Support)
  const [docsList, setDocsList] = useState<OnboardingDoc[]>([
    {
      id: 'doc-1',
      name: isDemo ? 'Vehicle Insurance Policy' : 'Health Insurance Card & Advance Directive',
      category: 'Insurance',
      expiryDate: '2027-12-31',
      emergencyRelevance: 'Critical'
    }
  ]);

  // Step 5: Primary Plan
  const [selectedPlanId, setSelectedPlanId] = useState('plan-auto-accident');

  const steps = [
    { number: 1, title: 'Personal Profile', icon: User, desc: 'Medical markers & baseline identity' },
    { number: 2, title: 'Emergency Contacts', icon: Phone, desc: 'Primary & secondary crisis proxies' },
    { number: 3, title: 'Critical Assets', icon: Box, desc: 'Vehicles, real estate & devices' },
    { number: 4, title: 'Shadow Vault', icon: FileText, desc: 'Essential emergency documents' },
    { number: 5, title: 'Emergency Plan', icon: FileSpreadsheet, desc: 'Pre-configured response blueprint' },
  ];

  // Contact handlers
  const handleAddContact = () => {
    const newId = `con-${Date.now()}`;
    setContactsList((prev) => [
      ...prev,
      {
        id: newId,
        name: '',
        relationship: 'Care Circle / Alternate Contact',
        phone: '',
        email: '',
        role: 'Secondary Responder',
        primary: false,
        medicalProxy: false
      }
    ]);
  };

  const handleUpdateContact = (id: string, updates: Partial<OnboardingContact>) => {
    setContactsList((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const handleRemoveContact = (id: string) => {
    if (contactsList.length <= 1) return;
    setContactsList((prev) => prev.filter((c) => c.id !== id));
  };

  // Asset handlers
  const handleAddAsset = () => {
    const newId = `ast-${Date.now()}`;
    setAssetsList((prev) => [
      ...prev,
      {
        id: newId,
        name: '',
        type: 'Property',
        registrationOrSerial: '',
        insurance: ''
      }
    ]);
  };

  const handleUpdateAsset = (id: string, updates: Partial<OnboardingAsset>) => {
    setAssetsList((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
  };

  const handleRemoveAsset = (id: string) => {
    if (assetsList.length <= 1) return;
    setAssetsList((prev) => prev.filter((a) => a.id !== id));
  };

  // Document handlers
  const handleAddDoc = () => {
    const newId = `doc-${Date.now()}`;
    setDocsList((prev) => [
      ...prev,
      {
        id: newId,
        name: '',
        category: 'Identity',
        expiryDate: '2028-06-30',
        emergencyRelevance: 'High'
      }
    ]);
  };

  const handleUpdateDoc = (id: string, updates: Partial<OnboardingDoc>) => {
    setDocsList((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
    );
  };

  const handleRemoveDoc = (id: string) => {
    if (docsList.length <= 1) return;
    setDocsList((prev) => prev.filter((d) => d.id !== id));
  };

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

  const handleComplete = async () => {
    const effectiveUserId = user?.id || 'usr-alex-morgan';
    const profileName = name.trim() || user?.name || 'Registered User';
    const directive = `In the event of medical incapacitation, notify ${contactsList[0]?.name || 'designated emergency proxy'} immediately.`;

    // 1. Save Profile to local memory store
    updateUserProfile({
      name: profileName,
      bloodGroup,
      allergies,
      primaryLocation: location,
      medicalNotes: medicalNotes || (contactsList[0]?.name ? `Advance emergency proxy designated to ${contactsList[0].name}.` : ''),
      emergencyDirective: directive,
      hasCompletedOnboarding: true,
      userId: effectiveUserId
    });

    // 2. Save Contacts (Filter out blank names)
    const validContacts: EmergencyContact[] = contactsList
      .filter((c) => c.name.trim().length > 0)
      .map((c, idx) => ({
        id: `con-${Date.now()}-${idx + 1}`,
        userId: effectiveUserId,
        name: c.name.trim(),
        relationship: c.relationship.trim() || 'Proxy',
        phone: c.phone.trim() || 'Unlisted',
        email: c.email.trim() || 'unlisted@example.com',
        role: c.role || (idx === 0 ? 'Primary Emergency Proxy' : 'Secondary Responder'),
        availability: '24/7 Standby',
        verified: true,
        primary: idx === 0,
        medicalProxy: c.medicalProxy
      }));

    if (validContacts.length > 0) {
      setContacts(validContacts);
    }

    // 3. Save Assets (Filter out blank names)
    const validAssets: Asset[] = assetsList
      .filter((a) => a.name.trim().length > 0)
      .map((a, idx) => ({
        id: `ast-${Date.now()}-${idx + 1}`,
        userId: effectiveUserId,
        name: a.name.trim(),
        type: a.type || 'Vehicle',
        registrationOrSerial: a.registrationOrSerial.trim() || 'ON-RECORD',
        purchaseDate: '2024',
        estimatedValue: '$30,000',
        insurance: a.insurance.trim() || 'Policy on record',
        warranty: 'Active',
        relatedDocuments: []
      }));

    if (validAssets.length > 0) {
      setAssets(validAssets);
    }

    // 4. Save Documents (Filter out blank names)
    const validDocs: Document[] = docsList
      .filter((d) => d.name.trim().length > 0)
      .map((d, idx) => ({
        id: `doc-${Date.now()}-${idx + 1}`,
        userId: effectiveUserId,
        name: d.name.trim(),
        category: d.category,
        description: 'Verified emergency record uploaded during onboarding protocol.',
        expiryDate: d.expiryDate,
        emergencyRelevance: d.emergencyRelevance,
        accessLevel: 'Important',
        uploadDate: 'Today',
        fileSize: '1.2 MB'
      }));

    if (validDocs.length > 0) {
      setDocuments(validDocs);
    }

    // 5. Select active emergency plan
    selectPlan(selectedPlanId);

    // 6. Synchronize with Supabase if configured
    if (isSupabaseConfigured && supabase && user?.id) {
      try {
        if (validContacts.length > 0) {
          await supabase.from('emergency_contacts').insert(
            validContacts.map((c) => ({
              user_id: user.id,
              full_name: c.name,
              relationship: c.relationship,
              role: c.role,
              phone: c.phone,
              email: c.email,
              is_primary: c.primary,
              is_medical_proxy: c.medicalProxy,
              availability: c.availability,
              verified: c.verified
            }))
          );
        }

        if (validAssets.length > 0) {
          await supabase.from('assets').insert(
            validAssets.map((a) => ({
              user_id: user.id,
              name: a.name,
              category: a.type,
              registration_or_serial: a.registrationOrSerial,
              insurer: a.insurance,
              estimated_value: a.estimatedValue,
              warranty_status: a.warranty
            }))
          );
        }

        if (validDocs.length > 0) {
          await supabase.from('documents').insert(
            validDocs.map((d) => ({
              user_id: user.id,
              name: d.name,
              category: d.category,
              description: d.description,
              expiry_date: d.expiryDate,
              emergency_access_level: d.emergencyRelevance === 'Critical' ? 'Critical' : 'Important'
            }))
          );
        }
      } catch (cloudErr) {
        console.warn('[Onboarding] Cloud synchronization note:', cloudErr);
      }
    }

    // 7. Update Auth session state with completed onboarding
    try {
      await updateProfile({
        name: profileName,
        bloodGroup,
        allergies,
        primaryLocation: location,
        medicalNotes: medicalNotes || (contactsList[0]?.name ? `Advance emergency proxy designated to ${contactsList[0].name}.` : ''),
        emergencyDirective: directive,
        hasCompletedOnboarding: true
      });
    } catch (profErr) {
      console.warn('[Onboarding] Profile completion notice:', profErr);
    }

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
          className="text-xs font-mono text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
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
                    placeholder="e.g. Sarah Connor"
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
                      placeholder="e.g. A+, O-, B+"
                      className="w-full bg-[#08090C] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1.5 uppercase text-[11px]">Primary City / Region</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Seattle, WA"
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
                    placeholder="e.g. Penicillin, Latex, None"
                    className="w-full bg-[#08090C] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                  />
                  <p className="text-[11px] text-zinc-500 font-sans mt-1">
                    Surfaced immediately at the top of your Emergency Brief during acute crises.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: EMERGENCY CONTACTS (MULTI-RECORD) */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono mb-2">
                    <Phone className="w-3.5 h-3.5" />
                    <span>Designated Proxies</span>
                  </div>
                  <h2 className="text-2xl font-light text-white tracking-tight">Emergency Contacts</h2>
                  <p className="text-sm text-zinc-400 font-light mt-1">
                    The verified people your Shadow coordinates with first if you are in distress.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddContact}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer self-start"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add another contact</span>
                </button>
              </div>

              <div className="space-y-4">
                {contactsList.map((contact, idx) => (
                  <div
                    key={contact.id}
                    className="p-5 rounded-2xl bg-[#08090C] border border-white/[0.06] space-y-4 relative"
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-cyan-400 uppercase tracking-wider text-[11px] font-medium">
                        {idx === 0 ? 'Primary Emergency Proxy' : `Secondary Contact #${idx + 1}`}
                      </span>
                      {contactsList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveContact(contact.id)}
                          className="text-zinc-500 hover:text-rose-400 transition-colors p-1 cursor-pointer"
                          title="Remove contact"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                      <div>
                        <label className="text-zinc-400 block mb-1 text-[11px]">Full Name</label>
                        <input
                          type="text"
                          value={contact.name}
                          onChange={(e) => handleUpdateContact(contact.id, { name: e.target.value })}
                          placeholder="e.g. John Miller"
                          className="w-full bg-[#0B0D12] border border-white/[0.08] rounded-xl px-3.5 py-2 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                        />
                      </div>

                      <div>
                        <label className="text-zinc-400 block mb-1 text-[11px]">Relationship & Role</label>
                        <input
                          type="text"
                          value={contact.relationship}
                          onChange={(e) => handleUpdateContact(contact.id, { relationship: e.target.value })}
                          placeholder="e.g. Spouse / Healthcare Proxy"
                          className="w-full bg-[#0B0D12] border border-white/[0.08] rounded-xl px-3.5 py-2 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                        />
                      </div>

                      <div>
                        <label className="text-zinc-400 block mb-1 text-[11px]">Phone Number</label>
                        <input
                          type="text"
                          value={contact.phone}
                          onChange={(e) => handleUpdateContact(contact.id, { phone: e.target.value })}
                          placeholder="e.g. +1 (555) 234-5678"
                          className="w-full bg-[#0B0D12] border border-white/[0.08] rounded-xl px-3.5 py-2 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                        />
                      </div>

                      <div>
                        <label className="text-zinc-400 block mb-1 text-[11px]">Secure Email</label>
                        <input
                          type="email"
                          value={contact.email}
                          onChange={(e) => handleUpdateContact(contact.id, { email: e.target.value })}
                          placeholder="e.g. proxy@example.com"
                          className="w-full bg-[#0B0D12] border border-white/[0.08] rounded-xl px-3.5 py-2 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: CRITICAL ASSETS (MULTI-RECORD) */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono mb-2">
                    <Box className="w-3.5 h-3.5" />
                    <span>Tangible Assets</span>
                  </div>
                  <h2 className="text-2xl font-light text-white tracking-tight">Critical Assets</h2>
                  <p className="text-sm text-zinc-400 font-light mt-1">
                    Link assets that require insurance, identification, or recovery details during an incident.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddAsset}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer self-start"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add another asset</span>
                </button>
              </div>

              <div className="space-y-4">
                {assetsList.map((asset, idx) => (
                  <div
                    key={asset.id}
                    className="p-5 rounded-2xl bg-[#08090C] border border-white/[0.06] space-y-4 relative"
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-cyan-400 uppercase tracking-wider text-[11px] font-medium">
                        {idx === 0 ? 'Primary Asset' : `Additional Asset #${idx + 1}`}
                      </span>
                      {assetsList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAsset(asset.id)}
                          className="text-zinc-500 hover:text-rose-400 transition-colors p-1 cursor-pointer"
                          title="Remove asset"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                      <div className="sm:col-span-2">
                        <label className="text-zinc-400 block mb-1 text-[11px]">Asset Name</label>
                        <input
                          type="text"
                          value={asset.name}
                          onChange={(e) => handleUpdateAsset(asset.id, { name: e.target.value })}
                          placeholder="e.g. 2023 Honda Civic"
                          className="w-full bg-[#0B0D12] border border-white/[0.08] rounded-xl px-3.5 py-2 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                        />
                      </div>

                      <div>
                        <label className="text-zinc-400 block mb-1 text-[11px]">Category</label>
                        <select
                          value={asset.type}
                          onChange={(e) => handleUpdateAsset(asset.id, { type: e.target.value })}
                          className="w-full bg-[#0B0D12] border border-white/[0.08] rounded-xl px-3.5 py-2 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                        >
                          <option value="Vehicle">Vehicle</option>
                          <option value="Property">Real Estate / Home</option>
                          <option value="Hardware">Primary Device</option>
                          <option value="Other">Other Asset</option>
                        </select>
                      </div>

                      <div className="sm:col-span-1">
                        <label className="text-zinc-400 block mb-1 text-[11px]">Registration / Serial</label>
                        <input
                          type="text"
                          value={asset.registrationOrSerial}
                          onChange={(e) => handleUpdateAsset(asset.id, { registrationOrSerial: e.target.value })}
                          placeholder="e.g. VIN or Reg #"
                          className="w-full bg-[#0B0D12] border border-white/[0.08] rounded-xl px-3.5 py-2 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-zinc-400 block mb-1 text-[11px]">Insurer & Policy Reference</label>
                        <input
                          type="text"
                          value={asset.insurance}
                          onChange={(e) => handleUpdateAsset(asset.id, { insurance: e.target.value })}
                          placeholder="e.g. Geico Auto #99102-CA"
                          className="w-full bg-[#0B0D12] border border-white/[0.08] rounded-xl px-3.5 py-2 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: SHADOW VAULT DOCUMENTS (MULTI-RECORD) */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono mb-2">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Encrypted Dossier</span>
                  </div>
                  <h2 className="text-2xl font-light text-white tracking-tight">Vault Documents</h2>
                  <p className="text-sm text-zinc-400 font-light mt-1">
                    Pre-categorize your most critical documents so they surface instantly in an emergency.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddDoc}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer self-start"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add another document</span>
                </button>
              </div>

              <div className="space-y-4">
                {docsList.map((doc, idx) => (
                  <div
                    key={doc.id}
                    className="p-5 rounded-2xl bg-[#08090C] border border-white/[0.06] space-y-4 relative"
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-cyan-400 uppercase tracking-wider text-[11px] font-medium">
                        {idx === 0 ? 'Essential Document' : `Additional Document #${idx + 1}`}
                      </span>
                      {docsList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveDoc(doc.id)}
                          className="text-zinc-500 hover:text-rose-400 transition-colors p-1 cursor-pointer"
                          title="Remove document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                      <div className="sm:col-span-2">
                        <label className="text-zinc-400 block mb-1 text-[11px]">Document Name</label>
                        <input
                          type="text"
                          value={doc.name}
                          onChange={(e) => handleUpdateDoc(doc.id, { name: e.target.value })}
                          placeholder="e.g. Passport or Insurance Card"
                          className="w-full bg-[#0B0D12] border border-white/[0.08] rounded-xl px-3.5 py-2 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                        />
                      </div>

                      <div>
                        <label className="text-zinc-400 block mb-1 text-[11px]">Category</label>
                        <select
                          value={doc.category}
                          onChange={(e) => handleUpdateDoc(doc.id, { category: e.target.value as DocumentCategory })}
                          className="w-full bg-[#0B0D12] border border-white/[0.08] rounded-xl px-3.5 py-2 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                        >
                          <option value="Identity">Identity</option>
                          <option value="Medical">Medical</option>
                          <option value="Insurance">Insurance</option>
                          <option value="Vehicle">Vehicle</option>
                          <option value="Property">Property</option>
                          <option value="Legal">Legal</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-zinc-400 block mb-1 text-[11px]">Expiry Date</label>
                        <input
                          type="date"
                          value={doc.expiryDate}
                          onChange={(e) => handleUpdateDoc(doc.id, { expiryDate: e.target.value })}
                          className="w-full bg-[#0B0D12] border border-white/[0.08] rounded-xl px-3.5 py-2 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-zinc-400 block mb-1 text-[11px]">Emergency Priority</label>
                        <select
                          value={doc.emergencyRelevance}
                          onChange={(e) => handleUpdateDoc(doc.id, { emergencyRelevance: e.target.value as any })}
                          className="w-full bg-[#0B0D12] border border-white/[0.08] rounded-xl px-3.5 py-2 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                        >
                          <option value="Critical">Critical (Immediate Display)</option>
                          <option value="High">High Priority</option>
                          <option value="Moderate">Moderate Priority</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
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
                          <span className="text-base">{p.emoji}</span>
                          <span className="text-sm font-medium">{p.name}</span>
                          {isSelected && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-cyan-500/20 text-cyan-300">
                              Default
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
        Cognitive Shadow Standby Operating System • All profiles stored locally & isolated per user
      </footer>
    </div>
  );
};
