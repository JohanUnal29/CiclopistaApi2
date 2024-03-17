import { Router } from "express";
import { productController } from "../controllers/products.controller.js";
import { productValidator } from "../middlewares/product.js";
import { checkAdmin } from "../middlewares/auth.js";
import { __dirname } from "../config.js";
import multer from "multer"

const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,`/../IMG/products`)
    },
    filename:function(req,file,cb){
        cb(null,`${Date.now()}-${file.originalname}`)
    }
});

const upload = multer({ storage: storage });

const router = Router();

router.get("/", productController.getPaginatedProducts);
router.get("/all", productController.getProducts);
router.get("/:category", productController.getProductsByCategory);
router.get("/id/:pid", productController.getProductById);
//, productController.addProduct
router.post("/addproduct/:uid", upload.single("image"), (req, res) => {
    const imageName = req.file.filename
  
    // Save this data to a database probably
  
    console.log(imageName)
    res.send({imageName})
})//quitar el check admin para test
router.put("/:pid/:uid", checkAdmin, productController.updateProduct);
router.delete("/:pid/:uid", checkAdmin, productController.deleteProduct);

export default router;