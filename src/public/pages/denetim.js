import {
  Upload,
  pad,
  getAyGunuHesapla,
} from "../util/fncs.js";

import {
  GetSertifikalar,
} from "./sertifikalar.js";
import {GetIl, GetIlce, GetMahalle } from "../util/adres.js";
import { isJson } from "../util/fncs.js";
let month;
let year;
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
async function GetCertifikaById(tur, certId) {
  return await $.ajax({
    type: "POST",
    url: "/denetim/get-sertifika",
    data: { tur: tur, certId: certId },
    dataType: "json",
  });
}
async function getPlansfromDb(month, year) {
  let start_date = "01.03.2025";
  let end_date = "07.03.2025";
  let dateIslem = new Date(year, month, 1);
  start_date = `${pad(dateIslem.getDate(), 2)}.${pad(
    dateIslem.getMonth() + 1,
    2
  )}.${dateIslem.getFullYear()}`;
  const lastDay = getAyGunuHesapla(
    dateIslem.getFullYear(),
    dateIslem.getMonth() + 1
  );
  dateIslem.setDate(lastDay);
  end_date = `${pad(dateIslem.getDate(), 2)}.${pad(
    dateIslem.getMonth() + 1,
    2
  )}.${dateIslem.getFullYear()}`;
  const planlamalar = await $.ajax({
    type: "POST",
    url: "/denetim/get-planlamalar",
    data: { start_date, end_date, plan_status: "Denetim Bekleniyor" },
    dataType: "json",
  });
  const promises = $.map(planlamalar, async (item) => {
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
    return item;
  });
  return await Promise.all(promises);
}
const getAsBilgiByPlanId = async (planId) => {
  const res = await $.ajax({
    type: "POST",
    url: "/denetim/get-denetim-by-planid",
    data: JSON.stringify({ planId: planId }),
    dataType: "json",
    contentType: "application/json",
  });
  return res;
};
function hizRegSelectMake(selectedCert) {
  $(".h-reg-form-area").css("display", "flex");
  $(`[name='guv_komps[hiz_regulator][cert_id]']`).val(selectedCert.id);
  $(`[name='guv_komps[hiz_regulator][cert_url]']`).val(
    selectedCert.cert_filepath
  );
  $(`[name='guv_komps[hiz_regulator][marka]']`).val(selectedCert.marka);
  $(`[name='guv_komps[hiz_regulator][serino]']`).val("");
  $(".h-reg-marka-adi").html(selectedCert.marka);
  $(".h-reg-cert-url").attr("href", selectedCert.cert_filepath);
  const tipler = selectedCert.tip.split(",");
  $(`[name='guv_komps[hiz_regulator][tip]']`).html("");
  if (!!selectedCert.tip && tipler.length > 0) {
    for (let i = 0; i < tipler.length; i++) {
      const tip = tipler[i];
      $(`[name='guv_komps[hiz_regulator][tip]']`).append(`
        <option value="${tip}">${tip}</option>
        `);
    }
  } else if (!!selectedCert.tip && tipler.length == 0) {
    $(`[name='guv_komps[hiz_regulator][tip]']`).append(`
      <option value="${selectedCert.tip}">${selectedCert.tip}</option>
      `);
  }
}
async function onGetHizRegulatorler() {
  const { data } = await GetSertifikalar("hiz-regulatoru");
  const sertifikalar = data;
  $(".cert-table").html("");
  $(".tb-cert-head").html(`
        <th>Seritifika No</th>
            <th>Marka</th>
            <th>Tip/ler</th>
            <th>Nominal Speed</th>
            <th>Tripped Speed</th>
            <th>Sertifika</th>
    `);
  $(".tb-title").html("Hız Regülatörü Sertifikalar");
  for (let i = 0; i < sertifikalar.length; i++) {
    const sertifika = sertifikalar[i];
    $(".cert-table").append(`
      <tr id="certid_${sertifika.id}" class="border-b border-gray-200  py-2 hover:bg-black/5 duration-150 cursor-pointer">
               <td class="text-center ">
                <div class="line-clamp-1 text-[0.8rem]">${sertifika.cert_no}</div>
               </td>
               <td class="text-center  border-l border-gray-200 px-2"><div class="line-clamp-1 text-[0.8rem]">${sertifika.marka}</div></td>
               <td class="text-center  border-l border-gray-200 px-2"><div class="line-clamp-1 text-[0.8rem]">${sertifika.tip}</div></td>
               <td class="text-center  border-l border-gray-200 px-2"><div class="line-clamp-1 text-[0.8rem]">${sertifika.nom_hiz}</div></td>
               <td class="text-center  border-l border-gray-200 px-2"><div class="line-clamp-1 text-[0.8rem]">${sertifika.tripped_hiz}</div></td>
               <td class="text-center  border-l border-gray-200 px-2"> 
                 <a href="${sertifika.cert_filepath}" target="_blank" class="text-blue-500 hover:underline">İncele</a>
               </td>
             </tr>
     `);
  }

  $(".cert-table tr").each(function () {
    const anchorTag = $(this).find("a");
    if (!!anchorTag) {
      anchorTag.on("click", function (ev) {
        ev.stopPropagation();
      });
    }

    $(this).on("click", function () {
      let idItem = $(this).attr("id").replace("certid_", "");
      const selectedCert = sertifikalar.find((item) => item.id == idItem);
      hizRegSelectMake(selectedCert);
      $(".komp-sertifika").addClass("hidden");
      $(".komp-sertifika").removeClass("flex");
    });
  });
}
function RegImgSec(folderpath) {
  $(".h-reg-img-anchor").on("click", function () {
    $(".hiz_reg_resim_file").val("");
    $(".hiz_reg_resim_file").trigger("click");
  });
  $(".hiz_reg_resim_file").on("change", async function () {
    let file = $(".hiz_reg_resim_file").get(0).files[0];
    let fileuzanti = file.name.split(".").pop();
    let filename = `hiz_regulator.${fileuzanti}`;
    $("[name='guv_komps[hiz_regulator][img]']").val(
      `${folderpath}/komponentler/${filename}`
    );
    var upload = new Upload(file);
    const { msg } = await upload.asyncDoUpload(
      `${folderpath}/komponentler/`,
      "hiz_regulator",
      "#hiz-reg-wrp"
    );
    if (!!msg && msg == "Ok!") {
      $("#hiz-reg-wrp .file-area a").attr(
        "href",
        `${folderpath}/komponentler/${filename}`
      );
      $("#hiz-reg-wrp .file-area a").attr("download", filename);
      $(".h-reg-img-anchor").html("Değiştir");
    }
  });
}
function frenSelectMake(selectedCert) {
  $(".fren-form-area").css("display", "flex");
  $(`[name='guv_komps[fren][cert_id]']`).val(selectedCert.id);
  $(`[name='guv_komps[fren][cert_url]']`).val(selectedCert.cert_filepath);
  $(`[name='guv_komps[fren][marka]']`).val(selectedCert.marka);
  $(`[name='guv_komps[fren][serino]']`).val("");
  $(".fren-marka-adi").html(selectedCert.marka);
  $(".fren-cert-url").attr("href", selectedCert.cert_filepath);
  const tipler = selectedCert.tip.split(",");
  $(`[name='guv_komps[fren][tip]']`).html("");
  if (!!selectedCert.tip && tipler.length > 0) {
    for (let i = 0; i < tipler.length; i++) {
      const tip = tipler[i];
      $(`[name='guv_komps[fren][tip]']`).append(`
        <option value="${tip}">${tip}</option>
        `);
    }
  } else if (!!selectedCert.tip && tipler.length == 0) {
    $(`[name='guv_komps[fren][tip]']`).append(`
      <option value="${selectedCert.tip}">${selectedCert.tip}</option>
      `);
  }
}
async function onGetFrenler() {
  const { data } = await GetSertifikalar("fren");
  const sertifikalar = data;
  $(".cert-table").html("");
  $(".tb-cert-head").html(`
    <th>Seritifika No</th>
            <th>Marka</th>
            <th>Tip/ler</th>
            <th>Hiz</th>
            <th>Kapasite</th>
            <th>Sertifika</th>
    `);
  $(".tb-title").html("Fren Sertifikalar");
  for (let i = 0; i < sertifikalar.length; i++) {
    const sertifika = sertifikalar[i];
    $(".cert-table").append(`
      <tr id="certid_${sertifika.id}" class="border-b border-gray-200  py-2 hover:bg-black/5 duration-150 cursor-pointer">
               <td class="text-center border-l border-gray-200 px-2"><div class="line-clamp-1 text-[0.8rem]">${sertifika.cert_no}</div></td>
               <td class="text-center border-l border-gray-200 px-2"><div class="line-clamp-1 text-[0.8rem]">${sertifika.marka}</div></td>
               <td class="text-center border-l border-gray-200 px-2"><div class="line-clamp-1 text-[0.8rem]">${sertifika.tip}</div></td>
               <td class="text-center border-l border-gray-200 px-2"><div class="line-clamp-1 text-[0.8rem]">${sertifika.hiz}</div></td>
               <td class="text-center border-l border-gray-200 px-2"><div class="line-clamp-1 text-[0.8rem]">${sertifika.kapasite}</div></td>
               <td class="text-center"> 
                 <a href="${sertifika.cert_filepath}" target="_blank" class="text-blue-500 hover:underline">İncele</a>
               </td>
             </tr>
     `);
  }

  $(".cert-table tr").each(function () {
    const anchorTag = $(this).find("a");
    if (!!anchorTag) {
      anchorTag.on("click", function (ev) {
        ev.stopPropagation();
      });
    }
    $(this).on("click", function () {
      let idItem = $(this).attr("id").replace("certid_", "");
      const selectedCert = sertifikalar.find((item) => item.id == idItem);
      frenSelectMake(selectedCert);
      $(".komp-sertifika").addClass("hidden");
      $(".komp-sertifika").removeClass("flex");
    });
  });
}
function FrenImgSec(folderpath) {
  $(".fren-img-anchor").on("click", function () {
    $(".fren_resim_file").val("");
    $(".fren_resim_file").trigger("click");
  });
  $(".fren_resim_file").on("change", async function () {
    let file = $(".fren_resim_file").get(0).files[0];
    let fileuzanti = file.name.split(".").pop();
    let filename = `fren.${fileuzanti}`;
    $("[name='guv_komps[fren][img]']").val(
      `${folderpath}/komponentler/${filename}`
    );
    var upload = new Upload(file);
    const { msg } = await upload.asyncDoUpload(
      `${folderpath}/komponentler/`,
      "fren",
      "#fren-wrp"
    );
    if (!!msg && msg == "Ok!") {
      $("#fren-wrp .file-area a").attr(
        "href",
        `${folderpath}/komponentler/${filename}`
      );
      $("#fren-wrp .file-area a").attr("download", filename);
      $(".fren-img-anchor").html("Değiştir");
    }
  });
}
function kartSelectMake(selectedCert) {
  $(".kart-form-area").css("display", "flex");
  $(`[name='guv_komps[kart][cert_id]']`).val(selectedCert.id);
  $(`[name='guv_komps[kart][cert_url]']`).val(selectedCert.cert_filepath);
  $(`[name='guv_komps[kart][marka]']`).val(selectedCert.marka);
  $(`[name='guv_komps[kart][serino]']`).val("");
  $(".kart-marka-adi").html(selectedCert.marka);
  $(".kart-cert-url").attr("href", selectedCert.cert_filepath);
  const tipler = selectedCert.tip.split(",");
  $(`[name='guv_komps[kart][tip]']`).html("");
  if (!!selectedCert.tip && tipler.length > 0) {
    for (let i = 0; i < tipler.length; i++) {
      const tip = tipler[i];
      $(`[name='guv_komps[kart][tip]']`).append(`
        <option value="${tip}">${tip}</option>
        `);
    }
  } else if (!!selectedCert.tip && tipler.length == 0) {
    $(`[name='guv_komps[kart][tip]']`).append(`
      <option value="${selectedCert.tip}">${selectedCert.tip}</option>
      `);
  }
}
async function onGetKontrolKartlar() {
  const { data } = await GetSertifikalar("kontrol-kart");
  const sertifikalar = data;
  $(".cert-table").html("");
  $(".tb-cert-head").html(`
    <th>Seritifika No</th>
            <th>Marka</th>
            <th>Tip/ler</th>
            <th>Sertifika</th>
    `);
  $(".tb-title").html("Kontrol Kart Sertifikalar");
  for (let i = 0; i < sertifikalar.length; i++) {
    const sertifika = sertifikalar[i];
    $(".cert-table").append(`
      <tr id="certid_${sertifika.id}" class="border-b border-gray-200  py-2 hover:bg-black/5 duration-150 cursor-pointer">
               <td class="text-center px-2 border-l border-gray-200"><div class="line-clamp-1 text-[0.8rem]">${sertifika.cert_no}</div></td>
               <td class="text-center  px-2 border-l border-gray-200"><div class="line-clamp-1 text-[0.8rem]">${sertifika.marka}</div></td>
               <td class="text-center  px-2 border-l border-gray-200"><div class="line-clamp-1 text-[0.8rem]">${sertifika.tip}</div></td>
               <td class="text-center"> 
                 <a href="${sertifika.cert_filepath}" target="_blank" class="text-blue-500 hover:underline">İncele</a>
               </td>
             </tr>
     `);
  }

  $(".cert-table tr").each(function () {
    const anchorTag = $(this).find("a");
    if (!!anchorTag) {
      anchorTag.on("click", function (ev) {
        ev.stopPropagation();
      });
    }
    $(this).on("click", function () {
      let idItem = $(this).attr("id").replace("certid_", "");
      const selectedCert = sertifikalar.find((item) => item.id == idItem);
      kartSelectMake(selectedCert);
      $(".komp-sertifika").addClass("hidden");
      $(".komp-sertifika").removeClass("flex");
    });
  });
}
function KartImgSec(folderpath) {
  $(".kart-img-anchor").on("click", function () {
    $(".kart_resim_file").val("");
    $(".kart_resim_file").trigger("click");
  });
  $(".kart_resim_file").on("change", async function () {
    let file = $(".kart_resim_file").get(0).files[0];
    let fileuzanti = file.name.split(".").pop();
    let filename = `kart.${fileuzanti}`;
    $("[name='guv_komps[kart][img]']").val(
      `${folderpath}/komponentler/${filename}`
    );
    var upload = new Upload(file);
    const { msg } = await upload.asyncDoUpload(
      `${folderpath}/komponentler/`,
      "kart",
      "#kart-wrp"
    );
    if (!!msg && msg == "Ok!") {
      $("#kart-wrp .file-area a").attr(
        "href",
        `${folderpath}/komponentler/${filename}`
      );
      $("#kart-wrp .file-area a").attr("download", filename);
      $(".kart-img-anchor").html("Değiştir");
    }
  });
}
function kab_tampSelectMake(selectedCert) {
  $(".kab_tamp-form-area").css("display", "flex");
  $(`[name='guv_komps[kab_tamp][cert_id]']`).val(selectedCert.id);
  $(`[name='guv_komps[kab_tamp][cert_url]']`).val(selectedCert.cert_filepath);
  $(`[name='guv_komps[kab_tamp][marka]']`).val(selectedCert.marka);
  $(`[name='guv_komps[kab_tamp][serino]']`).val("");
  $(".kab_tamp-marka-adi").html(selectedCert.marka);
  $(".kab_tamp-cert-url").attr("href", selectedCert.cert_filepath);
  const tipler = selectedCert.tip.split(",");
  $(`[name='guv_komps[kab_tamp][tip]']`).html("");
  if (!!selectedCert.tip && tipler.length > 0) {
    for (let i = 0; i < tipler.length; i++) {
      const tip = tipler[i];
      $(`[name='guv_komps[kab_tamp][tip]']`).append(`
        <option value="${tip}">${tip}</option>
        `);
    }
  } else if (!!selectedCert.tip && tipler.length == 0) {
    $(`[name='guv_komps[kab_tamp][tip]']`).append(`
      <option value="${selectedCert.tip}">${selectedCert.tip}</option>
      `);
  }
}
async function onGetKabTamponlar() {
  const { data } = await GetSertifikalar("tampon");
  const sertifikalar = data;
  $(".cert-table").html("");
  $(".tb-cert-head").html(`
    <th>Seritifika No</th>
            <th>Marka</th>
            <th>Tip/ler</th>
            <th>Hız</th>
            <th>Kapasite</th>
            <th>Sertifika</th>
    `);
  $(".tb-title").html("Tamponlar Sertifikalar");
  for (let i = 0; i < sertifikalar.length; i++) {
    const sertifika = sertifikalar[i];
    $(".cert-table").append(`
      <tr id="certid_${sertifika.id}" class="border-b border-gray-200  py-2 hover:bg-black/5 duration-150 cursor-pointer">
               <td class="text-center border-l border-gray-200 px-2"><div class="line-clamp-1 text-[0.8rem]">${sertifika.cert_no}</div></td>
               <td class="text-center border-l border-gray-200 px-2"><div class="line-clamp-1 text-[0.8rem]">${sertifika.marka}</div></td>
               <td class="text-center border-l border-gray-200 px-2"><div class="line-clamp-1 text-[0.8rem]">${sertifika.tip}</div></td>
               <td class="text-center border-l border-gray-200 px-2"><div class="line-clamp-1 text-[0.8rem]">${sertifika.hiz}</div></td>
               <td class="text-center border-l border-gray-200 px-2"><div class="line-clamp-1 text-[0.8rem]">${sertifika.kapasite}</div></td>
               <td class="text-center border-l border-gray-200 px-2"> 
                 <a href="${sertifika.cert_filepath}" target="_blank" class="text-blue-500 hover:underline">İncele</a>
               </td>
             </tr>
     `);
  }

  $(".cert-table tr").each(function () {
    const anchorTag = $(this).find("a");
    if (!!anchorTag) {
      anchorTag.on("click", function (ev) {
        ev.stopPropagation();
      });
    }
    $(this).on("click", function () {
      let idItem = $(this).attr("id").replace("certid_", "");
      const selectedCert = sertifikalar.find((item) => item.id == idItem);
      kab_tampSelectMake(selectedCert);
      $(".komp-sertifika").addClass("hidden");
      $(".komp-sertifika").removeClass("flex");
    });
  });
}
function KabTampImgSec(folderpath) {
  $(".kab_tamp-img-anchor").on("click", function () {
    $(".kab_tamp_resim_file").val("");
    $(".kab_tamp_resim_file").trigger("click");
  });
  $(".kab_tamp_resim_file").on("change", async function () {
    let file = $(".kab_tamp_resim_file").get(0).files[0];
    let fileuzanti = file.name.split(".").pop();
    let filename = `kab_tamp.${fileuzanti}`;
    $("[name='guv_komps[kab_tamp][img]']").val(
      `${folderpath}/komponentler/${filename}`
    );
    var upload = new Upload(file);
    const { msg } = await upload.asyncDoUpload(
      `${folderpath}/komponentler/`,
      "kab_tamp",
      "#kab_tamp-wrp"
    );
    if (!!msg && msg == "Ok!") {
      $("#kab_tamp-wrp .file-area a").attr(
        "href",
        `${folderpath}/komponentler/${filename}`
      );
      $("#kab_tamp-wrp .file-area a").attr("download", filename);
      $(".kab_tamp-img-anchor").html("Değiştir");
    }
  });
}
function kar_tampSelectMake(selectedCert) {
  $(".kar_tamp-form-area").css("display", "flex");
  $(`[name='guv_komps[kar_tamp][cert_id]']`).val(selectedCert.id);
  $(`[name='guv_komps[kar_tamp][cert_url]']`).val(selectedCert.cert_filepath);
  $(`[name='guv_komps[kar_tamp][marka]']`).val(selectedCert.marka);
  $(`[name='guv_komps[kar_tamp][serino]']`).val("");
  $(".kar_tamp-marka-adi").html(selectedCert.marka);
  $(".kar_tamp-cert-url").attr("href", selectedCert.cert_filepath);
  const tipler = selectedCert.tip.split(",");
  $(`[name='guv_komps[kar_tamp][tip]']`).html("");
  if (!!selectedCert.tip && tipler.length > 0) {
    for (let i = 0; i < tipler.length; i++) {
      const tip = tipler[i];
      $(`[name='guv_komps[kar_tamp][tip]']`).append(`
        <option value="${tip}">${tip}</option>
        `);
    }
  } else if (!!selectedCert.tip && tipler.length == 0) {
    $(`[name='guv_komps[kar_tamp][tip]']`).append(`
      <option value="${selectedCert.tip}">${selectedCert.tip}</option>
      `);
  }
}
async function onGetKarTamponlar() {
  const { data } = await GetSertifikalar("tampon");
  const sertifikalar = data;
  $(".cert-table").html("");
  $(".tb-cert-head").html(`
    <th>Seritifika No</th>
            <th>Marka</th>
            <th>Tip/ler</th>
            <th>Hız</th>
            <th>Kapasite</th>
            <th>Sertifika</th>
    `);
  $(".tb-title").html("Tamponlar Sertifikalar");
  for (let i = 0; i < sertifikalar.length; i++) {
    const sertifika = sertifikalar[i];
    $(".cert-table").append(`
      <tr id="certid_${sertifika.id}" class="border-b border-gray-200  py-2 hover:bg-black/5 duration-150 cursor-pointer">
               <td class="text-center border-l border-gray-200 px-2"><div class="line-clamp-1 text-[0.8rem]">${sertifika.cert_no}</div></td>
               <td class="text-center border-l border-gray-200 px-2"><div class="line-clamp-1 text-[0.8rem]">${sertifika.marka}</div></td>
               <td class="text-center border-l border-gray-200 px-2"><div class="line-clamp-1 text-[0.8rem]">${sertifika.tip}</div></td>
               <td class="text-center border-l border-gray-200 px-2"><div class="line-clamp-1 text-[0.8rem]">${sertifika.hiz}</div></td>
               <td class="text-center border-l border-gray-200 px-2"><div class="line-clamp-1 text-[0.8rem]">${sertifika.kapasite}</div></td>
               <td class="text-center"> 
                 <a href="${sertifika.cert_filepath}" target="_blank" class="text-blue-500 hover:underline">İncele</a>
               </td>
             </tr>
     `);
  }

  $(".cert-table tr").each(function () {
    const anchorTag = $(this).find("a");
    if (!!anchorTag) {
      anchorTag.on("click", function (ev) {
        ev.stopPropagation();
      });
    }
    $(this).on("click", function () {
      let idItem = $(this).attr("id").replace("certid_", "");
      const selectedCert = sertifikalar.find((item) => item.id == idItem);
      kar_tampSelectMake(selectedCert);
      $(".komp-sertifika").addClass("hidden");
      $(".komp-sertifika").removeClass("flex");
    });
  });
}
function KarTampImgSec(folderpath) {
  $(".kar_tamp-img-anchor").on("click", function () {
    $(".kar_tamp_resim_file").val("");
    $(".kar_tamp_resim_file").trigger("click");
  });
  $(".kar_tamp_resim_file").on("change", async function () {
    let file = $(".kar_tamp_resim_file").get(0).files[0];
    let fileuzanti = file.name.split(".").pop();
    let filename = `kar_tamp.${fileuzanti}`;
    $("[name='guv_komps[kar_tamp][img]']").val(
      `${folderpath}/komponentler/${filename}`
    );
    var upload = new Upload(file);
    const { msg } = await upload.asyncDoUpload(
      `${folderpath}/komponentler/`,
      "kar_tamp",
      "#kar_tamp-wrp"
    );
    if (!!msg && msg == "Ok!") {
      $("#kar_tamp-wrp .file-area a").attr(
        "href",
        `${folderpath}/komponentler/${filename}`
      );
      $("#kar_tamp-wrp .file-area a").attr("download", filename);
      $(".kar_tamp-img-anchor").html("Değiştir");
    }
  });
}
function durak_kapi_kilitSelectMake(selectedCert) {
  $(".durak_kapi_kilit-form-area").css("display", "flex");
  $(`[name='guv_komps[durak_kapi_kilit][cert_id]']`).val(selectedCert.id);
  $(`[name='guv_komps[durak_kapi_kilit][cert_url]']`).val(
    selectedCert.cert_filepath
  );
  $(`[name='guv_komps[durak_kapi_kilit][marka]']`).val(selectedCert.marka);
  $(`[name='guv_komps[durak_kapi_kilit][serino]']`).val("");
  $(".durak_kapi_kilit-marka-adi").html(selectedCert.marka);
  $(".durak_kapi_kilit-cert-url").attr("href", selectedCert.cert_filepath);
  const tipler = selectedCert.tip.split(",");
  $(`[name='guv_komps[durak_kapi_kilit][tip]']`).html("");
  if (!!selectedCert.tip && tipler.length > 0) {
    for (let i = 0; i < tipler.length; i++) {
      const tip = tipler[i];
      $(`[name='guv_komps[durak_kapi_kilit][tip]']`).append(`
        <option value="${tip}">${tip}</option>
        `);
    }
  } else if (!!selectedCert.tip && tipler.length == 0) {
    $(`[name='guv_komps[durak_kapi_kilit][tip]']`).append(`
      <option value="${selectedCert.tip}">${selectedCert.tip}</option>
      `);
  }
}
async function onGetDurakKapiKilitler() {
  const { data } = await GetSertifikalar("durak-kapi-kilit");
  const sertifikalar = data;
  $(".cert-table").html("");
  $(".tb-cert-head").html(`
    <th>Seritifika No</th>
            <th>Marka</th>
            <th>Tip/ler</th>
            <th>Sertifika</th>
    `);
  $(".tb-title").html("Durak Kapı Kilit Sertifikalar");
  for (let i = 0; i < sertifikalar.length; i++) {
    const sertifika = sertifikalar[i];
    $(".cert-table").append(`
      <tr id="certid_${sertifika.id}" class="border-b border-gray-200  py-2 hover:bg-black/5 duration-150 cursor-pointer">
               <td class="text-center border-l border-gray-200 px-2"><div class="line-clamp-1 text-[0.8rem]">${sertifika.cert_no}</diV></td>
               <td class="text-center border-l border-gray-200 px-2"><div class="line-clamp-1 text-[0.8rem]">${sertifika.marka}</diV></td>
               <td class="text-center border-l border-gray-200 px-2"><div class="line-clamp-1 text-[0.8rem]">${sertifika.tip}</diV></td>
               <td class="text-center"> 
                 <a href="${sertifika.cert_filepath}" target="_blank" class="text-blue-500 hover:underline">İncele</a>
               </td>
             </tr>
     `);
  }

  $(".cert-table tr").each(function () {
    const anchorTag = $(this).find("a");
    if (!!anchorTag) {
      anchorTag.on("click", function (ev) {
        ev.stopPropagation();
      });
    }
    $(this).on("click", function () {
      let idItem = $(this).attr("id").replace("certid_", "");
      const selectedCert = sertifikalar.find((item) => item.id == idItem);
      durak_kapi_kilitSelectMake(selectedCert);
      $(".komp-sertifika").addClass("hidden");
      $(".komp-sertifika").removeClass("flex");
    });
  });
}
function DurakKapiImgSec(folderpath) {
  $(".durak_kapi_kilit-img-anchor").on("click", function () {
    $(".durak_kapi_kilit_resim_file").val("");
    $(".durak_kapi_kilit_resim_file").trigger("click");
  });
  $(".durak_kapi_kilit_resim_file").on("change", async function () {
    let file = $(".durak_kapi_kilit_resim_file").get(0).files[0];
    let fileuzanti = file.name.split(".").pop();
    let filename = `durak_kapi_kilit.${fileuzanti}`;
    $("[name='guv_komps[durak_kapi_kilit][img]']").val(
      `${folderpath}/komponentler/${filename}`
    );
    var upload = new Upload(file);
    const { msg } = await upload.asyncDoUpload(
      `${folderpath}/komponentler/`,
      "durak_kapi_kilit",
      "#durak_kapi_kilit-wrp"
    );
    if (!!msg && msg == "Ok!") {
      $("#durak_kapi_kilit-wrp .file-area a").attr(
        "href",
        `${folderpath}/komponentler/${filename}`
      );
      $("#durak_kapi_kilit-wrp .file-area a").attr("download", filename);
      $(".durak_kapi_kilit-img-anchor").html("Değiştir");
    }
  });
}
function kabin_kapi_kilitSelectMake(selectedCert) {
  $(".kabin_kapi_kilit-form-area").css("display", "flex");
  $(`[name='guv_komps[kabin_kapi_kilit][cert_id]']`).val(selectedCert.id);
  $(`[name='guv_komps[kabin_kapi_kilit][cert_url]']`).val(
    selectedCert.cert_filepath
  );
  $(`[name='guv_komps[kabin_kapi_kilit][marka]']`).val(selectedCert.marka);
  $(`[name='guv_komps[kabin_kapi_kilit][serino]']`).val("");
  $(".kabin_kapi_kilit-marka-adi").html(selectedCert.marka);
  $(".kabin_kapi_kilit-cert-url").attr("href", selectedCert.cert_filepath);
  const tipler = selectedCert.tip.split(",");
  $(`[name='guv_komps[kabin_kapi_kilit][tip]']`).html("");
  if (!!selectedCert.tip && tipler.length > 0) {
    for (let i = 0; i < tipler.length; i++) {
      const tip = tipler[i];
      $(`[name='guv_komps[kabin_kapi_kilit][tip]']`).append(`
        <option value="${tip}">${tip}</option>
        `);
    }
  } else if (!!selectedCert.tip && tipler.length == 0) {
    $(`[name='guv_komps[kabin_kapi_kilit][tip]']`).append(`
      <option value="${selectedCert.tip}">${selectedCert.tip}</option>
      `);
  }
}
async function onGetKabinKapiKilitler() {
  const { data } = await GetSertifikalar("kabin-kapi-kilit");
  const sertifikalar = data;
  $(".cert-table").html("");
  $(".tb-cert-head").html(`
    <th>Seritifika No</th>
            <th>Marka</th>
            <th>Tip/ler</th>
            <th>Sertifika</th>
    `);
  $(".tb-title").html("Kabin Kapı Kilit Sertifikalar");
  for (let i = 0; i < sertifikalar.length; i++) {
    const sertifika = sertifikalar[i];
    $(".cert-table").append(`
      <tr id="certid_${sertifika.id}" class="border-b border-gray-200  py-2 hover:bg-black/5 duration-150 cursor-pointer">
               <td class="text-center border-l border-gray-200 px-2"><div class="line-clamp-1 text-[0.8rem]">${sertifika.cert_no}</div></td>
               <td class="text-center border-l border-gray-200 px-2"><div class="line-clamp-1 text-[0.8rem]">${sertifika.marka}</div></td>
               <td class="text-center border-l border-gray-200 px-2"><div class="line-clamp-1 text-[0.8rem]">${sertifika.tip}</div></td>
               <td class="text-center"> 
                 <a href="${sertifika.cert_filepath}" target="_blank" class="text-blue-500 hover:underline">İncele</a>
               </td>
             </tr>
     `);
  }

  $(".cert-table tr").each(function () {
    const anchorTag = $(this).find("a");
    if (!!anchorTag) {
      anchorTag.on("click", function (ev) {
        ev.stopPropagation();
      });
    }
    $(this).on("click", function () {
      let idItem = $(this).attr("id").replace("certid_", "");
      const selectedCert = sertifikalar.find((item) => item.id == idItem);
      kabin_kapi_kilitSelectMake(selectedCert);
      $(".komp-sertifika").addClass("hidden");
      $(".komp-sertifika").removeClass("flex");
    });
  });
}
function KabinKapiImgSec(folderpath) {
  $(".kabin_kapi_kilit-img-anchor").on("click", function () {
    $(".kabin_kapi_kilit_resim_file").val("");
    $(".kabin_kapi_kilit_resim_file").trigger("click");
  });
  $(".kabin_kapi_kilit_resim_file").on("change", async function () {
    let file = $(".kabin_kapi_kilit_resim_file").get(0).files[0];
    let fileuzanti = file.name.split(".").pop();
    let filename = `kabin_kapi_kilit.${fileuzanti}`;
    $("[name='guv_komps[kabin_kapi_kilit][img]']").val(
      `${folderpath}/komponentler/${filename}`
    );
    var upload = new Upload(file);
    const { msg } = await upload.asyncDoUpload(
      `${folderpath}/komponentler/`,
      "kabin_kapi_kilit",
      "#kabin_kapi_kilit-wrp"
    );
    if (!!msg && msg == "Ok!") {
      $("#kabin_kapi_kilit-wrp .file-area a").attr(
        "href",
        `${folderpath}/komponentler/${filename}`
      );
      $("#kabin_kapi_kilit-wrp .file-area a").attr("download", filename);
      $(".kabin_kapi_kilit-img-anchor").html("Değiştir");
    }
  });
}
function ucm_acopSelectMake(selectedCert) {
  $(".ucm_acop-form-area").css("display", "flex");
  $(`[name='guv_komps[ucm_acop][cert_id]']`).val(selectedCert.id);
  $(`[name='guv_komps[ucm_acop][cert_url]']`).val(selectedCert.cert_filepath);
  $(`[name='guv_komps[ucm_acop][marka]']`).val(selectedCert.marka);
  $(`[name='guv_komps[ucm_acop][serino]']`).val(selectedCert.serino);
  $(`[name='guv_komps[ucm_acop][tip]']`).val(selectedCert.tip);
  $(".ucm_acop-marka-adi").html(selectedCert.marka);
  $(".ucm_acop-cert-url").attr("href", selectedCert.cert_filepath);
  const tipler = selectedCert.tip.split(",");
  $(`[name='guv_komps[ucm_acop][tip]']`).html("");
  if (!!selectedCert.tip && tipler.length > 0) {
    for (let i = 0; i < tipler.length; i++) {
      const tip = tipler[i];
      $(`[name='guv_komps[ucm_acop][tip]']`).append(`
        <option value="${tip}">${tip}</option>
        `);
    }
  } else if (!!selectedCert.tip && tipler.length == 0) {
    $(`[name='guv_komps[ucm_acop][tip]']`).append(`
      <option value="${selectedCert.tip}">${selectedCert.tip}</option>
      `);
  }
}
async function onGetUCMAOPlar() {
  const resp1 = await GetSertifikalar("ucm-acop");
  const resp2 = await GetSertifikalar("hiz-regulatoru");
  const sertifikalar = [...resp1.data, ...resp2.data];
  $(".cert-table").html("");
  $(".tb-cert-head").html(`
    <th>Seritifika No</th>
            <th>Marka</th>
            <th>Tip/ler</th>
            <th>Sertifika</th>
    `);
  $(".tb-title").html("Ascending Overspeed Protect Sertifikalar");
  for (let i = 0; i < sertifikalar.length; i++) {
    const sertifika = sertifikalar[i];
    $(".cert-table").append(`
      <tr id="certid_${sertifika.id}" class="border-b border-gray-200  py-2 hover:bg-black/5 duration-150 cursor-pointer">
               <td class="text-center border-l border-gray-200 px-2"><div class="line-clamp-1 text-[0.8rem]">${sertifika.cert_no}</div></td>
               <td class="text-center border-l border-gray-200 px-2"><div class="line-clamp-1 text-[0.8rem]">${sertifika.marka}</div></td>
               <td class="text-center border-l border-gray-200 px-2"><div class="line-clamp-1 text-[0.8rem]">${sertifika.tip}</div></td>
               <td class="text-center"> 
                 <a href="${sertifika.cert_filepath}" target="_blank" class="text-blue-500 hover:underline">İncele</a>
               </td>
             </tr>
     `);
  }

  $(".cert-table tr").each(function () {
    const anchorTag = $(this).find("a");
    if (!!anchorTag) {
      anchorTag.on("click", function (ev) {
        ev.stopPropagation();
      });
    }
    $(this).on("click", function () {
      let idItem = $(this).attr("id").replace("certid_", "");
      const selectedCert = sertifikalar.find((item) => item.id == idItem);
      ucm_acopSelectMake(selectedCert);
      $(".komp-sertifika").addClass("hidden");
      $(".komp-sertifika").removeClass("flex");
    });
  });
}
function UcmAcopImgSec(folderpath) {
  $(".ucm_acop-img-anchor").on("click", function () {
    $(".ucm_acop_resim_file").val("");
    $(".ucm_acop_resim_file").trigger("click");
  });
  $(".ucm_acop_resim_file").on("change", async function () {
    let file = $(".ucm_acop_resim_file").get(0).files[0];
    let fileuzanti = file.name.split(".").pop();
    let filename = `ucm_acop.${fileuzanti}`;
    $("[name='guv_komps[ucm_acop][img]']").val(
      `${folderpath}/komponentler/${filename}`
    );
    var upload = new Upload(file);
    const { msg } = await upload.asyncDoUpload(
      `${folderpath}/komponentler/`,
      "ucm_acop",
      "#ucm_acop-wrp"
    );
    if (!!msg && msg == "Ok!") {
      $("#ucm_acop-wrp .file-area a").attr(
        "href",
        `${folderpath}/komponentler/${filename}`
      );
      $("#ucm_acop-wrp .file-area a").attr("download", filename);
      $(".ucm_acop-img-anchor").html("Değiştir");
    }
  });
}
function motorSelectMake(selectedCert) {
  $(".motor-form-area").css("display", "flex");
  $(`[name='guv_komps[motor][cert_id]']`).val(selectedCert.id);
  $(`[name='guv_komps[motor][cert_url]']`).val(selectedCert.cert_filepath);
  $(`[name='guv_komps[motor][marka]']`).val(selectedCert.marka);
  $(`[name='guv_komps[motor][serino]']`).val("");
  $(`[name='guv_komps[motor][kw]']`).val("");
  $(`[name='guv_komps[motor][rpm]']`).val("");
  $(".motor-marka-adi").html(selectedCert.marka);
  $(".motor-cert-url").attr("href", selectedCert.cert_filepath);
  const tipler = selectedCert.tip.split(",");
  $(`[name='guv_komps[motor][tip]']`).html("");
  if (!!selectedCert.tip && tipler.length > 0) {
    for (let i = 0; i < tipler.length; i++) {
      const tip = tipler[i];
      $(`[name='guv_komps[motor][tip]']`).append(`
        <option value="${tip}">${tip}</option>
        `);
    }
  } else if (!!selectedCert.tip && tipler.length == 0) {
    $(`[name='guv_komps[motor][tip]']`).append(`
      <option value="${selectedCert.tip}">${selectedCert.tip}</option>
      `);
  }
}
async function onGetMotorlar() {
  const { data } = await GetSertifikalar("motor");
  const sertifikalar = data;
  $(".cert-table").html("");
  $(".tb-cert-head").html(`
    <th>Seritifika No</th>
            <th>Marka</th>
            <th>Tip/ler</th>
            <th>Sertifika</th>
    `);
  $(".tb-title").html("Motor Sertifikalar");
  for (let i = 0; i < sertifikalar.length; i++) {
    const sertifika = sertifikalar[i];
    $(".cert-table").append(`
      <tr id="certid_${sertifika.id}" class="border-b border-gray-200  py-2 hover:bg-black/5 duration-150 cursor-pointer">
               <td class="text-center border-l border-gray-200 px-2"><div class="line-clamp-1 text-[0.8rem]">${sertifika.cert_no}</div></td>
               <td class="text-center border-l border-gray-200 px-2"><div class="line-clamp-1 text-[0.8rem]">${sertifika.marka}</div></td>
               <td class="text-center border-l border-gray-200 px-2"><div class="line-clamp-1 text-[0.8rem]">${sertifika.tip}</div></td>
               <td class="text-center"> 
                 <a href="${sertifika.cert_filepath}" target="_blank" class="text-blue-500 hover:underline">İncele</a>
               </td>
             </tr>
     `);
  }

  $(".cert-table tr").each(function () {
    const anchorTag = $(this).find("a");
    if (!!anchorTag) {
      anchorTag.on("click", function (ev) {
        ev.stopPropagation();
      });
    }
    $(this).on("click", function () {
      let idItem = $(this).attr("id").replace("certid_", "");
      const selectedCert = sertifikalar.find((item) => item.id == idItem);
      motorSelectMake(selectedCert);

      $(".komp-sertifika").addClass("hidden");
      $(".komp-sertifika").removeClass("flex");
    });
  });
}
function MotorImgSec(folderpath) {
  $(".motor-img-anchor").on("click", function () {
    $(".motor_resim_file").val("");
    $(".motor_resim_file").trigger("click");
  });
  $(".motor_resim_file").on("change", async function () {
    let file = $(".motor_resim_file").get(0).files[0];
    let fileuzanti = file.name.split(".").pop();
    let filename = `motor.${fileuzanti}`;
    $("[name='guv_komps[motor][img]']").val(
      `${folderpath}/komponentler/${filename}`
    );
    var upload = new Upload(file);
    const { msg } = await upload.asyncDoUpload(
      `${folderpath}/komponentler/`,
      "motor",
      "#motor-wrp"
    );
    if (!!msg && msg == "Ok!") {
      $("#motor-wrp .file-area a").attr(
        "href",
        `${folderpath}/komponentler/${filename}`
      );
      $("#motor-wrp .file-area a").attr("download", filename);
      $(".motor-img-anchor").html("Değiştir");
    }
  });
}
function kapi_panel_yanginSelectMake(selectedCert) {
  $(".kapi_panel_yangin-form-area").css("display", "flex");
  $(`[name='guv_komps[kapi_panel_yangin][cert_id]']`).val(selectedCert.id);
  $(`[name='guv_komps[kapi_panel_yangin][cert_url]']`).val(
    selectedCert.cert_filepath
  );
  $(`[name='guv_komps[kapi_panel_yangin][marka]']`).val(selectedCert.marka);
  $(`[name='guv_komps[kapi_panel_yangin][serino]']`).val("");
  $(".kapi_panel_yangin-marka-adi").html(selectedCert.marka);
  $(".kapi_panel_yangin-cert-url").attr("href", selectedCert.cert_filepath);
  const tipler = selectedCert.tip.split(",");
  $(`[name='guv_komps[kapi_panel_yangin][tip]']`).html("");
  if (!!selectedCert.tip && tipler.length > 0) {
    for (let i = 0; i < tipler.length; i++) {
      const tip = tipler[i];
      $(`[name='guv_komps[kapi_panel_yangin][tip]']`).append(`
        <option value="${tip}">${tip}</option>
        `);
    }
  } else if (!!selectedCert.tip && tipler.length == 0) {
    $(`[name='guv_komps[kapi_panel_yangin][tip]']`).append(`
      <option value="${selectedCert.tip}">${selectedCert.tip}</option>
      `);
  }
}
async function onGetKapiPanelYangin() {
  const { data } = await GetSertifikalar("kapi-panel");
  const sertifikalar = data;
  $(".cert-table").html("");
  $(".tb-cert-head").html(`
    <th>Seritifika No</th>
            <th>Marka</th>
            <th>Tip/ler</th>
               <th>Tür</th>
            <th>Sertifika</th>
    `);
  $(".tb-title").html("Kapı Panel Sertifikalar");
  for (let i = 0; i < sertifikalar.length; i++) {
    const sertifika = sertifikalar[i];
    $(".cert-table").append(`
      <tr id="certid_${sertifika.id}" class="border-b border-gray-200  py-2 hover:bg-black/5 duration-150 cursor-pointer">
               <td class="text-center border-l border-gray-200 px-2"><div class="line-clamp-1 text-[0.8rem]">${sertifika.cert_no}</div></td>
               <td class="text-center border-l border-gray-200 px-2"><div class="line-clamp-1 text-[0.8rem]">${sertifika.marka}</diV></td>
               <td class="text-center border-l border-gray-200 px-2"><div class="line-clamp-1 text-[0.8rem]">${sertifika.tip}</diV></td>
                  <td class="text-center border-l border-gray-200 px-2"><div class="line-clamp-1 text-[0.8rem]">${sertifika.belge_tur}</diV></td>
               <td class="text-center"> 
                 <a href="${sertifika.cert_filepath}" target="_blank" class="text-blue-500 hover:underline">İncele</a>
               </td>
             </tr>
     `);
  }

  $(".cert-table tr").each(function () {
    const anchorTag = $(this).find("a");
    if (!!anchorTag) {
      anchorTag.on("click", function (ev) {
        ev.stopPropagation();
      });
    }
    $(this).on("click", function () {
      let idItem = $(this).attr("id").replace("certid_", "");
      const selectedCert = sertifikalar.find((item) => item.id == idItem);
      kapi_panel_yanginSelectMake(selectedCert);

      $(".komp-sertifika").addClass("hidden");
      $(".komp-sertifika").removeClass("flex");
    });
  });
}
function KapiPanelYanginImgSec(folderpath) {
  $(".kapi_panel_yangin-img-anchor").on("click", function () {
    $(".kapi_panel_yangin_resim_file").val("");
    $(".kapi_panel_yangin_resim_file").trigger("click");
  });
  $(".kapi_panel_yangin_resim_file").on("change", async function () {
    let file = $(".kapi_panel_yangin_resim_file").get(0).files[0];
    let fileuzanti = file.name.split(".").pop();
    let filename = `kapi_panel_yangin.${fileuzanti}`;
    $("[name='guv_komps[kapi_panel_yangin][img]']").val(
      `${folderpath}/komponentler/${filename}`
    );
    var upload = new Upload(file);
    const { msg } = await upload.asyncDoUpload(
      `${folderpath}/komponentler/`,
      "kapi_panel_yangin",
      "#kapi_panel_yangin-wrp"
    );
    if (!!msg && msg == "Ok!") {
      $("#kapi_panel_yangin-wrp .file-area a").attr(
        "href",
        `${folderpath}/komponentler/${filename}`
      );
      $("#kapi_panel_yangin-wrp .file-area a").attr("download", filename);
      $(".kapi_panel_yangin-img-anchor").html("Değiştir");
    }
  });
}
function kapi_panel_sarkacSelectMake(selectedCert) {
  $(".kapi_panel_sarkac-form-area").css("display", "flex");
  $(`[name='guv_komps[kapi_panel_sarkac][cert_id]']`).val(selectedCert.id);
  $(`[name='guv_komps[kapi_panel_sarkac][cert_url]']`).val(
    selectedCert.cert_filepath
  );
  $(`[name='guv_komps[kapi_panel_sarkac][marka]']`).val(selectedCert.marka);
  $(`[name='guv_komps[kapi_panel_sarkac][serino]']`).val("");
  $(".kapi_panel_sarkac-marka-adi").html(selectedCert.marka);
  $(".kapi_panel_sarkac-cert-url").attr("href", selectedCert.cert_filepath);
  const tipler = selectedCert.tip.split(",");
  $(`[name='guv_komps[kapi_panel_sarkac][tip]']`).html("");
  if (!!selectedCert.tip && tipler.length > 0) {
    for (let i = 0; i < tipler.length; i++) {
      const tip = tipler[i];
      $(`[name='guv_komps[kapi_panel_sarkac][tip]']`).append(`
        <option value="${tip}">${tip}</option>
        `);
    }
  } else if (!!selectedCert.tip && tipler.length == 0) {
    $(`[name='guv_komps[kapi_panel_sarkac][tip]']`).append(`
      <option value="${selectedCert.tip}">${selectedCert.tip}</option>
      `);
  }
}
async function onGetKapiPanelSarkac(folderpath) {
  const { data } = await GetSertifikalar("kapi-panel");
  const sertifikalar = data;
  $(".cert-table").html("");
  $(".tb-cert-head").html(`
    <th>Seritifika No</th>
            <th>Marka</th>
            <th>Tip/ler</th>
               <th>Tür</th>
            <th>Sertifika</th>
    `);
  $(".tb-title").html("Kapı Panel Sertifikalar");
  for (let i = 0; i < sertifikalar.length; i++) {
    const sertifika = sertifikalar[i];
    $(".cert-table").append(`
      <tr id="certid_${sertifika.id}" class="border-b border-gray-200  py-2 hover:bg-black/5 duration-150 cursor-pointer">
               <td class="text-center border-l border-gray-200 px-2"><div class="line-clamp-1 text-[0.8rem]">${sertifika.cert_no}</div></td>
               <td class="text-center border-l border-gray-200 px-2"><div class="line-clamp-1 text-[0.8rem]">${sertifika.marka}</div></td>
               <td class="text-center border-l border-gray-200 px-2"><div class="line-clamp-1 text-[0.8rem]">${sertifika.tip}</div></td>
                  <td class="text-center border-l border-gray-200 px-2"><div class="line-clamp-1 text-[0.8rem]">${sertifika.belge_tur}</div></td>
               <td class="text-center"> 
                 <a href="${sertifika.cert_filepath}" target="_blank" class="text-blue-500 hover:underline">İncele</a>
               </td>
             </tr>
     `);
  }

  $(".cert-table tr").each(function () {
    const anchorTag = $(this).find("a");
    if (!!anchorTag) {
      anchorTag.on("click", function (ev) {
        ev.stopPropagation();
      });
    }
    $(this).on("click", function () {
      let idItem = $(this).attr("id").replace("certid_", "");
      const selectedCert = sertifikalar.find((item) => item.id == idItem);
      kapi_panel_sarkacSelectMake(selectedCert);
      $(".komp-sertifika").addClass("hidden");
      $(".komp-sertifika").removeClass("flex");
    });
  });
}
function KapiPanelSarkacImgSec(folderpath) {
  $(".kapi_panel_sarkac-img-anchor").on("click", function () {
    $(".kapi_panel_sarkac_resim_file").val("");
    $(".kapi_panel_sarkac_resim_file").trigger("click");
  });
  $(".kapi_panel_sarkac_resim_file").on("change", async function () {
    let file = $(".kapi_panel_sarkac_resim_file").get(0).files[0];
    let fileuzanti = file.name.split(".").pop();
    let filename = `kapi_panel_sarkac.${fileuzanti}`;
    $("[name='guv_komps[kapi_panel_sarkac][img]']").val(
      `${folderpath}/komponentler/${filename}`
    );
    var upload = new Upload(file);
    const { msg } = await upload.asyncDoUpload(
      `${folderpath}/komponentler/`,
      "kapi_panel_sarkac",
      "#kapi_panel_sarkac-wrp"
    );
    if (!!msg && msg == "Ok!") {
      $("#kapi_panel_sarkac-wrp .file-area a").attr(
        "href",
        `${folderpath}/komponentler/${filename}`
      );
      $("#kapi_panel_sarkac-wrp .file-area a").attr("download", filename);
      $(".kapi_panel_sarkac-img-anchor").html("Değiştir");
    }
  });
}
function halatSelectMake(selectedCert) {
  $(".halat-form-area").css("display", "flex");
  $(`[name='guv_komps[halat][cert_id]']`).val(selectedCert.id);
  $(`[name='guv_komps[halat][cert_url]']`).val(selectedCert.cert_filepath);
  $(`[name='guv_komps[halat][marka]']`).val(selectedCert.marka);
  $(`[name='guv_komps[halat][serino]']`).val("");
  $(".halat-marka-adi").html(selectedCert.marka);
  $(".halat-cert-url").attr("href", selectedCert.cert_filepath);
  const tipler = selectedCert.tip.split(",");
  $(`[name='guv_komps[halat][tip]']`).html("");
  if (!!selectedCert.tip && tipler.length > 0) {
    for (let i = 0; i < tipler.length; i++) {
      const tip = tipler[i];
      $(`[name='guv_komps[halat][tip]']`).append(`
        <option value="${tip}">${tip}</option>
        `);
    }
  } else if (!!selectedCert.tip && tipler.length == 0) {
    $(`[name='guv_komps[halat][tip]']`).append(`
      <option value="${selectedCert.tip}">${selectedCert.tip}</option>
      `);
  }
}
async function onGetHalatlar() {
  const { data } = await GetSertifikalar("halat");
  const sertifikalar = data;
  $(".cert-table").html("");
  $(".tb-cert-head").html(`
    <th>Seritifika No</th>
            <th>Marka</th>
            <th>Tip/ler</th>
               <th>Tür</th>
            <th>Sertifika</th>
    `);
  $(".tb-title").html("Kapı Panel Sertifikalar");
  for (let i = 0; i < sertifikalar.length; i++) {
    const sertifika = sertifikalar[i];
    $(".cert-table").append(`
      <tr id="certid_${sertifika.id}" class="border-b border-gray-200  py-2 hover:bg-black/5 duration-150 cursor-pointer">
               <td class="text-center border-l border-gray-200 px-2"><div class="line-clamp-1 text-[0.8rem]">${sertifika.cert_no}</div></td>
               <td class="text-center border-l border-gray-200 px-2"><div class="line-clamp-1 text-[0.8rem]">${sertifika.marka}</div></td>
               <td class="text-center border-l border-gray-200 px-2"><div class="line-clamp-1 text-[0.8rem]">${sertifika.tip}</div></td>
                  <td class="text-center border-l border-gray-200 px-2"><div class="line-clamp-1 text-[0.8rem]">${sertifika.belge_tur}</div></td>
               <td class="text-center"> 
                 <a href="${sertifika.cert_filepath}" target="_blank" class="text-blue-500 hover:underline">İncele</a>
               </td>
             </tr>
     `);
  }

  $(".cert-table tr").each(function () {
    const anchorTag = $(this).find("a");
    if (!!anchorTag) {
      anchorTag.on("click", function (ev) {
        ev.stopPropagation();
      });
    }
    $(this).on("click", function () {
      let idItem = $(this).attr("id").replace("certid_", "");
      const selectedCert = sertifikalar.find((item) => item.id == idItem);
      halatSelectMake(selectedCert);
      $(".komp-sertifika").addClass("hidden");
      $(".komp-sertifika").removeClass("flex");
    });
  });
}
function HalatImgSec(folderpath) {
  $(".halat-img-anchor").on("click", function () {
    $(".halat_resim_file").val("");
    $(".halat_resim_file").trigger("click");
  });
  $(".halat_resim_file").on("change", async function () {
    let file = $(".halat_resim_file").get(0).files[0];
    let fileuzanti = file.name.split(".").pop();
    let filename = `halat.${fileuzanti}`;
    $("[name='guv_komps[halat][img]']").val(
      `${folderpath}/komponentler/${filename}`
    );
    var upload = new Upload(file);
    const { msg } = await upload.asyncDoUpload(
      `${folderpath}/komponentler/`,
      "halat",
      "#halat-wrp"
    );
    if (!!msg && msg == "Ok!") {
      $("#halat-wrp .file-area a").attr(
        "href",
        `${folderpath}/komponentler/${filename}`
      );
      $("#halat-wrp .file-area a").attr("download", filename);
      $(".halat-img-anchor").html("Değiştir");
    }
  });
}
function onImgBtnsAktifEt(folder_path) {
  $(".btn-reg-sec").on("click", async function () {
    $(".komp-sertifika").removeClass("hidden");
    $(".komp-sertifika").addClass("flex");
    await onGetHizRegulatorler();
    // RegImgSec(folder_path);
  });
  $(".btn-fren-sec").on("click", async function () {
    $(".komp-sertifika").removeClass("hidden");
    $(".komp-sertifika").addClass("flex");
    await onGetFrenler();
    // FrenImgSec(folder_path);
  });
  $(".btn-kart-sec").on("click", async function () {
    $(".komp-sertifika").removeClass("hidden");
    $(".komp-sertifika").addClass("flex");
    await onGetKontrolKartlar();
    // KartImgSec(folder_path);
  });
  $(".btn-kab_tamp-sec").on("click", async function () {
    $(".komp-sertifika").removeClass("hidden");
    $(".komp-sertifika").addClass("flex");
    await onGetKabTamponlar();
    // KabTampImgSec(folder_path);
  });
  $(".btn-kar_tamp-sec").on("click", async function () {
    $(".komp-sertifika").removeClass("hidden");
    $(".komp-sertifika").addClass("flex");
    await onGetKarTamponlar();
    // KarTampImgSec(folder_path);
  });
  $(".btn-durak_kapi_kilit-sec").on("click", async function () {
    $(".komp-sertifika").removeClass("hidden");
    $(".komp-sertifika").addClass("flex");
    await onGetDurakKapiKilitler();
    // DurakKapiImgSec(folder_path);
  });
  $(".btn-kabin_kapi_kilit-sec").on("click", async function () {
    $(".komp-sertifika").removeClass("hidden");
    $(".komp-sertifika").addClass("flex");
    await onGetKabinKapiKilitler();
    // KabinKapiImgSec(folder_path);
  });
  $(".btn-ucm_acop-sec").on("click", async function () {
    $(".komp-sertifika").removeClass("hidden");
    $(".komp-sertifika").addClass("flex");
    await onGetUCMAOPlar();
    // UcmAcopImgSec(folder_path);
  });
  $(".btn-motor-sec").on("click", async function () {
    $(".komp-sertifika").removeClass("hidden");
    $(".komp-sertifika").addClass("flex");
    await onGetMotorlar();
    // MotorImgSec(folder_path);
  });
  $(".btn-kapi_panel_sarkac-sec").on("click", async function () {
    $(".komp-sertifika").removeClass("hidden");
    $(".komp-sertifika").addClass("flex");
    await onGetKapiPanelSarkac();
    // KapiPanelSarkacImgSec(folder_path);
  });
  $(".btn-kapi_panel_yangin-sec").on("click", async function () {
    $(".komp-sertifika").removeClass("hidden");
    $(".komp-sertifika").addClass("flex");
    await onGetKapiPanelYangin();
    // KapiPanelYanginImgSec(folder_path);
  });
  $(".btn-halat-sec").on("click", async function () {
    $(".komp-sertifika").removeClass("hidden");
    $(".komp-sertifika").addClass("flex");
    await onGetHalatlar();
    // HalatImgSec(folder_path);
  });
}
const formDoldur = async (data) => {
  $(".btn-save-as-bilgi").addClass("hidden");
  $(".btn-update-as-bilgi").removeClass("hidden");

  let { imzali_formlar, guv_komps, folder_path, ...formdata } = data[0];
  RegImgSec(folder_path);
  KartImgSec(folder_path);
  KabTampImgSec(folder_path);
  KarTampImgSec(folder_path);
  DurakKapiImgSec(folder_path);
  KabinKapiImgSec(folder_path);
  KapiPanelYanginImgSec(folder_path);
  KapiPanelSarkacImgSec(folder_path);
  HalatImgSec(folder_path);
  FrenImgSec(folder_path);
  UcmAcopImgSec(folder_path);
  MotorImgSec(folder_path);
  imzali_formlar =
    typeof imzali_formlar == "string"
      ? JSON.parse(imzali_formlar)
      : imzali_formlar;
  guv_komps = typeof guv_komps == "string" ? JSON.parse(guv_komps) : guv_komps;
  formdata["imzali_formlar"] = imzali_formlar;
  formdata["guv_komps"] = guv_komps;
  $("[name='sinif']").val(formdata.sinif);
  $("[name='elek_hidrolik']").val(formdata.elek_hidrolik);
  $("[name='aski_tipi']").val(formdata.aski_tipi);
  $("[name='direkt_endirekt']").val(formdata.direkt_endirekt);
  $("[name='beyan_yuk']").val(formdata.beyan_yuk);
  $("[name='kisi_sayisi']").val(formdata.kisi_sayisi);
  $("[name='beyan_hiz']").val(formdata.beyan_hiz);
  $("[name='durak_sayisi']").val(formdata.durak_sayisi);
  $("[name='kat_sayisi']").val(formdata.kat_sayisi);
  $("[name='kat_rumuzu']").val(formdata.kat_rumuzu);
   $("[name='ana_giris_panel_sayi']").val(formdata.ana_giris_panel_sayi);
    $("[name='ana_giris_acilma_yon']").val(formdata.ana_giris_acilma_yon);
  $("[name='kabin_ag']").val(formdata.kabin_ag);
  $("[name='karsi_ag_ag']").val(formdata.karsi_ag_ag);
  $("[name='halat_adet']").val(formdata.halat_adet);
  $("[name='halat_mm']").val(formdata.halat_mm);
  $("[name='tahrik_kasnak_cap']").val(formdata.tahrik_kasnak_cap);
  $("[name='palanga_cap']").val(formdata.palanga_cap);
  if (formdata.giris_sayisi == "Çift Giriş") {
    $("#tek_giris").attr("checked", false);
    $("#cift_giris").attr("checked", true);
    $(".cift_giris_area").css("display", "flex");
  }
  // $("[name='giris_sayisi']").val(formdata.giris_sayisi);
  $("[name='ana_kapi_genislik']").val(formdata.ana_kapi_genislik);
  $("[name='ana_kapi_yukseklik']").val(formdata.ana_kapi_yukseklik);
  $("[name='ana_kapi_adet']").val(formdata.ana_kapi_adet);
  $("[name='ikinci_kapi_genislik']").val(formdata.ikinci_kapi_genislik);
  $("[name='ikinci_kapi_yukseklik']").val(formdata.ikinci_kapi_yukseklik);
  $("[name='ikinci_kapi_adet']").val(formdata.ikinci_kapi_adet);
  $("[name='ikinci_kapi_panel_sayi']").val(formdata.ikinci_kapi_panel_sayi);
    $("[name='ikinci_kapi_acilma_yon']").val(formdata.ikinci_kapi_acilma_yon);
  console.log(formdata.mak_dairesi);
  if (formdata.mak_dairesi == "Makine Dairesiz") {
    $("#mak_daireli").attr("checked", false);
    $("#mak_dairesiz").attr("checked", true);
    // $(".cift_giris_area").css("display", "flex");
  }
  // $("[name='mak_dairesi']").val(formdata.mak_dairesi);
  $("[name='makd_kapi_yukseklik']").val(formdata.makd_kapi_yukseklik);
  $("[name='makd_kapi_genislik']").val(formdata.makd_kapi_genislik);
  $("[name='makd_yukseklik']").val(formdata.makd_yukseklik);
  $("[name='makd_hareket_yukseklik']").val(formdata.makd_hareket_yukseklik);
  $("[name='makd_yukseklik']").val(formdata.makd_yukseklik);
  $("[name='kabin_genislik']").val(formdata.kabin_genislik);
  $("[name='kabin_derinlik']").val(formdata.kabin_derinlik);
  $("[name='kabin_yukselik']").val(formdata.kabin_yukselik);
  $("[name='kuyu_genislik']").val(formdata.kuyu_genislik);
  $("[name='kuyu_derinlik']").val(formdata.kuyu_derinlik);
  $("[name='kuyu_dip_yukseklik']").val(formdata.kuyu_dip_yukseklik);
  $("[name='seyir_mesafesi']").val(formdata.seyir_mesafesi);
  $("[name='kat_yukseklik']").val(formdata.kat_yukseklik);
  $("[name='kuyu_son_kat_yukseklik']").val(formdata.kuyu_son_kat_yukseklik);
  $("[name='kab_ray_tip']").val(formdata.kab_ray_tip);
  $("[name='kar_ray_tip']").val(formdata.kar_ray_tip);
  $("[name='kab_rayarasi']").val(formdata.kab_rayarasi);
  $("[name='kar_rayarasi']").val(formdata.kar_rayarasi);
  $("[name='kab_kar_rayarasi']").val(formdata.kab_kar_rayarasi);
  $("[name='ray_kapi']").val(formdata.ray_kapi);
  $("[name='dura_kapi_cikinti']").val(formdata.dura_kapi_cikinti);
  $("[name='regg_konum']").val(formdata.regg_konum);
  $("[name='kar_ag_konum']").val(formdata.kar_ag_konum);
  $("[name='kabin_palanga_konum']").val(formdata.kabin_palanga_konum);
  let res = await GetCertifikaById(
    "hiz-regulatoru",
    formdata.guv_komps.hiz_regulator.cert_id
  );
  //hiz regülatörü certifika update
  if (!!res[0]) {
    hizRegSelectMake(res[0]);
    $("[name='guv_komps[hiz_regulator][tip]']").val(
      formdata.guv_komps.hiz_regulator.tip
    );
    $("[name='guv_komps[hiz_regulator][serino]']").val(
      formdata.guv_komps.hiz_regulator.serino
    );
    $("[name='guv_komps[hiz_regulator][img]']").val(
      formdata.guv_komps.hiz_regulator.img
    );
    if (!!formdata.guv_komps.hiz_regulator.img) {
      $("#hiz-reg-wrp .progress-wrp").addClass("hidden");
      $("#hiz-reg-wrp .file-area").removeClass("hidden");
      $("#hiz-reg-wrp .file-area a").attr(
        "href",
        formdata.guv_komps.hiz_regulator.img
      );
      let filenmae = formdata.guv_komps.hiz_regulator.img.split("/").pop();
      $("#hiz-reg-wrp .file-area a").attr("download", filenmae);
      $(".h-reg-img-anchor").html("Değiştir");
    }
  }
  //fren certifika update
  res = await GetCertifikaById("fren", formdata.guv_komps.fren.cert_id);
  if (!!res[0]) {
    frenSelectMake(res[0]);
    $("[name='guv_komps[fren][tip]']").val(formdata.guv_komps.fren.tip);
    $("[name='guv_komps[fren][serino]']").val(formdata.guv_komps.fren.serino);
    $("[name='guv_komps[fren][img]']").val(formdata.guv_komps.fren.img);
    if (!!formdata.guv_komps.fren.img) {
      $("#fren-wrp .progress-wrp").addClass("hidden");
      $("#fren-wrp .file-area").removeClass("hidden");
      $("#fren-wrp .file-area a").attr("href", formdata.guv_komps.fren.img);
      filenmae = formdata.guv_komps.fren.img.split("/").pop();
      $("#fren-wrp .file-area a").attr("download", filenmae);
      $(".fren-img-anchor").html("Değiştir");
    }
  }
  //kart certifika update
  res = await GetCertifikaById("kontrol-kart", formdata.guv_komps.kart.cert_id);
  if (!!res[0]) {
    kartSelectMake(res[0]);
    $("[name='guv_komps[kart][tip]']").val(formdata.guv_komps.kart.tip);
    $("[name='guv_komps[kart][serino]']").val(formdata.guv_komps.kart.serino);
    $("[name='guv_komps[kart][img]']").val(formdata.guv_komps.kart.img);
    if (!!formdata.guv_komps.kart.img) {
      $("#kart-wrp .progress-wrp").addClass("hidden");
      $("#kart-wrp .file-area").removeClass("hidden");
      $("#kart-wrp .file-area a").attr("href", formdata.guv_komps.kart.img);
      filenmae = formdata.guv_komps.kart.img.split("/").pop();
      $("#kart-wrp .file-area a").attr("download", filenmae);
      $(".kart-img-anchor").html("Değiştir");
    }
  }
  //kab_tamp certifika update
  res = await GetCertifikaById("tampon", formdata.guv_komps.kab_tamp.cert_id);
  if (!!res[0]) {
    kab_tampSelectMake(res[0]);
    $("[name='guv_komps[kab_tamp][tip]']").val(formdata.guv_komps.kab_tamp.tip);
    $("[name='guv_komps[kab_tamp][serino]']").val(
      formdata.guv_komps.kab_tamp.serino
    );
    $("[name='guv_komps[kab_tamp][img]']").val(formdata.guv_komps.kab_tamp.img);
    if (!!formdata.guv_komps.kab_tamp.img) {
      $("#kab_tamp-wrp .progress-wrp").addClass("hidden");
      $("#kab_tamp-wrp .file-area").removeClass("hidden");
      $("#kab_tamp-wrp .file-area a").attr(
        "href",
        formdata.guv_komps.kab_tamp.img
      );
      filenmae = formdata.guv_komps.kab_tamp.img.split("/").pop();
      $("#kab_tamp-wrp .file-area a").attr("download", filenmae);
      $(".kab_tamp-img-anchor").html("Değiştir");
    }
  }
  //kar_tamp certifika update
  res = await GetCertifikaById("tampon", formdata.guv_komps.kar_tamp.cert_id);
  if (!!res[0]) {
    kar_tampSelectMake(res[0]);
    $("[name='guv_komps[kar_tamp][tip]']").val(formdata.guv_komps.kar_tamp.tip);
    $("[name='guv_komps[kar_tamp][serino]']").val(
      formdata.guv_komps.kar_tamp.serino
    );
    $("[name='guv_komps[kar_tamp][img]']").val(formdata.guv_komps.kar_tamp.img);
    if (!!formdata.guv_komps.kar_tamp.img) {
      $("#kar_tamp-wrp .progress-wrp").addClass("hidden");
      $("#kar_tamp-wrp .file-area").removeClass("hidden");
      $("#kar_tamp-wrp .file-area a").attr(
        "href",
        formdata.guv_komps.kar_tamp.img
      );
      filenmae = formdata.guv_komps.kar_tamp.img.split("/").pop();
      $("#kar_tamp-wrp .file-area a").attr("download", filenmae);
      $(".kar_tamp-img-anchor").html("Değiştir");
    }
  }
  //durak_kapi_kilit certifika update
  res = await GetCertifikaById(
    "durak-kapi-kilit",
    formdata.guv_komps.durak_kapi_kilit.cert_id
  );
  if (!!res[0]) {
    durak_kapi_kilitSelectMake(res[0]);
    $("[name='guv_komps[durak_kapi_kilit][tip]']").val(
      formdata.guv_komps.durak_kapi_kilit.tip
    );
    $("[name='guv_komps[durak_kapi_kilit][serino]']").val(
      formdata.guv_komps.durak_kapi_kilit.serino
    );
    $("[name='guv_komps[durak_kapi_kilit][img]']").val(
      formdata.guv_komps.durak_kapi_kilit.img
    );
    if (!!formdata.guv_komps.durak_kapi_kilit.img) {
      $("#durak_kapi_kilit-wrp .progress-wrp").addClass("hidden");
      $("#durak_kapi_kilit-wrp .file-area").removeClass("hidden");
      $("#durak_kapi_kilit-wrp .file-area a").attr(
        "href",
        formdata.guv_komps.durak_kapi_kilit.img
      );
      filenmae = formdata.guv_komps.durak_kapi_kilit.img.split("/").pop();
      $("#durak_kapi_kilit-wrp .file-area a").attr("download", filenmae);
      $(".durak_kapi_kilit-img-anchor").html("Değiştir");
    }
  }
  //kabin_kapi_kilit certifika update
  res = await GetCertifikaById(
    "kabin-kapi-kilit",
    formdata.guv_komps.kabin_kapi_kilit.cert_id
  );
  if (!!res[0]) {
    kabin_kapi_kilitSelectMake(res[0]);
    $("[name='guv_komps[kabin_kapi_kilit][tip]']").val(
      formdata.guv_komps.kabin_kapi_kilit.tip
    );
    $("[name='guv_komps[kabin_kapi_kilit][serino]']").val(
      formdata.guv_komps.kabin_kapi_kilit.serino
    );
    $("[name='guv_komps[kabin_kapi_kilit][img]']").val(
      formdata.guv_komps.kabin_kapi_kilit.img
    );
    if (!!formdata.guv_komps.kabin_kapi_kilit.img) {
      $("#kabin_kapi_kilit-wrp .progress-wrp").addClass("hidden");
      $("#kabin_kapi_kilit-wrp .file-area").removeClass("hidden");
      $("#kabin_kapi_kilit-wrp .file-area a").attr(
        "href",
        formdata.guv_komps.kabin_kapi_kilit.img
      );
      filenmae = formdata.guv_komps.kabin_kapi_kilit.img.split("/").pop();
      $("#kabin_kapi_kilit-wrp .file-area a").attr("download", filenmae);
      $(".kabin_kapi_kilit-img-anchor").html("Değiştir");
    }
  }
  //ucm_acop certifika update
  res = await GetCertifikaById("ucm-acop", formdata.guv_komps.ucm_acop.cert_id);
  res_reg = await GetCertifikaById(
    "hiz-regulatoru",
    formdata.guv_komps.ucm_acop.cert_id
  );
  if (!!res_reg[0]) {
    res = res_reg;
  }
  if (!!res[0]) {
    ucm_acopSelectMake(res[0]);
    $("[name='guv_komps[ucm_acop][tip]']").val(formdata.guv_komps.ucm_acop.tip);
    $("[name='guv_komps[ucm_acop][serino]']").val(
      formdata.guv_komps.ucm_acop.serino
    );
    $("[name='guv_komps[ucm_acop][img]']").val(formdata.guv_komps.ucm_acop.img);
    if (!!formdata.guv_komps.ucm_acop.img) {
      $("#ucm_acop-wrp .progress-wrp").addClass("hidden");
      $("#ucm_acop-wrp .file-area").removeClass("hidden");
      $("#ucm_acop-wrp .file-area a").attr(
        "href",
        formdata.guv_komps.ucm_acop.img
      );
      filenmae = formdata.guv_komps.ucm_acop.img.split("/").pop();
      $("#ucm_acop-wrp .file-area a").attr("download", filenmae);
      $(".ucm_acop-img-anchor").html("Değiştir");
    }
  }
  //motor certifika update
  res = await GetCertifikaById("motor", formdata.guv_komps.motor.cert_id);
  if (!!res[0]) {
    motorSelectMake(res[0]);
    $("[name='guv_komps[motor][tip]']").val(formdata.guv_komps.motor.tip);
    $("[name='guv_komps[motor][kw]']").val(formdata.guv_komps.motor.kw);
    $("[name='guv_komps[motor][rpm]']").val(formdata.guv_komps.motor.rpm);
    $("[name='guv_komps[motor][serino]']").val(formdata.guv_komps.motor.serino);
    $("[name='guv_komps[motor][img]']").val(formdata.guv_komps.motor.img);
    if (!!formdata.guv_komps.motor.img) {
      $("#motor-wrp .progress-wrp").addClass("hidden");
      $("#motor-wrp .file-area").removeClass("hidden");
      $("#motor-wrp .file-area a").attr("href", formdata.guv_komps.motor.img);
      filenmae = formdata.guv_komps.motor.img.split("/").pop();
      $("#motor-wrp .file-area a").attr("download", filenmae);
      $(".motor-img-anchor").html("Değiştir");
    }
  }
  //kapi_panel_yangin certifika update
  res = await GetCertifikaById(
    "kapi-panel",
    formdata.guv_komps.kapi_panel_yangin.cert_id
  );
  if (!!res[0]) {
    kapi_panel_yanginSelectMake(res[0]);
    $("[name='guv_komps[kapi_panel_yangin][tip]']").val(
      formdata.guv_komps.kapi_panel_yangin.tip
    );
    $("[name='guv_komps[kapi_panel_yangin][serino]']").val(
      formdata.guv_komps.kapi_panel_yangin.serino
    );
    $("[name='guv_komps[kapi_panel_yangin][img]']").val(
      formdata.guv_komps.kapi_panel_yangin.img
    );
    if (!!formdata.guv_komps.kapi_panel_yangin.img) {
      $("#kapi_panel_yangin-wrp .progress-wrp").addClass("hidden");
      $("#kapi_panel_yangin-wrp .file-area").removeClass("hidden");
      $("#kapi_panel_yangin-wrp .file-area a").attr(
        "href",
        formdata.guv_komps.kapi_panel_yangin.img
      );
      filenmae = formdata.guv_komps.kapi_panel_yangin.img.split("/").pop();
      $("#kapi_panel_yangin-wrp .file-area a").attr("download", filenmae);
      $(".kapi_panel_yangin-img-anchor").html("Değiştir");
    }
  }
  //kapi_panel_sarkac certifika update
  res = await GetCertifikaById(
    "kapi-panel",
    formdata.guv_komps.kapi_panel_sarkac.cert_id
  );
  if (!!res[0]) {
    kapi_panel_sarkacSelectMake(res[0]);
    $("[name='guv_komps[kapi_panel_sarkac][tip]']").val(
      formdata.guv_komps.kapi_panel_sarkac.tip
    );
    $("[name='guv_komps[kapi_panel_sarkac][serino]']").val(
      formdata.guv_komps.kapi_panel_sarkac.serino
    );
    $("[name='guv_komps[kapi_panel_sarkac][img]']").val(
      formdata.guv_komps.kapi_panel_sarkac.img
    );
    if (!!formdata.guv_komps.kapi_panel_sarkac.img) {
      $("#kapi_panel_sarkac-wrp .progress-wrp").addClass("hidden");
      $("#kapi_panel_sarkac-wrp .file-area").removeClass("hidden");
      $("#kapi_panel_sarkac-wrp .file-area a").attr(
        "href",
        formdata.guv_komps.kapi_panel_sarkac.img
      );
      filenmae = formdata.guv_komps.kapi_panel_sarkac.img.split("/").pop();
      $("#kapi_panel_sarkac-wrp .file-area a").attr("download", filenmae);
      $(".kapi_panel_sarkac-img-anchor").html("Değiştir");
    }
  }
  //halat certifika update
  res = await GetCertifikaById("halat", formdata.guv_komps.halat.cert_id);
  if (!!res[0]) {
    halatSelectMake(res[0]);
    $("[name='guv_komps[halat][tip]']").val(formdata.guv_komps.halat.tip);
    $("[name='guv_komps[halat][serino]']").val(formdata.guv_komps.halat.serino);
    $("[name='guv_komps[halat][img]']").val(formdata.guv_komps.halat.img);
    if (!!formdata.guv_komps.halat.img) {
      $("#halat-wrp .progress-wrp").addClass("hidden");
      $("#halat-wrp .file-area").removeClass("hidden");
      $("#halat-wrp .file-area a").attr("href", formdata.guv_komps.halat.img);
      filenmae = formdata.guv_komps.halat.img.split("/").pop();
      $("#halat-wrp .file-area a").attr("download", filenmae);
      $(".halat-img-anchor").html("Değiştir");
    }
  }
  $("[name='imzali_formlar[af]']").val(formdata.imzali_formlar.af);
  $("[name='imzali_formlar[eir]']").val(formdata.imzali_formlar.eir);
  $("[name='imzali_formlar[tfrfe]']").val(formdata.imzali_formlar.tfrfe);
  $("[name='imzali_formlar[checklist]']").val(
    formdata.imzali_formlar.checklist
  );
  $("[name='imzali_formlar[contract]']").val(formdata.imzali_formlar.contract);
};
const imzaliFormlar = async (plan, denetim) => {
  $(`.plan${plan.id} .imzali-form-area`).html(`
       <div class="font-semibold">İmzalı Formlar(Pdf)</div>
    `);
  denetim.imzali_formlar =
    typeof denetim.imzali_formlar == "string"
      ? JSON.parse(denetim.imzali_formlar)
      : denetim.imzali_formlar;
  let strFormArea = `
          <ul class="imzul list-disc pl-5">
                     <li class="imz_af"> <a class="underline ${
                       !!denetim.imzali_formlar && denetim.imzali_formlar.imz_af
                         ? "text-green-600"
                         : "text-red-600"
                     }  hover:cursor-pointer">Application Form</a> 
                      <input type="file" class="hidden" accept=".pdf">  
                       <a href="${
                         denetim.imzali_formlar["imz_af"]
                       }" target="_blank" download="1.Application Form.pdf" 
                       class="${
                         denetim.imzali_formlar["imz_af"] ? "" : "hidden"
                       } underline text-blue-600">İndir</a>
                     </li>
                      <li class="imz_eir"> <a class="underline ${
                        !!denetim.imzali_formlar &&
                        denetim.imzali_formlar.imz_eir
                          ? "text-green-600"
                          : "text-red-600"
                      }   hover:cursor-pointer">Elevator Inspectation Report</a> 
                           <input type="file" class="hidden" accept=".pdf"> 
                                  <a href="${
                                    denetim.imzali_formlar["imz_eir"]
                                  }" target="_blank" download="4.Elevator Inspectation Report.pdf" 
                       class="${
                         denetim.imzali_formlar["imz_eir"] ? "" : "hidden"
                       } underline text-blue-600">İndir</a>
                      </li>
                       <li class="imz_tfrfe"> <a class="underline ${
                         !!denetim.imzali_formlar &&
                         denetim.imzali_formlar.imz_tfrfe
                           ? "text-green-600"
                           : "text-red-600"
                       }  hover:cursor-pointer">Technical File Report For Elevator</a> 
                            <input type="file" class="hidden" accept=".pdf"> 
                            <a href="${
                              denetim.imzali_formlar["imz_tfrfe"]
                            }" target="_blank" download="11.Technical File Report For Elevator.pdf" 
                       class="${
                         denetim.imzali_formlar["imz_tfrfe"] ? "" : "hidden"
                       } underline text-blue-600">İndir</a>
                       </li>
                        <li class="imz_chec"> <a class="underline ${
                          !!denetim.imzali_formlar &&
                          denetim.imzali_formlar.imz_chec
                            ? "text-green-600"
                            : "text-red-600"
                        }   hover:cursor-pointer">Checklist</a> 
                             <input type="file" class="hidden" accept=".pdf" > 
                                 <a href="${
                                   denetim.imzali_formlar["imz_chec"]
                                 }" target="_blank" download="3.Checklist.pdf" 
                       class="${
                         denetim.imzali_formlar["imz_chec"] ? "" : "hidden"
                       } underline text-blue-600">İndir</a>
                        </li>
                        <li class="imz_cont"> <a class="underline ${
                          !!denetim.imzali_formlar &&
                          denetim.imzali_formlar.imz_cont
                            ? "text-green-600"
                            : "text-red-600"
                        }   hover:cursor-pointer">Contract</a> 
                             <input type="file" class="hidden" accept=".pdf">
                                   <a href="${
                                     denetim.imzali_formlar["imz_cont"]
                                   }" target="_blank" download="10.Contract.pdf" 
                       class="${
                         denetim.imzali_formlar["imz_cont"] ? "" : "hidden"
                       } underline text-blue-600">İndir</a> 
                          </li>
                 </ul>
       `;

  $(`.plan${plan.id} .imzali-form-area`).append(strFormArea);
  function fileOp(denetim, classname, filname) {
    $(`.plan${plan.id} .${classname} a:nth-of-type(1)`).on(
      "click",
      function () {
        $(`.plan${plan.id} .${classname}  [type='file']`).val("");
        $(`.plan${plan.id} .${classname} [type='file']`).trigger("click");
      }
    );
    $(`.plan${plan.id} .${classname} [type='file']`).on(
      "change",
      async function () {
        let folderpath = "/uploads/planlama/denetim/" + plan.formpathsfolder;

        //upload
        let file = $(this).get(0).files[0];
        let fileuzanti = file.name.split(".").pop();
        let filename = `${filname}.${fileuzanti}`;
        var upload = new Upload(file);
        const { msg } = await upload.asyncDoUpload(
          `${folderpath}/imzali_formlar/`,
          filname,
          ""
        );
        if (!!msg && msg == "Ok!") {
          denetim.imzali_formlar[
            classname
          ] = `${folderpath}/imzali_formlar/${filename}`;
          $.ajax({
            type: "POST",
            url: "/denetim/update-imzali-formlar",
            data: {
              denetim_id: denetim.id,
              imzali_formlar: denetim.imzali_formlar,
            },
            dataType: "json",
          });
          imzaliFormlar(plan, denetim);
        }
      }
    );
  }
  fileOp(denetim, "imz_af", "1.Application Form");
  fileOp(denetim, "imz_eir", "4.Elevator Inspectation Report");
  fileOp(denetim, "imz_tfrfe", "11.Technical File Report For Elevator");
  fileOp(denetim, "imz_chec", "3.Checklist");
  fileOp(denetim, "imz_cont", "10.Contract");

  return denetim;
};

const popRisk = async (type, plan, denetim) => {
  const respHtml = await fetch("/templates/denetim/risk.html");
  const strHtml = await respHtml.text();
  const rendered = Handlebars.compile(strHtml);
  let init_risk = {
    kabinust: {
      title: "Kabin Üstü Risk Analiz",
      risk_analiz:
        "Asansör kabini üst son konumda gerekli mesafelerin yetersiz olması",
      risk_analiz_en:
        "Insufficient distances required at the upper end position of the elevator cabin.",
      tehlikeli_durum:
        "Asansör son konumda iken Kabin üstü korkuluk kuyu tavan mesafesi (yatay mesafede 40cm izdüşümü) 10cm de kalıyor.",
      tehlikeli_durum_en:
        "When the elevator is in the final position, the distance between the cabin top railing and the shaft ceiling (40cm horizontal projection) remains at 10cm",
      risk_uygulamalar: [
        "1.Karşı ağırlık altına  katlanabilir tampon  ve elektriksel durudurucu anahtarları montajı,",
        "2.Kabin üstü korkuluk katlanabilir yapılması ve elektriksel durdurucu anahtarları montajı.",
        "3.Kullanma ve Bakım kılavuzunda çalışma koşulları belirtilmesi.",
        "4.Kabin üstünde bakım yapılabilmesi için katlaanabilir montaj elemanlarının devreye alınmadan asansörde hareket sağlanmasının engellenmesi",
      ],
      risk_uygulamalar_en: [
        "1.Installation of foldable buffers and electrical stop switches under the counterweight,",
        "2.Making the cabin top railing foldable and installing electrical stop switches.",
        "3.Specifying the operating conditions in the Usage and Maintenance Manual.",
        "4.Preventing movement in the elevator without activating the foldable assembly elements so that maintenance can be performed on the cabin",
      ],
    },
    kuyudip: {
      title: "Kuyu Dibi Risk Analiz",
      risk_analiz:
        "Asansör en alt son konumda gerekli alanların yetersiz olması",
      risk_analiz_en:
        "Insufficient space required at the lowest final position of the elevator",
      tehlikeli_durum:
        "Asansör alt son konumda iken kabin etek sacı zemine çarpma durumu mevcut",
      tehlikeli_durum_en:
        "There is a situation where the cabin skirt plate hits the ground when the elevator is in the lower final position.",
      risk_uygulamalar: [
        "1.Katlanabilir etek sacı yapılmıtır",
        "2.Kurtarma ve bakım talimatlarında risk durumları belirlenilmiştir.",
        "3.Etek sacı alanında sarı siyah işaretlemeler yerleştirilmiştir",
        "4.Makine dairesnde,kabin etek sacı bölgesine ilgili talimatlar konulmuştur",
      ],
      risk_uygulamalar_en: [
        "1. Foldable skirt plate has been made",
        "2. Risk situations have been determined in the rescue and maintenance instructions.",
        "3. Yellow and black markings have been placed in the skirt plate area",
        "4. Relevant instructions have been placed in the car skirt plate area in the engine room",
      ],
    },
    makdairesi: {
      title: "Makine Dairesi Risk Analiz",
      risk_analiz:
        "Asansör makine dairesi çalışma alanları yüksekliği ve makine dairesi giriş kapısı yüksekliği yetersiz ",
      risk_analiz_en:
        "Elevator machine room working area height and machine room entrance door height are insufficient",
      tehlikeli_durum:
        "Makine dairesi çalışma alanı yüksekliği 1.85m ve Makine dairesi giriş kapısı yüksekliği 1.73cm geliyor.",
      tehlikeli_durum_en:
        "The height of the machine room working area is 1.85m and the height of the machine room entrance door is 1.73cm.",
      risk_uygulamalar: [
        "1.Çalışma alanlarındaki serbest yüksekliğin 2.1 m’den az olduğu yerlerde (Tavan/Kiriş/Diğer Engeller) çarpma riski taşıyan kısımlara, yanmaz yumuşak malzemeler kaplanmıştır ve sarı- siyah uyarı şeritleri çekilerek işaretlenmiştir.",
        "2.Tavan/Kiriş/Diğer Engeller gibi çarpma riski taşıyan kısımların  her iki tarafına görülebilir bir yerde “Tehlike!!!  Çalışma Yüksekliği 1,80 m’dir.“ şeklinde okunaklı sarı-siyah renkli uyarı etiketi bırakılmıştır.",
        "3.Korunma amaçlı kapı girişinde daimi olarak baret ve kullanma talimatı bulundurulmaktadır ve kullanılması girişe bırakılan uyarıcı yazıyla zorunlu kılınmıştır.",
        "4.Kullanma ve Bakım kılavuzunda çarpma tehlikesi ve çalışma koşulları belirtilmiştir.",
      ],
      risk_uygulamalar_en: [
        "1. In places where the free height in the work areas is less than 2.1 m (Ceiling/Beam/Other Obstacles), the parts that pose a risk of impact are covered with fireproof soft materials and marked with yellow-black warning stripes.",
        "2. A legible yellow-black warning label stating 'Danger!!! Working Height is 1.80 m' is left in a visible place on both sides of the parts that pose a risk of impact such as Ceiling/Beam/Other Obstacles.",
        "3. A helmet and instructions for use are always kept at the door entrance for protection purposes and its use is made mandatory with a warning note left at the entrance.",
        "4. The risk of impact and working conditions are specified in the Usage and Maintenance Manual.",
      ],
    },
  };
  function insertRiskData(datain) {
    $(`.form-risk [name='yayim_tarih']`).val(datain.yayim_tarih);
    $(`.form-risk [name='risk_analiz']`).val(datain.risk_analiz);
    $(`.form-risk [name='risk_analiz_en']`).val(datain.risk_analiz_en);
    $(`.form-risk [name='tehlikeli_durum']`).val(datain.tehlikeli_durum);
    $(`.form-risk [name='tehlikeli_durum_en']`).val(datain.tehlikeli_durum_en);
    $(`.form-risk [name='uyg_img1']`).val(datain.uyg_img1);
    $(`.form-risk [name='uyg_img2']`).val(datain.uyg_img2);
    $(`.form-risk [name='uyg_img3']`).val(datain.uyg_img3);
    $(`.form-risk [name='uyg_img4']`).val(datain.uyg_img4);
    $(`.form-risk .uyg_img1 img`).attr("src", datain.uyg_img1);
    $(`.form-risk .uyg_img2 img`).attr("src", datain.uyg_img2);
    $(`.form-risk .uyg_img3 img`).attr("src", datain.uyg_img3);
    $(`.form-risk .uyg_img4 img`).attr("src", datain.uyg_img4);
    $(".risk-uyg").html("");
    $(".risk-uyg-en").html("");
    for (let i = 0; i < datain.risk_uygulamalar.length; i++) {
      const item = datain.risk_uygulamalar[i];
      $(".risk-uyg").append(`
        <li>
              <textarea type="text" class="frm-txt !h-[4rem]" name="risk_uygulamalar[${i}]" ></textarea>
            </li>
        `);
      $(`[name='risk_uygulamalar[${i}]']`).val(item);
    }
    for (let i = 0; i < datain.risk_uygulamalar_en.length; i++) {
      const item = datain.risk_uygulamalar_en[i];
      $(".risk-uyg-en").append(`
        <li>
              <textarea type="text" class="frm-txt text-red-600 !h-[4rem]" name="risk_uygulamalar_en[${i}]" ></textarea>
            </li>
        `);
      $(`[name='risk_uygulamalar_en[${i}]']`).val(item);
    }
  }
  $(".riskpop").remove();
  if (type === "Makine Dairesi") {
    $("body").append(rendered({ title: init_risk.makdairesi.title }));
    if (!!denetim.risk && !!denetim.risk.makdairesi) {
      insertRiskData(denetim.risk.makdairesi);
    } else {
      insertRiskData(init_risk.makdairesi);
    }
  } else if (type === "Kabin Üstü") {
    $("body").append(rendered({ title: init_risk.kabinust.title }));
    if (!!denetim.risk && !!denetim.risk.kabinust) {
      insertRiskData(denetim.risk.kabinust);
    } else {
      insertRiskData(init_risk.kabinust);
    }
  } else if ((type = "Kuyu Dibi")) {
    $("body").append(rendered({ title: init_risk.kuyudip.title }));
    if (!!denetim.risk && !!denetim.risk.kuyudip) {
      insertRiskData(denetim.risk.kuyudip);
    } else {
      insertRiskData(init_risk.kuyudip);
    }
  }
  for (let i = 1; i < 5; i++) {
    $(`.uyg_img${i} a:nth-child(1)`).on("click", () => {
      $(`.uyg_img${i} #uyg_img${i}`).val("");
      $(`.uyg_img${i} #uyg_img${i}`).trigger("click");
    });
    $(`.uyg_img${i} #uyg_img${i}`).on("change", async () => {
      let folderpath = denetim.folder_path;
      let file = $(`.uyg_img${i} #uyg_img${i}`).get(0).files[0];
      let fileuzanti = file.name.split(".").pop();
      let filename = `uyg_img${i}.${fileuzanti}`;
      var upload = new Upload(file);
      const { msg } = await upload.asyncDoUpload(
        `${folderpath}/risk/${type}/`,
        `uyg_img${i}`,
        ""
      );
      if (!!msg && msg == "Ok!") {
        $(`[name='uyg_img${i}']`).val(`${folderpath}/risk/${type}/${filename}`);
        $(`.uyg_img${i} img`).attr(
          "src",
          `${folderpath}/risk/${type}/${filename}`
        );
        $(`.uyg_img${i} a:nth-child(2)`).attr(
          "href",
          `${folderpath}/risk/${type}/${filename}`
        );
      }
    });
  }

  $(".btn-kaydet-risk").on("click", async () => {
    console.log(type, $(".form-risk").serializeJSON());
    if (type === "Makine Dairesi") {
      denetim.risk = {
        ...denetim.risk,
        makdairesi: $(".form-risk").serializeJSON(),
      };
    } else if (type === "Kabin Üstü") {
      denetim.risk = {
        ...denetim.risk,
        kabinust: $(".form-risk").serializeJSON(),
      };
    } else if ((type = "Kuyu Dibi")) {
      denetim.risk = {
        ...denetim.risk,
        kuyudip: $(".form-risk").serializeJSON(),
      };
    }
    console.log(denetim.risk);
    await $.ajax({
      type: "POST",
      url: "/denetim/update-risk",
      data: { denetim_id: denetim.id, risk: denetim.risk },
      dataType: "json",
    });
    await getPlanByItem(plan);
    $(".btn-close-risk").trigger("click");
    console.log(denetim);
  });
  $(".btn-close-risk").on("click", () => {
    $(".riskpop").remove();
  });
};
const getPlanByItem = async (plan) => {
  console.log(plan);
  const res = await getAsBilgiByPlanId(plan.id);
  if ($("body").find(`.plan${plan.id} .as-bilgi-duzenle`)) {
    $(`.plan${plan.id} .as-bilgi-duzenle`).remove();
  }
  $(`.plan${plan.id} .as-bilgi .as-bilgi-area`).append(`
        <button class="btn-sm btn-base as-bilgi-duzenle">Düzenle</button>
        `);
  $(`.plan${plan.id} .as-bilgi-duzenle`).on("click", async function () {
    if (Object.values(res).length > 0) {
      await onPopupAsBilgi(plan, res[0]);
      formDoldur(res);
    } else {
      await onPopupAsBilgi(plan, null);
    }
  });

  if ($(`.plan${plan.id}`).find(".btn-delete-denetim")) {
    $(`.plan${plan.id} .btn-delete-denetim`).remove();
  }
  $(`.plan${plan.id} .imzali-form-area .imzul`).remove();
  if ($("body").find(".as-iso-olustur")) {
    $(`.plan${plan.id} .as-iso-olustur`).remove();
  }
  if ($("body").find(".as-komp-olustur")) {
    $(`.plan${plan.id} .as-komp-olustur`).remove();
  }
  $(`.planust${plan.id} .btn-denetim-ok`).on("click", async function () {
    await $.ajax({
      type: "POST",
      url: "/denetim/update-planstatus",
      data: { plan_id: plan.id, status: "Proje Bekleniyor" },
      dataType: "json",
    });
    if (plan.status === "Denetim Bekleniyor") {
      $("#tbody1").html("");
      const plans = await getPlansfromDb(month, year);
      await makeTable(plans);
    }
  });
  if (plan.status === "Denetim Bekleniyor") {
    $(`.planust${plan.id} .btn-denetim-ok`).removeClass(
      "bg-green-600 hover:bg-green-700 active:bg-green-500"
    );
    $(`.planust${plan.id} .btn-denetim-ok`).addClass(
      "bg-blue-600 hover:bg-blue-700 active:bg-blue-500"
    );
    $(`.planust${plan.id} .btn-denetim-ok`).html("Denetimi Bitir");
    $(`.planust${plan.id} .engl-area`).css("display", "none");
  }
  let srte = `
          <div class="pt-2 riskk-area">
                <div class="font-semibold ">Asansör risk durum</div>
                <div class="risk-info-text"></div> 
                <div class="risk-btn-area flex items-center space-x-2  flex-wrap"></div>
            </div>
      `;
  if (plan.modul === "Modul G") {
    $(`.plan${plan.id} .as-bilgi .riskk-area`).remove();
    $(`.plan${plan.id} .as-bilgi`).append(srte);
    srte = `<div class="btn-sm btn-base as-risk-yok">Kuyu Dibi Risk Analiz</div>`;
    $(`.plan${plan.id} .as-bilgi .risk-info-text`).html("");
    if (!!plan.risk) {
      const { makdaire, kabinust, kuyudip } = JSON.parse(plan.risk);
      $(`.plan${plan.id} .as-bilgi .risk-info-text`).html(
        `<ul class="pl-5 list-disc txt-rsk-list"></ul>`
      );
      if (JSON.parse(makdaire)) {
        $(`.plan${plan.id} .as-bilgi .risk-info-text .txt-rsk-list`).append(
          "<li>Makine Dairesi</li>"
        );
      }
      if (JSON.parse(kuyudip)) {
        $(`.plan${plan.id} .as-bilgi .risk-info-text .txt-rsk-list`).append(
          "<li>Kuyu Dibi</li>"
        );
      }
      if (JSON.parse(kabinust)) {
        $(`.plan${plan.id} .as-bilgi .risk-info-text .txt-rsk-list`).append(
          "<li>Kabin Üstü</li>"
        );
      }
    } else {
      $(`.plan${plan.id} .as-bilgi .risk-info-text`).html(
        "Risk Değerlendirme Yok"
      );
    }
  }
  if (Object.values(res).length > 0) {
    $(`.plan${plan.id} .as-bilgi-area`).append(`
      <button class="btn-sm btn-base btn-delete-denetim">Denetim Veri Sil</button>
      `);
    $(`.plan${plan.id} .btn-delete-denetim`).on("click", async function () {
      $(`.plan${plan.id} .dne-area`).removeClass("hidden");
      $(`.plan${plan.id} .dne-area`).addClass("flex");
    });
    $(`.plan${plan.id} .btn-dne-sil`).on("click", async function () {
      await $.ajax({
        type: "POST",
        url: "/denetim/delete-denetim",
        data: { ...plan },
        dataType: "json",
      });
      await getPlanByItem(plan);
      $(`.plan${plan.id} .dne-area`).addClass("hidden");
      $(`.plan${plan.id} .dne-area`).removeClass("flex");
      $(".as-bilgipop").remove();
      $(".as-bilgicloseOnay").remove();
      $(".komp-sertifika").remove();
    });
    $(`.plan${plan.id} .btn-dne-iptal`).on("click", function () {
      $(`.plan${plan.id} .dne-area`).addClass("hidden");
      $(`.plan${plan.id} .dne-area`).removeClass("flex");
    });

    let denetim = Object.values(res)[0];
    denetim.risk = !!denetim.risk ? JSON.parse(denetim.risk) : null;
    // const { imzali_formlar } = denetim;
    denetim = await imzaliFormlar(plan, denetim);
    console.log("modul", plan.modul);
    if (plan.modul === "Modul B") {
      $(`.plan${plan.id} .as-bilgi`).append(`
            <div class="pt-2 as-komp-olustur">
                <div class="font-semibold as-komp-olustur-title">Modul B Ekleri</div>
                <button class="btn-sm btn-base as-komp-olustur-btn">Komponent listesi</button>
            </div>
            `);
      $(".as-komp-olustur-btn").on("click", function () {
        PopupModulBList(denetim, plan);
      });
    } else if (plan.modul === "Modul E" || plan.modul === "Modul H1") {
      $(`.plan${plan.id} .as-bilgi`).append(`
            <div class="pt-2 as-iso-olustur">
                <div class="font-semibold as-iso-olustur-title">ISO Bilgileri</div>
                <button class="btn-sm btn-base as-iso-olustur-btn">Düzenle</button>
            </div>
            
            `);
    } else if (plan.modul === "Modul G") {
      if (!!plan.risk) {
        const risk = JSON.parse(plan.risk);
        $(`.plan${plan.id} .as-bilgi .risk-btn-area`).css("display", "flex");
        if (!!JSON.parse(risk.kuyudip)) {
          srte = `<button class="btn-sm btn-base as-riskkuyudip-btn">Kuyu Dibi</button>`;
          $(`.plan${plan.id} .as-bilgi .risk-btn-area`).append(srte);
          $(`.plan${plan.id} .as-bilgi .as-riskkuyudip-btn`).on("click", () => {
            popRisk("Kuyu Dibi", plan, denetim);
          });
        }
        if (!!JSON.parse(risk.kabinust)) {
          srte = `<button class="btn-sm btn-base as-riskkabinust-btn">Kabin Üst</button>`;
          $(`.plan${plan.id} .as-bilgi .risk-btn-area`).append(srte);
          $(`.plan${plan.id} .as-bilgi .as-riskkabinust-btn`).on(
            "click",
            () => {
              popRisk("Kabin Üstü", plan, denetim);
            }
          );
        }
        if (!!JSON.parse(risk.makdaire)) {
          srte = `<button class="btn-sm btn-base as-riskmakdaire-btn">Makine Dairesi</button>`;
          $(`.plan${plan.id} .as-bilgi .risk-btn-area`).append(srte);

          $(`.plan${plan.id} .as-bilgi .as-riskmakdaire-btn`).on(
            "click",
            () => {
              popRisk("Makine Dairesi", plan, denetim);
            }
          );
        }
      } else {
        $(`.plan${plan.id} .as-bilgi .risk-btn-area`).css("display", "none");
      }
    }
  }
};
async function onPopupAsBilgi(plan, denetim) {
  const planId = plan.id;
  let newItem = {};
  newItem["planlama_id"] = planId;
  let folderpath = "/uploads/planlama/denetim/" + plan.formpathsfolder;
  $(".as-bilgicloseOnay").remove();
  $(".as-bilgipop").remove();
  $(".komp-sertifika").remove();
  const resptemp = await fetch("/templates/denetim/as-bilgi.html");
  const strTxt = await resptemp.text();
   const rendered = Handlebars.compile(strTxt);
  $("body").append(rendered({ firmaa:`${plan.as_firma_kisa_ad}`,modull:`${plan.modul}`,address:`${plan.as_mahalle} ${plan.adres} ${plan.as_ilce}/${plan.as_il}`,seri_no:plan.as_seri_no }));
  // $("body").append(strTxt);
  onImgBtnsAktifEt(folderpath);
  $("[name='folder_path']").val(`${folderpath}`);
  $("[name='giris_sayisi']").on("click", function () {
    if ($(this).val() === "Çift Giriş") {
      $(".cift_giris_area").css("display", "flex");
    } else if ($(this).val() === "Tek Giriş") {
      $(".cift_giris_area").css("display", "none");
    }
  });
  $(".btn-save-as-bilgi").on("click", async function () {
    newItem = { ...newItem, ...$("form").serializeJSON() };
    newItem["guv_komps"] = JSON.stringify(newItem["guv_komps"]);
    newItem["imzali_formlar"] = JSON.stringify({
      imz_af: "",
      imz_eir: "",
      imz_tfrfe: "",
      imz_chec: "",
      imz_cont: "",
    });
    newItem["folder_path"] = folderpath;
    const resup = await $.ajax({
      type: "POST",
      url: "/denetim/save-asansor-bilgi",
      data: { ...newItem },
      dataType: "json",
    });
    await getPlanByItem(plan);
    $(".as-bilgipop").remove();
    $(".as-bilgicloseOnay").remove();
    $(".komp-sertifika").remove();
  });
  $(".btn-update-as-bilgi").on("click", async function () {
    newItem = { ...newItem, ...$("form").serializeJSON() };
    newItem["id"] = denetim.id;
    newItem["guv_komps"] = JSON.stringify(newItem["guv_komps"]);
    // newItem["imzali_formlar"] = JSON.stringify(denetim.imzali_formlar);
    newItem["folder_path"] = folderpath;
    if (!!denetim.proje) {
      newItem["proje"] = denetim.proje;
    }
    const resup = await $.ajax({
      type: "POST",
      url: "/denetim/update-asansor-bilgi",
      data: { ...newItem },
      dataType: "json",
    });
    await getPlanByItem(plan);
    $(".as-bilgipop").remove();
    $(".as-bilgicloseOnay").remove();
    $(".komp-sertifika").remove();
  });
  $(".as-bilgiclose").on("click", function () {
    $(".as-bilgicloseOnay").removeClass("hidden");
    $(".as-bilgicloseOnay").addClass("flex");
    $(".out-yes").on("click", function () {
      $(".as-bilgicloseOnay").addClass("hidden");
      $(".as-bilgicloseOnay").removeClass("flex");
      $(".as-bilgipop").addClass("hidden");
      $(".as-bilgipop").removeClass("flex");
    });
    $(".out-no").on("click", function () {
      $(".as-bilgicloseOnay").addClass("hidden");
      $(".as-bilgicloseOnay").removeClass("flex");
    });
  });
  $(".komp-sertifika-close").on("click", function () {
    $(".komp-sertifika").addClass("hidden");
    $(".komp-sertifika").removeClass("flex");
  });
}
const makeTable = async (plans) => {
  for (let i = 0; i < plans.length; i++) {
    const plan = plans[i];
    const str = `
           <div id="plan${
             plan.id
           }" class="flex py-1 border-b border-gray-200 first:border-t cursor-pointer hover:bg-black/5">
                <div class="flex-1 pl-2">${plan.status}</div>
                <div class="flex-1 pl-2">${plan.as_seri_no}</div>
                <div class="flex-1">${plan.denetim_tarih} - ${
      plan.baslangic
    } </div>
                <div class="flex-1">${plan.as_firma_kisa_ad}</div>
                <div class="flex-1">${plan.modul}</div>
                <div class="flex-1">${plan.as_ilce} - ${plan.as_il}</div>
                <div class="flex-1 pr-2">${plan.denetci}</div>
            </div>
            <div style="display: none;" class="planust${
              plan.id
            } px-10 py-4 shadow-[inset_0_0_3px_rgba(0,0,0,0.3)] bg-black/5 ">
                <div class="flex space-x-2"> 
                    <div>
                        <a  target="_blank"  href="${
                          plan.yapi_ruhsati
                        }" class="underline text-blue-500">Yapı Ruhsatı</a>
                    </div>
                    <div>
                      <strong>Adres:</strong> ${plan.as_mahalle} ${
      plan.adres
    }  ${plan.as_ilce} / ${plan.as_il}
                    </div>
                    <div> <strong>Ada/Parsel:</strong> ${plan.ada} - ${
      plan.parsel
    } </div>
                  <div class="flex-1 flex justify-end items-center">
                    <div class="btn-denetim-ok py-1 px-3 inline-block cursor-pointer select-none  text-white">Denetimi Tamamla</div>
                  </div>
                </div>
                <div class="plan${plan.id} flex space-x-10 py-4">
                    <div>
                        <div class="font-semibold">
                            Denetm öncesi formlar
                        </div>
                        <ul class="list-disc pl-7">
                            <li><a href="${JSON.parse(
                              plan.formpaths
                            )[0].replace(
                              ".docx",
                              ".pdf"
                            )}" download="Application Form" target="_blank" class="underline text-blue-600 italic">Application Form</a></li>
                            <li><a href="${JSON.parse(
                              plan.formpaths
                            )[1].replace(
                              ".docx",
                              ".pdf"
                            )}" download="Elevator Inspectation Report" target="_blank" class="underline text-blue-600 italic">Elevator Inspectation Report</a></li>
                            <li><a href="${JSON.parse(
                              plan.formpaths
                            )[2].replace(
                              ".docx",
                              ".pdf"
                            )}" download="Technical File Report For Elevator" target="_blank" class="underline text-blue-600 italic">Technical File Report For Elevator</a></li>
                            <li><a href="${JSON.parse(
                              plan.formpaths
                            )[3].replace(
                              ".docx",
                              ".pdf"
                            )}" download="Checklist" target="_blank" class="underline text-blue-600 italic">Checklist</a></li>
                            <li><a href="${JSON.parse(
                              plan.formpaths
                            )[4].replace(
                              ".docx",
                              ".pdf"
                            )}" download="Contract" target="_blank" class="underline text-blue-600 italic">Contract</a></li>
                        </ul>

                        <div class="dne-area fixed z-[10] top-0 left-0 w-full h-full bg-red-600/20 hidden items-center justify-center">
                          <div class="p-20 flex flex-col items-center justify-center bg-white space-y-5 rounded shadow-[0_0_10px_1px_rgba(0,0,0,0.2)]">
                            <div class="text-[1.2rem] font-semibold">Denetim Verisini silmek İstiyor musunuz?</div>
                            <div class="">
                              <button  class="btn-dne-sil w-[100px] py-2 bg-red-700 text-white hover:bg-red-600">Evet</button>
                              <button class="btn-dne-iptal w-[100px] py-2 bg-gray-700 text-white hover:bg-gray-600">Hayır</button>
                            </div>
                          </div>
                        </div>
                    </div>
                    <div class="flex-1 as-bilgi relative px-4">
                      <div class="engl-area absolute top-0 left-0 w-full h-full bg-red-400/5 z-10"></div>
                      <div class="as-bilgi-area">
                             <div class="font-semibold">Asansör Bilgileri</div>
                      </div>
                    </div>
                    <div class="flex-1 imzali-form-area">
                        <div class="font-semibold">İmzalı Formlar(Pdf)</div>
                       
                    </div>
                </div>
            </div>
        `;
    $("#tbody1").append(str);
    $(`#plan${plan.id}`).on("click", async function () {
      $(`#plan${plan.id} + div`).slideToggle(200);
      await getPlanByItem(plan);
      setTimeout(async () => {
        if ($(`#plan${plan.id} + div`).css("display") != "none") {
          $(`#plan${plan.id}`).addClass("bg-yellow-100");
          $(this).removeClass("border-b");
        } else {
          $(`#plan${plan.id}`).removeClass("bg-yellow-100");
          $(this).addClass("border-b");
        }
      }, 250);
    });
  }
  if (plans.length == 0) {
    $(`#tbody1`).html(`
      <div class="py-2 flex justify-center items-center font-bold text-black/40">Herhangi bir denetim talebi bulunamadı</div>
      `);
  }
};

const PopupModulBList = async (denetim, plan) => {
  const resptemp = await fetch("/templates/denetim/modul-b-list.html");
  const strTxt = await resptemp.text();
  if (isJson(denetim.modulb_certs)) {
    denetim.modulb_certs = !!denetim ? JSON.parse(denetim.modulb_certs) : null;
  } else {
    denetim.modulb_certs =
      !!denetim && !!denetim.modulb_certs ? denetim.modulb_certs : null;
  }
  let komps = [
    {
      title: "Hız Regülatörleri",
      label: "reg",
      certs:
        !!denetim && !!denetim.modulb_certs ? denetim.modulb_certs.reg : null,
    },
    {
      title: "Frenler",
      label: "fren",
      certs:
        !!denetim && !!denetim.modulb_certs ? denetim.modulb_certs.fren : null,
    },
    {
      title: "Tamponlar",
      label: "tampon",
      certs:
        !!denetim && !!denetim.modulb_certs
          ? denetim.modulb_certs.tampon
          : null,
    },
    {
      title: "UCM & ACOP",
      label: "ucmacop",
      certs:
        !!denetim && !!denetim.modulb_certs
          ? denetim.modulb_certs.ucmacop
          : null,
    },
    {
      title: "Kapı Kilitleri",
      label: "d_kapi_kilit",
      certs:
        !!denetim && !!denetim.modulb_certs
          ? denetim.modulb_certs.d_kapi_kilit
          : null,
    },
    {
      title: "Kabin Kilitleri",
      label: "k_kapi_kilit",
      certs:
        !!denetim && !!denetim.modulb_certs
          ? denetim.modulb_certs.k_kapi_kilit
          : null,
    },
    {
      title: "Kartlar",
      label: "kart",
      certs:
        !!denetim && !!denetim.modulb_certs ? denetim.modulb_certs.kart : null,
    },
    {
      title: "Motorlar",
      label: "motor",
      certs:
        !!denetim && !!denetim.modulb_certs ? denetim.modulb_certs.motor : null,
    },
  ];
  const rendered = Handlebars.compile(strTxt);
  $("body").append(rendered({ komps }));
  $(".btn-close-popmodulb").on("click", function () {
    $(".modulblist").remove();
  });
  $(".btn-kaydet-modB").on("click", async function () {
    let modulb_certs = {
      motor: [],
      kart: [],
      d_kapi_kilit: [],
      k_kapi_kilit: [],
      ucmacop: [],
      tampon: [],
      fren: [],
      reg: [],
    };
    for (let i = 0; i < komps.length; i++) {
      const element = komps[i];
      modulb_certs[element.label] = element.certs;
    }
    await $.ajax({
      type: "POST",
      url: "/denetim/update-modulb-list",
      data: { denetim_id: denetim.id, modulb_certs: modulb_certs },
      dataType: "json",
    });
    $(".modulblist").remove();
    await getPlanByItem(plan);
  });

  const resptemp1 = await fetch("/templates/denetim/modul-b-certlist.html");
  const strTxt1 = await resptemp1.text();

  const rendered1 = Handlebars.compile(strTxt1);
  for (let i = 0; i < komps.length; i++) {
    const komp = komps[i];
    const rendered3 = Handlebars.compile(`
      <div class="inarea-{{label}}">
            {{#if certs}}
              <table class="w-full border-collapse border-t border-gray-200">
                <tbody>
                  {{#each certs}}
                  <tr >
                  <td class="border-b border-gray-200 w-[50px]">{{inc @index}}</td>
                    <td class="border-b border-gray-200">{{cert_no}}</td>
                    <td class="border-b border-gray-200">{{marka}}</td>
                    <td class="border-b border-gray-200">{{tip}}</td>
                    <td class="border-b border-gray-200">{{cert_start_date}}</td>
                    <td class="border-b border-gray-200">{{cert_end_date}}</td>
                    <td class="border-b border-gray-200">
                      <a href="{{cert_filepath}}" target="_blank" class="underline text-blue-500">Belge</a>
                    </td>
                  </tr>
                  {{/each}}
                </tbody>
              </table>
            {{else}} 
              <div class="text-center font-semibold text-black/20 text-[1.2rem]">Sertifika Ekleyin</div>
            {{/if}}
          </div>
      `);
    $(`.inarea-${komp.label}`).html(rendered3({ certs: komp.certs }));
    $(`.btn-add-${komp.label}`).on("click", async function () {
      let postdata = {
        type: "POST",
        url: "/denetim/get-comps",
        data: {},
        dataType: "json",
      };
      let komponenler;
      if (komp.label == "reg") {
        postdata.data = { tablename: "hiz-regulatoru" };
        komponenler = await $.ajax(postdata);
        $("body").append(
          rendered1({
            cert_title: "Hız Regülatörleri",
            label: "reg",
            certs: komponenler,
          })
        );
      } else if (komp.label == "fren") {
        postdata.data = { tablename: "fren" };
        komponenler = await $.ajax(postdata);
        $("body").append(
          rendered1({
            cert_title: "Frenler",
            label: "fren",
            modulb_certs:
              !!denetim && !!denetim.modulb_certs
                ? denetim.modulb_certs.frenler
                : null,
            certs: komponenler,
          })
        );
      } else if (komp.label == "kart") {
        postdata.data = { tablename: "kontrol-kart" };
        komponenler = await $.ajax(postdata);
        $("body").append(
          rendered1({
            cert_title: "Kontrol Kartlar",
            label: "kart",
            modulb_certs:
              !!denetim && !!denetim.modulb_certs
                ? denetim.modulb_certs.kartlar
                : null,
            certs: komponenler,
          })
        );
      } else if (komp.label == "tampon") {
        postdata.data = { tablename: "tampon" };
        komponenler = await $.ajax(postdata);
        $("body").append(
          rendered1({
            cert_title: "Tamponlar",
            label: "tampon",
            modulb_certs:
              !!denetim && !!denetim.modulb_certs
                ? denetim.modulb_certs.tamponlar
                : null,
            certs: komponenler,
          })
        );
      } else if (komp.label == "ucmacop") {
        postdata.data = { tablename: "ucm-acop" };
        komponenler = await $.ajax(postdata);
        $("body").append(
          rendered1({
            cert_title: "UCM & Ascending Car OverSpeed Protection",
            label: "ucm_acop",
            modulb_certs:
              !!denetim && !!denetim.modulb_certs
                ? denetim.modulb_certs.ucm_acoplar
                : null,
            certs: komponenler,
          })
        );
      } else if (komp.label == "d_kapi_kilit") {
        postdata.data = { tablename: "durak-kapi-kilit" };
        komponenler = await $.ajax(postdata);
        $("body").append(
          rendered1({
            cert_title: "Durak Kapı Kilitleri",
            label: "d_kapi_kilit",
            modulb_certs:
              !!denetim && !!denetim.modulb_certs
                ? denetim.modulb_certs.d_kapi_kilitler
                : null,
            certs: komponenler,
          })
        );
      } else if (komp.label == "k_kapi_kilit") {
        postdata.data = { tablename: "kabin-kapi-kilit" };
        komponenler = await $.ajax(postdata);
        $("body").append(
          rendered1({
            cert_title: "Kabin Kapı Kilitleri",
            label: "k_kapi_kilit",
            modulb_certs:
              !!denetim && !!denetim.modulb_certs
                ? denetim.modulb_certs.k_kapi_kilitler
                : null,
            certs: komponenler,
          })
        );
      } else if (komp.label == "motor") {
        postdata.data = { tablename: "motor" };
        komponenler = await $.ajax(postdata);
        $("body").append(
          rendered1({
            cert_title: "Motorlar",
            label: "motor",
            modulb_certs:
              !!denetim && !!denetim.modulb_certs
                ? denetim.modulb_certs.motorlar
                : null,
            certs: komponenler,
          })
        );
      }
      $.each(komponenler, function (index, val) {
        const isChecked =
          !!komp.certs && komp.certs.find((item) => item.id == val.id);
        val["checked"] = !!isChecked;
        $(`[name='${val.id}']`).attr("checked", !!isChecked);
      });
      $(".btn-modulbcertTamam").on("click", function () {
        const formData = $(".seleted-certs").serializeJSON();
        let fullData = $.map(formData, function (val, key) {
          let item = Object.values(komponenler).find((it) => it.id == val);
          return item;
        });
        komp.certs = fullData;
        $(".btn-close-popkomplist").trigger("click");
        $(`.inarea-${komp.label}`).html(rendered3({ certs: komp.certs }));
      });
      $(".btn-close-popkomplist").on("click", function () {
        $(".certlist").remove();
      });
    });
  }
};

const runDate = async () => {
  let date = new Date();
  month = date.getMonth();
  year = date.getFullYear();
  const plans = await getPlansfromDb(month, year);
  makeTable(plans);
  $(`[name='ay']`).val(month.toString());
  $(`[name='yil']`).val(year.toString());
  $(`[name='ay']`).on("change", async () => {
    $("#tbody1").html("");
    month = Number($(`[name='ay']`).val());
    const plans = await getPlansfromDb(month, year);
    makeTable(plans);
  });
  $(`[name='yil']`).on("change", async () => {
    $("#tbody1").html("");
    year = Number($(`[name='yil']`).val());
    const plans = await getPlansfromDb(month, year);
    makeTable(plans);
  });
};
export const DenetimInit = async () => {
  firmalar = await GetFirmalar();
  denetciler = await GetDenetciler();
  // const plans = await getPlansfromDb(3, 2025);
  await runDate();
};
