import { Router } from "express";
import { lastSessionController } from "../controllers/lastSession.controller.js";
import {checkAdmin} from "../middlewares/auth.js";

const router = Router();

router.get("/all", lastSessionController.getSessionsHistory);
router.get("/:email", lastSessionController.getLastSessionByEmail);
router.delete("/deleteUsers", lastSessionController.deleteUser);

export default router;