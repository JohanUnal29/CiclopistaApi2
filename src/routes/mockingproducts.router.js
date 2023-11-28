import { Router } from "express";
import { generateProduct } from "../utils/faker.js";

const router = Router();

router.get("/", async (req, res) => {
  const product = [];

  for (let i = 0; i < 100; i++) {
    product.push(generateProduct());
  }

  res.send({ status: "success", payload: product });
});

export default router;