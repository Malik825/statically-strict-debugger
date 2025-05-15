'use strict';

import General from './general';
import Light from './basicSettings';

class AdvanceSettings extends Light {
    constructor() {
        super(); // Always call super() in a subclass constructor
    }

    isValidComponent(component) {
        // Must be an object
        if (typeof component !== 'object' || component === null) return false;

        // Name must be a non-empty string and not just whitespace
        if (typeof component.name !== 'string') return false;
        if (!component.name.trim()) return false;

        return true;
    }

    #markup(component) {
        const { name, numOfLights, autoOn, autoOff } = component;
        return `
        <div class="advanced_features">
            <h3>Advanced features</h3>
            <section class="component_summary">
                <div>
                    <p class="component_name">${this.capFirstLetter(name)}</p>
                    <p class="number_of_lights">${numOfLights}</p>
                </div>
                <div>
                    <p class="auto_on">
                        <span>Automatic turn on:</span>
                        <span>${autoOn}</span>
                    </p>
                    <p class="auto_off">
                        <span>Automatic turn off:</span>
                        <span>${autoOff}</span>
                    </p>
                </div>
            </section>
            <section class="customization">
                <div class="edit">
                    <p>Customize</p>
                    <button class="customization-btn">
                        <img src="./assets/svgs/edit.svg" alt="customize settings svg icon">
                    </button>
                </div>
                <section class="customization-details hidden">
                    <div>
                        <h4>Automatic on/off settings</h4>
                        <div class="defaultOn">
                            <label for="">Turn on</label>
                            <input type="time" name="autoOnTime" id="autoOnTime">
                            <div>
                                <button class="defaultOn-okay">Okay</button>
                                <button class="defaultOn-cancel">Cancel</button>
                            </div>
                        </div>
                        <div class="defaultOff">
                            <label for="">Go off</label>
                            <input type="time" name="autoOffTime" id="autoOffTime">
                            <div>
                                <button class="defaultOff-okay">Okay</button>
                                <button class="defaultOff-cancel">Cancel</button>
                            </div>
                        </div>
                    </div>
                </section>
                <section class="summary">
                    <h3>Summary</h3>
                    <div class="chart-container">
                        <canvas id="myChart"></canvas>
                    </div>
                </section>
                <button class="close-btn">
                    <img src="./assets/svgs/close.svg" alt="close button svg icon">
                </button>
            </section>
        </div>
        `;
    }

    #analyticsUsage(data) {
        const ctx = this.selector('#myChart');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'],
                datasets: [{
                    label: 'Hours of usage',
                    data: data,
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    modalPopUp(element) {
        const selectedRoom = this.getSelectedComponentName(element);
        const componentData = this.getComponent(selectedRoom);
        const parentElement = this.selector('.advanced_features_container');
        this.removeHidden(parentElement);

        this.renderHTML(this.#markup(componentData), 'afterbegin', parentElement);
        this.#analyticsUsage(componentData['usage']);
    }

    displayCustomization(selectedElement) {
        const element = this.closestSelector(selectedElement, '.customization', '.customization-details');
        this.toggleHidden(element);
    }

    closeModalPopUp() {
        const parentElement = this.selector('.advanced_features_container');
        const childElement = this.selector('.advanced_features');
        childElement.remove();
        this.addHidden(parentElement);
    }

    customizationCancelled(selectedElement, parentSelectorIdentifier) {
        const element = this.closestSelector(selectedElement, parentSelectorIdentifier, 'input');
        element.value = '';
    }

    customizeAutomaticOnPreset(selectedElement) {
        const element = this.closestSelector(selectedElement, '.defaultOn', 'input');
        const { value } = element;

        if (!value) {
            this.displayNotification('Please select a valid time.', 'beforeend', document.body);
            return;
        }

        const component = this.getComponentData(element, '.advanced_features', '.component_name');
        component.autoOn = value;
        element.value = '';

        const parentElement = this.selector('.advanced_features_container');
        const childElement = this.selector('.advanced_features');
        childElement.remove();
        this.renderHTML(this.#markup(component), 'afterbegin', parentElement);
        this.#analyticsUsage(component['usage']);

        this.setComponentElement(component);
        this.automateLight(component.autoOn, component, true);
    }

    customizeAutomaticOffPreset(selectedElement) {
        const element = this.closestSelector(selectedElement, '.defaultOff', 'input');
        const { value } = element;

        if (!value) {
            this.displayNotification('Please select a valid time.', 'beforeend', document.body);
            return;
        }

        const component = this.getComponentData(element, '.advanced_features', '.component_name');
        component.autoOff = value;
        element.value = '';

        const parentElement = this.selector('.advanced_features_container');
        const childElement = this.selector('.advanced_features');
        childElement.remove();
        this.renderHTML(this.#markup(component), 'afterbegin', parentElement);
        this.#analyticsUsage(component['usage']);

        this.setComponentElement(component);
        this.automateLight(component.autoOff, component, false);
    }

    getSelectedComponent(componentName) {
        if (!componentName) return this.componentsData;
        return this.componentsData[componentName.toLowerCase()];
    }

    setNewData(component, key, data) {
        const selectedComponent = this.componentsData[component.toLowerCase()];
        selectedComponent[key] = data;
    }

    capFirstLetter(word) {
        return word.replace(word.at(0), word.at(0).toUpperCase());
    }

    formatTime(time) {
        const [hour, min] = time.split(':');
        const dailyAlarmTime = new Date();
        dailyAlarmTime.setHours(parseInt(hour, 10));
        dailyAlarmTime.setMinutes(parseInt(min, 10));
        dailyAlarmTime.setSeconds(0);
        return dailyAlarmTime;
    }

    async timer(time, component, turnOn) {
        return new Promise((resolve) => {
            const checkAndTriggerAlarm = () => {
                const now = new Date();
                if (
                    now.getHours() === time.getHours() &&
                    now.getMinutes() === time.getMinutes() &&
                    now.getSeconds() === time.getSeconds()
                ) {
                    component.isLightOn = turnOn;
                    this.toggleLightSwitch(component['element']);
                    this.displayNotification(`Light ${turnOn ? 'turned on' : 'turned off'} for ${component.name}.`, 'beforeend', document.body);
                    resolve();
                }
            };

            const intervalId = setInterval(checkAndTriggerAlarm, 1000);
            setTimeout(() => clearInterval(intervalId), 24 * 60 * 60 * 1000);
        });
    }

    async automateLight(time, component, turnOn) {
        const formattedTime = this.formatTime(time);
        await this.timer(formattedTime, component, turnOn);
        setTimeout(() => this.automateLight(time, component, turnOn), 24 * 60 * 60 * 1000);
    }
}

export default AdvanceSettings;
