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

class AdvanceSettings {
  private components: { [key: string]: ComponentData } = {};

  // Store component element for advanced settings
  public setComponentElement(component: ComponentData): void {
    if (component.name) {
      this.components[component.name.toLowerCase()] = component;
      console.log(`Stored component element for ${component.name}`);
    } else {
      console.warn('Cannot store component: missing name');
    }
  }

  public modalPopUp(button: HTMLElement): void {
    const roomElement = button.closest('.rooms') as HTMLElement | null;
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

    const modalContainer = document.querySelector('.advanced_features_container') as HTMLElement | null;
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

  public closeModalPopUp(): void {
    const modalContainer = document.querySelector('.advanced_features_container') as HTMLElement | null;
    if (modalContainer) {
      modalContainer.classList.add('hidden');
      modalContainer.innerHTML = '';
      console.log('Closed advanced settings modal');
    }
  }

  public displayCustomization(button: HTMLElement): void {
    const modal = button.closest('.modal') as HTMLElement | null;
    if (!modal) return;

    const autoOnInput = modal.querySelector('.defaultOn') as HTMLInputElement | null;
    const autoOffInput = modal.querySelector('.defaultOff') as HTMLInputElement | null;
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

  public customizeAutomaticOnPreset(button: HTMLElement): void {
    const modal = button.closest('.modal') as HTMLElement | null;
    if (!modal) return;

    const autoOnInput = modal.querySelector('.defaultOn') as HTMLInputElement | null;
    const roomName = modal.querySelector('h3')?.textContent?.replace(' Advanced Settings', '')?.toLowerCase();
    if (autoOnInput && roomName && this.components[roomName]) {
      this.components[roomName].autoOn = autoOnInput.value;
      autoOnInput.disabled = true;
      modal.querySelector('.defaultOn-okay')?.remove();
      modal.querySelector('.defaultOn-cancel')?.remove();
      console.log(`Updated autoOn for ${roomName} to ${autoOnInput.value}`);
    }
  }

  public customizeAutomaticOffPreset(button: HTMLElement): void {
    const modal = button.closest('.modal') as HTMLElement | null;
    if (!modal) return;

    const autoOffInput = modal.querySelector('.defaultOff') as HTMLInputElement | null;
    const roomName = modal.querySelector('h3')?.textContent?.replace(' Advanced Settings', '')?.toLowerCase();
    if (autoOffInput && roomName && this.components[roomName]) {
      this.components[roomName].autoOff = autoOffInput.value;
      autoOffInput.disabled = true;
      modal.querySelector('.defaultOff-okay')?.remove();
      modal.querySelector('.defaultOff-cancel')?.remove();
      console.log(`Updated autoOff for ${roomName} to ${autoOffInput.value}`);
    }
  }

  public customizationCancelled(button: HTMLElement, selector: string): void {
    const modal = button.closest('.modal') as HTMLElement | null;
    if (!modal) return;

    const input = modal.querySelector(selector) as HTMLInputElement | null;
    if (input) {
      input.disabled = true;
      modal.querySelector(`${selector}-okay`)?.remove();
      modal.querySelector(`${selector}-cancel`)?.remove();
      console.log(`Cancelled customization for ${selector}`);
    }
  }
}

export default AdvanceSettings;