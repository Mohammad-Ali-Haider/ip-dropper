#!/bin/bash

echo "IP Dropper - Run Script for Mac"
echo "=============================="
echo

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed."
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Navigate to the script's directory
cd "$(dirname "$0")"

echo "Starting IP Dropper..."
echo
echo "The application will open in your default web browser."
echo "Press Ctrl+C to stop the application."
echo

npm run dev:web

if [ $? -ne 0 ]; then
    echo
    echo "Error: Failed to start the application."
    exit 1
fi
