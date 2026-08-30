// src/pages/Explore.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MidnightService, PublicLedgerState } from '../services/midnightService';
import { Search, Filter, ShieldCheck, Clock, Hammer } from 'lucide-react';

export const Explore: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const auctions = MidnightService.getAuctions();

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
        return 'bg-transparent border-neutral-800 text-neutral-500';
    }
  };

  const filteredAuctions = auctions.filter(auc => {
    const meta = MidnightService.getAuctionMeta(auc.id);
    const matchesSearch = meta.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          meta.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || auc.status === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || meta.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 xl:px-16 2xl:px-24 py-10 space-y-8">
      
      {/* Page Title */}
      <div>
        <h1 className="text-lg font-semibold text-white tracking-[-0.28px] flex items-center gap-2">
          <Hammer className="h-5 w-5 text-neutral-400" />
          Civil Contracting Procurement Registry
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Explore sealed-bid infrastructure and service contract opportunities built on Midnight.
        </p>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-neutral-950 border border-neutral-900 rounded-lg p-3">
        
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-600" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black border border-neutral-900 focus:border-white rounded-md py-1.5 pl-9 pr-4 text-base md:text-xs text-neutral-200 outline-none transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
            <Filter className="h-3 w-3" />
            Filters:
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-black border border-neutral-900 rounded-md p-1.5 text-base md:text-xs text-neutral-350 outline-none hover:border-neutral-800 transition-colors"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open (Bidding)</option>
            <option value="CLOSED">Closed (Reveal Phase)</option>
            <option value="RESULT_AVAILABLE">Result Verified</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-black border border-neutral-900 rounded-md p-1.5 text-base md:text-xs text-neutral-350 outline-none hover:border-neutral-800 transition-colors"
          >
            <option value="ALL">All Categories</option>
            <option value="Infrastructure">Infrastructure</option>
            <option value="Procurement">Procurement</option>
            <option value="Technology">Technology</option>
          </select>
        </div>
      </div>

      {/* Grid of Auctions */}
      {filteredAuctions.length === 0 ? (
        <div className="v-panel p-12 text-center text-xs text-neutral-500">
          No matching auctions found. Try adjusting your search query or filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAuctions.map((auc) => {
            const meta = MidnightService.getAuctionMeta(auc.id);
            
            // Format time remaining
            const timeRemaining = auc.deadline - Date.now();
            const formatTimeRemaining = () => {
              if (timeRemaining <= 0) return 'Bidding Ended';
              const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
              const mins = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
              return `Ends in: ${hours}h ${mins}m`;
            };

            return (
              <div 
                key={auc.id} 
                onClick={() => navigate(`/auctions/${auc.id}`)}
                className="v-panel p-5 flex flex-col justify-between v-panel-hover cursor-pointer relative"
              >
                
                {/* Upper Details */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded bg-black border border-neutral-900 text-[9px] text-neutral-500 font-mono uppercase tracking-wider">
                      {meta.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded border text-[9px] font-semibold transition-colors ${getStatusBadgeStyle(auc.status)}`}>
                      {auc.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-white font-medium text-sm leading-tight hover:text-neutral-400 transition-colors">
                      {meta.title}
                    </h3>
                    <p className="text-xs text-neutral-500 leading-snug line-clamp-2">
                      {meta.description}
                    </p>
                  </div>
                </div>

                {/* Technical / Price parameters */}
                <div className="mt-6 pt-4 border-t border-neutral-900 space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-[9px] text-neutral-500 uppercase font-semibold">Est. Project Value</p>
                      <p className="text-neutral-300 font-semibold mt-0.5">{formatCurrency(meta.estimatedValue, meta.currency)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-neutral-500 uppercase font-semibold">Bidding Method</p>
                      <p className="text-white font-semibold mt-0.5">
                        {auc.auctionType === 'LOWEST_VALID_BID' ? 'Lowest Valid' : 'Highest Valid'}
                      </p>
                    </div>
                  </div>

                  {/* Footer status markers */}
                  <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-neutral-600" />
                      <span>{formatTimeRemaining()}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-neutral-400 bg-neutral-950 px-2 py-0.5 border border-neutral-900 rounded">
                      <ShieldCheck className="h-3.5 w-3.5 text-neutral-500" />
                      <span>{auc.bidCount} sealed</span>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
