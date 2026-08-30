// src/components/PrivacyVisualizer.tsx
import React, { useState } from 'react';
import { Lock, Eye, Shield, Check, Info } from 'lucide-react';

export const PrivacyVisualizer: React.FC = () => {
  const [viewMode, setViewMode] = useState<'bidder' | 'competitor' | 'public'>('bidder');

  const bidderBids = [
    { name: 'Contractor A (You)', bid: '$8,200,000', status: 'Plaintext (Private)', hash: 'c59501861053a478832a8219ef66bdf2...' },
    { name: 'Contractor B', bid: '$8,700,000', status: 'Sealed (Commitment)', hash: 'f7d2f9e422f98e72b4c10de53a7b689...' },
    { name: 'Contractor C', bid: '$7,900,000', status: 'Sealed (Commitment)', hash: 'a9b2c3d4e5f6192837465f8a7d6e5d4...' }
  ];

  return (
    <div className="v-panel p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-900 pb-4 mb-6">
        <div>
          <h3 className="text-white font-medium text-sm flex items-center gap-2">
            <Shield className="h-4.5 w-4.5 text-neutral-400" />
            Selective Disclosure Visualizer
          </h3>
          <p className="text-xs text-neutral-500 mt-1">
            Toggle perspectives to see how Midnight secures competitive bidding.
          </p>
        </div>

        {/* View Mode Selectors */}
        <div className="inline-flex p-1 bg-black border border-neutral-900 rounded-lg">
          {(['bidder', 'competitor', 'public'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 rounded-md text-[10px] font-semibold uppercase tracking-wider transition-all cursor-pointer border ${
                viewMode === mode
                  ? 'bg-white border-transparent text-black shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-300 border-transparent'
              }`}
            >
              {mode} view
            </button>
          ))}
        </div>
      </div>

      {/* Visualizer Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Data representations */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-black border border-neutral-900 rounded-lg p-4">
            <h4 className="text-[10px] font-medium text-neutral-500 uppercase tracking-widest mb-3">
              Bid Registry Ledger Status
            </h4>
            <div className="space-y-3">
              {bidderBids.map((b, idx) => {
                const isYou = idx === 0;
                
                let visibleValue = 'PRIVATE COMMITMENT';
                let valueColor = 'text-neutral-400 font-mono text-[11px]';
                let icon = <Lock className="h-3.5 w-3.5 text-neutral-600" />;
                
                if (viewMode === 'bidder') {
                  if (isYou) {
                    visibleValue = b.bid;
                    valueColor = 'text-white font-medium';
                    icon = <Eye className="h-3.5 w-3.5 text-neutral-400" />;
                  }
                } else if (viewMode === 'public') {
                  // After reveal, only Contractor C (79L) is disclosed as the lowest bid winner
                  if (idx === 2) {
                    visibleValue = b.bid + ' (Winner Disclosed)';
                    valueColor = 'text-white font-semibold';
                    icon = <Check className="h-3.5 w-3.5 text-white" />;
                  }
                }

                return (
                  <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-3 bg-neutral-950 border border-neutral-900 rounded-lg gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-neutral-300">{b.name}</span>
                      {isYou && <span className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[9px] text-neutral-400 font-medium">YOU</span>}
                    </div>

                    <div className="flex flex-col md:items-end gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className={valueColor}>{visibleValue}</span>
                        <span className="text-neutral-500">{icon}</span>
                      </div>
                      <span className="font-mono text-[9px] text-neutral-600 block max-w-[200px] truncate" title={b.hash}>
                        Hash: {b.hash}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column: Explanatory card */}
        <div className="bg-black/50 border border-neutral-900 rounded-lg p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="text-[10px] font-medium text-neutral-500 uppercase tracking-widest flex items-center gap-1">
              <Info className="h-3.5 w-3.5 text-neutral-400" />
              Perspective Summary
            </h4>
            
            {viewMode === 'bidder' && (
              <div className="space-y-2">
                <p className="text-xs text-white font-medium">Your bid is visible only to you.</p>
                <p className="text-xs text-neutral-500 leading-relaxed font-normal">
                  Your bid amount is hashed locally on your computer with a unique salt. Only the hash is submitted to the blockchain. Competing contractors only see your public address and a locked commitment.
                </p>
              </div>
            )}

            {viewMode === 'competitor' && (
              <div className="space-y-2">
                <p className="text-xs text-white font-medium">Competitors see zero pricing data.</p>
                <p className="text-xs text-neutral-500 leading-relaxed font-normal">
                  To prevent collusion and strategic undercutting, contractors see all bids as locked cryptographic hashes. plain bid amounts are never written to the blockchain or sent to the backend.
                </p>
              </div>
            )}

            {viewMode === 'public' && (
              <div className="space-y-2">
                <p className="text-xs text-white font-medium">Post-close Selective Disclosure.</p>
                <p className="text-xs text-neutral-500 leading-relaxed font-normal">
                  Once closed, bidders verify their bids in ZK. The contract updates the winning bidder and amount. Losing bids are never disclosed—their commitments remain locked forever on-chain, proving they participated fairly.
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-neutral-900 mt-4 flex items-center gap-2">
            <div className="p-1 rounded bg-neutral-900 border border-neutral-800 text-neutral-400">
              <Shield className="h-3.5 w-3.5" />
            </div>
            <span className="text-[10px] text-neutral-500 font-semibold font-mono">Zero-Knowledge Verification</span>
          </div>
        </div>
      </div>
    </div>
  );
};
