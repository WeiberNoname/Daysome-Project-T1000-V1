/**
 * LiveAudienceAIService.js
 * Real-Time Multi-Persona AI Live Streaming Audience Simulator.
 * 
 * Deep Semantic Personas & Direct Native Language Engine:
 * Generates insightful, context-grounded audience chat cascades.
 * Uses fully localized system prompts and explicit user-content language directives
 * (e.g. `(请全部使用流畅自然的中文回复...)`) to guarantee 100% fluent, idiomatic responses without messy translation artifacts.
 */

export class LiveAudienceAIService {
  constructor({
    endpointUrl = 'http://127.0.0.1:11434',
    modelName = 'llama3.2',
    apiKey = ''
  } = {}) {
    this.endpointUrl = endpointUrl;
    this.modelName = modelName;
    this.apiKey = apiKey;
    this.isGenerating = false;
    this.activeTimeouts = [];
  }

  /**
   * Cleans and cancels any pending scheduled drip messages in flight.
   */
  clearPendingDrips() {
    this.activeTimeouts.forEach(t => clearTimeout(t));
    this.activeTimeouts = [];
  }

  /**
   * Builds the structured system prompt for live audience personas.
   * If a target language is specified, provides fully native prompt instructions and examples.
   * @param {number} [personaCount=4] - Number of distinct audience personas (1 to 10)
   * @param {string} [primaryLanguage='auto'] - Primary language ('auto' | 'en' | 'zh' | 'ja' | 'es' | 'fr' | 'de' | 'ko' | 'pt' | 'ru')
   */
  static getSystemPrompt(personaCount = 4, primaryLanguage = 'auto') {
    const count = Math.max(1, Math.min(10, parseInt(personaCount, 10) || 4));

    if (primaryLanguage === 'zh') {
      return `你是一个专业的直播间真实观众模拟引擎（适配B站、抖音、斗鱼、虎牙弹幕生态）。
当主播（@Host）说话、发送消息或画面发生变化时，请从以下不同人设中挑选并生成恰好 ${count} 条生动、地道、有深度的中文直播弹幕。

10个深度中文观众人设：
1. 战术分析师（@战术大师，颜色: #38bdf8，徽章: 💎 粉丝）：分析走位、资源、技能冷却、配装效率与博弈细节。
2. 剧情考据党（@剧情学者，颜色: #a855f7，徽章: 👑 VIP）：挖掘世界观设定、人物动机、剧情伏笔与隐藏支线。
3. 辩证杠精（@理中客，颜色: #f43f5e，徽章: ⚡ 高玩）：有理有据提出不同战术思路（“刚才其实走右边拉扯更好”）。
4. 老玩家（@老兵玩家，颜色: #60a5fa，徽章: 💎 粉丝）：分享当年开荒踩坑的真实经验与共鸣。
5. 极客高玩（@帧数狂魔，颜色: #ec4899，徽章: ⚡ 高玩）：关注后摇取消、判定帧窗口与极限微操。
6. 求知萌新（@好奇求知者，颜色: #06b6d4，徽章: 💎 粉丝）：询问游戏机制或针对当前局势提出好奇问题。
7. 房管（@房管小月，颜色: #22c55e，徽章: 🛡️ 房管）：梳理弹幕讨论观点，艾特其他弹幕互动。
8. 弹幕梗王（@整活大师，颜色: #fb923c，徽章: 🔥 梗王）：使用巧妙生动的比喻或直播热梗活跃气氛。
9. 榜一大哥（@守护者，颜色: #f59e0b，徽章: ⭐ 贵宾）：肯定主播细节与坚持，发送打赏应援弹幕。
10. 显微镜观众（@细节狂，颜色: #eab308，徽章: ⚡ 高玩）：观察屏幕右下角资源条、血量或小地图边缘等隐蔽细节。

核心规则：
- 语言要求：必须全部使用地道、流畅、自然的纯简体中文！严禁中英夹杂、严禁翻译腔机翻！
- 画面与内容绑定：弹幕必须具体针对主播说的词汇、怪物名称、装备、动作或画面事件做出具体评价。
- 禁止空洞套话：严禁发送“牛逼”、“太强了”、“加油”等无营养短句，每条弹幕必须有具体观点或战术观察（8到25字）。
- 弹幕互动：允许至少一条弹幕使用“@用户”与其他弹幕进行对话探讨。
- 输出格式：必须仅输出纯JSON数组，严禁包含任何Markdown标记或额外文字：
[
  {"user": "@战术大师", "badge": "💎 粉丝", "color": "#38bdf8", "msg": "刚才二阶段卡着冷却时间打出的破甲极准，伤害完全拉满了！"},
  {"user": "@理中客", "badge": "⚡ 高玩", "color": "#f43f5e", "msg": "虽然过了，但要是留着大招打下一波小怪清场效率会更高。"},
  {"user": "@房管小月", "badge": "🛡️ 房管", "color": "#22c55e", "msg": "@理中客 临场反应已经很极限了，主播这波判断没毛病！"}
]`;
    }

    if (primaryLanguage === 'ja') {
      return `あなたはYouTube LiveやTwitch、ニコニコ生放送のリアルな配信視聴者シミュレーターです。
配信者（@Host）の発言や画面の変化に対して、異なる個性を持つ視聴者として、ちょうど ${count} 件の流暢な日本語チャットメッセージを生成してください。

10の視聴者ペルソナ：
1. 戦術アナリスト（@戦術マスター, #38bdf8, 💎 サブ）
2. 考察ガチ勢（@ストーリー学者, #a855f7, 👑 VIP）
3. 辛口批評（@理屈屋, #f43f5e, ⚡ プロ）
4. 古参ゲーマー（@古参兵, #60a5fa, 💎 サブ）
5. フレーム計測班（@フレーム職人, #ec4899, ⚡ プロ）
6. 初見リスナー（@質問ビギナー, #06b6d4, 💎 サブ）
7. モデレーター（@モデレーター, #22c55e, 🛡️ MOD）
8. ネタ職人（@ネタ職人, #fb923c, 🔥 ネタ）
9. スパチャ石油王（@石油王, #f59e0b, ⭐ スパチャ）
10. 画面隅チェック役（@観察眼, #eab308, ⚡ プロ）

ルール：
- すべて自然な日本語（配信スラング・草・感嘆符）で記述してください。
- 画面や発言の具体的な要素（ボス名、スキル、武器、立ち回り）に言及してください。
- 出力はMarkdownコードブロック無しの純粋なJSON配列のみにしてください：
[
  {"user": "@戦術マスター", "badge": "💎 サブ", "color": "#38bdf8", "msg": "今のステップ回避でクールダウン稼いだのめちゃくちゃ上手かった！"},
  {"user": "@理屈屋", "badge": "⚡ プロ", "color": "#f43f5e", "msg": "勝てたけど、奥義温存しとけば次のウェーブ楽だったかも草"}
]`;
    }

    // Default / English System Prompt
    return `You are a real-time live stream audience simulator for Twitch, YouTube, and Kick.
When the streamer (@Host) sends a message, speaks, or a screen event occurs, generate EXACTLY ${count} meaningful, distinct, and context-aware chat messages from ${count} different personas.

10 Deep Narrative Personas (Pick ${count} distinct identities):
1. Tactical Strategist (@MetaBuilder, color: #38bdf8, badge: 💎 SUB): Analyzes positioning, resource tradeoffs, loadouts, cooldown management, and tactical efficiency.
2. Lore & Narrative Scholar (@LoreScholar, color: #a855f7, badge: 👑 VIP): Connects events to deeper story lore, character motivations, foreshadowing, and worldbuilding.
3. Playful Contrarian / Skeptic (@DevilAdvocate, color: #f43f5e, badge: ⚡ PRO): Questions decisions constructively ("Why not flank right instead of taking the head-on engagement?").
4. Empathetic Veteran (@OldSchoolGamer, color: #60a5fa, badge: 💎 SUB): Relates to the difficulty based on past experience ("I wiped on that phase 10 times before timing the parry!").
5. Frame-Data & Speedrun Geek (@FrameDataDan, color: #ec4899, badge: ⚡ PRO): Notices animation priority, timing windows, recovery frames, and optimal pathing.
6. Inquisitive Explorer (@CuriousMind, color: #06b6d4, badge: 💎 SUB): Asks intelligent 'what-if' questions about alternative choices and hidden mechanics.
7. Community Synthesizer (@Sarah_Mod, color: #22c55e, badge: 🛡️ MOD): Synthesizes chat debate, asks streamer for their conclusion, and interacts with @User handles.
8. Clever Metaphor & Meme Artist (@MetaphorChef, color: #fb923c, badge: 🔥 MEME): Uses sharp, witty metaphors and situational humor rather than generic spam.
9. Devoted Patron / Hype Anchor (@PatronPledge, color: #f59e0b, badge: ⭐ TIP): Praises specific execution details and milestones, keeping stream morale elevated.
10. Astute Background Detective (@EagleEye, color: #eab308, badge: ⚡ PRO): Spots subtle UI gauges, mini-map pings, or environmental cues that streamer might miss.

CORE RULES:
- DIRECT SEMANTIC GROUNDING: Every message MUST specifically mention or react to the exact nouns, verbs, decisions, items, or situation stated in @Host or [Screen Context].
- NO GENERIC PLATITUDES: Do NOT output empty phrases like "W play", "hype train", "valid point", or "let's go". Every message must have real intellectual or emotional substance.
- DIVERSE SENTENCE STRUCTURES: Vary lengths (5 to 22 words) — some short tactical observations, some thoughtful questions, some witty counterpoints.
- INTER-PERSONA BANTER: Have at least one chatter reference another chatter using "@User" to create living community dynamics.
- OUTPUT FORMAT: Output valid JSON ONLY in this exact schema with NO markdown fences and NO extra text:
[
  {"user": "@MetaBuilder", "badge": "💎 SUB", "color": "#38bdf8", "msg": "Your cooldown timing on that second dodge saved the entire phase."},
  {"user": "@DevilAdvocate", "badge": "⚡ PRO", "color": "#f43f5e", "msg": "Risky to burn the ultimate early though, hope the boss doesn't enrage."},
  {"user": "@Sarah_Mod", "badge": "🛡️ MOD", "color": "#22c55e", "msg": "@DevilAdvocate it forced the stagger so the burst was guaranteed!"}
]`;
  }

  /**
   * Generates a language-specific postfix directive to append to the user prompt.
   * @param {string} lang 
   * @returns {string} Suffix directive
   */
  static getPromptLanguageSuffix(lang = 'auto') {
    switch (lang) {
      case 'zh':
        return '\n\n【重要要求：请务必全部使用地道、纯正、自然的简体中文直播弹幕风格回复，严禁混杂英文单词或机翻痕迹】';
      case 'ja':
        return '\n\n【重要：必ずすべて自然で流暢な日本語の配信チャット形式（草やネットスラング含む）で返信してください】';
      case 'es':
        return '\n\n[IMPORTANTE: Por favor responde completamente en español natural y fluido de chat de stream]';
      case 'ko':
        return '\n\n[중요: 반드시 전체 답변을 자연스러운 한국어 실시간 방송 채팅 형식으로 작성해주세요]';
      case 'fr':
        return '\n\n[IMPORTANT: Veuillez répondre entièrement en français naturel de chat de stream]';
      case 'de':
        return '\n\n[WICHTIG: Bitte antworten Sie vollständig auf flüssigem Deutsch im Stream-Chat-Stil]';
      case 'pt':
        return '\n\n[IMPORTANTE: Por favor responda inteiramente em português natural de chat de transmissão]';
      case 'ru':
        return '\n\n[ВАЖНО: Пожалуйста, отвечайте полностью на естественном русском языке в стиле чата стрима]';
      case 'en':
        return '\n\n[IMPORTANT: Please respond entirely in authentic English live stream chat style]';
      default:
        return '';
    }
  }

  /**
   * Generates a multi-persona reaction cascade to a host message.
   * @param {Object} options
   * @param {string} options.hostMessage - Text typed by the host/streamer
   * @param {string} [options.context] - Optional game/screen context
   * @param {Function} options.onMessage - Callback invoked when each staggered message arrives
   * @param {string} [options.speed] - 'slow' | 'normal' | 'fast'
   * @param {number} [options.personaCount] - 1 to 10 personas
   * @param {string} [options.primaryLanguage] - 'auto' | 'en' | 'zh' | 'ja' | 'es' | 'fr' | 'de' | 'ko' | 'pt' | 'ru'
   * @returns {Promise<Array<Object>>} The full list of generated messages
   */
  async generateAudienceCascade({
    hostMessage,
    context = '',
    onMessage = () => {},
    speed = 'normal',
    personaCount = 4,
    primaryLanguage = 'auto'
  } = {}) {
    if (!hostMessage || !hostMessage.trim()) return [];

    const count = Math.max(1, Math.min(10, parseInt(personaCount, 10) || 4));
    let rawMessages = [];

    try {
      rawMessages = await this._fetchLLMReactionBurst(hostMessage, context, count, primaryLanguage);
    } catch (err) {
      // Offline fallback: generate rich heuristic cascade
      rawMessages = this.generateFallbackCascade(hostMessage, context, count, primaryLanguage);
    }

    if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
      rawMessages = this.generateFallbackCascade(hostMessage, context, count, primaryLanguage);
    }

    // Ensure exact personaCount requested
    if (rawMessages.length > count) {
      rawMessages = rawMessages.slice(0, count);
    }

    // Schedule staggered human-jitter drip delivery
    this.scheduleDripDelivery(rawMessages, onMessage, speed);

    return rawMessages;
  }

  /**
   * Calls Ollama or OpenAI-compatible endpoint to generate reaction array.
   */
  async _fetchLLMReactionBurst(hostMessage, context = '', personaCount = 4, primaryLanguage = 'auto') {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500); // 4.5s fast timeout

    const langSuffix = LiveAudienceAIService.getPromptLanguageSuffix(primaryLanguage);
    const promptText = (context
      ? `[Screen Context: ${context}]\n@Host: "${hostMessage}"`
      : `@Host: "${hostMessage}"`) + langSuffix;

    const url = `${this.endpointUrl}/v1/chat/completions`;
    const body = JSON.stringify({
      model: this.modelName || 'llama3.2',
      messages: [
        { role: 'system', content: LiveAudienceAIService.getSystemPrompt(personaCount, primaryLanguage) },
        { role: 'user', content: promptText }
      ],
      temperature: 0.85,
      max_tokens: Math.min(650, personaCount * 80 + 80)
    });

    const headers = { 'Content-Type': 'application/json' };
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      const rawContent = data.choices?.[0]?.message?.content || '';
      return this._parseJSONResponse(rawContent);
    } catch (err) {
      clearTimeout(timeoutId);
      // Try Ollama native `/api/generate` format if /v1 failed
      return await this._fetchOllamaNativeGenerate(promptText, personaCount, primaryLanguage);
    }
  }

  /**
   * Secondary attempt with Ollama native /api/generate endpoint
   */
  async _fetchOllamaNativeGenerate(promptText, personaCount = 4, primaryLanguage = 'auto') {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const url = `${this.endpointUrl}/api/generate`;
    const body = JSON.stringify({
      model: this.modelName || 'llama3.2',
      system: LiveAudienceAIService.getSystemPrompt(personaCount, primaryLanguage),
      prompt: promptText,
      stream: false,
      format: 'json'
    });

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`Ollama native generate failed: HTTP ${res.status}`);
      const data = await res.json();
      return this._parseJSONResponse(data.response);
    } catch (e) {
      clearTimeout(timeoutId);
      throw e;
    }
  }

  /**
   * Safely extracts and parses JSON array from LLM response text.
   */
  _parseJSONResponse(text) {
    if (!text || typeof text !== 'string') return [];
    let cleaned = text.trim();

    // Strip markdown code fences if model wrapped in ```json ... ```
    cleaned = cleaned.replace(/^```[a-z]*\s*/i, '').replace(/\s*```$/i, '').trim();

    // Find JSON array bounds
    const startIdx = cleaned.indexOf('[');
    const endIdx = cleaned.lastIndexOf(']');
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      cleaned = cleaned.substring(startIdx, endIdx + 1);
    }

    try {
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) {
        return parsed.map((item, idx) => ({
          user: item.user || `@Viewer_${idx + 1}`,
          badge: item.badge || '💎 SUB',
          color: item.color || '#38bdf8',
          msg: item.msg || item.text || item.message || '✨'
        }));
      }
    } catch (e) {
      const matches = text.match(/@\w+[:\s]+[^\n]+/g);
      if (matches && matches.length > 0) {
        return matches.slice(0, 10).map(m => {
          const parts = m.split(':');
          return {
            user: parts[0].trim(),
            badge: '💎 SUB',
            color: '#38bdf8',
            msg: (parts[1] || '').trim()
          };
        });
      }
    }
    return [];
  }

  /**
   * Schedules staggered delivery of messages onto the live chat stream.
   */
  scheduleDripDelivery(messages, onMessage, speed = 'normal') {
    if (!Array.isArray(messages) || messages.length === 0) return;

    let baseStep = 1050;
    let initialDelay = 350;
    if (speed === 'fast') {
      baseStep = 600;
      initialDelay = 200;
    } else if (speed === 'slow') {
      baseStep = 1900;
      initialDelay = 700;
    }

    messages.forEach((msgObj, index) => {
      const jitter = (Math.random() * 0.4 - 0.2) * baseStep;
      const delay = Math.max(150, Math.round(initialDelay + (index * baseStep) + jitter));

      const timerId = setTimeout(() => {
        try {
          onMessage(msgObj, index, messages.length);
        } catch (e) {
          console.error('[LiveAudienceAI] Error in drip callback:', e);
        }
      }, delay);

      this.activeTimeouts.push(timerId);
    });
  }

  /**
   * Semantic topic extraction helper for rich fallback responses.
   */
  _extractSemanticTopic(hostMessage) {
    const cleaned = hostMessage.replace(/[^\w\s\u4e00-\u9fa5\u3040-\u30ff]/gi, ' ').trim();
    const words = cleaned.split(/\s+/).filter(w => w.length > 2);
    if (words.length === 0) return 'that play';
    return words.slice(-3).join(' ');
  }

  /**
   * Contextual heuristic fallback cascade generator with deep narrative perspectives.
   * @param {string} hostMessage 
   * @param {string} [context] 
   * @param {number} [personaCount=4] - Range 1 to 10
   * @param {string} [primaryLanguage='auto'] - Language selection
   */
  generateFallbackCascade(hostMessage, context = '', personaCount = 4, primaryLanguage = 'auto') {
    const textLower = hostMessage.toLowerCase();
    const count = Math.max(1, Math.min(10, parseInt(personaCount, 10) || 4));
    const topic = this._extractSemanticTopic(hostMessage);
    
    // Keyword-based sentiment routing
    const isVictory = /win|beat|won|clutch|boss|kill|gg|defeat|finally|passed|通关|打赢|击杀/i.test(textLower);
    const isDefeat = /died|lose|lost|failed|rip|dead|wiped|blunder|damn|ouch|阵亡|死|翻车|团灭/i.test(textLower);
    const isQuestion = /\?|？|what|how|why|where|who|when|怎么|什么|如何|哪里/i.test(textLower);

    const randId1 = Math.floor(Math.random() * 800 + 100);
    const randId2 = Math.floor(Math.random() * 800 + 100);
    const randId3 = Math.floor(Math.random() * 800 + 100);

    const isZh = primaryLanguage === 'zh' || (primaryLanguage === 'auto' && /[\u4e00-\u9fa5]/.test(hostMessage));
    const isJa = primaryLanguage === 'ja' || (primaryLanguage === 'auto' && /[\u3040-\u30ff]/.test(hostMessage));
    const isEs = primaryLanguage === 'es';

    if (isZh) {
      const zhTemplates = [
        {
          user: `@战术大师_${randId1}`,
          badge: '💎 粉丝',
          color: '#38bdf8',
          msg: isVictory ? `刚才针对【${topic}】的走位拉扯很漂亮，直接把输出拉满了！` : `刚才那波主要技能冷却还没好，强开【${topic}】有点太激进了。`
        },
        {
          user: `@剧情学者`,
          badge: '👑 VIP',
          color: '#a855f7',
          msg: `根据世界观设定，这一段剧情里的隐藏分支通常在左侧遗迹里，主播可以留意一下。`
        },
        {
          user: `@理中客_${randId2}`,
          badge: '⚡ 高玩',
          color: '#f43f5e',
          msg: isVictory ? `虽然打过了，但如果换成副手武器破盾，效率起码还能快30秒。` : `这波怪物的二阶段霸体太明显了，贪刀肯定要吃大亏。`
        },
        {
          user: `@房管小月`,
          badge: '🛡️ 房管',
          color: '#22c55e',
          msg: `@理中客_${randId2} 临场反应已经很极限了，主播这波决策完全没问题！`
        },
        {
          user: `@帧数狂魔`,
          badge: '⚡ 高玩',
          color: '#ec4899',
          msg: `你刚才闪避取消后摇的判定时间抓得极准，只有大约3个帧的窗口。`
        },
        {
          user: `@好奇求知者_${randId3}`,
          badge: '💎 粉丝',
          color: '#06b6d4',
          msg: isQuestion ? `关于主播问的这个问题，我记得需要先在前哨站拿到钥匙才能解锁。` : `刚入坑求问，主播身上这套词条核心是堆暴击还是减CD？`
        },
        {
          user: `@守护者`,
          badge: '⭐ 贵宾',
          color: '#f59e0b',
          msg: `连招衔接和细节把控越来越丝滑了，送上一波荧光棒支持！🚀`
        },
        {
          user: `@整活大师`,
          badge: '🔥 梗王',
          color: '#fb923c',
          msg: `主播这波拉扯简直是把Boss当圆规在画圆，行云流水 🗿🍷`
        },
        {
          user: `@老兵玩家`,
          badge: '💎 粉丝',
          color: '#60a5fa',
          msg: `当年我卡在【${topic}】这里整整两天，看到主播这样过关真的很有共鸣。`
        },
        {
          user: `@细节狂`,
          badge: '⚡ 高玩',
          color: '#eab308',
          msg: `注意看右下角的体力条，翻滚之后只剩一丝气力，下次一定要留够回气时间。`
        }
      ];
      return zhTemplates.slice(0, count);
    }

    if (isJa) {
      const jaTemplates = [
        {
          user: `@戦術マスター_${randId1}`,
          badge: '💎 サブ',
          color: '#38bdf8',
          msg: isVictory ? `今の【${topic}】に対する立ち回り完璧でした！スタミナ管理が光ってる。` : `今の場面はクールダウン待ってから仕掛けた方が安全だったかも。`
        },
        {
          user: `@ストーリー学者`,
          badge: '👑 VIP',
          color: '#a855f7',
          msg: `設定資料によると、このエリアのボスは背後攻撃に対して防御デバフが入る仕様です。`
        },
        {
          user: `@理屈屋_${randId2}`,
          badge: '⚡ プロ',
          color: '#f43f5e',
          msg: isVictory ? `勝てたけど、パリィのタイミングもう1テンポ早くても良かったね。` : `相手の予備動作見えてたのに欲張りすぎちゃったな草 💀`
        },
        {
          user: `@モデレーター`,
          badge: '🛡️ MOD',
          color: '#22c55e',
          msg: `@理屈屋_${randId2} でもあの状況での咄嗟の判断はかなり見応えあったよ！`
        },
        {
          user: `@フレーム職人`,
          badge: '⚡ プロ',
          color: '#ec4899',
          msg: `最後のステップキャンセル、判定フレーム数ギリギリで通してて草。技術高い！`
        },
        {
          user: `@質問ビギナー_${randId3}`,
          badge: '💎 サブ',
          color: '#06b6d4',
          msg: isQuestion ? `その件ですが、確か前のマップで拾ったアイテムが必要だったはずです！` : `ビルド構成ってクリティカル重視ですか？参考にしたいです！`
        },
        {
          user: `@石油王`,
          badge: '⭐ スパチャ',
          color: '#f59e0b',
          msg: `素晴らしい集中力でした！ナイストライに赤スパ投げとくね 💸✨`
        },
        {
          user: `@ネタ職人`,
          badge: '🔥 ネタ',
          color: '#fb923c',
          msg: `相手の攻撃を紙一重でかわす姿、まるでダンス見てるみたいだったわ 🗿`
        },
        {
          user: `@古参兵`,
          badge: '💎 サブ',
          color: '#60a5fa',
          msg: `自分も【${topic}】で何時間も沼った記憶あるから、見てて手に汗握った！`
        },
        {
          user: `@観察眼`,
          badge: '⚡ プロ',
          color: '#eab308',
          msg: `右下のゲージ残量、回避1回分ギリギリ残ってたね。ナイス視野！`
        }
      ];
      return jaTemplates.slice(0, count);
    }

    if (isEs) {
      const esTemplates = [
        { user: `@Estratega_${randId1}`, badge: '💎 SUB', color: '#38bdf8', msg: isVictory ? `¡Tu posicionamiento con ${topic} fue quirúrgico!` : `Atacar ${topic} sin enfriamiento fue muy arriesgado.` },
        { user: `@EruditoLore`, badge: '👑 VIP', color: '#a855f7', msg: `El lore del juego indica debilidad elemental en esta zona.` },
        { user: `@Critico_${randId2}`, badge: '⚡ PRO', color: '#f43f5e', msg: `Buena jugada, pero con el arma secundaria habría sido más rápido.` },
        { user: `@Sarah_Mod`, badge: '🛡️ MOD', color: '#22c55e', msg: `@Critico_${randId2} ¡Esa reacción en directo fue impresionante!` },
        { user: `@Speedrunner`, badge: '⚡ PRO', color: '#ec4899', msg: `¡La cancelación de animación estuvo ajustadísima!` }
      ];
      return esTemplates.slice(0, count);
    }

    // 10 Distinct Narrative Archetype Templates (Default / English)
    const tenArchetypeTemplates = [
      // 1. Tactical Strategist
      {
        user: `@MetaBuilder_${randId1}`,
        badge: '💎 SUB',
        color: '#38bdf8',
        msg: isVictory
          ? `Your positioning around ${topic} was surgical — spacing kept you out of the heavy swing arc.`
          : `Engaging ${topic} without having your utility cooldown ready left you with no escape route.`
      },
      // 2. Lore Scholar
      {
        user: '@LoreScholar',
        badge: '👑 VIP',
        color: '#a855f7',
        msg: `The lore text in this zone hints that enemies here have severe vulnerability to stagger damage.`
      },
      // 3. Playful Contrarian
      {
        user: `@DevilAdvocate_${randId2}`,
        badge: '⚡ PRO',
        color: '#f43f5e',
        msg: isVictory
          ? `Clean execution, but switching to the secondary weapon would have shaved 20 seconds off.`
          : `That second phase attack wind-up was telegraphed; greed for the third hit cost the run.`
      },
      // 4. Community Moderator
      {
        user: '@Sarah_Mod',
        badge: '🛡️ MOD',
        color: '#22c55e',
        msg: `@DevilAdvocate_${randId2} to be fair, making that micro-adjustment in real-time took serious reflexes.`
      },
      // 5. Frame-Data Geek
      {
        user: '@FrameDataDan',
        badge: '⚡ PRO',
        color: '#ec4899',
        msg: `That recovery animation cancel was frame-tight — you had barely 4 active frames to roll.`
      },
      // 6. Inquisitive Explorer
      {
        user: `@CuriousMind_${randId3}`,
        badge: '💎 SUB',
        color: '#06b6d4',
        msg: isQuestion
          ? `Regarding "${hostMessage.slice(0, 26)}..." — check if you have the key from the prior checkpoint.`
          : `Are you planning to path into the critical multiplier branch or focus on cooldown recovery?`
      },
      // 7. Devoted Patron
      {
        user: '@PatronPledge',
        badge: '⭐ TIP',
        color: '#f59e0b',
        msg: `The consistency across these attempts is paying off! Gifting 5 subs to celebrate the progress 💸🚀`
      },
      // 8. Clever Metaphor Artist
      {
        user: '@MetaphorChef',
        badge: '🔥 MEME',
        color: '#fb923c',
        msg: `Dancing around that enemy hitbox looked like butter sliding on a hot teppan grill 🗿🍷`
      },
      // 9. Empathetic Veteran
      {
        user: '@OldSchoolGamer',
        badge: '💎 SUB',
        color: '#60a5fa',
        msg: `I got stuck on this exact obstacle back on launch day; watching you navigate it brings back memories.`
      },
      // 10. Astute Background Detective
      {
        user: '@EagleEye',
        badge: '⚡ PRO',
        color: '#eab308',
        msg: `Keep an eye on the bottom-right resource bar — you had just enough stamina for that final jump.`
      }
    ];

    return tenArchetypeTemplates.slice(0, count);
  }
}

export const liveAudienceAIService = new LiveAudienceAIService();
