
export const GetSertifikalar = async (component) => {
  const sertifikalar = await $.ajax({
    type: "POST",
    url: "/sertifikalar/get-list",
    data: { component },
    dataType: "json",
  });
  return sertifikalar;
};
export const AddSertifika = async (component, certdata) => {
  const sertifikalar = await $.ajax({
    type: "POST",
    url: "/sertifikalar/add",
    data: { component, certdata },
    dataType: "json",
  });
};
export const UpdateSertifika = async (component, certdata) => {
  await $.ajax({
    type: "POST",
    url: "/sertifikalar/update",
    data: { component, certdata },
    dataType: "json",
  });
};
export const DeleteSertifikaFile = async (certdata) => {
  await $.ajax({
    type: "POST",
    url: "/stat/filedelete",
    data: JSON.stringify(certdata),
    dataType: "json",
    contentType: "application/json",
  });
};
export const DeleteSertifika = async (component, certdata) => {
  await $.ajax({
    type: "POST",
    url: "/sertifikalar/delete",
    data: { component, certdata },
    dataType: "json",
  });
  await $.ajax({
    type: "POST",
    url: "/stat/filedelete",
    data: JSON.stringify(certdata),
    dataType: "json",
    contentType: "application/json",
  });
};
export const GetListOnayKurumlar = async () => {
  selectedItem = null;
  const datas = await $.ajax({
    type: "POST",
    url: "/onay-kurumlar/get-list",
    data: {},
    dataType: "json",
  });
  let { msg, data } = datas;
  onayKurumlar = [];
  if (msg === "Ok!") {
    data = data.sort((a, b) => {
      return a.name.toLocaleLowerCase() < b.name.toLocaleLowerCase() ? -1 : 1;
    });

    $(`#onay_kurum_id`).html("");
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      onayKurumlar.push(item);
      $(`#onay_kurum_id`).append(`
               <option value="${item.id}">${item.name} - ${item.nobo}</option>
            `);
    }
  } else {
    console.log(msg);
  }
  return onayKurumlar;
};
export const SertifikalarInit = async (route) => {};
