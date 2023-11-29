import { Router } from "express";
import { productController } from "../controllers/products.controller.js";
import { productValidator } from "../middlewares/product.js";
import {checkAdmin} from "../middlewares/auth.js";

const router = Router();

router.get("/", productController.getPaginatedProducts);
router.get("/all", productController.getProducts);
router.get("/:category", productController.getProductsByCategory);
router.get("/id/:pid", productController.getProductById);
router.post("/addproduct/:uid", checkAdmin, productValidator, productController.addProduct);//quitar el check admin para test
router.put("/:pid/:uid", checkAdmin, productController.updateProduct);
router.delete("/:pid/:uid", checkAdmin, productController.deleteProduct);

export default router;