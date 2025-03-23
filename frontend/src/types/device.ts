export type DeviceType = "windows" | "mac" | "linux" | "";
// export type DeviceStatus = "online" | "offline";

export interface Device {
  name: string;
  ipaddress: string;
  // type: DeviceType;
}

export interface DeviceFormData {
  name: string;
  ipaddress: string;
  // type: DeviceType;
}

// New interface for device status
export interface DeviceStatus {
  isOnline: boolean;
}
