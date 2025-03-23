interface FileMetadata {
  filename: string;
  size: number;
  timestamp: string;
}

class FileReceiver {
  private ws: WebSocket;
  private currentFile: FileMetadata | null = null;
  private chunks: Uint8Array[] = [];

  constructor(ws: WebSocket) {
    this.ws = ws;
    this.setupListeners();
  }

  private setupListeners() {
    this.ws.onmessage = (event) => {
      if (typeof event.data === 'string') {
        // Handle metadata messages
        const message = JSON.parse(event.data);
        
        switch (message.type) {
          case 'file_transfer_start':
            this.handleTransferStart(message.data);
            break;
          
          case 'file_transfer_complete':
            this.handleTransferComplete(message.data);
            break;
        }
      } else {
        // Handle binary data (file chunks)
        this.handleFileChunk(event.data);
      }
    };
  }

  private handleTransferStart(metadata: FileMetadata) {
    console.log('Starting file transfer:', metadata);
    this.currentFile = metadata;
    this.chunks = [];
  }

  private handleFileChunk(chunk: Blob) {
    if (!this.currentFile) return;
    
    // Convert blob to Uint8Array
    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      this.chunks.push(new Uint8Array(arrayBuffer));
    };
    reader.readAsArrayBuffer(chunk);
  }

  private async handleTransferComplete(metadata: FileMetadata) {
    if (!this.currentFile) return;

    // Combine chunks into a single file
    const blob = new Blob(this.chunks);
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = metadata.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Reset state
    this.currentFile = null;
    this.chunks = [];
  }
}

export const initializeFileReceiver = (ws: WebSocket) => {
  return new FileReceiver(ws);
};