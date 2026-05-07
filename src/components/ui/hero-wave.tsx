"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Send, ExternalLink, Sparkles, RefreshCw } from "lucide-react";
import { Navbar } from "@/components/ui/mini-navbar";
import { useGenLayerChat, ChatMessage } from "@/hooks/useGenLayerChat";
import { Galaxy } from "@/components/ui/galaxy";
import { TransactionTracker } from "@/components/ui/transaction-tracker";
import { JosephaBrain } from "@/components/ui/josepha-brain";

export type HeroWaveProps = {
  className?: string;
  style?: React.CSSProperties;
};

export function HeroWave({
  className,
  style,
}: HeroWaveProps) {
  const [prompt, setPrompt] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // GenLayer Chat Hook
  const {
    messages,
    isFetching,
    isSending,
    txDetail,
    stats,
    error,
    isTyping,
    txStep,
    currentTxHash,
    sendMessage,
    clearMyChat,
    loadHistory,
  } = useGenLayerChat();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, txDetail]);

  // Handle message submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isSending) return;

    const message = prompt.trim();
    setPrompt("");
    await sendMessage(message);
  };

  // Handle Enter key (Shift+Enter for newline)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    if (isSending) return;
    setPrompt(suggestion);
    textareaRef.current?.focus();
  };

  // ─── Animated placeholder ───
  const basePlaceholder = "Ask me about ";
  const suggestionsRef = useRef<string[]>([
    "Web3 development", "smart contract security", "DeFi protocols",
    "blockchain consensus", "token economics", "GenLayer architecture",
    "decentralized AI", "on-chain governance"
  ]);
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState<string>(basePlaceholder);
  const typingStateRef = useRef({ suggestionIndex: 0, charIndex: 0, deleting: false, running: true });
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    typingStateRef.current.running = true;
    const typeSpeed = 70; const deleteSpeed = 40; const pauseAtEnd = 1200; const pauseBetween = 500;
    function schedule(fn: () => void, delay: number) {
      const id = window.setTimeout(fn, delay);
      timersRef.current.push(id);
    }
    function step() {
      if (!typingStateRef.current.running) return;
      if (prompt !== "") { setAnimatedPlaceholder(basePlaceholder); schedule(step, 300); return; }
      const state = typingStateRef.current;
      const current = suggestionsRef.current[state.suggestionIndex % suggestionsRef.current.length] || "";
      if (!state.deleting) {
        const nextIndex = state.charIndex + 1;
        setAnimatedPlaceholder(basePlaceholder + current.slice(0, nextIndex));
        state.charIndex = nextIndex;
        if (nextIndex >= current.length) { schedule(() => { state.deleting = true; step(); }, pauseAtEnd); }
        else { schedule(step, typeSpeed); }
      } else {
        const nextIndex = Math.max(0, state.charIndex - 1);
        setAnimatedPlaceholder(basePlaceholder + current.slice(0, nextIndex));
        state.charIndex = nextIndex;
        if (nextIndex <= 0) {
          state.deleting = false; state.suggestionIndex++; schedule(step, pauseBetween);
        } else { schedule(step, deleteSpeed); }
      }
    }
    step();
    return () => { typingStateRef.current.running = false; timersRef.current.forEach(clearTimeout); };
  }, [prompt]);


  // ─── Render a single grouped message ───
  const renderMessage = (msg: ChatMessage, index: number) => {
    const isUser = msg.role === "user";

    return (
      <motion.div
        key={msg.id}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: index * 0.05 }}
        className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
      >
        <div className={`max-w-[85%] sm:max-w-[70%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-2`}>
          {/* Role label */}
          <span className={`text-[10px] uppercase tracking-[0.2em] font-sans ${isUser ? "text-white/40 text-right" : "text-white/30"} px-1`}>
            {isUser ? "You" : (stats?.name || "GenLayer AI")}
          </span>

          {/* Message bubble */}
          <div className={`${isUser ? "message-user" : "message-bot"} relative overflow-hidden`}>
            <p className={`px-4 py-3 text-[0.9rem] leading-relaxed ${isUser ? "text-white/90 font-sans" : "text-white/80 font-sans"} whitespace-pre-wrap relative z-10`}>
              {msg.content}
            </p>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <section ref={containerRef} className={className} style={{ position: "relative", width: "100%", height: "100vh", ...style }}>
      {/* Film grain CSS overlay */}
      <div className="grain-overlay" />

      {/* Navbar */}
      <Navbar
        onClearHistory={clearMyChat}
        onRefresh={loadHistory}
        isSending={isSending}
      />

      {/* ─── Main Chat Container ─── */}
      <div style={{ position: "absolute", inset: 0, zIndex: 3, display: "flex", flexDirection: "column", padding: "0" }}>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto pt-24 pb-4 px-4 sm:px-8">
          <div className="max-w-3xl mx-auto w-full">

            {/* Empty state */}
            {messages.length === 0 && !isFetching && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mt-[8vh]"
              >
                {/* Josepha Brain Visualizer */}
                <div className="flex justify-center mb-8">
                  <JosephaBrain 
                    size={240} 
                    isTyping={isSending} 
                    color="rgba(255, 255, 255, 0.8)"
                  />
                </div>

                <h1 className="font-serif text-[2.5rem] sm:text-[3.5rem] font-bold leading-[1.08] tracking-tight text-white">
                  {stats?.name || "Josepha AI"}
                </h1>
                <p className="text-white/40 mt-4 text-base sm:text-lg font-sans font-light max-w-lg mx-auto">
                  A decentralized intelligence that evolves with every interaction. Your choices shape its personality and reputation.
                </p>

                {/* Stats Display (Mood, Rep, Interactions, Level) */}
                {stats && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4 mt-12"
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-white/20 text-[10px] uppercase tracking-widest mb-1">Mood</span>
                      <span className="text-white/60 font-mono text-xl capitalize">{stats.mood || "Neutral"}</span>
                    </div>
                    <div className="w-[1px] h-8 bg-white/5 hidden sm:block" />
                    <div className="flex flex-col items-center">
                      <span className="text-white/20 text-[10px] uppercase tracking-widest mb-1">Emotion</span>
                      <span className="text-white/60 font-mono text-xl capitalize">{stats.emotion || "Neutral"}</span>
                    </div>
                    <div className="w-[1px] h-8 bg-white/5 hidden sm:block" />
                    <div className="flex flex-col items-center">
                      <span className="text-white/20 text-[10px] uppercase tracking-widest mb-1">Reputation</span>
                      <span className="text-white/60 font-mono text-xl">{stats.reputation}/100</span>
                    </div>
                    <div className="w-[1px] h-8 bg-white/5 hidden sm:block" />
                    <div className="flex flex-col items-center">
                      <span className="text-white/20 text-[10px] uppercase tracking-widest mb-1">Level</span>
                      <span className="text-white/60 font-mono text-xl capitalize">{stats.user_level || "Intermediate"}</span>
                    </div>
                    <div className="w-[1px] h-8 bg-white/5 hidden sm:block" />
                    <div className="flex flex-col items-center">
                      <span className="text-white/20 text-[10px] uppercase tracking-widest mb-1">Exchange</span>
                      <span className="text-white/60 font-mono text-xl">#{stats.interaction_count}</span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Loading history spinner */}
            {isFetching && messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center mt-[20vh]"
              >
                <Loader2 className="w-8 h-8 text-white/30 animate-spin mx-auto" />
                <p className="text-white/40 mt-4 font-sans text-sm">Synchronizing with persona memory...</p>
              </motion.div>
            )}

            {/* Messages list */}
            <AnimatePresence>
              {messages.map((msg, i) => renderMessage(msg, i))}
            </AnimatePresence>

            {/* Transaction progress tracker */}
            <TransactionTracker step={txStep} txHash={currentTxHash} />

            {/* Typing indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex justify-start mb-4"
              >
                <div className="max-w-[85%] sm:max-w-[70%] items-start flex flex-col gap-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-sans text-white/30 px-1">
                    {stats?.name || "GenLayer AI"}
                  </span>
                  <div className="message-bot flex flex-col">
                    <div className="px-4 py-3 flex items-center gap-1.5 h-[44px]">
                      <motion.div className="w-1.5 h-1.5 bg-white/60 rounded-full" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }} />
                      <motion.div className="w-1.5 h-1.5 bg-white/60 rounded-full" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut", delay: 0.2 }} />
                      <motion.div className="w-1.5 h-1.5 bg-white/60 rounded-full" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut", delay: 0.4 }} />
                    </div>
                  </div>
                  {txDetail && (
                    <div className="px-2 pb-1 text-[10px] uppercase tracking-wider text-white/40 font-sans">
                      {txDetail}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Error display */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center mb-4"
              >
                <div className="glass-panel px-4 py-2 text-sm text-red-400/80 font-sans border-red-500/20">
                  {error}
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* ─── Input Area (Glassmorphism Textarea) ─── */}
        <div className="shrink-0 px-4 sm:px-8 pb-6 pt-2">
          <div className="max-w-3xl mx-auto w-full">
            <form onSubmit={handleSubmit} className="relative">

              <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-white/10 via-white/5 to-transparent">
                <div className="glass-panel rounded-2xl overflow-hidden">
                  <textarea
                    ref={textareaRef}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={animatedPlaceholder}
                    rows={3}
                    disabled={isSending}
                    className="chat-textarea w-full resize-none bg-transparent text-white placeholder:text-white/35 outline-none px-5 py-4 pr-16 text-[0.95rem] font-sans leading-relaxed"
                  />

                  {/* Action buttons */}
                  <div className="absolute right-3 bottom-3 flex items-center gap-2">
                    {/* Send Button */}
                    <button
                      type="submit"
                      aria-label="Send message"
                      disabled={isSending || !prompt.trim()}
                      className="btn-send inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white text-black disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {isSending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom helper text */}
              <div className="mt-4 flex flex-col items-center gap-3">
                <p style={{ fontSize: '11px', opacity: 0.4, textAlign: 'center' }}>
                  Powered by GenLayer Consensus · Web-aware · Each interaction evolves the Persona
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Galaxy Background */}
      <div className="absolute inset-0 z-1 overflow-hidden">
        <Galaxy
          starSpeed={0}
          density={1.5}
          hueShift={125}
          speed={1}
          glowIntensity={0.15}
          saturation={0.25}
          mouseRepulsion
          repulsionStrength={4.5}
          twinkleIntensity={0}
          rotationSpeed={0.05}
          transparent
        />
      </div>
    </section>
  );
}
