export type DeviceType = "windows" | "mac" | "linux";
export type DeviceStatus = "online" | "offline";

export interface Device {
  name: string;
  ipaddress: string;
  type: DeviceType;
  status: DeviceStatus;
  isReceiving: boolean;
}

export interface DeviceFormData {
  name: string;
  ipaddress: string;
  type: DeviceType;
}
