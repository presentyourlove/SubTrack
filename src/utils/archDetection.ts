/**
 * New Architecture Detection Utility
 * 用於偵測 Fabric 與 TurboModules 是否啟用的工具
 */

/**
 * 檢查 Fabric (New Renderer) 是否啟用
 */
export const isFabricEnabled = (): boolean => {
    // @ts-ignore: nativeFabricUIManager only exists when Fabric is enabled
    return !!global.nativeFabricUIManager;
};

/**
 * 檢查 TurboModules (New Native Module System) 是否啟用
 */
export const isTurboModulesEnabled = (): boolean => {
    // @ts-ignore: __turboModuleProxy exists when TurboModules are enabled
    return !!global.__turboModuleProxy;
};

/**
 * 取得當前架構詳細資訊
 */
export const getArchitectureInfo = () => {
    const fabric = isFabricEnabled();
    const turbo = isTurboModulesEnabled();

    return {
        name: fabric && turbo ? 'New Architecture' : 'Old Architecture (Bridge)',
        fabric,
        turbo,
        details: {
            renderer: fabric ? 'Fabric' : 'Paper',
            nativeModules: turbo ? 'TurboModules' : 'Legacy Native Modules',
        },
    };
};
