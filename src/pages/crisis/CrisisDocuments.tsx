import React, { useState } from 'react';
import { FileText, Calendar, Box, Eye, ExternalLink, Check, Copy } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DocumentItem } from '../../types';

export const CrisisDocuments: React.FC = () => {
  const { crisisSession, documents } = useApp();
  const [viewingDoc, setViewingDoc] = useState<DocumentItem | null>(null);
  const [copiedDocId, setCopiedDocId] = useState<string | null>(null);

  const scenarioDocs = documents.filter((d) => crisisSession.surfacedDocuments?.includes(d.id));

  const handleCopyDocDetails = (doc: DocumentItem) => {
    const text = `${doc.name}\nCategory: ${doc.category}\nDetails: ${doc.description}\nValid Through: ${doc.expiryDate || 'N/A'}`;
    navigator.clipboard?.writeText(text);
    setCopiedDocId(doc.id);
    setTimeout(() => setCopiedDocId(null), 2000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="space-y-2 border-b border-rose-950/60 pb-6">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-rose-400 font-semibold">
          <FileText className="w-4 h-4" />
          <span>Surfaced Records</span>
        </div>
        <h1 className="text-3xl font-light tracking-tight text-white">
          Relevant Documents
        </h1>
        <p className="text-sm text-zinc-400 font-light">
          Contextual filtering applied: showing only the <strong className="text-white">{scenarioDocs.length} documents</strong> needed for <strong className="text-zinc-200 font-medium">{crisisSession.scenario}</strong>.
          The remaining vault items are filtered out to keep focus sharp.
        </p>
      </div>

      {/* Filtered Documents Grid */}
      {scenarioDocs.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-white/[0.06] text-zinc-400 text-xs font-mono">
          No relevant documents configured.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scenarioDocs.map((doc) => (
          <div
            key={doc.id}
            className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-rose-500/40 transition-all space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-rose-400 shrink-0" />
                <h2 className="text-base font-medium text-white">
                  {doc.name}
                </h2>
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-rose-950/40 text-rose-300 border border-rose-800/40">
                Critical
              </span>
            </div>

            <p className="text-xs text-zinc-300 font-light leading-relaxed">
              {doc.description}
            </p>

            <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between text-xs font-mono text-zinc-400">
              {doc.relatedAsset ? (
                <span className="flex items-center gap-1.5 text-zinc-300">
                  <Box className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{doc.relatedAsset}</span>
                </span>
              ) : (
                <span>Personal</span>
              )}

              {doc.expiryDate && (
                <span className="flex items-center gap-1 text-zinc-400">
                  <Calendar className="w-3 h-3 text-zinc-500" />
                  <span>Valid: {doc.expiryDate}</span>
                </span>
              )}
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => setViewingDoc(doc)}
                className="flex-1 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-xs font-mono text-zinc-200 border border-white/[0.06] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-zinc-400" />
                <span>View Details</span>
              </button>

              <button
                onClick={() => handleCopyDocDetails(doc)}
                className="px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-xs font-mono text-zinc-300 border border-white/[0.06] transition-colors cursor-pointer"
                title="Copy details"
              >
                {copiedDocId === doc.id ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Document Detail Preview Modal */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0D0E14] border border-white/[0.1] rounded-2xl p-6 sm:p-7 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-rose-400 block mb-1">
                  Document Preview
                </span>
                <h3 className="text-lg font-medium text-white">{viewingDoc.name}</h3>
              </div>
              <span className="text-xs font-mono text-zinc-500">{viewingDoc.category}</span>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-2.5 text-xs">
              <div>
                <span className="text-zinc-500 font-mono block text-[10px] uppercase">Description</span>
                <p className="text-zinc-200 font-light mt-0.5">{viewingDoc.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.04] font-mono text-[11px]">
                <div>
                  <span className="text-zinc-500 block">Related Asset</span>
                  <span className="text-zinc-300">{viewingDoc.relatedAsset || 'None'}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Validity</span>
                  <span className="text-zinc-300">{viewingDoc.expiryDate || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setViewingDoc(null)}
                className="px-5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-mono text-zinc-200 transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
