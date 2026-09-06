// src/pages/Dashboard.tsx
import React from 'react';
import { useWallet } from '../context/WalletContext';
import { MidnightService } from '../services/midnightService';
import { Link } from 'react-router-dom';
import { 
  Lock, Landmark, CheckCircle2, Hammer, 
  ArrowRight, Cpu, Trophy 
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { connected, address, connect } = useWallet();

  if (!connected || !address) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <div className="p-4 bg-neutral-950 border border-neutral-900 text-white rounded-2xl w-fit mx-auto shadow-inner">
          <Cpu className="h-10 w-10 animate-pulse" />
        </div>
        
        <h1 className="text-xl font-semibold text-white tracking-tight">
          Connect Your Midnight Wallet
        </h1>
        
        <p className="text-xs text-neutral-500 leading-relaxed font-normal">
          Access your private bidding registry, review submitted sealed bids, and manage your deployed procurement contracts securely.
        </p>

        <button 
          onClick={connect}
          className="w-full py-2.5 bg-white hover:bg-neutral-200 text-black font-semibold text-xs rounded-lg shadow transition-all cursor-pointer border border-transparent"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  const auctions = MidnightService.getAuctions();
  
  // My created auctions
  const myAuctions = auctions.filter(a => a.owner === address);
  
  // My bids
  const myBids = auctions.filter(a => {
    return address in a.commitments;
  });

  const activeAuctionsCount = auctions.filter(a => a.status === 'OPEN').length;
  const verifiedResultsCount = auctions.filter(a => a.status === 'RESULT_AVAILABLE').length;

  const formatCurrency = (val: number, currency: string = '$') => {
    if (val >= 1000000) {
      return `${currency}${(val / 1000000).toFixed(1)}M`;
    } else if (val >= 1000) {
      return `${currency}${(val / 1000).toFixed(0)}K`;
    }
    return `${currency}${val.toLocaleString()}`;
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-white border-transparent text-black font-semibold';
      case 'CLOSED':
        return 'bg-transparent border-neutral-800 text-neutral-400';
      case 'RESULT_AVAILABLE':
        return 'bg-neutral-900 border-neutral-800 text-neutral-300';
      case 'CANCELLED':
        return 'bg-transparent border-dashed border-neutral-800 text-neutral-600';
      default:
        return 'bg-transparent border-neutral-850 text-neutral-500';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8 space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
          <Landmark className="h-5 w-5 text-neutral-400" />
          Sealed Procurement Dashboard
        </h1>
        <p className="text-xs text-neutral-500 mt-1 font-mono break-all select-all">
          Wallet: {address}
        </p>
      </div>

      {/* Grid Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="v-panel p-5 space-y-1">
          <span className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider block">My Sealed Bids</span>
          <span className="text-xl font-semibold font-mono text-neutral-200">{myBids.length}</span>
        </div>

        <div className="v-panel p-5 space-y-1">
          <span className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider block">My Projects Deployed</span>
          <span className="text-xl font-semibold font-mono text-neutral-200">{myAuctions.length}</span>
        </div>

        <div className="v-panel p-5 space-y-1">
          <span className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider block">Active Tenders</span>
          <span className="text-xl font-semibold font-mono text-neutral-200">{activeAuctionsCount}</span>
        </div>

        <div className="v-panel p-5 space-y-1">
          <span className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider block">Verified Outcomes</span>
          <span className="text-xl font-semibold font-mono text-neutral-200">{verifiedResultsCount}</span>
        </div>
      </section>

      {/* Main Split: Bids & Auctions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Card: My Sealed Bids */}
        <div className="v-panel p-6 space-y-4">
          <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-neutral-900 pb-3">
            <Lock className="h-4 w-4 text-neutral-400" />
            My Active Sealed Bids
          </h3>

          {myBids.length === 0 ? (
            <div className="py-12 border border-dashed border-neutral-900 rounded-lg text-center text-xs text-neutral-500 space-y-3">
              <p className="font-normal">You have not submitted any private bids yet.</p>
              <Link 
                to="/auctions" 
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-transparent hover:bg-neutral-900 border border-neutral-800 rounded-md text-neutral-200 hover:text-white font-medium transition-colors"
              >
                Browse Projects <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {myBids.map(auc => {
                const meta = MidnightService.getAuctionMeta(auc.id);
                const privateData = MidnightService.getPrivateBidData(auc.id);
                const isWinner = auc.winningBidder === address;

                return (
                  <div key={auc.id} className="p-4 bg-black border border-neutral-900 hover:border-neutral-850 rounded-lg space-y-3 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-xs font-semibold text-neutral-300 leading-tight truncate max-w-[200px] sm:max-w-xs">{meta.title}</h4>
                        <span className="text-[9px] text-neutral-500 font-mono block mt-1">Est. value: {formatCurrency(meta.estimatedValue)}</span>
                      </div>

                      <span className={`px-2 py-0.5 rounded border text-[9px] font-semibold ${getStatusBadgeStyle(auc.status)}`}>
                        {auc.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-neutral-900 pt-3">
                      <div>
                        <span className="text-[9px] text-neutral-500 block uppercase font-mono">Your Sealed Bid:</span>
                        <span className="text-neutral-300 font-semibold font-mono text-xs">
                          {privateData ? formatCurrency(privateData.bidValue) : '🔒 HASH ONLY'}
                        </span>
                      </div>

                      <Link
                        to={`/auctions/${auc.id}`}
                        className="inline-flex items-center gap-1 text-[10px] font-semibold text-neutral-400 hover:text-white transition-colors"
                      >
                        Details <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>

                    {/* Reveal feedback inside row */}
                    {auc.status === 'RESULT_AVAILABLE' && (
                      <div className="pt-2 border-t border-neutral-900">
                        {isWinner ? (
                          <div className="bg-neutral-950 border border-neutral-900 rounded-md p-2 flex items-center justify-between text-[10px]">
                            <span className="text-white font-semibold flex items-center gap-1">
                              <Trophy className="h-3.5 w-3.5 text-neutral-400" /> Winner Awarded
                            </span>
                            <span className="text-neutral-400 font-mono">Verified lowest bid ✓</span>
                          </div>
                        ) : (
                          <div className="bg-neutral-950 border border-neutral-900 rounded-md p-2 flex items-center justify-between text-[10px] text-neutral-500">
                            <span>Participated</span>
                            <span className="font-mono text-[9px]">🔒 Losing bid remained sealed</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Card: My Deployed Projects */}
        <div className="v-panel p-6 space-y-4">
          <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-neutral-900 pb-3">
            <Hammer className="h-4 w-4 text-neutral-400" />
            My Deployed Projects
          </h3>

          {myAuctions.length === 0 ? (
            <div className="py-12 border border-dashed border-neutral-900 rounded-lg text-center text-xs text-neutral-500 space-y-3">
              <p className="font-normal">You have not deployed any contracting auctions.</p>
              <Link 
                to="/"
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-neutral-200 text-black font-semibold rounded-md transition-colors"
              >
                Create New Auction
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {myAuctions.map(auc => {
                const meta = MidnightService.getAuctionMeta(auc.id);

                return (
                  <div key={auc.id} className="p-4 bg-black border border-neutral-900 hover:border-neutral-850 rounded-lg space-y-3 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-xs font-semibold text-neutral-300 leading-tight truncate max-w-[200px] sm:max-w-xs">{meta.title}</h4>
                        <span className="text-[9px] text-neutral-500 font-mono block mt-1">Est. value: {formatCurrency(meta.estimatedValue)}</span>
                      </div>

                      <span className={`px-2 py-0.5 rounded border text-[9px] font-semibold ${getStatusBadgeStyle(auc.status)}`}>
                        {auc.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-neutral-900 pt-3 text-[10px]">
                      <div className="text-neutral-500">
                        <span className="font-mono text-[9px]">{auc.bidCount} bids registered</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <Link
                          to={`/auctions/${auc.id}`}
                          className="text-neutral-450 hover:text-white transition-colors"
                        >
                          Public Page
                        </Link>
                        <Link
                          to={`/admin/${auc.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-200 hover:text-white font-medium rounded-md transition-colors"
                        >
                          Admin Console <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
