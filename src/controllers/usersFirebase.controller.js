import { usersFirebaseService } from "../DAO/mongo/services/usersFirebase.service";
import CustomError from "../DAO/mongo/services/errors/custom-error";
import EErros from "../DAO/mongo/services/errors/enum";

class UsersFirebaseController {

    getRolUser = async (req, res) => {
        try {
          const userUid = req.params.uid;
    
          const rol = await usersFirebaseService.getRol(uid);
    
          if (!rol) {
            CustomError.createError({
              name: "Error-get-rol-user",
              cause: "User was not found",
              message: "User was not found",
              code: EErros.DATABASES_READ_ERROR,
            });
            req.logger.debug({
              message: "Rol was not found",
              Date: new Date().toLocaleTimeString(),
            });
          }
    
          return res.send({
            status: "OK",
            message: "Get rol successfully",
            payload: rol,
          });
        } catch (error) {
          CustomError.createError({
            name: "Error-get-rol-user",
            cause: error,
            message: "An error occurred while get rol user",
            code: EErros.DATABASES_READ_ERROR,
          });
          req.logger.error({
            message: "An error occurred while get rol user",
            cause: error,
            Date: new Date().toLocaleTimeString(),
            stack: JSON.stringify(error.stack, null, 2),
          });
        }
      };

}

export const usersFirebaseController = new UsersFirebaseController();