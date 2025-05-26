export const TrToEnChar = (str) => {
  const charMap = {
    Ç: "C",
    Ö: "O",
    Ş: "S",
    İ: "I",
    I: "i",
    Ü: "U",
    Ğ: "G",
    ç: "c",
    ö: "o",
    ş: "s",
    ı: "i",
    ü: "u",
    ğ: "g",
  };

  str_array = str.split("");

  for (var i = 0, len = str_array.length; i < len; i++) {
    str_array[i] = charMap[str_array[i]] || str_array[i];
  }

  str = str_array.join("");

  var clearStr = str.replace(/[çöşüğı]/gi, "");
  return clearStr;
};
export const SerializeArrayToObject = (data) => {
  let newItem = {};
  $.each($("form").serializeArray(), function (index, item) {
    newItem[item["name"]] = item["value"];
  });

  return {
    ...newItem,
  };
};
export class Upload {
  file;
  constructor(file) {
    this.file = file;
  }
  getType() {
    return this.file.type;
  }
  getSize() {
    return this.file.size;
  }
  getName() {
    return this.file.name;
  }
  doUpload(dest_path,filename,progressBarId) {
    var formData = new FormData();
    formData.append("dest_path", dest_path);
    formData.append("filename", filename);
    formData.append('file', this.file, this.getName());
    const  progressHandling = function(event) {
      var percent = 0;
      var position = event.loaded || event.position;
      var total = event.total;
      if (event.lengthComputable) {
        percent = Math.ceil((position / total) * 100);
      }
      $(progressBarId + " .file-area").addClass('hidden');
      $(progressBarId + " .progress-wrp").removeClass('hidden');
      $(progressBarId + " .progress-wrp .progress-bar").css("width", +percent + "%");
      $(progressBarId + " .progress-wrp .status").text(percent + "%");
      if(percent == 100){
        $(progressBarId + " .progress-wrp").addClass('hidden');
        $(progressBarId + " .file-area").removeClass('hidden');
      }
    }
    return $.ajax({
      type: "POST",
      url: "/stat/fileupload",
      xhr: function () {
        var myXhr = $.ajaxSettings.xhr();
        if (myXhr.upload) {
          myXhr.upload.addEventListener(
            "progress",
            progressHandling,
            false
          );
        }
        return myXhr;
      },
      // success:  function(data){
      //   // your callback here
      
      // },
      // error: function (error) {
      //   // handle error
      // },
      async: true,
      data: formData,
      cache: false,
      contentType: false,
      processData: false,
      timeout: 60000
    });
  }

  async asyncDoUpload(dest_path,filename,progressBarId) {
    var formData = new FormData();
    formData.append("dest_path", dest_path);
    formData.append("filename", filename);
    formData.append('file', this.file, this.getName());
    const  progressHandling = function(event) {
      var percent = 0;
      var position = event.loaded || event.position;
      var total = event.total;
      if (event.lengthComputable) {
        percent = Math.ceil((position / total) * 100);
      }
      $(progressBarId + " .file-area").addClass('hidden');
      $(progressBarId + " .progress-wrp").removeClass('hidden');
      $(progressBarId + " .progress-wrp .progress-bar").css("width", +percent + "%");
      $(progressBarId + " .progress-wrp .status").text(percent + "%");
      if(percent == 100){
        $(progressBarId + " .progress-wrp").addClass('hidden');
        $(progressBarId + " .file-area").removeClass('hidden');
      }
    }
    return await $.ajax({
      type: "POST",
      url: "/stat/fileupload",
      xhr: function () {
        var myXhr = $.ajaxSettings.xhr();
        if (myXhr.upload) {
          myXhr.upload.addEventListener(
            "progress",
            progressHandling,
            false
          );
        }
        return myXhr;
      },
      // success:  function(data){
      //   // your callback here
      
      // },
      // error: function (error) {
      //   // handle error
      // },
      async: true,
      data: formData,
      cache: false,
      contentType: false,
      processData: false,
      timeout: 60000
    });
  }
}
export function isJson(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }  
  return true;
}
export const FileValidation = (file,maxFileSize) =>{
  // maxFileSize for mb
  const {name,type,size} = file;
  let newFileData = {
    size:'0 Kb',
    name,
    type
  };
  
  if(size / 1024 / 1024)
  if((size / 1024 / 1024) > 1){
    newFileData["size"] = (size / 1024 / 1024).toFixed(2) + ' mb' ;
  }else if((size / 1024 / 1024) < 1){
    newFileData["size"] = (size / 1024).toFixed(2) + ' kb' ;
  }
  const isFileBig = (size / 1024 / 1024) <= maxFileSize;
  if(!isFileBig){
    return {
      status:false,
      msg:'Max.dosya boyutu ' +maxFileSize+ ' mb olabilir',
      size: newFileData["size"]
    }
  }
  return{
    status:true,
    file,
    size: newFileData["size"]
  }
}
export function pad(num, size) {
  num = num.toString();
  while (num.length < size) num = "0" + num;
  return num;
}
export function push(data, obj) {
  max = Object.keys(data).reduce(
    (acc, val) => (acc > Number(val) ? acc : Number(val)),
    0
  );
  data[max + 1] = obj;
  return data;
}
export function getDayName(year, month, day) {
  var date = new Date(year, month - 1, day);
  return date.toLocaleDateString("tr-TR", { weekday: "long" });
}
export function getAyGunuHesapla(year, month) {
  return new Date(year, month, 0).getDate();
}
export function getMonthName(year, month, day) {
  var date = new Date(year, month - 1, day);
  return date.toLocaleDateString("tr-TR", { month: "long" });
}