import { Device } from '../types/device';

export class FileTransferService {
  private static readonly DEFAULT_PORT = 8080;
  
  private createWebSocket(ipAddress: string): WebSocket {
    return new WebSocket(`ws://${ipAddress}:${FileTransferService.DEFAULT_PORT}`);
  }

  async sendFilesToDevices(files: File[], devices: Device[]): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();
    
    // Send to all devices simultaneously
    await Promise.all(devices.map(async (device) => {
      try {
        await this.sendFilesToDevice(files, device);
        results.set(device.ipaddress, true);
      } catch (error) {
        console.error(`Error sending to ${device.name} (${device.ipaddress}):`, error);
        results.set(device.ipaddress, false);
      }
    }));

    return results;
  }

  private async sendFilesToDevice(files: File[], device: Device): Promise<void> {
    return new Promise((resolve, reject) => {
      const ws = this.createWebSocket(device.ipaddress);
      let currentFileIndex = 0;

      ws.onopen = async () => {
        try {
          for (const file of files) {
            await this.sendSingleFile(ws, file);
            currentFileIndex++;
          }
          ws.close();
          resolve();
        } catch (error) {
          reject(error);
        }
      };

      ws.onerror = (error) => {
        reject(error);
      };

      ws.onclose = () => {
        if (currentFileIndex < files.length) {
          reject(new Error('Connection closed prematurely'));
        }
      };
    });
  }

  private async sendSingleFile(ws: WebSocket, file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      // Send metadata first
      const metadata = {
        type: 'metadata',
        filename: file.name,
        size: file.size
      };
      ws.send(JSON.stringify(metadata));

      // Read and send the file in chunks
      const reader = new FileReader();
      const CHUNK_SIZE = 64 * 1024; // 64KB chunks
      let offset = 0;

      const readNextChunk = () => {
        const slice = file.slice(offset, offset + CHUNK_SIZE);
        reader.readAsArrayBuffer(slice);
      };

      reader.onload = (e) => {
        if (e.target?.result) {
          ws.send(e.target.result);
          offset += CHUNK_SIZE;
          
          if (offset < file.size) {
            readNextChunk();
          } else {
            // Send end signal
            ws.send(JSON.stringify({ type: 'end' }));
            resolve();
          }
        }
      };

      reader.onerror = (error) => {
        reject(error);
      };

      readNextChunk();
    });
  }
}