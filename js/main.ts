'use strict';

import Light from './basicSettings';
import AdvanceSettings from './advanceSettings.ts';

import WifiController from './WifiConfig';
import AIFeatures from './AiFeatures';

interface ComponentData {
  name: string;
  lightIntensity: number;
  numOfLights: number;
  isLightOn: boolean;
  autoOn: string;
  autoOff: string;
  usage: number[];
  element: HTMLElement | null;
}

const homepageButton = document.querySelector('.entry_point') as HTMLButtonElement | null;
const homepage = document.querySelector('main') as HTMLElement | null;
const mainRoomsContainer = document.querySelector('.application_container') as HTMLElement | null;
const advanceFeaturesContainer = document.querySelector('.advanced_features_container') as HTMLElement | null;
const nav = document.querySelector('nav') as HTMLElement | null;
const loader = document.querySelector('.loader-container') as HTMLElement | null;
const generalLightSwitch = document.querySelector('.general_light_switch') as HTMLButtonElement | null;
const voiceControlButton = document.querySelector('.voice-control') as HTMLButtonElement | null;

const wifiController = new WifiController();
const lightController = new Light(wifiController);
const advancedSettings = new AdvanceSettings();
const aiFeatures = new AIFeatures(lightController, wifiController);

let selectedComponent: ComponentData | null = null;
let isWifiActive: boolean = true;
let isGeneralSwitchProcessing: boolean = false;
let isVoiceListening: boolean = false;

function turnOffAllLights(): void {
  const components = Object.values(lightController.componentsData);
  if (components.length === 0) {
    lightController.displayNotification('No lights available to turn off', 'beforeend', document.body);
    return;
  }

  let successCount = 0;
  components.forEach((comp: ComponentData) => {
    if (!comp.element) {
      console.warn(`Light switch element not found for ${comp.name}`);
      return;
    }
    if (comp.isLightOn) {
      comp.isLightOn = false;
      lightController.toggleLightSwitch(comp.element);
      successCount++;
    }
  });

  const generalIcon = generalLightSwitch?.querySelector('img') as HTMLImageElement | null;
  if (generalIcon) {
    const lightOffSrc = generalIcon.dataset.lightoff || './assets/svgs/light_bulb_off.svg';
    generalIcon.src = lightOffSrc;
  } else {
    console.warn('General light switch icon not found');
  }

  if (successCount > 0) {
    lightController.displayNotification(`Turned off ${successCount} light${successCount > 1 ? 's' : ''}`, 'beforeend', document.body);
  }
}

try {
  wifiController.setLightsOffCallback(turnOffAllLights);
  wifiController.init();
  // lightController.setupNotificationClose();
} catch (error) {
  console.error('Error initializing Wi-Fi or notifications:', error);
  lightController.displayNotification('Initialization failed', 'beforeend', document.body);
}

function initializeComponentElements(): void {
  try {
    Object.values(lightController.componentsData).forEach((comp: ComponentData) => {
      const roomClass = comp.name.toLowerCase().replace(/\s+/g, '_').replace(/&/g, 'and');
      const roomElement = document.querySelector(`.rooms.${roomClass}`) as HTMLElement | null;
      if (roomElement) {
        comp.element = roomElement;
        advancedSettings.setComponentElement(comp);
        const slider = roomElement.querySelector('.light-intensity') as HTMLInputElement | null;
        console.log(`Initialized ${comp.name}: element=${!!roomElement}, slider=${!!slider}`);
      } else {
        console.warn(`Room element not found for ${comp.name} (selector: .rooms.${roomClass})`);
      }
    });
  } catch (error) {
    console.error('Error initializing component elements:', error);
    lightController.displayNotification('Failed to initialize components', 'beforeend', document.body);
  }
}

if (homepageButton) {
  homepageButton.addEventListener('click', async () => {
    if (!homepage || !loader || !mainRoomsContainer || !nav) {
      console.error('Required elements not found for loading animation');
      lightController.displayNotification('Application setup failed', 'beforeend', document.body);
      return;
    }

    try {
      homepageButton.disabled = true;
      homepage.style.display = 'none';
      loader.style.display = 'flex';
      mainRoomsContainer.style.opacity = '0';
      nav.style.opacity = '0';

      await wifiController.init();

      setTimeout(() => {
        loader.style.display = 'none';
        mainRoomsContainer.style.display = 'flex';
        nav.style.display = 'flex';
        mainRoomsContainer.classList.remove('hidden');
        nav.classList.remove('hidden');

        mainRoomsContainer.style.transition = 'opacity 0.5s ease-in';
        nav.style.transition = 'opacity 0.5s ease-in';
        mainRoomsContainer.style.opacity = '1';
        nav.style.opacity = '1';

        homepageButton.disabled = false;

        initializeComponentElements();
        aiFeatures.updatePredictiveSchedules();
        setInterval(() => aiFeatures.updatePredictiveSchedules(), 24 * 60 * 60 * 1000);
        setInterval(() => aiFeatures.analyzeUsagePatterns(), 60 * 60 * 1000);
      }, 1500);
    } catch (error) {
      console.error('Error during loading animation:', error);
      lightController.displayNotification('Failed to load main interface', 'beforeend', document.body);
      loader.style.display = 'none';
      homepageButton.disabled = false;
    }
  });
} else {
  console.error('Homepage button (.entry_point) not found');
  lightController.displayNotification('Homepage button not found', 'beforeend', document.body);
}

if (voiceControlButton) {
  voiceControlButton.addEventListener('click', () => {
    isVoiceListening = !isVoiceListening;
    if (isVoiceListening) {
      aiFeatures.startVoiceRecognition();
      voiceControlButton.textContent = '🎤 Stop Listening';
    } else {
      aiFeatures.stopVoiceRecognition();
      voiceControlButton.textContent = '🎤 Voice Control';
    }
  });
} else {
  // console.error('Voice control button not found');
  lightController.displayNotification('Voice control button not found', 'beforeend', document.body);
}




if (mainRoomsContainer) {
  mainRoomsContainer.addEventListener('click', (e: Event) => {
    const selectedElement = e.target as HTMLElement;

    if (selectedElement.closest('.light-switch')) {
      const lightSwitch = selectedElement.closest('.basic_settings_buttons')?.firstElementChild as HTMLElement | null;
      if (lightSwitch) {
        lightController.toggleLightSwitch(lightSwitch);
      }
      return;
    }

    if (selectedElement.closest('.advance-settings_modal')) {
      const advancedSettingsBtn = selectedElement.closest('.advance-settings_modal') as HTMLElement;
      advancedSettings.modalPopUp(advancedSettingsBtn);
    }
  });

  let debounceTimeout: NodeJS.Timeout | null = null;
  mainRoomsContainer.addEventListener('input', (e: Event) => {
    const slider = e.target as HTMLInputElement;
    if (slider.type !== 'range') return;

    console.log(`Slider input detected for ${slider.closest('.rooms')?.classList[1] || 'unknown room'}, value: ${slider.value}`);
    if (debounceTimeout) clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      const value = slider.value;
      lightController.handleLightIntensitySlider(slider, value);
      console.log(`Processed slider input, set intensity to ${value}`);
    }, 100);
  });
} else {
  console.error('Main rooms container not found');
  lightController.displayNotification('Main interface not found', 'beforeend', document.body);
}

if (advanceFeaturesContainer) {
  advanceFeaturesContainer.addEventListener('click', (e: Event) => {
    const selectedElement = e.target as HTMLElement;

    if (selectedElement.closest('.close-btn')) {
      advancedSettings.closeModalPopUp();
    }

    if (selectedElement.closest('.customization-btn')) {
      advancedSettings.displayCustomization(selectedElement);
    }

    if (selectedElement.matches('.defaultOn-okay')) {
      advancedSettings.customizeAutomaticOnPreset(selectedElement);
    }

    if (selectedElement.matches('.defaultOff-okay')) {
      advancedSettings.customizeAutomaticOffPreset(selectedElement);
    }

    if (selectedElement.textContent?.includes('Cancel')) {
      if (selectedElement.matches('.defaultOn-cancel')) {
        advancedSettings.customizationCancelled(selectedElement, '.defaultOn');
      } else if (selectedElement.matches('.defaultOff-cancel')) {
        advancedSettings.customizationCancelled(selectedElement, '.defaultOff');
      }
    }
  });
} else {
  console.error('Advance features container not found');
  lightController.displayNotification('Advanced settings not found', 'beforeend', document.body);
}