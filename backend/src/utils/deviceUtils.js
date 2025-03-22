import os from 'os';

export async function getDeviceInfo() {
  try {
    // Get network interfaces
    const interfaces = os.networkInterfaces();
    let ipAddress = '';

    // Find the first non-internal IPv4 address
    Object.keys(interfaces).forEach((ifname) => {
      interfaces[ifname].forEach((iface) => {
        if (iface.family === 'IPv4' && !iface.internal) {
          ipAddress = iface.address;
        }
      });
    });

    // Determine OS type
    let deviceType = 'windows';
    const platform = os.platform().toLowerCase();
    
    if (platform.includes('darwin')) {
      deviceType = 'mac';
    } else if (platform.includes('linux')) {
      deviceType = 'linux';
    }

    // Get hostname as device name
    const deviceName = os.hostname();

    return {
      name: deviceName,
      ipaddress: ipAddress,
      type: deviceType,
      status: 'online'
    };
  } catch (error) {
    console.error('Error getting device info:', error);
    throw error;
  }
}