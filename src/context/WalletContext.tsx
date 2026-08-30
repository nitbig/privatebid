// src/context/WalletContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { MidnightService } from '../services/midnightService';

interface WalletContextType {
  connected: boolean;
  address: string | null;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    // Autoconnect if address exists in localStorage
    const saved = localStorage.getItem('midnight_wallet_address');
    if (saved) {
      setAddress(saved);
    }
  }, []);

  const connect = async () => {
    setConnecting(true);
    try {
      const addr = await MidnightService.connectMidnightWallet();
      setAddress(addr);
    } catch (e) {
      console.error("Wallet connection failed", e);
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = () => {
    localStorage.removeItem('midnight_wallet_address');
    setAddress(null);
  };

  return (
    <WalletContext.Provider value={{
      connected: !!address,
      address,
      connecting,
      connect,
      disconnect
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
