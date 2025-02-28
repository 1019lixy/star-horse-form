/**
 * 客户端生成唯一指纹
 */
import FingerprintJS from '@fingerprintjs/fingerprintjs';
// 初始化 FingerprintJS
const fpPromise = FingerprintJS.load();

// 获取硬件信息
function getHardwareInfo() {
    const hardwareInfo = {
        cpuCores: navigator.hardwareConcurrency,
        deviceMemory: navigator.deviceMemory,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        gpuInfo: {},
    };
    debugger;
    // 获取 GPU 信息
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
            hardwareInfo.gpuInfo = {
                vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
                renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL),
            };
        }
    }
    return hardwareInfo;
}

/**
 * 生成设备 ID
 * @param userIp
 */
export async function generateDeviceId(userIp: string) {
    let browserFingerprint = "";
    let hardwareInfo = getHardwareInfo();
    // 获取浏览器指纹
    await fpPromise.then(fp => fp.get())
        .then(result => {
            browserFingerprint = result.visitorId; // 浏览器指纹
            console.log('Browser Fingerprint:', browserFingerprint);
        });
    const seed = `${browserFingerprint}-${JSON.stringify(hardwareInfo)}-${userIp||''}`;
    return btoa(seed); // 使用 Base64 编码生成设备 ID
}

