import os from "os";

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
  Object.keys(interfaces).forEach((ifname) => {
    interfaces[ifname].forEach((iface) => {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    });
  });
}

export async function getDeviceInfo() {
  try {
    const ipAddress = getIP();
    if (!ipAddress) throw new Error("No valid network interface found");

    const deviceType = getOS();
    const deviceName = os.hostname();

    return {
      name: deviceName,
      ipaddress: ipAddress,
      type: deviceType,
      status: "online",
      isReceiving: false,
    };
  } catch (error) {
    console.error("Error getting device info:", error);
    throw error;
  }
}
