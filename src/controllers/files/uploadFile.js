import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import firebaseApp from "../../DAO/firebase/credentials.js";
import { getStorage, deleteObject } from "firebase/storage";
import sharp from 'sharp';

const storage = getStorage(firebaseApp);

export async function uploadFile(file) {
    let filedBuffer = await sharp(file.buffer)
        .resize({ width: 1080, height: 1080, fit: 'cover' })
        .toBuffer()

    const fileRef = ref(storage, `files/${file.originalname} ${Date.now()}`)

    const fileMetaData = {
        contentType: file.mimetype
    }
    const fileUploadPromise = uploadBytesResumable(
        fileRef,
        filedBuffer,
        fileMetaData
    )

    await fileUploadPromise

    const fileDownloadURL = await getDownloadURL(fileRef)

    return { ref: fileRef, downdloadURL: fileDownloadURL }

}


export async function deleteImage(URL) {
    // Create a reference to the file to delete
    const desertRef = ref(storage, `${URL}`);

    // Delete the file
    deleteObject(desertRef).then(() => {
        console.log("Imagen eliminada de firebase")
    }).catch((error) => {
        console.log(error)
    });
}
//18:21