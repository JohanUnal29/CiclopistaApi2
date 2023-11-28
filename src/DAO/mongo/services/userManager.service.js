import { UserModel } from "../models/users.model.js";
import EErros from "./errors/enum.js";
import CustomError from "./errors/custom-error.js";

class UserManager {
  getPaginatedUsers = async (page, query, ITEMS_PER_PAGE) => {
    try {
      const skip = (page - 1) * ITEMS_PER_PAGE; // 1 * 20 = 20

      const countPromise = UserModel.estimatedDocumentCount(query);

      const itemsPromise = UserModel.find(query)
        .limit(ITEMS_PER_PAGE)
        .skip(skip);

      const [count, users] = await Promise.all([countPromise, itemsPromise]);

      const pageCount = count / ITEMS_PER_PAGE; // 400 items / 20 = 20

      return {
        pagination: {
          count,
          pageCount,
        },
        users,
      };
    } catch (error) {
      CustomError.createError({
        name: "Error-GET-users-IN-SERVICE",
        cause: "Users was not found",
        message: "Users was not found",
        code: EErros.DATABASES_READ_ERROR,
      });
    }
  };

  updateUser = async (id, changes) => {
    try {
      const updatedUser = await UserModel.updateOne({ _id: id }, changes);
      return updatedUser;
    } catch (error) {
      CustomError.createError({
        name: "Error-update-user-IN-SERVICE",
        cause: error,
        message: "An error occurred while updating user",
        code: EErros.DATABASES_READ_ERROR,
      });
    }
  };

  deleteUser = async (id) => {
    try {
      const deletedUser = await UserModel.deleteOne({ _id: id });
      return deletedUser;
    } catch (error) {
      CustomError.createError({
        name: "Error-delete-user-IN-SERVICE",
        cause: "An error occurred while deleting user",
        message: "An error occurred while deleting user",
        code: EErros.DATABASES_READ_ERROR,
      });
    }
  };

}

export const userService = new UserManager();
