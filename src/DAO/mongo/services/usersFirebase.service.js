import CustomError from "./errors/custom-error.js";
import EErros from "./errors/enum.js";

import firebaseApp from "../../firebase/credentials.js";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const firestore = getFirestore(firebaseApp);

class UsersFirebase{

    getRol = async (uid) => {
        try {
            const docuRef = doc(firestore, `usuarios/${uid}`);
            const docuCifrada = await getDoc(docuRef);
            const infoFinal = docuCifrada.data().rol;
            return infoFinal;
        } catch (error) {
          CustomError.createError({
            name: "Error-get-rol-user-IN-SERVICE",
            cause: error,
            message: "An error occurred while get rol user",
            code: EErros.DATABASES_READ_ERROR,
          });
        }
      };
}

export const usersFirebaseService = new UsersFirebase();

