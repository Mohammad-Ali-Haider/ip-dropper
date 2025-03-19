export type DeviceStatus = 'online' | 'offline';
export type DeviceType = 'windows' | 'mac' | 'linux' | 'mobile' | 'tablet' | 'other';

export interface Device {
  name: string;
  ipaddress: string;
  type: DeviceType;
  status: DeviceStatus;
}

export interface DeviceFormData {
  name: string;
  ipaddress: string;
  type: DeviceType;
}
