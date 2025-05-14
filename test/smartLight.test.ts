import Light from '../js/basicSettings';
import AdvanceSettings from '../js/advanceSettings';
import WifiController from '../js/WifiConfig';

describe('Smart Light App', () => {
  let wifiController: WifiController;
  let lightController: Light;
  let advanceSettings: AdvanceSettings;
  let room: HTMLElement;
  let slider: HTMLInputElement;
  let span: HTMLElement;
  let lightSwitch: HTMLElement;
  let img: HTMLImageElement;

  beforeEach(() => {
    // Initialize controllers
    wifiController = new WifiController();
    lightController = new Light(wifiController);
    advanceSettings = new AdvanceSettings();

    // Mock Wi-Fi as active
    wifiController.isWifiActive = true;
    wifiController.currentConnection = { ssid: 'Test-WiFi', signalStrength: 80 };

    // Set up DOM for Light tests
    room = document.createElement('div');
    room.className = 'rooms hall';

    lightSwitch = document.createElement('div');
    lightSwitch.className = 'light-switch';
    img = document.createElement('img');
    img.dataset.lighton = './assets/svgs/light_bulb.svg';
    img.dataset.lightoff = './assets/svgs/light_bulb_off.svg';
    img.src = './assets/svgs/light_bulb_off.svg';
    lightSwitch.appendChild(img);

    slider = document.createElement('input');
    slider.type = 'range';
    slider.className = 'light-intensity';

    span = document.createElement('span');
    span.className = 'intensity-value';

    room.appendChild(lightSwitch);
    room.appendChild(slider);
    room.appendChild(span);
    document.body.appendChild(room);

    // Set component element
    const component = lightController.getComponent('hall');
    if (component) {
      component.element = room;
    }
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.restoreAllMocks();
  });

  // Light Tests
  describe('Light', () => {
    test('handleLightIntensitySlider updates brightness and turns on light', () => {
      lightController.handleLightIntensitySlider(slider, '7');
      const component = lightController.getComponent('hall');

      expect(slider.value).toBe('7');
      expect(span.textContent).toBe('7');
      expect(img.src).toContain('light_bulb.svg');
      expect(component?.lightIntensity).toBe(7);
      expect(component?.isLightOn).toBe(true);

      const notification = document.querySelector('.notification');
      expect(notification?.textContent).toContain('Hall light intensity set to 7');
    });

    test('handleLightIntensitySlider does nothing without Wi-Fi', () => {
      wifiController.isWifiActive = false;
      wifiController.currentConnection = null;

      lightController.handleLightIntensitySlider(slider, '7');
      const component = lightController.getComponent('hall');

      expect(slider.value).not.toBe('7');
      expect(span.textContent).not.toBe('7');
      expect(img.src).toContain('light_bulb_off.svg');
      expect(component?.lightIntensity).toBe(5);
      expect(component?.isLightOn).toBe(false);

      const notification = document.querySelector('.notification');
      expect(notification?.textContent).toContain('Cannot adjust intensity - no Wi-Fi connection');
    });

    test('toggleLightSwitch toggles light state and updates icon', () => {
      lightController.toggleLightSwitch(lightSwitch);
      const component = lightController.getComponent('hall');

      expect(img.src).toContain('light_bulb.svg');
      expect(component?.isLightOn).toBe(true);

      lightController.toggleLightSwitch(lightSwitch);
      expect(img.src).toContain('light_bulb_off.svg');
      expect(component?.isLightOn).toBe(false);
    });
  });

  // AdvanceSettings Tests
  describe('AdvanceSettings', () => {
    test('setComponentElement stores component data', () => {
      const component = {
        name: 'Hall',
        lightIntensity: 5,
        numOfLights: 4,
        isLightOn: false,
        autoOn: '18:00',
        autoOff: '22:00',
        usage: [22, 11, 12, 10, 12, 17, 22],
        element: document.createElement('div'),
      };

      advanceSettings.setComponentElement(component);

      const components = (advanceSettings as any).components;
      expect(components['hall']).toEqual(component);
      expect(components['hall'].name).toBe('Hall');
      expect(components['hall'].element).toBe(component.element);
    });

    test('setComponentElement warns on missing name', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const component = {
        name: '',
        lightIntensity: 5,
        numOfLights: 4,
        isLightOn: false,
        autoOn: '18:00',
        autoOff: '22:00',
        usage: [22, 11, 12, 10, 12, 17, 22],
        element: document.createElement('div'),
      };

      advanceSettings.setComponentElement(component);

      expect(consoleWarnSpy).toHaveBeenCalledWith('Cannot store component: missing name');
      consoleWarnSpy.mockRestore();
    });
  });

  // WifiController Tests
  describe('WifiController', () => {
    test('constructor handles empty wifiConnections', () => {
      jest.spyOn(WifiController.prototype, 'wifiConnections' as any, 'get').mockReturnValue([]);
      const wifiController = new WifiController();

      expect(wifiController.isWifiActive).toBe(false);
      expect(wifiController.currentConnection).toBe(null);
    });

    test('init handles empty wifiConnections', async () => {
      jest.spyOn(WifiController.prototype, 'wifiConnections' as any, 'get').mockReturnValue([]);
      const wifiController = new WifiController();
      const lightsOffCallback = jest.fn();
      wifiController.setLightsOffCallback(lightsOffCallback);

      await wifiController.init();

      expect(wifiController.isWifiActive).toBe(false);
      expect(wifiController.currentConnection).toBe(null);
      expect(lightsOffCallback).toHaveBeenCalled();
    });
  });
});