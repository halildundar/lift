import express from "express";
import { ArtiDoksanCertDB } from "./mysql.js";
let router = express.Router({ mergeParams: true });
// import { ArtiDoksanCertDB } from "./mysql.js";
export const DenetimApi = (app) => {
  router.post("/denetim/get-denetim-by-planid", GetDenetimByPlanId);
  router.post("/denetim/save-asansor-bilgi", SaveAsansorBilgi);
  router.post("/denetim/update-asansor-bilgi", UpdateAsansorBilgi);
  router.post("/denetim/get-sertifika", GetSertifikaById);
  router.post("/denetim/delete-denetim", DeleteDenetim);
  router.post("/denetim/get-comps", GetKomps);
  router.post("/denetim/update-modulb-list", UpdateModulBKompList);
  router.post("/denetim/update-imzali-formlar", UpdateImzaliFormlar);
  router.post("/denetim/update-tds-folders", UpdateTeknikDosya);
  router.post("/denetim/get-planlamalar", GetPlanlamalarForMonth);
  router.post("/denetim/update-risk", UpdateRisk);
  router.post("/denetim/update-planstatus", UpdatePlanStatus);
  return app.use("/", router);
};
const UpdatePlanStatus = async (req, res) => {
  const data = req.body;
  if (!data) {
    return res.json({ msg: "Data not found" });
  }
  const { plan_id, status } = data;
  await ArtiDoksanCertDB.Query("UPDATE `planlama` SET status = ? WHERE id = ?", [
    status,
    plan_id,
  ]);
  return res.json({
    ...data,
  });
};
const UpdateRisk = async (req, res) => {
  const data = req.body;
  if (!data) {
    return res.json({ msg: "Data not found" });
  }
  const { denetim_id, risk } = data;
  await ArtiDoksanCertDB.Query("UPDATE `denetim` SET risk = ? WHERE id = ?", [
    JSON.stringify(risk),
    denetim_id,
  ]);
  return res.json({
    ...data,
  });
};
const GetPlanlamalarForMonth = async (req, res) => {
  const data = req.body;
  if (!data) {
    return res.json({ msg: "Data not found" });
  }
  const { start_date, end_date, plan_status } = data;
  const rows = await ArtiDoksanCertDB.Query(
    "SELECT * from `planlama` WHERE (str_to_date(denetim_tarih,'%d.%m.%Y') between str_to_date(?,'%d.%m.%Y') AND str_to_date(?,'%d.%m.%Y')) AND status = ?",
    [start_date, end_date, plan_status]
  );
  return res.json({
    ...rows,
  });
};
const UpdateImzaliFormlar = async (req, res) => {
  const data = req.body;
  if (!data) {
    return res.json({ msg: "Data not found" });
  }
  const { denetim_id, imzali_formlar } = data;
  await ArtiDoksanCertDB.Query(
    "UPDATE `denetim` SET imzali_formlar = ? WHERE id = ?",
    [JSON.stringify(imzali_formlar), denetim_id]
  );
  return res.json({
    ...data,
  });
};
const UpdateTeknikDosya = async (req, res) => {
  const data = req.body;
  if (!data) {
    return res.json({ msg: "Data not found" });
  }
  const { denetim_id, tds_folders } = data;
  await ArtiDoksanCertDB.Query(
    "UPDATE `denetim` SET tds_folders = ? WHERE id = ?",
    [JSON.stringify(tds_folders), denetim_id]
  );
  return res.json({
    ...data,
  });
};
const UpdateModulBKompList = async (req, res) => {
  const data = req.body;
  if (!data) {
    return res.json({ msg: "Data not found" });
  }
  const { denetim_id, modulb_certs } = data;
  console.log(data);
  await ArtiDoksanCertDB.Query(
    "UPDATE `denetim` SET modulb_certs = ? WHERE id = ?",
    [JSON.stringify(modulb_certs), denetim_id]
  );
  return res.json({
    ...data,
  });
};
const DeleteDenetim = async (req, res) => {
  const data = req.body;
  if (!data) {
    return res.json({ msg: "Data not found" });
  }
  await ArtiDoksanCertDB.Query("DELETE FROM `denetim` WHERE planlama_id = ?", [
    data.id,
  ]);
  return res.json({
    msg: "Ok!",
  });
};
const GetKomps = async (req, res) => {
  const data = req.body;
  if (!data) {
    return res.json({ msg: "Data not found" });
  }
  const { tablename } = data;
  const rows = await ArtiDoksanCertDB.Query(
    "SELECT * FROM `" + tablename + "`"
  );
  return res.json({
    ...rows,
  });
};
const GetSertifikaById = async (req, res) => {
  const data = req.body;
  if (!data) {
    return res.json({ msg: "Data not found" });
  }
  const { tur, certId } = data;
  const rows = await ArtiDoksanCertDB.Query(
    "SELECT * FROM `" + tur + "` WHERE id = ?",
    [certId]
  );
  return res.json({
    ...rows,
  });
};
const GetDenetimByPlanId = async (req, res) => {
  const data = req.body;
  if (!data) {
    return res.json({ msg: "Data not found" });
  }
  const { planId } = data;
  const rows = await ArtiDoksanCertDB.Query(
    "SELECT * FROM `denetim` WHERE planlama_id = ?",
    [planId]
  );
  return res.json({
    ...rows,
  });
};
const SaveAsansorBilgi = async (req, res) => {
  const data = req.body;
  if (!data) {
    return res.json({ msg: "Data not found" });
  }
  await ArtiDoksanCertDB.Query("INSERT INTO `denetim` SET ?", [data]);
  return res.json({
    ...data,
  });
};
const UpdateAsansorBilgi = async (req, res) => {
  const data = req.body;
  if (!data) {
    return res.json({ msg: "Data not found" });
  }
  const { id, ...others } = data;
  await ArtiDoksanCertDB.Query("UPDATE `denetim` SET ? WHERE id = ?", [
    others,
    id,
  ]);
  return res.json({
    ...data,
  });
};
