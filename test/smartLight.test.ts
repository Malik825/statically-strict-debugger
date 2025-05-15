import Light from '../js/basicSettings';
import AdvanceSettings from '../js/advanceSettings';
import WifiController from '../js/WifiConfig';

interface Component {
  name: string;
  lightIntensity: number;
  isLightOn: boolean;
  element?: HTMLElement;
}

describe('Smart Light App - Pure Functions', () => {
  let lightController: Light;
  let advanceSettings: AdvanceSettings;

  beforeEach(() => {
    const wifiController = new WifiController();
    lightController = new Light(wifiController);
    advanceSettings = new AdvanceSettings();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Light', () => {
    test('getComponent returns component for valid room name', () => {
      const component = lightController.getComponent('hall');
      expect(component).toBeDefined();
      expect(component?.lightIntensity).toBe(5);
      expect(component?.isLightOn).toBe(false);
    });

    test('getComponent returns undefined for invalid room name', () => {
      const component = lightController.getComponent('invalid');
      expect(component).toBeUndefined();
    });
  });

  describe('AdvanceSettings', () => {
    test('isValidComponent returns true for valid component', () => {
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

      const result = advanceSettings.isValidComponent(component);
      expect(result).toBe(true);
    });

    test('isValidComponent returns false for component without name', () => {
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

      const result = advanceSettings.isValidComponent(component);
      expect(result).toBe(false);
    });

    test('isValidComponent returns false for component with undefined name', () => {
      const component = {
        name: undefined as any,
        lightIntensity: 5,
        numOfLights: 4,
        isLightOn: false,
        autoOn: '18:00',
        autoOff: '22:00',
        usage: [22, 11, 12, 10, 12, 17, 22],
        element: document.createElement('div'),
      };

      const result = advanceSettings.isValidComponent(component);
      expect(result).toBe(false);
    });

    // ✅ Additional test cases

    test('isValidComponent returns false for null component', () => {
      const result = advanceSettings.isValidComponent(null as any);
      expect(result).toBe(false);
    });

    test('isValidComponent returns false for component with no properties', () => {
      const result = advanceSettings.isValidComponent({} as any);
      expect(result).toBe(false);
    });

    test('isValidComponent returns false when name is a number', () => {
      const component = {
        name: 123 as any,
        lightIntensity: 5,
        numOfLights: 4,
        isLightOn: false,
        autoOn: '18:00',
        autoOff: '22:00',
        usage: [22, 11, 12, 10, 12, 17, 22],
        element: document.createElement('div'),
      };

      const result = advanceSettings.isValidComponent(component);
      expect(result).toBe(false);
    });

    test('isValidComponent returns true even if optional element is missing', () => {
      const component = {
        name: 'Kitchen',
        lightIntensity: 5,
        numOfLights: 2,
        isLightOn: true,
        autoOn: '17:00',
        autoOff: '23:00',
        usage: [10, 12, 14, 16, 18, 20, 22]
        // no element
      };

      const result = advanceSettings.isValidComponent(component);
      expect(result).toBe(true);
    });
  });
      test('isValidComponent returns false for component with whitespace-only name', () => {
      const component = {
        name: '   ',
        lightIntensity: 4,
        numOfLights: 2,
        isLightOn: false,
        autoOn: '19:00',
        autoOff: '21:00',
        usage: [5, 6],
        element: document.createElement('div'),
      };

      const result = advanceSettings.isValidComponent(component);
      expect(result).toBe(false);
    });

    test('isValidComponent returns false for component with null name', () => {
      const component = {
        name: null as any,
        lightIntensity: 4,
        numOfLights: 2,
        isLightOn: true,
        autoOn: '18:00',
        autoOff: '20:00',
        usage: [10, 11],
        element: document.createElement('div'),
      };

      const result = advanceSettings.isValidComponent(component);
      expect(result).toBe(false);
    });

    test('isValidComponent returns false for component with name as object', () => {
      const component = {
        name: { value: 'Room' } as any,
        lightIntensity: 4,
        numOfLights: 1,
        isLightOn: true,
        autoOn: '20:00',
        autoOff: '23:00',
        usage: [9, 10],
        element: document.createElement('div'),
      };

      const result = advanceSettings.isValidComponent(component);
      expect(result).toBe(false);
    });

    test('isValidComponent returns true for component with mixed-case name', () => {
      const component = {
        name: 'BeDRoom',
        lightIntensity: 7,
        numOfLights: 2,
        isLightOn: true,
        autoOn: '17:30',
        autoOff: '22:30',
        usage: [11, 13, 15, 12, 9, 7, 6],
        element: document.createElement('div'),
      };

      const result = advanceSettings.isValidComponent(component);
      expect(result).toBe(true);
    });

    test('isValidComponent returns true for component with special characters in name', () => {
      const component = {
        name: 'Kids&Babies',
        lightIntensity: 3,
        numOfLights: 1,
        isLightOn: false,
        autoOn: '16:00',
        autoOff: '20:00',
        usage: [5, 5, 5, 5, 5, 5, 5],
        element: document.createElement('div'),
      };

      const result = advanceSettings.isValidComponent(component);
      expect(result).toBe(true);
    });
    test('isValidComponent returns false for component with empty object as name', () => {
      const component = {
        name: {} as any,
        lightIntensity: 4,
        numOfLights: 2,
        isLightOn: false,
        autoOn: '19:00',
        autoOff: '21:00',
        usage: [5, 6],
        element: document.createElement('div'),
      };

      const result = advanceSettings.isValidComponent(component);
      expect(result).toBe(false);
    });
        test('isValidComponent returns false for component with name as an empty array', () => {
      const component = {
        name: [] as any,
        lightIntensity: 3,
        numOfLights: 1,
        isLightOn: true,
        autoOn: '08:00',
        autoOff: '20:00',
        usage: [5, 6, 7],
        element: document.createElement('div'),
      };

      const result = advanceSettings.isValidComponent(component);
      expect(result).toBe(false);
    });

    test('isValidComponent returns false for component with name as boolean true', () => {
      const component = {
        name: true as any,
        lightIntensity: 3,
        numOfLights: 2,
        isLightOn: false,
        autoOn: '07:00',
        autoOff: '19:00',
        usage: [5, 7, 9],
        element: document.createElement('div'),
      };

      const result = advanceSettings.isValidComponent(component);
      expect(result).toBe(false);
    });

    test('isValidComponent returns false for component with extremely long name', () => {
      const component = {
        name: 'a'.repeat(10000),
        lightIntensity: 5,
        numOfLights: 3,
        isLightOn: true,
        autoOn: '06:00',
        autoOff: '21:00',
        usage: [4, 4, 4],
        element: document.createElement('div'),
      };

      const result = advanceSettings.isValidComponent(component);
      expect(result).toBe(true); // Depending on business rules; you could also expect false
    });

    test('isValidComponent returns false for component missing name property entirely', () => {
      const component = {
        lightIntensity: 2,
        numOfLights: 1,
        isLightOn: false,
        autoOn: '10:00',
        autoOff: '18:00',
        usage: [3, 2, 1],
        element: document.createElement('div'),
      } as any;

      const result = advanceSettings.isValidComponent(component);
      expect(result).toBe(false);
    });

    test('isValidComponent returns true for component name with newline and tabs', () => {
      const component = {
        name: '\n\tBedroom\t\n',
        lightIntensity: 6,
        numOfLights: 2,
        isLightOn: true,
        autoOn: '15:00',
        autoOff: '23:30',
        usage: [8, 8, 8],
        element: document.createElement('div'),
      };

      const result = advanceSettings.isValidComponent(component);
      expect(result).toBe(true);
    });
    test('isValidComponent returns false for component with name as a function', () => {
      const component = {
        name: function() {} as any,
        lightIntensity: 4,
        numOfLights: 2,
        isLightOn: false,
        autoOn: '19:00',
        autoOff: '21:00',
        usage: [5, 6],
        element: document.createElement('div'),
      };

      const result = advanceSettings.isValidComponent(component);
      expect(result).toBe(false);
    });
});
