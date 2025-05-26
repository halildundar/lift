import { SertifikalarInit } from "./pages/sertifikalar.js";
import {HizRegulatoruInit} from './pages/hiz-regulatoru.js';
import {FrenInit} from './pages/fren.js';
import { OnayKurumInit } from "./pages/onay-kurumlar.js";
import { KontrolKartnInit } from "./pages/kontrol-kart.js";
import {DurakKapiKilitInit} from "./pages/durak-kapi-kilit.js";
import {KabinKapiKilitInit} from "./pages/kabin-kapi-kilit.js";
import { KapiPanelInit } from './pages/kapi-panel.js';
import { HalatInit} from './pages/halat.js';
import { MotorInit} from './pages/motor.js';
import { UCMACOPInit} from './pages/ucm-acop.js';  
import { ProjeFirmaInit} from './pages/proje-firma.js';
import {PersonelInit} from './pages/personel.js';
import { AsFirmaInit } from './pages/as-firma.js';
import { PlanlamaInit } from './pages/planlama.js';
import { DenetimInit } from './pages/denetim.js';
import { TamponInit } from "./pages/tampon.js";
import {ProjeInit} from './pages/proje.js';
import { TdsInit } from "./pages/tds.js";
const Router = function (name, routes) {
  return {
    name: name,
    routes: routes,
  };
};

export const Routes = new Router("myFirstRouter", [
  {
    path: "/",
    viewId: "#root_view",
    template: "dashboard.html",
    name: "Ctrl Panel Anasayfa",
    jsFnc:()=>{}
  },
  {
    path: "/guv-aksamlar",
    viewId: "#root_view",
    template: "guv-aksamlar.html",
    name: "Güvenlik Aksamlar",
    jsFnc:()=>GuvAksamInit()
  },
  {
    path: "/sertifikalar",
    viewId: "#root_view",
    redirect:'/sertifikalar/hiz-regulatoru',
    template: "/sertifikalar/main.html",
    name: "Güvenlik Aksam Sertifikalar",
    jsFnc:()=>SertifikalarInit()
  },
  {
    path: "/sertifikalar/hiz-regulatoru",
    viewId: "#komponent-list",
    template: "/sertifikalar/hiz-regulatoru.html",
    name: "Hiz Regülatörü Sertifikalar",
    jsFnc:()=>HizRegulatoruInit()
  },
  {
    path: "/sertifikalar/fren",
    viewId: "#komponent-list",
    template: "/sertifikalar/fren.html",
    name: "Fren Sertifikalar",
    jsFnc:()=>FrenInit()
  },
  {
    path: "/sertifikalar/tampon",
    viewId: "#komponent-list",
    template: "/sertifikalar/tampon.html",
    name: "Tampon Sertifikalar",
    jsFnc:()=>TamponInit()
  },
  {
    path: "/sertifikalar/kontrol-kart",
    viewId: "#komponent-list",
    template: "/sertifikalar/kontrol-kart.html",
    name: "Kontrol Kart Sertifikalar",
    jsFnc:()=>KontrolKartnInit()
  },
  {
    path: "/sertifikalar/durak-kapi-kilit",
    viewId: "#komponent-list",
    template: "/sertifikalar/durak-kapi-kilit.html",
    name: "Durak Kapı Kilit Sertifikalar",
    jsFnc:()=>DurakKapiKilitInit()
  },
  {
    path: "/sertifikalar/kabin-kapi-kilit",
    viewId: "#komponent-list",
    template: "/sertifikalar/kabin-kapi-kilit.html",
    name: "kabin Kapı Kilit Sertifikalar",
    jsFnc:()=>KabinKapiKilitInit()
  },
  {
    path: "/sertifikalar/ucm-acop",
    viewId: "#komponent-list",
    template: "/sertifikalar/ucm-acop.html",
    name: "Halat Sertifikalar",
    jsFnc:()=>UCMACOPInit()
  },
  {
    path: "/sertifikalar/motor",
    viewId: "#komponent-list",
    template: "/sertifikalar/motor.html",
    name: "Motor Sertifikalar",
    jsFnc:()=>MotorInit()
  },
  {
    path: "/sertifikalar/kapi-panel",
    viewId: "#komponent-list",
    template: "/sertifikalar/kapi-panel.html",
    name: "Kapı Panel Sertifikalar",
    jsFnc:()=>KapiPanelInit()
  },
  {
    path: "/sertifikalar/halat",
    viewId: "#komponent-list",
    template: "/sertifikalar/halat.html",
    name: "Halat Sertifikalar",
    jsFnc:()=>HalatInit()
  },
  {
    path: "/proje-firma",
    viewId: "#root_view",
    template: "/proje-firma/main.html",
    name: "Proje Firmaları",
    jsFnc:()=>ProjeFirmaInit()
  },
  {
    path: "/onay-kurumlar",
    viewId: "#root_view",
    template: "/onay-kurumlar/main.html",
    name: "Onay Kurumlar",
    jsFnc:()=>OnayKurumInit()
  },
  {
    path: "/personel",
    viewId: "#root_view",
    template: "/personel/main.html",
    name: "Personeller",
    jsFnc:()=>PersonelInit()
  },
  {
    path: "/as-firma",
    viewId: "#root_view",
    template: "/as-firma/main.html",
    name: "Personeller",
    jsFnc:()=>AsFirmaInit()
  },
  {
    path: "/planlama",
    viewId: "#root_view",
    template: "/planlama/main.html",
    name: "Planlama",
    jsFnc:()=>PlanlamaInit()
  },
  {
    path: "/denetim",
    viewId: "#root_view",
    template: "/denetim/main.html",
    name: "Denetim",
    jsFnc:()=>DenetimInit()
  },
  {
    path: "/proje",
    viewId: "#root_view",
    template: "/proje/main.html",
    name: "Proje",
    jsFnc:()=>ProjeInit()
  },
  {
    path: "/tds",
    viewId: "#root_view",
    template: "/tds/main.html",
    name: "Son Kontrol",
    jsFnc:()=>TdsInit()
  }
]);


