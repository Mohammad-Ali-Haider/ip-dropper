export class WebSocketService {
  private ws: WebSocket | null = null;
  private static instance: WebSocketService;

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
          const fileData = {
            type: 'file',
            name: file.name,
            size: file.size,
            targetIp: deviceIp,
            content: reader.result,
          };

          this.ws?.send(JSON.stringify(fileData));
          resolve();
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = (error) => reject(error);
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