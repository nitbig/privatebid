// src/pages/Landing.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PrivacyVisualizer } from '../components/PrivacyVisualizer';
import { useWallet } from '../context/WalletContext';
import { MidnightService, AuctionType } from '../services/midnightService';
import { Logo } from '../components/Logo';
import { ShieldCheck, EyeOff, FileCheck, Plus, Compass, Clock, Loader2 } from 'lucide-react';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { connected, connect } = useWallet();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(0);
  const [log, setLog] = useState('');

  // Form states for creating an auction
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedValue, setEstimatedValue] = useState<number>(10000000);
  const [durationHours, setDurationHours] = useState<number>(24);
  const [auctionType, setAuctionType] = useState<AuctionType>('LOWEST_VALID_BID');
  const [category, setCategory] = useState('Infrastructure');

  const handleCreateAuction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected) {
      alert("Please connect your wallet first.");
      return;
    }

    setSubmitting(true);
    try {
      const deadline = Date.now() + durationHours * 60 * 60 * 1000;
      const auctionId = await MidnightService.deployAuctionContract(
        title,
        description,
        estimatedValue,
        deadline,
        auctionType,
        category,
        '$',
        (s, l) => {
          setStep(s);
          setLog(l);
        }
      );
      setShowCreateModal(false);
      navigate(`/admin/${auctionId}`);
    } catch (err) {
      console.error(err);
      alert("Deployment failed.");
    } finally {
      setSubmitting(false);
      setStep(0);
      setLog('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-24 py-12 space-y-20">
      
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-6 pt-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-full text-neutral-400 text-[10px] font-semibold tracking-widest uppercase">
          <Logo className="h-3.5 w-auto opacity-80" monochrome={true} />
          Midnight Network Partner Project
        </div>
        
        <div className="space-y-2">
          <h1 className="text-5xl sm:text-6xl font-semibold tracking-[-2.28px] text-white leading-none uppercase">
            Bid privately
          </h1>
          <p className="text-lg sm:text-xl font-normal tracking-[-0.5px] text-neutral-400 uppercase">
            SEALED BY DEFAULT
          </p>
        </div>
        
        <p className="text-neutral-500 font-normal text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
          Sealed bids without exposing competing pricing to competitors.
          A privacy-preserving infrastructure for digital procurement and civil contracting.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            to="/auctions"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 bg-transparent border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900 rounded-md text-neutral-200 font-medium text-xs transition-all"
          >
            <Compass className="h-4 w-4 text-neutral-400" />
            Explore Auctions
          </Link>

          <button
            onClick={() => connected ? setShowCreateModal(true) : connect()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 bg-white hover:bg-neutral-200 active:bg-neutral-350 text-black font-medium text-xs rounded-md shadow-sm transition-all cursor-pointer border border-transparent"
          >
            <Plus className="h-4 w-4" />
            {connected ? 'Create Auction' : 'Connect Wallet to Start'}
          </button>
        </div>
      </section>

      {/* Live Interactive Visualizer */}
      <section className="space-y-4">
        <h2 className="text-[10px] font-medium text-neutral-500 uppercase tracking-widest text-center">
          How Bidding Remains Cryptographically Sealed
        </h2>
        <PrivacyVisualizer />
      </section>

      {/* Value Proposition Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="v-panel p-6 space-y-4">
          <div className="p-2.5 bg-black border border-neutral-800 text-white rounded-md w-fit">
            <EyeOff className="h-4 w-4" />
          </div>
          <h3 className="text-white font-medium text-sm">Confidential Bidding</h3>
          <p className="text-xs text-neutral-500 leading-relaxed font-normal">
            Submit your true valuation without revealing it to competitors, preventing collusion, front-running, and strategic price manipulation.
          </p>
        </div>

        <div className="v-panel p-6 space-y-4">
          <div className="p-2.5 bg-black border border-neutral-800 text-white rounded-md w-fit">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <h3 className="text-white font-medium text-sm">Fair Competition</h3>
          <p className="text-xs text-neutral-500 leading-relaxed font-normal">
            Calculations are performed off-chain using Zero-Knowledge proofs. Bids remain completely sealed unless they are proven to be the legitimate winner.
          </p>
        </div>

        <div className="v-panel p-6 space-y-4">
          <div className="p-2.5 bg-black border border-neutral-800 text-white rounded-md w-fit">
            <FileCheck className="h-4 w-4" />
          </div>
          <h3 className="text-white font-medium text-sm">Verifiable Outcomes</h3>
          <p className="text-xs text-neutral-500 leading-relaxed font-normal">
            Anyone can audit the final winning contract to verify that the selection algorithm was followed, without ever revealing losing bid amounts.
          </p>
        </div>
      </section>

      {/* CREATE AUCTION MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-900 rounded-lg max-w-lg w-full p-6 space-y-6 shadow-2xl relative">
            <div className="border-b border-neutral-900 pb-4">
              <h3 className="text-sm font-semibold text-white">Create Sealed-Bid Procurement Auction</h3>
              <p className="text-xs text-neutral-500 mt-1">Deploy a new Compact contract for your infrastructure project.</p>
            </div>

            {submitting ? (
              <div className="py-8 space-y-6 text-center">
                <Loader2 className="h-8 w-8 text-white animate-spin mx-auto" />
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-neutral-200">Deploying Compact Smart Contract...</p>
                  <p className="text-[10px] font-mono text-neutral-400">{log}</p>
                </div>
                {/* Visual Progress Stepper inside modal during creation */}
                <div className="flex justify-center gap-1.5 max-w-xs mx-auto">
                  {[1, 2, 3, 4, 5, 6].map((s) => (
                    <div 
                      key={s} 
                      className={`h-0.5 flex-grow rounded-full transition-all ${
                        s <= step ? 'bg-white' : 'bg-neutral-900'
                      }`} 
                    />
                  ))}
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateAuction} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Project Title</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. NH-33 Highway Expansion — Package 04"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-black border border-neutral-900 focus:border-white rounded-md p-2 text-base md:text-xs text-neutral-200 outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Description</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Provide details on project specifications, guidelines, and qualifications..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-black border border-neutral-900 focus:border-white rounded-md p-2 text-base md:text-xs text-neutral-200 outline-none resize-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Est. Contract Value ($)</label>
                    <input
                      required
                      type="number"
                      value={estimatedValue}
                      onChange={(e) => setEstimatedValue(Number(e.target.value))}
                      className="w-full bg-black border border-neutral-900 focus:border-white rounded-md p-2 text-base md:text-xs text-neutral-200 outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Deadline (Hours)</label>
                    <input
                      required
                      type="number"
                      value={durationHours}
                      onChange={(e) => setDurationHours(Number(e.target.value))}
                      className="w-full bg-black border border-neutral-900 focus:border-white rounded-md p-2 text-base md:text-xs text-neutral-200 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Auction Logic</label>
                    <select
                      value={auctionType}
                      onChange={(e) => setAuctionType(e.target.value as AuctionType)}
                      className="w-full bg-black border border-neutral-900 focus:border-white rounded-md p-2 text-base md:text-xs text-neutral-350 outline-none transition-colors"
                    >
                      <option value="LOWEST_VALID_BID">Lowest Valid Bid (Procurement)</option>
                      <option value="HIGHEST_VALID_BID">Highest Valid Bid (Asset Sale)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-black border border-neutral-900 focus:border-white rounded-md p-2 text-base md:text-xs text-neutral-355 outline-none transition-colors"
                    >
                      <option value="Infrastructure">Infrastructure</option>
                      <option value="Procurement">Procurement</option>
                      <option value="Technology">Technology</option>
                      <option value="Municipal Services">Municipal Services</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-900">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white font-medium text-xs rounded-md cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-white hover:bg-neutral-200 text-black font-semibold text-xs rounded-md cursor-pointer transition-colors"
                  >
                    Deploy Contract
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
