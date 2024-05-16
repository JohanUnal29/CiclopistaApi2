import express from 'express';
import path from 'path';
import compression from "express-compression";
import { __dirname } from "./config.js";
import { connectMongo } from "./utils/db.js";
import MongoStore from 'connect-mongo';
import productRouter from "./routes/product.router.js";
import mockingproducts from "./routes/mockingproducts.router.js"
import ticketsRouter from "./routes/tickets.router.js";
// import userProfileRouter from "./routes/userProfile.router.js";
import { sessionGoogleRouter } from './routes/sessionGoogle.router.js';
import passport from 'passport';
import { iniPassport } from './utils/passport.config.js';
import session from 'express-session';
import cors from 'cors';
import { entorno } from './config.js';
import erroHandler from "./middlewares/error.js";
import { addLogger } from './utils/logger.js';
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUiExpress from "swagger-ui-express";

import lastSessionRouter from "./routes/lastSession.router.js";
import userManagerRouter from "./routes/userManager.router.js";
import userProfileRouter from "./routes/userProfile.router.js";

const app = express();
app.use(addLogger);
const port = entorno.PORT;
app.use(cors({
  origin: ["http://localhost:3000", "https://ciclopistafront.onrender.com"]
})
);


const swaggerOptions = {
  definition: {
    openapi: "3.0.1",
    info: {
      title: "Documentacion Ciclopista",
      description: "Este proyecto va dirigido a la empresa Importaciones Ciclopista",
    },
  },
  apis: [`${__dirname}/docs/**/*.yaml`],
};

const specs = swaggerJSDoc(swaggerOptions);
app.use("/apidocs", swaggerUiExpress.serve, swaggerUiExpress.setup(specs));

const httpServer = app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`);
});

connectMongo();

// app.use(
//   compression({
//     brotli: { enabled: true, zlib: {} },
//   })
// );

// connectSocket(httpServer);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));
//


app.use(
  session({
    store: MongoStore.create({ mongoUrl: entorno.MONGO_URL, ttl: 86400 * 7 }),
    secret: 'un-re-secreto',
    resave: true,
    saveUninitialized: true,
  })
);

iniPassport();
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/products', productRouter);
app.use('/api/purchase', ticketsRouter);
app.use('/api/sessionsGoogle', sessionGoogleRouter);
app.use('/api/lastSession', lastSessionRouter);
app.use('/api/userManager',userManagerRouter);


app.use('/api/userProfile', userProfileRouter);

app.use('/mockingproducts', mockingproducts);

//prueba como creo que es
app.get("/testing", (req, res) => {
  req.logger.info("ingresando a un proceso importante");

  req.logger.info(
    "PASO 1: " +
      new Date().toLocaleTimeString() +
      new Date().getUTCMilliseconds()
  );
  try {
    gdfshjsdjgsjdfgjsdgfjhdsgfgjhsgjhsgdf();
  } catch (error) {
    req.logger.warn({
      message: error.message,
    });
  }

  req.logger.info(
    "PASO 2: " +
      new Date().toLocaleTimeString() +
      new Date().getUTCMilliseconds()
  );

  try {
    sdfsdgsfd();
  } catch (error) {
    req.logger.error({
      message: error.message,
      stack: JSON.stringify(error.stack, null, 2),
    });
    return res
      .status(400)
      .json({ msg: "something important went wrong no continue" });
  }

  res.send({ message: "fin del proceso heavy exito!!!" });
});

app.get('*', (req, res) => {
  return res.status(404).json({
    status: 'error',
    msg: 'no encontrado',
    data: {},
  });
});

app.use(erroHandler);


