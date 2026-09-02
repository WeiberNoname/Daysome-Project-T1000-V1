import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PhysicsEngine } from '../physicsEngine.js';
import { SettingsManager } from '../src/managers/SettingsManager.js';
import { AppStore } from '../src/managers/AppStore.js';
import { EventBus, eventBus } from '../src/managers/EventBus.js';
import { disposeHierarchy, disposeMaterial, disposeMixer, disposeRenderer } from '../src/core/GPUAssetManager.js';

import { AssetRegistryManager } from '../src/managers/AssetRegistryManager.js';
import { SceneStageManager } from '../src/core/SceneStageManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Starting Automated Unit Test Suite (Plan 001)...');

// 1. Test SettingsManager
console.log('▶ Testing SettingsManager defaults & fallback merging...');
const defaults = SettingsManager.getDefaultSettings();
assert.strictEqual(defaults.width, 350, 'Default width should be 350');
assert.strictEqual(defaults.height, 350, 'Default height should be 350');
assert.strictEqual(defaults.targetFps, 60, 'Default targetFps should be 60');
assert.strictEqual(defaults.language, 'en', 'Default language should be en');
assert.strictEqual(defaults.activeModel, 'procedural', 'Default activeModel should be procedural');
assert.strictEqual(defaults.sakuraRain, true, 'Default sakuraRain should be true');
assert.strictEqual(defaults.snowFall, false, 'Default snowFall should be false');
assert.strictEqual(defaults.dynamicBatterySaver, false, 'Default dynamicBatterySaver should be false');
assert.strictEqual(defaults.liveChatEnabled, false, 'Default liveChatEnabled should be false');
assert.strictEqual(defaults.liveChatSpeed, 'normal', 'Default liveChatSpeed should be normal');
assert.strictEqual(defaults.liveChatWidth, 240, 'Default liveChatWidth should be 240');
assert.strictEqual(defaults.liveChatHeight, 190, 'Default liveChatHeight should be 190');
assert.strictEqual(defaults.liveChatScale, 1.0, 'Default liveChatScale should be 1.0');
assert.strictEqual(defaults.liveChatPosition, 'top-left', 'Default liveChatPosition should be top-left');
assert.strictEqual(defaults.liveChatFontSize, 11, 'Default liveChatFontSize should be 11');
assert.strictEqual(defaults.liveChatPersonaCount, 4, 'Default liveChatPersonaCount should be 4');
assert.strictEqual(defaults.liveChatLanguage, 'auto', 'Default liveChatLanguage should be auto');
assert.strictEqual(defaults.screenVisionAutoLoop, false, 'Default screenVisionAutoLoop should be false');
assert.strictEqual(defaults.screenVisionModel, 'moondream', 'Default screenVisionModel should be moondream');
assert.strictEqual(defaults.screenVisionDetail, 'medium', 'Default screenVisionDetail should be medium');
assert.strictEqual(defaults.screenVisionPostChat, true, 'Default screenVisionPostChat should be true');
assert.strictEqual(defaults.liveCaptionMirrorVision, true, 'Default liveCaptionMirrorVision should be true');
assert.strictEqual(defaults.liveCaptionAutoOpen, false, 'Default liveCaptionAutoOpen should be false');
assert.strictEqual(defaults.synthVisionModel, 'moondream', 'Default synthVisionModel should be moondream');
assert.strictEqual(defaults.synthVisionDetail, 'medium', 'Default synthVisionDetail should be medium');
assert.strictEqual(defaults.synthTextModel, 'llama3.2', 'Default synthTextModel should be llama3.2');
assert.strictEqual(defaults.synthStyle, 'streamer', 'Default synthStyle should be streamer');
assert.strictEqual(defaults.synthCaptionCount, 3, 'Default synthCaptionCount should be 3');
assert.strictEqual(defaults.synthCaptionPacing, 3.0, 'Default synthCaptionPacing should be 3.0');
assert.strictEqual(defaults.synthAutoLoop, false, 'Default synthAutoLoop should be false');
assert.strictEqual(defaults.synthAutoInterval, 15, 'Default synthAutoInterval should be 15');
assert.strictEqual(defaults.synthAutoPlayHUD, true, 'Default synthAutoPlayHUD should be true');
assert.strictEqual(defaults.synthLanguage, 'auto', 'Default synthLanguage should be auto');

const merged = SettingsManager.mergeWithDefaults({
  scale: 2.5,
  targetFps: 120,
  customKey: 'test',
  snowFall: true,
  liveChatEnabled: true,
  liveChatSpeed: 'fast',
  liveChatWidth: 320,
  liveChatHeight: 250,
  liveChatScale: 1.25,
  liveChatPosition: 'top-right',
  liveChatFontSize: 16,
  liveChatPersonaCount: 8,
  liveChatLanguage: 'ja',
  screenVisionAutoLoop: true,
  screenVisionInterval: 15,
  screenVisionModel: 'moondream',
  screenVisionPostChat: true
});
assert.strictEqual(merged.scale, 2.5, 'Scale should be overridden to 2.5');
assert.strictEqual(merged.targetFps, 120, 'targetFps should be overridden to 120');
assert.strictEqual(merged.snowFall, true, 'snowFall should be overridden to true');
assert.strictEqual(merged.liveChatEnabled, true, 'liveChatEnabled should be overridden to true');
assert.strictEqual(merged.liveChatSpeed, 'fast', 'liveChatSpeed should be overridden to fast');
assert.strictEqual(merged.liveChatWidth, 320, 'liveChatWidth should be overridden to 320');
assert.strictEqual(merged.liveChatHeight, 250, 'liveChatHeight should be overridden to 250');
assert.strictEqual(merged.liveChatScale, 1.25, 'liveChatScale should be overridden to 1.25');
assert.strictEqual(merged.liveChatPosition, 'top-right', 'liveChatPosition should be overridden to top-right');
assert.strictEqual(merged.liveChatFontSize, 16, 'liveChatFontSize should be overridden to 16');
assert.strictEqual(merged.liveChatPersonaCount, 8, 'liveChatPersonaCount should be overridden to 8');
assert.strictEqual(merged.liveChatLanguage, 'ja', 'liveChatLanguage should be overridden to ja');
assert.strictEqual(merged.screenVisionAutoLoop, true, 'screenVisionAutoLoop should be overridden to true');
assert.strictEqual(merged.screenVisionInterval, 15, 'screenVisionInterval should be overridden to 15');
assert.strictEqual(merged.screenVisionModel, 'moondream', 'screenVisionModel should be overridden to moondream');
assert.strictEqual(merged.screenVisionPostChat, true, 'screenVisionPostChat should be overridden to true');
assert.strictEqual(merged.width, 350, 'Unspecified width should fallback to 350');
assert.strictEqual(merged.activeModel, 'procedural', 'Fallback activeModel should be procedural');
console.log('✅ SettingsManager tests PASSED.');

// 2. Test PhysicsEngine
console.log('▶ Testing PhysicsEngine velocity & boundary collision calculations...');
const engine = new PhysicsEngine();
engine.configure({ enabled: true, gravity: 9.8, floorY: -1.2 });
assert.strictEqual(engine.enabled, true, 'Physics engine should be enabled');
assert.strictEqual(engine.gravity, 9.8, 'Gravity should be 9.8');

engine.applyImpulse({ x: 1.0, y: 5.0, z: 0 });
assert.strictEqual(engine.velocity.x, 1.0, 'Impulse X should equal 1.0');
assert.strictEqual(engine.velocity.y, 5.0, 'Impulse Y should equal 5.0');

engine.reset();
assert.strictEqual(engine.position.x, 0, 'Reset position X should be 0');
assert.strictEqual(engine.position.y, 0, 'Reset position Y should be 0');
assert.strictEqual(engine.velocity.y, 0, 'Reset velocity Y should be 0');
console.log('✅ PhysicsEngine tests PASSED.');

// 3. Test 12-Locale Key Parity & default_mascot key
console.log('▶ Testing 12-Locale Key Parity & default_mascot translations...');
const localesDir = path.join(__dirname, '..', 'locales');
const supportedLangs = ['en', 'zh-CN', 'zh-TW', 'ja', 'ko', 'fr', 'de', 'es', 'es-419', 'it', 'pt-BR', 'ru'];

supportedLangs.forEach(lang => {
  const filePath = path.join(localesDir, lang, 'translation.json');
  assert.strictEqual(fs.existsSync(filePath), true, `Translation file for ${lang} must exist`);
  const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  assert.strictEqual(typeof content.default_mascot, 'string', `${lang} must contain default_mascot translation`);
  assert.strictEqual(content.default_mascot.length > 0, true, `${lang} default_mascot must not be empty`);
  assert.strictEqual(typeof content.snow_fall, 'string', `${lang} must contain snow_fall translation`);
  assert.strictEqual(content.snow_fall.length > 0, true, `${lang} snow_fall must not be empty`);
});
console.log('✅ 12-Locale Key Parity tests PASSED.');

// 4. Test AppStore Reactive Proxy & Subscriptions
console.log('▶ Testing AppStore reactive state & subscriber notifications...');
const store = new AppStore();
assert.strictEqual(store.state.isDragging, false, 'Default isDragging should be false');
assert.strictEqual(store.state.isSettingsOpen, false, 'Default isSettingsOpen should be false');

let notifiedVal = null;
const unsubscribe = store.subscribe('isDragging', (newVal) => {
  notifiedVal = newVal;
});

store.state.isDragging = true;
assert.strictEqual(store.state.isDragging, true, 'Direct write to store.state.isDragging should update');
assert.strictEqual(notifiedVal, true, 'Subscriber should be notified of state update');

unsubscribe();
store.state.isDragging = false;
assert.strictEqual(notifiedVal, true, 'Unsubscribed listener should not receive updates');

store.set({ cameraPitch: 0.5, cameraYaw: 1.2 });
assert.strictEqual(store.state.cameraPitch, 0.5, 'Batch set should update cameraPitch');
assert.strictEqual(store.state.cameraYaw, 1.2, 'Batch set should update cameraYaw');
console.log('✅ AppStore reactive tests PASSED.');

// 4.1 Test EventBus & Reactive Settings
console.log('▶ Testing EventBus channels, wildcards, and Reactive Settings Proxy...');
let eventPayload = null;
let wildcardEvent = null;
let onceCount = 0;

const offBus = eventBus.on('test:event', (payload) => {
  eventPayload = payload;
});
eventBus.on('test:*', (data) => {
  wildcardEvent = data.event;
});
eventBus.once('test:once', () => {
  onceCount++;
});

eventBus.emit('test:event', { foo: 'bar' });
assert.deepStrictEqual(eventPayload, { foo: 'bar' }, 'EventBus should dispatch payload to exact channel');
assert.strictEqual(wildcardEvent, 'test:event', 'EventBus should dispatch to wildcard channel');

eventBus.emit('test:once');
eventBus.emit('test:once');
assert.strictEqual(onceCount, 1, 'once() listeners must only fire a single time');

offBus();
eventBus.emit('test:event', { foo: 'updated' });
assert.deepStrictEqual(eventPayload, { foo: 'bar' }, 'Unsubscribed EventBus listener must not receive further events');

// Test SettingsManager.createReactiveSettings
let savedSettingsPayload = null;
const reactiveSettings = SettingsManager.createReactiveSettings({ activeModel: 'procedural' }, (saved) => {
  savedSettingsPayload = saved;
});

let reactiveEventPayload = null;
eventBus.on('settings:activeModel', (newVal) => {
  reactiveEventPayload = newVal;
});

reactiveSettings.activeModel = 'flag';
assert.strictEqual(reactiveSettings.activeModel, 'flag', 'Reactive settings property should mutate');
assert.strictEqual(reactiveEventPayload, 'flag', 'Mutating reactive settings should emit typed EventBus event');
console.log('✅ EventBus & Reactive Settings tests PASSED.');

// 5. Test GPUAssetManager Recursive Disposal
console.log('▶ Testing GPUAssetManager recursive VRAM & texture disposal...');
let geomDisposed = false;
let matDisposed = false;
let texDisposed = false;
let normDisposed = false;
let roughDisposed = false;
let mixerStopped = false;
let mixerUncached = false;
let rendererDisposed = false;
let contextLost = false;

const mockTexture = {
  isTexture: true,
  dispose: () => { texDisposed = true; }
};
const mockNormalTexture = {
  isTexture: true,
  dispose: () => { normDisposed = true; }
};
const mockRoughTexture = {
  isTexture: true,
  dispose: () => { roughDisposed = true; }
};

const mockMaterial = {
  map: mockTexture,
  normalMap: mockNormalTexture,
  roughnessMap: mockRoughTexture,
  dispose: () => { matDisposed = true; }
};

const mockGeometry = {
  dispose: () => { geomDisposed = true; }
};

const mockHierarchy = {
  children: [{ isChild: true }],
  traverse: (cb) => {
    cb({
      geometry: mockGeometry,
      material: mockMaterial
    });
  },
  remove: function(child) {
    const idx = this.children.indexOf(child);
    if (idx !== -1) this.children.splice(idx, 1);
  }
};

disposeHierarchy(mockHierarchy);
assert.strictEqual(geomDisposed, true, 'Geometry must be disposed');
assert.strictEqual(matDisposed, true, 'Material must be disposed');
assert.strictEqual(texDisposed, true, 'Attached diffuse map must be disposed');
assert.strictEqual(normDisposed, true, 'Attached normal map must be disposed');
assert.strictEqual(roughDisposed, true, 'Attached roughness map must be disposed');
assert.strictEqual(mockHierarchy.children.length, 0, 'Children array must be cleared');

const mockMixer = {
  stopAllAction: () => { mixerStopped = true; },
  uncacheRoot: (root) => { if (root) mixerUncached = true; }
};
disposeMixer(mockMixer, mockHierarchy);
assert.strictEqual(mixerStopped, true, 'Mixer actions must be stopped');
assert.strictEqual(mixerUncached, true, 'Mixer root must be uncached');

const mockRenderer = {
  renderLists: { dispose: () => {} },
  dispose: () => { rendererDisposed = true; },
  forceContextLoss: () => { contextLost = true; }
};
disposeRenderer(mockRenderer);
assert.strictEqual(rendererDisposed, true, 'Renderer must be disposed');
assert.strictEqual(contextLost, true, 'Context loss must be forced');
console.log('✅ GPUAssetManager tests PASSED.');

// 6. Test Electron Security Bridge & Preload Configuration
console.log('▶ Testing Preload Script & Security Isolation configuration...');
const preloadPath = path.join(__dirname, '..', 'preload.js');
assert.strictEqual(fs.existsSync(preloadPath), true, 'preload.js must exist in app root');
const preloadContent = fs.readFileSync(preloadPath, 'utf8');
assert.strictEqual(preloadContent.includes('contextBridge.exposeInMainWorld'), true, 'preload.js must use contextBridge');
assert.strictEqual(preloadContent.includes('electronAPI'), true, 'preload.js must expose electronAPI');
assert.strictEqual(preloadContent.includes('fsBridge'), true, 'preload.js must expose fsBridge');
assert.strictEqual(preloadContent.includes('pathBridge'), true, 'preload.js must expose pathBridge');
assert.strictEqual(preloadContent.includes('urlBridge'), true, 'preload.js must expose urlBridge');

const mainPath = path.join(__dirname, '..', 'main.js');
const mainContent = fs.readFileSync(mainPath, 'utf8');
assert.strictEqual(mainContent.includes('contextIsolation: true'), true, 'main.js must enable contextIsolation: true');
assert.strictEqual(mainContent.includes('nodeIntegration: false'), true, 'main.js must set nodeIntegration: false');
assert.strictEqual(mainContent.includes("preload: path.join(__dirname, 'preload.js')"), true, 'main.js must load preload.js');
assert.strictEqual(mainContent.includes('startSteamRepaintLoop()'), true, 'main.js must dynamically start Steam repaint loop');
assert.strictEqual(mainContent.includes('stopSteamRepaintLoop()'), true, 'main.js must dynamically stop Steam repaint loop');
console.log('✅ Electron Security Bridge & Idle Optimization tests PASSED.');

// 7. Test SoundManager State, Volume Normalization & Snapshot
console.log('▶ Testing SoundManager volume clamping & state snapshot...');
import('../src/core/SoundManager.js').then(({ SoundManager }) => {
  const sm = new SoundManager();
  assert.strictEqual(sm.isMuted, false, 'Default isMuted should be false');
  assert.strictEqual(sm.masterVolume, 0.8, 'Default masterVolume should be 0.8');
  assert.strictEqual(sm.isPlaying('snow'), false, 'Default snow playing should be false');
  assert.strictEqual(sm.isPlaying('sakura'), false, 'Default sakura playing should be false');
  assert.strictEqual(sm.isPlaying('drum'), false, 'Default drum playing should be false');

  // Test volume clamping
  sm.setMasterVolume(1.5);
  assert.strictEqual(sm.masterVolume, 1.0, 'Master volume should clamp to 1.0');
  sm.setMasterVolume(-0.5);
  assert.strictEqual(sm.masterVolume, 0.0, 'Master volume should clamp to 0.0');

  sm.setTrackVolume('snow', 0.85);
  assert.strictEqual(sm.tracks.snow.volume, 0.85, 'Track snow volume should be 0.85');
  sm.setTrackVolume('sakura', 0.65);
  assert.strictEqual(sm.tracks.sakura.volume, 0.65, 'Track sakura volume should be 0.65');
  sm.setTrackVolume('drum', 0.95);
  assert.strictEqual(sm.tracks.drum.volume, 0.95, 'Track drum volume should be 0.95');

  const snap = sm.getSnapshot();
  assert.strictEqual(snap.snowVolume, 0.85, 'Snapshot snowVolume should be 0.85');
  assert.strictEqual(snap.sakuraVolume, 0.65, 'Snapshot sakuraVolume should be 0.65');
  assert.strictEqual(snap.drumVolume, 0.95, 'Snapshot drumVolume should be 0.95');

  // Test syncAtmosphere
  sm.syncAtmosphere({
    soundMuted: true,
    soundMasterVolume: 0.5,
    soundSnowVolume: 0.4,
    soundSakuraVolume: 0.9,
    sakuraRain: true,
    soundSakuraSync: true
  });
  assert.strictEqual(sm.isMuted, true, 'syncAtmosphere should set isMuted');
  assert.strictEqual(sm.masterVolume, 0.5, 'syncAtmosphere should set masterVolume');
  assert.strictEqual(sm.tracks.snow.volume, 0.4, 'syncAtmosphere should set snow track volume');
  assert.strictEqual(sm.tracks.sakura.volume, 0.9, 'syncAtmosphere should set sakura track volume');

  console.log('✅ SoundManager unit tests PASSED.');

  // Test 8: FlagMeshBuilder and Wave Simulation
  console.log('▶ Testing FlagMeshBuilder presets and cloth wave math...');
  import('../src/core/FlagMeshBuilder.js').then(({ createPresetFlagTexture, updateFlagWave }) => {
    const eclipseTex = createPresetFlagTexture('eclipse');
    assert.ok(eclipseTex && eclipseTex.startsWith('data:image/png;base64,'), 'Eclipse preset should return base64 PNG data URL');

    const prismTex = createPresetFlagTexture('prism');
    assert.ok(prismTex && prismTex.startsWith('data:image/png;base64,'), 'Prism preset should return base64 PNG data URL');

    const zenTex = createPresetFlagTexture('zen');
    assert.ok(zenTex && zenTex.startsWith('data:image/png;base64,'), 'Zen preset should return base64 PNG data URL');

    const defaultTex = createPresetFlagTexture('default');
    assert.ok(defaultTex && defaultTex.startsWith('data:image/png;base64,'), 'Default preset should return base64 PNG data URL');

    const dragonTex = createPresetFlagTexture('dragon');
    assert.ok(dragonTex && dragonTex.startsWith('data:image/png;base64,'), 'Dragon preset should return base64 PNG data URL');

    const cyberTex = createPresetFlagTexture('cyber');
    assert.ok(cyberTex && cyberTex.startsWith('data:image/png;base64,'), 'Cyber preset should return base64 PNG data URL');

    const galaxyTex = createPresetFlagTexture('galaxy');
    assert.ok(galaxyTex && galaxyTex.startsWith('data:image/png;base64,'), 'Galaxy preset should return base64 PNG data URL');

    const sakuraTex = createPresetFlagTexture('sakura');
    assert.ok(sakuraTex && sakuraTex.startsWith('data:image/png;base64,'), 'Sakura preset should return base64 PNG data URL');

    const auroraTex = createPresetFlagTexture('aurora');
    assert.ok(auroraTex && auroraTex.startsWith('data:image/png;base64,'), 'Aurora preset should return base64 PNG data URL');

    const oceanTex = createPresetFlagTexture('ocean');
    assert.ok(oceanTex && oceanTex.startsWith('data:image/png;base64,'), 'Ocean preset should return base64 PNG data URL');

    // Test wave physics math on mock subdivided geometry
    const vertCount = 100;
    const initialPositions = new Float32Array(vertCount * 3);
    for (let i = 0; i < vertCount; i++) {
      initialPositions[i * 3] = (i % 10) * 0.2; // x
      initialPositions[i * 3 + 1] = Math.floor(i / 10) * 0.15; // y
      initialPositions[i * 3 + 2] = 0; // z
    }
    const currentPositions = new Float32Array(initialPositions);

    const mockClothMesh = {
      geometry: {
        userData: {
          initialPositions: initialPositions
        },
        attributes: {
          position: {
            array: currentPositions,
            needsUpdate: false
          }
        },
        computeVertexNormals: () => { mockClothMesh.geometry.normalsComputed = true; }
      }
    };

    updateFlagWave(mockClothMesh, 0.016, 1.0, 4.0, 0.4);
    assert.strictEqual(mockClothMesh.geometry.attributes.position.needsUpdate, true, 'position attribute should mark needsUpdate=true');
    assert.strictEqual(mockClothMesh.geometry.normalsComputed, true, 'computeVertexNormals should be invoked');
    
    // Far end of flag (x > 0) should have modulated Z displacement
    assert.notStrictEqual(currentPositions[currentPositions.length - 1], 0, 'Flag tail Z coordinate should be billowed by wind');

    console.log('✅ FlagMeshBuilder & wave physics unit tests PASSED.');

    // Test 9: SettingsManager with Texture & Flag Keys
    console.log('▶ Testing SettingsManager texture & flag key defaults and serialization...');
    const defaults = SettingsManager.getDefaultSettings();
    assert.strictEqual(defaults.customTexturePath, '', 'Default customTexturePath should be empty');
    assert.strictEqual(defaults.flagWindSpeed, 3.5, 'Default flagWindSpeed should be 3.5');
    assert.strictEqual(defaults.flagWaveIntensity, 0.35, 'Default flagWaveIntensity should be 0.35');
    assert.strictEqual(defaults.textureRepeatX, 1.0, 'Default textureRepeatX should be 1.0');
    assert.strictEqual(defaults.textureRepeatY, 1.0, 'Default textureRepeatY should be 1.0');
    assert.strictEqual(defaults.textureRoughness, 0.50, 'Default textureRoughness should be 0.50');
    assert.strictEqual(defaults.textureMetalness, 0.05, 'Default textureMetalness should be 0.05');
    assert.strictEqual(defaults.flagPreset, 'default', 'Default flagPreset should be default');

    console.log('✅ SettingsManager texture configuration unit tests PASSED.');

    // Test 10: LLMDirectorEngine Tool Calling & Intent Parsing
    console.log('▶ Testing LLMDirectorEngine tool executions and heuristic NLP parsing...');
    import('../src/core/LLMDirectorEngine.js').then(({ LLMDirectorEngine }) => {
      const mockSettings = { scale: 1.0, bobbing: false, spinY: false, speedY: 1.0, sakuraRain: false, enablePhysics: false };
      let saved = false;
      let spokenBubble = '';
      const engine = new LLMDirectorEngine({
        currentSettings: mockSettings,
        saveSettingsFile: () => { saved = true; },
        showSpeechBubble: (msg) => { spokenBubble = msg; }
      });

            // 1. Scale command
            const scaleResult = engine.parseHeuristicIntent('scale mascot to 1.8x');
            assert.strictEqual(scaleResult.toolCalls.length, 1);
            assert.strictEqual(scaleResult.toolCalls[0].name, 'setModelScale');
            assert.strictEqual(scaleResult.toolCalls[0].args.scale, 1.8);
            engine.executeTool('setModelScale', { scale: 1.8 });
            assert.strictEqual(mockSettings.scale, 1.8);
            assert.ok(saved);

            // 2. Spin command
            const spinResult = engine.parseHeuristicIntent('make the model spin faster on Y axis at 3.0 speed');
            assert.strictEqual(spinResult.toolCalls.length, 1);
            assert.strictEqual(spinResult.toolCalls[0].name, 'setSpinRotation');
            assert.strictEqual(spinResult.toolCalls[0].args.spinY, true);
            assert.strictEqual(spinResult.toolCalls[0].args.speedY, 3.0);
            engine.executeTool('setSpinRotation', { spinY: true, speedY: 3.0 });
            assert.strictEqual(mockSettings.spinY, true);
            assert.strictEqual(mockSettings.speedY, 3.0);

            // 3. Weather & Bobbing
            const weatherResult = engine.parseHeuristicIntent('turn on sakura petals and enable bobbing');
            assert.strictEqual(weatherResult.toolCalls.length, 2);
            engine.executeTool('setWeather', { sakuraRain: true });
            engine.executeTool('setBobbing', { enabled: true });
            assert.strictEqual(mockSettings.sakuraRain, true);
            assert.strictEqual(mockSettings.bobbing, true);

            // 4. Physics
            const physResult = engine.parseHeuristicIntent('enable gravity physics');
            assert.strictEqual(physResult.toolCalls.length, 1);
            assert.strictEqual(physResult.toolCalls[0].name, 'setPhysics');
            engine.executeTool('setPhysics', { enabled: true, gravity: 9.8 });
            assert.strictEqual(mockSettings.enablePhysics, true);

            // 5. Abstract compound request with typo ("turn of")
            const abstractCompound = engine.parseHeuristicIntent('what about scale the app size a bit, and turn of sakura effect');
            assert.strictEqual(abstractCompound.toolCalls.length, 2, 'Should detect both scale and weather tool calls');
            const hasScale = abstractCompound.toolCalls.some(tc => tc.name === 'setModelScale' || tc.name === 'setWindowSize');
            const hasSakuraOff = abstractCompound.toolCalls.some(tc => tc.name === 'setWeather' && tc.args.sakuraRain === false);
            assert.ok(hasScale, 'Should extract scale tool call');
            assert.ok(hasSakuraOff, 'Should extract turning off sakura');
            assert.ok(abstractCompound.text.includes('scaled model') || abstractCompound.text.includes('sakura'), 'Response should be human-like and descriptive');

            // 6. Conversational Human Chit-Chat
            const jokeResult = engine.parseHeuristicIntent('tell me a joke');
            assert.strictEqual(jokeResult.toolCalls.length, 0);
            assert.ok(jokeResult.text.length > 20, 'Should return natural human-like joke reply');

            // 7. ToolRegistry Guardrails & Clamping Test
            console.log('▶ Testing ToolRegistry safety guardrails & parameter auto-clamping...');
            // Test extreme out-of-bounds scale (e.g. 500x -> should clamp safely to 3.0x)
            engine.executeTool('setModelScale', { scale: 500 });
            assert.strictEqual(mockSettings.scale, 3.0, 'Scale should auto-clamp to max 3.0');

            // Test extreme negative scale (-10 -> should clamp safely to 0.2)
            engine.executeTool('setModelScale', { scale: -10 });
            assert.strictEqual(mockSettings.scale, 0.2, 'Scale should auto-clamp to min 0.2');

            // Test extreme physics gravity (9999 -> should clamp safely to 50)
            engine.executeTool('setPhysics', { gravity: 9999 });
            assert.strictEqual(mockSettings.physicsGravity, 50, 'Gravity should auto-clamp to max 50');

            // 8. Diagnostic Log Reporting & 10 Prompt Regression Tests
            console.log('▶ Testing Regression suite on all 10 real-world prompt scenarios...');

            // Turn 4: "start floating gently and let it snow across the desktop"
            const t4 = engine.parseHeuristicIntent('start floating gently and let it snow across the desktop');
            assert.ok(t4.toolCalls.some(tc => tc.name === 'setBobbing' && tc.args.enabled === true), 'Should enable bobbing');
            assert.ok(t4.toolCalls.some(tc => tc.name === 'setWeather' && tc.args.snowFall === true), 'Should enable snowfall');

            // Turn 5: "shrink the model slightly and enable gravity physics so it bounces off the floor"
            const t5 = engine.parseHeuristicIntent('shrink the model slightly and enable gravity physics so it bounces off the floor');
            assert.ok(t5.toolCalls.some(tc => tc.name === 'setModelScale'), 'Should shrink model');
            assert.ok(t5.toolCalls.some(tc => tc.name === 'setPhysics' && tc.args.enabled === true), 'Should enable physics');
            assert.ok(!t5.toolCalls.some(tc => tc.name === 'setLighting'), 'Should NOT falsely trigger lighting from word slightly');

            // Turn 6: "make the character 100x bigger and set gravity to 9999"
            const t6 = engine.parseHeuristicIntent('make the character 100x bigger and set gravity to 9999');
            assert.ok(t6.toolCalls.some(tc => tc.name === 'setModelScale' && tc.args.scale === 3.0), 'Should clamp scale to 3.0');

            // Turn 7: "turn down the piano volume a little bit and make the stage light brighter"
            const t7 = engine.parseHeuristicIntent('turn down the piano volume a little bit and make the stage light brighter');
            assert.ok(t7.toolCalls.some(tc => tc.name === 'setSoundVolume'), 'Should adjust sound volume');
            assert.ok(t7.toolCalls.some(tc => tc.name === 'setLighting'), 'Should brighten stage light');

            // Turn 8: "stop all animations, turn off the weather, and put the mascot back in the center"
            const t8 = engine.parseHeuristicIntent('stop all animations, turn off the weather, and put the mascot back in the center');
            assert.ok(t8.toolCalls.some(tc => tc.name === 'setSpinRotation'), 'Should stop spin');
            assert.ok(t8.toolCalls.some(tc => tc.name === 'setBobbing'), 'Should stop bobbing');
            assert.ok(t8.toolCalls.some(tc => tc.name === 'setWeather'), 'Should turn off weather');
            assert.ok(t8.toolCalls.some(tc => tc.name === 'resetPosition'), 'Should reset position');

            // Turn 9: "Switch to the waving flag model with cyber neon style and increase wind speed"
            const t9 = engine.parseHeuristicIntent('Switch to the waving flag model with cyber neon style and increase wind speed');
            assert.ok(t9.toolCalls.some(tc => tc.name === 'setActiveModel' && tc.args.modelName === 'flag'), 'Should switch to flag model');
            assert.ok(t9.toolCalls.some(tc => tc.name === 'setTextureSettings' && tc.args.flagPreset === 'cyber'), 'Should set cyber flag preset');
            assert.ok(t9.toolCalls.some(tc => tc.name === 'setTextureSettings' && tc.args.flagWindSpeed > 3.5), 'Should increase wind speed');

            // Turn 10: "Enable mouse click-through mode and reset camera to center"
            const t10 = engine.parseHeuristicIntent('Enable mouse click-through mode and reset camera to center');
            assert.ok(t10.toolCalls.some(tc => tc.name === 'setSystemSettings' && tc.args.ignoreMouse === true), 'Should enable click-through');
            assert.ok(t10.toolCalls.some(tc => tc.name === 'resetPosition'), 'Should reset position');

            // Turn 11: Relative Multiplier "Make it a little bit smaller and spin Y twice as fast"
            mockSettings.speedY = 1.0;
            const tRel = engine.parseHeuristicIntent('Make it a little bit smaller and spin Y twice as fast');
            assert.ok(tRel.toolCalls.some(tc => tc.name === 'setModelScale'), 'Should adjust scale');
            assert.ok(tRel.toolCalls.some(tc => tc.name === 'setSpinRotation' && tc.args.speedY === 2.0), 'Should double spin speed to 2.0x');

            // Turn 12: "It's too noisy and chaotic, make it peaceful for coding" (Zen Mood Archetype)
            const tZen = engine.parseHeuristicIntent("It's too noisy and chaotic, make it peaceful for coding");
            assert.ok(tZen.toolCalls.some(tc => tc.name === 'setPhysics' && tc.args.enabled === false), 'Should disable physics in zen mode');
            assert.ok(tZen.toolCalls.some(tc => tc.name === 'setWeather' && tc.args.snowFall === true), 'Should activate snowfall in zen mode');
            assert.ok(tZen.text.includes('Zen') || tZen.text.includes('Focus') || tZen.text.includes('Coding Mode'), 'Should return Zen mode reply');

            // Turn 13: "what day is today" (Dynamic Date/Time)
            const tDate = engine.parseHeuristicIntent('what day is today');
            assert.strictEqual(tDate.toolCalls.length, 0, 'Date query should not trigger tools');
            assert.ok(tDate.text.includes('Today is') || tDate.text.includes('2026'), 'Should return dynamic date info');

            // Turn 14: "how can I use this app while I'm working or coding?"
            const t14 = engine.parseHeuristicIntent("how can I use this app while I'm working or coding?");
            assert.ok(t14.text.includes('Click-Through') || t14.text.includes('Ignore Mouse'), 'Should give coding companion advice');

            // Turn 15: "make the sakura effect disable" (Post-topic negation)
            const t15 = engine.parseHeuristicIntent('make the sakura effect disable');
            assert.ok(t15.toolCalls.some(tc => tc.name === 'setWeather' && tc.args.sakuraRain === false), 'Should disable sakura rain');

            // Turn 16: "mute the sakura sound" (Audio vs visual separation)
            const t16 = engine.parseHeuristicIntent('mute the sakura sound');
            assert.ok(t16.toolCalls.some(tc => tc.name === 'setSoundVolume' && tc.args.sakuraVolume === 0.0), 'Should mute sakura sound');
            assert.ok(!t16.toolCalls.some(tc => tc.name === 'setWeather'), 'Should not toggle visual weather when muting sound');

            // Turn 17: "the sakura sound still there" (Follow-up complaint negation)
            const t17 = engine.parseHeuristicIntent('the sakura sound still there');
            assert.ok(t17.toolCalls.some(tc => tc.name === 'setSoundVolume' && tc.args.sakuraVolume === 0.0), 'Should mute sakura sound on complaint');

            // Turn 18: "I mean no sakura effect and sound" (Compound visual + audio negation)
            const t18 = engine.parseHeuristicIntent('I mean no sakura effect and sound');
            assert.ok(t18.toolCalls.some(tc => tc.name === 'setWeather' && tc.args.sakuraRain === false), 'Should disable sakura visual effect');
            assert.ok(t18.toolCalls.some(tc => tc.name === 'setSoundVolume' && tc.args.sakuraVolume === 0.0), 'Should mute sakura audio');

            // Turn 19: "turn on sakura sound at 30 percent" (Explicit percentage extraction)
            const t19 = engine.parseHeuristicIntent('turn on sakura sound at 30 percent');
            assert.ok(t19.toolCalls.some(tc => tc.name === 'setSoundVolume' && tc.args.sakuraVolume === 0.30), 'Should set sakura sound volume to 0.30 (30%)');

            // Turn 20: "I don't want to see sakura" (Natural language refusal)
            const t20 = engine.parseHeuristicIntent("I don't want to see sakura");
            assert.ok(t20.toolCalls.some(tc => tc.name === 'setWeather' && tc.args.sakuraRain === false), 'Should disable sakura rain on refusal');

            // Turn 21: "I don't need sakura effect" (Natural language negation)
            const t21 = engine.parseHeuristicIntent("I don't need sakura effect");
            assert.ok(t21.toolCalls.some(tc => tc.name === 'setWeather' && tc.args.sakuraRain === false), 'Should disable sakura effect');

            // Turn 22: "turrn on sakura sound for 30 percent" (Typo + for percentage)
            const t22 = engine.parseHeuristicIntent("turrn on sakura sound for 30 percent");
            assert.ok(t22.toolCalls.some(tc => tc.name === 'setSoundVolume' && tc.args.sakuraVolume === 0.30), 'Should set sakura sound to 30% with typo tolerance');

            // Turn 23: "make the character twice as big" (Relative multiplier scale)
            const t23 = engine.parseHeuristicIntent("make the character twice as big");
            assert.ok(t23.toolCalls.some(tc => tc.name === 'setModelScale'), 'Should scale up model for twice as big');

            // Turn 24: "reset all settings to default" (Comprehensive multi-domain reset)
            const t24 = engine.parseHeuristicIntent("reset all settings to default");
            assert.ok(t24.toolCalls.some(tc => tc.name === 'setModelScale' && tc.args.scale === 1.0), 'Should reset scale');
            assert.ok(t24.toolCalls.some(tc => tc.name === 'setActiveModel' && tc.args.modelName === 'procedural'), 'Should reset active model');
            assert.ok(t24.toolCalls.some(tc => tc.name === 'setWeather'), 'Should reset weather');
            assert.ok(t24.toolCalls.some(tc => tc.name === 'setSoundVolume'), 'Should reset audio volume');
            assert.ok(t24.toolCalls.some(tc => tc.name === 'setSystemSettings'), 'Should reset system settings');

            // Turn 25: "what is the current status" (Live reality query)
            const t25 = engine.parseHeuristicIntent("what is the current status");
            assert.strictEqual(t25.toolCalls.length, 0, 'Reality query should not trigger tools');

            // Turn 26: "set default mascot to be falg" (Typo tolerance & mascot switching)
            const t26 = engine.parseHeuristicIntent("set default mascot to be falg");
            assert.ok(t26.toolCalls.some(tc => tc.name === 'setActiveModel' && tc.args.modelName === 'flag'), 'Should tolerate typo falg and set flag mascot');

            // Turn 27: "scale the window to be smaller" (Window size scaling vs model scale)
            const t27 = engine.parseHeuristicIntent("scale the window to be smaller");
            assert.ok(t27.toolCalls.some(tc => tc.name === 'setWindowSize'), 'Should resize window size, not model scale');
            assert.ok(!t27.toolCalls.some(tc => tc.name === 'setModelScale'), 'Should not trigger model scale when window is specified');

            // Turn 28: "turn on dynamic battery saving" (Battery saver mode)
            const t28 = engine.parseHeuristicIntent("turn on dynamic battery saving");
            assert.ok(t28.toolCalls.some(tc => tc.name === 'setPerformanceSettings' && tc.args.dynamicBatterySaver === true), 'Should activate dynamic battery saver');

            // Turn 29: "recommended performance settings" (Balanced performance optimization)
            const t29 = engine.parseHeuristicIntent("recommended performance settings");
            assert.ok(t29.toolCalls.some(tc => tc.name === 'setPerformanceSettings'), 'Should apply performance settings');

            // Turn 30: "optimized this app" (General performance optimization)
            const t30 = engine.parseHeuristicIntent("optimized this app");
            assert.ok(t30.toolCalls.some(tc => tc.name === 'setPerformanceSettings'), 'Should optimize app performance');

            // Turn 31: "I want the best performance toggle to be enabled" (Maximum performance)
            const t31 = engine.parseHeuristicIntent("I want the best performance toggle to be enabled");
            assert.ok(t31.toolCalls.some(tc => tc.name === 'setPerformanceSettings' && tc.args.gpuOptimize === true), 'Should activate best GPU performance mode');

            // Turn 32: "I want performance over battery" (Performance priority disambiguation)
            const t32 = engine.parseHeuristicIntent("I want performance over battery");
            assert.ok(t32.toolCalls.some(tc => tc.name === 'setPerformanceSettings' && tc.args.gpuOptimize === true), 'Should choose performance over battery');

            // Turn 33: "save and refresh" (Save & Refresh game companion state)
            const t33 = engine.parseHeuristicIntent("save and refresh the game");
            assert.ok(t33.toolCalls.some(tc => tc.name === 'saveAndRefresh'), 'Should execute saveAndRefresh');

            // Turn 34: "resize window to 1000 by 500" (Explicit multi-axis dimension)
            const t34 = engine.parseHeuristicIntent("resize window to 1000 by 500");
            const wTool = t34.toolCalls.find(tc => tc.name === 'setWindowSize');
            assert.ok(wTool, 'Should match setWindowSize');
            assert.strictEqual(wTool.args.width, 1000);
            assert.strictEqual(wTool.args.height, 500);

            // Turn 35: "enlarge the app" (Relative enlargement from current dimensions)
            mockSettings.winWidth = 1000;
            mockSettings.winHeight = 500;
            const t35 = engine.parseHeuristicIntent("enlarge the app");
            const wTool2 = t35.toolCalls.find(tc => tc.name === 'setWindowSize');
            assert.ok(wTool2, 'Should match setWindowSize for enlarge the app');
            assert.ok(wTool2.args.width > 1000, 'Should enlarge width from 1000');
            assert.ok(wTool2.args.height > 500, 'Should enlarge height from 500');

            // Turn 36: "tell me about this app" (App Knowledge Tour)
            const t36 = engine.parseHeuristicIntent("tell me about this app");
            assert.strictEqual(t36.toolCalls.length, 0);
            assert.ok(t36.text.includes('Feature Overview') || t36.text.includes('3D Models'), 'Should return rich app feature overview');

            // Turn 37: "what models are there" (Model catalog)
            const t37 = engine.parseHeuristicIntent("what models are there");
            assert.strictEqual(t37.toolCalls.length, 0);
            assert.ok(t37.text.includes('Bunny') && t37.text.includes('Flag'), 'Should list procedural bunny and waving flag models');

            // Turn 38: "how to play piano" (Piano keys guide)
            const t38 = engine.parseHeuristicIntent("how to play piano");
            assert.strictEqual(t38.toolCalls.length, 0);
            assert.ok(t38.text.includes('A, S, D, F, G, H, J, K') || t38.text.includes('A-K'), 'Should return piano keyboard shortcuts');

            // Turn 39: "keyboard shortcuts" (Blender viewport navigation)
            const t39 = engine.parseHeuristicIntent("keyboard shortcuts");
            assert.strictEqual(t39.toolCalls.length, 0);
            assert.ok(t39.text.includes('MMB') || t39.text.includes('Numpad'), 'Should return Blender viewport shortcuts');

            // Turn 40: "I am feeling tired today" (Empathetic companion response)
            const t40 = engine.parseHeuristicIntent("I am feeling tired today");
            assert.strictEqual(t40.toolCalls.length, 0);
            assert.ok(t40.text.includes('breath') || t40.text.includes('breather') || t40.text.includes('peaceful'), 'Should return empathetic response');

            // Turn 41: "debugging javascript is hard" (Developer banter)
            const t41 = engine.parseHeuristicIntent("debugging javascript is hard");
            assert.strictEqual(t41.toolCalls.length, 0);
            assert.ok(t41.text.includes('developer') || t41.text.includes('bug'), 'Should return developer banter');

            // Turn 42: "write a poem" (Creative poetry)
            const t42 = engine.parseHeuristicIntent("write a poem");
            assert.strictEqual(t42.toolCalls.length, 0);
            assert.ok(t42.text.includes('Pixels') || t42.text.includes('Poem') || t42.text.includes('screen'), 'Should return a creative poem');

            // Turn 43: "tell me a story" (Engaging mini-story)
            const t43 = engine.parseHeuristicIntent("tell me a story");
            assert.strictEqual(t43.toolCalls.length, 0);
            assert.ok(t43.text.includes('Tale') || t43.text.includes('Pixel') || t43.text.includes('companion'), 'Should return a creative desktop story');

            // Turn 44: "are you real" (Companion philosophical reflection)
            const t44 = engine.parseHeuristicIntent("are you real");
            assert.strictEqual(t44.toolCalls.length, 0);
            assert.ok(t44.text.includes('geometric') || t44.text.includes('real') || t44.text.includes('digital'), 'Should return philosophical self-aware reflection');

            // Turn 45: "What is your favorite pizza topping?" (Food banter)
            const t45 = engine.parseHeuristicIntent("What is your favorite pizza topping?");
            assert.strictEqual(t45.toolCalls.length, 0);
            assert.ok(t45.text.includes('pizza') || t45.text.includes('food') || t45.text.includes('comfort') || t45.text.includes('meal') || t45.text.includes('coffee') || t45.text.includes('tea') || t45.text.includes('delicious') || t45.text.includes('eat'), 'Should return friendly food banter');

            // Turn 46: "What do you think about black holes in space?" (Space banter)
            const t46 = engine.parseHeuristicIntent("What do you think about black holes in space?");
            assert.strictEqual(t46.toolCalls.length, 0);
            assert.ok(t46.text.includes('cosmos') || t46.text.includes('space') || t46.text.includes('universe') || t46.text.includes('black holes') || t46.text.includes('stars'), 'Should return space banter');

            // Turn 47: "Flip a coin for me" (Coinflip mini-game)
            const t47 = engine.parseHeuristicIntent("Flip a coin for me");
            assert.strictEqual(t47.toolCalls.length, 0);
            assert.ok(t47.text.includes('HEADS') || t47.text.includes('TAILS'), 'Should return coin flip result');

            // Turn 48: "Roll a dice" (Dice mini-game)
            const t48 = engine.parseHeuristicIntent("Roll a dice");
            assert.strictEqual(t48.toolCalls.length, 0);
            assert.ok(t48.text.includes('Result:') || t48.text.includes('Rolling'), 'Should return dice roll result');

            // Turn 49: "I had a weird dream last night" (Open-ended friendly chat)
            const t49 = engine.parseHeuristicIntent("I had a weird dream last night");
            assert.strictEqual(t49.toolCalls.length, 0);
            assert.ok(t49.text.length > 20, 'Should return natural friendly conversation');

            // Turn 51: "can you turn off something that could be annoying" (Proactive Annoyance Audit)
            mockSettings.soundMuted = false;
            mockSettings.soundMasterVolume = 0.8;
            mockSettings.spinY = true;
            mockSettings.enablePhysics = true;
            const t51 = engine.parseHeuristicIntent("can you turn off something that could be annoying");
            assert.strictEqual(t51.toolCalls.length, 0, 'Audit turn should NOT execute tools immediately without confirmation');
            assert.ok(t51.text.includes('distracting') || t51.text.includes('annoying') || t51.text.includes('Inspection complete'), 'Should report annoyance inspection findings');
            assert.ok(engine.pendingProposal !== null, 'Should store pending proposal waiting for user confirmation');

            // Turn 52: "yes please" (User confirms the proposal)
            const t52 = engine.parseHeuristicIntent("yes please");
            assert.ok(t52.toolCalls.length >= 2, 'Confirmation turn should execute all proposed tool calls');
            assert.ok(t52.toolCalls.some(tc => tc.name === 'setSoundVolume' && tc.args.muted === true), 'Should mute audio on confirmation');
            assert.ok(t52.toolCalls.some(tc => tc.name === 'setSpinRotation'), 'Should stop spin on confirmation');
            assert.ok(t52.toolCalls.some(tc => tc.name === 'setPhysics' && tc.args.enabled === false), 'Should disable physics on confirmation');
            assert.strictEqual(engine.pendingProposal, null, 'Should clear pending proposal after execution');

            // Turn 53: Proactive audit + User rejection ("nevermind")
            engine.parseHeuristicIntent("check out what is annoying");
            assert.ok(engine.pendingProposal !== null, 'Should store pending proposal');
            const t53 = engine.parseHeuristicIntent("nevermind");
            assert.strictEqual(t53.toolCalls.length, 0, 'Rejection should not execute tools');
            assert.strictEqual(engine.pendingProposal, null, 'Should clear proposal on cancel');

            // AppContextRetriever RAG Knowledge Unit Tests
            import('../src/core/director/AppContextRetriever.js').then(({ AppContextRetriever }) => {
              const flagContext = AppContextRetriever.retrieveContext('switch to waving flag with cyber preset');
              assert.ok(flagContext.includes('Flag Cloth Physics'), 'RAG should retrieve flag cloth topic for flag prompt');

              const saveContext = AppContextRetriever.retrieveContext('save and refresh');
              assert.ok(saveContext.includes('Save & Refresh'), 'RAG should retrieve save & refresh topic');

              const batteryContext = AppContextRetriever.retrieveContext('turn on dynamic battery saving');
              assert.ok(batteryContext.includes('Performance Optimization'), 'RAG should retrieve performance topic for battery prompt');

              const pianoContext = AppContextRetriever.retrieveContext('play acoustic piano notes');
              assert.ok(pianoContext.includes('Web Audio Synthesizer'), 'RAG should retrieve audio synthesizer topic for piano prompt');

              engine.processUserMessage('scale up a bit and turn off sakura').then(() => {
                const report = engine.getFormattedReport();
                assert.ok(report.includes('# 🤖 AI Director Diagnostic Log Report'), 'Report should have markdown header');
                assert.ok(report.includes('scale up a bit and turn off sakura'), 'Report should record user input');
                assert.ok(report.includes('Real-Time State Delta'), 'Report should contain Real-Time State Delta section');
                assert.ok(report.includes('Subsystem Status Overview'), 'Report should contain Subsystem Status Overview table');
                assert.ok(engine.diagnosticLogs.length > 0, 'Diagnostic logs should contain recorded turns');

                // Developer Tools Telemetry & Analytics Suite Tests
                const traces = engine.getTelemetryTraces();
                assert.ok(Array.isArray(traces) && traces.length > 0, 'getTelemetryTraces should return non-empty array');
                const lastTrace = traces[traces.length - 1];
                assert.ok(typeof lastTrace.latencyMs === 'number', 'Telemetry trace should contain latencyMs');
                assert.ok(Array.isArray(lastTrace.domainsImpacted), 'Telemetry trace should contain domainsImpacted array');
                assert.ok(lastTrace.domainsImpacted.includes('display') || lastTrace.domainsImpacted.includes('atmosphere'), 'Should tag impacted domains');

                // Test JSON Export
                const exportedJson = engine.exportTelemetryJSON();
                const parsed = JSON.parse(exportedJson);
                assert.strictEqual(parsed.schemaVersion, '1.0', 'Exported JSON should have schemaVersion 1.0');
                assert.strictEqual(parsed.traces.length, traces.length, 'Exported JSON should preserve traces count');

                // Test Telemetry Listener & Dataset Plug-Back
                let listenerNotified = false;
                engine.addTelemetryListener((evt) => {
                  if (evt.type === 'load') listenerNotified = true;
                });
                const loadResult = engine.loadTelemetryDataset([{ id: 999, userInput: 'test replay', engineMode: 'test', latencyMs: 15, domainsImpacted: ['display'], assistantResponse: 'ok', executedActions: [] }]);
                assert.strictEqual(loadResult, true, 'loadTelemetryDataset should return true for valid dataset');
                assert.strictEqual(listenerNotified, true, 'Telemetry listener should be notified of dataset load');
                assert.strictEqual(engine.getTelemetryTraces().length, 1, 'Loaded dataset should be set active');

                // Test AssetRegistryManager Ingestion & 3D Model Scanning
                console.log('▶ Testing AssetRegistryManager 3D Ingestion & SceneStageManager Scanning...');
                const registry = new AssetRegistryManager();
                const glbMeta = registry.detectFileType({ name: 'robot.glb' });
                assert.strictEqual(glbMeta.type, 'model', 'GLB file must be model type');
                assert.strictEqual(glbMeta.category, '3D Model', 'GLB category must be 3D Model');

                const gltfMeta = registry.detectFileType({ name: 'character.gltf' });
                assert.strictEqual(gltfMeta.type, 'model', 'GLTF file must be model type');

                const gifMeta = registry.detectFileType({ name: 'pattern.gif' });
                assert.strictEqual(gifMeta.type, 'texture', 'GIF file must be categorized as texture type');
                assert.strictEqual(gifMeta.category, 'Texture', 'GIF category must be Texture');

                const pngMeta = registry.detectFileType({ name: 'skin.png' });
                assert.strictEqual(pngMeta.type, 'texture', 'PNG file must be texture type');

                const midMeta = registry.detectFileType({ name: 'bach.mid' });
                assert.strictEqual(midMeta.type, 'score', 'MID file must be score type');

                // Test SceneStageManager 3D model discovery
                const mockFs = {
                  existsSync: (p) => true,
                  readdirSync: (p) => ['fox.glb', 'dance.gltf', 'texture.png', 'cat.gif', 'readme.txt', 'song.mp3']
                };
                const stageMgr = new SceneStageManager({
                  fs: mockFs,
                  getAssetsPath: () => '/mock/assets'
                });
                const discovered = stageMgr.scanForModels();
                assert.deepStrictEqual(discovered, ['fox.glb', 'dance.gltf'], 'scanForModels must discover only 3D .glb and .gltf files');
                console.log('✅ AssetRegistryManager & SceneStageManager 3D Model tests PASSED.');

                // Test HumanoidMascotBuilder & Procedural Humanoid Rig
                console.log('▶ Testing HumanoidMascotBuilder procedural 3D humanoid & skeletal animations...');
                import('../src/core/HumanoidMascotBuilder.js').then(({ createProceduralHumanoid }) => {
                  const mockTHREE = {
                    Group: class { constructor() { this.children = []; this.position = { set: () => {}, x: 0, y: 0, z: 0 }; this.rotation = { set: () => {}, x: 0, y: 0, z: 0 }; this.scale = { set: () => {} }; this.userData = {}; } add(c) { this.children.push(c); } },
                    Mesh: class { constructor(g, m) { this.geom = g; this.mat = m; this.position = { set: () => {}, x: 0, y: 0, z: 0 }; this.rotation = { set: () => {}, x: 0, y: 0, z: 0 }; this.scale = { set: () => {} }; this.userData = {}; } },
                    BoxGeometry: class { constructor() {} translate() {} rotateX() {} rotateY() {} rotateZ() {} },
                    CylinderGeometry: class { constructor() {} translate() {} rotateX() {} rotateY() {} rotateZ() {} },
                    SphereGeometry: class { constructor() {} translate() {} rotateX() {} rotateY() {} rotateZ() {} },
                    MeshPhysicalMaterial: class { constructor(opts) { Object.assign(this, opts); } },
                    MeshStandardMaterial: class { constructor(opts) { Object.assign(this, opts); } },
                    MeshBasicMaterial: class { constructor(opts) { Object.assign(this, opts); } }
                  };
                  const mockScene = new mockTHREE.Group();
                  const humanoidResult = createProceduralHumanoid(mockTHREE, mockScene);
                  assert.ok(humanoidResult !== null, 'createProceduralHumanoid must return controller');
                  assert.ok(humanoidResult.joints !== null, 'Humanoid must create joint hierarchy');
                  assert.ok(humanoidResult.joints.head !== null, 'Humanoid must contain head node');
                  assert.ok(humanoidResult.joints.torso !== null, 'Humanoid must contain torso node');
                  assert.ok(humanoidResult.joints.leftArm !== null, 'Humanoid must contain leftArm node');
                  assert.ok(humanoidResult.joints.rightArm !== null, 'Humanoid must contain rightArm node');
                  assert.deepStrictEqual(humanoidResult.availableAnimations, ['Idle', 'Wave', 'Dance', 'Look_Around'], 'Humanoid must declare 4 animations');
                  
                  // Test animation updates across all clips
                  humanoidResult.updateAnimation(1.0, 'idle');
                  humanoidResult.updateAnimation(1.5, 'wave');
                  humanoidResult.updateAnimation(2.0, 'dance');
                  humanoidResult.updateAnimation(2.5, 'look_around');
                  humanoidResult.resetJoints();
                  console.log('✅ HumanoidMascotBuilder & skeletal animation tests PASSED.');
                });

                // Test ScreenVisionService (Multimodal Vision payload & fallback)
                import('../src/services/ScreenVisionService.js').then(({ ScreenVisionService }) => {
                  console.log('▶ Testing ScreenVisionService local multimodal vision engine...');
                  const sanitized = ScreenVisionService.sanitizeBase64('data:image/jpeg;base64,abc123XYZ==');
                  assert.strictEqual(sanitized, 'abc123XYZ==', 'Sanitizer must strip data URI prefix');

                  const payload = ScreenVisionService.createVisionPayload({
                    model: 'llama3.2-vision',
                    detail: 'more',
                    prompt: 'What game is this?',
                    base64Image: 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
                    stream: true
                  });
                  assert.strictEqual(payload.model, 'llama3.2-vision', 'Payload model must be llama3.2-vision');
                  assert.strictEqual(payload.prompt, 'What game is this?', 'Payload prompt must match');
                  assert.strictEqual(payload.stream, true, 'Stream must be true');
                  assert.strictEqual(payload.images.length, 1, 'Payload must contain 1 base64 image');
                  assert.strictEqual(payload.options.num_predict, 260, 'More detail preset should allocate 260 tokens');

                  const payloadFew = ScreenVisionService.createVisionPayload({ detail: 'few', base64Image: 'abc' });
                  assert.strictEqual(payloadFew.options.num_predict, 50, 'Few detail preset should allocate 50 tokens');

                  const service = new ScreenVisionService();
                  const fallback = service.generateFallbackVisionAnalysis(1280, 720, 'llama3.2-vision', 'Connection refused');
                  assert(fallback.startsWith('Output:'), 'Fallback must start with Output: prefix');
                  assert(fallback.includes('1280x720'), 'Fallback must mention resolution');

                  console.log('✅ ScreenVisionService multimodal vision tests PASSED.');

                  // Test VisionCaptionSynthesizerService (Vision -> LLM Caption Synthesizer)
                  import('../src/services/VisionCaptionSynthesizerService.js').then(async ({ VisionCaptionSynthesizerService, SYNTH_STYLE_PERSONAS, convertToTraditionalChinese }) => {
                    console.log('▶ Testing VisionCaptionSynthesizerService native multilingual variables, 11 personas & S2T converter...');
                    assert(SYNTH_STYLE_PERSONAS.streamer, 'Must define streamer persona');
                    assert(SYNTH_STYLE_PERSONAS.tw_streamer, 'Must define tw_streamer persona');
                    assert(SYNTH_STYLE_PERSONAS.roast, 'Must define roast/meme persona');
                    assert(SYNTH_STYLE_PERSONAS.coach, 'Must define coach persona');
                    assert(SYNTH_STYLE_PERSONAS.funny, 'Must define funny/comedy persona');
                    assert(SYNTH_STYLE_PERSONAS.serious, 'Must define serious/analytical persona');
                    assert(SYNTH_STYLE_PERSONAS.gamer, 'Must define gamer persona');
                    assert(SYNTH_STYLE_PERSONAS.poetic, 'Must define poetic persona');
                    assert(SYNTH_STYLE_PERSONAS.mascot, 'Must define mascot persona');
                    assert(SYNTH_STYLE_PERSONAS.narrator, 'Must define narrator persona');
                    assert(SYNTH_STYLE_PERSONAS.action, 'Must define action persona');

                    // Test Native System Prompt Generation
                    const zhTWPrompt = VisionCaptionSynthesizerService.buildNativeSystemPrompt('tw_streamer', 'zh-TW', 3);
                    assert(zhTWPrompt.includes('實況'), 'Traditional Chinese prompt must use native Traditional terminology');
                    assert(zhTWPrompt.includes('繁體中文'), 'Traditional Chinese prompt must enforce Traditional Chinese');

                    const zhPrompt = VisionCaptionSynthesizerService.buildNativeSystemPrompt('streamer', 'zh', 4);
                    assert(zhPrompt.includes('实况'), 'Simplified Chinese prompt must use Simplified terminology');
                    assert(zhPrompt.includes('恰好 4'), 'Simplified Chinese prompt must scale count');

                    // Test S2T Glyph Normalizer
                    const simplifiedSample = '这个点发出动静，走位非常到位，破盾击杀！';
                    const traditionalResult = convertToTraditionalChinese(simplifiedSample);
                    assert.strictEqual(traditionalResult, '這個點發出動靜，走位非常到位，破盾擊殺！', 'Must correctly convert simplified characters to traditional');

                    const rawText = '1. First energetic subtitle!\n2. Second atmospheric sentence.\n- Third clean line.\n4. Fourth funny joke.';
                    const parsed = VisionCaptionSynthesizerService.parseCaptionOutput(rawText, 'zh-TW');
                    assert.strictEqual(parsed.length, 4, 'Must parse 4 clean lines without numbers');
                    assert.strictEqual(parsed[0], 'First energetic subtitle!');
                    assert.strictEqual(parsed[1], 'Second atmospheric sentence.');
                    assert.strictEqual(parsed[2], 'Third clean line.');
                    assert.strictEqual(parsed[3], 'Fourth funny joke.');

                    console.log('✅ VisionCaptionSynthesizerService unit tests PASSED.');

                    // Test LiveAudienceAIService (Multi-Persona AI Live Stream Audience Engine)
                    import('../src/services/LiveAudienceAIService.js').then(async ({ LiveAudienceAIService }) => {
                    console.log('▶ Testing LiveAudienceAIService multi-persona AI audience cascades & drip delivery...');
                    const audienceService = new LiveAudienceAIService();

                    // 1. Test System Prompt Schema, Persona Scaling & Primary Language
                    const enPrompt = LiveAudienceAIService.getSystemPrompt(8, 'en');
                    assert(enPrompt.includes('Twitch'), 'English system prompt must mention streaming platforms');
                    assert(enPrompt.includes('EXACTLY 8'), 'English system prompt must scale to requested count');

                    const zhPrompt = LiveAudienceAIService.getSystemPrompt(8, 'zh');
                    assert(zhPrompt.includes('直播间'), 'Chinese system prompt must use native Chinese instructions');
                    assert(zhPrompt.includes('恰好 8'), 'Chinese system prompt must scale to requested count');

                    const zhSuffix = LiveAudienceAIService.getPromptLanguageSuffix('zh');
                    assert(zhSuffix.includes('简体中文'), 'Chinese prompt suffix must enforce Chinese output');

                    // 2. Test JSON Parser with markdown fences and dirty formatting
                    const dirtyJSON = '```json\n[{"user":"@HypeKing","badge":"💎 SUB","color":"#38bdf8","msg":"W play!"},{"user":"@Troll99","badge":"⚡ PRO","color":"#f43f5e","msg":"LMAO dead"}]\n```';
                    const parsed = audienceService._parseJSONResponse(dirtyJSON);
                    assert.strictEqual(parsed.length, 2, 'Must parse 2 JSON message objects');
                    assert.strictEqual(parsed[0].user, '@HypeKing', 'Parsed user must match');
                    assert.strictEqual(parsed[0].badge, '💎 SUB', 'Parsed badge must match');
                    assert.strictEqual(parsed[1].msg, 'LMAO dead', 'Parsed msg must match');

                    // 3. Test Heuristic Fallback Cascade with 10 Distinct Narrative Archetypes (English & Chinese)
                    const tenPersonas = audienceService.generateFallbackCascade('We finally won and beat the boss!', '', 10);
                    assert.strictEqual(tenPersonas.length, 10, 'Must produce exactly 10 distinct narrative persona messages');
                    assert(tenPersonas.some(m => m.user.startsWith('@MetaBuilder')), 'Must include Tactical Strategist persona');
                    assert(tenPersonas.some(m => m.user.startsWith('@DevilAdvocate')), 'Must include Contrarian/Critic persona');
                    assert(tenPersonas.some(m => m.user === '@Sarah_Mod'), 'Must include Moderator persona');
                    assert(tenPersonas.some(m => m.user === '@LoreScholar'), 'Must include Lore Analyst persona');
                    assert(tenPersonas.some(m => m.user === '@FrameDataDan'), 'Must include Speedrun/FrameData persona');
                    assert(tenPersonas.some(m => m.user === '@PatronPledge'), 'Must include Patron persona');
                    assert(tenPersonas.some(m => m.user === '@MetaphorChef'), 'Must include Metaphor/Meme persona');
                    assert(tenPersonas.some(m => m.user.startsWith('@CuriousMind')), 'Must include Curious Inquirer persona');
                    assert(tenPersonas.some(m => m.user === '@OldSchoolGamer'), 'Must include Veteran persona');
                    assert(tenPersonas.some(m => m.user === '@EagleEye'), 'Must include Background Detective persona');

                    const zhPersonas = audienceService.generateFallbackCascade('通关成功', '', 5, 'zh');
                    assert.strictEqual(zhPersonas.length, 5, 'Must produce exactly 5 Chinese persona messages');
                    assert(zhPersonas.some(m => m.user.includes('战术大师') || m.user.includes('战术分析师')), 'Must include Chinese tactical persona');

                    // 4. Test Single Persona Scaling (count = 1)
                    const singlePersona = audienceService.generateFallbackCascade('Hello chat', '', 1);
                    assert.strictEqual(singlePersona.length, 1, 'Must scale down to exactly 1 persona');

                    // 5. Test Live Audience Cascade Execution & Drip delivery
                    let receivedDripMessages = [];
                    await audienceService.generateAudienceCascade({
                      hostMessage: 'GG guys we clutched the match',
                      speed: 'fast',
                      personaCount: 5,
                      onMessage: (msgObj) => {
                        receivedDripMessages.push(msgObj);
                      }
                    });

                    assert(receivedDripMessages.length === 0, 'Initial count before timer resolution should be 0');
                    // Wait for fast drip delivery
                    await new Promise(r => setTimeout(r, 600));
                    assert(receivedDripMessages.length > 0, 'Drip queue must start delivering staggered messages');
                    audienceService.clearPendingDrips();

                    console.log('✅ LiveAudienceAIService multi-persona AI live chat tests PASSED.');
                    console.log('✅ LLMDirectorEngine, ToolRegistry, AppContextRetriever & DevTools Telemetry unit tests PASSED.');
                    console.log('\n🎉 ALL UNIT TEST SUITES PASSED CLEANLY (100% SUCCESS)');
                  });
                });
              });
            });
          });
        });
      });
    });



