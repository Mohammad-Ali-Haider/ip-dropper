import express from "express";
import multer from "multer";
import {
  getCurrentDevice,
  getDeviceStatus,
  getDeviceType,
  sendFile,
} from "../controllers/index.js";

/**
 * Express router for handling device-related routes
 * @type {express.Router}
 */
const router = express.Router();

/**
 * Multer storage configuration for file uploads
 * Specifies destination directory and filename generation
 */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/tmp/ip-dropper-uploads') // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
});

/**
 * Multer middleware instance configured with storage settings
 */
const upload = multer({ storage: storage });

/**
 * GET /api/devices/current
 * Returns information about the current device
 */
router.get("/current", getCurrentDevice);

/**
 * GET /api/devices/:ip/status
 * Returns the online/offline status of a device with the specified IP
 */
router.get("/:ip/status", getDeviceStatus);

/**
 * GET /api/devices/:ip/type
 * Returns the device type (windows/mac/linux) for the specified IP
 */
router.get("/:ip/type", getDeviceType);

/**
 * POST /api/devices/:ip/send
 * Sends a file to the device with the specified IP
 * Expects a file upload with field name 'file'
 */
router.post("/:ip/send", upload.single('file'), sendFile);

export default router;
