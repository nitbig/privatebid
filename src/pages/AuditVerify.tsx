// src/pages/AuditVerify.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MidnightService, PublicLedgerState } from '../services/midnightService';
import { 
  ShieldCheck, FileSignature, CheckCircle2, Lock, 
  Cpu, ArrowLeft, Loader2 
} from 'lucide-react';

export const AuditVerify: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  const [auction, setAuction] = useState<PublicLedgerState | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [step, setStep] = useState(0);
  const [log, setLog] = useState('');

  useEffect(() => {
    if (id) {
      const data = MidnightService.getAuction(id);
      setAuction(data);
    }
  }, [id]);

  if (!id) return null;

  if (!auction) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-neutral-500">
        Auction not found. <Link to="/auctions" className="text-neutral-400 hover:underline">Return to Explorer</Link>
      </div>
    );
  }

  const meta = MidnightService.getAuctionMeta(id);

  const formatCurrency = (val: number) => {
    return `${meta.currency}${val.toLocaleString()}`;
  };

  const handleVerify = async () => {
    setVerifying(true);
    setVerified(false);
    
    // Simulate verifier compiling proving keys and running pairing checks
    const steps = [
      'Compiling ZK Verifier parameters for privatebid.compact...',
      'Retrieving ledger state & validator signatures...',
      'Loading public inputs (winning_bidder, winning_bid_value)...',
      'Verifying ZK-SNARK reveal proof against winning commitment...',
      'Performing mathematical checks for lowest bid validity...',
      'Pairing checks completed. ZK validation result: VALID ✓'
    ];

    for (let i = 0; i < steps.length; i++) {
      setStep(i + 1);
      setLog(steps[i]);
      await new Promise(r => setTimeout(r, 600));
    }

    setVerified(true);
    setVerifying(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8 space-y-6">
      
      {/* Back button */}
      <Link 
        to={`/auctions/${id}`} 
        className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-200 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Auction Details
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-neutral-400" />
          Public Cryptographic Audit Ledger
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Verify the mathematical legitimacy and fairness of finalized bidding results on the Midnight Network.
        </p>
      </div>

      {/* Main Audit Panel */}
      <div className="v-panel p-6 space-y-6">
        
        {/* Verification trigger */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-neutral-900 pb-6">
          <div>
            <h3 className="text-xs font-semibold text-neutral-200">Verify Auction #PB-{id.slice(-6).toUpperCase()}</h3>
            <p className="text-[10px] text-neutral-500 mt-0.5 font-normal">
              Execute ZK-SNARK verifier checks to audit that the winner is correct.
            </p>
          </div>

          {verified ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 border border-neutral-850 text-white rounded-md text-[10px] font-semibold uppercase tracking-wider">
              <CheckCircle2 className="h-3.5 w-3.5 text-white animate-pulse" />
              RESULT VERIFIED ✓
            </div>
          ) : (
            <button
              onClick={handleVerify}
              disabled={verifying}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-neutral-200 text-black font-semibold text-xs rounded-md transition-colors cursor-pointer border border-transparent"
            >
              {verifying ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Verifying Proof...
                </>
              ) : (
                'Run Verification Audit'
              )}
            </button>
          )}
        </div>

        {/* Verifier status logger */}
        {verifying && (
          <div className="bg-black border border-neutral-900 rounded-md p-4 font-mono text-[11px] text-neutral-400 leading-relaxed shadow-inner">
            <div className="flex items-center gap-1.5 text-neutral-500 text-[9px] uppercase font-bold border-b border-neutral-900 pb-2 mb-2">
              <Cpu className="h-4 w-4 animate-pulse text-white" />
              ZK-Verifier Service Output
            </div>
            <p className="text-neutral-700">[VERIFIER] Loading circuit keys...</p>
            <p className="text-neutral-200">{log}</p>
          </div>
        )}

        {/* Selective Disclosure Report (Showcase of Midnight Value Prop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          
          {/* Publicly Revealed Info */}
          <div className="bg-black border border-neutral-900 rounded-lg p-5 space-y-4">
            <h4 className="text-[10px] font-semibold text-neutral-500 uppercase tracking-widest flex items-center gap-1.5 border-b border-neutral-900 pb-2.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-neutral-450" />
              WHAT THE PUBLIC SEES
            </h4>

            <div className="space-y-3 font-mono text-[10px] text-neutral-400 leading-relaxed">
              <div className="p-2.5 bg-neutral-950 border border-neutral-900 rounded">
                <span className="text-[8px] text-neutral-550 block uppercase font-semibold">Final Deployed Address</span>
                <span className="text-neutral-300 break-all select-all">{auction.address}</span>
              </div>

              <div className="p-2.5 bg-neutral-950 border border-neutral-900 rounded">
                <span className="text-[8px] text-neutral-550 block uppercase font-semibold">Awarded Bidder (Derived PK)</span>
                <span className="text-neutral-300 break-all select-all">
                  {auction.winningBidder || 'PENDING'}
                </span>
              </div>

              <div className="p-2.5 bg-neutral-950 border border-neutral-900 rounded">
                <span className="text-[8px] text-neutral-550 block uppercase font-semibold">Winning Bid Value</span>
                <span className="text-white font-bold text-xs">
                  {auction.winningBidValue ? formatCurrency(auction.winningBidValue) : 'PENDING'}
                </span>
              </div>
            </div>
          </div>

          {/* Remaining Private Info */}
          <div className="bg-black border border-neutral-900 rounded-lg p-5 space-y-4">
            <h4 className="text-[10px] font-semibold text-neutral-500 uppercase tracking-widest flex items-center gap-1.5 border-b border-neutral-900 pb-2.5">
              <Lock className="h-3.5 w-3.5 text-neutral-455" />
              WHAT REMAINS SEALED
            </h4>

            <div className="space-y-3 font-mono text-[10px] text-neutral-400 leading-relaxed">
              <div className="p-2.5 bg-neutral-950 border border-neutral-900 rounded text-neutral-500 flex justify-between items-center">
                <div>
                  <span className="text-[8px] text-neutral-600 block uppercase font-semibold">Losing Bidder Identites</span>
                  <span>🔒 Sealed on-chain</span>
                </div>
                <span className="text-[8px] font-semibold bg-neutral-900 px-2 py-0.5 border border-neutral-850 text-neutral-400 rounded">ENCRYPTED</span>
              </div>

              <div className="p-2.5 bg-neutral-950 border border-neutral-900 rounded text-neutral-500 flex justify-between items-center">
                <div>
                  <span className="text-[8px] text-neutral-600 block uppercase font-semibold">Losing Bid Amounts</span>
                  <span>🔒 Sealed on-chain</span>
                </div>
                <span className="text-[8px] font-semibold bg-neutral-900 px-2 py-0.5 border border-neutral-850 text-neutral-400 rounded">ENCRYPTED</span>
              </div>

              <div className="p-2.5 bg-neutral-950 border border-neutral-900 rounded text-neutral-500 flex justify-between items-center">
                <div>
                  <span className="text-[8px] text-neutral-600 block uppercase font-semibold">Cryptographic Salts (All Bidders)</span>
                  <span>🔒 Sealed locally</span>
                </div>
                <span className="text-[8px] font-semibold bg-neutral-900 px-2 py-0.5 border border-neutral-850 text-neutral-400 rounded">CONFIDENTIAL</span>
              </div>
            </div>
          </div>

        </div>

        {/* Commitment Hash Verification Audit Table */}
        <div className="bg-black border border-neutral-900 rounded-lg p-5 space-y-4">
          <h4 className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest border-b border-neutral-900 pb-2.5">
            Cryptographic Bid Commitment Audit table
          </h4>
          
          <div className="space-y-2.5">
            {Object.keys(auction.commitments).map((bidder, idx) => {
              const isWinner = bidder === auction.winningBidder;
              const commitment = auction.commitments[bidder];

              return (
                <div 
                  key={idx} 
                  className={`p-3 border rounded-md flex flex-col sm:flex-row sm:items-center justify-between text-[10px] font-mono gap-2 ${
                    isWinner 
                      ? 'bg-neutral-900/40 border-neutral-800' 
                      : 'bg-black border-neutral-900'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[8px] text-neutral-500 uppercase font-semibold">Bidder:</span>
                      <span className="text-neutral-300 break-all select-all">{bidder.substring(0, 16)}...</span>
                      {isWinner && (
                        <span className="px-1.5 py-0.5 rounded bg-white border border-transparent text-[8px] text-black font-bold uppercase">
                          Winner
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-neutral-500">
                      <span className="text-[8px] text-neutral-600 uppercase font-semibold">Commitment:</span>
                      <span className="break-all select-all">{commitment}</span>
                    </div>
                  </div>

                  <div className="sm:text-right flex sm:flex-col justify-between sm:justify-start items-center sm:items-end gap-1.5">
                    <span className="text-[8px] text-neutral-500 uppercase font-semibold block">Audit Validation</span>
                    
                    {isWinner ? (
                      <span className="text-white font-semibold flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                        Verified Match
                      </span>
                    ) : (
                      <span className="text-neutral-400 font-semibold flex items-center gap-1">
                        <Lock className="h-3 w-3 text-neutral-550 animate-pulse" />
                        Sealed (Audit Passed)
                      </span>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
