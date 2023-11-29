import { usersFirebaseService } from "../DAO/mongo/services/usersFirebase.service.js";

// export function checkUser(req, res, next) {
//     if (req.session.user.email) {
//       return next();
//     }
//     return res.status(401).render('error-page', { msg: 'please log in' });
//   }

  export async function checkAdmin(req, res, next){
  // Verifica si el usuario es administrador
  const uid = req.params.uid;

  // Llama al servicio para obtener el rol del usuario
  const rol = await usersFirebaseService.getRol(uid);

  // Verifica si el rol es admin
  if (rol === "admin") {
    // El usuario es administrador
    next();
  } else {
    // El usuario no es administrador
    res.status(401).send("No tienes permisos para acceder a esta ruta");
  }
};


// export function checkAdmin(req, res, next) {
//   if (req.session.user.email && req.session.user.rol === "admin") {
//     return next();
//   }
//   return res.send({ status: "Error", error: "Log in like admin" });
// }
