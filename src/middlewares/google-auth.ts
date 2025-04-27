import passport from "passport";
import {
  Strategy as GoogleStrategy,
  VerifyCallback,
} from "passport-google-oauth20";
import session from "express-session";
import UserModel from "../models/user.model";
import { Application } from "express";
import { config } from "dotenv";
import logger from "../utils/logger";
config();

export const googleAuth = (app: Application) => {
  passport.use(
    <passport.Strategy>new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_ID!,
        clientSecret: process.env.GOOGLE_SECRET!,
        callbackURL: "https://ige.onrender.com/authGoogle/google/callback",
      },
      async (accessToken, refreshToken, profile, cb) => {
        try {
          logger.info(
            `Google OAuth started for email: ${profile.emails?.[0]?.value}`,
          );
          // Buscar usuario en la base de datos
          const user = await UserModel.findOne({
            email: profile.emails?.[0]?.value,
          });
          //console.log(user);
          if (user) {
            logger.info(`User found: ${user.email}. Updating Google token.`);
            // Si el usuario existe, actualizamos el token de Google
            user.googleToken = accessToken;
            await user.save();

            // Retornamos datos esenciales para la sesión
            return cb(null, {
              userId: user.userId,
              email: user.email,
              role: user.role,
              name: user.name,
            });
          } else {
            logger.warn(`User not registered: ${profile.emails?.[0]?.value}`);
            // Si el usuario no existe, devolver error
            return cb(new Error("User not registered"), null);
          }
        } catch (err) {
          logger.error("Error during Google OAuth:", err);
          return cb(err, null);
        }
      },
    ),
  );

  passport.serializeUser((user: any, done) => {
    logger.info(`Serializing user: ${JSON.stringify(user)}`);
    done(null, user);
  });

  passport.deserializeUser((user: any, done) => {
    logger.info(`Deserializing user: ${JSON.stringify(user)}`);
    done(null, user);
  });

  app.use(
    session({
      resave: false,
      saveUninitialized: true,
      secret: process.env.SESSION_SECRET || "default_fallback_not_functional", // since its a fallback with this value it will trigger an error
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());
};
