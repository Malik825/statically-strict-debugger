"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AdvanceSettings {
    components = {};
    // Store component element for advanced settings
    setComponentElement(component) {
        if (component.name) {
            this.components[component.name.toLowerCase()] = component;
            console.log(`Stored component element for ${component.name}`);
        }
        else {
            console.warn('Cannot store component: missing name');
        }
    }
    modalPopUp(button) {
        const roomElement = button.closest('.rooms');
        if (!roomElement) {
            console.warn('Room element not found for advanced settings modal');
            return;
        }
        const roomName = roomElement.classList[1]?.replace(/&/g, 'and');
        const component = this.components[roomName];
        if (!component) {
            console.warn(`Component data not found for ${roomName}`);
            return;
        }
        const modalContainer = document.querySelector('.advanced_features_container');
        if (!modalContainer) {
            console.warn('Advanced features container not found');
            return;
        }
        modalContainer.innerHTML = `
      <div class="modal">
        <h3>${component.name} Advanced Settings</h3>
        <div class="customization">
          <label>Auto On: <input type="time" class="defaultOn" value="${component.autoOn}"></label>
          <label>Auto Off: <input type="time" class="defaultOff" value="${component.autoOff}"></label>
        </div>
        <button class="customization-btn">Customize</button>
        <button class="close-btn">Close</button>
      </div>
    `;
        modalContainer.classList.remove('hidden');
        console.log(`Opened advanced settings modal for ${component.name}`);
    }
    closeModalPopUp() {
        const modalContainer = document.querySelector('.advanced_features_container');
        if (modalContainer) {
            modalContainer.classList.add('hidden');
            modalContainer.innerHTML = '';
            console.log('Closed advanced settings modal');
        }
    }
    displayCustomization(button) {
        const modal = button.closest('.modal');
        if (!modal)
            return;
        const autoOnInput = modal.querySelector('.defaultOn');
        const autoOffInput = modal.querySelector('.defaultOff');
        if (autoOnInput && autoOffInput) {
            autoOnInput.disabled = false;
            autoOffInput.disabled = false;
            modal.innerHTML += `
        <button class="defaultOn-okay">OK</button>
        <button class="defaultOn-cancel">Cancel</button>
        <button class="defaultOff-okay">OK</button>
        <button class="defaultOff-cancel">Cancel</button>
      `;
            console.log('Enabled customization for autoOn and autoOff');
        }
    }
    customizeAutomaticOnPreset(button) {
        const modal = button.closest('.modal');
        if (!modal)
            return;
        const autoOnInput = modal.querySelector('.defaultOn');
        const roomName = modal.querySelector('h3')?.textContent?.replace(' Advanced Settings', '')?.toLowerCase();
        if (autoOnInput && roomName && this.components[roomName]) {
            this.components[roomName].autoOn = autoOnInput.value;
            autoOnInput.disabled = true;
            modal.querySelector('.defaultOn-okay')?.remove();
            modal.querySelector('.defaultOn-cancel')?.remove();
            console.log(`Updated autoOn for ${roomName} to ${autoOnInput.value}`);
        }
    }
    customizeAutomaticOffPreset(button) {
        const modal = button.closest('.modal');
        if (!modal)
            return;
        const autoOffInput = modal.querySelector('.defaultOff');
        const roomName = modal.querySelector('h3')?.textContent?.replace(' Advanced Settings', '')?.toLowerCase();
        if (autoOffInput && roomName && this.components[roomName]) {
            this.components[roomName].autoOff = autoOffInput.value;
            autoOffInput.disabled = true;
            modal.querySelector('.defaultOff-okay')?.remove();
            modal.querySelector('.defaultOff-cancel')?.remove();
            console.log(`Updated autoOff for ${roomName} to ${autoOffInput.value}`);
        }
    }
    customizationCancelled(button, selector) {
        const modal = button.closest('.modal');
        if (!modal)
            return;
        const input = modal.querySelector(selector);
        if (input) {
            input.disabled = true;
            modal.querySelector(`${selector}-okay`)?.remove();
            modal.querySelector(`${selector}-cancel`)?.remove();
            console.log(`Cancelled customization for ${selector}`);
        }
    }
}
exports.default = AdvanceSettings;
