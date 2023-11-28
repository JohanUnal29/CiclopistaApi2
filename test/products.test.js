import chai from "chai";
import supertest from "supertest";

const expect = chai.expect;
const requester = supertest("http://127.0.0.1:5000");

describe('Testing products', () => {
    

  describe('Consultar todos los productos', () => {
      it('GET /api/products/all', async () => {
  
        const response = await requester.get('/api/products/all');
        const { status, ok, _body } = response;
  
        console.log(_body.payload);
      }); 
    });

  describe('Consultar producto por categoria', () => {
      it('GET /api/products/:category', async () => {
        const category = 'Pachas'; 
        
        const response = await requester.get(`/api/products/${category}`);
        const { status, ok, _body } = response;
        
        console.log(_body.payload);
      }); 
    });
    
    describe('Consultar producto por ID', () => {
      it('GET /api/products/id/:pid', async () => {
        const productId = '64fbfcea8672cdd671a53dbb'; 
        
        const response = await requester.get(`/api/products/id/${productId}`);
        const { status, ok, _body } = response;
        
        console.log(_body.payload);
      }); 
    });

  //quitar el check admin en product.router.js para test
  describe('Creación de productos', () => {
    it('En endpoint POST /api/products/addproduct debe crear productos', async () => {
      
      const productMock = {
        title: 'Llanta MTB CP rin 26 de taco',
        description: 'Llanta económica y confiable',
        code: '1098902',
        price: 20000,
        status: true,
        stock: 100,
        category: "Llantas",
        subCategory: "Llantas_26",
        thumbnails: "xxxdfdsewsawasdasd",
      };

      const response = await requester.post('/api/products/addproduct').send(productMock);
      const { status, ok, _body } = response;

      expect(ok).to.be.true;
    });

    it('En endpoint POST /api/products/addproduct no deberia crear productos con datos vacios', async () => {
      const productMock = {};

      const response = await requester.post('/api/products/addproduct').send(productMock);
      const { status, ok, _body } = response;

      expect(ok).to.be.eq(false);
    }); 
  }); 

  describe('Edición de producto por ID', () => {
    it('En endpoint PUT /api/products/:pid debe editar el producto por ID', async () => {

      const productID = '65068b7d089d6155f0da1487'; 
      
      const productMock = {
        title: 'Llanta MTB CP rin 26 de taco EDITADA',
        description: 'Llanta económica y confiable EDITADA',
        code: '1098902',
        price: 25000,
        status: true,
        stock: 120,
        category: "Llantas",
        subCategory: "Llantas_26",
        thumbnails: "xxxdfdsewsawasdasd",
      };

      const response = await requester.put(`/api/products/${productID}`).send(productMock);
      const { status, ok, _body } = response;

      expect(ok).to.be.true;
    });

  }); 

  describe('Eliminar producto por ID', () => {
        it('DELETE /api/products/:pid', async () => {
          const productID = '65068b7d089d6155f0da1487'; 
          
          const response = await requester.delete(`/api/products/${productID}`);
          const { status, ok, _body } = response;
          
          expect(ok).to.be.true;
        }); 
      });
});