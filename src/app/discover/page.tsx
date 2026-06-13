"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronDown, 
  ExternalLink, 
  Cpu, 
  Globe, 
  ShieldCheck, 
  Zap,
  ArrowRight
} from "lucide-react";
import { Navbar } from "@/components/ui/mini-navbar";
import { Galaxy } from "@/components/ui/galaxy";
import { SpecialText } from "@/components/ui/special-text";

// --- Components ---

const StatCard = ({ title, description }: { title: string; description: string }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="glass-panel p-6 flex flex-col items-center text-center group hover:border-white/20 transition-all duration-300"
  >
    <div className="text-white font-mono text-xl mb-2">{title}</div>
    <div className="text-white/40 text-sm font-sans leading-relaxed">{description}</div>
  </motion.div>
);

const DeploymentStep = ({ number, title, description }: { number: number; title: string; description: string }) => (
  <div className="flex gap-6 items-start">
    <div className="flex-shrink-0 w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/20 font-serif text-2xl bg-white/[0.02]">
      {number}
    </div>
    <div className="flex-col">
      <h3 className="text-white font-sans font-semibold text-lg mb-2">{title}</h3>
      <p className="text-white/50 text-sm leading-relaxed">{description}</p>
    </div>
  </div>
);

const FAQItem = ({ question, answer, isOpen, onClick }: { question: string; answer: string; isOpen: boolean; onClick: () => void }) => (
  <div className={`border-b border-white/5 last:border-0 transition-colors duration-300 ${isOpen ? 'bg-white/[0.01]' : ''}`}>
    <button 
      onClick={onClick}
      className="w-full py-6 px-4 flex items-center justify-between text-left group"
    >
      <span className={`text-lg font-sans transition-colors duration-300 ${isOpen ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>
        {question}
      </span>
      <ChevronDown className={`w-5 h-5 text-white/20 transition-transform duration-300 ${isOpen ? 'rotate-180 text-white' : ''}`} />
    </button>
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <div className="pb-6 px-4 text-white/50 font-sans leading-relaxed text-[15px]">
            {answer}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const FeatureCard = ({ title, description, icon: Icon }: { title: string; description: string; icon: any }) => (
  <div className="glass-panel p-8 flex flex-col h-full hover:bg-white/[0.02] transition-colors duration-300 group">
    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
      <Icon className="w-6 h-6 text-white/60" />
    </div>
    <h3 className="text-white font-sans font-semibold text-xl mb-4">{title}</h3>
    <p className="text-white/40 text-sm leading-relaxed flex-grow">{description}</p>
  </div>
);

// --- Main Page ---

export default function DiscoverPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "What is Josepha?",
      a: "She's a decentralized AI persona. Unlike ChatGPT, Josepha lives as an Intelligent Contract on GenLayer. No central servers, no corporate masters. Just 5 independent validators reaching consensus on every word she says."
    },
    {
      q: "How is Josepha different from ChatGPT or Claude?",
      a: "Control. Big tech owns ChatGPT. The GenLayer blockchain owns Josepha. Her code is public, her responses are verified, and no one can modify her behavior after deployment. She is truly censorship-resistant."
    },
    {
      q: "What is GenLayer?",
      a: "The trust layer for AI. It's an Ethereum L2 built specifically for AI-native applications. It allows smart contracts to call LLMs and browse the web while maintaining trust through Optimistic Democracy."
    },
    {
      q: "What is the Equivalence Principle?",
      a: "Decentralized AI consensus made possible. LLMs don't produce identical text twice. This mechanism requires validators to produce equivalent meaning, not identical characters. It's how we bring AI on-chain safely."
    },
    {
      q: "What does Josepha remember?",
      a: "Everything that matters. She tracks short-term history, long-term summaries, and a growing knowledge base. All of it is stored on-chain and evolves with every question you ask."
    },
    {
      q: "What is Josepha's reputation system?",
      a: "A public record of quality. Her reputation score (0-100) is stored on-chain. Positive interactions boost it, while poor responses drop it. It's an immutable reflection of her performance over time."
    },
    {
      q: "Do I need a wallet to talk to Josepha?",
      a: "Yes. Every message is a blockchain transaction. You'll need MetaMask to sign them. It's the price of true decentralization and a permanent, authenticated conversation history."
    },
    {
      q: "Is my conversation private?",
      a: "No. GenLayer is a public blockchain. Anyone can see the transaction data on the explorer. Don't share sensitive personal info; treat these conversations as public records."
    },
    {
      q: "What is the contract address?",
      a: "You can find her at 0xD1D1BF95515D3A9362f50F9Be4256bF3FbCAB619. You can verify the code and every single transaction on the Genlayer Studio Network (Chain ID: 61999)."
    },
    {
      q: "Can Josepha access real-time data?",
      a: "Directly. When you ask about prices or market research, she fetches live data from sources like CoinMarketCap or DeFiLlama. Validators verify this data independently before she responds."
    },
    {
      q: "What languages does Josepha speak?",
      a: "Whatever you speak. She detects your language and responds in kind. While her internal knowledge base uses English, she's perfectly comfortable in French, Arabic, Spanish, or Italian."
    },
    {
      q: "How can I verify Josepha's responses?",
      a: "Check the explorer. Go to explorer-studio.genlayer.com. You can see the exact input, what each validator produced, and the final consensus result for every transaction."
    }
  ];

  return (
    <main className="min-h-screen bg-black text-white selection:bg-white/20">
      <div className="grain-overlay" />
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-48 pb-32 px-6 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="font-serif text-5xl sm:text-8xl font-bold mb-8 tracking-tight"
          >
            <SpecialText inView once speed={40}>Who is Josepha?</SpecialText>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-white/60 text-lg sm:text-xl font-sans font-light leading-relaxed max-w-2xl mx-auto mb-20"
          >
            She isn't just another chatbot. Josepha is the first AI persona that truly belongs to no one. 
            No central server, no corporate control. She lives entirely on the GenLayer blockchain, 
            where every response is verified by 5 independent validator nodes.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            <StatCard title="5 Validators" description="Consensus is the only law" />
            <StatCard title="100% On-Chain" description="Memory, traits, and reputation. All on-chain." />
            <StatCard title="Self-Learning" description="She evolves with you, one block at a time." />
          </motion.div>
        </div>
      </section>

      {/* --- SMART CONTRACT SECTION --- */}
      <section className="relative py-32 px-6 bg-white/[0.01]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="font-serif text-4xl sm:text-6xl font-bold mb-6">Look under the hood</h2>
            <p className="text-white/50 text-lg font-sans font-light max-w-xl mx-auto">
              Josepha isn't magic, she's code. An Intelligent Contract running on GenLayer, specifically. 
              Here is the technical foundation of her autonomy.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
            {/* Contract Info Card */}
            <div className="glass-panel p-8 sm:p-10 space-y-8 sticky top-32">
              <div className="space-y-3">
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-sans">Contract Address</span>
                <a 
                  href="https://explorer-studio.genlayer.com/address/0xD1D1BF95515D3A9362f50F9Be4256bF3FbCAB619" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-white/80 hover:text-white transition-colors group"
                >
                  <code className="font-mono text-sm block sm:hidden">
                    0x6D867b5a...8249
                  </code>
                  <code className="font-mono text-sm hidden sm:block">
                    0xD1D1BF95515D3A9362f50F9Be4256bF3FbCAB619
                  </code>
                  <ExternalLink className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                </a>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-sans">Network</span>
                  <div className="text-sm font-sans text-white/80">Genlayer Studio Network</div>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-sans">Chain ID</span>
                  <div className="text-sm font-sans text-white/80">61999</div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-sans">RPC Endpoint</span>
                <div className="text-sm font-mono text-white/80 bg-white/5 p-3 rounded-lg border border-white/5">
                  https://studio.genlayer.com/api
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-sans">Runner Image</span>
                <div className="text-[11px] font-mono text-white/60 break-all bg-white/5 p-3 rounded-lg border border-white/5">
                  py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6
                </div>
              </div>
            </div>

            {/* Deployment Steps */}
            <div className="space-y-12">
              <h3 className="font-serif text-3xl font-semibold mb-10">From code to persona</h3>
              <div className="space-y-12 relative">
                <div className="absolute left-6 top-6 bottom-6 w-[1px] bg-white/5" />
                
                <DeploymentStep 
                  number={1} 
                  title="Code the persona" 
                  description="Written in Python with the GenLayer SDK. The contract defines her personality, her memory system, and her ability to fetch real-time data." 
                />
                <DeploymentStep 
                  number={2} 
                  title="Plug into the Studio" 
                  description="The contract is uploaded to GenLayer's dev environment. This is where we test and monitor her behavior in real time before deployment." 
                />
                <DeploymentStep 
                  number={3} 
                  title="Go live on Bradbury" 
                  description="One click sends the contract to the testnet. GenLayer generates a unique, immutable address that stays permanent on the blockchain." 
                />
                <DeploymentStep 
                  number={4} 
                  title="Consensus in action" 
                  description="Every time you speak, 5 validator nodes execute the code. They independently call the LLM and vote on the response using the Equivalence Principle." 
                />
                <DeploymentStep 
                  number={5} 
                  title="The block is sealed" 
                  description="When validators agree, the transaction is marked accepted. Her reply, updated mood, and new memory are written permanently on-chain." 
                />
                <DeploymentStep 
                  number={6} 
                  title="Knowledge evolves" 
                  description="Each interaction refines her expertise score. After hundreds of talks, she becomes measurably more precise and contextually aware." 
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section className="relative py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-serif text-4xl sm:text-6xl font-bold mb-6">Frequently Asked Questions</h2>
          </div>

          <div className="glass-panel overflow-hidden">
            {faqs.map((faq, index) => (
              <FAQItem 
                key={index}
                question={faq.q}
                answer={faq.a}
                isOpen={openFaqIndex === index}
                onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* --- GENLAYER SECTION --- */}
      <section className="relative py-32 px-6 pb-56 overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <h2 className="font-serif text-4xl sm:text-6xl font-bold mb-8">Built on GenLayer</h2>
          <p className="text-white/50 text-lg font-sans font-light max-w-3xl mx-auto mb-20 leading-relaxed">
            GenLayer is the trust protocol for the AI age. Bitcoin decentralized money. 
            Ethereum decentralized computation. GenLayer decentralizes decision-making.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24 text-left">
            <FeatureCard 
              icon={ShieldCheck}
              title="Optimistic Democracy"
              description="The more validators agree, the more you can trust the result. A consensus model built specifically for the non-deterministic nature of AI."
            />
            <FeatureCard 
              icon={Globe}
              title="Real-world data"
              description="No oracles needed. Smart contracts can browse the web directly. Josepha fetches live market data inside her own execution environment."
            />
            <FeatureCard 
              icon={Cpu}
              title="Native AI"
              description="Validators run diverse AI models. Consensus is reached on equivalent outputs, making every AI response verifiable on the blockchain."
            />
          </div>

          <motion.a 
            href="https://genlayer.com"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-6 px-12 py-5 bg-white text-black rounded-full font-serif italic uppercase tracking-[0.2em] text-sm font-bold transition-all hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] group"
          >
            <div className="grid grid-cols-2 gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
              <div className="w-1 h-1 bg-black rounded-full" />
              <div className="w-1 h-1 bg-black rounded-full" />
              <div className="w-1 h-1 bg-black rounded-full" />
              <div className="w-1 h-1 bg-black rounded-full" />
            </div>
            <span>Explore GenLayer</span>
          </motion.a>
        </div>
      </section>

      {/* --- BACKGROUND --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <Galaxy
          starSpeed={0}
          density={1.5}
          hueShift={125}
          speed={0.3}
          glowIntensity={0.15}
          saturation={0.25}
          twinkleIntensity={0.05}
          rotationSpeed={0.01}
          transparent
        />
      </div>
    </main>
  );
}
