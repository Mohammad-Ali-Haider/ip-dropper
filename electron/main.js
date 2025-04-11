const { app, BrowserWindow } = require("electron");
const path = require("path");
const { fork } = require("child_process");

let backendProcess;

function startBackend() {
  const backendPath = path.join(__dirname, "../backend/src/server.js");
  backendProcess = fork(backendPath, [], {
    // Pass necessary environment variables if needed
    // env: { ...process.env, YOUR_VAR: 'value' },
    // silent: true // Set to true to pipe stdout/stderr, false to inherit
  });

  backendProcess.on("message", (msg) => {
    console.log("Message from backend:", msg);
  });

  backendProcess.on("error", (err) => {
    console.error("Backend process error:", err);
  });

  backendProcess.on("exit", (code, signal) => {
    console.log(
      `Backend process exited with code ${code} and signal ${signal}`
    );
    // Optionally restart or handle the exit
  });

  console.log("Backend process started.");
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Load the index.html of the app.
  // VITE_DEV_SERVER_URL will be set if the frontend is running in development mode
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
    // Open dev tools in dev mode
    win.webContents.openDevTools();
  } else {
    // Load the index.html file from the build output
    win.loadFile(path.join(__dirname, "../frontend/dist/index.html"));
  }
}

app.whenReady().then(() => {
  startBackend();
  createWindow();
});

app.on("window-all-closed", () => {
  // On macOS it's common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit(); // This will trigger the 'will-quit' event
  }
});

// Quit backend process before the app closes
app.on("will-quit", () => {
  if (backendProcess) {
    console.log("Killing backend process...");
    backendProcess.kill();
    backendProcess = null;
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
