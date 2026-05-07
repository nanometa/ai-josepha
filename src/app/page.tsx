"use client";
import React, { useState, useEffect } from "react";
import { WalletConnectPage } from "@/components/ui/wallet-connect-page";
import { HeroWave } from "@/components/ui/hero-wave";
import { useAccount } from "wagmi";

export default function AppMockup() {
  const { isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [showHero, setShowHero] = useState(false);

  // Hydration fix: ensures client-side logic only runs after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Orchestrate the transition between connection gate and the main platform
  useEffect(() => {
    if (!mounted) return;

    if (isConnected && !showHero) {
      // Small delay to allow the "Identity Verified" animation to finish on the Connect Page
      const timer = setTimeout(() => {
        setShowHero(true);
      }, 1500);
      return () => clearTimeout(timer);
    } else if (!isConnected && showHero) {
      setShowHero(false);
    }
  }, [isConnected, showHero, mounted]);

  // Prevent hydration mismatch by returning a clean background while mounting
  if (!mounted) {
    return <main className="min-h-screen bg-black" />;
  }

  return (
    <main className="min-h-screen bg-black">
      {showHero ? (
        <HeroWave />
      ) : (
        <WalletConnectPage onConnect={() => setShowHero(true)} />
      )}
    </main>
  );
}
