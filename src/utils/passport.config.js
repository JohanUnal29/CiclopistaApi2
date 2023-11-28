import passport from "passport";
import CustomError from "../DAO/mongo/services/errors/custom-error.js";
import EErros from "../DAO/mongo/services/errors/enum.js";
import local from "passport-local";

import { createHash, isValidPassword } from "./bcrypt.js";

import { UserModel } from "../DAO/mongo/models/users.model.js";

import { Strategy as GoogleStrategy } from "passport-google-oauth20";

const LocalStrategy = local.Strategy;

export function iniPassport() {
  passport.use(
    "google",
    new GoogleStrategy(
      {
        clientID:
          "797905124061-gp2j2h6jlq8hkvpc4c61tflgtgt880bg.apps.googleusercontent.com",
        clientSecret: "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",
        callbackURL:
          "https://ciclopistaapi.onrender.com/api/sessionsGoogle/auth/google/callback",
      },
      async (accessToken, _, profile, done) => {
        console.log(profile);
        try {
          const email = profile.emails[0].value;

          let user = await UserModel.findOne({ email });

          if (!user) {
            const newUser = {
              email: email,

              firstName:
                profile._json.given_name || profile._json.login || "noname",

              lastName: profile._json.family_name,

              rol: "user",

              password: "nopass",
            };

            let userCreated = await UserModel.create(newUser);

            // console.log('User Registration successful');

            return done(null, userCreated);
          } else {
            //buscar la forma de enviar un mensaje al front
            return done(null, user);
          }
        } catch (error) {

          req.logger.info({
            message: "Error in Google auth",
            cause: error,
            Date: new Date().toLocaleTimeString(),
            stack: JSON.stringify(error.stack, null, 2),
          });
          //buscar la forma de enviar un mensaje al front
          //   console.log("Error in Google auth");
          //   console.log(e);
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    let user = await UserModel.findById(id);

    done(null, user);
  });
}
