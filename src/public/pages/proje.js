import { AdresAlanInit, GetIl, GetIlce, GetMahalle } from "../util/adres.js";
import { Upload } from "../util/fncs.js";
let firmalar;
let denetciler;
let planlamalar;
let selectedDenetim;
const GetPlanlamalar = async () => {
  const datas = await $.ajax({
    type: "POST",
    url: "/proje/get-planlamalar",
    data: { plan_status: "Proje Bekleniyor" },
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
async function GetFirmaByPlanId(plan) {
  const resp = await $.ajax({
    type: "POST",
    url: "/proje/get-asansor-firmaByplanId",
    data: { as_firma_id: plan.as_firma_id },
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
const updateProjeData = async (denetim_id, proje) => {
  const rsp = await $.ajax({
    type: "POST",
    url: "/proje/update-denetim-proje",
    data: { id: denetim_id, proje: JSON.stringify(proje) },
    dataType: "json",
  });
  return rsp;
};
const uploadFile = async (
  classname,
  downName,
  formpathsfolder,
  denetim_id,
  plan_id
) => {
  $(`.plan${plan_id} .${classname} [title='Yükle']`).on("click", function () {
    $(`.plan${plan_id} [name='${classname}']`).val("");
    $(`.plan${plan_id} [name='${classname}']`).trigger("click");
  });
  $(`.plan${plan_id} [name='${classname}']`).on("change", async function () {
    let folderpath = "/uploads/planlama/denetim/" + formpathsfolder;
    let file = $(this).get(0).files[0];
    let fileuzanti = file.name.split(".").pop();
    let filename = `${downName}.${fileuzanti}`;
    let downUrl = `${folderpath}/projeler/${filename}`;
    var upload = new Upload(file);
    const { msg } = await upload.doUpload(
      `${folderpath}/projeler/`,
      downName
    );
    if (!!msg && msg == "Ok!") {
      $(`.plan${plan_id}  [name="proje[${classname}]"]`).val(downUrl);
      await updateProjeData(
        denetim_id,
        $(`.plan${plan_id} form`).serializeJSON()
      );
      $(`.plan${plan_id} .${classname} [title='İndir']`).removeClass("hidden");
      $(`.plan${plan_id} .${classname} [title='İndir']`).attr("href", downUrl);
      $(`.plan${plan_id} .${classname} [title='İndir']`).attr(
        "download",
        filename
      );
    }
  });
};

const makeTable = async (plans) => {
  // $("#tbody1").html('');
  rendered = await getTemp("proje/plan.html");
  $("#tbody1").html(rendered({ plans: plans }));
  for (let i = 0; i < plans.length; i++) {
    const plan = plans[i];
    $(`#plan${plan.id}`).on("click", async function () {
      $(`#plan${plan.id} + div`).slideToggle(200);
      //   await getPlanByItem(plan);
      selectedDenetim = await GetDenetimByPlanId(plan.id);

      if (!!selectedDenetim && !!selectedDenetim.proje) {
        const { proje } = JSON.parse(selectedDenetim.proje);

        if (!!proje["dwg"]) {
          $(`.plan${plan.id} .dwg [title='İndir']`).attr("href", proje["dwg"]);
          $(`.plan${plan.id} .dwg [title='İndir']`).removeClass("hidden");
          $(`.plan${plan.id}  [name='proje[dwg]']`).val(proje["dwg"]);
        }
        if (!!proje["pdf"]) {
          $(`.plan${plan.id} .pdf [title='İndir']`).attr("href", proje["pdf"]);
          $(`.plan${plan.id} .pdf [title='İndir']`).removeClass("hidden");
          $(`.plan${plan.id}  [name='proje[pdf]']`).val(proje["pdf"]);
        }
        if (!!proje["kapak"]) {
          $(`.plan${plan.id} .kapak [title='İndir']`).attr(
            "href",
            proje["kapak"]
          );
          $(`.plan${plan.id} .kapak [title='İndir']`).removeClass("hidden");
          $(`.plan${plan.id} [name='proje[kapak]']`).val(proje["kapak"]);
        }

        if (!!proje["sozlesme"]) {
          $(`.plan${plan.id} .sozlesme [title='İndir']`).attr(
            "href",
            proje["sozlesme"]
          );
          $(`.plan${plan.id} .sozlesme [title='İndir']`).removeClass("hidden");
          $(`.plan${plan.id} .sozlesme [name='proje[sozlesme]']`).val(
            proje["sozlesme"]
          );
        }
        if (!!proje["smm"]) {
          $(`.plan${plan.id} .smm [title='İndir']`).attr("href", proje["smm"]);
          $(`.plan${plan.id} .smm [title='İndir']`).removeClass("hidden");
          $(`.plan${plan.id}  [name='proje[smm]']`).val(proje["smm"]);
        }
        if (!!proje["tip_proje"]) {
          $(`.plan${plan.id} .tip_proje [title='İndir']`).attr(
            "href",
            proje["tip_proje"]
          );
          $(`.plan${plan.id} .tip_proje [title='İndir']`).removeClass("hidden");
          $(`.plan${plan.id}  [name='proje[tip_proje]']`).val(
            proje["tip_proje"]
          );
        }
      }

      // $(`.dwg [title='İndir']`).href();
      renderedDenetimBilgi = await getTemp("proje/denetimbilgi.html");
      let items1 = {};
      let items2 = {};
      let i = 0;
      $.map(selectedDenetim, (val, key) => {
        if (
          !(
            key == "proje" ||
            key == "id" ||
            key == "planlama_id" ||
            key == "guv_komps" ||
            key == "imzali_formlar" ||
            key == "modulb_certs" ||
            key == "folder_path" ||
            key == "risk" ||
            key == "tds_folders"
          )
        ) {
          if (i < 25) {
            items1[i] = {
              title: key.replaceAll("_", " "),
              value: val,
            };
          } else if (i >= 15) {
            items2[i] = {
              title: key.replaceAll("_", " "),
              value: val,
            };
          }
          i += 1;
        }
      });
      const guvAksms= !!selectedDenetim ? JSON.parse(selectedDenetim.guv_komps) : '';
      $(`#plan${plan.id} + div .as-bilgi-area`).html(
        renderedDenetimBilgi({ motor_kw:guvAksms.motor.kw,as_seri_no:plan.as_seri_no,items1: items1, items2: items2 })
      );
      const firmData = await GetFirmaByPlanId(plan);
      console.log(firmData);
      renderedFirmaBilgi = await getTemp("proje/firmabilgi.html");
      let items3 = {};
      let items4 = {};
      let j = 0;
      $.map(firmData, (val, key) => {
        if (!(key == "id" || key == "status" || key == "firma_konum")) {
          if (j < 9) {
            items3[j] = {
              title: key.replaceAll("_", " "),
              value: val,
            };
          } else if (j >= 9) {
            items4[j] = {
              title: key.replaceAll("_", " "),
              value: val,
            };
          }
          j += 1;
        }
      });
      $(`#plan${plan.id} + div .firma-bilgi-area`).html(
        renderedFirmaBilgi({ items3: items3, items4: items4 })
      );
      if (!!selectedDenetim) {
        uploadFile(
          "dwg",
          "Proje",
          plan.formpathsfolder,
          selectedDenetim.id,
          plan.id
        );
        uploadFile(
          "pdf",
          "Proje",
          plan.formpathsfolder,
          selectedDenetim.id,
          plan.id
        );
        uploadFile(
          "kapak",
          "Proje Cover",
          plan.formpathsfolder,
          selectedDenetim.id,
          plan.id
        );
        uploadFile(
          "sozlesme",
          "13.Project Service Contract",
          plan.formpathsfolder,
          selectedDenetim.id,
          plan.id
        );
        uploadFile(
          "smm",
          "SMM",
          plan.formpathsfolder,
          selectedDenetim.id,
          plan.id
        );
        uploadFile(
          "tip_proje",
          "Tip Projeler",
          plan.formpathsfolder,
          selectedDenetim.id,
          plan.id
        );
      }

      if (plan.modul != "Modul B") {
        $(`.plan${plan.id} .table-tip-proje`).css("display", "none");
      }

      $(`.plan${plan.id} .btn-denetime-gonder`).on("click", async function () {
        await $.ajax({
          type: "POST",
          url: "/proje/update-plan-status",
          data: {plan_id:plan.id,status:'Denetim Bekleniyor'},
          dataType: "json"
        });
        ProjeInit();
      });
      $(`.plan${plan.id} .btn-kontrole-gonder`).on("click", async function () {
        console.log("denekontroletime gönder");
         await $.ajax({
          type: "POST",
          url: "/proje/update-plan-status",
          data: {plan_id:plan.id,status:'Kontrol Bekleniyor'},
          dataType: "json"
        });
        ProjeInit();
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
    });
  }
   if (plans.length == 0){
    $(`#tbody1`).html(`
      <div class="py-2 flex justify-center items-center font-bold text-black/40">Herhangi bir proje talebi bulunamadı</div>
      `)
  }
};
export const ProjeInit = async () => {
  $('#tbody').html('');
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
  makeTable(planlamalar);
};
