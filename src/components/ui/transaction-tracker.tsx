import React from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2, Circle } from 'lucide-react';

interface TransactionTrackerProps {
  step: number;
  txHash?: string;
}

export function TransactionTracker({ step, txHash }: TransactionTrackerProps) {
  if (step === 0) return null;

  const steps = [
    { num: 1, label: "Transaction Submitted" },
    { num: 2, label: "Validators Processing" },
    { num: 3, label: "Consensus Reached" },
    { num: 4, label: "Reply Ready" },
  ];

  const explorerUrl = txHash 
    ? `https://explorer-studio.genlayer.com/tx/${txHash}` 
    : null;

  const cardContent = (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex justify-start mb-4"
    >
      <div className="max-w-[85%] sm:max-w-[70%] items-start flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-[0.2em] font-sans text-white/30 px-1">
          GenLayer Consensus
        </span>
        <div className="message-bot flex flex-col px-5 py-4 gap-3.5 min-w-[240px]">
          {steps.map((s, i) => {
            const isCompleted = step > s.num || (step === 4 && s.num === 4);
            const isActive = step === s.num;
            
            return (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15, duration: 0.3 }}
                className="flex items-center gap-3"
              >
                <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                  {isCompleted ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : isActive ? (
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  ) : (
                    <Circle className="w-3 h-3 text-white/20" strokeWidth={3} />
                  )}
                </div>
                <span
                  className={`text-[0.9rem] font-sans tracking-wide ${
                    isCompleted
                      ? "text-green-400"
                      : isActive
                      ? "text-white font-medium"
                      : "text-white/30"
                  }`}
                >
                  {s.label}
                </span>
              </motion.div>
            );
          })}
          
          {txHash && (
            <div style={{
              marginTop: '10px',
              paddingTop: '8px',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              textAlign: 'center',
              fontSize: '10px',
              color: 'rgba(255,255,255,0.4)',
              letterSpacing: '0.05em',
            }}>
              VIEW ON EXPLORER ↗
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  if (explorerUrl) {
    return (
      <a
        href={explorerUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{ 
          textDecoration: 'none',
          cursor: 'pointer',
          display: 'block',
        }}
        title="View transaction on GenLayer Explorer"
      >
        {cardContent}
      </a>
    );
  }

  return cardContent;
}
