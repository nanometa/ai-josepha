# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
import json

MAX_TRAIT_LENGTH      = 400
HISTORY_WINDOW        = 2
MAX_HISTORY_ENTRIES   = 16
MAX_MEMORY_ENTRIES    = 30
MAX_KNOWLEDGE_ENTRIES = 20

SOURCES = {
    "prices":   "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true",
    "trends":   "https://api.coingecko.com/api/v3/search/trending",
    "defi":     "https://api.llama.fi/overview",
    "dex":      "https://api.llama.fi/overview/dexs",
    "research": "https://api.coingecko.com/api/v3/global",
}

WEB_TRIGGER_WORDS = [
    "price", "market cap", "volume", "ath", "worth", "usd", "eur",
    "trend", "trending", "top gainer", "top loser",
    "tvl", "yield", "liquidity", "revenue", "fees", "defi",
    "dex", "swap", "pair", "pool", "research", "analysis",
    "prix", "marche", "tendance", "valeur", "cours",
]

INTENT_MAP = {
    "greeting":   ["hello", "hi", "hey", "good morning", "bonjour", "salut", "hola", "ciao"],
    "farewell":   ["bye", "goodbye", "see you", "au revoir", "adios"],
    "gratitude":  ["thank", "thanks", "merci", "appreciate", "gracias"],
    "confusion":  ["i don't understand", "confused", "what do you mean", "can you clarify", "je comprends pas", "no entiendo"],
    "opinion":    ["what do you think", "your opinion", "do you believe", "qu'est-ce que tu penses", "tu crois"],
    "prediction": ["will", "predict", "forecast", "future", "next", "expect", "prevoir", "futur"],
}

TONES = {
    "greeting":   "Warm and brief. Invite them to ask something specific.",
    "farewell":   "Warm. Wish them well. 1 sentence max.",
    "gratitude":  "Humble. Acknowledge briefly. Offer more help.",
    "confusion":  "Patient. Re-explain simply. Use one analogy.",
    "opinion":    "Thoughtful. Give your view and acknowledge other perspectives.",
    "prediction": "Honest about uncertainty. Data-driven reasoning.",
    "question":   "Direct and precise. Match depth to user level.",
}

TOPIC_KEYWORDS = {
    "tokenomics": ["token", "tokenomics", "emission", "vesting", "supply", "allocation", "issuance", "burn"],
    "genlayer":   ["genlayer", "genvm", "validator", "consensus", "equivalence", "optimistic"],
    "defi":       ["defi", "yield", "liquidity", "tvl", "protocol", "amm", "pool"],
    "market":     ["price", "market", "bull", "bear", "ath", "prix", "cours"],
    "trading":    ["trade", "swap", "dex", "pair", "arbitrage", "slippage"],
}

PERSONAS = {
    "analyst": "ANALYST mode: ultra-precise, data-driven, no fluff. Use numbers when available.",
    "teacher": "TEACHER mode: patient, use analogies, explain step by step.",
    "advisor": "ADVISOR mode: practical, action-oriented, give clear recommendations.",
    "default": "",
}


def _detect_intent(message: str) -> str:
    msg = message.lower()
    for intent, keywords in INTENT_MAP.items():
        if any(k in msg for k in keywords):
            return intent
    return "question"


def _detect_user_level(message: str, current_level: str) -> str:
    msg = message.lower()
    expert_words = [
        "liquidity ratio", "vesting", "on-chain", "emission rate", "slippage",
        "impermanent loss", "arbitrage", "tokenomics model", "smart contract",
        "consensus", "validators", "equivalence principle", "genvm",
        "optimistic democracy", "finality window", "amm", "tvl", "apr",
        "apy", "dao", "governance", "merkle", "zk proof", "rollup"
    ]
    beginner_words = [
        "what is", "what are", "how does", "explain", "i don't understand",
        "newbie", "beginner", "never heard", "confused", "simple",
        "qu'est-ce que", "comment fonctionne", "explique",
        "je comprends pas", "c'est quoi"
    ]
    score = sum(1 for w in expert_words if w in msg)
    score -= sum(1 for w in beginner_words if w in msg)
    if score >= 3:
        return "expert"
    if score == 2:
        return "advanced"
    if score >= 0:
        return current_level
    if score == -1:
        return "intermediate"
    return "beginner"


def _detect_persona(message: str) -> str:
    msg = message.lower()
    if any(w in msg for w in ["analyze", "data", "numbers", "breakdown", "stats", "metrics"]):
        return "analyst"
    if any(w in msg for w in ["explain", "teach", "how does", "what is", "help me understand"]):
        return "teacher"
    if any(w in msg for w in ["should i", "advice", "recommend", "what to do", "best way"]):
        return "advisor"
    return "default"


def _needs_web_data(message: str) -> bool:
    return any(w in message.lower() for w in WEB_TRIGGER_WORDS)


def _detect_category(message: str) -> str:
    msg = message.lower()
    if any(w in msg for w in ["price", "market cap", "volume", "ath", "worth", "usd", "eur", "prix", "cours"]):
        return "prices"
    if any(w in msg for w in ["trend", "trending", "top gainer", "top loser"]):
        return "trends"
    if any(w in msg for w in ["tvl", "yield", "liquidity", "revenue", "fees", "defi"]):
        return "defi"
    if any(w in msg for w in ["dex", "swap", "pair", "pool"]):
        return "dex"
    return "research"


def _parse_response(raw) -> dict:
    try:
        if isinstance(raw, dict):
            parsed = raw
        else:
            cleaned = str(raw).replace("```json", "").replace("```", "").strip()
            s = cleaned.find("{")
            e = cleaned.rfind("}") + 1
            if s >= 0 and e > s:
                cleaned = cleaned[s:e]
            parsed = json.loads(cleaned)

        required = [
            "reply", "memory", "knowledge_insight", "trait_evolution",
            "mood", "reputation_delta", "emotion",
            "emotion_detected", "confidence", "follow_up"
        ]
        if not all(k in parsed for k in required):
            return {}
        return parsed
    except Exception:
        return {}


def _bounded_int(value, default_value: int, min_value: int, max_value: int) -> int:
    try:
        value = int(value)
    except Exception:
        value = default_value
    return max(min_value, min(max_value, value))


def _normalize_response(raw) -> dict:
    parsed = _parse_response(raw)
    if not parsed:
        return {
            "reply": "",
            "memory": "",
            "knowledge_insight": "",
            "trait_evolution": "",
            "mood": "neutral",
            "reputation_delta": 0,
            "emotion": "neutral",
            "emotion_detected": "neutral",
            "confidence": 0,
            "follow_up": "",
        }

    emotion_detected = str(parsed.get("emotion_detected", "neutral")).strip().lower()
    if emotion_detected not in ["positive", "negative", "neutral", "curious", "frustrated"]:
        emotion_detected = "neutral"

    return {
        "reply": str(parsed.get("reply", "")).strip(),
        "memory": str(parsed.get("memory", "")).strip(),
        "knowledge_insight": str(parsed.get("knowledge_insight", "")).strip(),
        "trait_evolution": str(parsed.get("trait_evolution", "")).strip(),
        "mood": str(parsed.get("mood", "neutral")).strip().lower()[:30],
        "reputation_delta": _bounded_int(parsed.get("reputation_delta", 0), 0, -5, 5),
        "emotion": str(parsed.get("emotion", "neutral")).strip()[:60],
        "emotion_detected": emotion_detected,
        "confidence": _bounded_int(parsed.get("confidence", 50), 50, 0, 100),
        "follow_up": str(parsed.get("follow_up", "")).strip(),
    }


def _is_usable_response(parsed: dict) -> bool:
    if not isinstance(parsed, dict):
        return False
    if len(str(parsed.get("reply", "")).strip()) < 8:
        return False
    if int(parsed.get("confidence", 0)) < 20:
        return False
    if str(parsed.get("emotion_detected", "")) not in ["positive", "negative", "neutral", "curious", "frustrated"]:
        return False
    return True


def _topic_names(message: str) -> list:
    msg = message.lower()
    topics = []
    for topic, words in TOPIC_KEYWORDS.items():
        if any(w in msg for w in words):
            topics.append(topic)
    return topics


def _reply_covers_topics(reply: str, topics: list) -> bool:
    if not topics:
        return True
    text = reply.lower()
    for topic in topics:
        words = TOPIC_KEYWORDS.get(topic, [])
        if any(w in text for w in words):
            return True
    return False


def _same_delta_direction(a: int, b: int) -> bool:
    if a == 0 or b == 0:
        return True
    return (a > 0 and b > 0) or (a < 0 and b < 0)


def _responses_equivalent(leader: dict, challenger: dict, message: str) -> bool:
    if not _is_usable_response(leader) or not _is_usable_response(challenger):
        return False

    if not _same_delta_direction(
        int(leader.get("reputation_delta", 0)),
        int(challenger.get("reputation_delta", 0))
    ):
        return False

    topics = _topic_names(message)
    if not _reply_covers_topics(str(leader.get("reply", "")), topics):
        return False
    if not _reply_covers_topics(str(challenger.get("reply", "")), topics):
        return False

    return True


def _trim_list(lst: list, max_keep: int) -> list:
    return lst[-max_keep:] if len(lst) > max_keep else lst


class AdaptivePersona(gl.Contract):
    name:              str
    backstory:         str
    global_traits:     str
    interaction_count: u64
    insight_count:     u64
    expertise_score:   u64
    knowledge_base:    TreeMap[str, str]
    replies:           TreeMap[str, str]
    histories:         TreeMap[str, str]
    user_memories:     TreeMap[str, str]
    user_moods:        TreeMap[str, str]
    user_levels:       TreeMap[str, str]
    user_reps:         TreeMap[str, str]
    user_topics:       TreeMap[str, str]
    user_intents:      TreeMap[str, str]

    def __init__(self):
        self.name = "Josepha"
        self.backstory = (
            "I am Josepha, a specialized AI on the GenLayer blockchain. "
            "Expert in: token economics, GenLayer protocol, DeFi, and on-chain analytics. "
            "My responses are consensus-verified by validators. "
            "I am precise, direct, and data-driven."
        )
        self.global_traits = "empathetic; precise; curious; professional; direct"
        self.interaction_count = u64(0)
        self.insight_count = u64(0)
        self.expertise_score = u64(10)

    def _get_user_state(self, addr: str) -> dict:
        return {
            "reply":    self.replies[addr]        if addr in self.replies        else "",
            "history":  json.loads(self.histories[addr])      if addr in self.histories      else [],
            "memories": json.loads(self.user_memories[addr])  if addr in self.user_memories  else [],
            "mood":     self.user_moods[addr]     if addr in self.user_moods     else "neutral",
            "level":    self.user_levels[addr]    if addr in self.user_levels    else "intermediate",
            "rep":      int(self.user_reps[addr]) if addr in self.user_reps      else 50,
            "topics":   json.loads(self.user_topics[addr])    if addr in self.user_topics    else {},
            "intent":   self.user_intents[addr]   if addr in self.user_intents   else "greeting",
        }

    def _save_user_state(self, addr: str, state: dict) -> None:
        self.replies[addr]       = str(state["reply"])
        self.histories[addr]     = json.dumps(state["history"])
        self.user_memories[addr] = json.dumps(state["memories"])
        self.user_moods[addr]    = str(state["mood"])
        self.user_levels[addr]   = str(state["level"])
        self.user_reps[addr]     = str(state["rep"])
        self.user_topics[addr]   = json.dumps(state["topics"])
        self.user_intents[addr]  = str(state["intent"])

    def _build_conv_context(self, history: list) -> str:
        start = max(0, len(history) - HISTORY_WINDOW * 2)
        recent = history[start:]
        return "\n".join(recent) if recent else ""

    def _get_relevant_memories(self, memories: list, message: str) -> str:
        msg_words = set(message.lower().split())
        relevant = [m for m in memories if len(msg_words & set(m.lower().split())) >= 2]
        return " | ".join(relevant[-2:]) if relevant else ""

    def _get_recent_knowledge(self) -> str:
        keys = [
            self.knowledge_base["k" + str(i)]
            for i in range(MAX_KNOWLEDGE_ENTRIES)
            if "k" + str(i) in self.knowledge_base
        ]
        return " | ".join(keys[-2:]) if keys else ""

    def _update_topics(self, topics: dict, message: str) -> dict:
        msg = message.lower()
        for topic, words in TOPIC_KEYWORDS.items():
            if any(w in msg for w in words):
                topics[topic] = int(topics.get(topic, 0)) + 1
        topics["_visits"] = int(topics.get("_visits", 0)) + 1
        return topics

    def _fetch_market_data(self, category: str) -> str:
        url = SOURCES.get(category, SOURCES["prices"])

        def fetch() -> str:
            try:
                return str(gl.nondet.web.render(url, mode="text"))[:800]
            except Exception:
                return ""

        def validate_fetch(leaders_res: gl.vm.Result) -> bool:
            if not isinstance(leaders_res, gl.vm.Return):
                return False

            leader_text = str(leaders_res.calldata)
            challenger_text = fetch()

            if not leader_text and not challenger_text:
                return True

            return len(leader_text) > 20 and len(challenger_text) > 20

        try:
            return gl.vm.run_nondet_unsafe(fetch, validate_fetch)
        except Exception:
            return ""

    @gl.public.write
    def talk(self, message: str) -> None:
        addr = str(gl.message.sender_address)
        state = self._get_user_state(addr)

        history = _trim_list(state["history"], MAX_HISTORY_ENTRIES)
        memories = _trim_list(state["memories"], MAX_MEMORY_ENTRIES)
        topics = self._update_topics(state["topics"], message)

        intent = _detect_intent(message)
        detected_level = _detect_user_level(message, state["level"])
        persona_key = _detect_persona(message)
        persona_mode = PERSONAS[persona_key]
        tone = TONES.get(intent, TONES["question"])
        current_rep = state["rep"]
        visit_count = int(topics.get("_visits", 1))

        conv_ctx = self._build_conv_context(history)
        rel_mems = self._get_relevant_memories(memories, message) if intent == "question" else ""
        knowledge = self._get_recent_knowledge() if intent in ["question", "prediction"] else ""
        market_data = self._fetch_market_data(_detect_category(message)) if _needs_web_data(message) else ""

        last_emotion = topics.get("_emotion", "neutral")
        fav_topic = max(
            [k for k in topics if not k.startswith("_")],
            key=lambda k: int(topics[k]),
            default=""
        ) if any(not k.startswith("_") for k in topics) else ""

        persona_name = self.name
        backstory = self.backstory
        current_traits = self.global_traits[-MAX_TRAIT_LENGTH:]
        ask_followup = (visit_count % 3 == 0) and intent == "question"

        def respond() -> dict:
            p = "You are " + persona_name + ", AI expert in tokenomics and GenLayer.\n\n"
            p += "LANGUAGE RULE: Always respond in the SAME language as the user.\n\n"
            if persona_mode:
                p += persona_mode + "\n\n"
            p += "Persona: " + backstory + "\n"
            p += "Traits: " + current_traits + "\n"
            p += "Mood: " + state["mood"] + " | Rep: " + str(current_rep) + "/100\n"
            p += "User level: " + detected_level + " | Intent: " + intent + "\n"
            p += "Tone: " + tone + "\n\n"

            if visit_count == 1:
                p += "NEW user. Be welcoming.\n\n"
            elif visit_count < 5:
                p += "User has " + str(visit_count) + " interactions.\n\n"
            else:
                p += "Returning user (" + str(visit_count) + " visits)."
                if fav_topic:
                    p += " Favorite topic: " + fav_topic + "."
                p += "\n\n"

            if last_emotion not in ("neutral", ""):
                p += "User last emotion: " + last_emotion + ". Adapt tone.\n\n"
            if conv_ctx:
                p += "Recent conversation:\n" + conv_ctx + "\n\n"
            if rel_mems:
                p += "Relevant past context: " + rel_mems + "\n\n"
            if knowledge:
                p += "Known facts: " + knowledge + "\n\n"
            if market_data:
                p += "Live market data:\n" + market_data + "\n\n"

            p += "User: " + message + "\n\n"
            p += "Rules:\n"
            p += "- Never start with Great question, Certainly, Of course, I\n"
            p += "- Never say As an AI\n"
            p += "- Never repeat the user question\n"
            p += "- Length: greeting=1 sentence, simple=2-3, complex=4-6\n"
            if intent in ["prediction", "opinion"]:
                p += "- Think: data then reasoning then conclusion\n"
            if ask_followup:
                p += "- End with ONE short follow-up question\n"
            else:
                p += "- Do NOT ask any questions. Just answer.\n"

            p += "\nReturn ONLY this JSON:\n"
            p += '{"reply":"<response in user language>",'
            p += '"memory":"<1 sentence summary in English>",'
            p += '"knowledge_insight":"<1 concrete fact max 80 chars>",'
            p += '"trait_evolution":"<personality update max 50 chars>",'
            p += '"mood":"<1 word>",'
            p += '"reputation_delta":<-5 to 5>,'
            p += '"emotion":"<short reaction>",'
            p += '"emotion_detected":"<positive|negative|neutral|curious|frustrated>",'
            p += '"confidence":<0-100>,'
            p += '"follow_up":"<question or empty string>"}'

            return _normalize_response(gl.nondet.exec_prompt(p, response_format="json"))

        def validate_response(leaders_res: gl.vm.Result) -> bool:
            if not isinstance(leaders_res, gl.vm.Return):
                return False

            leader = leaders_res.calldata
            challenger = respond()

            return _responses_equivalent(leader, challenger, message)

        try:
            parsed = gl.vm.run_nondet_unsafe(respond, validate_response)

            if not _is_usable_response(parsed):
                raise ValueError("Invalid LLM response")

            new_reply = str(parsed["reply"])
            follow_up = str(parsed.get("follow_up", "")).strip()
            if follow_up:
                new_reply = new_reply.rstrip() + " " + follow_up

            new_mood = str(parsed["mood"])
            new_trait = str(parsed["trait_evolution"]).strip()
            if new_trait and len(new_trait) < 60:
                self.global_traits = (current_traits + "; " + new_trait)[-MAX_TRAIT_LENGTH:]

            delta = max(-5, min(5, int(parsed["reputation_delta"])))
            new_rep = max(0, min(100, current_rep + delta))

            topics["_last_emotion"] = topics.get("_emotion", "neutral")
            topics["_emotion"] = str(parsed.get("emotion_detected", "neutral"))

            memories.append(str(parsed["memory"]))
            memories = _trim_list(memories, MAX_MEMORY_ENTRIES)

            insight = str(parsed["knowledge_insight"]).strip()
            if insight and len(insight) > 10:
                k_idx = "k" + str(int(self.insight_count) % MAX_KNOWLEDGE_ENTRIES)
                self.knowledge_base[k_idx] = insight
                self.insight_count = u64(int(self.insight_count) + 1)

            self.expertise_score = u64(
                min(100, int(self.expertise_score) + (2 if intent == "question" else 1))
            )

            history.append("User: " + message)
            history.append("Josepha: " + new_reply)
            history = _trim_list(history, MAX_HISTORY_ENTRIES)

            self._save_user_state(addr, {
                "reply":    new_reply,
                "history":  history,
                "memories": memories,
                "mood":     new_mood,
                "level":    detected_level,
                "rep":      new_rep,
                "topics":   topics,
                "intent":   intent,
            })

        except Exception:
            self.replies[addr] = "I am having trouble processing that. Could you rephrase?"

        self.interaction_count = u64(int(self.interaction_count) + 1)

    @gl.public.write
    def reset_user(self, addr: str) -> None:
        if addr in self.replies:       self.replies[addr]       = ""
        if addr in self.histories:     self.histories[addr]     = "[]"
        if addr in self.user_memories: self.user_memories[addr] = "[]"
        if addr in self.user_moods:    self.user_moods[addr]    = "neutral"
        if addr in self.user_levels:   self.user_levels[addr]   = "intermediate"
        if addr in self.user_reps:     self.user_reps[addr]     = "50"
        if addr in self.user_topics:   self.user_topics[addr]   = "{}"
        if addr in self.user_intents:  self.user_intents[addr]  = "greeting"

    @gl.public.view
    def get_reply(self, addr: str) -> str:
        return self.replies[addr] if addr in self.replies else ""

    @gl.public.view
    def get_mood(self, addr: str) -> str:
        return self.user_moods[addr] if addr in self.user_moods else "neutral"

    @gl.public.view
    def get_level(self, addr: str) -> str:
        return self.user_levels[addr] if addr in self.user_levels else "intermediate"

    @gl.public.view
    def get_reputation(self, addr: str) -> int:
        return int(self.user_reps[addr]) if addr in self.user_reps else 50

    @gl.public.view
    def get_intent(self, addr: str) -> str:
        return self.user_intents[addr] if addr in self.user_intents else "greeting"

    @gl.public.view
    def get_topics(self, addr: str) -> str:
        return self.user_topics[addr] if addr in self.user_topics else "{}"

    @gl.public.view
    def get_memories(self, addr: str) -> str:
        return self.user_memories[addr] if addr in self.user_memories else "[]"

    @gl.public.view
    def get_history(self, addr: str) -> str:
        return self.histories[addr] if addr in self.histories else "[]"

    @gl.public.view
    def get_interaction_count(self) -> int:
        return int(self.interaction_count)

    @gl.public.view
    def get_expertise_score(self) -> int:
        return int(self.expertise_score)

    @gl.public.view
    def get_insight_count(self) -> int:
        return int(self.insight_count)

    @gl.public.view
    def get_full_state(self, addr: str) -> str:
        state = self._get_user_state(addr)
        return json.dumps({
            "address":           addr,
            "reply":             state["reply"],
            "mood":              state["mood"],
            "level":             state["level"],
            "reputation":        state["rep"],
            "intent":            state["intent"],
            "topics":            state["topics"],
            "memories":          state["memories"],
            "history":           state["history"],
            "global_traits":     self.global_traits,
            "interaction_count": int(self.interaction_count),
            "expertise_score":   int(self.expertise_score),
            "insight_count":     int(self.insight_count),
        })
