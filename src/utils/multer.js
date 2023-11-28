// import multer from "multer";
// import { GridFsStorage } from 'multer-gridfs-storage';
// import { entorno } from "../config.js";

// const storage = new GridFsStorage({
//   url: entorno.MONGO_URL,
//   file: (req, file) => {
//     return {
//       bucketName: 'profileImages', // Nombre de la colección personalizada para imágenes.
//       filename: `${Date.now()}-${file.originalname}`,
//     };
//   },
// });

// export const uploader = multer({ storage });