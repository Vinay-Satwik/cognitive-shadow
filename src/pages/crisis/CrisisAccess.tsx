import React, { useState } from 'react';
import { Key, Plus, Clock, Trash2, CheckCircle2, Shield } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getRelevantDocuments, getRelevantContacts } from '../../lib/crisisEngine';

export const CrisisAccess: React.FC = () => {
  const { crisisSession, temporaryAccessRecords, createAccessRecord, revokeAccessRecord } = useApp();
  const [showModal, setShowModal] = useState(false);

  const scenarioDocs = getRelevantDocuments(crisisSession.scenarioId);
  const scenarioPeople = getRelevantContacts(crisisSession.scenarioId);

  const [recipient, setRecipient] = useState(scenarioPeople[0]?.name || 'Rahul Morgan');
  const [selectedDocs, setSelectedDocs] = useState<string[]>([scenarioDocs[0]?.name || 'Vehicle Insurance Policy']);
  const [expiration, setExpiration] = useState('24 hours');

  const toggleDocSelection = (docName: string) => {
    setSelectedDocs((prev) =>
      prev.includes(docName) ? prev.filter((d) => d !== docName) : [...prev, docName]
    );
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || selectedDocs.length === 0) return;
    createAccessRecord(recipient, selectedDocs, expiration);
    setShowModal(false);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-950/60 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-rose-400 font-semibold">
            <Key className="w-4 h-4" />
            <span>Coordinated Sharing</span>
          </div>
          <h1 className="text-3xl font-light tracking-tight text-white">
            Secure Access
          </h1>
          <p className="text-sm text-zinc-400 font-light">
            Grant temporary, time-limited access to specific documents for family, doctors, or adjusters during this crisis.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs font-mono flex items-center gap-2 transition-colors self-start sm:self-auto cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Create Access</span>
        </button>
      </div>

      {/* Access Records List */}
      <div className="space-y-4">
        {temporaryAccessRecords.map((record) => (
          <div
            key={record.id}
            className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full ${
                  record.status === 'Active' ? 'bg-emerald-400' : 'bg-zinc-600'
                }`} />
                <h2 className="text-base font-medium text-white">{record.recipient}</h2>
                <span className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full border ${
                  record.status === 'Active'
                    ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-300'
                    : 'bg-white/[0.03] border-white/[0.06] text-zinc-500'
                }`}>
                  {record.status}
                </span>
              </div>

              <div className="text-xs text-zinc-300 pl-5">
                <span className="text-zinc-500 font-mono">Shared Documents: </span>
                <span>{record.documents.join(', ')}</span>
              </div>

              <div className="flex items-center gap-4 pl-5 text-[11px] font-mono text-zinc-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-zinc-500" />
                  <span>Valid for: {record.expiration}</span>
                </span>
                <span>• Created: {record.createdAt}</span>
              </div>
            </div>

            <div className="pl-5 md:pl-0">
              {record.status === 'Active' ? (
                <button
                  onClick={() => revokeAccessRecord(record.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-white/[0.03] hover:bg-rose-950/40 hover:text-rose-300 hover:border-rose-800/40 text-xs font-mono text-zinc-400 border border-white/[0.06] transition-colors cursor-pointer"
                >
                  Revoke Access
                </button>
              ) : (
                <span className="text-xs font-mono text-zinc-500">Access Revoked</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Access Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0D0E14] border border-white/[0.1] rounded-2xl p-6 sm:p-7 space-y-5 shadow-2xl">
            <h2 className="text-base font-medium text-white font-mono">Create Temporary Access</h2>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block text-zinc-400 font-mono">Recipient Name</label>
                <input
                  type="text"
                  required
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="e.g. Rahul Morgan or Claims Desk"
                  className="w-full bg-white/[0.02] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-zinc-200 focus:outline-none focus:border-rose-500/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-zinc-400 font-mono">Select Documents to Share</label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {scenarioDocs.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => toggleDocSelection(doc.name)}
                      className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between text-xs transition-colors ${
                        selectedDocs.includes(doc.name)
                          ? 'bg-rose-950/40 border-rose-800/50 text-rose-200'
                          : 'bg-white/[0.02] border-white/[0.05] text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <span>{doc.name}</span>
                      {selectedDocs.includes(doc.name) && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-zinc-400 font-mono">Expiration Window</label>
                <select
                  value={expiration}
                  onChange={(e) => setExpiration(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/[0.08] rounded-xl px-3 py-2 text-zinc-200"
                >
                  <option value="6 hours" className="bg-zinc-900">6 hours</option>
                  <option value="12 hours" className="bg-zinc-900">12 hours</option>
                  <option value="24 hours" className="bg-zinc-900">24 hours (Default)</option>
                  <option value="48 hours" className="bg-zinc-900">48 hours</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/[0.04] text-zinc-400 hover:text-white font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono font-medium"
                >
                  Create Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
