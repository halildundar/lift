import express from "express";
let router = express.Router({ mergeParams: true });
import { SslStatus } from "./ssl.js";
import { SertifikaApi } from "./sertifikalar.js";
import { OnayKurumApi } from "./onay-kurumlar.js";
import { UplaodFileApi } from "./upload-service.js";
import { ProjeFirmaApi } from "./proje-firma.js";
import { PersonelApi } from "./personel.js";
import { AsFirmaApi } from "./as-firma.js";
import { PlanlamaApi } from "./planlama.js";
import { DenetimApi } from "./denetim.js";
import { ProjeApi } from "./proje.js";
import { TDSApi } from "./tds.js";
import { AuthApi } from "./auth/signin.js";
import { initPassportLocal } from "./auth/passportCtrl.js";
import { checkLoggedIn } from "./auth/auth.js";
initPassportLocal();
export let appRoutes = (app) => {
  SertifikaApi(app);
  OnayKurumApi(app);
  ProjeFirmaApi(app);
  PersonelApi(app);
  UplaodFileApi(app);
  AsFirmaApi(app);
  PlanlamaApi(app);
  DenetimApi(app);
  ProjeApi(app);
  TDSApi(app);
  AuthApi(app);
  router.post("/gudr", (req, res) => {
    return res.json({ ...req.user });
  });
  router.get("/*", checkLoggedIn, (req, res) => {
    if (!!req.user) {
      console.log(user);
      return res.render("pages/dashboard.hbs", {
        title: "Kontrol Panel",
        scriptname: `main`,
        user: !!req.user ? req.user : '',
        yetki:!!req.user.yetki ?  JSON.parse(req.user.yetki) :"{}",
      });
    }
  });
  router.get(
    "/.well-known/pki-validation/8EF0E148BC848A44E6EAFE8F9FADF56F.txt",
    SslStatus
  );

  return app.use("/", router);
};
