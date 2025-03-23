import express from "express";
import {
  getCurrentDevice,
  getAllDevices,
  getDeviceStatus,
  getDeviceType,
  sendFile,
} from "../controllers/index.js";

const router = express.Router();

router.get("/current", getCurrentDevice);
router.get("/", getAllDevices);
router.get('/:ip/status', getDeviceStatus);
router.get('/:ip/type', getDeviceType);
router.post('/:ip/send', sendFile);
// router.put('/current/receiving', updateCurrentDeviceReceiving);

export default router;
