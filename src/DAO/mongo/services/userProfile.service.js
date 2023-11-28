import profileImageModel from "../models/profileImages.model.js";
import CustomError from "./errors/custom-error.js";
import EErros from "./errors/enum.js";

class UserProfileService {
  constructor() {}

  addProfileImage = async (imageDetails) => {
    try {
      const image = await profileImageModel.findOne({ email: imageDetails.email }).lean();
      if (image) {
        const updatedImage = await profileImageModel.updateOne(
          { email: imageDetails.email},
          imageDetails
        );
        return updatedImage;
      } else {
        const createdImage = await profileImageModel.create(imageDetails);
        return createdImage;
      }
    } catch (error) {
      CustomError.createError({
        name: "Error-add-image-IN-SERVICE",
        cause: error,
        message: "An error occurred while adding the image",
        code: EErros.DATABASES_READ_ERROR,
      });
    }
  };

  getImageByEmail = async (email) => {
    try {
      const image = await profileImageModel.findOne({ email: email }).lean();
      return image;
    } catch (error) {
      CustomError.createError({
        name: "Error-image-by-id-IN-SERVICE",
        cause: "An error occurred while fetching image by ID",
        message: "An error occurred while fetching image by ID",
        code: EErros.DATABASES_READ_ERROR,
      });
    }
  };
}

export const userProfileService = new UserProfileService();
