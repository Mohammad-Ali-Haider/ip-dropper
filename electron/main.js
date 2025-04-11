const { app, BrowserWindow } = require("electron");
const path = require("path");
const { fork } = require("child_process");
const fs = require("fs");
const { dialog } = require("electron");

let backendProcess;

function startBackend() {
  const isPackaged = app.isPackaged;
  const backendSourceRelativePath = "backend/src/server.js";

  const backendPath = isPackaged
    ? path.join(app.getAppPath(), backendSourceRelativePath)
    : path.join(__dirname, "..", backendSourceRelativePath);

  console.log(
    `[Main Process] Attempting to start backend from: ${backendPath}`
  );
  console.log(`[Main Process] app.getAppPath(): ${app.getAppPath()}`);
  console.log(`[Main Process] __dirname: ${__dirname}`);
  console.log(`[Main Process] isPackaged: ${isPackaged}`);

  try {
    fs.accessSync(backendPath);
  } catch (error) {
    console.error(
      `[Main Process] Error: Backend script not found at ${backendPath}. Check build configuration (e.g., electron-builder 'files'/'extraResources').`,
      error
    );
    dialog.showErrorBox(
      "Startup Error",
      `Failed to locate the backend process script at:\n${backendPath}\n\nPlease check the installation or contact support.`
    );
    app.quit();
    return;
  }

  backendProcess = fork(backendPath, [], {
    stdio: "pipe",
  });

  backendProcess.stdout.on("data", (data) => {
    console.log(`[Backend STDOUT]: ${data.toString().trim()}`);
  });

  backendProcess.stderr.on("data", (data) => {
    console.error(`[Backend STDERR]: ${data.toString().trim()}`);
  });

  backendProcess.on("message", (msg) => {
    console.log("Message from backend:", msg);
  });

  backendProcess.on("error", (err) => {
    console.error("[Main Process] Backend process error event:", err);
  });

  backendProcess.on("exit", (code, signal) => {
    console.log(
      `[Main Process] Backend process exited with code ${code} and signal ${signal}`
    );
    backendProcess = null;
  });

  console.log("[Main Process] Backend process fork initiated.");
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
