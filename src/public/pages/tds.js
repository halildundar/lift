import { GetIl, GetIlce, GetMahalle } from "../util/adres.js";
import { Upload } from "../util/fncs.js";
import {MAINHOST} from './constants.js';
let firmalar;
let denetciler;
let planlamalar;
let selectedDenetim;
let formlar;
const GetPlanlamalar = async () => {
  const datas = await $.ajax({
    type: "POST",
    url: "/tds/get-planlamalar",
    data: { status: "Kontrol Bekleniyor" },
    dataType: "json",
  });
  let newItem = [];

  $.map(datas, (val) => newItem.push(val));
  return newItem;
};
async function GetFirmalar() {
  const firmalar = await $.ajax({
    type: "POST",
    url: "/planlama/get-as-firmalar",
    dataType: "json",
  });
  return firmalar;
}
async function GetDenetciler() {
  const denetciler = await $.ajax({
    type: "POST",
    url: "/planlama/get-denetciler",
    dataType: "json",
  });

  return denetciler;
}
async function GetDenetimByPlanId(planId) {
  const resp = await $.ajax({
    type: "POST",
    url: "/proje/get-denetim-by-planid",
    data: { planId: planId },
    dataType: "json",
  });
  return !!resp && !!resp[0] ? resp[0] : null;
}

const getTemp = async (htmlpath) => {
  const respPlanHtml = await fetch("/templates/" + htmlpath);
  const str = await respPlanHtml.text();
  rendered = Handlebars.compile(str);
  return rendered;
};


const getOnayKurumByCertId = async (comp_name, cert_id) => {
  const rows = await $.ajax({
    type: "POST",
    url: "/tds/get-onay-kurum",
    data: { comp_name, cert_id },
    dataType: "json",
  });
  return !!rows && !!rows[0] ? rows[0] : "";
};
const getCertById = async (comp_name, cert_id) => {
  const rows = await $.ajax({
    type: "POST",
    url: "/tds/get-cert",
    data: { comp_name, cert_id },
    dataType: "json",
  });
  return !!rows && !!rows[0] ? rows[0] : "";
};
const makeSendedData = async (data) => {
  const promsForOnayKurums = $.map(
    data.komponentler,
    async function (val, key) {
      if (key == "hiz_regulator") {
        return {
          key: "hiz_regulator",
          ...(await getCertById("hiz-regulatoru", val.cert_id)),
          ...(await getOnayKurumByCertId("hiz-regulatoru", val.cert_id)),
        };
      } else if (key == "durak_kapi_kilit") {
        return {
          key: "durak_kapi_kilit",
          ...(await getCertById("durak-kapi-kilit", val.cert_id)),
          ...(await getOnayKurumByCertId("durak-kapi-kilit", val.cert_id)),
        };
      } else if (key == "fren") {
        return {
          key: "fren",
          ...(await getCertById("fren", val.cert_id)),
          ...(await getOnayKurumByCertId("fren", val.cert_id)),
        };
      } else if (key == "halat") {
        return {
          key: "halat",
          ...(await getCertById("halat", val.cert_id)),
          ...(await getOnayKurumByCertId("halat", val.cert_id)),
        };
      } else if (key == "kab_tamp") {
        return {
          key: "kab_tamp",
          ...(await getCertById("tampon", val.cert_id)),
          ...(await getOnayKurumByCertId("tampon", val.cert_id)),
        };
      } else if (key == "kar_tamp") {
        return {
          key: "kar_tamp",
          ...(await getCertById("tampon", val.cert_id)),
          ...(await getOnayKurumByCertId("tampon", val.cert_id)),
        };
      } else if (key == "kabin_kapi_kilit") {
        return {
          key: "kabin_kapi_kilit",
          ...(await getCertById("kabin-kapi-kilit", val.cert_id)),
          ...(await getOnayKurumByCertId("kabin-kapi-kilit", val.cert_id)),
        };
      } else if (key == "kapi_panel_sarkac") {
        return {
          key: "kapi_panel_sarkac",
          ...(await getCertById("kapi-panel", val.cert_id)),
          ...(await getOnayKurumByCertId("kapi-panel", val.cert_id)),
        };
      } else if (key == "kapi_panel_yangin") {
        return {
          key: "kapi_panel_yangin",
          ...(await getCertById("kapi-panel", val.cert_id)),
          ...(await getOnayKurumByCertId("kapi-panel", val.cert_id)),
        };
      } else if (key == "kart") {
        return {
          key: "kart",
          ...(await getCertById("kontrol-kart", val.cert_id)),
          ...(await getOnayKurumByCertId("kontrol-kart", val.cert_id)),
        };
      } else if (key == "motor") {
        return {
          key: "motor",
          ...(await getCertById("motor", val.cert_id)),
          ...(await getOnayKurumByCertId("motor", val.cert_id)),
        };
      } else if (key == "ucm_acop") {
        return {
          key: "ucm_acop",
          ...(await getCertById("ucm-acop", val.cert_id)),
          ...(await getOnayKurumByCertId("ucm-acop", val.cert_id)),
        };
      }
    }
  );
  for await (const res of promsForOnayKurums) {
    data.komponentler[res.key]["nobo"] = res.nobo;
    data.komponentler[res.key]["unvan"] = res.unvan;
    data.komponentler[res.key]["cert_no"] = res.cert_no;
    if (res.key === "hiz_regulator") {
      data.komponentler[res.key]["tripped_hiz"] = res.tripped_hiz;
      data.komponentler[res.key]["nom_hiz"] = res.nom_hiz;
    } else if (res.key === "fren") {
      data.komponentler[res.key]["hiz"] = res.hiz;
      data.komponentler[res.key]["kapasite"] = res.kapasite;
    } else if (res.key === "tampon") {
      data.komponentler[res.key]["hiz"] = res.hiz;
      data.komponentler[res.key]["kapasite"] = res.kapasite;
    }
  }
  let sendedData = [
    {
      search: "{formpathsfolder}",
      text: data.plan.formpathsfolder,
      type: "text",
    },
    { search: "{as_seri_no}", text: data.plan.as_seri_no, type: "text" },
    { search: "{unvan}", text: data.firma.unvan, type: "text" },
    { search: "{as_firma_adresi}", text: data.firma.adres, type: "text" },
    { search: "{as_firma_telefon}", text: data.firma.telefon, type: "text" },
    { search: "{as_firma_email}", text: data.firma.email, type: "text" },
    { search: "{son_kontrolcu}", text: data.firma.son_kontrolcu, type: "text" },
    {
      search: "{elek_hidrolik}",
      text: data.denetim.elek_hidrolik,
      type: "text",
    },
    { search: "{sinif}", text: data.denetim.sinif, type: "text" },
    { search: "{montaj_yili}", text: data.plan.tam_yil, type: "text" },
    {
      search: "{montaj_adresi}",
      text: `${data.plan.as_mahalle} ${data.plan.adres} ${data.plan.as_ilce}/${data.plan.as_il}`,
      type: "text",
    },
    { search: "{ada}", text: data.plan.ada, type: "text" },
    { search: "{parsel}", text: data.plan.parsel, type: "text" },
    {
      search: "{sirket_muduru}",
      text: data.firma.sirket_muduru,
      type: "text",
    },
    {
      search: "{as_firma_telefon}",
      text: data.firma.telefon,
      type: "text",
    },
    {
      search: "{as_firma_email}",
      text: data.firma.email,
      type: "text",
    },
    {
      search: "{yapi_sahibi}",
      text: data.plan.yapi_sahibi_adi,
      type: "text",
    },
    {
      search: "{proje_no}",
      text: data.plan.as_seri_no,
      type: "text",
    },
    {
      search: "{direkt_endirekt}",
      text: data.denetim.direkt_endirekt,
      type: "text",
    },
    {
      search: "{mak_dairesi}",
      text: data.denetim.mak_dairesi,
      type: "text",
    },
    {
      search: "{beyan_yuk}",
      text: data.denetim.beyan_yuk,
      type: "text",
    },
    {
      search: "{beyan_hiz}",
      text: data.denetim.beyan_hiz,
      type: "text",
    },
    {
      search: "{kisi_sayisi}",
      text: data.denetim.kisi_sayisi,
      type: "text",
    },
    {
      search: "{seyir_mesafesi}",
      text: data.denetim.seyir_mesafesi,
      type: "text",
    },
    {
      search: "{durak_sayisi}",
      text: data.denetim.durak_sayisi,
      type: "text",
    },
    {
      search: "{kapi_diger_adet}",
      text: data.denetim.ikinci_kapi_adet,
      type: "text",
    },
    {
      search: "{kapi_main_adet}",
      text: data.denetim.ana_kapi_adet,
      type: "text",
    },
    {
      search: "{kabin_ag}",
      text: data.denetim.kabin_ag,
      type: "text",
    },
    {
      search: "{kabin_giris_adet}",
      text: data.denetim.kabin_giris_adet == "Tek Giriş" ? 1 : 2,
      type: "text",
    },
    {
      search: "{karsi_ag_ag}",
      text: data.denetim.karsi_ag_ag,
      type: "text",
    },
    {
      search: "{kab_ray_tip}",
      text: data.denetim.kab_ray_tip,
      type: "text",
    },
    {
      search: "{kar_ray_tip}",
      text: data.denetim.kar_ray_tip,
      type: "text",
    },
    {
      search: "{kat_sayisi}",
      text: data.denetim.kat_sayisi,
      type: "text",
    },
    {
      search: "{aski_oran}",
      text: data.denetim.aski_tipi,
      type: "text",
    },
    {
      search: "{kuyu_genislik}",
      text: data.denetim.kuyu_genislik,
      type: "text",
    },
    {
      search: "{kuyu_derinlik}",
      text: data.denetim.kuyu_derinlik,
      type: "text",
    },
    {
      search: "{kabin_genislik}",
      text: data.denetim.kabin_genislik,
      type: "text",
    },
    {
      search: "{kabin_derinlik}",
      text: data.denetim.kabin_derinlik,
      type: "text",
    },
    {
      search: "{halat_mm}",
      text: data.denetim.halat_mm,
      type: "text",
    },
    {
      search: "{halat_adet}",
      text: data.denetim.halat_adet,
      type: "text",
    },
    {
      search: "{tahrik_kasnak_cap}",
      text: data.denetim.tahrik_kasnak_cap,
      type: "text",
    },
    {
      search: "{denetci}",
      text: data.plan.denetci,
      type: "text",
    },
    {
      search: "{denetim_tarih}",
      text: data.plan.denetim_tarih,
      type: "text",
    },
    {
      search: "{ana_kapi_genislik}",
      text: data.denetim.ana_kapi_genislik,
      type: "text",
    },
    {
      search: "{ana_kapi_yukseklik}",
      text: data.denetim.ana_kapi_yukseklik,
      type: "text",
    },
    {
      search: "{hiz_reg_marka}",
      text: data.komponentler.hiz_regulator.marka,
      type: "text",
    },
    {
      search: "{hiz_reg_tip}",
      text: data.komponentler.hiz_regulator.tip,
      type: "text",
    },
    {
      search: "{hiz_reg_seri_no}",
      text: data.komponentler.hiz_regulator.serino,
      type: "text",
    },
    {
      search: "{hiz_reg_nobo}",
      text: data.komponentler.hiz_regulator.nobo,
      type: "text",
    },
    {
      search: "{hiz_reg_cert_no}",
      text: data.komponentler.hiz_regulator.cert_no,
      type: "text",
    },
    {
      search: "{tripped_hiz}",
      text: data.komponentler.hiz_regulator.tripped_hiz,
      type: "text",
    },
    {
      search: "{kab_tamp_marka}",
      text: data.komponentler.kab_tamp.marka,
      type: "text",
    },
    {
      search: "{kab_tamp_tip}",
      text: data.komponentler.kab_tamp.tip,
      type: "text",
    },
    {
      search: "{kab_tamp_seri_no}",
      text: data.komponentler.kab_tamp.serino,
      type: "text",
    },
    {
      search: "{kab_tamp_nobo}",
      text: data.komponentler.kab_tamp.nobo,
      type: "text",
    },
    {
      search: "{kab_tamp_cert_no}",
      text: data.komponentler.kab_tamp.cert_no,
      type: "text",
    },
    {
      search: "{kar_tamp_marka}",
      text: data.komponentler.kar_tamp.marka,
      type: "text",
    },
    {
      search: "{kar_tamp_tip}",
      text: data.komponentler.kar_tamp.tip,
      type: "text",
    },
    {
      search: "{kar_tamp_seri_no}",
      text: data.komponentler.kar_tamp.serino,
      type: "text",
    },
    {
      search: "{kar_tamp_nobo}",
      text: data.komponentler.kar_tamp.nobo,
      type: "text",
    },
    {
      search: "{kar_tamp_cert_no}",
      text: data.komponentler.kar_tamp.cert_no,
      type: "text",
    },
    {
      search: "{durak_kapi_kilit_marka}",
      text: data.komponentler.durak_kapi_kilit.marka,
      type: "text",
    },
    {
      search: "{durak_kapi_kilit_tip}",
      text: data.komponentler.durak_kapi_kilit.tip,
      type: "text",
    },
    {
      search: "{durak_kapi_kilit_seri_no}",
      text: data.komponentler.durak_kapi_kilit.serino,
      type: "text",
    },
    {
      search: "{durak_kapi_kilit_nobo}",
      text: data.komponentler.durak_kapi_kilit.nobo,
      type: "text",
    },
    {
      search: "{durak_kapi_kilit_cert_no}",
      text: data.komponentler.durak_kapi_kilit.cert_no,
      type: "text",
    },

    {
      search: "{kabin_kapi_kilit_marka}",
      text: data.komponentler.kabin_kapi_kilit.marka,
      type: "text",
    },
    {
      search: "{kabin_kapi_kilit_tip}",
      text: data.komponentler.kabin_kapi_kilit.tip,
      type: "text",
    },
    {
      search: "{kabin_kapi_kilit_seri_no}",
      text: data.komponentler.kabin_kapi_kilit.serino,
      type: "text",
    },
    {
      search: "{kabin_kapi_kilit_nobo}",
      text: data.komponentler.kabin_kapi_kilit.nobo,
      type: "text",
    },
    {
      search: "{kabin_kapi_kilit_cert_no}",
      text: data.komponentler.kabin_kapi_kilit.cert_no,
      type: "text",
    },
    {
      search: "{fren_marka}",
      text: data.komponentler.fren.marka,
      type: "text",
    },
    {
      search: "{fren_tip}",
      text: data.komponentler.fren.tip,
      type: "text",
    },
    {
      search: "{fren_seri_no}",
      text: data.komponentler.fren.serino,
      type: "text",
    },
    {
      search: "{fren_nobo}",
      text: data.komponentler.fren.nobo,
      type: "text",
    },
    {
      search: "{fren_cert_no}",
      text: data.komponentler.fren.cert_no,
      type: "text",
    },
    {
      search: "{kart_marka}",
      text: data.komponentler.kart.marka,
      type: "text",
    },
    {
      search: "{kart_tip}",
      text: data.komponentler.kart.tip,
      type: "text",
    },
    {
      search: "{kart_seri_no}",
      text: data.komponentler.kart.serino,
      type: "text",
    },
    {
      search: "{kart_nobo}",
      text: data.komponentler.kart.nobo,
      type: "text",
    },
    {
      search: "{kart_cert_no}",
      text: data.komponentler.kart.cert_no,
      type: "text",
    },
    {
      search: "{motor_marka}",
      text: data.komponentler.motor.marka,
      type: "text",
    },
    {
      search: "{motor_tip}",
      text: data.komponentler.motor.tip,
      type: "text",
    },
    {
      search: "{motor_seri_no}",
      text: data.komponentler.motor.serino,
      type: "text",
    },
    {
      search: "{motor_nobo}",
      text: data.komponentler.motor.nobo,
      type: "text",
    },
    {
      search: "{motor_cert_no}",
      text: data.komponentler.motor.cert_no,
      type: "text",
    },
    {
      search: "{motor_kw}",
      text: data.komponentler.motor.kw,
      type: "text",
    },
    {
      search: "{motor_rpm}",
      text: data.komponentler.motor.rpm,
      type: "text",
    },
    {
      search: "{motor_ratio}",
      text: data.komponentler.motor.motor_ratio,
      type: "text",
    },
    {
      search: "{modul_e_bool}",
      text: data.plan.modul === "Modul E",
      type: "boolean",
    },
    {
      search: "{modul_f_bool}",
      text: data.plan.modul === "Modul F",
      type: "boolean",
    },
    {
      search: "{modul_b_bool}",
      text: data.plan.modul === "Modul B",
      type: "boolean",
    },
    {
      search: "{modul_g_bool}",
      text: data.plan.modul === "Modul G",
      type: "boolean",
    },
    {
      search: "{modul_h1_bool}",
      text: data.plan.modul === "Modul H1",
      type: "boolean",
    },
    {
      search: "{modul_d_bool}",
      text: data.plan.modul === "Modul D",
      type: "boolean",
    },
    {
      search: "{imza_kase_img1}",
      text: MAINHOST + data.firma.imza_kase,
      type: "image",
    },
    {
      search: "{firma_logo_img1}",
      text: MAINHOST + data.firma.logo,
      type: "image",
    },
       {
      search: "{son_kontrol_imz1}",
      text: MAINHOST + data.firma.imza_kase,
      type: "image",
    },
    {
      search: "{fren_img}",
      text: MAINHOST + data.komponentler.fren.img,
      type: "image",
    },
    {
      search: "{hiz_regulator_img}",
      text: MAINHOST + data.komponentler.hiz_regulator.img,
      type: "image",
    },
    {
      search: "{kart_img}",
      text: MAINHOST + data.komponentler.kart.img,
      type: "image",
    },
    {
      search: "{kab_tamp_img}",
      text: MAINHOST + data.komponentler.kab_tamp.img,
      type: "image",
    },
    {
      search: "{kar_tamp_img}",
      text: MAINHOST + data.komponentler.kar_tamp.img,
      type: "image",
    },
    {
      search: "{kar_tamp_img}",
      text: MAINHOST + data.komponentler.kar_tamp.img,
      type: "image",
    },
    {
      search: "{durak_kapi_kilit_img}",
      text: MAINHOST + data.komponentler.durak_kapi_kilit.img,
      type: "image",
    },
    {
      search: "{kabin_kapi_kilit_img}",
      text: MAINHOST + data.komponentler.kabin_kapi_kilit.img,
      type: "image",
    },
    {
      search: "{motor_img}",
      text: MAINHOST + data.komponentler.motor.img,
      type: "image",
    },
    {
      search: "{onay_isim}",
      text: "TUV CYPRUS LTD",
      type: "text",
    },
    {
      search: "{onay_adres}",
      text: "2 Papaflessa Street, 2235 Latsia, Nicosia, Cyprus, P.O.BOX.: 20732, Nicosia 1663",
      type: "text",
    },
    { search: "{onay_nobo}", text: "2261", type: "text" },
    { search: "{ab_uyg_tarih}", text: data.denetim.ab_uyg_tarih, type: "text" },
    { search: "{son_kon_tarih}", text: data.denetim.son_kon_tarih, type: "text" },
    { search: "{son_kon_imz}", text: MAINHOST + data.firma.son_kon_imz, type: "image" },
    { search: "{kisa_ad}", text: data.firma.kisa_ad, type: "text" },
     { search: "{modul_b_cert_data}", text: data.plan.kisa_ad, type: "text" }
  ];
  data.denetim.risk = !!data.denetim.risk
    ? JSON.parse(data.denetim.risk)
    : null;
  if (!!data.denetim.risk && !!data.denetim.risk.kabinust) {
    let items = [
      {
        search: "{yayim_tarih_kabinust}",
        text: data.denetim.risk.kabinust.yayim_tarih,
        type: "text",
      },
      {
        search: "{risk_analiz_kabinust}",
        text: data.denetim.risk.kabinust.risk_analiz,
        type: "text",
      },
      {
        search: "{risk_analiz_en_kabinust}",
        text: data.denetim.risk.kabinust.risk_analiz_en,
        type: "text",
      },
      {
        search: "{tehlikeli_durum_kabinust}",
        text: data.denetim.risk.kabinust.tehlikeli_durum,
        type: "text",
      },
      {
        search: "{tehlikeli_durum_en_kabinust}",
        text: data.denetim.risk.kabinust.tehlikeli_durum_en,
        type: "text",
      },
      {
        search: "{uyg_img1_kabinust}",
        text: MAINHOST + data.denetim.risk.kabinust.uyg_img1,
        type: "image",
      },
      {
        search: "{uyg_img2_kabinust}",
        text:  MAINHOST + data.denetim.risk.kabinust.uyg_img2,
        type: "image",
      },
      {
        search: "{uyg_img3_kabinust}",
        text:  MAINHOST + data.denetim.risk.kabinust.uyg_img3,
        type: "image",
      },
      {
        search: "{uyg_img4_kabinust}",
        text:  MAINHOST + data.denetim.risk.kabinust.uyg_img4,
        type: "image",
      },
    ];
    sendedData = [...sendedData, ...items];
  }
  if (!!data.denetim.risk && !!data.denetim.risk.kuyudip) {
    let items = [
      {
        search: "{yayim_tarih_kuyudip}",
        text: data.denetim.risk.kuyudip.yayim_tarih,
        type: "text",
      },
      {
        search: "{risk_analiz_kuyudip}",
        text: data.denetim.risk.kuyudip.risk_analiz,
        type: "text",
      },
      {
        search: "{risk_analiz_en_kuyudip}",
        text: data.denetim.risk.kuyudip.risk_analiz_en,
        type: "text",
      },
      {
        search: "{tehlikeli_durum_kuyudip}",
        text: data.denetim.risk.kuyudip.tehlikeli_durum,
        type: "text",
      },
      {
        search: "{tehlikeli_durum_en_kuyudip}",
        text: data.denetim.risk.kuyudip.tehlikeli_durum_en,
        type: "text",
      },
      {
        search: "{uyg_img1_kuyudip}",
        text:  MAINHOST + data.denetim.risk.kuyudip.uyg_img1,
        type: "image",
      },
      {
        search: "{uyg_img2_kuyudip}",
        text:  MAINHOST + data.denetim.risk.kuyudip.uyg_img2,
        type: "image",
      },
      {
        search: "{uyg_img3_kuyudip}",
        text:  MAINHOST + data.denetim.risk.kuyudip.uyg_img3,
        type: "image",
      },
      {
        search: "{uyg_img4_kuyudip}",
        text: MAINHOST +  data.denetim.risk.kuyudip.uyg_img4,
        type: "image",
      },
    ];
    sendedData = [...sendedData, ...items];
  }
  if (!!data.denetim.risk && !!data.denetim.risk.makdairesi) {
    let items = [
      {
        search: "{yayim_tarih_makdairesi}",
        text: data.denetim.risk.makdairesi.yayim_tarih,
        type: "text",
      },
      {
        search: "{risk_analiz_makdairesi}",
        text: data.denetim.risk.makdairesi.risk_analiz,
        type: "text",
      },
      {
        search: "{risk_analiz_en_makdairesi}",
        text: data.denetim.risk.makdairesi.risk_analiz_en,
        type: "text",
      },
      {
        search: "{tehlikeli_durum_makdairesi}",
        text: data.denetim.risk.makdairesi.tehlikeli_durum,
        type: "text",
      },
      {
        search: "{tehlikeli_durum_en_makdairesi}",
        text: data.denetim.risk.makdairesi.tehlikeli_durum_en,
        type: "text",
      },
      {
        search: "{uyg_img1_makdairesi}",
        text: MAINHOST +  data.denetim.risk.makdairesi.uyg_img1,
        type: "image",
      },
      {
        search: "{uyg_img2_makdairesi}",
        text: MAINHOST +  data.denetim.risk.makdairesi.uyg_img2,
        type: "image",
      },
      {
        search: "{uyg_img3_makdairesi}",
        text: MAINHOST +  data.denetim.risk.makdairesi.uyg_img3,
        type: "image",
      },
      {
        search: "{uyg_img4_makdairesi}",
        text: MAINHOST +  data.denetim.risk.makdairesi.uyg_img4,
        type: "image",
      },
    ];
    sendedData = [...sendedData, ...items];
  }

  // {
  //     search: "{onay_isim}",
  //     text: "UDEM ULUSLARARASI BELGELENDİRME DENETİM EĞİTİM MERKEZİ SANAYİ VE TİCARET LİMİTED ŞİRKETİ",
  //     type: "text",
  //   },
  //   {
  //     search: "{onay_adres}",
  //     text: "MUTLUKENT MAH. 2073 SOK. NO: 10 ÜMİTKÖY / ANKARA",
  //     type: "text",
  //   },
  //   { search: "{onay_nobo}", text: "2292", type: "text" },
  console.log("sendedData", sendedData);

  return sendedData;
};
const innerMakeTable = async (plan) => {
  selectedDenetim = await GetDenetimByPlanId(plan.id);
  let tds_folders =
    !!selectedDenetim && !!selectedDenetim.tds_folders
      ? JSON.parse(selectedDenetim.tds_folders)
      : "";
  let guv_komps =
    !!selectedDenetim && !!selectedDenetim.guv_komps
      ? JSON.parse(selectedDenetim.guv_komps)
      : "";
  let imzali_formlar =
    !!selectedDenetim && !!selectedDenetim.imzali_formlar
      ? JSON.parse(selectedDenetim.imzali_formlar)
      : "";
  const data =
    !!selectedDenetim && !!selectedDenetim.proje
      ? JSON.parse(selectedDenetim.proje)
      : "";
  formlar = [
    {
      filename: "1.Application Form.pdf",
      label: "",
      url: !!imzali_formlar ? imzali_formlar["imz_af"] : "",
    },
    {
      filename: `2.Building Permit.${plan.yapi_ruhsati.split(".").pop()}`,
      label: "",
      url: plan.yapi_ruhsati,
    },
    {
      filename: "3.Checklist.pdf",
      label: "",
      url: !!imzali_formlar ? imzali_formlar["imz_chec"] : "",
    },
    {
      filename: "4.Elevator Inspectation Report.pdf",
      label: "",
      url: !!imzali_formlar ? imzali_formlar["imz_eir"] : "",
    },
    {
      filename: "5.Calculations and Construction Plan.pdf",
      label: "",
      url: !!data ? data.proje.pdf : "",
    },
    {
      filename: "6.Declaration of Confirmity.pdf",
      label: "",
      url: !!tds_folders && !!tds_folders["0"] ? tds_folders["0"] : "",
    },
    {
      filename: "7.Photo.pdf",
      label: "",
      url: !!tds_folders && !!tds_folders["1"] ? tds_folders["1"] : "",
    },
    {
      filename: "8.Technical Descriptions and Manuals.pdf",
      label: "",
      url: !!tds_folders && !!tds_folders["2"] ? tds_folders["2"] : "",
    },
    {
      filename: "9.1.Project Service Contract.pdf",
      label: "",
      url: !!data ? data.proje.sozlesme : "",
    },
    {
      filename: `9.2.Engineers Competency Certificates.${
        !!data.proje ? data.proje.smm.split(".").pop() : ""
      }`,
      label: "",
      url: !!data ? data.proje.smm : "",
    },
    {
      filename: "9.3.boş",
      label: "",
      url: "",
    },
    {
      filename: "10.Contract.pdf",
      label: "",
      url: !!guv_komps ? imzali_formlar["imz_cont"] : "",
    },
    {
      filename: "11.Technical File Report For Elevator.pdf",
      label: "",
      url: !!guv_komps ? imzali_formlar["imz_tfrfe"] : "",
    },
    {
      filename: "12.1.Safety Comp. BUFFER.pdf",
      label: !!guv_komps
        ? `Buffer ${guv_komps.kab_tamp.marka} - ${guv_komps.kab_tamp.tip}`
        : "Buffer -",
      url: !!guv_komps ? guv_komps.kab_tamp.cert_url : "",
    },
    {
      filename: "12.2.Safety Comp. WIRE ROPES.pdf",
      label: "",
      url: !!guv_komps ? guv_komps.halat.cert_url : "",
    },
    {
      filename: "12.3.Safety Comp. MAIN BOARD.pdf",
      label: !!guv_komps
        ? `Kontrol Kart ${guv_komps.kart.marka} - ${guv_komps.kart.tip}`
        : "Main Board -",
      url: !!guv_komps ? guv_komps.kart.cert_url : "",
    },
    {
      filename: "12.4.Safety Comp. SAFETY GEAR.pdf",
      label: !!guv_komps
        ? `Safety Gear ${guv_komps.fren.marka} - ${guv_komps.fren.tip}`
        : "Safety Gear -",
      url: !!guv_komps ? guv_komps.fren.cert_url : "",
    },
    {
      filename: "12.5.Safety Comp. OVERSPEED GOVERNER.pdf",
      label: !!guv_komps
        ? `Overspeed Governe ${guv_komps.hiz_regulator.marka} - ${guv_komps.hiz_regulator.tip}`
        : "Overspeed Governer -",
      url: !!guv_komps ? guv_komps.hiz_regulator.cert_url : "",
    },
    {
      filename: "12.6.Safety Comp. ASCENDING OVERSPEED PROTECTION.pdf",
      label: !!guv_komps
        ? `Ascending Overspeed Protection ${guv_komps.ucm_acop.marka} - ${guv_komps.ucm_acop.tip}`
        : "Ascennding Overspeed Protection -",
      url: !!guv_komps ? guv_komps.ucm_acop.cert_url : "",
    },
    {
      filename: "12.7.Safety Comp. Landing DOOR LOCKING DEVICE.pdf",
      label: !!guv_komps
        ? `Landing Door Locking Device ${guv_komps.durak_kapi_kilit.marka} - ${guv_komps.durak_kapi_kilit.tip}`
        : "Landing Door Locking Device -",
      url: !!guv_komps ? guv_komps.durak_kapi_kilit.cert_url : "",
    },
    {
      filename: "12.8.Safety Comp. CAR Door LOCKING DEVICE.pdf",
      label: !!guv_komps
        ? `Car Door Locking Device ${guv_komps.kabin_kapi_kilit.marka} - ${guv_komps.kabin_kapi_kilit.tip}`
        : "Car Door Locking Device -",
      url: !!guv_komps ? guv_komps.kabin_kapi_kilit.cert_url : "",
    },
    {
      filename: "12.9.DOORS PENDULUM.pdf",
      label: !!guv_komps
        ? `Doors Pendulum ${guv_komps.kapi_panel_sarkac.marka} - ${guv_komps.kapi_panel_sarkac.tip}`
        : "Doors Pendulum -",
      url: !!guv_komps ? guv_komps.kapi_panel_sarkac.cert_url : "",
    },
    {
      filename: "12.10.DOORS FIRE RESISTANCE.pdf",
      label: !!guv_komps
        ? `Doors Fire Resistance ${guv_komps.kapi_panel_yangin.marka} - ${guv_komps.kapi_panel_yangin.tip}`
        : "Doors Fire Resistance -",
      url: !!guv_komps ? guv_komps.kapi_panel_yangin.cert_url : "",
    },
    {
      filename: "13.SAMPLE TABLE. NEEDED DETAILS FOR CERTIFICATION.docx",
      label: "",
      url: !!tds_folders && !!tds_folders["3"] ? tds_folders["3"] : "",
    },
    {
      filename: "14.Certificate Annex For Modul B.docx",
      label: "",
      url: !!tds_folders && !!tds_folders["4"] ? tds_folders["4"] : "",
    },
  ];
  if (plan.modul === "Modul B") {
    const formatfile = data.proje.tip_proje.split(".").pop();
    formlar[10] = {
      filename: !!data
        ? `9.3.Type Projects Calculations and Constructions.${formatfile}`
        : "",
      label: "",
      url: !!data ? data.proje.tip_proje : "",
    };
  } else if (plan.modul === "Modul E" || plan.modul === "Modul H1") {
    formlar[10] = {
      filename: "9.3.ISO Documents.pdf",
      label: "",
      url: "",
    };
    formlar = formlar.filter(
      (item, index) => item.filename != "14.Certificate Annex For Modul B.docx"
    );
  } else if (plan.modul === "Modul G") {
    formlar = formlar.filter(
      (item, index) =>
        !(
          item.filename == "14.Certificate Annex For Modul B.docx" ||
          item.filename == "9.3.boş"
        )
    );
    console.log(selectedDenetim);
    if (!!selectedDenetim && !!selectedDenetim.risk) {
      let riskdata = JSON.parse(selectedDenetim.risk);
      if (!!riskdata.kabinust) {
        formlar.push({
          filename: `20.Kabin Üst Risk Analiz.pdf`,
          label: "",
          url: `${selectedDenetim.folder_path}/teknikdosya/20.Kabin Üst Risk Analiz.pdf`,
        });
      }
      if (!!riskdata.kuyudip) {
        formlar.push({
          filename: `21.Kuyu Dip Risk Analiz.pdf`,
          label: "",
          url: `${selectedDenetim.folder_path}/teknikdosya/21.Kuyu Dip Risk Analiz.pdf`,
        });
      }
      if (!!riskdata.makdairesi) {
        // let url = tds_folders.find((item) =>item.includes("22.Makine Dairesi Risk Analiz"));
        formlar.push({
          filename: `22.Makine Dairesi Risk Analiz.pdf`,
          label: "",
          url: `${selectedDenetim.folder_path}/teknikdosya/22.Makine Dairesi Risk Analiz.pdf`,
        });
      }
    }
  }
  $(`.plan${plan.id} .tuv-forms ul`).html("");
  $.each(formlar, (index, val) => {
    let downurlname = val.filename;
    let hrefItem = !!val.url ? val.url.replaceAll(".docx", ".pdf") : val.url;
    if (downurlname.includes(".docx")) {
      hrefItem = hrefItem.replaceAll(".pdf", ".docx");
    }
    $(`.plan${plan.id} .tuv-forms ul`).append(`
            <li><a href="${!!val ? hrefItem : ""}" download="${
      !!val ? downurlname : "None"
    }" class="underline ${
      !!val && !!val.url ? "text-blue-600" : "text-red-600"
    }">${!!val ? downurlname : ""}</a></li>
          `);
    if (!(!!val && !!val.url)) {
      $(`.plan${plan.id} .btn-tum-indir`).css("display", "none");
    }
  });

  setTimeout(async () => {
    if ($(`#plan${plan.id} + div`).css("display") != "none") {
      $(`#plan${plan.id}`).addClass("bg-yellow-100");
      $(this).removeClass("border-b");
    } else {
      $(`#plan${plan.id}`).removeClass("bg-yellow-100");
      $(this).addClass("border-b");
    }
  }, 250);

  //Settings Area
  let comps;
  if (!!selectedDenetim) {
    comps = $.map(JSON.parse(selectedDenetim.guv_komps), function (val, key) {
      const komp_name = key.replaceAll("_", " ");
      return {
        komp_name,
        ...val,
      };
    });
  }

  const rendSettings = await getTemp("tds/settings.html");

  const firmaData = Object.values(firmalar).find(
    (item) => item.id == plan.as_firma_id
  );
  $(`.plan${plan.id} .settings`).html(
    rendSettings({
      name: "Halil Dündar",
      imza_kase_url: firmaData.imza_kase,
      logo_url: firmaData.logo,
      guv_komps: comps,
      son_kon_imz_url:firmaData.son_kon_imz
    })
  );

  let folderpath =
    "/uploads/as-firma/" + firmaData.kisa_ad + "/Kuruluş Evraklar";
  $(`.plan${plan.id} .settings .logo-area [title='yukle']`).on(
    "click",
    function () {
      $(`.plan${plan.id} .settings .logo-area [name='logo']`).val("");
      $(`.plan${plan.id} .settings .logo-area [name='logo']`).trigger("click");
    }
  );
  $(`.plan${plan.id} .settings .logo-area [name='logo']`).on(
    "change",
    async function () {
      let file = $(this).get(0).files[0];
      let fileuzanti = file.name.split(".").pop();
      let filename = `logo.${fileuzanti}`;
      var upload = new Upload(file);
      const { msg } = await upload.doUpload(`${folderpath}/`, "logo");
      if (!!msg && msg == "Ok!") {
        await $.ajax({
          type: "POST",
          url: "/as-firma/update",
          data: {id:plan.as_firma_id, logo: `${folderpath}/${filename}` },
          dataType: "json",
        });
        await innerMakeTable(plan);
      }
    }
  );
  $(`.plan${plan.id} .settings .imza-kase-area [title='yukle']`).on(
    "click",
    function () {
      $(`.plan${plan.id} .settings .imza-kase-area [name='imza-kase']`).val("");
      $(`.plan${plan.id} .settings .imza-kase-area [name='imza-kase']`).trigger(
        "click"
      );
    }
  );
   $(`.plan${plan.id} .settings .imza-kase-area [name='imza-kase']`).on(
    "change",
    async function () {
      let file = $(this).get(0).files[0];
      let fileuzanti = file.name.split(".").pop();
      let filename = `imza_kase.${fileuzanti}`;
      var upload = new Upload(file);
      const { msg } = await upload.doUpload(`${folderpath}/`, "imza_kase");
      if (!!msg && msg == "Ok!") {
        await $.ajax({
          type: "POST",
          url: "/as-firma/update",
          data: { id:plan.as_firma_id,imza_kase: `${folderpath}/${filename}` },
          dataType: "json",
        });
        await innerMakeTable(plan);
      }
    }
  );
  $(`.plan${plan.id} .settings .son-kon-area [title='yukle']`).on("click",
    async function () {
      $(`.plan${plan.id} .settings .son-kon-area [name='son_kon_imz']`).val("");
      $(`.plan${plan.id} .settings .son-kon-area [name='son_kon_imz']`).trigger("click");
    }
  );
   $(`.plan${plan.id} .settings .son-kon-area [name='son_kon_imz']`).on(
    "change",
    async function () {
      let file = $(this).get(0).files[0];
      let fileuzanti = file.name.split(".").pop();
      let filename = `son_kon_imza.${fileuzanti}`;
      var upload = new Upload(file);
      const { msg } = await upload.doUpload(
        `${folderpath}/`,
        "son_kon_imza"
      );
      if (!!msg && msg == "Ok!") {
        await $.ajax({
          type: "POST",
          url: "/as-firma/update",
          data: { id:plan.as_firma_id,son_kon_imz: `${folderpath}/${filename}` },
          dataType: "json",
        });
        await innerMakeTable(plan);
      }
    }
  );
  $(`.plan${plan.id} .settings .diger-area .btn-ab-son-tarih-save`).on('click',async function(e){
    e.preventDefault();
    let form = $(`.plan${plan.id} .settings .diger-area form`).serializeJSON();
    console.log(form);
    await $.ajax({
      type: "POST",
      url: "/tds/update-ab-son-tarih",
      data: {denetim_id:selectedDenetim.id,...form},
      dataType: "json"
    });
    await innerMakeTable(plan);
  });

  if (!!selectedDenetim) {
    $(`.plan${plan.id} .settings .diger-area [name='ab_uyg_tarih']`).val(selectedDenetim.ab_uyg_tarih);
    $(`.plan${plan.id} .settings .diger-area [name='son_kon_tarih']`).val(selectedDenetim.son_kon_tarih);

    let risk = !!selectedDenetim.risk ? selectedDenetim.risk : "";
    const resultData = {
      firma: firmaData,
      denetci: "",
      plan: plan,
      denetim: selectedDenetim,
      modulb_certs: JSON.parse(selectedDenetim.modulb_certs),
      imzali_formlar: JSON.parse(selectedDenetim.imzali_formlar),
      ...JSON.parse(selectedDenetim.proje),
      komponentler: JSON.parse(selectedDenetim.guv_komps),
    };
    $(`.plan${plan.id} .btnn-area .btn-yazdir`).remove();
     $(`.plan${plan.id} .btnn-area`).append(`
      <button
        class="btn-yazdir rounded min-w-[75px] bg-blue-600 hover:bg-blue-700 active:bg-blue-500 text-white py-1"
      >
        Yazdır
      </button>
      `);
    $(`.plan${plan.id} .btn-yazdir`).on("click", async function () {
      $(`.spinner-area`).css("display", "flex");
      $("body").css("overflow", "hidden");
      const sended_data = await makeSendedData(resultData);
      const rep = await $.ajax({
        type: "POST",
        url: "/tds/teknik-dosya",
        data: { template_name: "temp1", sended_data: sended_data, risk: risk },
        dataType: "json",
      });
      const { formpaths } = rep;
      await $.ajax({
        type: "POST",
        url: "/denetim/update-tds-folders",
        data: { denetim_id: selectedDenetim.id, tds_folders: formpaths },
        dataType: "json",
      });
      await innerMakeTable(plan);
      $(`.spinner-area`).css("display", "none");
      $("body").css("overflow", "auto");
    });
  }
};
const makeTable = async (plans) => {
  rendered = await getTemp("tds/plan.html");
  $("#tbody1").html(rendered({ plans: plans }));
  for (let i = 0; i < plans.length; i++) {
    const plan = plans[i];
    $(`#plan${plan.id}`).on("click", async function () {
      $(`#plan${plan.id} + div`).slideToggle(200);
      await innerMakeTable(plan);
      $(`.plan${plan.id} .btn-denetime-gonder`).on("click", async function () {
        console.log("btn-denetime-gonder");
        await $.ajax({
          type: "POST",
          url: "/tds/update-plan-status",
          data: { plan_id: plan.id, status: "Denetim Bekleniyor" },
          dataType: "json",
        });
        await TdsInit();
      });
      $(`.plan${plan.id} .btn-projeye-gonder`).on("click", async function () {
        await $.ajax({
          type: "POST",
          url: "/tds/update-plan-status",
          data: { plan_id: plan.id, status: "Proje Bekleniyor" },
          dataType: "json",
        });
        await TdsInit();
      });
      $(`.plan${plan.id} .btn-onayla`).on("click", async function () {
        console.log("Belge Bekleniyor");
        await TdsInit();
      });
    });

    $(`.plan${plan.id} .btn-tum-indir`).on("click", async function () {
      $(`.spinner-areaaa`).css("display", "flex");
      await innerMakeTable(plan);
      const rsp = await $.ajax({
        type: "POST",
        url: "/tds/download-forms",
        data: { forms: formlar },
        dataType: "json",
      });
      if (!!rsp && !!rsp.downurl) {
        $(".anc-indir-area").removeClass("hidden");
        $(".anc-indir-area a").attr("href", rsp.downurl);
        const fn = rsp.downurl.split("/").pop();
        $(".anc-indir-area a").attr("download", fn);
        $(".indr-spin-area").css("display", "none");
        $(".anc-indir-area a").on("click", function () {
          $(`.spinner-areaaa`).css("display", "none");
          $(".anc-indir-area").addClass("hidden");
          $(".indr-spin-area").css("display", "block");
        });
      }
    });
  }
  if (plans.length == 0) {
    $(`#tbody1`).html(`
      <div class="py-2 flex justify-center items-center font-bold text-black/40">Herhangi bir kontrol talebi bulunamadı</div>
      `);
  }

  $(`.spinner-area`).css("display", "none");
};
export const TdsInit = async () => {
  $("#tbody1").html("");
  firmalar = await GetFirmalar();
  denetciler = await GetDenetciler();
  planlamalar = await GetPlanlamalar();
  let promises = [];
  for (let i = 0; i < planlamalar.length; i++) {
    let item = planlamalar[i];
    $.map(firmalar, (firma) => {
      if (firma.id == item.as_firma_id) {
        item["as_firma_kisa_ad"] = firma.kisa_ad;
      }
    });
    $.map(denetciler, (denetci) => {
      if (denetci.id == item.denetci_id) {
        item["denetci"] = denetci.name;
      }
    });
    item["as_il"] = (await GetIl(item.il_id)).il_adi;
    item["as_ilce"] = (await GetIlce(item.ilce_id)).ilce_adi;
    item["as_mahalle"] = (await GetMahalle(item.mahalle_id)).mahalle_adi;
    promises.push(item);
  }
  planlamalar = await Promise.all(promises);
  $("#tbody1 + div").css("display", "none");
  if (!!planlamalar && planlamalar.length > 0) {
    makeTable(planlamalar);
    $("#tbody1 + div").css("display", "none");
  } else {
    $("#tbody1 + div").css("display", "block");
  }
};
