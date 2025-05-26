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
    data = data.sort((a,b)=>a.status < b.status ? 1 : -1)
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const statusArea = item.status == 0 ? 'Pasif' :'Aktif';
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
          if(key == 'status'){
            $('[name="' + key + '"]').prop('checked',val == '0' ? false : true);
            $('[name="' + key + '"]').trigger('change');
           
          }else{
            $('[name="' + key + '"]').val(val);
          }
          if(key == 'gorev'){
            $('[name="' + key + '"]').trigger('change')
          };
          $("#save").addClass("!hidden");
          $("#update").removeClass("!hidden");
          $("#delete").removeClass("!hidden");
        });
        selectedItem = item;
      });
      $(`a[href='${item.nando_url}']`).on("click", function (e) {
        e.stopPropagation();
      });
    }
  } else {
    console.log(msg);
  }
  $("#status").prop("checked",false);
  $("#clear").trigger("click");
};
const AddItem = async (data) => {
  await $.ajax({
    type: "POST",
    url: "/personel/add",
    data: { ...data },
    dataType: "json",
  });
};
const UpdateItem = async (data) => {
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
    const isEmptyArea = Object.values(newItem).some(item=>item === '');
    if(!isEmptyArea){
      await AddItem(newItem);
      GetList();
    }
 
  });
  $("#update").on("click", async function (e) {
    let newItem = $("form").serializeJSON();
    const isEmptyArea = Object.values(newItem).some(item=>item === '');
    if(!isEmptyArea){
      await UpdateItem({ id: selectedItem.id, ...newItem });
      GetList();
    }

  });
  $("#delete").on("click", async function (e) {
    await DeleteItem({ id: selectedItem.id });
    GetList();
  });
  $("#clear").on("click", function (e) {
    $("form input[type='text']").each(function (index, el) {
      $(el).val("");
    });
    console.log('Temizle')
    $("#status").prop("checked",false);
    $("#status").trigger("change");
    $("#save").removeClass("!hidden");
    $("#update").addClass("!hidden");
    $("#delete").addClass("!hidden");
  });

  GetList();
  $("#status").on("change", function (e) {
    if (!$(this).is(":checked")) {
      $("#status+label").html("Pasif");
    } else {
      $("#status+label").html("Aktif");
    }
  });
  $("[name='gorev']").on("change", function () {
    if($("[name='gorev']").val() !== 'Denetçi'){
      $(".unvan-area").addClass('hidden');
      $("[name='unvan']").append("<option value='-'>Seçiniz</option>")
      $("[name='unvan']").val("-");
      $("[name='modul_atama']").append("<option value='-'>Seçiniz</option>")
      $("[name='modul_atama']").val("-");
    }else{
      $(".unvan-area").removeClass('hidden');
      $("[name='unvan'] option[value='-']").remove();
      $("[name='modul_atama'] option[value='-']").remove()
    }
  });
};
