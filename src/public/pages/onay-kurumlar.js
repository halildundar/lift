
import { SerializeArrayToObject } from "../util/fncs.js";
let selectedItem;
const GetList = async () => {
  selectedItem = null;
  const datas = await $.ajax({
    type: "POST",
    url: "/onay-kurumlar/get-list",
    data: {},
    dataType: "json",
  });
  let { msg, data } = datas;
  if (msg === "Ok!") {
    $("tbody").html("");
    data = data.sort((a,b)=>{
      return a.name.toLocaleLowerCase() < b.name.toLocaleLowerCase() ? -1:1
    })
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      $("tbody").append(`
          <tr id="onay-${item.nobo}">
                    <td class="text-center">${item.name}</td>
                    <td>${item.unvan}</td>
                    <td>${item.adres}</td>
                    <td class="text-center">${item.nobo}</td>
                    <td class="text-center">
                        <a target="_blank" class="underline text-blue-600" href="${item.nando_url}">Nando</a>
                    </td>
                </tr>
        `);
        $(`#onay-${item.nobo}`).on("click",function (e) {
          $.map(item,(val,key)=>{
            $('[name="'+key+'"]').val(val);
            $("#save").addClass('!hidden');
            $("#update").removeClass('!hidden');
            $("#delete").removeClass('!hidden');
          });
          selectedItem = item;
        });
        $(`a[href='${item.nando_url}']`).on("click",function(e){
          e.stopPropagation();
        })
    }
  } else {
    console.log(msg);
  }
  $("#clear").on("click",);
};
const AddItem = async (data) => {
  await $.ajax({
    type: "POST",
    url: "/onay-kurumlar/add",
    data: { ...data },
    dataType: "json",
  });
};
const UpdateItem = async (data) => {
  await $.ajax({
    type: "POST",
    url: "/onay-kurumlar/update",
    data: { ...data },
    dataType: "json",
  });
};
const DeleteItem = async (data) => {
  await $.ajax({
    type: "POST",
    url: "/onay-kurumlar/delete",
    data: { ...data },
    dataType: "json",
  });
};

export const OnayKurumInit = async () => {

  $("#save").on("click",async function (e) {
    let newItem = SerializeArrayToObject($("form").serializeArray());
    await AddItem(newItem);
    GetList();
  });
  $("#update").on("click",async function (e) {
    const newItem = SerializeArrayToObject($("form").serializeArray());
    await UpdateItem({id:selectedItem.id,...newItem});
    GetList();
  });
  $("#delete").on("click",async function (e) {
    await DeleteItem({id:selectedItem.id});
    GetList();
  });
  $("#clear").on("click",function (e) {
    $("form input").each(function (index, el) {
      $(el).val("");
    });
    $("#save").removeClass('!hidden');
    $("#update").addClass('!hidden');
    $("#delete").addClass('!hidden');
  });

  GetList();
 
};
