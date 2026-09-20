import React, { useState } from 'react';
import {
  Users,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Clock,
  Shield,
  Star,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  X,
  Save,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EmergencyContact } from '../types';

export const EmergencyContacts: React.FC = () => {
  const { contacts, addContact, updateContact, deleteContact } = useApp();

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [deleteConfirmContact, setDeleteConfirmContact] = useState<EmergencyContact | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Primary Proxy');
  const [availability, setAvailability] = useState('Immediate 24/7');
  const [primary, setPrimary] = useState(false);
  const [medicalProxy, setMedicalProxy] = useState(false);
  const [verified, setVerified] = useState(true);

  const primaryContact = contacts.find((c) => c.primary) || contacts[0];

  const openAddModal = () => {
    setEditingContactId(null);
    setName('');
    setRelationship('Family Member');
    setCountryCode('+91');
    setPhone('');
    setEmail('contact@example.com');
    setRole('Emergency Coordinator');
    setAvailability('Immediate 24/7');
    setPrimary(false);
    setMedicalProxy(false);
    setVerified(true);
    setIsFormOpen(true);
  };

  const openEditModal = (contact: EmergencyContact) => {
    setEditingContactId(contact.id);
    setName(contact.name);
    setRelationship(contact.relationship);
    const phoneMatch = contact.phone.match(/^\+(\d{1,3})(.*)$/);
    if (phoneMatch) {
      const knownCodes = ['+91', '+1', '+44', '+61', '+65', '+971', '+81', '+49', '+33', '+39', '+86', '+94', '+880'];
      const matchedCode = knownCodes.find((code) => contact.phone.startsWith(code));
      setCountryCode(matchedCode || `+${phoneMatch[1]}`);
      setPhone((matchedCode ? contact.phone.slice(matchedCode.length) : phoneMatch[2]).replace(/\D/g, ''));
    } else {
      setCountryCode('+91');
      setPhone(contact.phone.replace(/\D/g, ''));
    }
    setEmail(contact.email);
    setRole(contact.role);
    setAvailability(contact.availability);
    setPrimary(contact.primary);
    setMedicalProxy(contact.medicalProxy);
    setVerified(contact.verified);
    setIsFormOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const nationalDigits = phone.replace(/\D/g, '');
    if (nationalDigits.length < 6 || nationalDigits.length > 15) return;
    const normalizedPhone = `${countryCode}${nationalDigits}`;

    if (editingContactId) {
      updateContact(editingContactId, {
        name: name.trim(),
        relationship: relationship.trim(),
        phone: normalizedPhone,
        email: email.trim(),
        role: role.trim(),
        availability: availability.trim(),
        primary,
        medicalProxy,
        verified
      });
    } else {
      addContact({
        name: name.trim(),
        relationship: relationship.trim(),
        phone: phone.trim(),
        email: email.trim(),
        role: role.trim(),
        availability: availability.trim(),
        primary,
        medicalProxy,
        verified
      });
    }

    setIsFormOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmContact) {
      deleteContact(deleteConfirmContact.id);
      setDeleteConfirmContact(null);
    }
  };

  return (
    <div className="space-y-10 max-w-5xl">
      {/* 1. Header Surface */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-[#0F1219]/90 to-[#0A0C11]/90 border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-cyan-400">
            <Users className="w-3.5 h-3.5" />
            <span>Delegated Inner Circle</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-white">
            Emergency Contacts
          </h1>
          <p className="text-sm text-zinc-400 font-light max-w-lg leading-relaxed">
            The trusted circle reached when you cannot respond. Each person has pre-assigned tasks and access scopes.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 self-start md:self-auto shrink-0">
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex items-center gap-4">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                Primary Proxy
              </div>
              <div className="text-lg font-medium text-white font-mono flex items-center gap-1.5">
                <span>{primaryContact ? primaryContact.name : 'Not Set'}</span>
                {primaryContact && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
              <div className="text-[11px] text-zinc-400 font-light">
                {contacts.length} circle members configured
              </div>
            </div>
          </div>

          <button
            onClick={openAddModal}
            className="px-5 py-3 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-mono border border-cyan-500/30 flex items-center gap-2 transition-all cursor-pointer shadow-sm self-stretch sm:self-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      {/* 2. Redesigned Contact Cards Grid */}
      {contacts.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#0B0D12] border border-white/[0.06] space-y-3">
          <Users className="w-8 h-8 text-zinc-600 mx-auto" />
          <p className="text-zinc-400 text-sm font-light">No emergency contacts registered.</p>
          <button
            onClick={openAddModal}
            className="text-xs font-mono text-cyan-400 hover:underline cursor-pointer"
          >
            Add a trusted contact
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {contacts.map((contact) => {
            const isPrimary = contact.primary;
            return (
              <div
                key={contact.id}
                className={`p-6 sm:p-7 rounded-3xl transition-all duration-200 flex flex-col justify-between space-y-5 border relative group ${
                  isPrimary
                    ? 'bg-[#0E121B] border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.06)]'
                    : 'bg-[#0B0D12] border-white/[0.06] hover:border-white/[0.14]'
                }`}
              >
                <div className="space-y-4">
                  {/* Top Row: Name, Verified State, Primary Badge & Actions */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-medium text-white">
                          {contact.name}
                        </h2>
                        {contact.verified ? (
                          <span title="Verified contact token" className="text-emerald-400">
                            <CheckCircle2 className="w-4 h-4" />
                          </span>
                        ) : (
                          <span title="Verification pending" className="text-amber-400/80">
                            <AlertCircle className="w-4 h-4" />
                          </span>
                        )}
                        {contact.medicalProxy && (
                          <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-950/40 text-rose-300 border border-rose-800/30">
                            Medical Proxy
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 font-light mt-0.5">
                        {contact.relationship}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {isPrimary ? (
                        <span className="text-[10px] font-mono uppercase tracking-wider px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-semibold flex items-center gap-1.5">
                          <Star className="w-3 h-3 fill-cyan-400 text-cyan-400" />
                          <span>Primary Proxy</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-white/[0.03] text-zinc-400 border border-white/[0.05]">
                          {contact.role}
                        </span>
                      )}

                      <button
                        onClick={() => openEditModal(contact)}
                        title="Edit Contact"
                        className="p-1 rounded-lg hover:bg-white/[0.08] text-zinc-400 hover:text-cyan-300 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmContact(contact)}
                        title="Delete Contact"
                        className="p-1 rounded-lg hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Role & Availability details */}
                  <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500 font-mono text-[10px] uppercase">Role</span>
                      <span className="text-zinc-200 font-medium">{contact.role}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500 font-mono text-[10px] uppercase">Availability</span>
                      <span className="text-zinc-300 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-zinc-500" />
                        <span>{contact.availability}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Direct Communication Actions */}
                <div className="pt-2 border-t border-white/[0.04] grid grid-cols-2 gap-2 text-xs font-mono">
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center justify-center gap-2 text-zinc-200 hover:text-white p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05] transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Call</span>
                  </a>

                  <a
                    href={`mailto:${contact.email}`}
                    className="flex items-center justify-center gap-2 text-zinc-200 hover:text-white p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05] transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Email</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Contact Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-[#0C0E14] border border-white/[0.1] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-medium text-white">
                  {editingContactId ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
                </h3>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.05] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-400 block mb-1.5 uppercase text-[10px]">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Morgan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#08090C] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1.5 uppercase text-[10px]">Relationship *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Brother, Physician, Spouse"
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    className="w-full bg-[#08090C] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-400 block mb-1.5 uppercase text-[10px]">Phone Number *</label>
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-[112px] shrink-0 bg-[#08090C] border border-white/[0.08] rounded-xl px-2.5 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                      aria-label="Country calling code"
                    >
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+61">🇦🇺 +61</option>
                      <option value="+65">🇸🇬 +65</option>
                      <option value="+971">🇦🇪 +971</option>
                      <option value="+81">🇯🇵 +81</option>
                      <option value="+49">🇩🇪 +49</option>
                      <option value="+33">🇫🇷 +33</option>
                      <option value="+39">🇮🇹 +39</option>
                      <option value="+86">🇨🇳 +86</option>
                      <option value="+94">🇱🇰 +94</option>
                      <option value="+880">🇧🇩 +880</option>
                    </select>
                    <input
                      type="tel"
                      required
                      inputMode="tel"
                      placeholder={countryCode === '+91' ? '98765 43210' : 'Phone number'}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/[^0-9\s()-]/g, ''))}
                      className="min-w-0 flex-1 bg-[#08090C] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                  <p className="mt-1.5 text-[10px] text-zinc-500">Stored securely in international format: {countryCode}{phone.replace(/\D/g, '') || '…'}</p>
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1.5 uppercase text-[10px]">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="contact@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#08090C] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-400 block mb-1.5 uppercase text-[10px]">Role Designation</label>
                  <input
                    type="text"
                    placeholder="Primary Proxy, Family Support, Medical Lead"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-[#08090C] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1.5 uppercase text-[10px]">Availability Window</label>
                  <input
                    type="text"
                    placeholder="Immediate 24/7, On-Call, Evenings"
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    className="w-full bg-[#08090C] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>

              {/* Checkbox Options */}
              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] cursor-pointer hover:bg-white/[0.04] transition-colors">
                  <input
                    type="checkbox"
                    checked={primary}
                    onChange={(e) => setPrimary(e.target.checked)}
                    className="rounded border-zinc-700 text-cyan-500 focus:ring-cyan-500 w-4 h-4 bg-[#08090C]"
                  />
                  <div>
                    <span className="text-white text-xs font-medium block">Designate as Primary Proxy</span>
                    <span className="text-[10px] text-zinc-400 font-light">First contact notified with full incident coordination authority</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] cursor-pointer hover:bg-white/[0.04] transition-colors">
                  <input
                    type="checkbox"
                    checked={medicalProxy}
                    onChange={(e) => setMedicalProxy(e.target.checked)}
                    className="rounded border-zinc-700 text-cyan-500 focus:ring-cyan-500 w-4 h-4 bg-[#08090C]"
                  />
                  <div>
                    <span className="text-white text-xs font-medium block">Designate as Medical Proxy</span>
                    <span className="text-[10px] text-zinc-400 font-light">Authorized to access health summaries and liaise with attending physicians</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] cursor-pointer hover:bg-white/[0.04] transition-colors">
                  <input
                    type="checkbox"
                    checked={verified}
                    onChange={(e) => setVerified(e.target.checked)}
                    className="rounded border-zinc-700 text-cyan-500 focus:ring-cyan-500 w-4 h-4 bg-[#08090C]"
                  />
                  <div>
                    <span className="text-white text-xs font-medium block">Verified Contact Token</span>
                    <span className="text-[10px] text-zinc-400 font-light">Mark phone number and email as confirmed active</span>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-mono text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-semibold text-xs font-mono border border-cyan-500/40 flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{editingContactId ? 'Save Changes' : 'Add Contact'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#0D0F16] border border-rose-900/60 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <h3 className="text-base font-medium text-white">Delete Emergency Contact?</h3>
            </div>

            <p className="text-xs text-zinc-400 font-light leading-relaxed">
              Are you sure you want to remove <strong className="text-white">"{deleteConfirmContact.name}"</strong>? This will remove them from your care circle and from all associated emergency response plans.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setDeleteConfirmContact(null)}
                className="px-4 py-2 rounded-xl text-xs font-mono text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-medium transition-colors shadow-lg shadow-rose-600/20"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
