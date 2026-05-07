"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { CanvasRevealEffect } from "@/components/ui/canvas-reveal-effect";
import { Navbar } from "@/components/ui/mini-navbar";
import { SpecialText } from "@/components/ui/special-text";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect } from "wagmi";

interface WalletConnectPageProps {
  className?: string;
  onConnect: () => void;
}

export const WalletConnectPage = ({ className, onConnect }: WalletConnectPageProps) => {
  const [step, setStep] = useState<"idle" | "connecting" | "success">("idle");
  const [mounted, setMounted] = useState(false);
  const { address, isConnected, isConnecting } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Synchronize the visual UI state with Wagmi's real-time connection status
  useEffect(() => {
    if (!mounted) return;

    if (isConnected && step !== "success") {
      setStep("success");
      const timer = setTimeout(() => {
        onConnect();
      }, 1500);
      return () => clearTimeout(timer);
    } else if (isConnecting) {
      setStep("connecting");
    } else if (!isConnected && !isConnecting && step === "connecting") {
      setStep("idle");
    }
  }, [isConnected, isConnecting, onConnect, step, mounted]);

  const handleConnect = () => {
    if (openConnectModal) {
      openConnectModal();
    } else {
      alert("Connection modal is not available. Please check your configuration.");
    }
  };

  if (!mounted) return <div className="min-h-screen bg-black" />;

  return (
    <div className={cn("flex w-[100%] flex-col min-h-screen bg-black relative", className)}>
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0">
          <CanvasRevealEffect
            animationSpeed={3}
            containerClassName="bg-black"
            colors={[[255, 255, 255]]}
            dotSize={6}
          />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,0,0,1)_0%,_transparent_100%)]" />
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-black to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        <Navbar />

        <div className="flex flex-1 flex-col lg:flex-row ">
          <div className="flex-1 flex flex-col justify-center items-center">
            <div className="w-full mt-[120px] max-w-md px-4">
              <AnimatePresence mode="wait">

                {step === "idle" && (
                  <motion.div
                    key="idle-step"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="flex flex-col items-center space-y-12 text-center"
                  >
                    <div className="space-y-6">
                      <h1 className="font-serif text-[2.8rem] sm:text-[3.8rem] font-bold leading-[1.05] tracking-tight text-white flex flex-col items-center">
                        <SpecialText speed={12}>GenLayer AI.</SpecialText>
                      </h1>
                      <p className="text-[1.1rem] sm:text-[1.3rem] text-white/40 font-light font-sans max-w-lg mx-auto leading-relaxed">
                        The world&apos;s first decentralized intelligence.
                        Engage with on-chain consensus-driven AI.
                      </p>
                    </div>

                    <div className="relative group">
                      {/* Pulse Glow Effect (Old Version) */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-white/20 to-white/5 rounded-2xl blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 animate-pulse"></div>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleConnect}
                        className="relative flex items-center justify-center gap-6 h-16 sm:h-20 px-10 sm:px-14 bg-black/80 border border-white/10 rounded-full overflow-hidden transition-all duration-300 ease-out hover:border-white/30 hover:shadow-[0_0_50px_rgba(255,255,255,0.1)]"
                      >
                        {/* Original Scanning Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer-slide" />

                        {/* Spinning Conic Gradient (The one that rotates) */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[conic-gradient(from_0deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] animate-spin-slow" />

                        {/* Mesh highlight */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-50"></div>

                        <div className="relative flex items-center gap-6">
                          {/* 4-Dot Grid Icon (White) */}
                          <div className="grid grid-cols-2 gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                            <div className="w-1 h-1 bg-white rounded-full" />
                            <div className="w-1 h-1 bg-white rounded-full" />
                            <div className="w-1 h-1 bg-white rounded-full" />
                            <div className="w-1 h-1 bg-white rounded-full" />
                          </div>

                          <span className="text-lg sm:text-2xl font-serif font-bold italic tracking-[0.1em] text-white uppercase transition-all duration-300">
                            Start Chatting On-Chain
                          </span>
                        </div>
                      </motion.button>
                    </div>

                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-sans">
                      Secure · Decentralized · Autonomous
                    </p>
                  </motion.div>
                )}

                {step === "connecting" && (
                  <motion.div
                    key="connecting-step"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6 text-center mt-10"
                  >
                    <div className="w-16 h-16 border-2 border-white/10 border-t-white rounded-full animate-spin mx-auto mb-8 shadow-[0_0_30px_rgba(255,255,255,0.1)]"></div>
                    <h2 className="font-serif text-2xl font-bold text-white tracking-wide">INITIALIZING DECENTRALIZED PROTOCOL...</h2>
                    <p className="text-white/50 font-sans">Awaiting signature from MetaMask.</p>
                  </motion.div>
                )}

                {step === "success" && (
                  <motion.div
                    key="success-step"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="space-y-6 text-center mt-10"
                  >
                    <div className="mx-auto w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h1 className="font-serif text-3xl font-bold text-white">Identity Verified.</h1>
                    <div className="space-y-1">
                      <p className="text-white/40 font-sans text-xs uppercase tracking-widest">Authenticated as</p>
                      <p className="text-white/70 font-mono text-sm">
                        {address?.slice(0, 6)}...{address?.slice(-4)}
                      </p>
                    </div>
                    <p className="text-white/50 font-sans pt-4">Connecting to GenLayer AI Engine...</p>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
