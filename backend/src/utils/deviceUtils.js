import os from 'os';

function getOS() {
  let deviceType = "windows";
  const platform = os.platform().toLowerCase();

  if (platform.includes("darwin")) {
    deviceType = "mac";
  } else if (platform.includes("linux")) {
    deviceType = "linux";
  }

  return deviceType;
}

function getIP() {
  const interfaces = os.networkInterfaces();
  const validInterface = Object.values(interfaces)
    .flat()
    .find(
      (iface) =>
        iface.family === "IPv4" &&
        !iface.internal &&
        iface.address !== "127.0.0.1"
    );

  if (!validInterface) {
    return "127.0.0.1";
  }

  return validInterface.address;
}

export async function getDeviceInfo() {
  try {
    const ipAddress = getIP();
    const deviceType = getOS();
    const deviceName = os.hostname();

    return {
      name: deviceName,
      ipaddress: ipAddress,
      type: deviceType,
    };
  } catch (error) {
    console.error("Error getting device info:", error);
    throw error;
  }
}
