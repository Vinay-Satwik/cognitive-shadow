import React, { useState } from 'react';
import {
  FileText,
  Calendar,
  Box,
  Search,
  CheckCircle2,
  Lock,
  Filter,
  ShieldCheck,
  Clock,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DocumentCategory, DocumentItem } from '../types';

export const ShadowVault: React.FC = () => {
  const { documents } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDocModal, setSelectedDocModal] = useState<DocumentItem | null>(null);

  const categories = ['All', 'Identity', 'Medical', 'Insurance', 'Vehicle', 'Property', 'Other'];

  const filteredDocs = documents.filter((doc) => {
    const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.relatedAsset && doc.relatedAsset.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-10 max-w-5xl">
      {/* 1. Header & Vault Readiness Surface */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-[#0F1219]/90 to-[#0A0C11]/90 border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-cyan-400">
            <Lock className="w-3.5 h-3.5" />
            <span>Encrypted Personal Vault</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-white">
            My Documents
          </h1>
          <p className="text-sm text-zinc-400 font-light max-w-lg leading-relaxed">
            Important information, ready when you need it. Encrypted in personal standby and contextually surfaced during crises.
          </p>
        </div>

        {/* Clear Document Readiness Indicator */}
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex items-center gap-4 self-start md:self-auto shrink-0">
          <div className="w-12 h-12 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
              Document Readiness
            </div>
            <div className="text-lg font-medium text-white font-mono flex items-center gap-1.5">
              <span>{documents.length} of {documents.length} Verified</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-[11px] text-zinc-400 font-light">
              Zero unaddressed document gaps
            </div>
          </div>
        </div>
      </div>

      {/* 2. Vault Controls: Search & Category Pills */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-white/[0.1] text-cyan-300 border border-cyan-500/40 font-medium'
                  : 'bg-white/[0.02] text-zinc-400 border border-white/[0.05] hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search vault..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0B0D12] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-500/40 transition-colors"
          />
        </div>
      </div>

      {/* 3. Redesigned Document Vault Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocs.map((doc) => {
          const isExpiringSoon = doc.expiryDate && (doc.expiryDate.includes('Oct 2026') || doc.expiryDate.includes('2026'));
          return (
            <div
              key={doc.id}
              onClick={() => setSelectedDocModal(doc)}
              className="p-6 rounded-2xl bg-[#0B0D12] border border-white/[0.06] hover:border-white/[0.14] cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                {/* Card Top: Category & Expiry Badge */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 bg-cyan-950/30 px-2.5 py-0.5 rounded-full border border-cyan-800/30">
                    {doc.category}
                  </span>

                  {doc.expiryDate && (
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      isExpiringSoon
                        ? 'bg-amber-950/30 text-amber-300 border border-amber-800/30'
                        : 'bg-white/[0.03] text-zinc-400 border border-white/[0.05]'
                    }`}>
                      <Clock className="w-3 h-3" />
                      <span>{doc.expiryDate}</span>
                    </span>
                  )}
                </div>

                {/* Title and Description */}
                <div>
                  <h2 className="text-base font-medium text-white group-hover:text-cyan-200 transition-colors">
                    {doc.name}
                  </h2>
                  <p className="text-xs text-zinc-400 font-light mt-1 line-clamp-2 leading-relaxed">
                    {doc.description}
                  </p>
                </div>
              </div>

              {/* Card Bottom: Asset Relation & Upload Metadata */}
              <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between text-[11px] font-mono text-zinc-500">
                {doc.relatedAsset ? (
                  <span className="flex items-center gap-1 text-zinc-300">
                    <Box className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{doc.relatedAsset}</span>
                  </span>
                ) : (
                  <span className="text-zinc-500">Personal Directive</span>
                )}

                <span className="text-zinc-500 group-hover:text-cyan-400 transition-colors">
                  Inspect →
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Document Detail Inspection Modal */}
      {selectedDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-[#0C0E14] border border-white/[0.1] rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">
                  {selectedDocModal.category}
                </span>
                <h3 className="text-xl font-medium text-white">{selectedDocModal.name}</h3>
              </div>
              <span className="text-xs font-mono text-zinc-500">{selectedDocModal.uploadDate}</span>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-3 text-xs">
              <div>
                <span className="text-zinc-500 font-mono block text-[10px] uppercase">Description</span>
                <p className="text-zinc-200 font-light mt-0.5 leading-relaxed">{selectedDocModal.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/[0.04] font-mono text-[11px]">
                <div>
                  <span className="text-zinc-500 block">Related Asset</span>
                  <span className="text-white">{selectedDocModal.relatedAsset || 'None (Personal)'}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Validity Expiration</span>
                  <span className="text-white">{selectedDocModal.expiryDate || 'Indefinite'}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedDocModal(null)}
                className="px-5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-mono text-zinc-200 transition-colors cursor-pointer"
              >
                Close Vault Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
