import { spawn } from "node:child_process";
import fs from "fs";
import path from "path";

function cmd(command,workdir) {
  let p = spawn(command, { shell: true,cwd:workdir });
  // let p = spawn(command, { shell: true });
  console.log("workdir",workdir);
  return new Promise((resolve) => {
    p.stdout.on("data", (x) => {
      process.stdout.write(x.toString());
    });
    p.stderr.on("data", (x) => {
      process.stderr.write(x.toString());
    });
    p.on("exit", (code) => {
      resolve(code);
    });
    p.stdin.end();
  });
}
export function getFiles(dir, files = []) {
  // Get an array of all files and directories in the passed directory using fs.readdirSync
  const fileList = fs.readdirSync(dir);
  // Create the full path of the file/directory by concatenating the passed directory and file/directory name
  for (const file of fileList) {
    const name = `${dir}/${file}`;
    // Check if the current file/directory is a directory using fs.statSync
    if (fs.statSync(name).isDirectory()) {
      // If it is a directory, recursively call the getFiles function with the directory path and the files array
      getFiles(name, files);
    } else {
      // If it is a file, push the full path to the files array
      files.push(name);
    }
  }
  return files;
}
export async function DenetimOncesiFormYazdir(inputs) {
  let src_folder = "sources/asansor/tuvnord-forms/";
  let timeFolderName = new Date().getTime().toString();
  inputs.map((a) => {
    if (a.search == "{formpathsfolder}") {
      timeFolderName = a.text;
    }
  });

  let dest_folder = "public/uploads/planlama/denetim/" + timeFolderName;
  let source_folder_ozellikler = fs.readFileSync(
    `${src_folder}denetim_oncesi_ozellikler.json`,
    "utf-8"
  );
  source_folder_ozellikler = JSON.parse(source_folder_ozellikler);

 let formpaths = [];

  if (!fs.existsSync(dest_folder)) {
    fs.mkdirSync(dest_folder, { recursive: true });
  }

  for (let i = 0; i < source_folder_ozellikler.length; i++) {
    const { filename, searchs } = source_folder_ozellikler[i];
    const srcCurrFile = path.join(process.cwd(), src_folder, filename);
    const destCurrFile = path.join(process.cwd(), dest_folder, filename);
    formpaths.push(
      `/uploads/planlama/denetim/${timeFolderName}/${filename}`
    );
    fs.copyFileSync(srcCurrFile, destCurrFile);
    let newKelimeler = inputs.filter((a) =>
      searchs.some((b) => a.search === b)
    );
    let inputsJsonName = destCurrFile.replace(".docx", ".json");
    let newKelimeler1 = [];
    for (let i = 0; i < newKelimeler.length; i++) {
      let newKelime = newKelimeler[i];
      if (newKelime.search === "{modul}") {
        let item = newKelime.text.replace("Modul ", "");
        const modulGData = {
          search: `{G}`,
          text: item === "G" ? "√" : " ",
          type: "text",
        };
        const modulGData1 = {
          search: `{modul_g_bool}`,
          text: item === "G" ? true : false,
          type: "boolean",
        };
        newKelimeler1.push(modulGData);
        newKelimeler1.push(modulGData1);
        const modulBData = {
          search: `{B}`,
          text: item === "B" ? "√" : " ",
          type: "text",
        };
        const modulBData1 = {
          search: `{modul_b_bool}`,
          text: item === "B" ? true : false,
          type: "boolean",
        };
        newKelimeler1.push(modulBData);
        newKelimeler1.push(modulBData1);
        const modulEData = {
          search: `{E}`,
          text: item === "E" ? "√" : " ",
          type: "text",
        };
        const modulEData1 = {
          search: `{modul_e_bool}`,
          text: item === "E" ? true : false,
          type: "boolean",
        };
        newKelimeler1.push(modulEData);
        newKelimeler1.push(modulEData1);
        const modulH1Data = {
          search: `{H1}`,
          text: item === "H1" ? "√" : " ",
          type: "text",
        };
        const modulH1Data1 = {
          search: `{modul_h1_bool}`,
          text: item === "H1" ? true : false,
          type: "boolean",
        };
        newKelimeler1.push(modulH1Data);
        newKelimeler1.push(modulH1Data1);
      } else {
        newKelimeler1.push(newKelime);
      }
    }
    
    fs.writeFileSync(
      inputsJsonName,
      JSON.stringify({
        filename: filename,
        kelimeler: newKelimeler1,
      })
    );
  }
  await replaceFolders(path.join(process.cwd(), dest_folder),'false');
  return { formpaths: formpaths, formpathsfolder: timeFolderName.toString() };
}
export async function TeknikDosyaFormYazdir(temp_name, inputs, risk) {
  let src_folder = `sources/asansor/teknikdosya/${temp_name}/`;
  let timeFolderName = new Date().getTime().toString();
  inputs.map((a) => {
    if (a.search == "{formpathsfolder}") {
      timeFolderName = a.text;
    }
  });

  let dest_folder =
    "public/uploads/planlama/denetim/" + timeFolderName + "/teknikdosya";
  let source_folder_ozellikler = fs.readFileSync(
    `${src_folder}/ozellikler.json`,
    "utf-8"
  );
  source_folder_ozellikler = JSON.parse(source_folder_ozellikler);

  let formpaths = [];
  if (!fs.existsSync(dest_folder)) {
    fs.mkdirSync(dest_folder, { recursive: true });
  }
  
  if (!!risk) {
    if (!risk.kabinust) {
      source_folder_ozellikler = source_folder_ozellikler.filter(
        (item) => item.filename !== "20.Kabin Üst Risk Analiz.docx"
      );
    }
    if (!risk.kuyudip) {
      source_folder_ozellikler = source_folder_ozellikler.filter(
        (item) => item.filename !== "21.Kuyu Dip Risk Analiz.docx"
      );
    }
    if (!risk.makdairesi) {
      source_folder_ozellikler = source_folder_ozellikler.filter(
        (item) => item.filename !== "22.Makine Dairesi Risk Analiz.docx"
      );
    }
  }else{
    source_folder_ozellikler = source_folder_ozellikler.filter(
        (item) => !(item.filename === "20.Kabin Üst Risk Analiz.docx" || item.filename === "21.Kuyu Dip Risk Analiz.docx" || item.filename === "22.Makine Dairesi Risk Analiz.docx")
      );
  }
  for (let i = 0; i < source_folder_ozellikler.length; i++) {
    let { filename, searchs } = source_folder_ozellikler[i];
    let srcCurrFile = path.join(process.cwd(), src_folder, filename);
    let destCurrFile = path.join(process.cwd(), dest_folder, filename);
    formpaths.push(
      `/uploads/planlama/denetim/${timeFolderName}/teknikdosya/${filename}`
    );
    fs.copyFileSync(srcCurrFile, destCurrFile);
    let newKelimeler = inputs.filter((a) =>
      searchs.some((b) => a.search === b)
    );
    let inputsJsonName = destCurrFile.replace(".docx", ".json");
   
    let newKelimeler1 = [];
    for (let i = 0; i < newKelimeler.length; i++) {
      let newKelime = newKelimeler[i];
      if (newKelime.search === "{modul}") {
        let item = newKelime.text.replace("Modul ", "");
        const modulGData = {
          search: `{G}`,
          text: item === "G" ? "√" : " ",
          type: "text",
        };
        const modulGData1 = {
          search: `{modul_g_bool}`,
          text: item === "G" ? true : false,
          type: "boolean",
        };
        newKelimeler1.push(modulGData);
        newKelimeler1.push(modulGData1);
        const modulBData = {
          search: `{B}`,
          text: item === "B" ? "√" : " ",
          type: "text",
        };
        const modulBData1 = {
          search: `{modul_b_bool}`,
          text: item === "B" ? true : false,
          type: "boolean",
        };
        newKelimeler1.push(modulBData);
        newKelimeler1.push(modulBData1);
        const modulEData = {
          search: `{E}`,
          text: item === "E" ? "√" : " ",
          type: "text",
        };
        const modulEData1 = {
          search: `{modul_e_bool}`,
          text: item === "E" ? true : false,
          type: "boolean",
        };
        newKelimeler1.push(modulEData);
        newKelimeler1.push(modulEData1);
        const modulH1Data = {
          search: `{H1}`,
          text: item === "H1" ? "√" : " ",
          type: "text",
        };
        const modulH1Data1 = {
          search: `{modul_h1_bool}`,
          text: item === "H1" ? true : false,
          type: "boolean",
        };
        newKelimeler1.push(modulH1Data);
        newKelimeler1.push(modulH1Data1);
      } else {
        newKelimeler1.push(newKelime);
      }
    }
    fs.writeFileSync(
      inputsJsonName,
      JSON.stringify({
        filename: filename,
        kelimeler: newKelimeler1,
      })
    );
  }
  await replaceFolders(path.join(process.cwd(), dest_folder),'true');
  return { formpaths: formpaths, formpathsfolder: timeFolderName.toString() };
}
async function replaceFolders(dest_folder,recursive) {
  const script_path = path.join(
    process.cwd(),
    "sources/asansor/shell-scripts/find-replace.ps1"
  );
  // Start-Process PowerShell -Verb Runas
  await cmd(`powershell.exe ${script_path} -folderPath ${dest_folder} -IsRecursive ${recursive}`,dest_folder);
  return;
}

//C:/Windows/System32/WindowsPowerShell/v1.0/
//C:\Windows\SysWOW64\WindowsPowerShell\v1.0

