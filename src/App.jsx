// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { WalletProvider } from './context/WalletContext';
import { WalletButton } from './components/WalletButton';
import { Landing } from './pages/Landing';
import { Explore } from './pages/Explore';
import { AuctionDetail } from './pages/AuctionDetail';
import { Dashboard } from './pages/Dashboard';
import { AdminConsole } from './pages/AdminConsole';
import { AuditVerify } from './pages/AuditVerify';
import { Compass, Grid, FileCheck } from 'lucide-react';
import { Logo } from './components/Logo';

function App() {
  return (
    <WalletProvider>
      <Router>
        <div className="min-h-screen bg-black text-neutral-100 flex flex-col font-sans">
          
          {/* Floating Header Navigation (Bloxs style layout, monochrome theme) */}
          <header className="fixed top-0 inset-x-0 z-50 py-4 pointer-events-none">
            <div className="max-w-7xl mx-auto px-6 lg:px-[200px] w-full pointer-events-auto">
              
              {/* Unified Floating Glass Navigation Capsule */}
              <div className="bg-neutral-950/60 backdrop-blur-xl border border-neutral-900/80 rounded-full px-6 py-2 shadow-[0_12px_32px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.05)]">
                <div className="flex items-center justify-between">
                  
                  {/* Left Side: Logo & Brand & Navigation */}
                  <div className="flex items-center gap-4">
                    {/* Logo & Brand Wordmark */}
                    <Link to="/" className="flex items-center gap-2 group">
                      <div className="p-1 bg-black border border-neutral-900 group-hover:border-neutral-850 rounded-full overflow-hidden flex items-center justify-center h-9 w-9 transition-all shadow-md">
                        <Logo className="h-5.5 w-auto" monochrome={true} />
                      </div>
                      <span className="text-base font-bold tracking-[0.05em] text-white uppercase group-hover:text-neutral-300 transition-colors">PRIVATEBID</span>
                    </Link>

                    {/* Vertical Divider Line */}
                    <div className="hidden md:block w-px h-4 bg-neutral-800" />

                    {/* Navigation Links */}
                    <nav className="hidden md:flex items-center gap-5">
                      <Link to="/auctions" className="flex items-center gap-1.5 text-xs font-medium text-neutral-400 hover:text-white transition-colors">
                        <Compass className="h-3.5 w-3.5" />
                        Explore
                      </Link>
                      <Link to="/dashboard" className="flex items-center gap-1.5 text-xs font-medium text-neutral-400 hover:text-white transition-colors">
                        <Grid className="h-3.5 w-3.5" />
                        Dashboard
                      </Link>
                      <Link to="/verify/pb_auction_bridge" className="flex items-center gap-1.5 text-xs font-medium text-neutral-400 hover:text-white transition-colors">
                        <FileCheck className="h-3.5 w-3.5" />
                        Verify
                      </Link>
                    </nav>
                  </div>

                  {/* Right Side: Wallet Connection */}
                  <div className="flex items-center gap-4">
                    <WalletButton />
                  </div>

                </div>
              </div>

            </div>
          </header>

          {/* Main Content Areas (Pushed down to clear the floating header) */}
          <main className="flex-grow pt-24">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auctions" element={<Explore />} />
              <Route path="/auctions/:id" element={<AuctionDetail />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin/:id" element={<AdminConsole />} />
              <Route path="/verify/:id" element={<AuditVerify />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="border-t border-neutral-900 bg-black py-8 mt-12 text-center text-xs text-neutral-600 font-mono">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p>© {new Date().getFullYear()} PrivateBid.</p>
              <p className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-neutral-400 animate-pulse" />
                Midnight Testnet Dev Environment Active
              </p>
            </div>
          </footer>

        </div>
      </Router>
    </WalletProvider>
  );
}

export default App;
