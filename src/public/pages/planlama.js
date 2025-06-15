import {
  FileValidation,
  Upload,
  pad,
  push,
  getDayName,
  getAyGunuHesapla,
  getMonthName,
} from "./../util/fncs.js";
import { AdresAlanInit, GetIl, GetIlce, GetMahalle } from "../util/adres.js";
let firmalar, denetciler, currDate;
function MakeEmptyAjanda(month, year) {
  var ayGunuHesapla = getAyGunuHesapla(year, month);
  $(".ajanda").html("");
  for (let i = 1; i <= ayGunuHesapla; i++) {
    const item = {
      day: i,
      month,
      year,
      dayName: getDayName(year, month, i),
      monthName: getMonthName(year, month, i),
    };
    const stri = `
        <div class="date${item.day}-area">
                        <div id="date${item.day}" class="flex bg-blue-100 px-2 py-1 border-b border-gray-300 sticky top-0 z-10">
                            <div class="font-semibold">${item.day} ${item.monthName} ${item.year}</div>
                            <div class="flex-1"></div>
                            <div class="font-semibold">${item.dayName}</div>
                        </div>
                        <div  class="flex  p-1 space-x-1 border-b border-gray-200"  style="display: none;">
                            <div class="w-1/2 border border-gray-200">
                                <div class="bg-gray-100  py-1  border-b border-gray-200 flex items-center px-2">
                                    <div class="text-[0.9rem] font-semibold">Sabah (08:30-12:00)</div>
                                    <div class="flex-1"></div>
                                    <div class="flex items-center">
                                        <a title="Yeni plan ekle" data-bas="sabah" class="new-plan-add tio cursor-pointer select-none p-1 hover:bg-black/10 text-[1.2rem] rounded-full flex items-center justify-center">add</a>
                                    </div>
                                </div>
                                <div class="p-2 ">
                                         <ul class="sabah"></ul>
                                </div>
                            </div>
                            <div class="w-1/2 border border-gray-200">
                               <div class="bg-gray-100  py-1  border-b border-gray-200 flex items-center px-2">
                                    <div class="text-[0.9rem] font-semibold">Öğle (13:30-18:00)</div>
                                    <div class="flex-1"></div>
                                    <div class="flex items-center">
                                        <a title="Yeni plan ekle" data-bas="ogle" class="new-plan-add tio cursor-pointer select-none p-1 hover:bg-black/10 text-[1.2rem] rounded-full flex items-center justify-center">add</a>
                                    </div>
                                </div>
                                <div class="p-2 "> 
                                    <ul class="ogle"></ul>
                                </div>
                            </div>
                        </div>
                    </div>
        `;
    if (item.dayName != "Pazar") {
      $(".ajanda").append(stri);
      $(`#date${item.day}`).on("click", function () {
        $(`#date${item.day} + div`).slideToggle();
      });
      $(`#date${item.day} + div .new-plan-add`).on("click", function () {
        const bas =
          $(this).attr("data-bas") == "ogle"
            ? "Öğle(13:30-18:00)"
            : "Sabah(08:30-12:00)";
        SavePopupTemp({
          save_or_update: "Ekle",
          btn_ad: "Kaydet",
          hafta_gun_adi: item.dayName,
          denetim_tarih: `${pad(item.day, 2)}.${pad(item.month, 2)}.${
            item.year
          }`,
          baslangic: $(this).attr("data-bas"),
          baslagic_text: bas,
        });
      });
    } else {
      $(".ajanda").append(`
            <div class="text-center font-semibold py-1 bg-red-100 my-2">
            ${item.day} ${item.monthName} ${item.year} Pazar
            </div>
                `);
    }
  }
}
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
async function PlanlariYerlestir(month, year) {
  //Prev month last day should not "pazar"
  month = Number(month) + 1;
  let planlar = await getPlansfromDb(month, year);
  let prevMonthLastDayPlans = await getLastDayOfMonthPlans(month, year);
  const newPlanlar = {};
  $.map(planlar, function (item, key) {
    const denetimTarihArry = item.denetim_tarih.split(".");
    const day = Number(denetimTarihArry[0]);
    const month = Number(denetimTarihArry[1]);
    const year = Number(denetimTarihArry[2]);
    item.dayName = getDayName(year, month, day);
    push(newPlanlar, item);
    if (item.modul === "Modul E" || item.modul == "Modul H1") {
      if (item.baslangic == "sabah") {
        push(newPlanlar, { ...item, dayName: item.dayName, baslangic: "ogle" });
      } else {
        const dayName = getDayName(year, month, day + 1);
        if (dayName == "Pazar") {
          push(newPlanlar, {
            ...item,
            dayName: item.dayName,
            baslangic: "sabah",
            denetim_tarih: `${pad(day + 2, 2)}.${pad(month, 2)}.${year}`,
          });
        } else {
          push(newPlanlar, {
            ...item,
            dayName: item.dayName,
            baslangic: "sabah",
            denetim_tarih: `${pad(day + 1, 2)}.${pad(month, 2)}.${year}`,
          });
        }
      }
    } else if (item.modul == "Modul H") {
      if (item.baslangic == "sabah") {
        push(newPlanlar, { ...item, dayName: item.dayName, baslangic: "ogle" });
        const dayName = getDayName(year, month, day + 1);
        if (dayName == "Pazar") {
          push(newPlanlar, {
            ...item,
            dayName: item.dayName,
            denetim_tarih: `${pad(day + 2, 2)}.${pad(month, 2)}.${year}`,
          });
        } else {
          push(newPlanlar, {
            ...item,
            dayName: item.dayName,
            denetim_tarih: `${pad(day + 1, 2)}.${pad(month, 2)}.${year}`,
          });
        }
      } else {
        const dayName = getDayName(year, month, day + 1);
        if (dayName == "Pazar") {
          push(newPlanlar, {
            ...item,
            dayName: item.dayName,
            baslangic: "sabah",
            denetim_tarih: `${pad(day + 2, 2)}.${pad(month, 2)}.${year}`,
          });
          push(newPlanlar, {
            ...item,
            dayName: item.dayName,
            baslangic: "ogle",
            denetim_tarih: `${pad(day + 2, 2)}.${pad(month, 2)}.${year}`,
          });
        } else {
          push(newPlanlar, {
            ...item,
            baslangic: "sabah",
            dayName: item.dayName,
            denetim_tarih: `${pad(day + 1, 2)}.${pad(month, 2)}.${year}`,
          });
          push(newPlanlar, {
            ...item,
            dayName: item.dayName,
            baslangic: "ogle",
            denetim_tarih: `${pad(day + 1, 2)}.${pad(month, 2)}.${year}`,
          });
        }
      }
    }
  });
  $.map(prevMonthLastDayPlans, function (item, key) {
    const denetimTarihArry = item.denetim_tarih.split(".");
    let day = Number(denetimTarihArry[0]);
    let month = Number(denetimTarihArry[1]);
    let year = Number(denetimTarihArry[2]);
    let dayName = getDayName(year, month, day + 1);
    if (month + 1 <= 12) {
      dayName = getDayName(year, month + 1, 1);
      month = month + 1;
      day = 1;
    } else {
      dayName = getDayName(year + 1, 1, 1);
      year = year + 1;
      day = 1;
      month = 1;
    }
    if (
      (item.modul === "Modul E" || item.modul === "Modul H1") &&
      item.baslangic == "ogle"
    ) {
      if (dayName == "Pazar") {
        push(newPlanlar, {
          ...item,
          dayName,
          baslangic: "sabah",
          denetim_tarih: `${pad(day + 1, 2)}.${pad(month, 2)}.${year}`,
        });
      } else {
        push(newPlanlar, {
          ...item,
          dayName,
          baslangic: "sabah",
          denetim_tarih: `${pad(day, 2)}.${pad(month, 2)}.${year}`,
        });
      }
    }
    if (item.modul === "Modul H") {
      if (item.baslangic == "sabah") {
        if (dayName == "Pazar") {
          push(newPlanlar, {
            ...item,
            dayName,
            baslangic: "sabah",
            denetim_tarih: `${pad(day + 1, 2)}.${pad(month, 2)}.${year}`,
          });
        } else {
          push(newPlanlar, {
            ...item,
            dayName,
            baslangic: "sabah",
            denetim_tarih: `${pad(day, 2)}.${pad(month, 2)}.${year}`,
          });
        }
      } else {
        if (dayName == "Pazar") {
          push(newPlanlar, {
            ...item,
            dayName,
            baslangic: "sabah",
            denetim_tarih: `${pad(day + 1, 2)}.${pad(month, 2)}.${year}`,
          });
          push(newPlanlar, {
            ...item,
            dayName,
            baslangic: "ogle",
            denetim_tarih: `${pad(day + 1, 2)}.${pad(month, 2)}.${year}`,
          });
        } else {
          push(newPlanlar, {
            ...item,
            dayName,
            baslangic: "sabah",
            denetim_tarih: `${pad(day, 2)}.${pad(month, 2)}.${year}`,
          });
          push(newPlanlar, {
            ...item,
            hafta_gun_adi: dayName,
            baslangic: "ogle",
            denetim_tarih: `${pad(day, 2)}.${pad(month, 2)}.${year}`,
          });
        }
      }
    }
  });
  $(".sabah").each(function () {
    $(this).html("");
  });
  $(".ogle").each(function () {
    $(this).html("");
  });
  $.map(newPlanlar, function (item, key) {
    const denetimTarihArry = item.denetim_tarih.split(".");
    const day = Number(denetimTarihArry[0]);
    const month = Number(denetimTarihArry[1]);
    const year = Number(denetimTarihArry[2]);
    $(`.date${day}-area .${item.baslangic}`).append(`
  <li class="flex w-full py-1">
      <div class="flex-1  flex items-center">
         Pln ${item.id} /  ${item.modul} -  ${item.denetci} - ${item.as_firma_kisa_ad} - ${item.as_ilce}/ ${item.as_il}
      </div>
      <div class="flex items-center space-x-1">
          <a href="${item.yapi_ruhsati}" download="yapi_ruhsati" class="underline text-blue-600">Yapı Ruhsatı</a>
          <a title="Planı Düzenle" class="plan${key} tio cursor-pointer select-none p-1 hover:bg-black/10 text-[1.2rem] rounded-full flex items-center justify-center">edit</a>
          <a title="Planı Sil" class="plan-de${key} tio cursor-pointer select-none p-1 hover:bg-black/10 text-[1.2rem] rounded-full flex items-center justify-center">delete</a>
      </div>
  </li>
  `);
    $(`.plan${key}`).on("click", function () {
      console.log(item);
      const bas =
        item.baslagic == "ogle" ? "Öğle(13:30-18:00)" : "Sabah(08:30-12:00)";
      SavePopupTemp({
        ...item,
        save_or_update: "Güncelle",
        btn_ad: "Güncelle",
        hafta_gun_adi: item.dayName,
        baslagic_text: bas,
      });
    });
    $(`.plan-de${key}`).on("click", async function () {
      await deletePlanToDb({ id: item.id });
      await PlanlariYerlestir(currDate.getMonth() - 1, currDate.getFullYear());
    });
    $(`#date${day}  + div`).slideDown();
  });
}
async function getLastDayOfMonthPlans(month, year) {
  let last_date = "01.03.2025";
  let dateIslem = new Date(year, month, 1);
  dateIslem.setMonth(dateIslem.getMonth() - 1);
  const lastDay = getAyGunuHesapla(
    dateIslem.getFullYear(),
    dateIslem.getMonth() + 1
  );
  dateIslem.setDate(lastDay);
  const dayName = getDayName(
    dateIslem.getFullYear(),
    dateIslem.getMonth() + 1,
    dateIslem.getDate()
  );

  if (dayName == "Pazar") {
    dateIslem.setDate(dateIslem.getDate() - 1);
  }
  last_date = `${pad(dateIslem.getDate(), 2)}.${pad(
    dateIslem.getMonth() + 1,
    2
  )}.${dateIslem.getFullYear()}`;
  const planlamalar = await $.ajax({
    type: "POST",
    url: "/planlama/get-lastday-plans",
    data: { last_date },
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
async function getPlansfromDb(month, year) {
  let start_date = ""; //;"01.03.2025";
  let end_date = ""; //;"07.03.2025";
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
    url: "/planlama/get-planlamalar",
    data: { start_date, end_date },
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
async function GetDenetciName(data) {
  return $.ajax({
    type: "POST",
    url: "/personel/get-personel-name",
    data: JSON.stringify(data),
    dataType: "json",
    contentType: "application/json",
  });
}
async function GetFirma(data) {
  return $.ajax({
    type: "POST",
    url: "/as-firma/get-firma-name",
    data: JSON.stringify(data),
    dataType: "json",
    contentType: "application/json",
  });
}
async function addPlanToDb(data) {
  $("body").css("overflow", "hidden");
  $(".sppin-area").removeClass("hidden");
  $(".sppin-area").addClass("flex");
  let newData = { ...data };
  const { il_adi } = await GetIl(newData.il_id);
  if (!!il_adi) {
    newData.il_adi = il_adi;
    delete newData.il_id;
  }
  const { ilce_adi } = await GetIlce(newData.ilce_id);
  if (!!ilce_adi) {
    newData.ilce_adi = ilce_adi;
    delete newData.ilce_id;
  }
  const { mahalle_adi } = await GetMahalle(newData.mahalle_id);
  if (!!mahalle_adi) {
    newData.mahalle_adi = mahalle_adi;
    delete newData.mahalle_id;
  }
  newData.montaj_adresi = `${newData.mahalle_adi} ${data.adres} ${ilce_adi}/${il_adi}`;

  const { name } = await GetDenetciName({
    personel_id: newData.denetci_id,
  });
  if (!!name) {
    newData.denetci_adi = name;
    delete newData.denetci_id;
  }
  const firmaData = await GetFirma({
    as_firma_id: newData.as_firma_id,
  });
  if (!!firmaData) {
    newData.as_firma_adi = firmaData.unvan;
    newData.as_firma_adresi = firmaData.adres;
    newData.as_firma_posta_kod = firmaData.pk;
    newData.as_firma_tel = firmaData.telefon;
    newData.as_firma_vergi_no = firmaData.vergi_no;
    newData.as_firma_muhendis = firmaData.son_kontrolcu;
    newData.as_firma_sahibi = firmaData.sirket_muduru;
    delete newData.as_firma_id;
  }
  newData = $.map(newData, function (val, key) {
    return {
      search: `{${key}}`,
      text: `${val}`,
      type: "text",
    };
  });
  console.log("newData", newData);
  const resp = await $.ajax({
    type: "POST",
    url: "/planlama/denetim-formlar",
    data: JSON.stringify(newData),
    dataType: "json",
    contentType: "application/json",
  });
  const { formpaths, formpathsfolder } = resp;
  data.formpaths = JSON.stringify(formpaths);
  data.formpathsfolder = formpathsfolder;

  await $.ajax({
    type: "POST",
    url: "/planlama/add",
    data: { ...data },
    dataType: "json",
  });
  $("body").css("overflow", "auto");
  $(".sppin-area").addClass("hidden");
  $(".sppin-area").removeClass("flex");
  $(".save-popup .close").trigger("click");
}
async function updatePlanToDb(data) {
  $("body").css("overflow", "hidden");
  $(".sppin-area").removeClass("hidden");
  $(".sppin-area").addClass("flex");
  let newData = { ...data };
  const { il_adi } = await GetIl(newData.il_id);
  if (!!il_adi) {
    newData.il_adi = il_adi;
    delete newData.il_id;
  }
  const { ilce_adi } = await GetIlce(newData.ilce_id);
  if (!!ilce_adi) {
    newData.ilce_adi = ilce_adi;
    delete newData.ilce_id;
  }
  const { mahalle_adi } = await GetMahalle(newData.mahalle_id);
  if (!!mahalle_adi) {
    newData.mahalle_adi = mahalle_adi;
    delete newData.mahalle_id;
  }
  newData.montaj_adresi = `${newData.mahalle_adi} ${data.adres} ${ilce_adi}/${il_adi}`;

  const { name } = await GetDenetciName({
    personel_id: newData.denetci_id,
  });
  if (!!name) {
    newData.denetci_adi = name;
    delete newData.denetci_id;
  }
  const firmaData = await GetFirma({
    as_firma_id: newData.as_firma_id,
  });
  if (!!firmaData) {
    newData.as_firma_adi = firmaData.unvan;
    newData.as_firma_adresi = firmaData.adres;
    newData.as_firma_posta_kod = firmaData.pk;
    newData.as_firma_tel = firmaData.telefon;
    newData.as_firma_vergi_no = firmaData.vergi_no;
    newData.as_firma_muhendis = firmaData.son_kontrolcu;
    newData.as_firma_sahibi = firmaData.sirket_muduru;
    delete newData.as_firma_id;
  }
  newData = $.map(newData, function (val, key) {
    return {
      search: `{${key}}`,
      text: `${val}`,
      type: "text",
    };
  });
  const resp = await $.ajax({
    type: "POST",
    url: "/planlama/denetim-formlar",
    data: JSON.stringify(newData),
    dataType: "json",
    contentType: "application/json",
  });

  if (!!resp) {
    let { formpaths, formpathsfolder } = resp;
    console.log(resp);
    data.formpaths = JSON.stringify(formpaths);
    data.formpathsfolder = formpathsfolder;
    console.log(data);
    await $.ajax({
      type: "POST",
      url: "/planlama/update",
      data: { ...data },
      dataType: "json",
    });
    $(".save-popup .close").trigger("click");
  }
  $("body").css("overflow", "auto");
  $(".sppin-area").addClass("hidden");
  $(".sppin-area").removeClass("flex");
}
async function deletePlanToDb(data) {
  await $.ajax({
    type: "POST",
    url: "/planlama/delete",
    data: { ...data },
    dataType: "json",
  });
}
async function SavePopupTemp(data) {
  if (!!data) {
    const resp = await fetch(`/templates/planlama/save.html`);
    const content = await resp.text();
    $("#save-pop").html("");
    const rendered = Handlebars.compile(content);
    $("#save-pop").html(rendered({ ...data }));
    $(".save-popup .close").on("click", async function () {
      await SavePopupTemp();
      PlanlariYerlestir(currDate.getMonth() - 1, currDate.getFullYear());
    });
    if (!!data.risk) {
      data.risk = JSON.parse(data.risk);
      $(`[type='checkbox'][name='risk[makdaire]']`).attr(
        "checked",
        !!JSON.parse(data.risk.makdaire)
      );
      $(`[type='checkbox'][name='risk[kuyudip]']`).attr(
        "checked",
        !!JSON.parse(data.risk.kuyudip)
      );
      $(`[type='checkbox'][name='risk[kabinust]']`).attr(
        "checked",
        !!JSON.parse(data.risk.kabinust)
      );
    }
    $.map(firmalar, function (val, key) {
      $("[name='as_firma_id']").append(
        `<option value="${val.id}">${val.kisa_ad}</option>`
      );
    });
    $.map(denetciler, function (val, key) {
      $("[name='denetci_id']").append(
        `<option value="${val.id}">${val.name}</option>`
      );
    });
    await AdresAlanInit();
    if (data.save_or_update == "Güncelle") {
      $(`.btn-bsvr-sec`).css("display", "none");
      $(`[name='il_id']`).val(data.il_id);
      $(`[name='il_id']`).trigger("change");
      setTimeout(() => {
        $(`[name='ilce_id']`).val(data.ilce_id);
        $(`[name='ilce_id']`).trigger("change");
        setTimeout(() => {
          $(`[name='mahalle_id']`).val(data.mahalle_id);
        }, 200);
      }, 200);
      $(`[name='as_firma_id']`).val(data.as_firma_id);
      $(`[name='modul']`).val(data.modul);
      $(`[name='denetci_id']`).val(data.denetci_id);
      $(`[name='as_seri_no']`).val(data.as_seri_no);
      $(`[name='adres']`).val(data.adres);
      $(`[name='ada']`).val(data.ada);
      $(`[name='parsel']`).val(data.parsel);
      $(`[name='elek_hidrolik']`).val(data.elek_hidrolik);
      $(`[name='makine_konum']`).val(data.makine_konum);
      $(`[name='durak_sayisi']`).val(data.durak_sayisi);
      $(`[name='seyir_mesafesi']`).val(data.seyir_mesafesi);
      $(`[name='beyan_yuku']`).val(data.beyan_yuku);
      $(`[name='tam_yil']`).val(data.tam_yil);
      $(`[name='kisi_sayisi']`).val(data.kisi_sayisi);
      $(`[name='yapi_ruhsat_no']`).val(data.yapi_ruhsat_no);
      $(`[name='yapi_sahibi_adi']`).val(data.yapi_sahibi_adi);
      $(`[name='yapi_ruhsati']`).val(data.yapi_ruhsati);
      $(`#yapi_ruhsati .indir-link`).removeClass("hidden");
      $(`#yapi_ruhsati .indir-link`).attr("href", data.yapi_ruhsati);
      const nameFile = data.yapi_ruhsati.split("/").pop();
      $(`#yapi_ruhsati .indir-link`).attr("download", nameFile);

      const pathsLiks = JSON.parse(data.formpaths);
      $("#files-links").html("");
      const Links = Object.values(pathsLiks)
        .map((link) => {
          const filenameDocx = link.split("/").pop();
          const pdfLink = link.replace(".docx", ".pdf");
          const filenamePdf = pdfLink.split("/").pop();
          return {
            filenamePdf,
            filenameDocx,
            pdfLink,
            docxLink: link,
          };
        })
        .sort(
          (a, b) => a.filenameDocx.match(/\d+/) - b.filenameDocx.match(/\d+/)
        );
      for (let i = 0; i < Links.length; i++) {
        const item = Links[i];
        $("#files-links").append(`
          <div>
              <a href="${item.pdfLink}" class="underline text-blue-500" download="${item.filenamePdf}" target="_blank">${item.filenamePdf}</a>
          </div>
          `);
      }
    } else {
      $(`#yapi_ruhsati .indir-link`).addClass("hidden");
      $(`.btn-bsvr-sec`).css("display", "flex");
      //Basvuru Pop Area
      $(`.btn-bsvr-sec`).on("click", async function () {
        const resp = await fetch(`/templates/planlama/basvurular.html`);
        const content = await resp.text();
        $("body").append(content);
        $(".btn-close-bsvr-sec").on("click", function () {
          $(".bsvr-sec-pop").remove();
        });
      });
    }
    $(".save-popup .savebtn").on("click", async function () {
      const formData = $(".save-popup .plan-form").serializeJSON();
      const isEmpty = Object.values(formData).some((a) => a == "");
      if (!!isEmpty) {
        $(`#yapi_ruhsati .msg-area`).html("Tüm alanları doğru biçimde doldur!");
      } else {
        $(`#yapi_ruhsati .msg-area`).html("");
        if (
          !!$(`#yapi_ruhsati #file_yapi_ruhsati`)[0] &&
          $(`#yapi_ruhsati #file_yapi_ruhsati`)[0].files.length > 0
        ) {
          const uld = new Upload(
            $(`#yapi_ruhsati #file_yapi_ruhsati`)[0].files[0]
          );
          const itemFilename = formData.yapi_ruhsati
            .split("/")
            .pop()
            .split(".");
          uld.doUpload(
            "/uploads/planlama/yapi_ruhsat/",
            itemFilename[0]
          );
        }
        if (!!formData.risk) {
          formData.risk = JSON.stringify(formData.risk);
        }
        if (data.save_or_update == "Güncelle") {
          await updatePlanToDb({
            id: data.id,
            denetim_tarih: data.denetim_tarih,
            baslangic: data.baslangic,
            ...formData,
            formpathsfolder: data.formpathsfolder,
            status: data.status,
          });
        } else {
          await addPlanToDb({
            denetim_tarih: data.denetim_tarih,
            baslangic: data.baslangic,
            status: "Denetim Bekleniyor",
            ...formData,
          });
        }
      }
    });

    $(`#yapi_ruhsati button`).on("click", function () {
      $(`#yapi_ruhsati #file_yapi_ruhsati`).trigger("click");
    });
    $(`#yapi_ruhsati #file_yapi_ruhsati`).on("change", async function () {
      $(`#yapi_ruhsati .file-msg`).html("");
      if (!!$(this)[0].files[0]) {
        const result = FileValidation($(this)[0].files[0], 5);
        if (!!result.msg) {
          $(`#yapi_ruhsati .file-msg`).html(result.msg);
          $(this).val("");
        } else {
          $(`#yapi_ruhsati .file-msg`).html($(this)[0].files[0].name);
          $.map(firmalar, function (item) {
            if (item.id == $(`[name='as_firma_id']`).val()) {
              let serino = $(`[name='as_seri_no']`).val();
              serino = serino.trim().replaceAll(/[\/&?=]/g, "-");
              const file_type = $(`#yapi_ruhsati #file_yapi_ruhsati`)[0]
                .files[0].name.split(".")
                .pop();
              $(`#yapi_ruhsati [name='yapi_ruhsati']`).val(
                `/uploads/planlama/yapi_ruhsat/${item.kisa_ad}_${serino}_yapi_ruhsat.${file_type}`
              );
            }
          });
        }
      }
    });
    if ($(".save-popup [name='modul']").val() !== "Modul G") {
      $(".save-popup .risk-area").css("display", "none");
    } else {
      $(".save-popup  .risk-area").css("display", "block");
    }
    $(".save-popup [name='modul']").on("change", function () {
      console.log($(this).val());
      $("[name='denetci_id'").html("");
      if (
        $(this).val().split(" ")[1] == "E" ||
        $(this).val().split(" ")[1] == "H1"
      ) {
        $.map(denetciler, (val) => {
          if (val.modul_atama == "Modul B-F-G-E-D-H1") {
            $("[name='denetci_id'").append(
              `<option value="${val.id}">${val.name}</option>`
            );
          }
        });
      } else {
        $.map(denetciler, (val) => {
          $("[name='denetci_id'").append(
            `<option value="${val.id}">${val.name}</option>`
          );
        });
      }

      if ($(this).val() !== "Modul G") {
        $(".save-popup .risk-area").css("display", "none");
      } else {
        $(".save-popup  .risk-area").css("display", "block");
      }
    });
  } else {
    $("#save-pop").html("");
  }
}
async function GetSelectedMonth(month, year) {
  MakeEmptyAjanda(Number(month) + 1, year);
  firmalar = await GetFirmalar();
  denetciler = await GetDenetciler();
  PlanlariYerlestir(currDate.getMonth() - 1, currDate.getFullYear());
}
export const PlanlamaInit = async () => {
  currDate = new Date();
  $(".next-month").on("click", function () {
    currDate.setMonth(currDate.getMonth() + 1);
    $(".show-month-year").html(
      `${getMonthName(
        currDate.getFullYear(),
        currDate.getMonth() + 1,
        currDate.getDate()
      )} - ${currDate.getFullYear()}`
    );
    GetSelectedMonth(currDate.getMonth(), currDate.getFullYear());
  });
  $(".prev-month").on("click", function () {
    currDate.setMonth(currDate.getMonth() - 1);
    $(".show-month-year").html(
      `${getMonthName(
        currDate.getFullYear(),
        currDate.getMonth() + 1,
        currDate.getDate()
      )} - ${currDate.getFullYear()}`
    );
    GetSelectedMonth(currDate.getMonth(), currDate.getFullYear());
  });
  $(".curr-month").on("click", function () {
    currDate = new Date();
    $(".show-month-year").html(
      `${getMonthName(
        currDate.getFullYear(),
        currDate.getMonth() + 1,
        currDate.getDate()
      )} - ${currDate.getFullYear()}`
    );
    GetSelectedMonth(currDate.getMonth(), currDate.getFullYear());
  });
  $(".show-month-year").html(
    `${getMonthName(
      currDate.getFullYear(),
      currDate.getMonth() + 1,
      currDate.getDate()
    )} - ${currDate.getFullYear()}`
  );
  GetSelectedMonth(currDate.getMonth(), currDate.getFullYear());
};
