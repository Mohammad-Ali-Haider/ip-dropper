#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd "$DIR"

echo "====================================="
echo "  IP Dropper - Setup Script (macOS)  "
echo "====================================="
echo ""
echo "This script will install all dependencies for IP Dropper."
echo "Please wait, this may take a few minutes..."
echo ""

npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Setup completed successfully!"
    echo ""
    echo "You can now run the application by double-clicking the 'run-mac.command' file."
    echo ""
    echo "Press any key to exit..."
    read -n 1
else
    echo ""
    echo "❌ Setup failed. Please check the error messages above."
    echo ""
    echo "Press any key to exit..."
    read -n 1
    exit 1
fi
