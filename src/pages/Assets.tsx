import React from 'react';
import {
  Car,
  Smartphone,
  Laptop,
  Home,
  Shield,
  Tag,
  FileText,
  CheckCircle2,
  Box
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AssetItem } from '../types';

export const Assets: React.FC = () => {
  const { assets } = useApp();

  const getAssetIcon = (type: string, name: string) => {
    if (type.includes('Auto') || name.includes('Honda')) return <Car className="w-5 h-5 text-cyan-400" />;
    if (type.includes('Phone') || name.includes('iPhone')) return <Smartphone className="w-5 h-5 text-cyan-400" />;
    if (type.includes('Laptop') || name.includes('MacBook')) return <Laptop className="w-5 h-5 text-cyan-400" />;
    return <Home className="w-5 h-5 text-cyan-400" />;
  };

  return (
    <div className="space-y-10 max-w-5xl">
      {/* 1. Header Surface */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-[#0F1219]/90 to-[#0A0C11]/90 border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-cyan-400">
            <Box className="w-3.5 h-3.5" />
            <span>Property & Equipment Registry</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-white">
            My Assets
          </h1>
          <p className="text-sm text-zinc-400 font-light max-w-lg leading-relaxed">
            Your vehicles, personal electronics, and residence linked with verified insurance policies, warranty schedules, and registered deeds.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex items-center gap-4 self-start md:self-auto shrink-0">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
              Coverage Status
            </div>
            <div className="text-lg font-medium text-white font-mono flex items-center gap-1.5">
              <span>{assets.length} Active Policies</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-[11px] text-zinc-400 font-light">
              All physical property insured
            </div>
          </div>
        </div>
      </div>

      {/* 2. Sophisticated Asset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {assets.map((asset) => (
          <div
            key={asset.id}
            className="p-6 sm:p-7 rounded-3xl bg-[#0B0D12] border border-white/[0.06] hover:border-white/[0.14] transition-all duration-200 space-y-5"
          >
            {/* Top Identity Block */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center shrink-0">
                  {getAssetIcon(asset.type, asset.name)}
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">
                    {asset.type}
                  </span>
                  <h2 className="text-lg font-medium text-white mt-0.5">
                    {asset.name}
                  </h2>
                </div>
              </div>

              <span className="text-xs font-mono text-zinc-400 bg-white/[0.02] px-2.5 py-1 rounded-full border border-white/[0.05]">
                {asset.purchaseDate}
              </span>
            </div>

            {/* Identifier and Valuation */}
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.04] grid grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase">Identifier</span>
                <span className="text-zinc-200 truncate block mt-0.5" title={asset.registrationOrSerial}>
                  {asset.registrationOrSerial}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase">Estimated Value</span>
                <span className="text-cyan-300 font-medium block mt-0.5">{asset.estimatedValue}</span>
              </div>
            </div>

            {/* Insurance & Warranty Sections */}
            <div className="space-y-2.5 text-xs font-light">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.015] border border-white/[0.04]">
                <Shield className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">Insurance</span>
                  <span className="text-zinc-200">{asset.insurance}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.015] border border-white/[0.04]">
                <Tag className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">Warranty</span>
                  <span className="text-zinc-300">{asset.warranty}</span>
                </div>
              </div>
            </div>

            {/* Linked Documents Footer */}
            <div className="pt-2 border-t border-white/[0.04] flex items-center gap-2 text-xs font-mono text-zinc-400">
              <FileText className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span className="text-zinc-500">Linked:</span>
              <span className="text-zinc-300 truncate">{asset.relatedDocuments.join(', ')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
