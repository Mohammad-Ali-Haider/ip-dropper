import os from 'os';

/**
 * Controller function to handle GET requests for current device information
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>} - Resolves when response is sent
 */
export function getCurrentDevice(req, res) {
  try {
    const interfaces = os.networkInterfaces();
    const networkInterfaces = [];

    // Process all network interfaces
    Object.entries(interfaces).forEach(([name, addresses]) => {
      const interfaceInfo = {
        name,
        isInternal: false
      };

      addresses.forEach(addr => {
        if (addr.family === 'IPv4') {
          interfaceInfo.ipv4 = addr.address;
          interfaceInfo.isInternal = addr.internal;
        } else if (addr.family === 'IPv6') {
          interfaceInfo.ipv6 = addr.address;
          interfaceInfo.isInternal = addr.internal;
        }
      });

      networkInterfaces.push(interfaceInfo);
    });

    const deviceInfo = {
      name: os.hostname(),
      type: process.platform === 'win32' ? 'windows' : 
            process.platform === 'darwin' ? 'mac' : 
            process.platform === 'linux' ? 'linux' : 'unknown',
      interfaces: networkInterfaces
    };

    console.log('Current device network interfaces:', networkInterfaces);
    res.json(deviceInfo);
  } catch (error) {
    console.error('Error getting current device info:', error);
    res.status(500).json({ 
      error: "Failed to get device info",
      details: error.message 
    });
  }
}
