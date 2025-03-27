/**
 * Ping module for network connectivity checks
 */
import ping from 'ping';

/**
 * Controller to check if a device is online by pinging its IP address
 * @param {Object} req - Express request object containing IP address in params
 * @param {Object} res - Express response object
 * @returns {Promise<void>} JSON response with device online status
 * 
 * Response format success: { isOnline: boolean }
 * Response format error: { error: string, details: string }
 */
export async function getDeviceStatus(req, res) {
  const { ip } = req.params;
  
  try {
    const pingResult = await ping.promise.probe(ip, {
      timeout: 2,      // Timeout in seconds
      min_reply: 1     // Minimum number of replies needed
    });
    
    const status = {
      isOnline: pingResult.alive
    };

    res.json(status);
    
  } catch (pingError) {
    res.status(500).json({
      error: "Failed to ping device",
      details: pingError.message
    });
  }
}
