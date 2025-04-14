import net from "net";

// Use the dynamic transfer port from environment or default to 3001
const TRANSFER_PORT = process.env.TRANSFER_PORT || 3001;

const server = net.createServer((socket) => {
  console.log("Client connected");

  socket.on("data", (data) => {
    console.log("Received data:", data.toString());
  });

  socket.on("end", () => {
    console.log("Client disconnected");
  });
});

server.listen(TRANSFER_PORT, () => {
  console.log(`Test receiver listening on port ${TRANSFER_PORT}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.log(`Port ${TRANSFER_PORT} is already in use`);
  } else {
    console.log("Server error:", err);
  }
});
