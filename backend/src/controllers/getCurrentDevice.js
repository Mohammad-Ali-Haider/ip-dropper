/**
 * Imports the utility function for retrieving device information
 */
import { getDeviceInfo } from "../utils/deviceUtils.js";

/**
 * Controller function to handle GET requests for current device information
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>} - Resolves when response is sent
 */
export async function getCurrentDevice(req, res) {
  try {
    // Get current device information using utility function
    const deviceInfo = await getDeviceInfo();
    // Send device info as JSON response
    res.json(deviceInfo);
  } catch (error) {
    // Log and handle any errors that occur
    console.error("Error getting current device info:", error);
    res.status(500).json({
      error: "Failed to get current device info",
      details: error.message,
    });
  }
}
