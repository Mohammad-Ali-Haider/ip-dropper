# IP Dropper - Setup and Run Instructions

This document provides instructions for setting up and running the IP Dropper application on Windows and Mac systems.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18.18.0 or higher recommended)
- npm (comes with Node.js)

## Setup Instructions

### Windows

1. Double-click the `setup_windows.bat` file
2. Wait for the setup process to complete
3. If successful, you'll see a message indicating the setup is complete

### Mac

1. Open Terminal
2. Navigate to the directory containing the scripts
3. Make the setup script executable:
   ```
   chmod +x setup_mac.sh
   ```
4. Run the setup script:
   ```
   ./setup_mac.sh
   ```
5. Wait for the setup process to complete
6. If successful, you'll see a message indicating the setup is complete

## Running the Application

### Windows

1. Double-click the `run_windows.bat` file
2. The application will start and open in your default web browser
3. To stop the application, press `Ctrl+C` in the command window

### Mac

1. Open Terminal
2. Navigate to the directory containing the scripts
3. Make the run script executable (if you haven't already):
   ```
   chmod +x run_mac.sh
   ```
4. Run the script:
   ```
   ./run_mac.sh
   ```
5. The application will start and open in your default web browser
6. To stop the application, press `Ctrl+C` in the Terminal

## Troubleshooting

### Common Issues

1. **"npm is not installed" error**
   - Make sure Node.js is installed correctly
   - Verify that npm is in your system PATH

2. **"Failed to install dependencies" error**
   - Check your internet connection
   - Try running the setup script again
   - If the issue persists, try installing dependencies manually with `npm install`

3. **"Failed to start the application" error**
   - Make sure the setup was completed successfully
   - Check if any other applications are using the required ports (3000, 3001, 5173)
   - Try running the application manually with `npm run dev:web`

### Port Usage

The application dynamically selects available ports:

- **Frontend (Vite):** Default port 5173, automatically selects next available port if occupied
- **Backend API:** Default port 3000, automatically selects next available port if occupied
- **File Transfer Service:** Default port 3001, automatically selects next available port if occupied

## Additional Information

For more detailed information about the IP Dropper application, please refer to the main README.md file.
