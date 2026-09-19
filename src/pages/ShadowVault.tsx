import React, { useState } from 'react';
import { FileText, Calendar, Box, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DocumentCategory } from '../types';

export const ShadowVault: React.FC = () => {
  const { documents } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['All', 'Identity', 'Medical', 'Insurance', 'Vehicle', 'Property', 'Other'];

  const filteredDocs = documents.filter((doc) => {
    const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-light tracking-tight text-white">
          My Documents
        </h1>
        <p className="text-sm text-zinc-400 font-light">
          Important information, ready when you need it.
        </p>
      </div>

      {/* Category Filter Pills & Search */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-white/[0.1] text-cyan-300 border border-cyan-500/40'
                  : 'bg-white/[0.02] text-zinc-400 border border-white/[0.05] hover:text-zinc-200 hover:bg-white/[0.05]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl pl-10 pr-4 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-500/40 transition-colors"
          />
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-cyan-400/80 shrink-0" />
                <h2 className="text-sm font-medium text-zinc-100">
                  {doc.name}
                </h2>
              </div>
              <span className="text-[11px] font-mono text-zinc-500 px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.04]">
                {doc.category}
              </span>
            </div>

            <p className="text-xs text-zinc-400 font-light leading-relaxed">
              {doc.description}
            </p>

            <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-zinc-500 font-mono">
              {doc.relatedAsset ? (
                <span className="flex items-center gap-1 text-zinc-400">
                  <Box className="w-3 h-3 text-zinc-500" />
                  <span>{doc.relatedAsset}</span>
                </span>
              ) : (
                <span>Personal</span>
              )}

              {doc.expiryDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-zinc-500" />
                  <span>Valid: {doc.expiryDate}</span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
