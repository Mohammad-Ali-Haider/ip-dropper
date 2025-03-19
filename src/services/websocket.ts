export class WebSocketService {
  private ws: WebSocket | null = null;
  private isConnecting: boolean = false;
  private connectionPromise: Promise<void> | null = null;
  private pingTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout = 1000;
  private eventListeners: Map<string, ((data: any) => void)[]> = new Map();

  private async ensureConnection(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    if (this.isConnecting) {
      return this.connectionPromise;
    }

    this.isConnecting = true;
    this.connectionPromise = this.connect();

    try {
      await this.connectionPromise;
    } finally {
      this.isConnecting = false;
      this.connectionPromise = null;
    }
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = import.meta.env.DEV ? 'ws://localhost:8080' : 'ws://' + window.location.host;
        this.ws = new WebSocket(wsUrl);

        // Add connection timeout
        const connectionTimeout = setTimeout(() => {
          if (this.ws?.readyState !== WebSocket.OPEN) {
            this.ws?.close();
            reject(new Error('Connection timeout'));
          }
        }, 5000);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          clearTimeout(connectionTimeout);
          this.setupMessageHandlers();
          this.reconnectAttempts = 0;
          this.reconnectTimeout = 1000;
          
          // Add periodic connection check
          setInterval(() => {
            if (this.ws?.readyState === WebSocket.OPEN) {
              this.ws.send(JSON.stringify({ type: 'heartbeat' }));
            } else {
              this.attemptReconnect();
            }
          }, 30000);
          
          resolve();
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private setupMessageHandlers() {
    if (!this.ws) return;

    this.ws.onmessage = (event) => {
      console.log('Received WebSocket message:', event.data);
      
      try {
        const message = JSON.parse(event.data);
        
        if (message.type === 'pong') {
          const timeoutId = this.pingTimeouts.get(message.deviceId);
          if (timeoutId) {
            clearTimeout(timeoutId);
            this.pingTimeouts.delete(message.deviceId);
            this.emit('deviceStatus', { deviceId: message.deviceId, status: 'online' });
          }
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    };
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect().catch(() => {
          // Exponential backoff
          this.reconnectTimeout *= 2;
        });
      }, this.reconnectTimeout);
    }
  }

  sendFile(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket is not connected'));
        return;
      }

      // Send metadata first
      const metadata = {
        type: 'metadata',
        filename: file.name,
        size: file.size
      };
      this.ws.send(JSON.stringify(metadata));

      // Send file data
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer && this.ws) {
          this.ws.send(reader.result);
          
          // Send end signal
          this.ws.send(JSON.stringify({ type: 'end' }));
          resolve();
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  pingDevice(deviceId: string): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.ensureConnection();
        
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
          console.error('WebSocket not connected when trying to ping:', deviceId);
          resolve(false);
          return;
        }

        console.log('Sending ping to device:', deviceId);

        // Set up timeout for ping response
        const timeoutId = setTimeout(() => {
          console.log('Ping timeout for device:', deviceId);
          this.pingTimeouts.delete(deviceId);
          resolve(false);
        }, 5000); // 5 second timeout

        this.pingTimeouts.set(deviceId, timeoutId);

        // Send ping message
        const pingMessage = {
          type: 'ping',
          deviceId
        };

        this.ws.send(JSON.stringify(pingMessage));
        console.log('Ping message sent successfully');
      } catch (error) {
        console.error('Error in pingDevice:', error);
        resolve(false);
      }
    });
  }

  private emit(event: string, data: any) {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(listener => listener(data));
  }

  addEventListener(event: string, callback: (data: any) => void) {
    const listeners = this.eventListeners.get(event) || [];
    listeners.push(callback);
    this.eventListeners.set(event, listeners);
  }

  removeEventListener(event: string, callback: (data: any) => void) {
    const listeners = this.eventListeners.get(event) || [];
    const index = listeners.indexOf(callback);
    if (index !== -1) {
      listeners.splice(index, 1);
      this.eventListeners.set(event, listeners);
    }
  }
}

// Export a singleton instance
export const wsService = new WebSocketService();


