let selectedItem;
const GetList = async () => {
  selectedItem = null;
  let datas = await $.ajax({
    type: "POST",
    url: "/personel/get-danismanlar",
    data: {},
    dataType: "json",
  });
  $("tbody").html("");
  datas = datas.sort((a, b) => (a.status < b.status ? 1 : -1));
  for (let i = 0; i < datas.length; i++) {
    const item = datas[i];
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
      console.log(item.status);
      if ((item.status = 1)) {
        $("#status").prop("checked", true);
      } else {
        $("#status").prop("checked", false);
      }
      $("#status").trigger("change");

      $("[name='name'").val(item.name);
      $("[name='email'").val(item.email);
      $("[name='telefon'").val(item.telefon);
      $("[name='unvan'").val(item.unvan);
      $("[name='sifre'").val(item.sifre);

      $("#save").addClass("!hidden");
      $("#update").removeClass("!hidden");
      $("#delete").removeClass("!hidden");
      selectedItem = item;
    });
    $(`#onay-${item.id}`).on("click", function (e) {});
    $(`a[href='${item.nando_url}']`).on("click", function (e) {
      e.stopPropagation();
    });
  }
  $("#status").prop("checked", false);
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

export const DanismanlarInit = async () => {
  $("#save").on("click", async function (e) {
    let newItem = $("form").serializeJSON();
    console.log(newItem["unvan"], !!newItem["unvan"]);
    const isEmptyArea =
      !!newItem["name"] &&
      !!newItem["email"] &&
      !!newItem["telefon"] &&
      !!newItem["unvan"] &&
      !!newItem["sifre"];
    if (isEmptyArea) {
      await AddItem(newItem);
      GetList();
    }
  });
  $("#update").on("click", async function (e) {
    let newItem = $("form").serializeJSON();
    const isEmptyArea =
      !!newItem["name"] &&
      !!newItem["email"] &&
      !!newItem["telefon"] &&
      !!newItem["unvan"] &&
      !!newItem["sifre"];
    if (isEmptyArea) {
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
    $("#save").removeClass("!hidden");
    $("#update").addClass("!hidden");
    $("#delete").addClass("!hidden");
    selectedItem = null;
  });

  GetList();
  $("#status").on("change", function (e) {
    if ($(this).val() == 1) {
      $("#status+label").html("Aktif");
      $(this).val("0");
    } else {
      $("#status+label").html("Pasif");
      $(this).val("1");
    }
  });
};
