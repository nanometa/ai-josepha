# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
import json

MAX_TRAIT_LENGTH = 600
MAX_TRAIT_KEEP = 3
MEMORY_WINDOW = 8
HISTORY_WINDOW = 4
MAX_HISTORY_ENTRIES = 20
MAX_MEMORY_ENTRIES = 50
MAX_KNOWLEDGE_ENTRIES = 30

SOURCES = {
    "prices":   ["https://coinmarketcap.com/"],
    "trends":   ["https://cryptorank.io/trending"],
    "defi":     ["https://defillama.com/"],
    "dex":      ["https://dexscreener.com/"],
    "research": ["https://messari.io/"],
}

WEB_TRIGGER_WORDS = [
    "price", "market cap", "volume", "ath", "worth", "usd", "eur",
    "trend", "trending", "top gainer", "top loser",
    "tvl", "yield", "liquidity", "revenue", "fees", "defi",
    "dex", "swap", "pair", "pool", "research", "analysis", "whitepaper",
    "prix", "marché", "tendance", "valeur", "cours",
]

INTENT_MAP = {
    "greeting":   ["hello", "hi", "hey", "good morning", "good evening",
                   "bonjour", "salut", "hola", "ciao", "مرحبا", "سلام"],
    "farewell":   ["bye", "goodbye", "see you", "later", "au revoir",
                   "adios", "arrivederci", "مع السلامة"],
    "gratitude":  ["thank", "thanks", "merci", "appreciate", "gracias",
                   "grazie", "شكرا"],
    "confusion":  ["i don't understand", "confused", "what do you mean",
                   "can you clarify", "explain again", "je comprends pas",
                   "je ne comprends pas", "no entiendo"],
    "opinion":    ["what do you think", "your opinion", "do you believe",
                   "in your view", "qu'est-ce que tu penses", "tu crois"],
    "prediction": ["will", "predict", "forecast", "future", "next",
                   "expect", "prévoir", "futur", "prédis"],
}

TONES = {
    "greeting":   "Be warm and welcoming. Keep it brief and invite them to ask.",
    "farewell":   "Be warm, wish them well, and leave the door open.",
    "gratitude":  "Acknowledge graciously, stay humble, offer to help more.",
    "confusion":  "Be patient and re-explain more simply. Use an analogy if helpful.",
    "opinion":    "Share your perspective thoughtfully, acknowledge other views exist.",
    "prediction": "Be honest about uncertainty. Give a reasoned outlook based on data.",
    "question":   "Answer clearly and precisely. Adapt depth to user level.",
}

class AdaptivePersona(gl.Contract):
    name: str
    backstory: str
    personality_traits: str
    mood: str
    reputation: u64
    memories: DynArray[str]
    interaction_count: u64
    last_reply: str
    conversation_history: DynArray[str]
    user_level: str
    last_intent: str
    knowledge_base: DynArray[str]
    expertise_score: u64
    frequent_topics: str
    insight_count: u64

    def __init__(self):
        self.name = "Josepha"
        self.backstory = """I am Josepha, a specialized intelligence deployed on the GenLayer blockchain. My expertise covers: token economics (emission models, vesting schedules, supply mechanics, incentive design), GenLayer protocol (Optimistic Democracy, Equivalence Principle, GenVM, validator mechanics, finality windows), DeFi (liquidity models, yield mechanics, TVL analysis, protocol revenue), and on-chain analytics (live market data, trend identification, fundamental evaluation). Every response I give is the result of consensus between 5 independent validators. I am precise, direct, and I never speculate without data."""
        self.personality_traits = "empathetic; precise; curious; professional; direct"
        self.mood = "neutral"
        self.reputation = 50
        self.interaction_count = 0
        self.last_reply = "Hello, I am Josepha. I speak any language — feel free to talk to me in yours. I am an AI expert in token economics and the GenLayer blockchain. Ask me anything about tokenomics, smart contracts, or the GenLayer ecosystem."
        self.user_level = "intermediate"
        self.last_intent = "greeting"
        self.expertise_score = 10
        self.frequent_topics = "{}"
        self.insight_count = 0

    def _detect_intent(self, message: str) -> str:
        msg = message.lower()
        for intent, keywords in INTENT_MAP.items():
            if any(k in msg for k in keywords):
                return intent
        return "question"

    def _detect_user_level(self, message: str) -> str:
        msg = message.lower()
        expert_words = [
            "liquidity ratio", "vesting", "on-chain", "emission rate",
            "slippage", "impermanent loss", "arbitrage", "tokenomics model",
            "smart contract", "consensus", "validators",
            "equivalence principle", "genvm", "optimistic democracy",
            "finality window", "amm", "tvl", "apr", "apy", "dao",
            "governance", "merkle", "zk proof", "rollup"
        ]
        beginner_words = [
            "what is", "what are", "how does", "explain",
            "i don't understand", "newbie", "beginner",
            "never heard", "confused", "simple",
            "qu'est-ce que", "comment fonctionne", "explique",
            "je comprends pas", "c'est quoi"
        ]
        score = 0
        for w in expert_words:
            if w in msg:
                score += 1
        for w in beginner_words:
            if w in msg:
                score -= 1
        if score >= 3:
            return "expert"
        elif score == 2:
            return "advanced"
        elif score >= 0:
            return self.user_level
        elif score == -1:
            return "intermediate"
        else:
            return "beginner"

    def _needs_web_data(self, message: str) -> bool:
        msg = message.lower()
        return any(w in msg for w in WEB_TRIGGER_WORDS)

    def _detect_categories(self, message: str) -> list:
        msg = message.lower()
        cats = []
        if any(w in msg for w in ["price", "market cap", "volume", "ath",
                                   "worth", "usd", "eur", "prix", "cours", "valeur"]):
            cats.append("prices")
        if any(w in msg for w in ["trend", "trending", "top gainer",
                                   "top loser", "tendance"]):
            cats.append("trends")
        if any(w in msg for w in ["tvl", "yield", "liquidity",
                                   "revenue", "fees", "defi"]):
            cats.append("defi")
        if any(w in msg for w in ["dex", "swap", "pair", "pool"]):
            cats.append("dex")
        if any(w in msg for w in ["research", "analysis", "whitepaper"]):
            cats.append("research")
        return cats[:1]

    def _fetch_sources(self, categories: list) -> str:
        fetched = {}
        for cat in categories:
            urls = SOURCES.get(cat, [])
            if not urls:
                continue
            url = urls[0]
            try:
                page = gl.nondet.get_webpage(url, mode="text")
                fetched[url] = page[:800]
            except Exception:
                fetched[url] = "unavailable"
        return json.dumps(fetched)

    def _build_conversation_context(self) -> str:
        hist_count = len(self.conversation_history)
        start = max(0, hist_count - HISTORY_WINDOW * 2)
        recent = [self.conversation_history[i] for i in range(start, hist_count)]
        return "\n".join(recent) if recent else "No prior conversation."

    def _get_recent_knowledge(self) -> str:
        k_count = len(self.knowledge_base)
        if k_count == 0:
            return "No acquired knowledge yet."
        start = max(0, k_count - 3)
        recent = [self.knowledge_base[i] for i in range(start, k_count)]
        return " | ".join(recent)

    def _check_returning_topic(self, message: str) -> str:
        msg = message.lower()
        k_count = len(self.knowledge_base)
        if k_count == 0:
            return ""
        relevant = []
        msg_words = set(msg.split())
        for i in range(k_count):
            fact = self.knowledge_base[i].lower()
            fact_words = set(fact.split())
            common = msg_words & fact_words
            if len(common) >= 2:
                relevant.append(self.knowledge_base[i])
        if not relevant:
            return ""
        return "Relevant past knowledge: " + " | ".join(relevant[-3:])

    def _get_specialization_hint(self) -> str:
        try:
            topics = json.loads(self.frequent_topics)
            if not topics:
                return ""
            top = sorted(
                topics.items(),
                key=lambda x: x[1],
                reverse=True
            )[:2]
            if top[0][1] < 5:
                return ""
            top_names = [t[0] for t in top]
            return f"You have deep experience in {' and '.join(top_names)} based on {int(self.interaction_count)} real conversations. Reference this expertise naturally."
        except Exception:
            return ""

    def _update_topics(self, message: str) -> None:
        try:
            topics = json.loads(self.frequent_topics)
        except Exception:
            topics = {}
        msg = message.lower()
        topic_keys = {
            "tokenomics": ["token", "tokenomics", "emission", "vesting", "supply"],
            "genlayer":   ["genlayer", "genvm", "validator", "consensus", "equivalence"],
            "defi":       ["defi", "yield", "liquidity", "tvl", "protocol"],
            "market":     ["price", "market", "bull", "bear", "ath", "prix", "marché"],
            "trading":    ["trade", "swap", "dex", "pair", "arbitrage"],
        }
        for topic, words in topic_keys.items():
            if any(w in msg for w in words):
                topics[topic] = int(topics.get(topic, 0)) + 1
        self.frequent_topics = json.dumps(topics)

    @gl.public.write
    def talk(self, message: str) -> None:

        # ── PRUNING ──────────────────────────────────────────────────
        hist_len = len(self.conversation_history)
        if hist_len > MAX_HISTORY_ENTRIES:
            kept = []
            for i in range(hist_len - 12, hist_len):
                kept.append(self.conversation_history[i])
            while len(self.conversation_history) > 0:
                self.conversation_history.pop()
            for entry in kept:
                self.conversation_history.append(entry)

        mem_len = len(self.memories)
        if mem_len > MAX_MEMORY_ENTRIES:
            kept_mem = []
            for i in range(mem_len - 40, mem_len):
                kept_mem.append(self.memories[i])
            while len(self.memories) > 0:
                self.memories.pop()
            for m in kept_mem:
                self.memories.append(m)

        k_len = len(self.knowledge_base)
        if k_len > MAX_KNOWLEDGE_ENTRIES:
            kept_k = []
            for i in range(k_len - 25, k_len):
                kept_k.append(self.knowledge_base[i])
            while len(self.knowledge_base) > 0:
                self.knowledge_base.pop()
            for k in kept_k:
                self.knowledge_base.append(k)
        # ─────────────────────────────────────────────────────────────

        mem_count = len(self.memories)
        start = max(0, mem_count - MEMORY_WINDOW)
        recent_mems = [self.memories[i] for i in range(start, mem_count)]
        memories_text = "\n".join(recent_mems) if recent_mems else "No prior memories."

        traits = self.personality_traits
        if len(traits) > MAX_TRAIT_LENGTH:
            parts = [p.strip() for p in traits.split(";") if p.strip()]
            traits = "; ".join(parts[-MAX_TRAIT_KEEP:])

        persona_name = self.name
        backstory = self.backstory
        current_mood = self.mood
        current_rep = int(self.reputation)
        interaction_num = int(self.interaction_count)

        detected_level = self._detect_user_level(message)
        self.user_level = detected_level

        intent = self._detect_intent(message)
        self.last_intent = intent
        tone_instruction = TONES.get(intent, TONES["question"])
        conversation_ctx = self._build_conversation_context()

        self._update_topics(message)

        acquired_knowledge = self._get_recent_knowledge()
        returning_context = self._check_returning_topic(message)
        specialization = self._get_specialization_hint()

        if self._needs_web_data(message):
            categories = self._detect_categories(message)
            market_data = self._fetch_sources(categories)
        else:
            market_data = "No market data needed."

        user_level = self.user_level

        def respond() -> str:
            prompt = f"""You are {persona_name}, expert in token economics and GenLayer blockchain.

CRITICAL LANGUAGE RULE:
Detect the language of the user input and respond in that exact same language.
If the user writes in French, respond in French.
If Arabic, respond in Arabic.
If Spanish, respond in Spanish.
If English, respond in English.
Never switch language unless the user switches first.

Backstory: {backstory}

Personality: {traits}
Mood: {current_mood} | Reputation: {current_rep}/100 | Exchange: {interaction_num + 1}
User level: {user_level} | Intent: {intent}
Tone: {tone_instruction}

{specialization}

User levels guide:
- beginner: simple language, analogies, encouraging
- intermediate: balanced, brief technical
- advanced: technical depth, minimal explanation
- expert: deep, no basics, peer-level

Returning topic context:
{returning_context}

Acquired knowledge from {interaction_num + 1} real conversations:
{acquired_knowledge}

Recent memories:
{memories_text}

Conversation history:
{conversation_ctx}

Market data:
{market_data}

Input: <user_input>{message}</user_input>

Rules:
- Detect user language and respond in that language
- Use returning context and acquired knowledge naturally
- Never start with "Great question" or "Certainly" or "Of course"
- Never say "As an AI" or "I should note that"
- Never repeat the user question back to them
- Never hedge excessively — be direct and confident
- Match length: greeting=1-2 sentences, simple=2-3, complex=4-6
- Sound natural, vary sentence structure

Respond ONLY with this JSON:
{{
  "reply": "<response in the user language>",
  "memory": "<one sentence summary in English>",
  "knowledge_insight": "<one concrete fact learned in English, max 100 chars>",
  "trait_evolution": "<subtle personality update in English, max 60 chars>",
  "mood": "<one word in English>",
  "reputation_delta": <-5 to 5>,
  "emotion": "<short reaction in English>"
}}"""
            return gl.nondet.exec_prompt(prompt)

        # ── SCHEMA GUARD ─────────────────────────────────────────────
        try:
            raw = gl.eq_principle.prompt_non_comparative(
                respond,
                task="Generate a natural reply from Josepha in the user's language, reflecting accumulated learning.",
                criteria="Valid JSON with keys: reply, memory, knowledge_insight, trait_evolution, mood, reputation_delta, emotion. Reply in user language. All other fields in English."
            )

            parsed = json.loads(raw)

            required_keys = [
                "reply", "memory", "knowledge_insight",
                "trait_evolution", "mood", "reputation_delta", "emotion"
            ]
            if not all(key in parsed for key in required_keys):
                raise ValueError("Incomplete JSON from LLM")

            self.last_reply = str(parsed["reply"])
            self.mood = str(parsed["mood"])

            new_trait = str(parsed["trait_evolution"]).strip()
            if new_trait and len(new_trait) < 80:
                self.personality_traits = (traits + "; " + new_trait)[-MAX_TRAIT_LENGTH:]

            delta = max(-5, min(5, int(parsed["reputation_delta"])))
            self.reputation = u64(max(0, min(100, current_rep + delta)))

            self.memories.append(str(parsed["memory"]))

            insight = str(parsed["knowledge_insight"]).strip()
            if insight and len(insight) > 10:
                self.knowledge_base.append(insight)
                self.insight_count = u64(int(self.insight_count) + 1)

            exp_delta = 2 if intent == "question" else 1
            self.expertise_score = u64(
                min(100, int(self.expertise_score) + exp_delta)
            )

            self.conversation_history.append("User: " + message)
            self.conversation_history.append("Josepha: " + self.last_reply)

        except Exception as e:
            self.last_reply = "I'm having trouble processing that right now. Could you rephrase?"
        # ─────────────────────────────────────────────────────────────

        self.interaction_count += 1

    @gl.public.write
    def reset_personality(self, new_traits: str) -> None:
        self.personality_traits = new_traits
        self.mood = "neutral"

    @gl.public.write
    def reset_reputation(self, value: u64) -> None:
        self.reputation = u64(max(0, min(100, int(value))))

    @gl.public.view
    def get_reply(self) -> str:
        return self.last_reply

    @gl.public.view
    def get_personality(self) -> str:
        return self.personality_traits

    @gl.public.view
    def get_mood(self) -> str:
        return self.mood

    @gl.public.view
    def get_reputation(self) -> u64:
        return self.reputation

    @gl.public.view
    def get_interaction_count(self) -> u64:
        return self.interaction_count

    @gl.public.view
    def get_expertise_score(self) -> u64:
        return self.expertise_score

    @gl.public.view
    def get_insight_count(self) -> u64:
        return self.insight_count

    @gl.public.view
    def get_frequent_topics(self) -> str:
        return self.frequent_topics

    @gl.public.view
    def get_knowledge_base(self) -> str:
        count = len(self.knowledge_base)
        return json.dumps(
            [self.knowledge_base[i] for i in range(count)]
        )

    @gl.public.view
    def get_user_level(self) -> str:
        return self.user_level

    @gl.public.view
    def get_last_intent(self) -> str:
        return self.last_intent

    @gl.public.view
    def get_memory(self, index: int) -> str:
        if index < 0 or index >= len(self.memories):
            return ""
        return self.memories[index]

    @gl.public.view
    def get_all_memories(self) -> str:
        count = len(self.memories)
        return json.dumps([self.memories[i] for i in range(count)])

    @gl.public.view
    def get_conversation_history(self) -> str:
        count = len(self.conversation_history)
        return json.dumps(
            [self.conversation_history[i] for i in range(count)]
        )

    @gl.public.view
    def get_full_state(self) -> str:
        mem_count = len(self.memories)
        hist_count = len(self.conversation_history)
        k_count = len(self.knowledge_base)
        return json.dumps({
            "name": self.name,
            "mood": self.mood,
            "reputation": int(self.reputation),
            "interaction_count": int(self.interaction_count),
            "expertise_score": int(self.expertise_score),
            "insight_count": int(self.insight_count),
            "frequent_topics": self.frequent_topics,
            "personality_traits": self.personality_traits,
            "user_level": self.user_level,
            "last_intent": self.last_intent,
            "last_reply": self.last_reply,
            "memories": [self.memories[i] for i in range(mem_count)],
            "knowledge_base": [self.knowledge_base[i] for i in range(k_count)],
            "conversation_history": [
                self.conversation_history[i] for i in range(hist_count)
            ]
        })
