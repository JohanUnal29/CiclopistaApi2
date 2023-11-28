import productsModel from "../models/products.model.js";
import EErros from "./errors/enum.js";
import CustomError from "./errors/custom-error.js";

class ProductService {
  getProducts = async () => {
    try {
      const products = await productsModel.find().lean();
      return products;
    } catch (error) {
      CustomError.createError({
        name: "Error-GET-products-IN-SERVICE",
        cause: "Products was not found",
        message: "Products was not found",
        code: EErros.DATABASES_READ_ERROR,
      });

      req.logger.error({
        message: "Error-GET-products-IN-SERVICE",
        cause: error,
        Date: new Date().toLocaleTimeString(),
        stack: JSON.stringify(error.stack, null, 2),
      });
    }
  };

  getPaginatedProducts = async (page, query, ITEMS_PER_PAGE) => {
    try {
      const skip = (page - 1) * ITEMS_PER_PAGE; // 1 * 20 = 20

      const countPromise = productsModel.estimatedDocumentCount(query);

      const itemsPromise = productsModel
        .find(query)
        .limit(ITEMS_PER_PAGE)
        .skip(skip);

      const [count, products] = await Promise.all([countPromise, itemsPromise]);

      const pageCount = count / ITEMS_PER_PAGE; // 400 items / 20 = 20

      return {
        pagination: {
          count,
          pageCount,
        },
        products,
      };
    } catch (error) {
      CustomError.createError({
        name: "Error-GET-products-IN-SERVICE",
        cause: "Products was not found",
        message: "Products was not found",
        code: EErros.DATABASES_READ_ERROR,
      });
    }
  };

  addProduct = async (product) => {
    try {
      const createdProduct = await productsModel.create(product);
      return createdProduct;
    } catch (error) {
      CustomError.createError({
        name: "Error-add-products-IN-SERVICE",
        cause: "Error, failed to add the product",
        message: "Error, failed to add the product",
        code: EErros.DATABASES_READ_ERROR,
      });
    }
  };

  getProductById = async (id) => {
    try {
      const product = await productsModel.findOne({ _id: id }).lean();
      return product;
    } catch (error) {
      CustomError.createError({
        name: "Error-product-by-id-IN-SERVICE",
        cause: "An error occurred while fetching product by ID",
        message: "An error occurred while fetching product by ID",
        code: EErros.DATABASES_READ_ERROR,
      });
    }
  };

  getProductsByCategory = async (category) => {
    try {
      const products = await productsModel.find({ category: category }).lean();
      return products;
    } catch (error) {
      CustomError.createError({
        name: "Error-product-by-category-IN-SERVICE",
        cause: "An error occurred while fetching product by category",
        message: "An error occurred while fetching product by category",
        code: EErros.DATABASES_READ_ERROR,
      });
    }
  };

  updateProduct = async (id, changes) => {
    try {
      const updatedProduct = await productsModel.updateOne(
        { _id: id },
        changes
      );
      return updatedProduct;
    } catch (error) {
      CustomError.createError({
        name: "Error-update-product-IN-SERVICE",
        cause: "An error occurred while updating product",
        message: "An error occurred while updating product",
        code: EErros.DATABASES_READ_ERROR,
      });
    }
  };

  deleteProduct = async (id) => {
    try {
      const deletedProduct = await productsModel.deleteOne({ _id: id });
      return deletedProduct;
    } catch (error) {
      CustomError.createError({
        name: "Error-delete-product-IN-SERVICE",
        cause: "An error occurred while deleting product",
        message: "An error occurred while deleting product",
        code: EErros.DATABASES_READ_ERROR,
      });
    }
  };
}
export const productService = new ProductService();
