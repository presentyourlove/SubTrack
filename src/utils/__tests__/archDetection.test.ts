import { isFabricEnabled, isTurboModulesEnabled, getArchitectureInfo } from '../archDetection';

describe('archDetection', () => {
  const originalGlobal = global as any;

  afterEach(() => {
    delete originalGlobal.nativeFabricUIManager;
    delete originalGlobal.__turboModuleProxy;
  });

  describe('isFabricEnabled', () => {
    it('should return true when nativeFabricUIManager is present', () => {
      originalGlobal.nativeFabricUIManager = {};
      expect(isFabricEnabled()).toBe(true);
    });

    it('should return false when nativeFabricUIManager is absent', () => {
      expect(isFabricEnabled()).toBe(false);
    });
  });

  describe('isTurboModulesEnabled', () => {
    it('should return true when __turboModuleProxy is present', () => {
      originalGlobal.__turboModuleProxy = {};
      expect(isTurboModulesEnabled()).toBe(true);
    });

    it('should return false when __turboModuleProxy is absent', () => {
      expect(isTurboModulesEnabled()).toBe(false);
    });
  });

  describe('getArchitectureInfo', () => {
    it('should identify Old Architecture correctly', () => {
      const info = getArchitectureInfo();
      expect(info).toEqual({
        name: 'Old Architecture (Bridge)',
        fabric: false,
        turbo: false,
        details: {
          renderer: 'Paper',
          nativeModules: 'Legacy Native Modules',
        },
      });
    });

    it('should identify New Architecture correctly', () => {
      originalGlobal.nativeFabricUIManager = {};
      originalGlobal.__turboModuleProxy = {};

      const info = getArchitectureInfo();
      expect(info).toEqual({
        name: 'New Architecture',
        fabric: true,
        turbo: true,
        details: {
          renderer: 'Fabric',
          nativeModules: 'TurboModules',
        },
      });
    });
  });
});
