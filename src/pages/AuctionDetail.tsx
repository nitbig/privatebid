// src/pages/AuctionDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { MidnightService, PublicLedgerState, BidderPrivateData } from '../services/midnightService';
import { ZKProofProgress } from '../components/ZKProofProgress';
import { 
  Building2, ShieldAlert, CheckCircle2, Lock, 
  HelpCircle, Eye, RefreshCw, Trophy, FileSignature, ArrowLeft, Info 
} from 'lucide-react';

export const AuctionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { connected, address, connect } = useWallet();

  const [auction, setAuction] = useState<PublicLedgerState | null>(null);
  const [privateBid, setPrivateBid] = useState<BidderPrivateData | null>(null);
  
  // Interactive Bid Form States
  const [bidValue, setBidValue] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(0);
  const [log, setLog] = useState('');
  
  // Reveal Form States
  const [revealing, setRevealing] = useState(false);
  const [revealSuccess, setRevealSuccess] = useState(false);
  const [revealError, setRevealError] = useState('');

  useEffect(() => {
    if (id) {
      const data = MidnightService.getAuction(id);
      setAuction(data);
      const userBid = MidnightService.getPrivateBidData(id);
      setPrivateBid(userBid);
    }
  }, [id]);

  if (!auction || !id) {
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'OPEN': return 'Open for Bidding';
      case 'CLOSED': return 'Bidding Closed (Reveal Phase)';
      case 'RESULT_AVAILABLE': return 'Verified Outcome Available';
      case 'CANCELLED': return 'Cancelled';
      default: return status;
    }
  };

  // Submit Bid with ZK Prover Simulation
  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedVal = Number(bidValue);
    if (!parsedVal || parsedVal <= 0) {
      alert("Please enter a valid bid amount.");
      return;
    }

    setSubmitting(true);
    try {
      await MidnightService.submitBidTransaction(id, parsedVal, (s, l) => {
        setStep(s);
        setLog(l);
      });
      // Refresh local state
      const updated = MidnightService.getAuction(id);
      setAuction(updated);
      const userBid = MidnightService.getPrivateBidData(id);
      setPrivateBid(userBid);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Bidding failed.");
    } finally {
      setSubmitting(false);
      setStep(0);
      setLog('');
    }
  };

  // Run revealBid circuit to verify commitment and compare bid value
  const handleBidReveal = async () => {
    if (!address) return;
    setRevealing(true);
    setRevealError('');
    try {
      const { isWinner, value } = await MidnightService.revealBidTransaction(id, address, (s, l) => {
        setStep(s);
        setLog(l);
      });
      setRevealSuccess(true);
      
      // Refresh local state
      const updated = MidnightService.getAuction(id);
      setAuction(updated);
    } catch (err: any) {
      console.error(err);
      setRevealError(err.message || "Reveal verification failed.");
    } finally {
      setRevealing(false);
      setStep(0);
      setLog('');
    }
  };

  const isOwner = connected && address === auction.owner;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8 space-y-6">
      
      {/* Back button & Owner admin portal link */}
      <div className="flex items-center justify-between">
        <Link 
          to="/auctions" 
          className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Auctions
        </Link>

        {isOwner && (
          <Link
            to={`/admin/${id}`}
            className="px-3 py-1.5 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-200 hover:text-white font-medium text-xs rounded-md transition-colors cursor-pointer"
          >
            Open Owner Console
          </Link>
        )}
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT COLUMN: Project Details (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card: Project Overview */}
          <div className="v-panel p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="px-2 py-0.5 rounded bg-black border border-neutral-900 text-[9px] text-neutral-500 font-mono uppercase tracking-wider">
                  {meta.category}
                </span>
                <h1 className="text-xl sm:text-2xl font-semibold tracking-[-1.28px] text-white mt-2">
                  {meta.title}
                </h1>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold font-mono">Status</span>
                <span className="block text-[10px] font-semibold text-white mt-1.5 bg-neutral-950 px-2 py-1 border border-neutral-800 rounded uppercase tracking-wider">
                  {getStatusLabel(auction.status)}
                </span>
              </div>
            </div>

            <p className="text-xs text-neutral-455 leading-relaxed">
              {meta.description}
            </p>

            {/* Spec grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-black border border-neutral-900 rounded-lg p-4 mt-4">
              <div>
                <span className="text-[9px] text-neutral-500 uppercase font-semibold">Estimated Value</span>
                <span className="block text-xs font-semibold text-neutral-200 mt-0.5">{formatCurrency(meta.estimatedValue)}</span>
              </div>
              <div>
                <span className="text-[9px] text-neutral-500 uppercase font-semibold">Bidding Method</span>
                <span className="block text-xs font-semibold text-white mt-0.5">
                  {auction.auctionType === 'LOWEST_VALID_BID' ? 'Lowest Valid' : 'Highest Valid'}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-neutral-500 uppercase font-semibold">Total Sealed Bids</span>
                <span className="block text-xs font-mono font-bold text-neutral-200 mt-0.5">{auction.bidCount}</span>
              </div>
              <div>
                <span className="text-[9px] text-neutral-500 uppercase font-semibold">Deadline</span>
                <span className="block text-xs font-mono font-semibold text-neutral-200 mt-0.5">
                  {new Date(auction.deadline).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* ZK Pipeline view (displayed if bidder is submitting or revealing) */}
          {(submitting || revealing) && (
            <ZKProofProgress currentStep={step} logMessage={log} />
          )}

          {/* Card: Audit State / Ledger Info */}
          <div className="v-panel p-6 space-y-4">
            <h3 className="text-[10px] font-semibold text-neutral-500 uppercase tracking-widest flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-neutral-450" />
              On-Chain Contract Metrics
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="space-y-1.5 p-3 bg-black rounded-md border border-neutral-900">
                <span className="text-[8px] text-neutral-550 uppercase font-semibold block">Contract Ledger Address</span>
                <span className="text-neutral-400 break-all select-all">{auction.address}</span>
              </div>

              <div className="space-y-1.5 p-3 bg-black rounded-md border border-neutral-900">
                <span className="text-[8px] text-neutral-550 uppercase font-semibold block">Auction Authority (Owner)</span>
                <span className="text-neutral-400 break-all select-all">{auction.owner}</span>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Interaction Panel (1/3 width) */}
        <div className="space-y-6">

          {/* Case 1: Bidding is OPEN */}
          {auction.status === 'OPEN' && (
            <div className="v-panel p-5 space-y-6">
              <div className="border-b border-neutral-900 pb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-neutral-400" />
                  Your Private Bid
                </h3>
                <p className="text-[10px] text-neutral-500 mt-0.5 font-normal">Your bid amount will remain completely confidential.</p>
              </div>

              {privateBid ? (
                // Already bid
                <div className="space-y-4">
                  <div className="bg-black border border-neutral-900 rounded-lg p-4 text-center space-y-2">
                    <CheckCircle2 className="h-6 w-6 text-white mx-auto" />
                    <p className="text-xs font-semibold text-neutral-200">Sealed Bid Submitted</p>
                    <p className="text-[10px] text-neutral-500 leading-normal font-normal">
                      Your bid hash has been registered on the Midnight ledger. Competitors cannot inspect your price.
                    </p>
                  </div>

                  <div className="bg-black border border-neutral-900 rounded-lg p-3 space-y-3 font-mono text-[9px] text-neutral-500 leading-tight">
                    <div>
                      <span className="text-[8px] text-neutral-600 block">Plaintext Amount (Local Only):</span>
                      <span className="text-white font-medium">{formatCurrency(privateBid.bidValue)}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-neutral-600 block">Cryptographic Salt:</span>
                      <span className="text-neutral-400 break-all">{privateBid.salt.slice(0, 16)}...</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-neutral-600 block">On-chain Commitment Hash:</span>
                      <span className="text-neutral-400 break-all">{privateBid.commitment.slice(0, 24)}...</span>
                    </div>
                  </div>
                </div>
              ) : (
                // Submit Bid form
                <>
                  {!connected ? (
                    <div className="text-center py-4 space-y-3">
                      <p className="text-xs text-neutral-500 font-normal">Connect your Midnight Wallet to submit a sealed bid.</p>
                      <button 
                        onClick={connect}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-white hover:bg-neutral-200 text-black font-semibold text-xs rounded-md shadow transition-all cursor-pointer"
                      >
                        Connect Wallet
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleBidSubmit} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-semibold text-neutral-500 uppercase tracking-wider">Bid Amount ($)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-neutral-500 font-mono text-xs">$</span>
                          <input
                            required
                            type="number"
                            placeholder="0"
                            value={bidValue}
                            onChange={(e) => setBidValue(e.target.value)}
                            className="w-full bg-black border border-neutral-900 focus:border-white rounded-md py-2 pl-7 pr-4 text-base md:text-xs font-mono text-neutral-200 outline-none transition-all"
                          />
                        </div>
                      </div>

                      {/* Warning notice */}
                      <div className="flex gap-2 p-3 bg-black border border-neutral-900 rounded text-[10px] text-neutral-550 leading-normal font-normal">
                        <Info className="h-4 w-4 text-neutral-500 flex-shrink-0" />
                        <p>
                          Midnight executes the ZK circuits locally on your browser. Your bid value is hashed with a cryptographically secure salt, and only the hash is sent to the network.
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-2 bg-white hover:bg-neutral-200 text-black font-semibold text-xs rounded-md transition-all cursor-pointer inline-flex items-center justify-center border border-transparent"
                      >
                        {submitting ? 'Generating ZK Proof...' : 'Submit Sealed Bid'}
                      </button>
                    </form>
                  )}
                </>
              )}
            </div>
          )}

          {/* Case 2: Bidding is CLOSED (Reveal / Claim winner phase) */}
          {auction.status === 'CLOSED' && (
            <div className="v-panel p-5 space-y-6">
              <div className="border-b border-neutral-900 pb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <RefreshCw className="h-3.5 w-3.5 text-neutral-400" />
                  Winner Reveal Phase
                </h3>
                <p className="text-[10px] text-neutral-500 mt-0.5 font-normal">Determine the winning contract in zero-knowledge.</p>
              </div>

              {privateBid ? (
                <div className="space-y-4">
                  <div className="bg-black rounded-md p-3.5 border border-neutral-900 space-y-3">
                    <p className="text-xs text-neutral-500 leading-normal font-normal">
                      Bidding has ended. To prove you participated and check if you are the winner, reveal your bid values to the contract.
                    </p>
                    
                    <div className="p-2.5 bg-neutral-950 border border-neutral-900 rounded font-mono text-[9px] text-neutral-500 flex justify-between">
                      <span>Your Sealed Value:</span>
                      <span className="text-white font-semibold">{formatCurrency(privateBid.bidValue)}</span>
                    </div>

                    {revealSuccess ? (
                      <div className="flex gap-2 p-2.5 bg-neutral-950 border border-neutral-900 rounded text-xs text-neutral-200">
                        <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-white" />
                        <span>ZK reveal proof verified on-chain!</span>
                      </div>
                    ) : (
                      <button
                        onClick={handleBidReveal}
                        disabled={revealing}
                        className="w-full py-2 bg-white hover:bg-neutral-200 text-black font-semibold text-xs rounded-md transition-colors cursor-pointer inline-flex items-center justify-center border border-transparent"
                      >
                        {revealing ? 'Computing Reveal Proof...' : 'Reveal Private Bid'}
                      </button>
                    )}

                    {revealError && (
                      <div className="p-2 bg-neutral-950 border border-neutral-900 text-neutral-400 rounded text-[10px] leading-relaxed">
                        {revealError}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 bg-black rounded-md border border-neutral-900">
                  <HelpCircle className="h-6 w-6 text-neutral-600 mx-auto mb-2" />
                  <p className="text-xs text-neutral-400 font-medium">No bid submitted by this wallet</p>
                  <p className="text-[10px] text-neutral-650 mt-1 max-w-[200px] mx-auto font-normal">
                    Only wallets that submitted a bid during the OPEN state can participate in reveal checks.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Case 3: Auction results available (Finalized) */}
          {auction.status === 'RESULT_AVAILABLE' && (
            <div className="v-panel p-5 space-y-6">
              <div className="border-b border-neutral-900 pb-3 text-center">
                <Trophy className="h-6 w-6 text-neutral-400 mx-auto mb-2" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white">Auction Finalized</h3>
                <p className="text-[10px] text-neutral-500 mt-0.5 font-normal">Cryptographic results are public and verifiable.</p>
              </div>

              {auction.winningBidValue ? (
                <div className="space-y-4">
                  <div className="p-3 bg-black border border-neutral-900 rounded-md text-center space-y-1">
                    <span className="text-[9px] text-neutral-500 uppercase font-semibold font-mono">Winning Procurement Contract</span>
                    <span className="block text-sm font-semibold text-white">{formatCurrency(auction.winningBidValue)}</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[8px] text-neutral-650 uppercase font-semibold font-mono">Winner Derived Identity:</span>
                      <span className="font-mono text-[9px] text-neutral-400 break-all block p-2 bg-black border border-neutral-900 rounded-md">
                        {auction.winningBidder}
                      </span>
                    </div>

                    <div className="p-2.5 bg-black border border-neutral-900 rounded-md text-[9px] text-neutral-500 leading-normal space-y-1 flex flex-col font-normal">
                      <span className="text-white font-semibold flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Checked in ZK
                      </span>
                      <span>Losing bids remain encrypted/sealed as commitments on-chain.</span>
                    </div>
                  </div>

                  <Link
                    to={`/verify/${id}`}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 bg-transparent border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900 text-neutral-200 font-semibold text-xs rounded-md shadow-sm transition-all"
                  >
                    <FileSignature className="h-3.5 w-3.5 text-neutral-400" />
                    Verify Audit Report
                  </Link>
                </div>
              ) : (
                <div className="text-center py-4 text-neutral-500 text-xs font-normal">
                  No winner determined (no reveals submitted).
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
