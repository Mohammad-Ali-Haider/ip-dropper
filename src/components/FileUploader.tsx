import { useEffect, useState } from 'react';
import { wsService } from '../services/websocket';

export function FileUploader() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    wsService.connect()
      .then(() => setIsConnected(true))
      .catch(console.error);

    return () => {
      wsService.disconnect();
    };
  }, []);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await wsService.sendFile(file);
      console.log('File sent successfully');
    } catch (error) {
      console.error('Error sending file:', error);
    }
  };

  return (
    <div>
      <p>WebSocket Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      <input
        type="file"
        onChange={handleFileSelect}
        disabled={!isConnected}
      />
    </div>
  );
}