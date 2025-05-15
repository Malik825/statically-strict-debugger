"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AIFeatures {
    lightController;
    wifiController;
    recognition = null; // SpeechRecognition type
    constructor(lightController, wifiController) {
        this.lightController = lightController;
        this.wifiController = wifiController;
        this.setupVoiceRecognition();
    }
    // Predictive Scheduling: Update autoOn/autoOff based on usage
    updatePredictiveSchedules() {
        if (!this.wifiController.isWifiActive || !this.wifiController.currentConnection) {
            this.lightController.displayNotification('Cannot update schedules - no Wi-Fi connection', 'beforeend', document.body);
            return;
        }
        const components = Object.values(this.lightController.componentsData);
        components.forEach((comp) => {
            if (!comp.usage || comp.usage.length === 0)
                return;
            // Calculate average usage hour (simplified: assume usage is hours per day)
            const avgUsage = comp.usage.reduce((sum, val) => sum + val, 0) / comp.usage.length;
            const autoOnHour = Math.floor(avgUsage) % 24; // Approximate on time
            const autoOffHour = (autoOnHour + 6) % 24; // Off 6 hours later
            comp.autoOn = `${autoOnHour.toString().padStart(2, '0')}:00`;
            comp.autoOff = `${autoOffHour.toString().padStart(2, '0')}:00`;
            this.lightController.updateComponentData(comp);
            this.lightController.displayNotification(`${comp.name} schedule updated: On at ${comp.autoOn}, Off at ${comp.autoOff}`, 'beforeend', document.body);
        });
    }
    // Voice Command Setup
    setupVoiceRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn('SpeechRecognition not supported in this browser');
            this.lightController.displayNotification('Voice commands not supported', 'beforeend', document.body);
            return;
        }
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';
        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.toLowerCase().trim();
            this.processVoiceCommand(transcript);
        };
        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.lightController.displayNotification('Voice command failed', 'beforeend', document.body);
        };
    }
    startVoiceRecognition() {
        if (!this.recognition) {
            this.lightController.displayNotification('Voice commands not supported', 'beforeend', document.body);
            return;
        }
        this.recognition.start();
        this.lightController.displayNotification('Listening for voice commands...', 'beforeend', document.body);
    }
    stopVoiceRecognition() {
        if (this.recognition) {
            this.recognition.stop();
            this.lightController.displayNotification('Stopped listening', 'beforeend', document.body);
        }
    }
    processVoiceCommand(command) {
        if (!this.wifiController.isWifiActive || !this.wifiController.currentConnection) {
            this.lightController.displayNotification('Cannot process voice command - no Wi-Fi connection', 'beforeend', document.body);
            return;
        }
        const components = Object.values(this.lightController.componentsData);
        // Handle "turn on/off all lights"
        if (command.includes('all lights')) {
            const turnOn = command.includes('turn on') || command.includes('on');
            const turnOff = command.includes('turn off') || command.includes('off');
            if (turnOn || turnOff) {
                components.forEach((comp) => {
                    if (!comp.element)
                        return;
                    if (comp.isLightOn !== turnOn) {
                        comp.isLightOn = turnOn;
                        this.lightController.toggleLightSwitch(comp.element);
                    }
                });
                const generalIcon = document.querySelector('.general_light_switch img');
                if (generalIcon) {
                    const lightOnSrc = generalIcon.dataset.lighton || './assets/svgs/light_bulb.svg';
                    const lightOffSrc = generalIcon.dataset.lightoff || './assets/svgs/light_bulb_off.svg';
                    generalIcon.src = turnOn ? lightOnSrc : lightOffSrc;
                }
                this.lightController.displayNotification(`All lights turned ${turnOn ? 'on' : 'off'}`, 'beforeend', document.body);
                return;
            }
        }
        // Handle individual room commands
        components.forEach((comp) => {
            const roomName = comp.name.toLowerCase();
            if (command.includes(roomName)) {
                const turnOn = command.includes('turn on') || command.includes('on');
                const turnOff = command.includes('turn off') || command.includes('off');
                if (turnOn || turnOff) {
                    if (!comp.element) {
                        this.lightController.displayNotification(`Cannot toggle ${comp.name} - element not found`, 'beforeend', document.body);
                        return;
                    }
                    if (comp.isLightOn !== turnOn) {
                        comp.isLightOn = turnOn;
                        this.lightController.toggleLightSwitch(comp.element);
                        this.lightController.displayNotification(`${comp.name} light turned ${turnOn ? 'on' : 'off'}`, 'beforeend', document.body);
                    }
                }
            }
        });
    }
    // Usage Pattern Analysis
    analyzeUsagePatterns() {
        if (!this.wifiController.isWifiActive || !this.wifiController.currentConnection) {
            this.lightController.displayNotification('Cannot analyze usage - no Wi-Fi connection', 'beforeend', document.body);
            return;
        }
        const components = Object.values(this.lightController.componentsData);
        components.forEach((comp) => {
            if (!comp.usage || comp.usage.length === 0)
                return;
            const avgUsage = comp.usage.reduce((sum, val) => sum + val, 0) / comp.usage.length;
            if (avgUsage > 15) { // High usage threshold
                const lateNightUsage = comp.usage.some((val, idx) => {
                    const hour = (idx % 24) < 6; // Midnight to 6 AM
                    return val > 0 && hour;
                });
                if (lateNightUsage && comp.isLightOn) {
                    this.lightController.displayNotification(`High usage detected for ${comp.name} during late hours. Consider turning off or adjusting schedule.`, 'beforeend', document.body);
                }
            }
        });
    }
}
exports.default = AIFeatures;
