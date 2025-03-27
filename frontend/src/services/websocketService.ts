import { API_BASE_URL } from '../constants/api';

interface FileTransferEvent {
  type: 'fileTransfer';
  status: 'initiating' | 'inProgress' | 'completed' | 'failed';
  fileName: string;
  targetIp: string;
  progress?: number;
  error?: string;
}

type WebSocketEventListener = (event: FileTransferEvent) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private readonly maxReconnectDelay = 5000;
  private reconnectAttempts = 0;
  private eventListeners: WebSocketEventListener[] = [];

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    const wsUrl = API_BASE_URL.replace('http', 'ws');
    this.ws = new WebSocket(`${wsUrl}/ws`);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.scheduleReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.ws?.close();
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
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

  private handleMessage(data: FileTransferEvent) {
    if (data.type === 'fileTransfer') {
      this.eventListeners.forEach(listener => listener(data));
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
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket is not connected');
    }
  }
}

export const websocketService = new WebSocketService();
