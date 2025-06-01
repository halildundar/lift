import express from "express";
import { ArtiDoksanCertDB } from "./mysql.js";
import { DenetimOncesiFormYazdir } from './find-replace.js';
let router = express.Router({ mergeParams: true });
// import { ArtiDoksanCertDB } from "./mysql.js";
export const PlanlamaApi = (app) => {
  router.post("/planlama/denetim-formlar",(req, res, next) => {
    res.setTimeout(300000, ()=>{
        console.log('Request has timed out.');
            res.sendStatus(408);
        });
    next();
}, DenetimFormlar);
  router.post("/planlama/get-il", GetIl);
  router.post("/planlama/get-iller", GetIller);
  router.post("/planlama/get-ilce", GetIlce);
  router.post("/planlama/get-ilceler", GetIlceler);
  router.post("/planlama/get-mahalle", GetMahalle);
  router.post("/planlama/get-mahalleler", GetMahalleler);
  router.post("/planlama/get-denetciler", GetDenetciler);
  router.post("/planlama/get-as-firmalar", GetAsFirmalar);
  router.post("/planlama/add", AddItem);
  router.post("/planlama/update", UpdateItem);
  router.post("/planlama/delete", DeleteItem);
  router.post("/planlama/get-planlamalar", GetPlanlamalarForMonth);
  router.post("/planlama/get-lastday-plans", GetLastDayOfMonthsPlans);
  return app.use("/", router);
};
const DenetimFormlar = async (req, res) => {
  const data = req.body;
  if (!data) {
    return res.json({ msg: "Data not found" });
  }
  let valueString = Object.values(data);
  let respData = await DenetimOncesiFormYazdir(valueString);
  fetch('http://localhost:4000/planlama/denetim-formlar',{
    headers:{"Accept":'applicatio/json',"Content-Type":"application/json"},
    body: JSON.stringify({a: 1, b: 'Textual content'})
  });
   const content = await rawResponse.json();
   console.log(content);
  return res.json(respData);
};
// SELECT * from `planlama` WHERE str_to_date(denetim_tarih,'%d.%m.%Y') between str_to_date('02.01.2025','%d.%m.%Y') AND str_to_date('05.03.2025','%d.%m.%Y')
const GetPlanlamalarForMonth = async(req,res)=>{
  const data = req.body;
  if (!data) {
    return res.json({ msg: "Data not found" });
  }
  const {start_date,end_date} = data;
  const rows = await ArtiDoksanCertDB.Query("SELECT * from `planlama` WHERE (str_to_date(denetim_tarih,'%d.%m.%Y') between str_to_date(?,'%d.%m.%Y') AND str_to_date(?,'%d.%m.%Y'))",[start_date,end_date]);
  return res.json({
    ...rows
  });
}
const GetLastDayOfMonthsPlans = async(req,res)=>{
  const data = req.body;
  if (!data) {
    return res.json({ msg: "Data not found" });
  }
  const {last_date} = data;
  const rows = await ArtiDoksanCertDB.Query("SELECT * from `planlama` WHERE str_to_date(denetim_tarih,'%d.%m.%Y') = str_to_date(?,'%d.%m.%Y')",[last_date]);
  return res.json({
    ...rows
  });
}
const AddItem = async (req, res) => {
  const data = req.body;
  if (!data) {
    return res.json({ msg: "Data not found" });
  }
  // const { formpaths,...others} = data;
  // let valueString = Object.values(data);
  // await ArtiDoksanCertDB.Query(
  //   "INSERT INTO `planlama` VALUES (0,?)",
  //   [[...valueString]]
  // );
  await ArtiDoksanCertDB.Query(
    "INSERT INTO `planlama` SET ?",[data]
  );
  return res.json({
    msg: "Ok!",
  });
};
const UpdateItem = async (req, res) => {
  const data = req.body;
  if (!data) {
    return res.json({ msg: "Data not found" });
  }
  const { id, ...others } = data;
  await ArtiDoksanCertDB.Query("UPDATE `planlama` SET ? WHERE id = ?", [others,id]);
  return res.json({
    msg: "Ok!",
  });
};
const DeleteItem = async (req, res) => {
  const data = req.body;
  if (!data) {
    return res.json({ msg: "Data not found" });
  }
  console.log(data);
  await ArtiDoksanCertDB.Query("DELETE FROM `planlama` WHERE id = ?", [
    data.id,
  ]);
  return res.json({
    msg: "Ok!",
  });
};
const GetAsFirmalar = async (req, res) => {
  const data = req.body;
  if (!data) {
    return res.json({ msg: "Data not found" });
  }
  const rows = await ArtiDoksanCertDB.Query("SELECT * FROM `as-firma`");
  return res.json({
    ...rows
  });
};
const GetDenetciler = async (req, res) => {
  const data = req.body;
  if (!data) {
    return res.json({ msg: "Data not found" });
  }
  const rows = await ArtiDoksanCertDB.Query("SELECT id,name,modul_atama FROM `personel` WHERE status = ? AND gorev = ?",[1,'Denetçi']);
  return res.json({
    ...rows
  });
};

const GetMahalleler = async (req, res) => {
  const data = req.body;
  if (!data) {
    return res.json({ msg: "Data not found" });
  }
  const { il_id,ilce_id } = data;
  const rows = await ArtiDoksanCertDB.Query("SELECT * FROM `mahalleler` where il_id = ? AND ilce_id = ?",[il_id,ilce_id]);
  return res.json({
    ...rows
  });
};
const GetIlceler = async (req, res) => {
  const data = req.body;
  if (!data) {
    return res.json({ msg: "Data not found" });
  }
  const { il_id } = data;
  const rows = await ArtiDoksanCertDB.Query("SELECT * FROM `ilceler` where il_id = ?",[il_id]);
  return res.json({
    ...rows
  });
};
const GetIller = async (req, res) => {
  const data = req.body;
  if (!data) {
    return res.json({ msg: "Data not found" });
  }
  const rows = await ArtiDoksanCertDB.Query("SELECT * FROM `iller`");
  return res.json({
    ...rows
  });
};
const GetIl = async (req, res) => {
  const data = req.body;
  if (!data) {
    return res.json({ msg: "Data not found" });
  }
  const {il_id} = data;
  const rows = await ArtiDoksanCertDB.Query("SELECT * FROM `iller` WHERE id = ?",[il_id]);
  return res.json({
    ...rows
  });
};
const GetIlce = async (req, res) => {
  const data = req.body;
  if (!data) {
    return res.json({ msg: "Data not found" });
  }
  const {ilce_id} = data;
  const rows = await ArtiDoksanCertDB.Query("SELECT * FROM `ilceler` WHERE id = ?",[ilce_id]);
  return res.json({
    ...rows
  });
};
const GetMahalle = async (req, res) => {
  const data = req.body;
  if (!data) {
    return res.json({ msg: "Data not found" });
  }
  const {mahalle_id} = data;
  const rows = await ArtiDoksanCertDB.Query("SELECT * FROM `mahalleler` WHERE id = ?",[mahalle_id]);
  return res.json({
    ...rows
  });
};