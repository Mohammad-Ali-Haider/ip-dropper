export interface TransferRecord {
  id: string;
  timestamp: Date;
  files: string[];
  targetDevices: {
    name: string;
    ipaddress: string;
  }[];
  status: 'completed' | 'failed';
  error?: string;
}
