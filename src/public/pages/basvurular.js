import {
  GetIl,
  GetIlce,
  GetMahalle,
  AdresAlanInit,
  SetAdresData,
} from "../util/adres.js";
import { Upload, pad } from "../util/fncs.js";
// import { MAINHOST } from "../constants.js";
import { user } from "../router.js";
let firmalar;
let basvurular;
let danismanlar;
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
const GetBasvurular = async () => {
  const datas = await $.ajax({
    type: "POST",
    url: "/basv/get-list",
    data: {},
    dataType: "json",
  });
  let newItem = [];

  $.map(datas, (val) => newItem.push(val));
  return newItem;
};
async function GetDanismanlar() {
  const danismanlar = await $.ajax({
    type: "POST",
    url: "/personel/get-danismanlar",
    data: {},
    dataType: "json",
  });
  return danismanlar;
}
async function GetFirmalar() {
  const firmalar = await $.ajax({
    type: "POST",
    url: "/danis_firma/get-list-all",
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
const makeDenetimSurec = async (basvuru, isShow) => {
  $(`.basvuru${basvuru.id} .denetim-surec`).html("");
  if (isShow) {
    let rendered = await getTemp("basvurular/denetim-surec.html");
    let statuss = JSON.parse(basvuru.status);
    $(`.basvuru${basvuru.id} .denetim-surec`).html(
      rendered({
        statuss,
      })
    );
    $(`.basvuru${basvuru.id} .bsvr-msj-area textarea`).val("");
    for (let i = 0; i < statuss.length; i++) {
      const status = statuss[i];
   
      $(`.basvuru${basvuru.id} .denetim-surec .btn-msj-gor${i}`).on(
        "click",
        function () {
          if (status.mesaj != "") {
            if (Number($(this).attr("data-pop")) == 0) {
              $(this).attr("data-pop", 1);
              $(`.basvuru${basvuru.id} .denetim-surec .msj-alan${i}`).html(
                status.mesaj
              );
            } else {
              $(this).attr("data-pop", 0);
              $(`.basvuru${basvuru.id} .denetim-surec .msj-alan${i}`).html("");
            }
          }
        }
      );
    }
    $(`.basvuru${basvuru.id} .btn-msj-gonder`).on("click", async function () {
      let data = {
        title: $(`.basvuru${basvuru.id} [name='title']`).val(),
        subtitle: "",
        user: user.id,
        username: user.name,
        usertype: "Artıdoksan", //Müşteri or Artıdoksan
        date: new Date().getTime().toString(),
        mesaj: $(`.basvuru${basvuru.id} textarea[name='mesaj']`).val(),
      };
      let updateData = {
        id: basvuru.id,
        duzeltme_durum: basvuru.duzeltme_durum,
        status: JSON.stringify(statuss),
      };
      if (data.title == "Başvuru İnceleniyor") {
        data.subtitle = "Dosyalar İnceleniyor";
      } else if (data.title == "Başvuru Düzeltme") {
        data.subtitle = "Gönderilen dosyalarda düzeltme gerekli";
        data.mesaj +=
          data.mesaj + `<br><button class='gndr-btn'>Gönder</button>`;
        updateData.duzeltme_durum = 1;
      } else if (data.title == "Başvuru Kabul") {
        data.subtitle = "Planlama bekleniyor";
      } else if (data.title == "Planlama Yapıldı") {
        data.subtitle = "Denetim Bekleniyor";
      }else if (data.title == "Denetim Yapıldı") {
        data.subtitle = "Asansör ve rapor düzenlemeleri bekleniyor";
      } else if (data.title == "Denetim Tamamlandı") {
        data.subtitle = "Belge Bekleniyor";
      } else if (data.title == "Belge Basıldı") {
        data.subtitle = "";
      }
      statuss.push(data);
      updateData.status = JSON.stringify(statuss);
      await $.ajax({
        type: "POST",
        url: "/basv/update",
        data: { ...updateData },
        dataType: "json",
      });
      basvuruNewData = { ...basvuru, ...updateData };
      basvurular = basvurular.map(item=>{
        if(item.id === basvuruNewData.id){
          return basvuruNewData
        }
        return item;
      });
      makeDenetimSurec(basvuruNewData,true);
    });
  } 
};
const makeDosyalar = async (basvuru) => {
  let rendered = await getTemp("basvurular/dosyalar.html");
  $(`.basvuru${basvuru.id} .dosyalar`).html(
    rendered({
      folders: basvuru.folders,
      duzeltme_durum: basvuru.duzeltme_durum,
    })
  );
  if (
    basvuru.modul == "Modul G" ||
    basvuru.modul == "Modul B" ||
    basvuru.modul == "Tasarim İnceleme"
  ) {
    $(`.basvuru${basvuru.id} .iso_files`).css("display", "none");
    $(`.basvuru${basvuru.id} .modul_b_cert`).css("display", "none");
  } else if (basvuru.modul == "Modul H1") {
    $(`.basvuru${basvuru.id} .modul_b_cert`).css("display", "none");
  }
};
const makeTable = async (basvurular) => {
  rendered = await getTemp("/basvurular/table.html");
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
      $(`#basvuru${basvuru.id} + div`).slideToggle(50);
      setTimeout(() => {
        const isBlock = $(`#basvuru${basvuru.id} + div`).css("display");
        if (isBlock == "block") {
          makeDenetimSurec(basvuru, true);
        } else {
          makeDenetimSurec(basvuru, false);
        }
        console.log();
      }, 75);
    });
    makeDosyalar(basvuru);
  }
  if (basvurular.length == 0) {
    $(`#tbody1`).html(`
      <div class="py-2 flex justify-center items-center font-bold text-black/40">Herhangi bir başvuru talebi bulunamadı</div>
      `);
  }
};

export const BasvInit = async () => {
  $("#tbody1").html("");
  firmalar = await GetFirmalar();
  danismanlar = await GetDanismanlar();
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
    $.map(firmalar, (firma) => {
      if (firma.id == basvurular[i].as_firma_id) {
        basvurular[i]["as_firma_kisa_ad"] = firma.kisa_ad;
      }
    });
    $.map(danismanlar, (danisman) => {
      if (danisman.id == basvurular[i].danisman_id) {
        basvurular[i]["danisman_name"] = danisman.name;
      }
    });
    basvurular[i]["as_il"] = (await GetIl(basvurular[i].il_id)).il_adi;
    basvurular[i]["as_ilce"] = (await GetIlce(basvurular[i].ilce_id)).ilce_adi;
    basvurular[i]["as_mahalle"] = (
      await GetMahalle(basvurular[i].mahalle_id)
    ).mahalle_adi;
  }
  $("#tbody1 + div").css("display", "none");
  if (!!basvurular && basvurular.length > 0) {
    await makeTable(basvurular);
    $(`.spinner-area`).css("display", "none");
    $(`.veri-yok-txt`).css("display", "none");
    $("#tbody1 + div").css("display", "none");
  } else {
    $("#tbody1 + div").css("display", "block");
    $(`.spinner-area`).css("display", "none");
    $(`.veri-yok-txt`).css("display", "block");
  }
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
