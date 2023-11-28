import { productService } from "../DAO/mongo/services/products.service.js";
import ProductDTO from "../DAO/DTO/products.dto.js";
import CustomError from "../DAO/mongo/services/errors/custom-error.js";
import EErros from "../DAO/mongo/services/errors/enum.js";

class ProductController {
  async getPaginatedProducts(req, res) {
    try {
      const ITEMS_PER_PAGE = 10;
      const page = req.query.page || 1;

      // Put all your query params in here//
      const query = {};
      const products = await productService.getPaginatedProducts(
        page,
        query,
        ITEMS_PER_PAGE
      );

      if (!products) {
        CustomError.createError({
          name: "Error-products",
          cause: "Products was not found",
          message: "Products was not found",
          code: EErros.DATABASES_READ_ERROR,
        });

        req.logger.debug({
          message: "Products was not found",
          Date: new Date().toLocaleTimeString(),
        });
      }

      return res.send({
        status: "Success",
        message: "Product found",
        payload: products,
      });
    } catch (error) {
      CustomError.createError({
        name: "Error-products",
        cause: "An error occurred while fetching products",
        message: "An error occurred while fetching products",
        code: EErros.DATABASES_READ_ERROR,
      });

      req.logger.error({
        message: "Products was not found",
        cause: error,
        Date: new Date().toLocaleTimeString(),
        stack: JSON.stringify(error.stack, null, 2),
      });
    }
  }

  async getProducts(req, res) {
    try {
      const products = await productService.getProducts();

      if (!products) {
        CustomError.createError({
          name: "Error-products",
          cause: "Products was not found",
          message: "Products was not found",
          code: EErros.DATABASES_READ_ERROR,
        });

        req.logger.debug({
          message: "Products was not found",
          Date: new Date().toLocaleTimeString(),
        });
      }

      return res.send({
        status: "Success",
        message: "Product found",
        payload: products,
      });
    } catch (error) {
      CustomError.createError({
        name: "Error-products",
        cause: "An error occurred while fetching products",
        message: "An error occurred while fetching products",
        code: EErros.DATABASES_READ_ERROR,
      });

      req.logger.error({
        message: "Products was not found",
        cause: error,
        Date: new Date().toLocaleTimeString(),
        stack: JSON.stringify(error.stack, null, 2),
      });
    }
  }

  async getProductsByCategory(req, res) {
    try {
      const productsCategory = req.params.category;
      const products = await productService.getProductsByCategory(
        productsCategory
      );

      if (!products) {
        CustomError.createError({
          name: "Error-product-by-category",
          cause: "Products was not found by category",
          message: "Products was not found by category",
          code: EErros.DATABASES_READ_ERROR,
        });
        req.logger.debug({
          message: "Products was not found by category",
          Date: new Date().toLocaleTimeString(),
        });
      }

      return res.send({
        status: "success",
        message: "product found",
        payload: products,
      });
    } catch (error) {
      CustomError.createError({
        name: "Error-product-by-category",
        cause: "An error occurred while fetching product by category",
        message: "An error occurred while fetching product by category",
        code: EErros.DATABASES_READ_ERROR,
      });
      req.logger.error({
        message: "Products was not found by category",
        cause: error,
        Date: new Date().toLocaleTimeString(),
        stack: JSON.stringify(error.stack, null, 2),
      });
    }
  }

  async getProductById(req, res) {
    try {
      const productId = req.params.pid;
      const product = await productService.getProductById(productId);

      if (!product) {
        CustomError.createError({
          name: "Error-product-by-id",
          cause: "Product was not found",
          message: "Product was not found",
          code: EErros.DATABASES_READ_ERROR,
        });
        req.logger.debug({
          message: "Products was not found by ID",
          Date: new Date().toLocaleTimeString(),
        });
      }

      return res.send({
        status: "Success",
        message: "Product found",
        payload: product,
      });
    } catch (error) {
      CustomError.createError({
        name: "Error-product-by-id",
        cause: "An error occurred while fetching product by ID",
        message: "An error occurred while fetching product by ID",
        code: EErros.DATABASES_READ_ERROR,
      });
      req.logger.error({
        message: "Products was not found by ID",
        cause: error,
        Date: new Date().toLocaleTimeString(),
        stack: JSON.stringify(error.stack, null, 2),
      });
    }
  }

  async addProduct(req, res) {
    const product = req.body;

    const productDTO = new ProductDTO(product);

    try {
      await productService.addProduct(productDTO);
      return res.send({ status: "OK", message: "Product successfully added" });
    } catch (error) {
      CustomError.createError({
        name: "Error-add-product",
        cause: "Error, failed to add the product",
        message: "Error, failed to add the product",
        code: EErros.DATABASES_READ_ERROR,
      });
      req.logger.error({
        message: "Error, failed to add the product",
        cause: error,
        Date: new Date().toLocaleTimeString(),
        stack: JSON.stringify(error.stack, null, 2),
      });
    }
  }

  async updateProduct(req, res) {
    try {
      const productId = req.params.pid;
      const changes = req.body;

      const updatedProduct = await productService.updateProduct(
        productId,
        changes
      );

      if (!updatedProduct) {
        CustomError.createError({
          name: "Error-update-product",
          cause: "Product was not found",
          message: "Product was not found",
          code: EErros.DATABASES_READ_ERROR,
        });
        req.logger.error({
          message: "Product was not found",
          cause: error,
          Date: new Date().toLocaleTimeString(),
          stack: JSON.stringify(error.stack, null, 2),
        });
      }

      return res.send({
        status: "OK",
        message: "Product successfully updated",
      });
    } catch (error) {
      CustomError.createError({
        name: "Error-update-product",
        cause: "An error occurred while updating product",
        message: "An error occurred while updating product",
        code: EErros.DATABASES_READ_ERROR,
      });
      req.logger.error({
        message: "An error occurred while updating product",
        cause: error,
        Date: new Date().toLocaleTimeString(),
        stack: JSON.stringify(error.stack, null, 2),
      });
    }
  }

  async deleteProduct(req, res) {
    try {
      const productId = req.params.pid;
      const deletedProduct = await productService.deleteProduct(productId);

      if (!deletedProduct) {
        CustomError.createError({
          name: "Error-delete-product",
          cause: "product does not exists",
          message: "product does not exists",
          code: EErros.DATABASES_READ_ERROR,
        });
        req.logger.error({
          message:
            "An error occurred while deleting product, product does not exists",
          Date: new Date().toLocaleTimeString(),
        });
      }

      return res.send({
        status: "OK",
        message: "Product deleted successfully",
      });
    } catch (error) {
      CustomError.createError({
        name: "Error-delete-product",
        cause: "An error occurred while deleting product",
        message: "An error occurred while deleting product",
        code: EErros.DATABASES_READ_ERROR,
      });
      req.logger.error({
        message: "An error occurred while deleting product",
        cause: error,
        Date: new Date().toLocaleTimeString(),
        stack: JSON.stringify(error.stack, null, 2),
      });
    }
  }
}

export const productController = new ProductController();
