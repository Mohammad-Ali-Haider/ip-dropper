# IP Dropper - Installation Guide

This guide provides step-by-step instructions for setting up and running IP Dropper on both Windows and macOS.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18.18.0 or higher recommended)
- npm (comes with Node.js)

## Installation and Setup

Choose the instructions for your operating system:

### Windows

#### Option 1: Using the Provided Scripts (Recommended)

1. **Setup (First Time Only)**
   - Navigate to the project folder in File Explorer
   - Double-click the `setup-windows.bat` file
   - Wait for the installation to complete (this may take a few minutes)
   - The command window will close automatically when finished

2. **Running the Application**
   - Double-click the `run-windows.bat` file
   - The application will start in development mode
   - A browser window should open automatically at http://localhost:5173
   - To stop the application, press `Ctrl+C` in the command window and then `Y` to confirm

#### Option 2: Using Command Prompt

1. **Setup (First Time Only)**
   ```cmd
   cd path\to\ip-dropper
   npm install
   ```

2. **Running the Application**
   ```cmd
   cd path\to\ip-dropper
   npm run dev
   ```

### macOS

#### Option 1: Using the Provided Scripts (Recommended)

1. **Setup (First Time Only)**
   - Navigate to the project folder in Finder
   - Right-click (or Control-click) on `setup-mac.command` and select "Open"
   - If prompted with a security warning, click "Open" to confirm
   - Wait for the installation to complete (this may take a few minutes)
   - The terminal window will close automatically when finished

2. **Running the Application**
   - Double-click the `run-mac.command` file
   - If prompted with a security warning, click "Open" to confirm
   - The application will start in development mode
   - A browser window should open automatically at http://localhost:5173
   - To stop the application, press `Ctrl+C` in the terminal window

#### Option 2: Using Terminal

1. **Setup (First Time Only)**
   ```bash
   cd /path/to/ip-dropper
   npm install
   ```

2. **Running the Application**
   ```bash
   cd /path/to/ip-dropper
   npm run dev
   ```

## Troubleshooting

### Windows Issues

- **Script Won't Run**: Make sure you have administrator privileges or try running the script by right-clicking and selecting "Run as administrator"
- **Node.js Not Found**: Ensure Node.js is properly installed and added to your PATH environment variable

### macOS Issues

- **Permission Denied**: If you see "Permission Denied" when trying to run the scripts, open Terminal and run:
  ```bash
  chmod +x setup-mac.command run-mac.command
  ```
  
- **"Unidentified Developer" Warning**: Right-click (or Control-click) the script file and select "Open" instead of double-clicking it

- **Script Won't Execute**: If the script still won't run, try opening it with Terminal:
  ```bash
  ./setup-mac.command
  ```
  or
  ```bash
  ./run-mac.command
  ```
