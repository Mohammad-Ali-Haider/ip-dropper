import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import deviceRouter from './routes/deviceRoutes.js';
import { deviceManager } from './services/DeviceManager.js';

const app = express();
const server = createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/devices', deviceRouter);

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Graceful shutdown
const shutdown = async () => {
  console.log('Server shutting down...');
  
  try {
    // Wait for cleanup to complete
    await deviceManager.cleanup();
    console.log('Device cleanup completed');
    
    // Close server after cleanup
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

// Use once to prevent multiple shutdown attempts
process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);

export { app, server };
