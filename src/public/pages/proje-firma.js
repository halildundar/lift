import { FileValidation, Upload } from "../util/fncs.js";
let selectedItem;
const GetList = async () => {
  selectedItem = null;
  const datas = await $.ajax({
    type: "POST",
    url: "/proje-firma/get-list",
    data: {},
    dataType: "json",
  });
  let { msg, data } = datas;
  if (msg === "Ok!") {
    $("tbody").html("");
    data = data.sort((a, b) => {
      return a.yil < b.yil ? 1 : -1;
    });
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const downName = item.smm_filepath.split("/").pop();
      $("tbody").append(`
          <tr id="smm-${item.id}">
                    <td class="text-center">${item.yil}</td>
                    <td class="text-center">${item.unvan}</td>
                    <td class="text-center">${item.elk_muh_adi}</td>
                    <td class="text-center">${item.mak_muh_adi}</td>
                    <td class="text-center">
                        <a target="_blank" download="${downName}" class="underline text-blue-600" href="${item.smm_filepath}">İndir</a>
                    </td>
                </tr>
        `);
      $(`#smm-${item.id}`).on("click", function (e) {
        selectedItem = item;

        $.map(item, (val, key) => {
          $('[name="' + key + '"]').val(val);
          $("#save").addClass("!hidden");
          $("#update").removeClass("!hidden");
          $("#delete").removeClass("!hidden");
          if (key === "smm_filepath") {
            const fname = val.split("/").pop();
            selectedItem["smm_filepath"] = val;
            $("#file-name-fromdb").html("");
            $("#file-name-fromdb").append(`
             <span class="font-semibold">SMM dosyası:</span>
            <a
                class="underline text-blue-600"
                href="${val}"
                download="${fname}"
              >
                ${fname}
              </a>
          `);
          }
        });
      });
      $(`a[href='${item.nando_url}']`).on("click", function (e) {
        e.stopPropagation();
      });
    }
  } else {
    console.log(msg);
  }
  $("#clear").trigger("click");
};
const AddItem = async (data) => {
  await $.ajax({
    type: "POST",
    url: "/proje-firma/add",
    data: { ...data },
    dataType: "json",
  });
};
const UpdateItem = async (data) => {
  await $.ajax({
    type: "POST",
    url: "/stat/filedelete",
    data: JSON.stringify(data),
    dataType: "json",
    contentType: "application/json",
  });
  await $.ajax({
    type: "POST",
    url: "/proje-firma/update",
    data: { ...data },
    dataType: "json",
  });
};
const DeleteItem = async (data) => {
  await $.ajax({
    type: "POST",
    url: "/stat/filedelete",
    data: JSON.stringify(data),
    dataType: "json",
    contentType: "application/json",
  });
  await $.ajax({
    type: "POST",
    url: "/proje-firma/delete",
    data: { ...data },
    dataType: "json",
  });
};
const onSelectDosya = () => {
  $("#file-add-btn").click(function (e) {
    $("[type=file]").click();
    $("[type=file]").val("");
  });
  $("[type=file]").on("change", function (e) {
    var file = $(this)[0].files[0];
    const resp = FileValidation(file, 10);
    if (resp.status) {
      $(".file-name-cli").html(`
          <div class="">
            ${resp.file.name} - ${resp.size}
          </div>
        `);
    } else {
      $(".file-name-cli").html(`
         <div class=" text-red-500">
            ${resp.msg} -    ${resp.size}
          </div>
        `);
    }
  });
};
export const ProjeFirmaInit = async () => {
  onSelectDosya();
  $("#save").on("click", async function (e) {
    $(".msg-area").html("");
    let filename = "";
    let formData = $(".form-area").serializeJSON();
    formData["smm_filepath"] = filename;
    if (!!$("[type=file]")[0] && $("[type=file]")[0].files[0]) {
      filename =
        $("[name='yil']").val() +
        "-" +
        $("[name='unvan']").val().toLocaleLowerCase().trim();
      formData["smm_filepath"] = "/uploads/smm/" + filename + ".zip";
    }
    if (!Object.values(formData).some((item) => item == "")) {
      var file = $("[type=file]")[0].files[0];
      $(".spinner-area").removeClass("!hidden");
      var upload = new Upload(file);
      upload.doUpload("/uploads/smm/", filename);
      await AddItem(formData);
      GetList();
      $(".spinner-area").addClass("!hidden");
    } else {
      $(".msg-area").html(
        "Eksik ya da yanlış Bilgi giridin!.Tüm alanları adam gibi gir! Adamın canını sıkma!"
      );
    }
  });
  $("#update").on("click", async function (e) {
    $(".msg-area").html("");
    let filename = "";
    let formData = $(".form-area").serializeJSON();
    formData["smm_filepath"] = selectedItem.smm_filepath;
    if (!!$("[type=file]")[0] && $("[type=file]")[0].files[0]) {
      filename =
        $("[name='yil']").val() +
        "-" +
        $("[name='unvan']").val().toLocaleLowerCase().trim();
      formData["smm_filepath"] = "/uploads/smm/" + filename + ".zip";
    }
    if (!Object.values(formData).some((item) => item == "")) {
      var file = $("[type=file]")[0].files[0];
      $(".spinner-area").removeClass("!hidden");
      if (!!file) {
        var upload = new Upload(file);
        upload.doUpload("/uploads/smm/", filename);
      }

      await UpdateItem({ id: selectedItem.id, ...formData });
      GetList();
      $(".spinner-area").addClass("!hidden");
    } else {
      $(".msg-area").html(
        "Eksik ya da yanlış Bilgi giridin!.Tüm alanları adam gibi gir! Adamın canını sıkma!"
      );
    }
  });
  $("#delete").on("click", async function (e) {
    await DeleteItem({
      id: selectedItem.id,
      filepath: selectedItem.smm_filepath,
    });
    GetList();
  });
  $("#clear").on("click", function (e) {
    // $("[name='onay_kurum_id']").val("");
    $("#update").addClass("!hidden");
    $("#delete").addClass("!hidden");
    $("#save").removeClass("!hidden");
    $("[name='unvan']").val("");
    $("[name='adres']").val("");
    $("[name='elk_muh_adi']").val("");
    $("[name='elk_smm_no']").val("");
    $("[name='elk_oda_no']").val("");
    $("[name='mak_muh_adi']").val("");
    $("[name='mak_smm_no']").val("");
    $("[name='mak_oda_no']").val("");
    $("#file-name-fromdb").html("");
    $(".file-name-cli").html("");
    selectedItem = null;
  });

  GetList();


};
