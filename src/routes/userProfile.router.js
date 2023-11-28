import { Router } from "express";
import { userProfileController } from "../controllers/userProfile.controller.js";

const router = Router();

router.post("/addprofileimage", userProfileController.addProfileImage);
router.get("/email/:email", userProfileController.getImageByEmail);

export default router;