import express from "express";
import {
  getCurrentDevice,
  getAllDevices,
  addDevice,
  deleteDevice,
  updateDevice,
  getDeviceStatus,
  getDeviceType,
} from "../controllers/index.js";
import { validateDeviceFields } from "../middleware/deviceValidation.js";

const router = express.Router();

router.get("/current", getCurrentDevice);
router.get("/", getAllDevices);
router.post("/", validateDeviceFields, addDevice);
router.delete("/:name/:ip", deleteDevice);
router.put("/:name/:ip", validateDeviceFields, updateDevice);
router.get('/:ip/status', getDeviceStatus);
router.get('/:ip/type', getDeviceType);

export default router;
