import express from "express";
let router = express.Router({ mergeParams: true });
import { ArtiDoksanCertDB } from "./mysql.js";
export const AsFirmaApi = (app) => {
  router.post("/as-firma/get-list", GetList);
  router.post("/as-firma/add", AddItem);
  router.post("/as-firma/update", UpdateItem);
  router.post("/as-firma/delete", DeleteItem);
  router.post("/as-firma/get-firma-name", GetFirmaById);
  return app.use("/", router);
};
const GetList = async (req, res) => {
  const data = req.body;
  if (!data) {
    return res.json({ msg: "Data not found" });
  }
  const rows = await ArtiDoksanCertDB.Query("SELECT * FROM `as-firma`");
  return res.json({
    msg: "Ok!",
    data: rows,
  });
};
const AddItem = async (req, res) => {
  const data = req.body;
  if (!data) {
    return res.json({ msg: "Data not found" });
  }
 
  await ArtiDoksanCertDB.Query(
    "INSERT INTO `as-firma` SET ?",
    [data]
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
  await ArtiDoksanCertDB.Query("UPDATE `as-firma` SET ? WHERE id = ?", [others,id]);
  return res.json({
    msg: "Ok!",
  });
};
const DeleteItem = async (req, res) => {
  const data = req.body;
  if (!data) {
    return res.json({ msg: "Data not found" });
  }
  await ArtiDoksanCertDB.Query("DELETE FROM `as-firma` WHERE id = ?", [
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
  console.log(data);
  const resp = await ArtiDoksanCertDB.Query("Select * FROM `as-firma` WHERE id = ?", [data.as_firma_id]);
  return res.json(resp[0]);
};



