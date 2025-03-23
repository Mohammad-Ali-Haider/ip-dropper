export function getDeviceType(req, res) {
  try {
    const { ip } = req.params;
    // console.log("Checking Type for device:", { name, ip });
    // console.log('Available devices:', deviceManager.getDevices());

    res.json({
      type: ["windows", "mac", "linux"][Math.floor(Math.random() * 3)],
      // isOnline: device.status === 'online',
      // isReceiving: device.isReceiving || false
    });
  } catch (error) {
    console.error("Error getting device status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
