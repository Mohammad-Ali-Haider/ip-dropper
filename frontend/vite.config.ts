import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { createServer } from 'http'
import { isPortAvailable } from '../backend/src/utils/portUtils.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    base: './', // Use relative paths for assets in production build
    server: {
      // Try to use the default port 5173, or find next available port
      port: 5173,
      strictPort: false, // Allow Vite to automatically try the next available port
      // Pass API port to frontend
      define: {
        'import.meta.env.VITE_API_PORT': JSON.stringify(process.env.API_PORT || env.API_PORT || 3000)
      }
    }
  }
})
