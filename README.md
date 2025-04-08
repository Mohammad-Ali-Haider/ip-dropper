# IP Dropper Desktop App

An Electron-based desktop application that combines a React frontend and Node.js backend.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- npm (comes with Node.js)

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

This installs all necessary dependencies for the frontend, backend.

### 3. Run the Application

To start the Electron app with both frontend and backend:

```bash
npm run dev
```

or

```bash
npm run dev:web
```

This will launch the desktop application.

## Project Structure

```
root/
├── backend/          # Node.js backend server
├── frontend/         # React frontend app
├── electron/         # Electron main process code
│   └── main.js
├── package.json      # Root package.json with scripts and dependencies
└── README.md         # This file
```
