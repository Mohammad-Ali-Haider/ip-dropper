import { API_BASE_URL } from '../constants/api';

interface FileTransferEvent {
  type: 'fileTransfer';
  status: 'initiating' | 'inProgress' | 'completed' | 'failed';
  fileName: string;
  targetIp: string;
  progress?: number;
  error?: string;
}

interface FileAvailableEvent {
  type: 'fileAvailable';
  fileName: string;
  fileSize: number;
  downloadUrl: string;
  expiresIn: number;
}

type WebSocketEvent = FileTransferEvent | FileAvailableEvent;
type WebSocketEventListener = (event: WebSocketEvent) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private readonly maxReconnectDelay = 5000;
  private reconnectAttempts = 0;
  private eventListeners: WebSocketEventListener[] = [];
  private messageQueue: any[] = [];
  private isConnected = false;

  private _onFileAvailable: ((file: FileAvailableEvent) => void) | null = null;

  public setOnFileAvailable(callback: (file: FileAvailableEvent) => void) {
    this._onFileAvailable = callback;
  }

  // Add public method to check connection status
  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    const wsUrl = API_BASE_URL.replace('http', 'ws');
    console.log('Connecting to WebSocket:', wsUrl);
    
    try {
      this.ws = new WebSocket(`${wsUrl}/ws`);

      this.ws.onopen = () => {
        console.log('WebSocket connected successfully');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        if (this.reconnectTimeout) {
          clearTimeout(this.reconnectTimeout);
          this.reconnectTimeout = null;
        }
        
        // Process any queued messages
        while (this.messageQueue.length > 0) {
          const message = this.messageQueue.shift();
          this.send(message);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
        this.scheduleReconnect();
      };

      this.ws.onerror = (error) => {
        console.log('WebSocket error:', error);
        this.isConnected = false;
        this.ws?.close();
      };

      this.ws.onmessage = this.handleMessage.bind(this);
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      this.isConnected = false;
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout) return;

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), this.maxReconnectDelay);
    this.reconnectAttempts++;

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.connect();
    }, delay);
  }

  private handleMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(event.data) as WebSocketEvent;
      
      if (data.type === 'fileAvailable') {
        const isReceiving = localStorage.getItem("app.isReceiving");
        if (isReceiving === "true" && this._onFileAvailable) {
          this._onFileAvailable(data);
        } else {
          console.log('File available but receiving is disabled or no handler set:', data.fileName);
        }
      }
      
      this.eventListeners.forEach(listener => listener(data));
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  addEventListener(listener: WebSocketEventListener) {
    this.eventListeners.push(listener);
  }

  removeEventListener(listener: WebSocketEventListener) {
    this.eventListeners = this.eventListeners.filter(l => l !== listener);
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(data: any) {
    if (!this.isConnected) {
      console.log('WebSocket not connected, queuing message:', data);
      this.messageQueue.push(data);
      return;
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('Sending WebSocket message:', data);
      this.ws.send(JSON.stringify(data));
    }
  }
}

export const websocketService = new WebSocketService();
