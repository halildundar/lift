import express from "express";
import {  ArtiDoksanCertDB } from "./mysql.js";
let router = express.Router({ mergeParams: true });
export const ProjeApi = (app) => {
  router.post("/proje/get-planlamalar", GetPlanlamalar);
  router.post("/proje/get-denetim-by-planid", GetDenetimByPlanId);
  router.post("/proje/get-asansor-firmaByplanId", GetAsFirmaByPlanId);
  router.post("/proje/update-denetim-proje", UpdateDenetimProje);
  router.post("/proje/update-plan-status", UpdatePlanStatus);
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
const UpdateDenetimProje = async (req, res) => {
  const data = req.body;
  if (!data) {
    return res.json({ msg: "Data not found" });
  }
  console.log(data);
  const {id,...others} = data;
  await ArtiDoksanCertDB.Query("UPDATE `denetim` SET ? WHERE id = ?",[others,id]);
  return res.json({
    ...data
  });
};
const GetAsFirmaByPlanId = async(req,res)=>{
  const data = req.body;
  if (!data) {
    return res.json({ msg: "Data not found" });
  }
  const {as_firma_id} = data;
  const rows = await ArtiDoksanCertDB.Query(
    "SELECT * FROM `as-firma` WHERE id = ?",[as_firma_id]
  );
  return res.json({
    ...rows,
  });
}

const GetPlanlamalar = async (req, res) => {
  const data = req.body;
  if (!data) {
    return res.json({ msg: "Data not found" });
  }
  // const rows = await ArtiDoksanCertDB.Query(
  //   "SELECT * FROM `planlama` WHERE status = 'Proje Bekleniyor'"
  // );
  const {plan_status} = data;
  const rows = await ArtiDoksanCertDB.Query(
    "SELECT * FROM `planlama` where status = ?",[plan_status]
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
