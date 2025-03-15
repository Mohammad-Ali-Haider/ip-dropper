import { Device } from "../types/device";

export const validateIPAddress = (ip: string): boolean => {
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipRegex.test(ip)) return false;

  const parts = ip.split(".").map(Number);
  return parts.every((part) => part >= 0 && part <= 255);
};

export const getUniqueDeviceName = (
  baseName: string, 
  existingDevices: Device[], 
  currentIp?: string
): string => {
  let newName = baseName;
  let counter = 1;

  while (existingDevices.some(device => 
    device.name === newName && 
    (currentIp ? device.ipaddress !== currentIp : true)
  )) {
    newName = `${baseName} (${counter})`;
    counter++;
  }

  return newName;
};