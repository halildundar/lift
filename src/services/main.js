import express from "express";
let router = express.Router({ mergeParams: true });
import { SslStatus } from "./ssl.js";
import { SertifikaApi } from "./sertifikalar.js";
import { OnayKurumApi } from "./onay-kurumlar.js";
import { UplaodFileApi } from "./upload-service.js";
import { PersonelApi } from "./personel.js";
import { AsFirmaApi } from "./as-firma.js";
import { PlanlamaApi } from "./planlama.js";
import { DenetimApi } from "./denetim.js";
import { ProjeApi } from "./proje.js";
import { TDSApi } from "./tds.js";
import { AuthApi } from "./auth/signin.js";
import { initPassportLocal } from "./auth/passportCtrl.js";
import { checkLoggedIn } from "./auth/auth.js";
import { DanismanFirmaApi} from './danisman/firmalar.js';
import { DanismanBasvuruApi} from './danisman/basvurular.js';
import { BasvuruApi} from './basvurular.js';
initPassportLocal();
export let appRoutes = (app) => {
  SertifikaApi(app);
  OnayKurumApi(app);
  PersonelApi(app);
  UplaodFileApi(app);
  AsFirmaApi(app);
  PlanlamaApi(app);
  DenetimApi(app);
  ProjeApi(app);
  TDSApi(app);
  AuthApi(app);
  DanismanFirmaApi(app);
  DanismanBasvuruApi(app);
  BasvuruApi(app);
  router.post("/gudr", (req, res) => {
    return res.json({ ...req.user });
  });
  router.get("/*", checkLoggedIn, (req, res) => {
    if (!!req.user) {
      if (req.user.gorev != "Danışman") {
        return res.render("pages/dashboard.hbs", {
          title: "Kontrol Panel",
          scriptname: `main`,
          user: req.user,
          yetki: JSON.parse(req.user.yetki),
        });
      }else {
          return res.render("pages/dashboard.hbs", {
          title: "Danışman Panel",
          scriptname: `main`,
          user: req.user,
          headname:'danis-header'
        });
      }
    }
  });
  router.get(
    "/.well-known/pki-validation/8EF0E148BC848A44E6EAFE8F9FADF56F.txt",
    SslStatus
  );

  return app.use("/", router);
};
