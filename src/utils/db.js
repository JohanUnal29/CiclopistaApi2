import { connect } from "mongoose";
import { entorno } from "../config.js";
// import productsModel from "../src/DAO/models/products.js";
export async function connectMongo() {
  try {
    await connect(
      entorno.MONGO_URL
    );
    console.log("plug to mongo!");

    // const created = productsModel.create({
    //   title: 'Aretes',
    //   description: 'aretes de corazón',
    //   code: '258',
    //   price: 16000,
    //   status: true,
    //   stock: 12,
    //   category: 'Aretes',
    //   thumbnails: 'https://drive.google.com/uc?export=download&id=1wvtwNXn5gvqN3nch-2WnAbcrKn4NdWu4',
    // });

  } catch (e) {
    console.log(e);
    throw "can not connect to the db";
  }
}