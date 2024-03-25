export default class ProductDTO {
    constructor(product, dowloandURL) {
      this.title = product.title;
      this.description = product.description;
      this.code = product.code;
      this.price = product.price;
      this.status = product.status;
      this.stock = product.stock;
      this.category = product.category;
      this.subCategory = product.subCategory;
      this.image = dowloandURL;
    }
  }