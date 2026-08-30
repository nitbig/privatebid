// src/components/WalletButton.tsx
import React from 'react';
import { useWallet } from '../context/WalletContext';
import { Wallet, LogOut, Loader2 } from 'lucide-react';

export const WalletButton: React.FC = () => {
  const { connected, address, connecting, connect, disconnect } = useWallet();

  if (connecting) {
    return (
      <button 
        disabled
        className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-md text-neutral-400 font-medium text-xs transition-all"
      >
        <Loader2 className="h-3.5 w-3.5 animate-spin text-neutral-400" />
        Connecting...
      </button>
    );
  }

  if (connected && address) {
    const displayAddr = `${address.slice(0, 8)}...${address.slice(-6)}`;
    return (
      <div className="relative group inline-flex items-center gap-2">
        <button 
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 rounded-md text-neutral-200 font-medium text-xs transition-all cursor-default"
        >
          <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
          <span className="font-mono text-xs">{displayAddr}</span>
        </button>
        <button
          onClick={disconnect}
          title="Disconnect wallet"
          className="p-1.5 bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-md text-neutral-400 hover:text-white transition-all cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <button 
      onClick={connect}
      className="inline-flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-neutral-200 active:bg-neutral-300 text-black font-medium text-xs rounded-md shadow-sm transition-all cursor-pointer border border-transparent"
    >
      <Wallet className="h-3.5 w-3.5" />
      Connect Wallet
    </button>
  );
};
