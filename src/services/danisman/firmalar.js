import express from "express";
let router = express.Router({ mergeParams: true });
import { ArtiDoksanCertDB } from "../mysql.js";
export const DanismanFirmaApi = (app) => {
  router.post("/danis_firma/get-list", GetList);
  router.post("/danis_firma/add", AddItem);
  router.post("/danis_firma/update", UpdateItem);
  router.post("/danis_firma/delete", DeleteItem);
  router.post("/danis_firma/get-firma-name", GetFirmaById);
    router.post("/danis_firma/get-list-all", GetListAll);
  return app.use("/", router);
};
const GetListAll = async (req, res) => {
  const data = req.body;
  if (!data) {
    return res.json({ msg: "Data not found" });
  }
  const rows = await ArtiDoksanCertDB.Query("SELECT * FROM `danis_firma`");
  return res.json(rows);
};
const GetList = async (req, res) => {
  const data = req.body;
  if (!data) {
    return res.json({ msg: "Data not found" });
  }
  const {danisman_id} = data;
  const rows = await ArtiDoksanCertDB.Query("SELECT * FROM `danis_firma` WHERE danisman_id = ?",[danisman_id]);
  return res.json(rows);
};
const AddItem = async (req, res) => {
  const data = req.body;
  if (!data) {
    return res.json({ msg: "Data not found" });
  }
  await ArtiDoksanCertDB.Query(
    "INSERT INTO `danis_firma` SET ?",[data]
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
  await ArtiDoksanCertDB.Query("UPDATE `danis_firma` SET ? WHERE id = ?", [others,id]);
  return res.json({
    msg: "Ok!",
  });
};
const DeleteItem = async (req, res) => {
  const data = req.body;
  if (!data) {
    return res.json({ msg: "Data not found" });
  }
  await ArtiDoksanCertDB.Query("DELETE FROM `danis_firma` WHERE id = ?", [
    data.id,
  ]);
  return res.json({
    msg: "Ok!",
  });
};
const GetFirmaById = async (req, res) => {
  const data = req.body;
  if (!data) {
    return res.json({ msg: "Data not found" });
  }
  const resp = await ArtiDoksanCertDB.Query("Select * FROM `danis_firma` WHERE id = ?", [data.firma_id]);
  return res.json(resp[0]);
};


