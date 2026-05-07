"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { Trash2, RefreshCw, LogOut } from 'lucide-react';

interface NavbarProps {
  onClearHistory?: () => void;
  onRefresh?: () => void;
  isSending?: boolean;
}

const AnimatedNavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const isExternal = href.startsWith('http');
  return (
    <a href={href} target={isExternal ? "_blank" : undefined} rel={isExternal ? "noopener noreferrer" : undefined} className="group relative inline-block overflow-hidden h-5 flex items-center text-sm">
      <div className="flex flex-col transition-transform duration-400 ease-out transform group-hover:-translate-y-1/2">
        <span className="text-gray-300">{children}</span>
        <span className="text-white">{children}</span>
      </div>
    </a>
  );
};

export function Navbar({ onClearHistory, onRefresh, isSending }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [headerShapeClass, setHeaderShapeClass] = useState('rounded-full');
  const shapeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (shapeTimeoutRef.current) clearTimeout(shapeTimeoutRef.current);
    if (isOpen) {
      setHeaderShapeClass('rounded-xl');
    } else {
      shapeTimeoutRef.current = setTimeout(() => {
        setHeaderShapeClass('rounded-full');
      }, 300);
    }
    return () => {
      if (shapeTimeoutRef.current) clearTimeout(shapeTimeoutRef.current);
    };
  }, [isOpen]);

  const truncatedAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : '';

  const logoElement = (
    <div className="relative w-5 h-5 flex items-center justify-center">
      <span className="absolute w-1.5 h-1.5 rounded-full bg-gray-200 top-0 left-1/2 transform -translate-x-1/2 opacity-80" />
      <span className="absolute w-1.5 h-1.5 rounded-full bg-gray-200 left-0 top-1/2 transform -translate-y-1/2 opacity-80" />
      <span className="absolute w-1.5 h-1.5 rounded-full bg-gray-200 right-0 top-1/2 transform -translate-y-1/2 opacity-80" />
      <span className="absolute w-1.5 h-1.5 rounded-full bg-gray-200 bottom-0 left-1/2 transform -translate-x-1/2 opacity-80" />
    </div>
  );

  return (
    <header className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-20
                       flex flex-col items-center
                       pl-5 pr-5 py-2.5 backdrop-blur-md
                       ${headerShapeClass}
                       border border-white/10 bg-[#12121a]/70
                       w-[calc(100%-2rem)] sm:w-auto
                       transition-[border-radius] duration-0 ease-in-out`}>

      <div className="flex items-center justify-between w-full gap-x-4 sm:gap-x-6">
        {/* Logo */}
        <a href="/" style={{ textDecoration: 'none', color: 'inherit' }} className="flex items-center gap-3">
          {logoElement}
          <span className="text-white/60 text-xs font-sans tracking-widest uppercase hidden sm:inline">
            JOSEPHA
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center space-x-4 text-sm">
          <AnimatedNavLink href="/discover">Discover</AnimatedNavLink>
        </nav>

        {/* Connected wallet actions */}
        {mounted && isConnected && (
          <div className="hidden sm:flex items-center gap-2">
            {/* Wallet address button with copy logic */}
            <button
              onClick={copyToClipboard}
              className="group relative flex items-center justify-center text-[11px] text-white/40 font-mono bg-white/5 border border-white/10 rounded-full px-3 py-1 hover:bg-white/10 hover:text-white/60 transition-all active:scale-95 overflow-hidden"
              title="Copy Address"
            >
              <span className={`transition-all duration-300 ${copied ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
                {truncatedAddress}
              </span>
              <span className={`absolute inset-0 flex items-center justify-center text-white/80 transition-all duration-300 ${copied ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
                Copied!
              </span>
            </button>

            {/* Action buttons */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isSending}
                className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 transition-all disabled:opacity-30"
                title="Rafraîchir l'historique"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
            {onClearHistory && (
              <button
                onClick={onClearHistory}
                disabled={isSending}
                className="p-1.5 rounded-lg text-white/30 hover:text-red-400/70 hover:bg-red-500/5 transition-all disabled:opacity-30"
                title="Effacer l'historique"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => disconnect()}
              className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 transition-all"
              title="Déconnecter"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Mobile menu toggle */}
        <button className="sm:hidden flex items-center justify-center w-8 h-8 text-gray-300 focus:outline-none" onClick={toggleMenu} aria-label={isOpen ? 'Close Menu' : 'Open Menu'}>
          {isOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      <div className={`sm:hidden flex flex-col items-center w-full transition-all ease-in-out duration-300 overflow-hidden
                       ${isOpen ? 'max-h-[1000px] opacity-100 pt-4' : 'max-h-0 opacity-0 pt-0 pointer-events-none'}`}>
        <nav className="flex flex-col items-center space-y-4 text-base w-full">
          <a href="/discover" className="text-gray-300 hover:text-white transition-colors w-full text-center">Discover</a>
          
          {mounted && isConnected && (
            <>
              <div className="w-full h-[1px] bg-white/10" />
              <button
                onClick={copyToClipboard}
                className="relative flex items-center justify-center text-[11px] text-white/40 font-mono bg-white/5 border border-white/10 rounded-full px-3 py-1 active:scale-95 overflow-hidden"
              >
                <span className={`transition-all duration-300 ${copied ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
                  {truncatedAddress}
                </span>
                <span className={`absolute inset-0 flex items-center justify-center text-white/80 transition-all duration-300 ${copied ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
                  Copied!
                </span>
              </button>
              <div className="flex items-center gap-4">
                {onRefresh && (
                  <button onClick={onRefresh} disabled={isSending} className="text-white/40 hover:text-white/70 transition-colors disabled:opacity-30">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                )}
                {onClearHistory && (
                  <button onClick={onClearHistory} disabled={isSending} className="text-white/40 hover:text-red-400/70 transition-colors disabled:opacity-30">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => disconnect()} className="text-white/40 hover:text-white/70 transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
