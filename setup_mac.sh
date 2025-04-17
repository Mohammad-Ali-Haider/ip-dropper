#!/bin/bash

echo "IP Dropper - Setup Script for Mac"
echo "=================================="
echo

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed."
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Navigate to the script's directory
cd "$(dirname "$0")"

echo "Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo
    echo "Error: Failed to install dependencies."
    exit 1
fi

echo
echo "Setup completed successfully!"
echo "To run the application, use the run_mac.sh script."
echo "Note: You may need to make the run script executable with: chmod +x run_mac.sh"
echo
