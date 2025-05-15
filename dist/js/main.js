'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const basicSettings_1 = __importDefault(require("./basicSettings"));
const advanceSettings_1 = __importDefault(require("./advanceSettings"));
const WifiConfig_1 = __importDefault(require("./WifiConfig"));
const AiFeatures_1 = __importDefault(require("./AiFeatures"));
const homepageButton = document.querySelector('.entry_point');
const homepage = document.querySelector('main');
const mainRoomsContainer = document.querySelector('.application_container');
const advanceFeaturesContainer = document.querySelector('.advanced_features_container');
const nav = document.querySelector('nav');
const loader = document.querySelector('.loader-container');
const generalLightSwitch = document.querySelector('.general_light_switch');
const voiceControlButton = document.querySelector('.voice-control');
const wifiController = new WifiConfig_1.default();
const lightController = new basicSettings_1.default(wifiController);
const advancedSettings = new advanceSettings_1.default();
const aiFeatures = new AiFeatures_1.default(lightController, wifiController);
let selectedComponent = null;
let isWifiActive = true;
let isGeneralSwitchProcessing = false;
let isVoiceListening = false;
function turnOffAllLights() {
    const components = Object.values(lightController.componentsData);
    if (components.length === 0) {
        lightController.displayNotification('No lights available to turn off', 'beforeend', document.body);
        return;
    }
    let successCount = 0;
    components.forEach((comp) => {
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
    const generalIcon = generalLightSwitch?.querySelector('img');
    if (generalIcon) {
        const lightOffSrc = generalIcon.dataset.lightoff || './assets/svgs/light_bulb_off.svg';
        generalIcon.src = lightOffSrc;
    }
    else {
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
}
catch (error) {
    console.error('Error initializing Wi-Fi or notifications:', error);
    lightController.displayNotification('Initialization failed', 'beforeend', document.body);
}
function initializeComponentElements() {
    try {
        Object.values(lightController.componentsData).forEach((comp) => {
            const roomClass = comp.name.toLowerCase().replace(/\s+/g, '_').replace(/&/g, 'and');
            const roomElement = document.querySelector(`.rooms.${roomClass}`);
            if (roomElement) {
                comp.element = roomElement;
                advancedSettings.setComponentElement(comp);
                const slider = roomElement.querySelector('.light-intensity');
                console.log(`Initialized ${comp.name}: element=${!!roomElement}, slider=${!!slider}`);
            }
            else {
                console.warn(`Room element not found for ${comp.name} (selector: .rooms.${roomClass})`);
            }
        });
    }
    catch (error) {
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
        }
        catch (error) {
            console.error('Error during loading animation:', error);
            lightController.displayNotification('Failed to load main interface', 'beforeend', document.body);
            loader.style.display = 'none';
            homepageButton.disabled = false;
        }
    });
}
else {
    console.error('Homepage button (.entry_point) not found');
    lightController.displayNotification('Homepage button not found', 'beforeend', document.body);
}
if (voiceControlButton) {
    voiceControlButton.addEventListener('click', () => {
        isVoiceListening = !isVoiceListening;
        if (isVoiceListening) {
            aiFeatures.startVoiceRecognition();
            voiceControlButton.textContent = '🎤 Stop Listening';
        }
        else {
            aiFeatures.stopVoiceRecognition();
            voiceControlButton.textContent = '🎤 Voice Control';
        }
    });
}
else {
    // console.error('Voice control button not found');
    lightController.displayNotification('Voice control button not found', 'beforeend', document.body);
}
if (mainRoomsContainer) {
    mainRoomsContainer.addEventListener('click', (e) => {
        const selectedElement = e.target;
        if (selectedElement.closest('.light-switch')) {
            const lightSwitch = selectedElement.closest('.basic_settings_buttons')?.firstElementChild;
            if (lightSwitch) {
                lightController.toggleLightSwitch(lightSwitch);
            }
            return;
        }
        if (selectedElement.closest('.advance-settings_modal')) {
            const advancedSettingsBtn = selectedElement.closest('.advance-settings_modal');
            advancedSettings.modalPopUp(advancedSettingsBtn);
        }
    });
    let debounceTimeout = null;
    mainRoomsContainer.addEventListener('input', (e) => {
        const slider = e.target;
        if (slider.type !== 'range')
            return;
        console.log(`Slider input detected for ${slider.closest('.rooms')?.classList[1] || 'unknown room'}, value: ${slider.value}`);
        if (debounceTimeout)
            clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            const value = slider.value;
            lightController.handleLightIntensitySlider(slider, value);
            console.log(`Processed slider input, set intensity to ${value}`);
        }, 100);
    });
}
else {
    console.error('Main rooms container not found');
    lightController.displayNotification('Main interface not found', 'beforeend', document.body);
}
if (advanceFeaturesContainer) {
    advanceFeaturesContainer.addEventListener('click', (e) => {
        const selectedElement = e.target;
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
            }
            else if (selectedElement.matches('.defaultOff-cancel')) {
                advancedSettings.customizationCancelled(selectedElement, '.defaultOff');
            }
        }
    });
}
else {
    console.error('Advance features container not found');
    lightController.displayNotification('Advanced settings not found', 'beforeend', document.body);
}
