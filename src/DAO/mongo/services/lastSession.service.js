import lastSessionModel from "../models/lastSession.model.js";
import { UserModel } from "../models/users.model.js";
import firebaseApp from "../../firebase/credentials.js";
import { getAuth, deleteUser } from "firebase/auth";

const auth = getAuth(firebaseApp);

class LastSessionService {
  constructor() {}

  getSessionsHistory = async () => {
    try {
      const users = await lastSessionModel.find().lean();
      return users;
    } catch (error) {
      CustomError.createError({
        name: "Error-GET-last-session-IN-SERVICE",
        cause: error,
        message: "An error occurred while getting the last session",
        code: EErros.DATABASES_READ_ERROR,
      });
    }
  };

  getLastSessionByEmail = async (email) => {
    try {
      const user = await lastSessionModel.findOne({
        email: email,
      });
      return user;
    } catch (error) {
      CustomError.createError({
        name: "Error-GET-BY-ID-last-session-IN-SERVICE",
        cause: error,
        message: "An error occurred while GET BY ID the last session",
        code: EErros.DATABASES_READ_ERROR,
      });
    }
  };

  addLastSession = async (user) => {
    try {
      const userAlreadyExist = await lastSessionModel.findOne({
        email: user.email,
      });

      if (userAlreadyExist) {
        const updatedSession = await lastSessionModel.updateOne(
          { email: user.email },
          { datetime: user.datetime } // Objeto con los campos a actualizar
        );
        return updatedSession;
      } else {
        const lastSession = await lastSessionModel.create(user);
        return lastSession;
      }
    } catch (error) {
      CustomError.createError({
        name: "Error-add-last session-IN-SERVICE",
        cause: error,
        message: "An error occurred while adding the last session",
        code: EErros.DATABASES_READ_ERROR,
      });
    }
  };

  deleteUser = async () => {
    try {
      const sessions = await lastSessionModel.find().lean();
      let usersDeletedCount = 0;

      for (const session of sessions) {
        
        const dateNow = new Date();
        const dateUser = new Date(session.datetime);
        const differenceInMilliseconds =
          (dateNow - dateUser) / (1000 * 60 * 60 * 24);

        if (differenceInMilliseconds >= 2) {
          const deletedUser = await UserModel.deleteOne({
            email: session.email,
          });
          usersDeletedCount++;
        }
      }

      return usersDeletedCount;

    } catch (error) {
      console.error("Error al eliminar usuarios:", error); // Imprime el error real en la consola
      CustomError.createError({
        name: "Error-delete-user-IN-SERVICE",
        cause: error,
        message: "An error occurred while deleting users",
        code: EErros.DATABASES_READ_ERROR,
      });
    }
  };
}

export const lastSessionService = new LastSessionService();
