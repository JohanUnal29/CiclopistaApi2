import EErros from "../DAO/mongo/services/errors/enum.js";

export default (error, req, res, next) => {
    console.log(error.cause);

    switch (error.code) {
        case EErros.ROUTING_ERROR:
            res
                .status(404)
                .send({ status: "error", error: error.name, cause: error.cause });
            break;

        //ERROR 2:
        case EErros.INVALID_TYPES_ERROR:
            res
                .status(400)
                .send({ status: "error", error: error.name, cause: error.cause });
            break;

        //ERROR 3:
        case EErros.DATABASES_READ_ERROR:
            res
                .status(500)
                .send({ status: "error", error: error.name, cause: error.cause });
            break;

        //ERROR 4:
        case EErros.DATABASES_CONNECTION_ERORR:
            res
                .status(500)
                .send({ status: "error", error: error.name, cause: error.cause });
            break;

        //ERROR 5:
        case EErros.ADDPRODUCT_TO_CART_ERORR:
            res
                .status(400)
                .send({ status: "error", error: error.name, cause: error.cause });
            break;

        default:
            res.status(500).send({ status: "error", error: "Unhandled error" });
            break;
    }
};