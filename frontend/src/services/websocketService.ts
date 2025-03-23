export class WebSocketService {
  private ws: WebSocket | null = null;
  private static instance: WebSocketService;
  private messageHandlers: ((data: any) => void)[] = [];

  private constructor() {}

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket('ws://localhost:3000/ws');
      
      this.ws.onopen = () => {
        console.log('WebSocket Connected');
        resolve();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket Error:', error);
        reject(error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket Disconnected');
      };

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.messageHandlers.forEach(handler => handler(data));
      };
    });
  }

  onMessage(handler: (data: any) => void) {
    this.messageHandlers.push(handler);
  }

  send(data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket is not connected'));
        return;
      }

      try {
        this.ws.send(JSON.stringify(data));
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  sendFile(file: File, deviceIp: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket is not connected'));
        return;
      }

      const reader = new FileReader();
      reader.onload = async () => {
        try {
          console.log(`Preparing to send file: ${file.name} to ${deviceIp}`);
          
          // Convert ArrayBuffer to array for proper JSON serialization
          const arrayBuffer = reader.result as ArrayBuffer;
          const uint8Array = new Uint8Array(arrayBuffer);
          const array = Array.from(uint8Array);

          const fileData = {
            type: 'file',
            name: file.name,
            size: file.size,
            targetIp: deviceIp,
            content: array
          };

          console.log('Sending file data...', { name: fileData.name, size: fileData.size });
          await this.send(fileData);
          console.log('File sent successfully');
          resolve();
        } catch (error) {
          console.error('Error sending file:', error);
          reject(error);
        }
      };

      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        reject(error);
      };
      
      reader.readAsArrayBuffer(file);
    });
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
