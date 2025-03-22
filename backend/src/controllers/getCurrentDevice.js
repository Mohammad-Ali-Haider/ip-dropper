import { getDeviceInfo } from '../utils/deviceUtils.js';

export async function getCurrentDevice(req, res) {
  try {
    const deviceInfo = await getDeviceInfo();
    res.json({
      ...deviceInfo,
      status: 'offline',
      isReceiving: false
    });
  } catch (error) {
    console.error('Error getting current device info:', error);
    res.status(500).json({ 
      error: 'Failed to get current device info',
      details: error.message 
    });
  }
}
