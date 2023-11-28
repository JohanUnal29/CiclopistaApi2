import { Router } from "express";
import { userManagerController } from "../controllers/userManager.controller.js";
import { checkAdmin } from "../middlewares/auth.js";

const router = Router();

router.get("/", userManagerController.getPaginatedUsers);
router.put("/:pid", checkAdmin, userManagerController.updateUser);
router.delete("/:pid", checkAdmin, userManagerController.deleteUser);

export default router;