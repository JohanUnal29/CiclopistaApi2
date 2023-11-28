import { faker } from '@faker-js/faker';// Verifica la sintaxis correcta de importación
// No es necesario importar Faker, puedes usar 'faker' directamente

faker.location = "es";

export const generateProduct = () => {
  return {
    _id: faker.database.mongodbObjectId(),
    title: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    code: faker.database.mongodbObjectId(), // Corregido
    price: faker.commerce.price(),
    stock: faker.number.int(), // Corregido
    category: faker.commerce.department(),
    thumbnails: faker.image.urlPicsumPhotos(),
  };
};
