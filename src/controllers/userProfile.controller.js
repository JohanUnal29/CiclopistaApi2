import { userProfileService } from "../DAO/mongo/services/userProfile.service.js";
import CustomError from "../DAO/mongo/services/errors/custom-error.js";
import EErros from "../DAO/mongo/services/errors/enum.js";
import ProfileImageDTO from "../DAO/DTO/profileImages.dto.js"

class UserProfileController {
  
  addProfileImage = async (req, res) => {
    const profileImage = req.body;
    try {
      const imageDetails = new ProfileImageDTO(profileImage);

      console.log("details: "+JSON.stringify(imageDetails, null, 2));
      await userProfileService.addProfileImage(imageDetails);

      // let ticketCode = uuidv4().toString();

      return res.send({ status: "OK", message: "Image successfully added" });
    } catch (error) {

      return res.status(400).send({
        status: "error",
        error: error,
        cause: "Image error",
      });

    }
  };

  getImageByEmail = async (req,res) => {
    try {
      const email = req.params.email;
      const profileImage = await userProfileService.getImageByEmail(email);

      if (!profileImage) {
        return res.status(400).send({
          status: "error",
          error: "The image is not yet available",
          cause: "The image is not yet available",
        });
      }

      return res.send({
        status: "Success",
        message: "profileImage found",
        payload: profileImage,
      });
    } catch (error) {
      CustomError.createError({
        name: "Error-profileImage-by-email",
        cause: "An error occurred while fetching profileImage by email",
        message: "An error occurred while fetching profileImage by email",
        code: EErros.DATABASES_READ_ERROR,
      });
      req.logger.error({
        message: "profileImage was not found by email",
        cause: error,
        Date: new Date().toLocaleTimeString(),
        stack: JSON.stringify(error.stack, null, 2),
      });
    } 
  }

}

export const userProfileController = new UserProfileController();
