import os from "os";

/**
 * Determines the operating system type of the current device
 * @returns {string} Device type: "windows", "mac", or "linux"
 */
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

/**
 * Retrieves the first valid IPv4 address of the device
 * @returns {string} IPv4 address or "127.0.0.1" if no valid interface is found
 */
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

/**
 * Gathers device information including hostname, IP address, and OS type
 * @returns {Promise<Object>} Device information object containing name, ipaddress, and type
 * @throws {Error} If device information cannot be retrieved
 */
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
