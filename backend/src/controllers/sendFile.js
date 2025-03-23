import { WebSocketServer } from 'ws';
import path from 'path';
import fs from 'fs';

export function setupWebSocketServer(server) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws) => {
    console.log('New WebSocket connection');

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        
        if (data.type === 'file') {
          console.log(`Received file ${data.name} for ${data.targetIp}`);
          
          // Implement actual file transfer logic
          const { content, name, targetIp } = data;
          
          // Convert ArrayBuffer to Buffer - content is already an ArrayBuffer from FileReader
          const fileBuffer = Buffer.from(new Uint8Array(content));
          
          // Create directory for target device if it doesn't exist
          const targetDir = path.join(process.cwd(), 'uploads', targetIp);
          await fs.promises.mkdir(targetDir, { recursive: true });
          
          // Save file with timestamp to prevent overwrites
          const timestamp = new Date().getTime();
          const fileName = `${timestamp}-${name}`;
          const filePath = path.join(targetDir, fileName);
          
          try {
            await fs.promises.writeFile(filePath, fileBuffer);
            console.log(`File saved successfully: ${filePath}`);
          } catch (error) {
            console.error('Error saving file:', error);
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Failed to save file'
            }));
            return;
          }
          
          // Send acknowledgment back to client
          ws.send(JSON.stringify({
            type: 'response',
            status: 'success',
            fileName: data.name,
            targetIp: data.targetIp,
            timestamp: new Date().toISOString()
          }));
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: error.message
        }));
      }
    });
  });

  return wss;
}

// Keep the existing HTTP endpoint as a fallback
export async function sendFile(req, res) {
  try {
    const { ip } = req.params;
    res.json({
      message: 'Please use WebSocket connection for file transfers',
      timestamp: new Date().toISOString(),
      targetIp: ip,
      status: 'websocket_required'
    });
  } catch (error) {
    console.error('Error in sendFile:', error);
    res.status(500).json({ 
      error: 'Failed to handle request',
      details: error.message 
    });
  }
}
