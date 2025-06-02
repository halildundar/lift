import passportLocal from "passport-local";
import passport from "passport";
import { findUserById, findUserByEmail, comparePassword } from "./user_db.js";

let LocalStrategy = passportLocal.Strategy;
export let Authenticate = (req, res, next) => {
  passport.authenticate("local", function (err, user, info) {
    switch (req.accepts("html", "json")) {
      case "html":
        if (err) {
          return next(err);
        }
        if (!user) {
          return res.redirect("/signin");
        }
        req.logIn(user, function (err) {
          if (err) {
            return next(err);
          }
          return res.redirect("/");
        });
        break;
      case "json":
        if (err) {
          return next(err);
        }
        if (!user) {
          console.log("Kullunıcı bulunamadı");
          return res
            .status(401)
            .json({ ok: false, msg: "Kullunıcı bulunamadı" });
        }
        if (!!info) {
          return res
            .status(401)
            .json({ ok: false, msg: "Email veya şifre hatalı" });
        }
        req.logIn(user, function (err) {
          if (err) {
            console.log(user, "Hatalı bir durum var");
            return res
              .status(401)
              .json({ ok: false, msg: "Hatalı bir durum var" });
          }
          return res.json({ ok: true });
        });
        break;
      default:
        res.status(406).json();
    }
  })(req, res, next);
};
export let initPassportLocal = () => {
  const localOptions = {
    usernameField: "email",
    passwordField: "sifre",
    passReqToCallback: true,
  };
  const localStrtegy = new LocalStrategy(
    localOptions,
    async (req, email, sifre, done) => {
      try {
        const user = await findUserByEmail(email);
        if (!user) {
          return done(
            null,
            false
            // req.flash("errors", `This user email "${email}" doesn't exist`)
          );
        } else {
          let match = await comparePassword(sifre, user);
          if (match === true) {
            return done(null, user, null);
          } else if (
            match === "The password that you've entered is incorrect"
          ) {
            return done(null, user, match);
          }else{
            return done(null, false, null);
          }
        }
      } catch (err) {
        return done(null, false, { message: err });
      }
    }
  );
  passport.use(localStrtegy);
};

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  findUserById(id)
    .then((user) => {
      return done(null, user);
    })
    .catch((error) => {
      return done(error, null);
    });
});
