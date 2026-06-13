import { useState, useCallback, useEffect } from 'react';
import { useAccount, useConfig, useSwitchChain } from 'wagmi';
import { getConnectorClient } from '@wagmi/core';
import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { TransactionStatus } from 'genlayer-js/types';

// ── Contract address from environment ──
const getContractAddress = (): `0x${string}` => {
  const envAddr = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  const fallback = '0x61b25b67bFD1A65962C4000733dc5311b242f010';
  
  if (!envAddr || envAddr === 'undefined' || !envAddr.startsWith('0x')) {
    return fallback as `0x${string}`;
  }
  return envAddr as `0x${string}`;
};

const CONTRACT_ADDRESS = getContractAddress();

const CONTRACT_VERSION = 'v16'; // Force cache clear for new contract address


export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: number;
}

const getStorageKey = (address: string) =>
  `josepha_chat_${address.toLowerCase()}`;

const saveMessages = (address: string, messages: ChatMessage[]) => {
  try {
    localStorage.setItem(
      getStorageKey(address),
      JSON.stringify(messages)
    );
  } catch (e) {
    console.warn('Could not save messages:', e);
  }
};

const loadMessages = (address: string): ChatMessage[] => {
  try {
    const stored = localStorage.getItem(getStorageKey(address));
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

const DEFAULT_TRAITS = "empathetic; precise; curious; professional";

const sanitizeMessage = (input: string): string => {
  let clean = input.replace(/\0/g, '');
  clean = clean.slice(0, 500);
  clean = clean.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  clean = clean.trim();
  return clean;
};

const USER_FRIENDLY_ERRORS: Record<string, string> = {
  'Cannot convert undefined to a BigInt': 'Transaction encoding failed. Please reconnect your wallet on GenLayer Studio (61999).',
  'ConnectorUnavailableReconnectingError': 'Wallet is reconnecting. Please wait a moment.',
  'User rejected the request': 'Transaction cancelled.',
  'rate limit exceeded': 'Network is busy. Please try again in a few seconds.',
  'contract not found': 'Contract not found. Please verify the network.',
  'Consensus main contract': 'Chain configuration error. Please refresh the page.',
};

export function useGenLayerChat() {
  useEffect(() => {
    const versionKey = 'josepha_contract_version';
    const storedVersion = localStorage.getItem(versionKey);

    if (storedVersion !== CONTRACT_VERSION) {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('josepha_chat_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      localStorage.setItem(versionKey, CONTRACT_VERSION);
      console.log(`[Josepha] Cache cleared — new contract ${CONTRACT_VERSION}`);
    }
  }, []);

  const { address, isConnected, connector, chainId: currentChainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const config = useConfig();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [txDetail, setTxDetail] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [txStep, setTxStep] = useState(0);
  const [currentTxHash, setCurrentTxHash] = useState<string>('');
  const [lastMessageTime, setLastMessageTime] = useState<number>(0);

  const mapError = (err: any): string => {
    const message = err.message || String(err);
    const found = Object.entries(USER_FRIENDLY_ERRORS).find(([key]) => message.includes(key));
    return found ? found[1] : 'Something went wrong. Please try again.';
  };

  // ── loadState: read-only, no account needed ──
  const loadState = useCallback(async () => {
    try {
      if (!CONTRACT_ADDRESS || !address) return;

      const readClient = createClient({ chain: studionet });

      const result = await readClient.readContract({
        address: CONTRACT_ADDRESS,
        functionName: 'get_full_state',
        args: [address],
      });

      const state = JSON.parse(result as string);

      // Remove chat history population from here
      setStats({
        mood: state.mood,
        reputation: state.reputation,
        interaction_count: state.interaction_count,
        user_level: state.user_level,
        name: state.name,
        expertise_score: state.expertise_score,
        insight_count: state.insight_count,
        frequent_topics: state.frequent_topics,
      });
      setError(null);
    } catch (err: any) {
      console.error('[GenLayer] loadState failed:', err);
    } finally {
      setIsFetching(false);
    }
  }, [address]);

  const waitForAccepted = async (hash: string): Promise<void> => {
    const maxAttempts = 150; // 5 minutes max (150 x 2 seconds)

    for (let i = 0; i < maxAttempts; i++) {
      try {
        const res = await fetch(
          `https://explorer-studio.genlayer.com/api/transactions/${hash}`
        );

        if (res.ok) {
          const data = await res.json();

          // Try multiple possible response structures
          const status =
            data?.status ||
            data?.data?.status ||
            data?.result?.status ||
            data?.transaction?.status ||
            '';

          const statusStr = String(status).toUpperCase();

          // Log for debugging
          console.log(`[Poll ${i}] hash: ${hash}, status: ${statusStr}, raw:`, data);

          if (statusStr === 'ACCEPTED' || statusStr === 'FINALIZED') {
            setTxStep(3);
            return; // success
          }

          if (statusStr === 'PENDING' || status === 2 || status === '2') {
            setTxStep(2);
            // continue polling
          }

          if (statusStr === 'ERROR' || statusStr === 'FAILED') {
            throw new Error('Transaction failed on-chain');
          }
        }
      } catch (err: any) {
        if (err?.message === 'Transaction failed on-chain') throw err;
        // Network error — continue polling silently
        console.warn(`[Poll ${i}] fetch error:`, err?.message);
      }

      await new Promise(r => setTimeout(r, 2000));
    }

    throw new Error('Transaction did not confirm after 5 minutes');
  };

  // ── sendMessage: write, account is MANDATORY ──
  const sendMessage = async (message: string) => {
    if (!address || !isConnected || !connector) {
      setError('Please connect your wallet first.');
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      setError('Invalid wallet address detected.');
      return;
    }

    const now = Date.now();
    if (isSending) {
      setError('Please wait for the current message to complete.');
      return;
    }
    if (now - lastMessageTime < 5000) {
      setError('Please wait a moment before sending another message.');
      return;
    }

    const sanitized = sanitizeMessage(message);
    if (!sanitized || sanitized.length < 1) {
      setError('Please enter a valid message.');
      return;
    }

    setIsSending(true);
    setLastMessageTime(now);
    setIsTyping(true);
    setTxStep(1);
    setError('');

    try {
      // Optimistic UI update
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: sanitized,
        timestamp: Date.now(),
      };
      setMessages(prev => {
        const updated = [...prev, userMsg];
        if (address) saveMessages(address, updated);
        return updated;
      });

      // Force correct network without adding delay if already on 61999
      if (currentChainId !== studionet.id) {
        setTxDetail('Switching to GenLayer Studio...');
        await switchChainAsync({ chainId: studionet.id });
      }

      const walletClient = await getConnectorClient(config, { connector });
      const walletProvider = walletClient.transport;

      const writeClient = createClient({
        chain: studionet,
        account: address,
        provider: walletProvider,
      });

      const readClient = createClient({ chain: studionet });

      setTxDetail('Sending to blockchain...');
      console.log('[GenLayer] Interacting with contract:', CONTRACT_ADDRESS);
      const hash = await writeClient.writeContract({
        address: CONTRACT_ADDRESS,
        functionName: 'talk',
        args: [sanitized],
        value: BigInt(0),
      });

      console.log('[GenLayer] Transaction submitted:', hash);
      setCurrentTxHash(hash);
      setTxStep(2);
      setTxDetail('Validators processing...');

      // Wait using our own polling — NO waitForTransactionReceipt
      await waitForAccepted(hash);

      setTxDetail('Loading reply...');

      const reply = await readClient.readContract({
        address: CONTRACT_ADDRESS,
        functionName: 'get_reply',
        args: [address],
      });

      setTxStep(4);
      await new Promise(r => setTimeout(r, 500));

      // Add reply to chat
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'bot',
        content: String(reply),
        timestamp: Date.now(),
      };
      setMessages(prev => {
        const updated = [...prev, botMsg];
        if (address) saveMessages(address, updated);
        return updated;
      });

      // Update state silently in background
      loadState();

    } catch (err: any) {
      console.error('[GenLayer] sendMessage error:', err);

      const msg =
        err?.message?.includes('5 minutes')
          ? 'Transaction is taking too long. Please check the explorer and try again.'
          : err?.message?.includes('rejected') || err?.message?.includes('denied')
            ? 'Transaction was cancelled.'
            : err?.message?.includes('failed on-chain') || err?.message?.includes('revert')
              ? 'The transaction reverted. This might be due to a contract error or insufficient gas.'
              : 'Something went wrong. Please try again.';

      setError(msg);
    } finally {
      setIsSending(false);
      setIsTyping(false);
      setTxStep(0);
      setTxDetail(null);
      setCurrentTxHash('');
    }
  };

  const clearMyChat = () => {
    if (!address) return;
    localStorage.removeItem(getStorageKey(address));
    setMessages([]);
  };

  // Watch for wallet change
  useEffect(() => {
    if (!address) {
      setMessages([]);
      setTxStep(0);
      setTxDetail('');
      setError('');
      setIsTyping(false);
      return;
    }

    const walletMessages = loadMessages(address);
    setMessages(walletMessages);
  }, [address]);

  useEffect(() => {
    if (!isConnected) {
      setMessages([]);
    }
  }, [isConnected]);

  // Debugging fetch removed to silence network
  useEffect(() => { }, []);

  useEffect(() => {
    if (!isConnected) return;
    const loadStateInit = async () => {
      try {
        await loadState();
      } catch (e) {
        console.warn('Could not load state on mount:', e);
      }
    };
    loadStateInit();
  }, [isConnected, loadState]);

  // Periodic refresh removed to silence network
  useEffect(() => { }, []);

  return {
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
    loadHistory: loadState,
  };
}
