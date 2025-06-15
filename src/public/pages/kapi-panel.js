import {
  SerializeArrayToObject,
  Upload,
  FileValidation,
  TrToEnChar,
} from "../util/fncs.js";
import {
  GetListOnayKurumlar,
  AddSertifika,
  GetSertifikalar,
  DeleteSertifika,
  UpdateSertifika,
  DeleteSertifikaFile,
} from "./sertifikalar.js";
let onayKurumlar = [];

const onSelectDosya = () => {
  $("#cert-add-btn").on("click", function (e) {
    $("[type=file]").trigger("click");
    $("[type=file]").val("");
  });
  $("[type=file]").on("change", function (e) {
    var file = $(this)[0].files[0];
    const resp = FileValidation(file, 5);
    if (resp.status) {
      $(".cert-name-cli").html(`
            <div class="">
              ${resp.file.name} - ${resp.size}
            </div>
          `);
    } else {
      $(".cert-name-cli").html(`
           <div class=" text-red-500">
              ${resp.msg} -    ${resp.size}
            </div>
          `);
    }
  });
};

selectedComp = "";
const GetKapiPanelleri = async () => {
  const { data } = await GetSertifikalar("kapi-panel");
  const sertifikalar = data;
  $("tbody").html("");
  $.each(sertifikalar, function (indexInArray, valueOfElement) {
    const selectedOnayKurum = onayKurumlar.find(
      (item) => item.id == valueOfElement.onay_kurum_id
    );
    const finame = valueOfElement.cert_filepath.split("/").pop();
    const belgeTur =
      valueOfElement.belge_tur == "PENDULUM"
        ? "SARKAÇ TEST RAPOR"
        : "YANGINA DAYANIM";
    $("tbody").append(`
            <tr id="komp-${valueOfElement.id}" class="text-[0.8rem]">
                <td><div class="line-clamp-1  py-1">${valueOfElement.marka}</div></td>
                <td><div class="line-clamp-1  py-1">${valueOfElement.tip}</div></td>
                <td><div class="line-clamp-1  py-1">${selectedOnayKurum.name} - ${selectedOnayKurum.nobo}</div></td>
                <td><div class="line-clamp-1  py-1">${valueOfElement.cert_no}</div></td>
                <td><div class="line-clamp-1  py-1">${belgeTur}</div></td>
                <td>
                  <a href="${valueOfElement.cert_filepath}" class="text-blue-600 underline" download="${finame}">
                    İndir
                  </a>
                </td>
              </tr>
          `);
    $(`#komp-${valueOfElement.id}`).on("click", function (e) {
      // e.preventDefault();
      $("#update").removeClass("!hidden");
      $("#delete").removeClass("!hidden");
      $("#save").addClass("!hidden");
      selectedComp = valueOfElement;
      $("[name='onay_kurum_id']").val(valueOfElement.onay_kurum_id);
      $("[name='cert_no']").val(valueOfElement.cert_no);
      $("[name='cert_start_date']").val(valueOfElement.cert_start_date);
      $("[name='cert_end_date']").val(valueOfElement.cert_end_date);
      $("[name='marka']").val(valueOfElement.marka);
      $("[name='tip']").val(valueOfElement.tip);
      $("[name='cert_filepath']").val(valueOfElement.cert_filepath);
      $("[name='belge_tur']").val(valueOfElement.belge_tur);
      $("[name='belge_tur']").trigger("change");
      $("[name='class']").val(valueOfElement.class);
      const fname = valueOfElement.cert_filepath.split("/").pop();
      $("#cert-name-fromdb").html("");
      $("#cert-name-fromdb").append(`
             <span class="font-semibold">Sertifika:</span>
            <a
                class="underline text-blue-600"
                href="${valueOfElement.cert_filepath}"
                download="${fname}"
              >
                ${fname}
              </a>
          `);
    });
  });
  $("#clear").on("click");
};
export const KapiPanelInit = async (route) => {
  onayKurumlar = await GetListOnayKurumlar();
  GetKapiPanelleri();
  onSelectDosya();
  $("#save").on("click", async function (e) {
    $(".msg-area").html("");
    let filename = $(`#belge_tur`).val();
    let formData = SerializeArrayToObject($(".form-area").serializeArray());
    if (!!$("[type=file]")[0] && $("[type=file]")[0].files[0]) {
      $.map(formData, (val, key) => {
        if (key == "marka") {
          filename += "-" + TrToEnChar(val.toLocaleLowerCase().trim());
        } else if (key == "tip") {
          filename +=
            "-(" +
            TrToEnChar(val.toLocaleLowerCase().trim()).replaceAll(",", "-") +
            ")";
        } else if (key == "cert_start_date") {
          filename += "-" + val.replaceAll(/[,.\/]/g, "");
        } else if (key == "cert_end_date") {
          filename += "-" + val.replaceAll(/[,.\/]/g, "");
        }
      });
      $("[name='cert_filepath']").val(
        "/uploads/sertifikalar/" + filename + ".pdf"
      );
      formData = SerializeArrayToObject($(".form-area").serializeArray());
      $(`[name='cert_filepath']`).val(filename);
    }
    if (!Object.values(formData).some((item) => item == "")) {
      var file = $("[type=file]")[0].files[0];
      $(".spinner-area").removeClass("!hidden");
      var upload = new Upload(file);
      upload.doUpload("/uploads/sertifikalar/", filename);
      await AddSertifika("kapi-panel", formData);
      GetKapiPanelleri();
      $(".spinner-area").addClass("!hidden");
    } else {
      $(".msg-area").html(
        "Eksik ya da yanlış Bilgi giridin!.Tüm alanları adam gibi gir! Adamın canını sıkma!"
      );
    }
    // await AddSertifika("kapi-panel", formData);
  });
  $("#update").on("click", async function (e) {
    $(".msg-area").html("");
    let filename = $(`#belge_tur`).val();
    let formData = SerializeArrayToObject($(".form-area").serializeArray());
    if (!!$("[type=file]")[0] && $("[type=file]")[0].files[0]) {
      $.map(formData, (val, key) => {
        if (key == "marka") {
          filename += "-" + TrToEnChar(val.toLocaleLowerCase().trim());
        } else if (key == "tip") {
          filename +=
            "-(" +
            TrToEnChar(val.toLocaleLowerCase().trim()).replaceAll(",", "-") +
            ")";
        } else if (key == "cert_start_date") {
          filename += "-" + val.replaceAll(/[,.\/]/g, "");
        } else if (key == "cert_end_date") {
          filename += "-" + val.replaceAll(/[,.\/]/g, "");
        }
      });
      $("[name='cert_filepath']").val(
        "/uploads/sertifikalar/" + filename + ".pdf"
      );
      formData = SerializeArrayToObject($(".form-area").serializeArray());
      $(`[name='cert_filepath']`).val(filename);
    }

    if (!Object.values(formData).some((item) => item == "")) {
      var file = $("[type=file]")[0].files[0];
      $(".spinner-area").removeClass("!hidden");
      if (!!file) {
        var upload = new Upload(file);
        upload.doUpload("/uploads/sertifikalar/", filename);
        await DeleteSertifikaFile({
          id: selectedComp.id,
          filepath: selectedComp.cert_filepath,
        });
      }
      await UpdateSertifika("kapi-panel", { id: selectedComp.id, ...formData });
      GetKapiPanelleri();
      $(".spinner-area").addClass("!hidden");
    } else {
      $(".msg-area").html(
        "Eksik ya da yanlış Bilgi giridin!.Tüm alanları adam gibi gir! Adamın canını sıkma!"
      );
    }
  });
  $("#delete").on("click", async function (e) {
    await DeleteSertifika("kapi-panel", {
      id: selectedComp.id,
      filepath: selectedComp.cert_filepath,
    });
    GetKapiPanelleri();
  });
  $("#clear").on("click", function (e) {
    // $("[name='onay_kurum_id']").val("");
    $("#update").addClass("!hidden");
    $("#delete").addClass("!hidden");
    $("#save").removeClass("!hidden");
    $("[name='cert_no']").val("");
    $("[name='cert_start_date']").val("");
    $("[name='cert_end_date']").val("");
    $("[name='marka']").val("");
    $("[name='tip']").val("");
    $("[name='class']").val("");
    $("#cert-name-fromdb").html("");
    $(".cert-name-cli").html("");
    selectedComp = "";
  });

  $("#belge_tur").on("change", function (e) {
    const val = $(this).val();
    if (val !== "FIRE RESISTANCE") {
      $(".sinif-area").addClass("!hidden");
      $("#class").val("-");
    } else {
      $(".sinif-area").removeClass("!hidden");
      $("#class").val("");
    }
  });
};
