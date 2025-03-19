import { WebSocketServer } from 'ws';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 8080;
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR);
}

const wss = new WebSocketServer({ 
    port: PORT,
    host: '0.0.0.0'  // Listen on all network interfaces
});

console.log(`File receiver running on port ${PORT}`);

wss.on('connection', (ws, req) => {
    const clientIP = req.socket.remoteAddress;
    console.log(`New connection from ${clientIP}`);

    let writeStream = null;
    let currentFile = '';

    ws.on('message', (data, isBinary) => {
        if (!isBinary) {
            try {
                const message = JSON.parse(data.toString());
                
                if (message.type === 'metadata') {
                    currentFile = path.join(UPLOADS_DIR, message.filename);
                    console.log(`Receiving: ${message.filename}`);
                    writeStream = fs.createWriteStream(currentFile);
                } else if (message.type === 'end') {
                    writeStream?.end();
                    console.log(`Completed: ${currentFile}`);
                }
            } catch (err) {
                console.error('Error:', err);
            }
        } else if (writeStream) {
            writeStream.write(data);
        }
    });

    ws.on('close', () => {
        writeStream?.end();
        console.log(`Connection from ${clientIP} closed`);
    });
});

