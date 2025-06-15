import { SertifikalarInit } from "./pages/sertifikalar.js";
import { HizRegulatoruInit } from "./pages/hiz-regulatoru.js";
import { FrenInit } from "./pages/fren.js";
import { OnayKurumInit } from "./pages/onay-kurumlar.js";
import { KontrolKartnInit } from "./pages/kontrol-kart.js";
import { DurakKapiKilitInit } from "./pages/durak-kapi-kilit.js";
import { KabinKapiKilitInit } from "./pages/kabin-kapi-kilit.js";
import { KapiPanelInit } from "./pages/kapi-panel.js";
import { HalatInit } from "./pages/halat.js";
import { MotorInit } from "./pages/motor.js";
import { UCMACOPInit } from "./pages/ucm-acop.js";
import { PersonelInit } from "./pages/personel.js";
import { AsFirmaInit } from "./pages/as-firma.js";
import { PlanlamaInit } from "./pages/planlama.js";
import { DenetimInit } from "./pages/denetim.js";
import { TamponInit } from "./pages/tampon.js";
import { ProjeInit } from "./pages/proje.js";
import { TdsInit } from "./pages/tds.js";
import { FirmalarInit } from "./pages/danisman/firmalar.js";
import { BasvuruInit } from "./pages/danisman/basvuru.js";
import { BasvInit } from "./pages/basvurular.js";
import {DanismanlarInit} from './pages/danismanlar.js';
export let user;
const getCurrUSer = async () => {
  try {
    return await $.ajax({
      type: "POST",
      url: "/gudr",
      data: {},
      dataType: "json",
    });
  } catch (error) {
    console.log(error);
    return null;
  }
};
const MainRoutes =  [
  {
    path: "/",
    viewId: "#root_view",
    template: "dashboard.html",
    name: "Ctrl Panel Anasayfa",
    jsFnc: () => {},
  },
  {
    path: "/guv-aksamlar",
    viewId: "#root_view",
    template: "guv-aksamlar.html",
    name: "Güvenlik Aksamlar",
    jsFnc: () => GuvAksamInit(),
  },
  {
    path: "/sertifikalar",
    viewId: "#root_view",
    redirect: "/sertifikalar/hiz-regulatoru",
    template: "/sertifikalar/main.html",
    name: "Güvenlik Aksam Sertifikalar",
    jsFnc: () => SertifikalarInit(),
  },
  {
    path: "/sertifikalar/hiz-regulatoru",
    viewId: "#komponent-list",
    template: "/sertifikalar/hiz-regulatoru.html",
    name: "Hiz Regülatörü Sertifikalar",
    jsFnc: () => HizRegulatoruInit(),
  },
  {
    path: "/sertifikalar/fren",
    viewId: "#komponent-list",
    template: "/sertifikalar/fren.html",
    name: "Fren Sertifikalar",
    jsFnc: () => FrenInit(),
  },
  {
    path: "/sertifikalar/tampon",
    viewId: "#komponent-list",
    template: "/sertifikalar/tampon.html",
    name: "Tampon Sertifikalar",
    jsFnc: () => TamponInit(),
  },
  {
    path: "/sertifikalar/kontrol-kart",
    viewId: "#komponent-list",
    template: "/sertifikalar/kontrol-kart.html",
    name: "Kontrol Kart Sertifikalar",
    jsFnc: () => KontrolKartnInit(),
  },
  {
    path: "/sertifikalar/durak-kapi-kilit",
    viewId: "#komponent-list",
    template: "/sertifikalar/durak-kapi-kilit.html",
    name: "Durak Kapı Kilit Sertifikalar",
    jsFnc: () => DurakKapiKilitInit(),
  },
  {
    path: "/sertifikalar/kabin-kapi-kilit",
    viewId: "#komponent-list",
    template: "/sertifikalar/kabin-kapi-kilit.html",
    name: "kabin Kapı Kilit Sertifikalar",
    jsFnc: () => KabinKapiKilitInit(),
  },
  {
    path: "/sertifikalar/ucm-acop",
    viewId: "#komponent-list",
    template: "/sertifikalar/ucm-acop.html",
    name: "Halat Sertifikalar",
    jsFnc: () => UCMACOPInit(),
  },
  {
    path: "/sertifikalar/motor",
    viewId: "#komponent-list",
    template: "/sertifikalar/motor.html",
    name: "Motor Sertifikalar",
    jsFnc: () => MotorInit(),
  },
  {
    path: "/sertifikalar/kapi-panel",
    viewId: "#komponent-list",
    template: "/sertifikalar/kapi-panel.html",
    name: "Kapı Panel Sertifikalar",
    jsFnc: () => KapiPanelInit(),
  },
  {
    path: "/sertifikalar/halat",
    viewId: "#komponent-list",
    template: "/sertifikalar/halat.html",
    name: "Halat Sertifikalar",
    jsFnc: () => HalatInit(),
  },
  {
    path: "/onay-kurumlar",
    viewId: "#root_view",
    template: "/onay-kurumlar/main.html",
    name: "Onay Kurumlar",
    jsFnc: () => OnayKurumInit(),
  },
  {
    path: "/personel",
    viewId: "#root_view",
    template: "/personel/main.html",
    name: "Personeller",
    jsFnc: () => PersonelInit(),
  },
  {
    path: "/as-firma",
    viewId: "#root_view",
    template: "/as-firma/main.html",
    name: "Personeller",
    jsFnc: () => AsFirmaInit(),
  },
  {
    path: "/planlama",
    viewId: "#root_view",
    template: "/planlama/main.html",
    name: "Planlama",
    jsFnc: () => PlanlamaInit(),
  },
  {
    path: "/denetim",
    viewId: "#root_view",
    template: "/denetim/main.html",
    name: "Denetim",
    jsFnc: () => DenetimInit(),
  },
  {
    path: "/proje",
    viewId: "#root_view",
    template: "/proje/main.html",
    name: "Proje",
    jsFnc: () => ProjeInit(),
  },
  {
    path: "/tds",
    viewId: "#root_view",
    template: "/tds/main.html",
    name: "Son Kontrol",
    jsFnc: () => TdsInit(),
  },
  
  {
    path: "/basvuru",
    viewId: "#root_view",
    template: "/basvurular/main.html",
    name: "Gelen Başvurular",
    jsFnc: () => BasvInit(),
  },
  
    {
    path: "/danismanlar",
    viewId: "#root_view",
    template: "/danismanlar/main.html",
    name: "Danışmanlar",
    jsFnc: () => DanismanlarInit(),
  }
];
const DanisRoutes = [
  {
    path: "/",
    viewId: "#root_view",
    template: "/danisman/main.html",
    name: "Danışman Panel Anasayfa",
    jsFnc: () => {},
  },
  {
    path: "/firmalar",
    viewId: "#root_view",
    template: "/danisman/firmalar.html",
    name: "Danışman Firmalar",
    jsFnc: ()=>FirmalarInit(),
  },
  {
    path: "/basvurular",
    viewId: "#root_view",
    template: "/danisman/basvurular/main.html",
    name: "Danışman Denetim Talep",
    jsFnc: () => BasvuruInit(),
  }
]

const Router = async function () {
  if (location.pathname !== "/signin") {
    user = await getCurrUSer();
    let newRoutes = [];
    if (!!user && user.gorev != "Danışman") {
      const yetki = !!user && !!user.yetki ? JSON.parse(user.yetki) : null;
      if (!!yetki) {
       
        newRoutes = MainRoutes.filter((item) => {
          const cusPath = item.path;
         if (cusPath.includes("/danismanlar")) {
            return yetki.danismanlar == "on";
          }  else if (cusPath.includes("/onay-kurumlar")) {
            return yetki.onay_kurum == "on";
          } else if (cusPath.includes("/guv-aksamlar")) {
            return yetki.sertifikalar == "on";
          } else if (cusPath.includes("/sertifikalar")) {
            return yetki.sertifikalar == "on";
          } else if (cusPath.includes("/personel")) {
            return yetki.personel == "on";
          } else if (cusPath.includes("/as-firma")) {
            return yetki.as_firma == "on";
          } else if (cusPath.includes("/planlama")) {
            return yetki.planlama == "on";
          } else if (cusPath.includes("/denetim")) {
            return yetki.denetim == "on";
          } else if (cusPath.includes("/proje")) {
            return yetki.proje == "on";
          } else if (cusPath.includes("/tds")) {
            return yetki.tds == "on";
          }else if (cusPath.includes("/basvuru")) {
            return yetki.basvuru == "on";
          }  else {
            return true;
          }
        });
      }
    }else if(!!user && user.gorev == 'Danışman'){
      newRoutes = DanisRoutes
    }
    return {
      name: name,
      routes: newRoutes,
    };
  } else
    return {
      name: name,
      routes: [],
    };
};

export const Routes = await new Router();

