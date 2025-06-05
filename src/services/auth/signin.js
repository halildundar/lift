import express from "express";
let router = express.Router({ mergeParams: true });
import { checkLoggedOut,postLogOut } from "./auth.js";
import {Authenticate} from './passportCtrl.js';
export const AuthApi = (app) => {
  router.get("/signin", checkLoggedOut, (req, res) => {
    return res.render("pages/signin.hbs", {
      title: "Signin",
      scriptname:`signin`,
    });
  });
  router.post("/signin", (req, res,next) => {
    const data = req.body;
    if(!data){
      return res.send('User Not found');
    }
    next();
  },Authenticate);
  router.post("/signout", postLogOut);
  return app.use("/", router);
  
};
