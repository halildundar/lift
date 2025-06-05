import "../../main.scss";
import "../../jqform-serialize.js";
export function AjaxPromise(type, url, data) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: url,
      type: type,
      data: { ...data },
      dataType: "json",
      success: function (rs) {
        resolve(rs);
      },
      error: function (error) {
        reject(error);
      },
    });
  });
}
$(function () {
  $(".btn-giris-yap").on("click", async function () {
    $(".err-txt").html("");
    $(".spin-area").css("display", "flex");
    const formData = $("form").serializeJSON();
    console.log(formData);
    if (!!formData) {
      try {
        const resp = await AjaxPromise("post", "/signin", formData);
        console.log(resp);
        if(!!resp && resp.ok){
            location.reload();
        }
      } catch ({ responseJSON }) {
        const { msg } = responseJSON;
        $(".err-txt").html(msg);
      }
    }
    $(".spin-area").css("display", "none");
  });
});
