import { userService } from "../DAO/mongo/services/userManager.service.js";
import CustomError from "../DAO/mongo/services/errors/custom-error.js";
import EErros from "../DAO/mongo/services/errors/enum.js";

class UserManagerController {
  getPaginatedUsers = async (req, res) => {
    try {
      const ITEMS_PER_PAGE = 10;
      const page = req.query.page || 1;

      // Put all your query params in here//
      const query = {};
      const users = await userService.getPaginatedUsers(
        page,
        query,
        ITEMS_PER_PAGE
      );

      if (!users) {
        CustomError.createError({
          name: "Error-users",
          cause: "Users was not found",
          message: "Users was not found",
          code: EErros.DATABASES_READ_ERROR,
        });

        req.logger.debug({
          message: "Users was not found",
          Date: new Date().toLocaleTimeString(),
        });
      }

      return res.send({
        status: "Success",
        message: "User found",
        payload: users,
      });
    } catch (error) {
      CustomError.createError({
        name: "Error-users",
        cause: "An error occurred while fetching users",
        message: "An error occurred while fetching users",
        code: EErros.DATABASES_READ_ERROR,
      });

      req.logger.error({
        message: "Users was not found",
        cause: error,
        Date: new Date().toLocaleTimeString(),
        stack: JSON.stringify(error.stack, null, 2),
      });
    }
  };

  updateUser = async (req, res) => {
    try {
      const userId = req.params.pid;
      const changes = req.body;

      const updatedUser = await userService.updateUser(userId, changes);

      if (!updatedUser) {
        CustomError.createError({
          name: "Error-update-user",
          cause: "User was not found",
          message: "User was not found",
          code: EErros.DATABASES_READ_ERROR,
        });
        req.logger.debug({
          message: "User was not found",
          Date: new Date().toLocaleTimeString(),
        });
      }

      return res.send({
        status: "OK",
        message: "User successfully updated",
      });
    } catch (error) {
      CustomError.createError({
        name: "Error-update-user",
        cause: error,
        message: "An error occurred while updating user",
        code: EErros.DATABASES_READ_ERROR,
      });
      req.logger.error({
        message: "An error occurred while updating user",
        cause: error,
        Date: new Date().toLocaleTimeString(),
        stack: JSON.stringify(error.stack, null, 2),
      });
    }
  };

  deleteUser = async (req, res) => {
    try {
      const userId = req.params.pid;
      const deletedUser = await userService.deleteUser(userId);

      if (!deletedUser) {
        req.logger.error({
          message: "User does not exists",
          Date: new Date().toLocaleTimeString(),
        });

        CustomError.createError({
          name: "Error-delete-user",
          cause: "User does not exists",
          message: "User does not exists",
          code: EErros.DATABASES_READ_ERROR,
        });
      }

      return res.send({ status: "OK", message: "User deleted successfully" });
    } catch (error) {
      CustomError.createError({
        name: "Error-delete-user",
        cause: error,
        message: "An error occurred while deleting user",
        code: EErros.DATABASES_READ_ERROR,
      });
      req.logger.error({
        message: "An error occurred while deleting user",
        cause: error,
        Date: new Date().toLocaleTimeString(),
        stack: JSON.stringify(error.stack, null, 2),
      });
    }
  };
}

export const userManagerController = new UserManagerController();
