import WifiController from './WifiConfig';

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

class Light {
  private wifiController: WifiController;
  public componentsData: { [key: string]: ComponentData };

  constructor(wifiController: WifiController) {
    this.wifiController = wifiController;
    this.componentsData = {
      hall: { name: 'Hall', lightIntensity: 5, numOfLights: 4, isLightOn: false, autoOn: '18:00', autoOff: '22:00', usage: [22, 11, 12, 10, 12, 17, 22], element: null },
      bedroom: { name: 'Bedroom', lightIntensity: 5, numOfLights: 2, isLightOn: false, autoOn: '20:00', autoOff: '23:00', usage: [14, 12, 13, 11, 15, 12, 14], element: null },
      bathroom: { name: 'Bathroom', lightIntensity: 5, numOfLights: 3, isLightOn: false, autoOn: '07:00', autoOff: '08:00', usage: [7, 8, 7, 9, 6, 8, 7], element: null },
      outside_lights: { name: 'Outdoor lights', lightIntensity: 5, numOfLights: 6, isLightOn: false, autoOn: '18:00', autoOff: '06:00', usage: [18, 19, 20, 17, 18, 19, 20], element: null },
      guest_room: { name: 'Guest room', lightIntensity: 5, numOfLights: 2, isLightOn: false, autoOn: '19:00', autoOff: '22:00', usage: [10, 9, 11, 8, 10, 9, 10], element: null },
      kitchen: { name: 'Kitchen', lightIntensity: 5, numOfLights: 4, isLightOn: false, autoOn: '17:00', autoOff: '21:00', usage: [17, 18, 16, 19, 17, 18, 17], element: null },
      corridor: { name: 'Corridor', lightIntensity: 5, numOfLights: 3, isLightOn: false, autoOn: '18:00', autoOff: '22:00', usage: [12, 13, 14, 11, 12, 13, 12], element: null },
      walkway: { name: 'Walkway', lightIntensity: 5, numOfLights: 4, isLightOn: false, autoOn: '18:00', autoOff: '22:00', usage: [15, 14, 16, 13, 15, 14, 15], element: null },
    };
  }

  getComponent(name: string): ComponentData | undefined {
    return this.componentsData[name.toLowerCase()];
  }

  updateComponentData(data: ComponentData): void {
    const component = this.componentsData[data.name.toLowerCase()];
    if (component) {
      Object.assign(component, data);
    }
  }

toggleLightSwitch(element: HTMLElement): void {
  console.log('Toggle called for element:', element);
  console.log('WiFi Active:', this.wifiController.isWifiActive, 'Connection:', this.wifiController.currentConnection);

  const roomElement = element.closest('.rooms') as HTMLElement | null;
  console.log('Found room element:', roomElement, 'with classes:', roomElement?.classList);

  if (!roomElement) return;

  const roomName = roomElement.classList[1].replace(/&/g, 'and');
  console.log('Room name extracted:', roomName);

  const component = this.getComponent(roomName);
  if (!component) {
    console.warn(`Component data not found for ${roomName}`);
    return;
  }

  component.isLightOn = !component.isLightOn;
  console.log(`${component.name} isLightOn toggled to:`, component.isLightOn);

  const lightSwitchImg = element.querySelector('.light-switch img') as HTMLImageElement | null;
  console.log('Light switch img element:', lightSwitchImg);
  if (lightSwitchImg) {
    const lightOnSrc = lightSwitchImg.dataset.lighton || './assets/svgs/light_bulb.svg';
    const lightOffSrc = lightSwitchImg.dataset.lightoff || './assets/svgs/light_bulb_off.svg';
    lightSwitchImg.src = component.isLightOn ? lightOnSrc : lightOffSrc;
  } else {
    console.warn(`Light switch image not found for ${roomName}`);
  }

  this.displayNotification(
    `${component.name} light turned ${component.isLightOn ? 'on' : 'off'}`,
    'beforeend',
    document.body
  );
}


  handleLightIntensitySlider(slider: HTMLInputElement, value: string): void {
    if (!this.wifiController.isWifiActive || !this.wifiController.currentConnection) {
      this.displayNotification('Cannot adjust intensity - no Wi-Fi connection', 'beforeend', document.body);
      return;
    }

    const roomElement = slider.closest('.rooms') as HTMLElement | null;
    if (!roomElement) {
      console.warn('Room element not found for slider');
      return;
    }

    const roomName = roomElement.classList[1].replace(/&/g, 'and');
    const component = this.getComponent(roomName);
    if (!component) {
      console.warn(`Component data not found for ${roomName}`);
      return;
    }

    // Turn on the light if it's off
    if (!component.isLightOn) {
      component.isLightOn = true;
      const lightSwitch = roomElement.querySelector('.light-switch') as HTMLElement | null;
      if (lightSwitch) {
        const lightSwitchImg = lightSwitch.querySelector('img') as HTMLImageElement | null;
        if (lightSwitchImg) {
          const lightOnSrc = lightSwitchImg.dataset.lighton || './assets/svgs/light_bulb.svg';
          lightSwitchImg.src = lightOnSrc;
          console.log(`Turned on ${roomName} light via slider, src: ${lightSwitchImg.src}`);
        }
        this.displayNotification(`${component.name} light turned on`, 'beforeend', document.body);
      } else {
        console.warn(`Light switch not found for ${roomName} when adjusting slider`);
      }
    }

    component.lightIntensity = parseInt(value, 10);
    slider.value = value;
    const intensityValueSpan = slider.nextElementSibling as HTMLElement | null;
    if (intensityValueSpan) {
      intensityValueSpan.textContent = value;
    }

    this.displayNotification(
      `${component.name} light intensity set to ${value}`,
      'beforeend',
      document.body
    );
  }

  displayNotification(message: string, position: InsertPosition, container: HTMLElement): void {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    const closeBtn = document.createElement('span');
    closeBtn.className = 'close-btn';
    closeBtn.textContent = '×';
    notification.appendChild(closeBtn);
    container.insertAdjacentElement(position, notification);

    setTimeout(() => {
      notification.remove();
    }, 5000);
  }

  setupNotificationClose(): void {
    document.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('close-btn')) {
        const notification = target.parentElement;
        if (notification) {
          notification.remove();
        }
      }
    });
  }
}

export default Light;