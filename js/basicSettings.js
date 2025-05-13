'use strict';

import General from './general.js';

class Light extends General {
    constructor() {
        super();
    }

    notification(message) {
        return `
            <div class="notification">
                <div>
                    <img src="./assets/svgs/checked.svg" alt="checked svg icon on notifications">
                </div>
                <p>${message}</p>
            </div>
        `;
    }

    displayNotification(message, position, container) {
        const html = this.notification(message);
        this.renderHTML(html, position, container);
        const notification = container.querySelector('.notification:last-child');
        this.removeNotification(notification);
    }

    removeNotification(element) {
        setTimeout(() => {
            element.remove();
        }, 5000);
    }

    lightSwitchOn(lightButtonElement) {
        lightButtonElement.setAttribute('src', './assets/svgs/light_bulb.svg');
        lightButtonElement.setAttribute('data-lightOn', './assets/svgs/light_bulb_off.svg');
    }

    lightSwitchOff(lightButtonElement) {
        lightButtonElement.setAttribute('src', './assets/svgs/light_bulb_off.svg');
        lightButtonElement.setAttribute('data-lightOn', './assets/svgs/light_bulb.svg');
    }

    lightComponentSelectors(lightButtonElement) {
        const room = this.getSelectedComponentName(lightButtonElement);
        const componentData = this.getComponent(room);
        const childElement = lightButtonElement.firstElementChild || lightButtonElement;
        const background = this.closestSelector(lightButtonElement, '.rooms', 'img');
        return { room, componentData, childElement, background };
    }

    toggleLightSwitch(lightButtonElement) {
        const { componentData: component, childElement, background } = this.lightComponentSelectors(lightButtonElement);
        const slider = this.closestSelector(lightButtonElement, '.rooms', '#light_intensity');

        if (!component) return;

        component.isLightOn = !component.isLightOn;

        if (component.isLightOn) {
            this.lightSwitchOn(childElement);
            component.lightIntensity = component.lightIntensity || 5;
            const lightIntensity = component.lightIntensity / 10;
            this.handleLightIntensity(background, lightIntensity);
            slider.value = component.lightIntensity;
        } else {
            this.lightSwitchOff(childElement);
            this.handleLightIntensity(background, 0);
            slider.value = 0;
        }
    }

    handleLightIntensitySlider(element, intensity) {
        const { componentData } = this.lightComponentSelectors(element);
        const lightSwitch = this.closestSelector(element, '.rooms', '.light-switch');
        const background = this.closestSelector(element, '.rooms', 'img');

        if (isNaN(intensity)) return;

        componentData.lightIntensity = intensity;
        componentData.isLightOn = intensity > 0;
        this.sliderLight(componentData.isLightOn, lightSwitch);
        const lightIntensity = intensity / 10;
        this.handleLightIntensity(background, lightIntensity);
    }

    sliderLight(isLightOn, lightButtonElement) {
        const { componentData: component, childElement, background } = this.lightComponentSelectors(lightButtonElement);

        if (!component) return;

        if (isLightOn) {
            this.lightSwitchOn(childElement);
            const lightIntensity = component.lightIntensity / 10;
            this.handleLightIntensity(background, lightIntensity);
        } else {
            this.lightSwitchOff(childElement);
            this.handleLightIntensity(background, 0);
        }
    }
}

export default Light;