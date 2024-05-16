import passport from "passport";
import express from "express";
import { lastSessionService } from "../DAO/mongo/services/lastSession.service.js";
export const sessionGoogleRouter = express.Router();

sessionGoogleRouter.get("/error-auth", (req, res) => {
  return res
    .status(400)
    .render("error-page", { msg: "error de autenticación" });
});

sessionGoogleRouter.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

sessionGoogleRouter.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/error-auth" }),
  function (req, res) {
    // Successful authentication, redirect home.
    req.session.user = req.session.user = {
      _id: req.user._id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      rol: req.user.rol,
    };
    res.status(200).send(`<!DOCTYPE html>
    <html lang="en">
      <body>
      </body>
      <script>
        window.close();
      </script>
    </html>`);
  }
);

sessionGoogleRouter.get("/user", async (req, res) => {
  try {
    let user = req.session.user;

    if (!user) {
      return res
        .status(404)
        .send({ status: "Error", error: "user was not found" });
    }

    const datetime = new Date().toLocaleString("en-US", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });

    const user2 = {
      email: user.email,
      datetime: datetime,
    };

    await lastSessionService.addLastSession(user2);

    return res.send({
      status: "success",
      message: "sesión cerrada",
      payload: user,
    });
  } catch (error) {
    console.error("Error:", error);
    return res
      .status(500)
      .send({ status: "Error", error: "Internal Server Error" });
  }
});

sessionGoogleRouter.get("/logout", async (req, res) => {
  try {
    let user = req.session.user;

    if (!user) {
      return res.status(404).send({ status: "Error", error: "user was not found" });
    }

    const datetime = new Date().toLocaleString("en-US", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });

    const user2 = {
      email: user.email,
      datetime: datetime,
    };

    await lastSessionService.addLastSession(user2);

    req.session.destroy((err) => {
      if (err) {
        return res.send({ status: "Error", error: "No se pudo cerrar" });
      }
      return res.redirect("https://ciclopistafront.onrender.com");
    });
  } catch (error) {
    console.error("Error:", error);
    return res.send(error);
  }
});