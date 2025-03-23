import express from "express";
import {
  getCurrentDevice,
  getDeviceStatus,
  getDeviceType,
  sendFile,
} from "../controllers/index.js";

const router = express.Router();

router.get("/current", getCurrentDevice);
router.get("/:ip/status", getDeviceStatus);
router.get("/:ip/type", getDeviceType);
router.post("/:ip/send", sendFile);

export default router;
