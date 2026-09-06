// src/components/ZKProofProgress.tsx
import React, { useEffect, useRef } from 'react';
import { ShieldCheck, Cpu, Key, FileSignature, Send, CheckCircle2 } from 'lucide-react';

interface ZKProofProgressProps {
  currentStep: number;
  logMessage: string;
  steps?: { title: string; description: string; icon: any }[];
}

export const ZKProofProgress: React.FC<ZKProofProgressProps> = ({ currentStep, logMessage, steps }) => {
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const defaultSteps = [
    { title: 'Hash Commitment', description: 'Computing off-chain hash of bid + salt', icon: ShieldCheck },
    { title: 'Key Derivation', description: 'Resolving bidder identity inside circuit', icon: Key },
    { title: 'ZK Prover', description: 'Generating proof (evaluating constraints)', icon: Cpu },
    { title: 'Signature', description: 'Signing with Midnight Lace wallet', icon: FileSignature },
    { title: 'Node Submission', description: 'Submitting transaction payload', icon: Send },
    { title: 'Confirmed', description: 'State confirmed on Midnight ledger', icon: CheckCircle2 },
  ];

  const activeSteps = steps || defaultSteps;

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logMessage]);

  return (
    <div className="v-panel p-6 v-border-glow">
      <h3 className="text-white font-medium mb-4 text-xs tracking-wider uppercase flex items-center gap-2">
        <Cpu className="h-4 w-4 text-white animate-pulse" />
        Midnight ZK Proof Pipeline
      </h3>

      {/* Stepper Visualizer */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        {activeSteps.map((step, idx) => {
          const stepNum = idx + 1;
          const isCompleted = currentStep > stepNum;
          const isActive = currentStep === stepNum;
          const Icon = step.icon;

          return (
            <div 
              key={idx} 
              className={`p-3 rounded-lg border transition-all text-xs ${
                isCompleted 
                  ? 'bg-neutral-900 border-neutral-800 text-neutral-400' 
                  : isActive
                  ? 'bg-white border-transparent text-black font-semibold'
                  : 'bg-black/40 border-neutral-900 text-neutral-600'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`p-1.5 rounded ${
                  isActive ? 'bg-neutral-100 text-black' : 'bg-neutral-950/80 text-neutral-500'
                }`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <span className="font-mono text-[10px]">Step {stepNum}</span>
              </div>
              <p className={`text-[11px] truncate ${isActive ? 'text-black' : 'text-neutral-300'}`}>{step.title}</p>
              <p className={`text-[9px] leading-tight mt-0.5 truncate ${isActive ? 'text-neutral-800' : 'text-neutral-500'}`}>{step.description}</p>
            </div>
          );
        })}
      </div>

      {/* Terminal Logs Output */}
      <div className="bg-black border border-neutral-900 rounded-md p-4 font-mono text-xs text-neutral-400 leading-relaxed shadow-inner max-h-[140px] overflow-y-auto">
        <div className="flex items-center gap-2 border-b border-neutral-900 pb-2 mb-2">
          <div className="h-1.5 w-1.5 rounded-full bg-neutral-600" />
          <div className="h-1.5 w-1.5 rounded-full bg-neutral-600" />
          <div className="h-1.5 w-1.5 rounded-full bg-neutral-600" />
          <span className="text-[9px] text-neutral-500 font-semibold ml-2">compact-prover-service.log</span>
        </div>
        
        <p className="text-neutral-700">[COMPILER] Loading Compact language standard library v0.23.0...</p>
        <p className="text-neutral-700">[PROVER] Initializing proof keys for contract interface...</p>
        {currentStep >= 1 && (
          <p className="text-white font-medium">[COMPILER] {logMessage}</p>
        )}
        {currentStep >= 3 && (
          <p className="text-neutral-600">[PROVER] Evaluating arithmetic constraints... (1,842 gates compiled)</p>
        )}
        {currentStep >= 4 && (
          <p className="text-neutral-500">[WALLET] Prompting user signature on-screen via Lace extension...</p>
        )}
        {currentStep >= 5 && (
          <p className="text-neutral-500">[NODE] Broadcasting transaction payload to validator pool...</p>
        )}
        {currentStep >= 6 && (
          <p className="text-white font-semibold">[LEDGER] State transition committed. Verification hash verified. SUCCESS ✓</p>
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};
