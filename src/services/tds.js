import express from "express";
import { ArtiDoksanCertDB } from "./mysql.js";
import { TeknikDosyaFormYazdir } from "./find-replace.js";
import { makeZipFolder} from "./make-zip.js";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
} from "node:fs";
import { join } from "path";
let router = express.Router({ mergeParams: true });
export const TDSApi = (app) => {
  router.post("/tds/get-planlamalar", GetPlanlamalar);
  router.post("/tds/get-onay-kurum", GetOnayKurumByCertId);
  router.post("/tds/get-cert", GetCertById);
  router.post("/tds/teknik-dosya", TeknikDosyaYazdir);
  router.post("/tds/update-plan-status", UpdatePlanStatus);
  router.post("/tds/download-forms", downloadAllForms);
    router.post("/tds/update-ab-son-tarih", UpdateAbSonTarih);
  return app.use("/", router);
};
const UpdateAbSonTarih = async (req, res) => {
  const data = req.body;
  if (!data) {
    return res.json({ msg: "Data not found" });
  }
  const { denetim_id, ...others } = data;
  await ArtiDoksanCertDB.Query(
    "UPDATE `denetim` SET ? WHERE id = ?",
    [others, denetim_id]
  );
  return res.json({
    ...data,
  });
};
const downloadAllForms = async (req, res) => {
  const data = req.body;
  if (!data) {
    return res.json({ msg: "Data not found" });
  }
  const destFolder = `${process.cwd()}/public/downloads/${new Date().getTime()}`;
  if (!existsSync(destFolder)) {
    mkdirSync(destFolder, { recursive: true });
  }
  const { forms } = data;
  for (let i = 0; i < forms.length; i++) {
    let { url, filename } = forms[i];
    if (!!url) {
      console.log( `${process.cwd()}/public/${url}`);
      if(url.includes('7.Photo') || url.includes('6.Declaration of Confirmity') || url.includes('8.Technical Descriptions and Manuals')){
        url = url.replaceAll('.docx',".pdf");
      }
      copyFileSync(
        `${process.cwd()}/public/${url}`,
        `${join(destFolder, filename)}`
      );
    }
  }
  await makeZipFolder(destFolder,destFolder);
  const items = destFolder.split('/').slice(-2).join('/');
  return res.json({downurl:`/${items}.zip`});
};
const UpdatePlanStatus = async (req, res) => {
  const data = req.body;
  if (!data) {
    return res.json({ msg: "Data not found" });
  }
  const { plan_id, status } = data;
  await ArtiDoksanCertDB.Query(
    "UPDATE `planlama` SET status = ? WHERE id = ?",
    [status, plan_id]
  );
  return res.json({
    ...data,
  });
};
const GetPlanlamalar = async (req, res) => {
  const data = req.body;
  if (!data) {
    return res.json({ msg: "Data not found" });
  }
  const { status } = data;
  const rows = await ArtiDoksanCertDB.Query(
    "SELECT * FROM `planlama` WHERE status = ?",
    [status]
  );
  return res.json({
    ...rows,
  });
};
const GetOnayKurumByCertId = async (req, res) => {
  const data = req.body;
  if (!data) {
    return res.json({ msg: "Data not found" });
  }
  const { comp_name, cert_id } = data;
  const rows = await ArtiDoksanCertDB.Query(
    "Select * from `onay-kurumlar` where id = (Select onay_kurum_id from `" +
      comp_name +
      "` where id = " +
      cert_id +
      ")"
  );
  return res.json({
    ...rows,
  });
};
const GetCertById = async (req, res) => {
  const data = req.body;
  if (!data) {
    return res.json({ msg: "Data not found" });
  }
  const { comp_name, cert_id } = data;
  let rows;
  if (comp_name === "hiz-regulatoru") {
    rows = await ArtiDoksanCertDB.Query(
      "Select cert_no,nom_hiz,tripped_hiz from `" +
        comp_name +
        "` where id = " +
        cert_id +
        ""
    );
  } else if (comp_name === "fren" || comp_name === "tampon") {
    rows = await ArtiDoksanCertDB.Query(
      "Select cert_no,hiz,kapasite from `" +
        comp_name +
        "` where id = " +
        cert_id +
        ""
    );
  } else {
    rows = await ArtiDoksanCertDB.Query(
      "Select cert_no from `" + comp_name + "` where id = " + cert_id + ""
    );
  }

  return res.json({
    ...rows,
  });
};
const TeknikDosyaYazdir = async (req, res) => {
  const data = req.body;
  if (!data) {
    return res.json({ msg: "Data not found" });
  }
  const rawResponse = await fetch('http://localhost:4000/tds/teknik-dosya',{
    method: 'POST',
    headers:{"Accept":'application/json',"Content-Type":"application/json"},
    body: JSON.stringify(data)
  });

   const respData = await rawResponse.json();
  return res.json(respData);
  // return res.json({sended_data,risk})
  // return res.json({template_name,sended_data})
};
