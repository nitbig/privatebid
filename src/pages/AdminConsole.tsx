// src/pages/AdminConsole.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { MidnightService, PublicLedgerState } from '../services/midnightService';
import { 
  Settings, Clock, FileText, 
  Lock, EyeOff, AlertTriangle, ArrowLeft, Loader2, CheckCircle2 
} from 'lucide-react';

export const AdminConsole: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { connected, address } = useWallet();

  const [auction, setAuction] = useState<PublicLedgerState | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

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

  const isOwner = connected && address === auction.owner;

  if (!isOwner) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="p-3 bg-neutral-950 border border-neutral-900 text-white rounded-xl w-fit mx-auto animate-bounce">
          <AlertTriangle className="h-6 w-6 text-neutral-400" />
        </div>
        <h1 className="text-lg font-semibold text-white">Access Denied</h1>
        <p className="text-xs text-neutral-500 leading-relaxed font-normal">
          You are not the registered owner of this smart contract. Access to the creator console is cryptographically restricted.
        </p>
        <Link 
          to={`/auctions/${id}`} 
          className="inline-block px-4 py-2 bg-neutral-900 border border-neutral-800 text-xs font-semibold text-neutral-300 rounded-lg hover:border-neutral-700"
        >
          View Public Auction Details
        </Link>
      </div>
    );
  }

  const handleCloseAuction = async () => {
    setLoadingAction('close');
    try {
      await MidnightService.closeAuctionTransaction(id);
      const updated = MidnightService.getAuction(id);
      setAuction(updated);
    } catch (e) {
      console.error(e);
      alert("Failed to close auction.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleFinalizeAuction = async () => {
    setLoadingAction('finalize');
    try {
      await MidnightService.finalizeAuctionTransaction(id);
      const updated = MidnightService.getAuction(id);
      setAuction(updated);
    } catch (e) {
      console.error(e);
      alert("Failed to finalize auction.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleCancelAuction = async () => {
    if (!window.confirm("Are you sure you want to cancel this auction contract? This cannot be undone.")) return;
    setLoadingAction('cancel');
    try {
      await MidnightService.cancelAuctionTransaction(id);
      const updated = MidnightService.getAuction(id);
      setAuction(updated);
    } catch (e) {
      console.error(e);
      alert("Failed to cancel auction.");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8 space-y-6">
      
      {/* Header breadcrumb */}
      <div>
        <Link 
          to={`/auctions/${id}`} 
          className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-200 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Auction Detail
        </Link>
        
        <h1 className="text-xl font-semibold text-white tracking-tight flex items-center gap-2">
          <Settings className="h-5 w-5 text-neutral-400" />
          Auction Creator Console
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Smart Contract Admin Portal for: <span className="font-semibold text-neutral-300">{meta.title}</span>
        </p>
      </div>

      {/* Grid panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Lifecycle Controls (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card: Lifecycle Management */}
          <div className="v-panel p-6 space-y-6">
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-neutral-900 pb-3">
              <Clock className="h-4 w-4 text-neutral-400" />
              Lifecycle & State Operations
            </h3>

            {/* Steps Timeline Visualizer */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { state: 'OPEN', title: '1. Open', desc: 'Bids accepted' },
                { state: 'CLOSED', title: '2. Closed', desc: 'Reveal phase active' },
                { state: 'RESULT_AVAILABLE', title: '3. Finalized', desc: 'Winner published' },
                { state: 'CANCELLED', title: 'Cancelled', desc: 'Contract void' }
              ].map((step, idx) => {
                const isCurrent = auction.status === step.state;
                return (
                  <div 
                    key={idx} 
                    className={`p-3 rounded-lg border text-xs ${
                      isCurrent 
                        ? 'bg-white border-transparent text-black font-semibold' 
                        : 'bg-black border-neutral-900 text-neutral-500'
                    }`}
                  >
                    <p className="font-semibold">{step.title}</p>
                    <p className={`text-[10px] leading-tight mt-0.5 ${isCurrent ? 'text-neutral-700' : 'text-neutral-600'}`}>
                      {step.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Control Actions Description & buttons */}
            <div className="space-y-4 pt-4 border-t border-neutral-900">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Action 1: Close Bidding */}
                <div className="p-4 bg-black border border-neutral-900 rounded-lg space-y-3 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-neutral-200">1. Close Submissions</h4>
                    <p className="text-[10px] text-neutral-500 mt-1 leading-normal font-normal">
                      Freeze bidding commitments. Once closed, contractors can run local ZK proofs to reveal their bids.
                    </p>
                  </div>
                  <button
                    onClick={handleCloseAuction}
                    disabled={auction.status !== 'OPEN' || loadingAction !== null}
                    className="w-full py-2 bg-white hover:bg-neutral-200 disabled:bg-neutral-950 disabled:border-neutral-900 disabled:text-neutral-700 text-black font-semibold text-xs rounded-md transition-colors cursor-pointer inline-flex items-center justify-center border border-transparent gap-2"
                  >
                    {loadingAction === 'close' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Close Submissions
                  </button>
                </div>

                {/* Action 2: Finalize Results */}
                <div className="p-4 bg-black border border-neutral-900 rounded-lg space-y-3 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-neutral-200">2. Finalize & Publish Winner</h4>
                    <p className="text-[10px] text-neutral-500 mt-1 leading-normal font-normal">
                      Lock contract results. Updates the winning bidder address and final tender value on the ledger.
                    </p>
                  </div>
                  <button
                    onClick={handleFinalizeAuction}
                    disabled={auction.status !== 'CLOSED' || loadingAction !== null}
                    className="w-full py-2 bg-white hover:bg-neutral-200 disabled:bg-neutral-950 disabled:border-neutral-900 disabled:text-neutral-700 text-black font-semibold text-xs rounded-md transition-colors cursor-pointer inline-flex items-center justify-center border border-transparent gap-2"
                  >
                    {loadingAction === 'finalize' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Finalize Results
                  </button>
                </div>

              </div>

              {/* Action 3: Danger Zone / Cancellation */}
              <div className="p-4 bg-black border border-neutral-900 rounded-lg space-y-3">
                <div>
                  <h4 className="text-xs font-semibold text-neutral-200">Contract Cancellation</h4>
                  <p className="text-[10px] text-neutral-500 mt-1 leading-normal font-normal">
                    Permanently cancel the auction. Registered bids are voided, and no winner can be disclosed.
                  </p>
                </div>
                <button
                  onClick={handleCancelAuction}
                  disabled={['RESULT_AVAILABLE', 'CANCELLED'].includes(auction.status) || loadingAction !== null}
                  className="w-full py-2 bg-transparent hover:bg-neutral-900 border border-neutral-800 disabled:border-neutral-900 disabled:text-neutral-700 text-neutral-400 hover:text-white font-medium text-xs rounded-md transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  {loadingAction === 'cancel' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Cancel Auction Contract
                </button>
              </div>

            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Sealed Bid Registry (1/3 width) */}
        <div className="space-y-6">
          
          <div className="v-panel p-5 space-y-4">
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-neutral-900 pb-3">
              <FileText className="h-4 w-4 text-neutral-400" />
              Sealed Bids Registry
            </h3>

            <p className="text-[10px] text-neutral-500 leading-normal font-normal">
              Below is the list of active bids registered on the contract. Amounts remain sealed as cryptographic hashes.
            </p>

            <div className="space-y-2.5">
              {Object.keys(auction.commitments).map((bidderAddress, idx) => {
                const commitmentHash = auction.commitments[bidderAddress];
                return (
                  <div key={idx} className="p-3 bg-black border border-neutral-900 rounded-lg space-y-1.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-neutral-450 font-semibold">Bidder #{idx + 1}</span>
                      <span className="text-[9px] font-mono text-neutral-600">{bidderAddress.substring(0, 12)}...</span>
                    </div>

                    <div className="font-mono text-[9px] text-neutral-500 break-all bg-neutral-950 p-1.5 border border-neutral-900 rounded">
                      Hash: {commitmentHash.substring(0, 32)}...
                    </div>

                    <div className="flex items-center gap-1 text-[9px] text-neutral-550 font-semibold uppercase tracking-wider">
                      <Lock className="h-3 w-3" /> Sealed on Midnight
                    </div>
                  </div>
                );
              })}

              {Object.keys(auction.commitments).length === 0 && (
                <div className="py-8 text-center text-xs text-neutral-600 font-normal">
                  No bids submitted yet.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
