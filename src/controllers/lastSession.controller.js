import { lastSessionService } from "../DAO/mongo/services/lastSession.service.js";
import CustomError from "../DAO/mongo/services/errors/custom-error.js";
import EErros from "../DAO/mongo/services/errors/enum.js";

class LastSessionController {
  async getSessionsHistory(req, res) {
    try {
      const sessions = await lastSessionService.getSessionsHistory();

      if (!sessions) {
        CustomError.createError({
          name: "Error-sessions",
          cause: "sessions was not found",
          message: "sessions was not found",
          code: EErros.DATABASES_READ_ERROR,
        });

        req.logger.debug({
          message: "Sessions was not found",
          Date: new Date().toLocaleTimeString(),
        });
      }

      return res.send({
        status: "Success",
        message: "Product found",
        payload: sessions,
      });
    } catch (error) {
      CustomError.createError({
        name: "Error-sessions",
        cause: "An error occurred while fetching sessions",
        message: "An error occurred while fetching sessions",
        code: EErros.DATABASES_READ_ERROR,
      });

      req.logger.error({
        message: "Sessions was not found",
        cause: error,
        Date: new Date().toLocaleTimeString(),
        stack: JSON.stringify(error.stack, null, 2),
      });
    }
  }

  async getLastSessionByEmail(req, res) {
    try {
      const sessionEmail = req.params.email;
      const user = await lastSessionService.getLastSessionByEmail(sessionEmail);

      if (!user) {
        CustomError.createError({
          name: "Error-session-by-email",
          cause: "Session was not found",
          message: "Session was not found",
          code: EErros.DATABASES_READ_ERROR,
        });
        req.logger.debug({
          message: "Session was not found by email",
          Date: new Date().toLocaleTimeString(),
        });
      }

      return res.send({
        status: "Success",
        message: "Session found",
        payload: user,
      });
    } catch (error) {
      CustomError.createError({
        name: "Error-session-by-email",
        cause: "An error occurred while fetching session by Email",
        message: "An error occurred while fetching session by Email",
        code: EErros.DATABASES_READ_ERROR,
      });
      req.logger.error({
        message: "Session was not found by Email",
        cause: error,
        Date: new Date().toLocaleTimeString(),
        stack: JSON.stringify(error.stack, null, 2),
      });
    }
  }

  async deleteUser(req, res) {
    try {
      
      const deletedSession = await lastSessionService.deleteUser();

      if (!deletedSession) {
        return res.status(400).send({
          status: "error",
          error: error,
          cause: `No hay usuarios para eliminar`,
        });
      }

      return res.send({
        status: "OK",
        message: `${deletedSession} users deleted successfully`,
      });
    } catch (error) {
      
      return res.status(400).send({
        status: "error",
        error: error,
        cause: `An error occurred while deleting users in controller`,
      });
    }
  }
}

export const lastSessionController = new LastSessionController();
