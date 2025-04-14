// Connect to local backend with dynamic port support
// The port can be set via VITE_API_PORT environment variable or defaults to 3000
const apiPort = import.meta.env.VITE_API_PORT || 3000;
export const API_BASE_URL = `http://localhost:${apiPort}`;
