import React, { useState, useMemo } from 'react';
import {
  Key,
  Plus,
  Clock,
  Trash2,
  CheckCircle2,
  Shield,
  ShieldCheck,
  AlertTriangle,
  Copy,
  Check,
  ExternalLink,
  Eye,
  X,
  FileText,
  Users,
  Box,
  CheckSquare
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SecureAccess } from '../../types';

export const CrisisAccess: React.FC = () => {
  const { crisisSession, documents, contacts, assets, userProfile, temporaryAccessRecords, createAccessRecord, revokeAccessRecord } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [revokeConfirmRecord, setRevokeConfirmRecord] = useState<SecureAccess | null>(null);
  const [viewingRecord, setViewingRecord] = useState<SecureAccess | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Scoped exclusively to active crisis surfaced documents
  const scenarioDocs = useMemo(() => {
    return documents.filter((d) => crisisSession.surfacedDocuments?.includes(d.id));
  }, [documents, crisisSession.surfacedDocuments]);

  // Form State
  const [recipient, setRecipient] = useState('');
  const [roleOrPurpose, setRoleOrPurpose] = useState('Attending Medical Staff');
  const [customRole, setCustomRole] = useState('');
  const [expiration, setExpiration] = useState('24 hours');
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [selectedScopes, setSelectedScopes] = useState<string[]>([
    'Emergency Brief',
    'Critical Contacts',
    'Relevant Assets & Insurance',
    'Priority Tasks',
    'Surfaced Documents'
  ]);

  // Pre-select all surfaced documents when modal opens
  const handleOpenModal = () => {
    setSelectedDocs(scenarioDocs.map((d) => d.name));
    setRecipient('');
    setRoleOrPurpose('Attending Medical Staff');
    setCustomRole('');
    setExpiration('24 hours');
    setShowModal(true);
  };

  const toggleDocSelection = (docName: string) => {
    setSelectedDocs((prev) =>
      prev.includes(docName) ? prev.filter((d) => d !== docName) : [...prev, docName]
    );
  };

  const toggleScopeSelection = (scopeName: string) => {
    setSelectedScopes((prev) =>
      prev.includes(scopeName) ? prev.filter((s) => s !== scopeName) : [...prev, scopeName]
    );
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient.trim()) return;

    const finalRole = roleOrPurpose === 'Other' ? (customRole.trim() || 'Emergency Responder') : roleOrPurpose;
    createAccessRecord(
      recipient.trim(),
      selectedDocs,
      expiration,
      finalRole,
      selectedScopes
    );
    setShowModal(false);
  };

  const handleConfirmRevoke = () => {
    if (revokeConfirmRecord) {
      revokeAccessRecord(revokeConfirmRecord.id);
      setRevokeConfirmRecord(null);
    }
  };

  const handleCopyLink = (recordId: string) => {
    const link = `https://cognitiveshadow.app/access/${recordId}?token=sec_${recordId.slice(4)}`;
    navigator.clipboard?.writeText(link);
    setCopiedId(recordId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Dynamically partition passes into Active vs Inactive (Expired or Revoked)
  const { activePasses, inactivePasses } = useMemo(() => {
    const active: SecureAccess[] = [];
    const inactive: SecureAccess[] = [];
    const nowMs = Date.now();

    for (const r of temporaryAccessRecords) {
      const isTimeExpired = r.expiresAt ? new Date(r.expiresAt).getTime() < nowMs : false;
      if (r.status === 'Active' && !isTimeExpired) {
        active.push(r);
      } else {
        // Effective status Expired if timed out
        const effective = isTimeExpired && r.status === 'Active' ? { ...r, status: 'Expired' as const } : r;
        inactive.push(effective);
      }
    }

    return { activePasses: active, inactivePasses: inactive };
  }, [temporaryAccessRecords]);

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-950/60 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-rose-400 font-semibold">
            <Key className="w-4 h-4" />
            <span>Coordinated Emergency Sharing</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight text-white">
            Secure Responder Access
          </h1>
          <p className="text-sm text-zinc-400 font-light">
            Grant temporary, scenario-scoped access to verified records for hospital staff, claims adjusters, or family proxies.
            All passes are isolated strictly to <strong className="text-zinc-200">{crisisSession.scenario}</strong>.
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs font-mono flex items-center gap-2 transition-colors self-start sm:self-auto cursor-pointer shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Access Pass</span>
        </button>
      </div>

      {/* 1. ACTIVE ACCESS PASSES */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-mono font-semibold">
              Active Access Passes
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/50 border border-emerald-800/40 text-emerald-300">
              {activePasses.length} Live
            </span>
          </div>
          <span className="text-xs font-mono text-zinc-500">
            Scenario: {crisisSession.scenario}
          </span>
        </div>

        {activePasses.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-white/[0.06] text-zinc-400 text-xs font-mono space-y-1">
            <Key className="w-5 h-5 text-zinc-600 mx-auto mb-2" />
            <div>No active access passes issued.</div>
            <p className="text-zinc-500 font-sans text-[11px]">
              Generate a temporary time-bound link whenever you need to share critical documents with first responders.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activePasses.map((record) => (
              <div
                key={record.id}
                className="p-6 rounded-2xl bg-white/[0.02] border border-emerald-900/30 hover:border-emerald-700/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <h2 className="text-base font-medium text-white">{record.recipient}</h2>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-zinc-300">
                      {record.roleOrPurpose || 'Responder'}
                    </span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-950/50 border border-emerald-800/40 text-emerald-300">
                      Active
                    </span>
                  </div>

                  {/* Scopes & Documents Summary */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    {(record.scope || ['Emergency Brief', 'Documents']).map((sc, i) => (
                      <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.02] border border-white/[0.06] text-zinc-400">
                        {sc}
                      </span>
                    ))}
                    <span className="text-[11px] text-zinc-400 font-mono ml-1">
                      • {record.documents.length} document{record.documents.length !== 1 ? 's' : ''} shared
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-zinc-500">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <Clock className="w-3 h-3 text-emerald-400" />
                      <span>Valid for: {record.expiration}</span>
                    </span>
                    <span>• Issued: {record.createdAt}</span>
                    {record.scenario && (
                      <span>• Bound to: {record.scenario}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={() => setViewingRecord(record)}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-xs font-mono text-zinc-300 border border-white/[0.06] transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-zinc-400" />
                    <span>View Shared</span>
                  </button>

                  <button
                    onClick={() => handleCopyLink(record.id)}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-xs font-mono text-zinc-300 border border-white/[0.06] transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Copy secure link"
                  >
                    {copiedId === record.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setRevokeConfirmRecord(record)}
                    className="px-3 py-1.5 rounded-xl bg-rose-950/30 hover:bg-rose-950/60 hover:text-rose-200 text-xs font-mono text-rose-300 border border-rose-800/40 transition-colors cursor-pointer"
                  >
                    Revoke Pass
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. EXPIRED & REVOKED AUDIT LOG */}
      {inactivePasses.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-white/[0.06]">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-zinc-500 font-mono font-semibold">
              Expired / Revoked Passes ({inactivePasses.length})
            </span>
          </div>

          <div className="space-y-2.5">
            {inactivePasses.map((record) => (
              <div
                key={record.id}
                className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs opacity-60"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-zinc-300">{record.recipient}</span>
                    <span className="text-[10px] font-mono text-zinc-500">({record.roleOrPurpose || 'Responder'})</span>
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-md border ${
                      record.status === 'Revoked'
                        ? 'bg-rose-950/30 text-rose-400 border-rose-800/30'
                        : 'bg-zinc-800/40 text-zinc-400 border-zinc-700/30'
                    }`}>
                      {record.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-500 font-mono">
                    Created: {record.createdAt} • Documents: {record.documents.length}
                  </div>
                </div>

                <span className="text-[11px] font-mono text-zinc-500">
                  {record.status === 'Revoked' ? 'Access Terminated' : 'Expired on Schedule'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE ACCESS PASS MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0D0E14] border border-white/[0.1] rounded-2xl p-6 sm:p-7 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-rose-400 block mb-1">
                  New Temporary Access Pass
                </span>
                <h2 className="text-base font-semibold text-white font-mono">Grant Responder Access</h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.05]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              {/* Recipient Name */}
              <div className="space-y-1">
                <label className="block text-zinc-300 font-mono">Recipient Name *</label>
                <input
                  type="text"
                  required
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="e.g. Dr. Roberts, Officer Vance, Claims Adjuster"
                  className="w-full bg-white/[0.02] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-zinc-200 focus:outline-none focus:border-rose-500/50"
                />
              </div>

              {/* Purpose / Role */}
              <div className="space-y-1">
                <label className="block text-zinc-300 font-mono">Role / Purpose</label>
                <select
                  value={roleOrPurpose}
                  onChange={(e) => setRoleOrPurpose(e.target.value)}
                  className="w-full bg-[#12141A] border border-white/[0.08] rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-rose-500/50 font-mono"
                >
                  <option value="Attending Medical Staff">Attending Medical Staff / Hospital</option>
                  <option value="Insurance Claims Adjuster">Insurance Claims Adjuster</option>
                  <option value="Emergency Legal Proxy">Emergency Legal Proxy / Attorney</option>
                  <option value="Family Care Responder">Family Care Responder</option>
                  <option value="Emergency Responder">Emergency Responder / Law Enforcement</option>
                  <option value="Other">Other (Custom Purpose)</option>
                </select>
                {roleOrPurpose === 'Other' && (
                  <input
                    type="text"
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    placeholder="Specify role or access purpose"
                    className="w-full mt-2 bg-white/[0.02] border border-white/[0.08] rounded-xl px-3.5 py-2 text-zinc-200 focus:outline-none focus:border-rose-500/50"
                  />
                )}
              </div>

              {/* Expiration Duration */}
              <div className="space-y-1">
                <label className="block text-zinc-300 font-mono">Access Duration</label>
                <select
                  value={expiration}
                  onChange={(e) => setExpiration(e.target.value)}
                  className="w-full bg-[#12141A] border border-white/[0.08] rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-rose-500/50 font-mono"
                >
                  <option value="1 hour">1 hour (Strict Emergency Handover)</option>
                  <option value="4 hours">4 hours (Standard Incident Window)</option>
                  <option value="12 hours">12 hours (Hospital Admission Shift)</option>
                  <option value="24 hours">24 hours (Default / Standard Day)</option>
                  <option value="48 hours">48 hours (Multi-day Incident Protocol)</option>
                </select>
              </div>

              {/* Information Scope Checkboxes */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-zinc-300 font-mono">Information Scope</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
                  {[
                    'Emergency Brief',
                    'Critical Contacts',
                    'Relevant Assets & Insurance',
                    'Priority Tasks',
                    'Surfaced Documents'
                  ].map((scopeItem) => (
                    <div
                      key={scopeItem}
                      onClick={() => toggleScopeSelection(scopeItem)}
                      className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between transition-colors ${
                        selectedScopes.includes(scopeItem)
                          ? 'bg-rose-950/40 border-rose-800/50 text-rose-200'
                          : 'bg-white/[0.02] border-white/[0.05] text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <span>{scopeItem}</span>
                      {selectedScopes.includes(scopeItem) && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Documents Selection (Scoped strictly to active crisis docs) */}
              {selectedScopes.includes('Surfaced Documents') && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-zinc-300 font-mono">
                      Scenario Documents ({selectedDocs.length}/{scenarioDocs.length})
                    </label>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      Scoped to {crisisSession.scenario}
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {scenarioDocs.length === 0 ? (
                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-zinc-500 text-xs italic">
                        No relevant documents in vault for this scenario.
                      </div>
                    ) : (
                      scenarioDocs.map((doc) => (
                        <div
                          key={doc.id}
                          onClick={() => toggleDocSelection(doc.name)}
                          className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between text-xs transition-colors ${
                            selectedDocs.includes(doc.name)
                              ? 'bg-rose-950/40 border-rose-800/50 text-rose-200'
                              : 'bg-white/[0.02] border-white/[0.05] text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          <div className="truncate pr-2">
                            <span className="font-medium">{doc.name}</span>
                            <span className="text-[10px] text-zinc-500 font-mono ml-2">[{doc.category}]</span>
                          </div>
                          {selectedDocs.includes(doc.name) && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-white/[0.06] flex justify-end gap-2 font-mono">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/[0.04] text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium shadow-sm"
                >
                  Issue Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REVOKE CONFIRMATION MODAL */}
      {revokeConfirmRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#0D0E14] border border-rose-900/50 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-950/40 border border-rose-800/50 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white font-mono uppercase">Revoke Access Pass?</h3>
                <span className="text-xs text-zinc-400 font-mono">{revokeConfirmRecord.recipient}</span>
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              This will immediately terminate temporary access for <strong className="text-zinc-200">{revokeConfirmRecord.recipient}</strong>.
              All shared documents and crisis dossier information will become inaccessible immediately.
            </p>

            <div className="pt-2 flex justify-end gap-2 font-mono text-xs">
              <button
                onClick={() => setRevokeConfirmRecord(null)}
                className="px-4 py-2 rounded-xl bg-white/[0.04] text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRevoke}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium"
              >
                Confirm Revoke
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW SHARED DOSSIER PREVIEW MODAL */}
      {viewingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0D0E14] border border-white/[0.1] rounded-2xl p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-rose-400 block mb-1">
                  Access Pass Audit
                </span>
                <h3 className="text-base font-medium text-white">{viewingRecord.recipient}</h3>
                <span className="text-xs text-zinc-400 font-mono">{viewingRecord.roleOrPurpose || 'Responder'}</span>
              </div>
              <button
                onClick={() => setViewingRecord(null)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-mono text-zinc-500 block">Bound Scenario</span>
                <span className="text-zinc-200 font-mono">{viewingRecord.scenario || crisisSession.scenario}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-mono text-zinc-500 block">Active Scope</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(viewingRecord.scope || ['Emergency Brief', 'Documents']).map((sc, i) => (
                    <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-zinc-300">
                      {sc}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-mono text-zinc-500 block">Shared Documents ({viewingRecord.documents.length})</span>
                <div className="space-y-1 mt-1 text-zinc-300 font-mono text-[11px]">
                  {viewingRecord.documents.length > 0 ? (
                    viewingRecord.documents.map((dName, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <FileText className="w-3 h-3 text-rose-400 shrink-0" />
                        <span className="truncate">{dName}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-zinc-500 italic">No documents attached.</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.04] font-mono text-[11px]">
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase">Issued</span>
                  <span className="text-zinc-300">{viewingRecord.createdAt}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase">Duration</span>
                  <span className="text-zinc-300">{viewingRecord.expiration}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewingRecord(null)}
                className="px-4 py-2 rounded-xl bg-white/[0.04] text-zinc-300 hover:text-white font-mono text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
