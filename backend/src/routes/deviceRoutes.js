import express from "express";
import multer from "multer";
import {
  getCurrentDevice,
  getDeviceStatus,
  getDeviceType,
  sendFile,
} from "../controllers/index.js";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "/tmp/ip-dropper-uploads"); // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const upload = multer({ storage: storage });

router.get("/current", getCurrentDevice);
router.get("/:ip/status", getDeviceStatus);
router.get("/:ip/type", getDeviceType);
router.post("/:ip/send", upload.single("file"), sendFile);

export default router;
