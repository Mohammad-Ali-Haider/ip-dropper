# IP Dropper

IP Dropper is a cross-platform desktop application that allows seamless file transfer and device management over a local network. It combines a **React** frontend, a **Node.js/Express** backend, and an **Electron** wrapper to provide a smooth user experience on the desktop.

---

## Features

- **Device Discovery:** Detect devices connected to the same network.
- **File Transfer:** Send and receive files between devices easily.
- **Device Management:** Add, edit, and remove devices with custom details.
- **Real-time Status:** View device connection status and transfer progress.
- **Cross-Platform:** Runs as a desktop app via Electron.
- **Modern UI:** Built with React, TypeScript, and Vite for fast, responsive interface.

---

## Architecture Overview

### Frontend (React + Vite)
- Located in `/frontend`
- Built with **React** and **TypeScript**
- Uses **Vite** for fast development and build
- Provides UI components for device list, file upload, modals, and more
- Communicates with backend via REST APIs and WebSockets (if applicable)

### Backend (Node.js + Express)
- Located in `/backend`
- REST API server built with **Express.js**
- Handles device management, file transfer endpoints, and network operations
- Contains controllers, routes, services, and utility modules

### Electron
- Located in `/electron`
- Wraps the frontend and backend into a single desktop application
- Manages the app lifecycle and native OS integration

---

## Technologies Used

- **Frontend:** React, TypeScript, Vite
- **Backend:** Node.js, Express.js
- **Desktop:** Electron
- **Styling:** CSS Modules
- **Package Management:** npm
- **Version Control:** Git

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- npm (comes with Node.js)

---

## Important: Port Usage

Make sure that **ports 3000 and 3001** on your machine are free and not occupied by other applications. The frontend development server runs on port **3000**, and the backend server runs on port **3001** by default. If these ports are in use, the application may fail to start properly.

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Mohammad-Ali-Haider/ip-dropper.git ip-dropper
cd ip-dropper
```

### 2. Install Dependencies

At the root of the project, run:

```bash
npm install
```

This installs all necessary dependencies for the frontend, backend, and Electron app.

### 3. Run the Application

To start the Electron app with both frontend and backend:

```bash
npm run dev
```

or to run the web version only:

```bash
npm run dev:web
```

This will launch the desktop or web application accordingly.

---

## Project Structure

```
root/
├── backend/          # Node.js backend server
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
├── frontend/         # React frontend app
│   ├── src/
│   ├── public/
│   └── package.json
├── electron/         # Electron main process code
│   └── main.js
├── package.json      # Root package.json with scripts and dependencies
└── README.md         # This file
```

---

## Usage

- Launch the app and ensure devices are connected to the same local network.
- Add devices manually or discover automatically (if supported).
- Select files to send to a device.
- Accept incoming file transfers on the receiving device.

---

## License

This project is licensed under the MIT License.
