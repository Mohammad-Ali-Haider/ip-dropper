#!/bin/bash

# Get the directory where the script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Change to the project directory
cd "$DIR"

# Print welcome message
echo "====================================="
echo "  IP Dropper - Run Script (macOS)    "
echo "====================================="
echo ""
echo "Starting IP Dropper in development mode..."
echo "The application will open in a new window."
echo ""
echo "To stop the application, press Ctrl+C in this terminal window."
echo ""

# Run the application
npm run dev

# Keep terminal open if there's an error
if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Application exited with an error."
    echo ""
    echo "Press any key to exit..."
    read -n 1
    exit 1
fi
