export default class ProfileImageDTO {
    constructor(image) {
      this.email = image.email;
      this.selectedFile = image.selectedFile;
    }
  }