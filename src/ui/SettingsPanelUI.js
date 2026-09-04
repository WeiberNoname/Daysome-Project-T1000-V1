import { formatHumanLabel } from './uiUtils.js';

export function populateAnimationDropdown({ animSelect, modelSelect, availableAnimations, currentSettings }) {
  const container = document.getElementById('anim-select-container');
  if (!animSelect) return;

  const currentModel = modelSelect ? modelSelect.value : currentSettings.activeModel;

  if (currentModel === 'procedural') {
    animSelect.innerHTML = '<option value="none">Procedural (Default Loop)</option>';
    animSelect.disabled = true;
    if (container) container.style.opacity = '0.5';
    return;
  }



  let clips = availableAnimations || [];
  if (currentModel === 'humanoid') {
    clips = ['Idle', 'Wave', 'Dance', 'Look_Around'];
  }

  if (clips.length === 0) {
    animSelect.innerHTML = '<option value="none">No Animation Clips Found</option>';
    animSelect.disabled = true;
    if (container) container.style.opacity = '0.6';
    return;
  }

  animSelect.disabled = false;
  if (container) container.style.opacity = '1.0';
  animSelect.innerHTML = (currentModel === 'humanoid') ? '' : '<option value="none">None (Static Pose)</option>';

  clips.forEach((clipName, idx) => {
    const option = document.createElement('option');
    const val = clipName || String(idx);
    option.value = val;
    const humanName = formatHumanLabel(clipName);
    option.textContent = clipName ? `${idx + 1}. ${humanName || clipName}` : `Animation ${idx + 1}`;
    animSelect.appendChild(option);
  });

  if (currentModel === 'humanoid') {
    if (!currentSettings.activeAnimation || currentSettings.activeAnimation === 'none' || currentSettings.activeAnimation === 'default') {
      currentSettings.activeAnimation = 'Idle';
    }
    animSelect.value = currentSettings.activeAnimation;
  } else {
    if (currentSettings.activeAnimation === 'none') {
      animSelect.value = 'none';
    } else if (!currentSettings.activeAnimation || currentSettings.activeAnimation === 'default') {
      animSelect.value = clips[0] || 'none';
    } else {
      const exists = Array.from(animSelect.options).some(opt => opt.value === currentSettings.activeAnimation);
      animSelect.value = exists ? currentSettings.activeAnimation : (clips[0] || 'none');
    }
  }
}

export function syncSlidersUI(deps) {
  const {
    currentSettings,
    langSelect,
    widthSlider,
    heightSlider,
    scaleSlider,
    bobbingCheck,
    spinXCheck,
    spinYCheck,
    spinZCheck,
    speedXSlider,
    speedYSlider,
    speedZSlider,
    targetFpsSlider,
    numTargetFps,
    gpuOptimizeCheck,
    gpuLowPowerCheck,
    idleFpsSaverCheck,
    mouseOptimizeCheck,
    settingsLeftCheck,
    lockPositionCheck,
    viewOnlyCheck,
    enablePhysicsCheck,
    physicsFloorCheck,
    physicsGravitySlider,
    physicsElasticitySlider,
    modelSelect,
    valWidth,
    valHeight,
    valScale,
    valSpeedX,
    valSpeedY,
    valSpeedZ,
    valTargetFps,
    valPhysicsGravity,
    valPhysicsElasticity,
    fontScaleSlider,
    valFontScale,
    panel,
    updateXYZVisibility,
    populateAnimationDropdown,
    updateStageLighting
  } = deps;

  if (langSelect) langSelect.value = currentSettings.language || 'en';
  if (widthSlider) widthSlider.value = currentSettings.width;
  if (heightSlider) heightSlider.value = currentSettings.height;
  if (scaleSlider) scaleSlider.value = currentSettings.scale;
  if (bobbingCheck) bobbingCheck.checked = currentSettings.bobbing;

  if (spinXCheck) spinXCheck.checked = currentSettings.spinX;
  if (spinYCheck) spinYCheck.checked = currentSettings.spinY;
  if (spinZCheck) spinZCheck.checked = currentSettings.spinZ;

  if (speedXSlider) speedXSlider.value = currentSettings.speedX;
  if (speedYSlider) speedYSlider.value = currentSettings.speedY;
  if (speedZSlider) speedZSlider.value = currentSettings.speedZ;

  const targetFpsVal = currentSettings.targetFps || 60;
  if (targetFpsSlider) targetFpsSlider.value = targetFpsVal;
  if (numTargetFps) numTargetFps.value = targetFpsVal;
  if (valTargetFps) valTargetFps.innerText = targetFpsVal;

  if (gpuOptimizeCheck) gpuOptimizeCheck.checked = currentSettings.gpuOptimize;
  const gpuLowPowerDom = gpuLowPowerCheck || document.getElementById('gpu-low-power');
  const idleFpsSaverDom = idleFpsSaverCheck || document.getElementById('idle-fps-saver');
  const dynamicBatterySaverDom = deps.dynamicBatterySaverCheck || document.getElementById('dynamic-battery-saver');
  if (gpuLowPowerDom) gpuLowPowerDom.checked = !!currentSettings.gpuLowPower;
  if (idleFpsSaverDom) idleFpsSaverDom.checked = !!currentSettings.idleFpsSaver;
  if (dynamicBatterySaverDom) dynamicBatterySaverDom.checked = !!currentSettings.dynamicBatterySaver;
  if (mouseOptimizeCheck) mouseOptimizeCheck.checked = currentSettings.mouseOptimize;
  if (settingsLeftCheck) settingsLeftCheck.checked = currentSettings.settingsLeft;
  if (lockPositionCheck) lockPositionCheck.checked = currentSettings.lockPosition;
  if (viewOnlyCheck) viewOnlyCheck.checked = currentSettings.viewOnly;
  if (enablePhysicsCheck) enablePhysicsCheck.checked = currentSettings.enablePhysics;
  if (physicsFloorCheck) physicsFloorCheck.checked = currentSettings.physicsFloor;
  if (physicsGravitySlider) physicsGravitySlider.value = currentSettings.physicsGravity;
  if (physicsElasticitySlider) physicsElasticitySlider.value = currentSettings.physicsElasticity;

  const showXYZCheck = document.getElementById('show-xyz-coords');
  const showGridCheck = document.getElementById('show-ground-grid');
  const enableFpsCheck = document.getElementById('enable-fps-mode');
  if (showXYZCheck) showXYZCheck.checked = !!currentSettings.showXYZCoords;
  if (showGridCheck) showGridCheck.checked = !!currentSettings.showGroundGrid;
  if (enableFpsCheck) enableFpsCheck.checked = !!currentSettings.enableFPSMode;

  if (updateXYZVisibility) updateXYZVisibility();
  if (modelSelect) modelSelect.value = currentSettings.activeModel;
  if (populateAnimationDropdown) populateAnimationDropdown();

  if (valWidth) valWidth.innerText = currentSettings.width;
  if (valHeight) valHeight.innerText = currentSettings.height;
  if (valScale) valScale.innerText = currentSettings.scale.toFixed(2);

  if (valSpeedX) valSpeedX.innerText = currentSettings.speedX.toFixed(1);
  if (valSpeedY) valSpeedY.innerText = currentSettings.speedY.toFixed(1);
  if (valSpeedZ) valSpeedZ.innerText = currentSettings.speedZ.toFixed(1);

  if (valPhysicsGravity && physicsGravitySlider) valPhysicsGravity.innerText = parseFloat(physicsGravitySlider.value).toFixed(1);
  if (valPhysicsElasticity && physicsElasticitySlider) valPhysicsElasticity.innerText = parseFloat(physicsElasticitySlider.value).toFixed(2);

  if (fontScaleSlider) {
    fontScaleSlider.value = currentSettings.fontSizeScale;
    if (valFontScale) valFontScale.innerText = currentSettings.fontSizeScale.toFixed(2);
  }
  if (panel) panel.style.setProperty('--panel-font-scale', currentSettings.fontSizeScale);

  // Vision-to-LLM Caption Synthesizer Sync
  const synthVisionModelDom = document.getElementById('beta-synth-vision-model');
  if (synthVisionModelDom && currentSettings.synthVisionModel) synthVisionModelDom.value = currentSettings.synthVisionModel;
  const synthVisionDetailDom = document.getElementById('beta-synth-vision-detail');
  if (synthVisionDetailDom && currentSettings.synthVisionDetail) synthVisionDetailDom.value = currentSettings.synthVisionDetail;
  const synthTextModelDom = document.getElementById('beta-synth-text-model');
  if (synthTextModelDom && currentSettings.synthTextModel) synthTextModelDom.value = currentSettings.synthTextModel;
  const synthCountDom = document.getElementById('beta-synth-count');
  if (synthCountDom && currentSettings.synthCaptionCount) synthCountDom.value = currentSettings.synthCaptionCount.toString();
  const synthStyleDom = document.getElementById('beta-synth-style');
  if (synthStyleDom && currentSettings.synthStyle) synthStyleDom.value = currentSettings.synthStyle;
  const synthPacingDom = document.getElementById('beta-synth-pacing');
  if (synthPacingDom && currentSettings.synthCaptionPacing) synthPacingDom.value = currentSettings.synthCaptionPacing.toFixed(1);
  const synthLangDom = document.getElementById('beta-synth-language');
  if (synthLangDom && currentSettings.synthLanguage) synthLangDom.value = currentSettings.synthLanguage;
  const synthAutoLoopDom = document.getElementById('beta-synth-auto-loop');
  if (synthAutoLoopDom) synthAutoLoopDom.checked = !!currentSettings.synthAutoLoop;
  const synthAutoIntervalDom = document.getElementById('beta-synth-auto-interval');
  if (synthAutoIntervalDom && currentSettings.synthAutoInterval) synthAutoIntervalDom.value = currentSettings.synthAutoInterval.toString();
  const synthTTSEnableDom = document.getElementById('beta-synth-tts-enable');
  if (synthTTSEnableDom) synthTTSEnableDom.checked = !!currentSettings.synthTTSEnabled;
  const synthTTSPitchDom = document.getElementById('beta-synth-tts-pitch');
  if (synthTTSPitchDom && currentSettings.synthTTSPitch !== undefined) synthTTSPitchDom.value = currentSettings.synthTTSPitch.toFixed(2);
  const synthTTSRateDom = document.getElementById('beta-synth-tts-rate');
  if (synthTTSRateDom && currentSettings.synthTTSRate !== undefined) synthTTSRateDom.value = currentSettings.synthTTSRate.toFixed(2);
  const synthTTSVolDom = document.getElementById('beta-synth-tts-volume');
  if (synthTTSVolDom && currentSettings.synthTTSVolume !== undefined) synthTTSVolDom.value = Math.round(currentSettings.synthTTSVolume * 100);

  if (updateStageLighting) updateStageLighting();
}
