export type DeviceType = "windows" | "mac" | "linux" | "";
// export type DeviceStatus = "online" | "offline";

export interface Device {
  name: string;
  ipaddress: string;
  status?: 'online' | 'offline';
  // type: DeviceType;
}

export interface DeviceFormData {
  name: string;
  ipaddress: string;
  // type: DeviceType;
}

export interface DeviceStatus {
  isOnline: boolean;
}
