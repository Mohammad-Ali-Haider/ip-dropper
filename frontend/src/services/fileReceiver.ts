import { WebSocketService } from './websocketService';

export class FileReceiver {
  private ws: WebSocketService;
  private downloadDirectory: string;

  constructor(downloadDirectory: string = '') {
    this.ws = WebSocketService.getInstance();
    this.downloadDirectory = downloadDirectory;
  }

  async startReceiving(deviceIp: string): Promise<void> {
    await this.ws.connect();
    
    // Register as a receiving device
    await this.ws.send({
      type: 'device-register',
      ip: deviceIp
    });

    this.ws.onMessage((data) => {
      if (data.type === 'incoming-file') {
        this.handleIncomingFile(data);
      }
    });
  }

  private handleIncomingFile(fileData: any) {
    // Convert array buffer to blob
    const blob = new Blob([fileData.content]);
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = fileData.name;
    
    // Trigger download
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  stopReceiving() {
    this.ws.disconnect();
  }
}