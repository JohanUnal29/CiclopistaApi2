import mongoose from "mongoose";

const ordersCollection = "profileImages";

const ordersSchema = mongoose.Schema({

  email: {
    type: String,
    required: true,
    // unique: true, // Asegura que el correo electrónico sea único
  },
  selectedFile: {
    type: String,
    required: true,
  },
});

const profileImageModel = mongoose.model(ordersCollection, ordersSchema);

export default profileImageModel;