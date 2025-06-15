let selectedItem;
const GetList = async () => {
  selectedItem = null;
  const datas = await $.ajax({
    type: "POST",
    url: "/personel/get-list",
    data: {},
    dataType: "json",
  });
  let { msg, data } = datas;
  if (msg === "Ok!") {
    $("tbody").html("");
    data = data.sort((a, b) => (a.status < b.status ? 1 : -1));
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const statusArea = item.status == 0 ? "Pasif" : "Aktif";
      $("tbody").append(`
          <tr id="onay-${item.id}">
                    <td class="text-center">${item.name}</td>
                    <td class="text-center">${statusArea}</td>
                    <td>${item.gorev}</td>
                    <td>${item.unvan}</td>
                    <td class="text-center">${item.telefon}</td>
                    <td class="text-center">${item.email}</td>
                </tr>
        `);
      $(`#onay-${item.id}`).on("click", function (e) {
        $.map(item, (val, key) => {
          if ((item.status = 1)) {
            $("#status").prop("checked", true);
          } else {
            $("#status").prop("checked", false);
          }
          $("#status").trigger("change");
          if (key == "yetki") {
            $.map(JSON.parse(val), (val1, key1) => {
              $("[type='checkbox'][name='yetki[" + key1 + "]']").prop(
                "checked",
                val1 == "on"
              );
              $("[type='checkbox'][name='yetki[" + key1 + "]']").val(val1);
            });
          } else {
            $("form [name*='yetki']").prop("checked", false);
            $('[name="' + key + '"]').val(val);
          }
          if (key == "gorev") {
            $('[name="' + key + '"]').trigger("change");
          }
          $("#save").addClass("!hidden");
          $("#update").removeClass("!hidden");
          $("#delete").removeClass("!hidden");
        });
        selectedItem = item;
      });
      $(`#onay-${item.id}`).on("click", function (e) {});
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
  console.log(data);
  data.yetki = JSON.stringify(data.yetki);
  await $.ajax({
    type: "POST",
    url: "/personel/add",
    data: { ...data },
    dataType: "json",
  });
};
const UpdateItem = async (data) => {
  console.log(data);
  data.yetki = JSON.stringify(data.yetki);
  await $.ajax({
    type: "POST",
    url: "/personel/update",
    data: { ...data },
    dataType: "json",
  });
};
const DeleteItem = async (data) => {
  await $.ajax({
    type: "POST",
    url: "/personel/delete",
    data: { ...data },
    dataType: "json",
  });
};

export const PersonelInit = async () => {
  $("#save").on("click", async function (e) {
    let newItem = $("form").serializeJSON();
    newItem.yetki = JSON.stringify(newItem.yetki);
    const isEmptyArea =
      !!newItem["name"] &&
      !!newItem["email"] &&
      !!newItem["telefon"] &&
      !!newItem["unvan"] &&
      !!newItem["sifre"];
    console.log(newItem);
    // if (!isEmptyArea) {
    //   await AddItem(newItem);
    //   GetList();
    // }
  });
  $("#update").on("click", async function (e) {
    let newItem = $("form").serializeJSON();
    newItem.yetki = JSON.stringify(newItem.yetki);
    const isEmptyArea =
      !!newItem["name"] &&
      !!newItem["email"] &&
      !!newItem["telefon"] &&
      !!newItem["unvan"] &&
      !!newItem["sifre"];
    if (!isEmptyArea) {
      await UpdateItem({ id: selectedItem.id, ...newItem });
      GetList();
    }
  });
  $("#delete").on("click", async function (e) {
    await DeleteItem({ id: selectedItem.id });
    GetList();
  });
  $("#clear").on("click", function (e) {
    $("form [type='text']").each(function (index, el) {
      $(el).val("");
    });
    $("form [type='checkbox']").each(function (index, el) {
      $(el).val("");
    });
    $("#status").prop("checked", false);
    $("#status").trigger("change");
    $("form [name*='yetki']").prop("checked", false);
    $("form [name*='yetki']").trigger("change");
    $("#save").removeClass("!hidden");
    $("#update").addClass("!hidden");
    $("#delete").addClass("!hidden");
    selectedItem = null;
  });

  GetList();
  $("#status").on("change", function (e) {
    if (this.checked) {
      $("#status+label").html("Aktif");
      $(this).val(1);
    } else {
      $("#status+label").html("Pasif");
      $(this).val(0);
    }
  });
  $("[name='gorev']").on("change", function () {
    if ($("[name='gorev']").val() !== "Denetçi") {
      $(".unvan-area").addClass("hidden");
      $("[name='unvan']").append("<option value='-'>Seçiniz</option>");
      $("[name='unvan']").val("-");
      $("[name='modul_atama']").append("<option value='-'>Seçiniz</option>");
      $("[name='modul_atama']").val("-");
    } else {
      $(".unvan-area").removeClass("hidden");
      $("[name='unvan'] option[value='-']").remove();
      $("[name='modul_atama'] option[value='-']").remove();
    }
  });
  $("[name*='yetki']").map(function () {
    $(this).on("change", function () {
      if ($(this).is(":checked")) {
        $(this).val("on");
      } else {
        $(this).val("");
      }
    });
  });
};
