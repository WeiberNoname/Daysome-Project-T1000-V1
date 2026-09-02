/**
 * VisionCaptionSynthesizerService.js
 * Local Open-Source Vision-to-LLM Caption Synthesizer Service.
 * 1. Captures full-display PC screen snapshot via Electron native capturer.
 * 2. Analyzes visual elements, characters, artwork, actions, and scenery with local vision AI (Moondream).
 * 3. Feeds the visual scene description to local text LLM (Llama 3.2) to synthesize punchy, styled captions.
 * 4. Outputs formatted text into an editable review box for inspection.
 */

import { ScreenVisionService, VISION_DETAIL_PRESETS } from './ScreenVisionService.js';

export const SYNTH_STYLE_PERSONAS = {
  streamer: {
    name: '🎙️ Live Streamer',
    systemPrompt: 'You are a hype live-streamer commentating interactively on the visual scene. Generate energetic, entertaining subtitle comments speaking directly to your audience. Keep it punchy and stream-ready.'
  },
  funny: {
    name: '🤣 Funny & Comedy',
    systemPrompt: 'You are a witty, hilarious comedian commentating on what is happening on screen. Generate funny, humorous, light-hearted subtitle jokes and meme-style observations about the visual scene.'
  },
  serious: {
    name: '🧐 Serious & Analytical',
    systemPrompt: 'You are a serious, formal, highly observant analytical commentator. Generate objective, dignified, precise subtitle statements carefully describing the scene dynamics, structure, and events.'
  },
  gamer: {
    name: '🎮 Pro Gamer / Esports',
    systemPrompt: 'You are an esports pro gamer and shoutcaster giving rapid tactical play-by-play commentary. Generate fast-paced gaming commentary focusing on skills, action tempo, positioning, and visual mechanics.'
  },
  poetic: {
    name: '🌌 Poetic & Artistic',
    systemPrompt: 'You are a poetic storyteller and art critic. Generate beautiful, atmospheric, vivid subtitle reflections capturing the lighting, colors, emotional tone, and artistic essence of the visual scene.'
  },
  mascot: {
    name: '🐾 Cute Pet Companion',
    systemPrompt: 'You are a sweet, cheerful 3D desktop pet companion watching the screen with excitement. Generate kawaii, warm, friendly subtitle remarks cheering on the viewer.'
  },
  narrator: {
    name: '🍿 Cinematic Narrator',
    systemPrompt: 'You are an epic movie trailer narrator with a deep, dramatic voice. Generate atmospheric, cinematic subtitle sentences capturing the suspense, grandeur, and narrative gravity of the scene.'
  },
  action: {
    name: '⚡ Fast Action Subtitles',
    systemPrompt: 'You are an action subtitle generator. Generate short, high-impact, punchy subtitle lines (under 8 words each) highlighting critical moments and instant visual beats.'
  }
};

export class VisionCaptionSynthesizerService {
  constructor({ endpointUrl = 'http://127.0.0.1:11434', defaultVisionModel = 'moondream', defaultTextModel = 'llama3.2' } = {}) {
    this.endpointUrl = endpointUrl;
    this.defaultVisionModel = defaultVisionModel;
    this.defaultTextModel = defaultTextModel;
    this.isProcessing = false;
  }

  /**
   * Helper to format target language instructions for the LLM.
   */
  static getLanguageInstruction(lang) {
    if (!lang || lang === 'auto' || lang === 'en') return '';
    const langNames = {
      zh: 'Simplified Chinese (简体中文)',
      ja: 'Japanese (日本語)',
      es: 'Spanish (Español)',
      fr: 'French (Français)',
      de: 'German (Deutsch)',
      ko: 'Korean (한국어)',
      pt: 'Portuguese (Português)',
      ru: 'Russian (Русский)'
    };
    const name = langNames[lang] || lang;
    return ` Output all subtitles directly in ${name}.`;
  }

  /**
   * Parses raw LLM response text into clean sentence lines.
   */
  static parseCaptionOutput(rawText) {
    if (!rawText) return [];
    return rawText
      .split(/\r?\n+/)
      .map(line => line.trim())
      .map(line => line.replace(/^[-*•\d.)\]]+\s*/, '')) // Remove list numbers or bullets
      .map(line => line.replace(/^["'“”]+|["'“”]+$/g, '')) // Remove outer quotes
      .filter(line => line.length > 2 && !line.toLowerCase().startsWith('here are') && !line.toLowerCase().startsWith('subtitles:'));
  }

  /**
   * Executes the full pipeline: Screen Capture -> Vision Analysis -> LLM Caption Synthesis.
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  async synthesize({
    visionModel = this.defaultVisionModel,
    detail = 'medium',
    textModel = this.defaultTextModel,
    style = 'streamer',
    count = 3,
    language = 'auto',
    onStatus = () => {}
  } = {}) {
    if (this.isProcessing) {
      throw new Error('Caption synthesis is already in progress');
    }

    const safeCount = Math.max(1, Math.min(6, parseInt(count, 10) || 3));
    this.isProcessing = true;
    const startTime = Date.now();

    try {
      // Step 1: Capture Screen Snapshot
      onStatus('📸 Step 1/3: Capturing screen snapshot...');
      const api = window.electronAPI;
      if (!api || typeof api.captureScreenSnapshot !== 'function') {
        throw new Error('Screen capture bridge not available');
      }

      const capture = await api.captureScreenSnapshot();
      if (!capture || !capture.success || !capture.base64) {
        throw new Error(capture?.error || 'Failed to capture screen image');
      }

      const thumbnail = `data:image/jpeg;base64,${capture.base64}`;
      const cleanBase64 = ScreenVisionService.sanitizeBase64(capture.base64);

      // Step 2: Vision Model Scene Analysis
      onStatus(`🧠 Step 2/3: Analyzing visual scene with ${visionModel}...`);
      const preset = VISION_DETAIL_PRESETS[detail] || VISION_DETAIL_PRESETS.medium;
      let visionDescription = '';

      try {
        const vController = new AbortController();
        const vTimeout = setTimeout(() => vController.abort(), 25000);

        const vResponse = await fetch(`${this.endpointUrl}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: visionModel || 'moondream',
            prompt: preset.defaultPrompt,
            images: [cleanBase64],
            stream: false,
            options: {
              num_predict: preset.numPredict,
              temperature: preset.temperature
            }
          }),
          signal: vController.signal
        });
        clearTimeout(vTimeout);

        if (vResponse.ok) {
          const vData = await vResponse.json();
          if (vData && vData.response && vData.response.trim()) {
            visionDescription = vData.response.trim().replace(/^Output:\s*/i, '');
          }
        }
      } catch (vErr) {
        // Fallback description if vision model is offline
        visionDescription = `Visual scene (${capture.width}x${capture.height}) with active on-screen characters, artwork, and visual activity.`;
      }

      if (!visionDescription) {
        visionDescription = `Visual scene (${capture.width}x${capture.height}) with active on-screen characters, artwork, and visual activity.`;
      }

      // Step 3: LLM Caption Synthesis
      onStatus(`✨ Step 3/3: Synthesizing ${safeCount} caption(s) with ${textModel} (${style})...`);
      const persona = SYNTH_STYLE_PERSONAS[style] || SYNTH_STYLE_PERSONAS.streamer;
      const langInstruction = VisionCaptionSynthesizerService.getLanguageInstruction(language);

      let captionsList = [];
      let rawResponse = '';

      try {
        const lController = new AbortController();
        const lTimeout = setTimeout(() => lController.abort(), 20000);

        const lResponse = await fetch(`${this.endpointUrl}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: textModel || 'llama3.2',
            system: `${persona.systemPrompt}${langInstruction} Output EXACTLY ${safeCount} separate subtitle sentence(s), each on its own line. Do not number lines or use markdown bullets.`,
            prompt: `Visual Scene Observation:\n"${visionDescription}"\n\nGenerate exactly ${safeCount} distinct subtitle sentence(s) now:`,
            stream: false,
            options: {
              num_predict: Math.max(60, safeCount * 55 + 40),
              temperature: 0.7
            }
          }),
          signal: lController.signal
        });
        clearTimeout(lTimeout);

        if (lResponse.ok) {
          const lData = await lResponse.json();
          if (lData && lData.response) {
            rawResponse = lData.response.trim();
            captionsList = VisionCaptionSynthesizerService.parseCaptionOutput(rawResponse);
          }
        }
      } catch (lErr) {
        // Fallback heuristic captions
        captionsList = [
          visionDescription,
          'Dynamic visual activity detected on screen!'
        ];
      }

      if (captionsList.length === 0) {
        captionsList = [visionDescription];
      }

      const finalCaptions = captionsList.slice(0, safeCount);
      const durationMs = Date.now() - startTime;
      const formattedCaptionText = finalCaptions.join('\n\n');
      onStatus(`✅ Completed in ${durationMs}ms`);

      return {
        success: true,
        thumbnail,
        visionDescription,
        captionText: formattedCaptionText,
        captionsList: finalCaptions,
        visionModel,
        textModel,
        style,
        count: safeCount,
        durationMs
      };
    } catch (err) {
      onStatus(`❌ Error: ${err.message}`);
      return {
        success: false,
        error: err.message,
        durationMs: Date.now() - startTime
      };
    } finally {
      this.isProcessing = false;
    }
  }
}

export const visionCaptionSynthesizerService = new VisionCaptionSynthesizerService();
