import React from 'react';
import { Box, Shield, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Assets: React.FC = () => {
  const { assets } = useApp();

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-light tracking-tight text-white">
          My Assets
        </h1>
        <p className="text-sm text-zinc-400 font-light">
          Your vehicles, devices, and property linked with their insurance and records.
        </p>
      </div>

      {/* Asset Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assets.map((asset) => (
          <div
            key={asset.id}
            className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 block mb-1">
                  {asset.type}
                </span>
                <h2 className="text-base font-medium text-white">
                  {asset.name}
                </h2>
              </div>
              <span className="text-xs font-mono text-zinc-400">
                {asset.registrationOrSerial}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] space-y-1.5">
                <div className="flex items-start gap-2 text-zinc-300">
                  <Shield className="w-3.5 h-3.5 text-cyan-400/80 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-mono">Insurance</span>
                    <span>{asset.insurance}</span>
                  </div>
                </div>

                <div className="pt-1 border-t border-white/[0.04] flex items-center justify-between text-zinc-400 text-[11px]">
                  <span>Warranty:</span>
                  <span className="text-zinc-300">{asset.warranty}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-zinc-400 text-xs pt-1">
                <FileText className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <span>Documents: <span className="text-zinc-200">{asset.relatedDocuments.join(', ')}</span></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
