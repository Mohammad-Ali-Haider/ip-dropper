import { deviceManager } from "../services/DeviceManager.js";

export function getDeviceStatus(req, res) {
  try {
    const { name, ip } = req.params;
    console.log("Checking status for device:", { name, ip });
    // console.log('Available devices:', deviceManager.getDevices());

    const device = deviceManager
      .getDevices()
      .find((d) => d.name === name && d.ipaddress === ip);

    if (!device) {
      return res.status(404).json({ error: "Device not found" });
    }

    res.json({
      isOnline: true,
      // isOnline: device.status === 'online',
      // isReceiving: device.isReceiving || false
    });
  } catch (error) {
    console.error("Error getting device status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
