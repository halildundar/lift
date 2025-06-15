import {
  GetIl,
  GetIlce,
  GetMahalle,
  AdresAlanInit,
  SetAdresData,
} from "../../util/adres.js";
import { Upload, pad } from "../../util/fncs.js";
// import { MAINHOST } from "../constants.js";
import { user } from "../../router.js";
Handlebars.registerHelper("StatusDataForCol", function (v1, options) {
  if (!!v1) {
    const statuss = JSON.parse(v1);
    return statuss[statuss.length - 1].title;
  }
  return "Yeni Kayıt";
});
Handlebars.registerHelper("NumberToDate", function (v1, options) {
  if (!!v1) {
    const date = new Date(Number(v1));
    return `${pad(date.getDate(), 2)}.${pad(
      date.getMonth() + 1,
      2
    )}.${date.getFullYear()} - ${pad(date.getHours(), 2)}:${pad(
      date.getMinutes(),
      2
    )}`;
  }
  return v1;
});
let firmalar;
let basvurular;
const GetBasvurular = async () => {
  const datas = await $.ajax({
    type: "POST",
    url: "/danis_basvuru/get-list",
    data: { danisman_id: user.id },
    dataType: "json",
  });
  let newItem = [];

  $.map(datas, (val) => newItem.push(val));
  return newItem;
};
async function GetFirmalar() {
  const firmalar = await $.ajax({
    type: "POST",
    url: "/danis_firma/get-list",
    data: { danisman_id: user.id },
    dataType: "json",
  });
  return firmalar;
}

const getTemp = async (htmlpath) => {
  const respPlanHtml = await fetch("/templates/" + htmlpath);
  const str = await respPlanHtml.text();
  let rendered = Handlebars.compile(str);
  return rendered;
};
const getOrtakFiles = async (danisman_id) => {
  const resp = await $.ajax({
    type: "POST",
    url: "/danis_basvuru/get-ortak-files",
    data: { danisman_id },
    dataType: "json",
  });
  return resp;
};
const fileUploadsItem = (basvuru, classname) => {
  let folderpath =
    "/uploads/danisman/" +
    basvuru.danisman_id +
    "/basvurular/" +
    basvuru.foldername;
  $(`.basvuru${basvuru.id}  .file${classname}`).on("click", function () {
    $(`.basvuru${basvuru.id}   .file_file${classname}`).val("");
    $(`.basvuru${basvuru.id}   .file_file${classname}`).trigger("click");
  });
  $(`.basvuru${basvuru.id}  .file_file${classname}`).on(
    "change",
    async function () {
      let file = $(this).get(0).files[0];
      let fileuzanti = file.name.split(".").pop();
      let filename = `${classname}.${fileuzanti}`;
      var upload = new Upload(file);
      const { msg } = await upload.doUpload(
        `${folderpath}/`,
        classname
      );
      if (!!msg && msg == "Ok!") {
        basvuru.folders[classname] = `${folderpath}/${filename}`;
        await $.ajax({
          type: "POST",
          url: "/danis_basvuru/update",
          data: { id: basvuru.id, folders: JSON.stringify(basvuru.folders) },
          dataType: "json",
        });
        let newBasvuru = await $.ajax({
          type: "POST",
          url: "/danis_basvuru/get-basvuru",
          data: { id: basvuru.id },
          dataType: "json",
        });
        basvurular = basvurular.map((item) => {
          if (item.id == newBasvuru.id) {
            return newBasvuru;
          }
          return item;
        });
        newBasvuru.folders = JSON.parse(newBasvuru.folders);
        await innerMakeTable(newBasvuru);
      }
    }
  );
};
const duzenleDurumlar = (basvuru) => {
  const statuss = JSON.parse(basvuru.status);
  if (!!statuss) {
    const isIniBas = statuss.some((item) => item.title == "Başvuru Yapıldı");
    if (isIniBas) {
      $(`.basvuru${basvuru.id} .init-area`).css("display", "none");
      $(`.basvuru${basvuru.id} .past-area`).css("display", "flex");
    }
  }
  if (basvuru.duzeltme_durum == 0) {
    $(`.basvuru${basvuru.id} .btn-duzenle`).css("display", "none");
  } else {
    $(`.basvuru${basvuru.id} .btn-duzenle`).on("click", async function () {
      $(".pop-add").css("display", "flex");
      $(`[name='firma_id']`).val(basvuru.firma_id);
      $(`[name='modul']`).val(basvuru.modul);
      $(`[name='modul']`).trigger("change");
      $(`[name='yapi_ruhsat_no']`).val(basvuru.yapi_ruhsat_no);
      $(`[name='yapi_sahibi_adi']`).val(basvuru.yapi_sahibi_adi);
      SetAdresData(basvuru.il_id, basvuru.ilce_id, basvuru.mahalle_id);
      $(`[name='adres']`).val(basvuru.adres);
      $(`[name='ada']`).val(basvuru.ada);
      $(`[name='parsel']`).val(basvuru.parsel);
      $(`[name='as_seri_no']`).val(basvuru.as_seri_no);
      $(`[name='elek_hid']`).val(basvuru.elek_hid);
      $(`[name='mak_dairesi']`).val(basvuru.mak_dairesi);
      $(`[name='aski_tip']`).val(basvuru.aski_tip);
      $(`[name='durak_sayisi']`).val(basvuru.durak_sayisi);
      $(`[name='seyir_mesafesi']`).val(basvuru.seyir_mesafesi);
      $(`[name='beyan_yuku']`).val(basvuru.beyan_yuku);
      $(`[name='kisi_sayisi']`).val(basvuru.kisi_sayisi);
      if (basvuru.modul == "Modul G" || basvuru.modul == "Tasarım İnceleme") {
        let risk = JSON.parse(basvuru.risk);
        $(`[type='checkbox'][name="risk[mak_dairesi]"]`).val(
          risk["mak_dairesi"]
        );
        $(`[type='checkbox'][name="risk[mak_dairesi]"]`).prop(
          "checked",
          risk["mak_dairesi"] == "on"
        );
        $(`[type='checkbox'][name="risk[kabin_ust]"]`).val(risk["kabin_ust"]);
        $(`[type='checkbox'][name="risk[kabin_ust]"]`).prop(
          "checked",
          risk["kabin_ust"] == "on"
        );
        $(`[type='checkbox'][name="risk[kuyu_dibi]"]`).val(risk["kuyu_dibi"]);
        $(`[type='checkbox'][name="risk[kuyu_dibi]"]`).prop(
          "checked",
          risk["kuyu_dibi"] == "on"
        );
      }
      $(`.btn-bsv-kaydet`).css("display", "none");
      $(`.btn-bsv-guncelle`).css("display", "block");
      $(`.btn-bsv-sil`).css("display", "block");
      $(".popkaydet-titil").html("Başvuru Düzenle");

      $(`.btn-bsv-guncelle`).on("click", async function () {
        let formData = $(".ekle-form").serializeJSON();
        formData.risk = JSON.stringify(formData.risk);
        await $.ajax({
          type: "POST",
          url: "/danis_basvuru/update",
          data: {
            id: basvuru.id,
            ...formData,
          },
          dataType: "json",
        });
        $(".btn-pop-close").trigger("click");
        BasvuruInit();
      });
    });
  }
};
const basvuruFirstGonder = (basvuru) => {
  $(`.basvuru${basvuru.id} #msj-area-bsvuru-yap`).val("");
  $(`.basvuru${basvuru.id} .btn-first-gonder`).on("click", async () => {
    let sendenddata = [
      {
        title: "Başvuru Yapıldı",
        subtitle: "Kabul Bekleniyor",
        user: user.id,
        username: user.name,
        usertype: "Müşteri", //Müşteri or Artıdoksan
        date: new Date().getTime().toString(),
        mesaj: $(`.basvuru${basvuru.id} #msj-area-bsvuru-yap`).val(),
      },
    ];
    await $.ajax({
      type: "POST",
      url: "/danis_basvuru/update",
      data: {
        id: basvuru.id,
        duzeltme_durum: 0,
        status: JSON.stringify(sendenddata),
      },
      dataType: "json",
    });
    BasvuruInit();
  });
};
const makeDenetimSurec = async (basvuru) => {
  let rendered = await getTemp("danisman/basvurular/denetim-surec.html");
  let statuss = JSON.parse(basvuru.status);
  $(`.basvuru${basvuru.id} .denetim-surec`).html(
    rendered({
      statuss: statuss,
    })
  );

  $(`.basvuru${basvuru.id} .denetim-surec li`).on("click", function (e) {
    e.stopPropagation();
    $.each($(`.basvuru${basvuru.id} .denetim-surec li`), function () {
      $(this).css("background-color", "");
    });
    $(this).css("background-color", "rgba(170,235,37,0.3)");
    const statussItem = JSON.parse(basvuru.status)[$(this).attr(`data-inde`)];
    $(`.basvuru${basvuru.id} .past-area .mesajlar`).html(statussItem.mesaj);
    $(`.basvuru${basvuru.id} .past-area .gndr-btn`).on(
      "click",
      async function () {
        const sttss = JSON.parse(basvuru.status);
        const newSurec = {
          title: "Başvuru Düzenlendi",
          subtitle: "Kabul Bekleniyor",
          user: user.id,
          username: user.name,
          usertype: "Müşteri", //Müşteri or Artıdoksan
          date: new Date().getTime().toString(),
          mesaj: "",
        };
        sttss.push(newSurec);
        await $.ajax({
          type: "POST",
          url: "/danis_basvuru/update",
          data: {
            id: basvuru.id,
            status: JSON.stringify(sttss),
            duzeltme_durum: 0,
          },
          dataType: "json",
        });
        BasvuruInit();
      }
    );
  });
  $(
    `.basvuru${basvuru.id} .denetim-surec li:nth-of-type(${
      JSON.parse(basvuru.status).length
    })`
  ).trigger("click");
  // $("body").on("click", function () {
  //   $.each($(`.basvuru${basvuru.id} .denetim-surec li`), function () {
  //     $(this).css("background-color", "");
  //   });
  // });
};
const innerMakeTable = async (basvuru) => {
  let rendered = await getTemp("danisman/basvurular/dosyalar.html");
  $(`.basvuru${basvuru.id} .dosyalar`).html(
    rendered({
      folders: basvuru.folders,
      duzeltme_durum: basvuru.duzeltme_durum,
    })
  );

  $(`.basvuru${basvuru.id}  .fileproje_sozlesme`).on(
    "click",
    async function () {
      const { files } = await getOrtakFiles(basvuru.danisman_id);
      openOrtak(basvuru, ".fileproje_sozlesme", files);
    }
  );
  $(`.basvuru${basvuru.id}  .filesmm`).on("click", async function () {
    const { files } = await getOrtakFiles(basvuru.danisman_id);
    openOrtak(basvuru, ".filesmm", files);
  });

  let isAllFilesUPloaded = Object.values(basvuru.folders).some((item) => !item);
  if (
    basvuru.modul == "Modul G" ||
    basvuru.modul == "Modul B" ||
    basvuru.modul == "Tasarim İnceleme"
  ) {
    isAllFilesUPloaded = Object.entries(basvuru.folders)
      .filter((item) => {
        return !(item[0] == "iso_files" || item[0] == "modul_b_cert");
      })
      .some((item) => !item[1]);
    $(`.basvuru${basvuru.id} .iso_files`).css("display", "none");
    $(`.basvuru${basvuru.id} .modul_b_cert`).css("display", "none");
  } else if (basvuru.modul == "Modul H1") {
    $(`.basvuru${basvuru.id} .modul_b_cert`).css("display", "none");
    isAllFilesUPloaded = Object.entries(basvuru.folders)
      .filter((item) => {
        return item[0] != "modul_b_cert";
      })
      .some((item) => !item[1]);
  }
  fileUploadsItem(basvuru, "yapi_ruhsati");
  fileUploadsItem(basvuru, "proje");
  fileUploadsItem(basvuru, "proje_kapak");
  fileUploadsItem(basvuru, "ab_uyg_beyan");
  fileUploadsItem(basvuru, "teknik_dosya");
  if (basvuru.modul == "Modul E") {
    fileUploadsItem(basvuru, "modul_b_cert");
  }
  if (basvuru.modul === "Modul B" || basvuru.modul === "Modul H1") {
    fileUploadsItem(basvuru, "iso_files");
  }

  if (!isAllFilesUPloaded) {
    $(`.basvuru${basvuru.id} .dosy-yukleme-txt`).css("display", "none");
    $(`.basvuru${basvuru.id} .bsvr-btn-area`).css("display", "block");
  }
  if (!!basvuru.status) {
    makeDenetimSurec(basvuru);
  }
};
const openOrtak = async (basvuru, classname, files) => {
  $(".ortak-uppop").remove();
  let folderpath = "/uploads/danisman/" + basvuru.danisman_id + "/ortak";
  let selectedFilePath = "";
  const rendered = await getTemp("danisman/ortak.html");
  $("body").append(
    rendered({
      files: files,
      danisman_id: basvuru.danisman_id,
      classname,
    })
  );
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    $(`.fileInde${i}`).on("click", function (e) {
      e.stopPropagation();
      for (let i = 0; i < files.length; i++) {
        $(`.fileInde${i}`).removeClass("bg-black/10");
      }
      $(`.fileInde${i}`).addClass("bg-black/10");
      selectedFilePath = folderpath + "/" + file;
      $(".btn-sec-filepath").css("display", "block");
    });
  }
  $(".btn-sec-filepath").on("click", async (e) => {
    e.stopPropagation();
    if (classname == ".filesmm") {
      basvuru.folders["smm"] = selectedFilePath;
    } else if (classname == ".fileproje_sozlesme") {
      basvuru.folders["proje_sozlesme"] = selectedFilePath;
    }
    await $.ajax({
      type: "POST",
      url: "/danis_basvuru/update",
      data: { id: basvuru.id, folders: JSON.stringify(basvuru.folders) },
      dataType: "json",
    });

    let basvuru1 = await $.ajax({
      type: "POST",
      url: "/danis_basvuru/get-basvuru",
      data: { id: basvuru.id },
      dataType: "json",
    });
    basvurular = basvurular.map((item) => {
      if (item.id == basvuru1.id) {
        return basvuru1;
      }
      return item;
    });
    const firma = firmalar.find((it1) => it1.id == basvuru1.firma_id);
    let folders = JSON.parse(basvuru1.folders);

    let basvuru2 = {
      ...basvuru1,
      folders: folders,
      firma_unvan: firma.unvan,
      firma_kisa_ad: firma.kisa_ad,
    };
    await innerMakeTable(basvuru2);
    $(".ortak-uppop .btn-cls-ortakpop").trigger("click");
  });
  $(".btn-file-ekle").on("click", function () {
    $("#file_ort_up").val("");
    $("#file_ort_up").trigger("click");
  });
  $("#file_ort_up").on("change", async function () {
    let file = $("#file_ort_up").get(0).files[0];
    var upload = new Upload(file);
    const { msg } = await upload.doUpload(
      `${folderpath}/`,
      upload.getName().split(".")[0]
    );
    if (!!msg && msg == "Ok!") {
      const { files } = await getOrtakFiles(basvuru.danisman_id);
      openOrtak(basvuru, classname, files);
    }
  });
  $(".ortak-uppop").on("click", function () {
    $(".btn-sec-filepath").css("display", "none");
    for (let i = 0; i < files.length; i++) {
      $(`.fileInde${i}`).removeClass("bg-black/10");
    }
  });

  $(".ortak-uppop .btn-cls-ortakpop").on("click", function () {
    $(".ortak-uppop").remove();
  });
};
const makeTable = async (basvurular) => {
  rendered = await getTemp("danisman/basvurular/basvuru.html");
  basvurular = basvurular.map((item) => {
    const firma = firmalar.find((it1) => it1.id == item.firma_id);
    let folders = JSON.parse(item.folders);
    return {
      ...item,
      folders: folders,
      firma_unvan: firma.unvan,
      firma_kisa_ad: firma.kisa_ad,
    };
  });
  $("#tbody1").html(rendered({ basvurular: basvurular }));
  for (let i = 0; i < basvurular.length; i++) {
    const basvuru = basvurular[i];
    $(`#basvuru${basvuru.id}`).on("click", async function () {
      $(`#basvuru${basvuru.id} + div`).slideToggle(200);
    });
    duzenleDurumlar(basvuru);
    basvuruFirstGonder(basvuru);
    await innerMakeTable(basvuru);
  }
  if (basvurular.length == 0) {
    $(`#tbody1`).html(`
      <div class="py-2 flex justify-center items-center font-bold text-black/40">Herhangi bir başvuru talebi bulunamadı</div>
      `);
  }
};
const BasvuruKaydetArea = (modul) => {
  // Risk Analiz Seçenek durum
  $(`[type='checkbox'][name="risk[mak_dairesi]"]`).on("change", function () {
    $(this).val($(this).val() == "on" ? "" : "on");
  });
  $(`[type='checkbox'][name="risk[kabin_ust]"]`).on("change", function () {
    $(this).val($(this).val() == "on" ? "" : "on");
  });
  $(`[type='checkbox'][name="risk[kuyu_dibi]"]`).on("change", function () {
    $(this).val($(this).val() == "on" ? "" : "on");
  });
  const riskSelectionArea = function (valMod) {
    if (valMod === "Modul G" || valMod === "Tasarım İnceleme") {
      $(`.risk-slction`).css("display", "block");
    } else {
      $(`.risk-slction`).css("display", "none");
      $(`[type='checkbox'][name="risk[kabin_ust]"]`).val("");
      $(`[type='checkbox'][name="risk[kuyu_dibi]"]`).val("");
      $(`[type='checkbox'][name="risk[mak_dairesi]"]`).val("");
    }
  };
  riskSelectionArea(modul);
  $(`[name='modul']`).on("change", function () {
    riskSelectionArea($(this).val());
  });

  //Kaydet Buton
  $(`.btn-bsv-kaydet`).on("click", async function () {
    const formdata = $(".ekle-form").serializeJSON();
    let newData = {
      danisman_id: user.id,
      ...formdata,
      foldername: new Date().getTime().toString(),
      folders: JSON.stringify({
        yapi_ruhsati: "",
        proje: "",
        proje_kapak: "",
        ab_uyg_beyan: "",
        teknik_dosya: "",
        modul_b_cert: "",
        iso_files: "",
        smm: "",
        proje_sozlesme: "",
      }),
      basvuru_tarih: "",
      risk: JSON.stringify(formdata.risk),
    };
    const resp = await $.ajax({
      type: "POST",
      url: "/danis_basvuru/add",
      data: { ...newData },
      dataType: "json",
    });
    BasvuruInit();
  });
};
const addPopAdd = async () => {
  const renderer = await getTemp("danisman/basvurular/add.html");
  $("body").append(renderer({}));
};
export const BasvuruInit = async () => {
  $("#tbody1").html("");
  $(".pop-add").remove();
  await addPopAdd();
  firmalar = await GetFirmalar();
  $.map(firmalar, (val, key) => {
    $("#firma_id").append(`
      <option value="${val.id}">${val.kisa_ad}</option>
    `);
  });
  basvurular = await GetBasvurular();
  basvurular = basvurular.sort((a, b) =>
    a.foldername < b.foldername ? 1 : -1
  );
  await AdresAlanInit();
  for (let i = 0; i < basvurular.length; i++) {
    let item = basvurular[i];
    $.map(firmalar, (firma) => {
      if (firma.id == item.as_firma_id) {
        item["as_firma_kisa_ad"] = firma.kisa_ad;
      }
    });
    item["as_il"] = (await GetIl(item.il_id)).il_adi;
    item["as_ilce"] = (await GetIlce(item.ilce_id)).ilce_adi;
    item["as_mahalle"] = (await GetMahalle(item.mahalle_id)).mahalle_adi;
  }
  $("#tbody1 + div").css("display", "none");
  if (!!basvurular && basvurular.length > 0) {
    await makeTable(basvurular);
    $("#tbody1 + div").css("display", "none");
    $(`.spinner-area`).css("display", "none");
    $(`.veri-yok-txt`).css("display", "none");
  } else {
    $("#tbody1 + div").css("display", "block");
    $(`.spinner-area`).css("display", "none");
    $(`.veri-yok-txt`).css("display", "block");
  }
  BasvuruKaydetArea("Modul G");
  $(".btn-bsv-ekle").on("click", async function () {
    $(".ekle-form").trigger("reset");
    SetAdresData(1, 1, 1);
    $("[name='modul']").trigger("change");
    $(".pop-add").css("display", "flex");
    $(".btn-bsv-kaydet").css("display", "block");
    $(".btn-bsv-guncelle").css("display", "none");
    $(".btn-bsv-sil").css("display", "none");
    $(".popkaydet-titil").html("Yeni Kayıt");
  });
  $(".btn-pop-close").on("click", function () {
    $(".pop-add").css("display", "none");
  });
};
