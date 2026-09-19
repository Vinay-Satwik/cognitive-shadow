import React from 'react';
import { Share2, Clock, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SecureSharing: React.FC = () => {
  const { documents } = useApp();

  const mockShares = [
    {
      recipient: 'Roadside Assistance Representative',
      purpose: 'Vehicle Insurance & Registration',
      documents: ['Vehicle Insurance Policy', 'Vehicle Registration (RC)'],
      expires: 'Expires in 2 hours',
      active: true
    },
    {
      recipient: 'Hospital Reception Staff',
      purpose: 'Health Insurance Policy',
      documents: ['Health Insurance Card & Policy'],
      expires: 'Expired yesterday',
      active: false
    }
  ];

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-light tracking-tight text-white">
          Temporary Access
        </h1>
        <p className="text-sm text-zinc-400 font-light">
          Share specific documents temporarily during an emergency without giving full access.
        </p>
      </div>

      {/* Share Items List */}
      <div className="space-y-4">
        {mockShares.map((share, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <span className={`w-2 h-2 rounded-full ${share.active ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                <h2 className="text-base font-medium text-white">{share.recipient}</h2>
              </div>
              <p className="text-xs text-zinc-400">{share.purpose}</p>
              <div className="flex items-center gap-3 pt-1 text-xs font-mono text-zinc-500">
                <span className="text-cyan-400">{share.documents.join(', ')}</span>
                <span>• {share.expires}</span>
              </div>
            </div>

            <div>
              {share.active ? (
                <button
                  onClick={() => alert('Access revoked.')}
                  className="px-3.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-zinc-300 border border-white/[0.06] transition-colors"
                >
                  Revoke
                </button>
              ) : (
                <span className="text-xs font-mono text-zinc-500">Expired</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
