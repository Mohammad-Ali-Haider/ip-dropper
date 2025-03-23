import { deviceManager } from '../services/DeviceManager.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';

// Configure multer for file upload
const upload = multer({
  dest: path.join(os.tmpdir(), 'ip-dropper-uploads'),
}).single('file');

export async function sendFile(req, res) {
  // Wrap multer middleware in a promise
  await new Promise((resolve, reject) => {
    upload(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  try {
    const { ip } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const { path: tempFilePath, originalname, size } = req.file;

    // Get the device from DeviceManager
    // const device = deviceManager.getDevices()
    //   .find(device => device.ipaddress === ip);

    // if (!device) {
    //   // Clean up temp file
    //   await fs.unlink(tempFilePath).catch(console.error);
    //   return res.status(404).json({ 
    //     error: 'Device not found',
    //     details: `No device found with IP address ${ip}`
    //   });
    // }

    try {
      // Get the WebSocket connection for this device
      const deviceId = `${device.name}-${device.ipaddress}`;
      const ws = deviceManager.getConnection(deviceId);

      if (!ws) {
        throw new Error('Device is not connected');
      }

      // Read the file
      const fileBuffer = await fs.readFile(tempFilePath);

      // Send file metadata first
      ws.send(JSON.stringify({
        type: 'file_transfer_start',
        data: {
          filename: originalname,
          size: size,
          timestamp: new Date().toISOString()
        }
      }));

      // Send the file content
      ws.send(fileBuffer);

      // Send transfer completion message
      ws.send(JSON.stringify({
        type: 'file_transfer_complete',
        data: {
          filename: originalname,
          timestamp: new Date().toISOString()
        }
      }));

      // Clean up temp file after sending
      await fs.unlink(tempFilePath).catch(console.error);

      res.json({
        message: 'File transfer initiated',
        device: device,
        file: {
          name: originalname,
          size: size
        }
      });

    } catch (error) {
      // Clean up temp file on error
      await fs.unlink(tempFilePath).catch(console.error);
      throw error;
    }

  } catch (error) {
    console.error('Error in sendFile:', error);
    res.status(500).json({ 
      error: 'Failed to send file',
      details: error.message 
    });
  }
}
