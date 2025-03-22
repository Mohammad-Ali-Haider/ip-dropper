import { DeviceType } from '../../types/device';

interface DetectClientInfoResult {
  deviceType: DeviceType;
  deviceName: string;
}

export const detectClientInfo = (): DetectClientInfoResult => {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (userAgent.includes('mac')) {
    return { deviceType: 'mac', deviceName: 'Mac' };
  } else if (userAgent.includes('linux')) {
    return { deviceType: 'linux', deviceName: 'Linux' };
  } else {
    return { deviceType: 'windows', deviceName: 'Windows' };
  }
};

export const getDeviceIcon = (deviceType: DeviceType | "loading"): string => {
  switch (deviceType) {
    case "windows":
      return "fa-windows";
    case "mac":
      return "fa-apple";
    case "linux":
      return "fa-linux";
    case "loading":
      return "fas fa-circle-notch fa-spin";
    default:
      return "fa-computer";
  }
};


