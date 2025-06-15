import { FileValidation, Upload } from "../../util/fncs.js";
let selectedItem;
import { user } from "../../router.js";
const GetList = async () => {
  selectedItem = null;
  console.log(user);
  const datas = await $.ajax({
    type: "POST",
    url: "/danis_firma/get-list",
    data: { danisman_id: user.id },
    dataType: "json",
  });
  if (!!datas && datas.length > 0) {
    $("tbody").html("");
    let data = datas.sort((a, b) => {
      return a.yil < b.yil ? 1 : -1;
    });
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const status = item.status == 0 ? "Pasif" : "Aktif";
      $("tbody").append(`
          <tr id="firma-${item.id}" class="text-[1rem] hover:bg-black/10 cursor-pointer">
                    <td class="text-center border-l border-t border-gray-200  py-2">${item.kisa_ad}</td>
                    <td class="text-center border-l border-t border-gray-200  py-2">${item.adres}</td>
                    <td class="text-center border-l border-t border-gray-200  py-2">${item.email}</td>
                    <td class="text-center border-l border-t border-gray-200  py-2">${item.telefon}</td>
                    <td class="text-center border-l border-t border-gray-200  py-2">${item.sirket_muduru}</td>
                </tr>
        `);
      $(`#firma-${item.id}`).on("click", function (e) {
        selectedItem = item;
        $.map(item, (val, key) => {
          $('[name="' + key + '"]').val(val);
          $("#save").addClass("!hidden");
          $("#update").removeClass("!hidden");
          $("#delete").removeClass("!hidden");
          if (
            key == "vergi_levhasi" ||
            key == "imza_sirkuleri" ||
            key == "faaliyet_belgesi" ||
            key == "sicil_gazetesi" ||
            key == "sicil_gazetesi"
          ) {
            const fname = val.split("/").pop();
            selectedItem[key] = val;
            $(`#${key} .newfile`).html("");
            $(`#${key} .newfile`).append(
              `<a class="underline text-blue-600" href="${val}" download="${fname}">${fname}</a>`
            );
            $(`a[href='${val}']`).on("click", function (e) {
              e.stopPropagation();
            });
          }
        });
      });
      $(`#firma-${item.id} a`).on("click", function (e) {
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
    url: "/danis_firma/add",
    data: { ...data, danisman_id: user.id },
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
    url: "/danis_firma/update",
    data: { ...data, danisman_id: user.id },
    dataType: "json",
  });
};
const DeleteItem = async (data) => {
  await $.ajax({
    type: "POST",
    url: "/stat/folderdelete",
    data: JSON.stringify(data),
    dataType: "json",
    contentType: "application/json",
  });
  await $.ajax({
    type: "POST",
    url: "/danis_firma/delete",
    data: { ...data },
    dataType: "json",
  });
};
const onSelectDosya = () => {
  $(".file-area").each(function () {
    const fileAreaEl = $(this);
    const buttonEl = fileAreaEl.find("button");
    const inputEl = fileAreaEl.find("input");
    const newFile = $(this).find(".newfile");
    buttonEl.on("click", function () {
      inputEl.val("");
      inputEl.trigger("click");
    });

    inputEl.on("change", function (e) {
      var file = $(this)[0].files[0];
      const resp = FileValidation(file, 2);
      if (resp.status) {
        newFile.html(`
            <div class="">
              ${resp.file.name} - ${resp.size}
            </div>
          `);
      } else {
        newFile.html(`
           <div class=" text-red-500">
              ${resp.msg} -    ${resp.size}
            </div>
          `);
        $(this).val("");
      }
    });
  });
};
export const FirmalarInit = async () => {
  onSelectDosya();
  $("#save").on("click", async function (e) {
    $(".msg-area").html("");
    let filename = "";
    let formData = $(".form-area").serializeJSON();
    $("[type=file]").each(function () {
      formData[$(this).attr("data-id")] = "";
      if (!!$(this)[0] && $(this)[0].files[0]) {
        filename = $("[name='kisa_ad']").val();
        const fileType = $(this)[0].files[0].name.split(".").pop();
        formData[
          $(this).attr("data-id")
        ] = `/uploads/danis_firma/${filename}/Kuruluş Evraklar/${$(this).attr(
          "data-id"
        )}.${fileType}`;
      }
    });
    if (!Object.values(formData).some((item) => item == "")) {
      $(".spinner-area").removeClass("!hidden");
      let promises = [];
      $("[type=file]").each(function () {
        var file = $(this)[0].files[0];
        var upload = new Upload(file);
        firmaname = $("[name='kisa_ad']").val();
        const fileType = $(this)[0].files[0].name.split(".").pop();
        formData[
          $(this).attr("data-id")
        ] = `/uploads/danis_firma/${firmaname}/Kuruluş Evraklar/${$(this).attr(
          "data-id"
        )}.${fileType}`;
        promises.push(
          upload.doUpload(
            `/uploads/danis_firma/${firmaname}/Kuruluş Evraklar/`,
            `${$(this).attr("data-id")}`,
            `#${$(this).attr("data-id")}`
          )
        );
      });
      await Promise.all(promises);
      await AddItem(formData);
      await GetList();
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
    let formData = { ...selectedItem, ...$(".form-area").serializeJSON() };
    $("[type=file]").each(function () {
      if (!!$(this)[0] && $(this)[0].files[0]) {
        filename = $("[name='kisa_ad']").val();
        const fileType = $(this)[0].files[0].name.split(".").pop();
        formData[
          $(this).attr("data-id")
        ] = `/uploads/danis_firma/${filename}/Kuruluş Evraklar/${$(this).attr(
          "data-id"
        )}.${fileType}`;
      }
    });
    console.log(formData);
    if (!Object.values(formData).some((item) => item == "")) {
      $(".spinner-area").removeClass("!hidden");
      let promises = [];
      $("[type=file]").each(function () {
        var file = $(this)[0].files[0];
        if (!!file) {
          var upload = new Upload(file);
          firmaname = $("[name='kisa_ad']").val();
          const fileType = $(this)[0].files[0].name.split(".").pop();
          formData[
            $(this).attr("data-id")
          ] = `/uploads/danis_firma/${firmaname}/Kuruluş Evraklar/${$(
            this
          ).attr("data-id")}.${fileType}`;
          promises.push(
            upload.doUpload(
              `/uploads/danis_firma/${firmaname}/Kuruluş Evraklar/`,
              `${$(this).attr("data-id")}`,
              `#${$(this).attr("data-id")}`
            )
          );
        }
      });
      await Promise.all(promises);
      console.log(formData);
      await UpdateItem({ ...formData });
      await GetList();
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
      folderpath:
        "/uploads/danis_firma/" + selectedItem.kisa_ad + "/Kuruluş Evraklar",
    });
    GetList();
  });
  $("#clear").on("click", function (e) {
    // $("[name='onay_kurum_id']").val("");
    $("#update").addClass("!hidden");
    $("#delete").addClass("!hidden");
    $("#save").removeClass("!hidden");
    $("[name='kisa_ad']").val("");
    $("[name='unvan']").val("");
    $("[name='adres']").val("");
    $("[name='pk']").val("");
    $("[name='vergi_no']").val("");
    $("[name='email']").val("");
    $("[name='telefon']").val("");
    $("[name='sirket_muduru']").val("");
    $("[name='son_kontrolcu']").val("");
    $("[name='firma_konum']").val("");
    $(".file-area").each(function () {
      // const areaEl = $(this);
      const newFileEl = $(this).find(".newfile");
      const anchorEl = $(this).find("a");
      anchorEl.addClass("hidden");
      newFileEl.html("");
    });
    $("#file-name-fromdb").html("");
    $(".file-name-cli").html("");
    $("[name='status']").attr("checked", false);
    $("#status+label").html("Pasif");
    selectedItem = null;
  });
  $("#status").on("click", function (e) {
    if (!$(this).is(":checked")) {
      $("#status+label").html("Pasif");
    } else {
      $("#status+label").html("Aktif");
    }
  });
  GetList();
};
