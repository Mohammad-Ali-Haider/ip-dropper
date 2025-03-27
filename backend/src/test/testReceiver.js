import net from 'net';

const TRANSFER_PORT = 3001;

// Create a simple TCP server
const server = net.createServer((socket) => {
  console.log('Client connected');
  
  socket.on('data', (data) => {
    console.log('Received data:', data.toString());
  });
  
  socket.on('end', () => {
    console.log('Client disconnected');
  });
});

server.listen(TRANSFER_PORT, () => {
  console.log(`Test receiver listening on port ${TRANSFER_PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${TRANSFER_PORT} is already in use`);
  } else {
    console.log('Server error:', err);
  }
});