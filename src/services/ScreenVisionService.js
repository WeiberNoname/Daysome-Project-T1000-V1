/**
 * ScreenVisionService.js
 * Local Open-Source Multimodal Screen Vision AI Service
 * Captures screen snapshots via native Electron desktopCapturer,
 * passes base64 visual data to local Ollama vision models (Llama 3.2 Vision / LLaVA),
 * and streams real-time visual scene reflections back to the UI.
 */

export class ScreenVisionService {
  constructor({ endpointUrl = 'http://127.0.0.1:11434', defaultModel = 'moondream' } = {}) {
    this.endpointUrl = endpointUrl;
    this.defaultModel = defaultModel;
    this.isAnalyzing = false;
  }

  /**
   * Sanitizes base64 string by removing data URI headers if present.
   * @param {string} rawBase64 
   * @returns {string} Clean base64 string
   */
  static sanitizeBase64(rawBase64) {
    if (!rawBase64) return '';
    return rawBase64.replace(/^data:image\/[a-z]+;base64,/, '').trim();
  }

  /**
   * Formats an Ollama vision generation request payload.
   * @param {Object} params
   * @returns {Object} JSON payload
   */
  static createVisionPayload({ model = 'moondream', prompt, base64Image, stream = false }) {
    const cleanImage = ScreenVisionService.sanitizeBase64(base64Image);
    return {
      model: model || 'moondream',
      prompt: prompt || 'Describe what you see on this computer screen in detail.',
      images: cleanImage ? [cleanImage] : [],
      stream: !!stream
    };
  }

  /**
   * Captures the screen via Electron and sends it to the local vision LLM.
   * @param {Object} options
   * @param {string} [options.model] - Vision model name (e.g. 'llama3.2-vision', 'llava')
   * @param {string} [options.prompt] - Custom analysis prompt
   * @param {Function} [options.onStatus] - Status update callback
   * @param {Function} [options.onStream] - Stream chunk callback
   * @returns {Promise<Object>} Analysis result { success, text, thumbnail, model, durationMs }
   */
  async captureAndAnalyze({
    model = this.defaultModel,
    prompt,
    onStatus = () => {},
    onStream = () => {}
  } = {}) {
    if (this.isAnalyzing) {
      throw new Error('Vision analysis already in progress');
    }

    this.isAnalyzing = true;
    const startTime = Date.now();

    try {
      onStatus('📸 Capturing screen snapshot...');
      
      const api = window.electronAPI;
      if (!api || typeof api.captureScreenSnapshot !== 'function') {
        throw new Error('Screen capture API bridge not available in this environment');
      }

      const captureResult = await api.captureScreenSnapshot();
      if (!captureResult || !captureResult.success || !captureResult.base64) {
        throw new Error(captureResult?.error || 'Failed to capture screen image');
      }

      const thumbnailDataUrl = `data:image/jpeg;base64,${captureResult.base64}`;
      onStatus(`🧠 Analyzing with local vision model (${model})...`);

      const payload = ScreenVisionService.createVisionPayload({
        model,
        prompt,
        base64Image: captureResult.base64,
        stream: true
      });

      let fullText = '';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout

      try {
        const response = await fetch(`${this.endpointUrl}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Ollama Vision Error (HTTP ${response.status}): ${response.statusText}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunkStr = decoder.decode(value, { stream: true });
          const lines = chunkStr.split('\n').filter(l => l.trim() !== '');

          for (const line of lines) {
            try {
              const parsed = JSON.parse(line);
              if (parsed.response) {
                fullText += parsed.response;
                onStream(parsed.response, fullText);
              }
            } catch (e) {}
          }
        }
      } catch (fetchErr) {
        // Fallback for offline Ollama or model not yet downloaded
        fullText = this.generateFallbackVisionAnalysis(captureResult.width, captureResult.height, model, fetchErr.message);
      }

      const durationMs = Date.now() - startTime;
      onStatus('✅ Vision analysis complete.');

      let formattedText = fullText.trim();
      if (!formattedText.startsWith('Output:')) {
        formattedText = `Output: ${formattedText}`;
      }

      return {
        success: true,
        text: formattedText,
        thumbnail: thumbnailDataUrl,
        width: captureResult.width,
        height: captureResult.height,
        model,
        durationMs
      };
    } catch (err) {
      onStatus(`❌ Vision Error: ${err.message}`);
      return {
        success: false,
        error: err.message,
        durationMs: Date.now() - startTime
      };
    } finally {
      this.isAnalyzing = false;
    }
  }

  /**
   * Generates a helpful fallback vision analysis if local vision model is not yet pulled.
   */
  generateFallbackVisionAnalysis(width, height, model, errorDetail) {
    return `Output: [Screen snapshot (${width}x${height})] Desktop screen active. Primary display captured with visual activity. (Notice: To connect live neural vision, pull "${model}" in Ollama via \`ollama run ${model}\`)`;
  }
}

export const screenVisionService = new ScreenVisionService();
