import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import firebaseApp from "../../DAO/firebase/credentials.js";
import { getStorage } from "firebase/storage";
import sharp from 'sharp';

const storage = getStorage(firebaseApp);

export async function uploadFile (file){
    let filedBuffer = await sharp(file.buffer)
        .resize({width: 1080, height: 1080, fit: 'cover'})
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

    await fileUploadPromise()

    const fileDownloadURL = await getDownloadURL(fileRef)

    return { ref: fileRef, downdloadURL: fileDownloadURL}

}

//18:21