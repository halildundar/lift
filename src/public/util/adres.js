async function GetIller() {
  return await $.ajax({
    type: "POST",
    url: "/planlama/get-iller",
    dataType: "json",
  });
}
async function GetIlceler(il_id) {
  return await $.ajax({
    type: "POST",
    url: "/planlama/get-ilceler",
    data: { il_id },
    dataType: "json",
  });
}
async function GetMahalleler(il_id, ilce_id) {
  return await $.ajax({
    type: "POST",
    url: "/planlama/get-mahalleler",
    data: { il_id, ilce_id },
    dataType: "json",
  });
}
export async function GetIl(il_id) {
  return (
    await $.ajax({
      type: "POST",
      url: "/planlama/get-il",
      data: { il_id },
      dataType: "json",
    })
  )[0];
}
export async function GetIlce(ilce_id) {
  return (
    await $.ajax({
      type: "POST",
      url: "/planlama/get-ilce",
      data: { ilce_id },
      dataType: "json",
    })
  )[0];
}
export async function GetMahalle(mahalle_id) {
  return (
    await $.ajax({
      type: "POST",
      url: "/planlama/get-mahalle",
      data: { mahalle_id },
      dataType: "json",
    })
  )[0];
}
let iller, ilceler, mahalleler;
export async function AdresAlanInit() {
  iller = await GetIller();
  $.map(iller, function (item, key) {
    $("[name='il_id']").append(
      `<option value="${item.id}">${item.il_adi}</option>`
    );
  });
  ilceler = await GetIlceler(iller[0].id);
  $.map(ilceler, function (item, key) {
    $("[name='ilce_id']").append(
      `<option value="${item.id}">${item.ilce_adi}</option>`
    );
  });
  mahalleler = await GetMahalleler(iller[0].id, ilceler[0].id);
  $.map(mahalleler, function (item, key) {
    $("[name='mahalle_id']").append(
      `<option value="${item.id}">${item.mahalle_adi}</option>`
    );
  });
  $("[name='il_id']").on("change", async function () {
    ilceler = await GetIlceler($("[name='il_id']").val());
    $("[name='ilce_id']").html("");
    $("[name='mahalle_id']").html("");
    $.map(ilceler, function (item, key) {
      $("[name='ilce_id']").append(
        `<option value="${item.id}">${item.ilce_adi}</option>`
      );
    });
    mahalleler = await GetMahalleler($("[name='il_id']").val(), ilceler[0].id);
    $.map(mahalleler, function (item, key) {
      $("[name='mahalle_id']").append(
        `<option value="${item.id}">${item.mahalle_adi}</option>`
      );
    });
  });
  $("[name='ilce_id']").on("change", async function () {
    mahalleler = await GetMahalleler(
      $("[name='il_id']").val(),
      $("[name='ilce_id']").val()
    );
    $("[name='mahalle_id']").html("");
    $.map(mahalleler, function (item, key) {
      $("[name='mahalle_id']").append(
        `<option value="${item.id}">${item.mahalle_adi}</option>`
      );
    });
  });
}
export const SetAdresData = (il_id, ilce_id, mahalle_id) => {
  $(`[name='il_id']`).val(il_id);
  $(`[name='il_id']`).trigger("change");
  setTimeout(() => {
    $(`[name='ilce_id']`).val(ilce_id);
    $(`[name='ilce_id']`).trigger("change");
    setTimeout(() => {
      $(`[name='mahalle_id']`).val(mahalle_id);
    }, 300);
  }, 300);
};
