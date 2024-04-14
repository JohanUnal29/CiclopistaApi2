import { Router } from "express";
import { productController } from "../controllers/products.controller.js";
import { productValidator } from "../middlewares/product.js";
import { checkAdmin } from "../middlewares/auth.js";
import { __dirname } from "../config.js";
import multer from "multer"


const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

router.get("/", productController.getPaginatedProducts);
router.get("/all", productController.getProducts);
router.get("/:category", productController.getProductsByCategory);
router.get("/id/:pid", productController.getProductById);
//, productController.addProduct
router.post("/addproduct/:uid", checkAdmin, upload.fields([{name:'image', maxCount: 1}]), productController.addProduct);
router.put("/:pid/:uid", checkAdmin, upload.fields([{name:'image', maxCount: 1}]), productController.updateProduct);
router.delete("/:pid/:uid", checkAdmin, productController.deleteProduct);

export default router;