"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class WifiController {
    isWifiActive = false;
    currentConnection = null;
    wifiConnections = [
        { ssid: 'Home-WiFi', signalStrength: 80 },
        { ssid: 'Guest-WiFi', signalStrength: 60 },
        { ssid: 'Office-WiFi', signalStrength: 70 },
    ];
    lightsOffCallback = null;
    constructor() {
        console.log('Initializing WifiController, wifiConnections:', this.wifiConnections);
        if (this.wifiConnections && this.wifiConnections.length > 0) {
            this.currentConnection = this.wifiConnections[0];
            this.isWifiActive = true;
            console.log('Set initial connection:', this.currentConnection);
        }
        else {
            console.warn('No Wi-Fi connections available, setting isWifiActive to false');
            this.currentConnection = null;
            this.isWifiActive = false;
        }
        const wifiToggle = document.querySelector('#wifi_toggle');
        if (wifiToggle) {
            wifiToggle.addEventListener('change', () => this.handleWifiToggle(wifiToggle.checked));
        }
        else {
            console.warn('Wi-Fi toggle element not found');
        }
    }
    setLightsOffCallback(callback) {
        this.lightsOffCallback = callback;
    }
    async init() {
        try {
            console.log('Wi-Fi init, checking connections:', this.wifiConnections);
            if (!this.wifiConnections || this.wifiConnections.length === 0) {
                console.warn('No Wi-Fi networks available during init');
                this.isWifiActive = false;
                this.currentConnection = null;
                if (this.lightsOffCallback) {
                    this.lightsOffCallback();
                }
                return;
            }
            this.currentConnection = this.connectToBestNetwork();
            this.isWifiActive = !!this.currentConnection;
            console.log('Wi-Fi initialized, currentConnection:', this.currentConnection, 'isWifiActive:', this.isWifiActive);
        }
        catch (error) {
            console.error('Error during Wi-Fi initialization:', error);
            this.isWifiActive = false;
            this.currentConnection = null;
            if (this.lightsOffCallback) {
                this.lightsOffCallback();
            }
        }
    }
    connectToBestNetwork() {
        if (!this.wifiConnections || this.wifiConnections.length === 0) {
            console.warn('No Wi-Fi networks to connect to');
            return null;
        }
        const bestNetwork = this.wifiConnections.reduce((best, current) => current.signalStrength > best.signalStrength ? current : best);
        console.log('Connected to best network:', bestNetwork);
        return bestNetwork;
    }
    handleWifiToggle(checked) {
        console.log('Wi-Fi toggle changed, checked:', checked);
        this.isWifiActive = checked;
        if (!checked) {
            this.currentConnection = null;
            if (this.lightsOffCallback) {
                this.lightsOffCallback();
            }
            console.log('Wi-Fi disabled, lights turned off');
        }
        else {
            this.currentConnection = this.connectToBestNetwork();
            this.isWifiActive = !!this.currentConnection;
            console.log('Wi-Fi enabled, currentConnection:', this.currentConnection);
        }
    }
}
exports.default = WifiController;
