import net from "net";

/**
 * Checks if a port is available
 * @param {number} port - The port to check
 * @returns {Promise<boolean>} - True if port is available, false otherwise
 */
export function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once("error", (err) => {
      if (err.code === "EADDRINUSE") {
        resolve(false);
      } else {
        // Other errors could mean the port is not usable for other reasons
        resolve(false);
      }
    });

    server.once("listening", () => {
      // Close the server and resolve with true (port is available)
      server.close(() => {
        resolve(true);
      });
    });

    server.listen(port);
  });
}

// Keep track of allocated ports to avoid conflicts
const allocatedPorts = new Set();

/**
 * Finds the next available port starting from the given port
 * @param {number} startPort - The port to start checking from
 * @param {number} maxAttempts - Maximum number of ports to check
 * @returns {Promise<number>} - The next available port or -1 if none found
 */
export async function findAvailablePort(startPort, maxAttempts = 20) {
  // Ensure startPort is a number
  startPort = parseInt(startPort, 10);
  if (isNaN(startPort)) startPort = 3000;

  for (let port = startPort; port < startPort + maxAttempts; port++) {
    // Skip if this port is already allocated in this process
    if (allocatedPorts.has(port)) {
      continue;
    }

    if (await isPortAvailable(port)) {
      // Mark this port as allocated
      allocatedPorts.add(port);
      return port;
    }
  }
  return -1; // No available port found
}

/**
 * Exports the port information for other processes to use
 * @param {Object} ports - Object containing port information
 * @returns {void}
 */
export function exportPorts(ports) {
  // Make ports available to the process environment
  process.env.API_PORT = ports.apiPort.toString();
  process.env.TRANSFER_PORT = ports.transferPort.toString();

  // Log the ports for debugging
  console.log(
    `[PORT INFO] API Port: ${ports.apiPort}, Transfer Port: ${ports.transferPort}`
  );
}
