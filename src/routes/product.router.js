import { Router } from "express";
import { productController } from "../controllers/products.controller.js";
import { productValidator } from "../middlewares/product.js";
import { checkAdmin } from "../middlewares/auth.js";

const router = Router();

router.get("/", productController.getPaginatedProducts);
router.get("/all", productController.getProducts);
router.get("/:category", productController.getProductsByCategory);
router.get("/id/:pid", productController.getProductById);
router.post("/addproduct", checkAdmin, productValidator, productController.addProduct);//quitar el check admin para test
router.put("/:pid", checkAdmin, productController.updateProduct);
router.delete("/:pid", checkAdmin, productController.deleteProduct);

export default router;