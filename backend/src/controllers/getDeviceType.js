export function getDeviceType(req, res) {
  try {
    const { ip } = req.params;
    // console.log("Checking Type for device:", { name, ip });
    // console.log('Available devices:', deviceManager.getDevices());

    res.json({
      type: "",
      // type: ["windows", "mac", "linux"][Math.floor(Math.random() * 3)],
    });
  } catch (error) {
    console.error("Error getting device status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
