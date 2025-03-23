import ping from 'ping';

export async function getDeviceStatus(req, res) {
  try {
    const { ip } = req.params;
    // console.log(`Checking status for IP: ${ip}`);

    try {
      const pingResult = await ping.promise.probe(ip, {
        timeout: 2,
        min_reply: 1
      });
      
      // console.log('Ping result:', pingResult);

      const status = {
        isOnline: pingResult.alive
      };

      // console.log('Sending status:', status);
      res.json(status);
    } catch (pingError) {
      console.error('Ping error:', pingError);
      res.status(500).json({
        error: "Failed to ping device",
        details: pingError.message
      });
    }

  } catch (error) {
    console.error("Error getting device status:", error);
    res.status(500).json({ 
      error: "Internal server error",
      details: error.message 
    });
  }
}




