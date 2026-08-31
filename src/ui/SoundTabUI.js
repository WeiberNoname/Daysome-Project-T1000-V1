/**
 * Sound Tab UI Controller & Visual Synchronizer
 * Handles real-time playback toggles, slider volume syncing, active card selection,
 * and unified ambient synthesizer coordination (Snow Wind, Sakura Melody, Lo-Fi Drum).
 */

import { soundManager } from '../core/SoundManager.js';
import { eventBus } from '../managers/EventBus.js';

export function setupSoundTabUI(deps) {
  const { currentSettings, saveSettingsFile, t } = deps;

  // Master Elements
  const masterEnableCheck = document.getElementById('sound-master-enable');
  const masterVolSlider = document.getElementById('sound-master-vol');
  const valMasterVol = document.getElementById('val-sound-master-vol');

  // Synthesizer Cards
  const instrumentGrid = document.getElementById('instrument-select-grid');
  const snowCard = document.getElementById('sound-card-snow');
  const sakuraCard = document.getElementById('sound-card-sakura');
  const drumCard = document.getElementById('sound-card-drum');

  // Shared Reusable Synth Track Controls
  const soundEditorTitle = document.getElementById('sound-editor-title');
  const btnActivePlay = document.getElementById('btn-sound-active-play');
  const activeVolSlider = document.getElementById('sound-active-vol');

  let selectedSynthTrack = ['snow', 'sakura', 'drum'].includes(currentSettings.activeInstrument)
    ? currentSettings.activeInstrument
    : 'snow';

  // Master Initial Sync
  if (masterEnableCheck) {
    const isMuted = currentSettings.soundMuted === true;
    masterEnableCheck.checked = !isMuted;
    soundManager.setMuted(isMuted);
  }

  if (masterVolSlider) {
    const vol = currentSettings.soundMasterVolume !== undefined ? currentSettings.soundMasterVolume : 0.8;
    masterVolSlider.value = vol;
    if (valMasterVol) valMasterVol.innerText = Math.round(vol * 100) + '%';
    soundManager.setMasterVolume(vol);
  }

  // Highlight Active Synthesizer Card
  const highlightSynthCard = (inst) => {
    if (!instrumentGrid) return;
    instrumentGrid.querySelectorAll('.instrument-card').forEach(c => {
      c.classList.toggle('selected', c.getAttribute('data-instrument') === inst);
    });
  };

  // Sync Shared Synth Editor
  const syncSharedEditor = () => {
    const isSnow = selectedSynthTrack === 'snow';
    const isSakura = selectedSynthTrack === 'sakura';
    const isDrum = selectedSynthTrack === 'drum';

    if (soundEditorTitle) {
      if (isSnow) soundEditorTitle.textContent = '❄️ Selected Synth: Snow Wind';
      else if (isSakura) soundEditorTitle.textContent = '🌸 Selected Synth: Sakura Melody';
      else if (isDrum) soundEditorTitle.textContent = '🥁 Selected Synth: Lo-Fi Drum';
    }

    if (activeVolSlider) {
      if (isSnow) activeVolSlider.value = currentSettings.soundSnowVolume !== undefined ? currentSettings.soundSnowVolume : 0.7;
      else if (isSakura) activeVolSlider.value = currentSettings.soundSakuraVolume !== undefined ? currentSettings.soundSakuraVolume : 0.7;
      else if (isDrum) activeVolSlider.value = currentSettings.soundDrumVolume !== undefined ? currentSettings.soundDrumVolume : 0.7;
    }

    updatePlayButtonState();
  };

  const updatePlayButtonState = () => {
    if (!btnActivePlay) return;
    const playText = t ? t('sound_play', '▶ Play') : '▶ Play';
    const stopText = t ? t('sound_stop', '⏹ Stop') : '⏹ Stop';

    const snap = soundManager.getSnapshot ? soundManager.getSnapshot() : {};
    let isPlaying = false;
    if (selectedSynthTrack === 'snow') isPlaying = !!snap.snowPlaying;
    else if (selectedSynthTrack === 'sakura') isPlaying = !!snap.sakuraPlaying;
    else if (selectedSynthTrack === 'drum') isPlaying = !!snap.drumPlaying;

    btnActivePlay.innerText = isPlaying ? stopText : playText;
    btnActivePlay.className = isPlaying ? 'studio-btn-danger' : 'studio-btn-primary';
  };

  // Switch Active Synthesizer
  const selectSynthTrack = (track) => {
    selectedSynthTrack = track;
    currentSettings.activeInstrument = track;
    if (saveSettingsFile) saveSettingsFile();
    highlightSynthCard(track);
    syncSharedEditor();
    eventBus.emit('instrument:selected', track);
  };

  if (snowCard) snowCard.addEventListener('click', () => selectSynthTrack('snow'));
  if (sakuraCard) sakuraCard.addEventListener('click', () => selectSynthTrack('sakura'));
  if (drumCard) drumCard.addEventListener('click', () => selectSynthTrack('drum'));

  eventBus.on('instrument:selected', (inst) => {
    if (['snow', 'sakura', 'drum'].includes(inst)) {
      selectedSynthTrack = inst;
      highlightSynthCard(inst);
      syncSharedEditor();
    }
  });

  // Reusable Play Button
  if (btnActivePlay) {
    btnActivePlay.addEventListener('click', () => {
      if (selectedSynthTrack === 'snow') soundManager.toggleSnow();
      else if (selectedSynthTrack === 'sakura') soundManager.toggleSakura();
      else if (selectedSynthTrack === 'drum') soundManager.toggleDrum();
      updatePlayButtonState();
    });
  }

  // Reusable Volume Slider
  if (activeVolSlider) {
    activeVolSlider.addEventListener('input', () => {
      const vol = parseFloat(activeVolSlider.value);
      if (selectedSynthTrack === 'snow') {
        currentSettings.soundSnowVolume = vol;
        soundManager.setTrackVolume('snow', vol);
      } else if (selectedSynthTrack === 'sakura') {
        currentSettings.soundSakuraVolume = vol;
        soundManager.setTrackVolume('sakura', vol);
      } else if (selectedSynthTrack === 'drum') {
        currentSettings.soundDrumVolume = vol;
        soundManager.setTrackVolume('drum', vol);
      }
    });
    activeVolSlider.addEventListener('change', () => {
      if (saveSettingsFile) saveSettingsFile();
    });
  }

  // Master Audio Toggle
  if (masterEnableCheck) {
    masterEnableCheck.addEventListener('change', () => {
      const enabled = masterEnableCheck.checked;
      currentSettings.soundMuted = !enabled;
      soundManager.setMuted(!enabled);
      soundManager.syncAtmosphere(currentSettings);
      if (saveSettingsFile) saveSettingsFile();
    });
  }

  // Master Volume Slider
  if (masterVolSlider) {
    masterVolSlider.addEventListener('input', () => {
      const vol = parseFloat(masterVolSlider.value);
      if (valMasterVol) valMasterVol.innerText = Math.round(vol * 100) + '%';
      currentSettings.soundMasterVolume = vol;
      soundManager.setMasterVolume(vol);
    });
    masterVolSlider.addEventListener('change', () => {
      if (saveSettingsFile) saveSettingsFile();
    });
  }

  // UI State Updater from Sound Engine
  const updateUIFromSoundState = (snapshot) => {
    updatePlayButtonState();

    const subSnow = document.getElementById('sub-sound-snow');
    const badgeSnow = document.getElementById('badge-sound-snow');
    if (subSnow) subSnow.textContent = snapshot.snowPlaying ? '🟢 Playing' : 'Winter Ambience';
    if (badgeSnow) badgeSnow.textContent = snapshot.snowPlaying ? 'PLAYING' : '.SYNTH';

    const subSakura = document.getElementById('sub-sound-sakura');
    const badgeSakura = document.getElementById('badge-sound-sakura');
    if (subSakura) subSakura.textContent = snapshot.sakuraPlaying ? '🟢 Playing' : 'Spring Bells';
    if (badgeSakura) badgeSakura.textContent = snapshot.sakuraPlaying ? 'PLAYING' : '.SYNTH';

    const subDrum = document.getElementById('sub-sound-drum');
    const badgeDrum = document.getElementById('badge-sound-drum');
    if (subDrum) subDrum.textContent = snapshot.drumPlaying ? '🟢 Playing' : 'Rhythm Beat';
    if (badgeDrum) badgeDrum.textContent = snapshot.drumPlaying ? 'PLAYING' : '.SYNTH';
  };

  soundManager.onStateChange(updateUIFromSoundState);
  soundManager.syncAtmosphere(currentSettings);
  highlightSynthCard(selectedSynthTrack);
  syncSharedEditor();
}
