//@ts-check

import winston from "winston";
import { entorno } from "../config.js";

const loggerDev = winston.createLogger({
    transports: [
        new winston.transports.Console({
            level: "debug", //debug http info warn error
            format: winston.format.colorize({ all: true }),
        }),
    ],
});

const loggerProd = winston.createLogger({
    transports: [
        new winston.transports.Console({
            level: "info", //info warn error
            format: winston.format.colorize({ all: true }),
        }),
        new winston.transports.File({
            filename: "./errors.log",
            level: "error", //error
            format: winston.format.simple(),
        }),
    ],
});

export const addLogger = (req, res, next) => {

    if(entorno.MODE=="PROD"){
        req.logger = loggerProd;
        
    }else{
        req.logger = loggerDev;
    }

    next();
};
