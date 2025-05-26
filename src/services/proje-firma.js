import express from "express";
let router = express.Router({ mergeParams: true });
import { ArtiDoksanCertDB } from "./mysql.js";
export const ProjeFirmaApi = (app) => {
  router.post("/proje-firma/get-list", GetList);
  router.post("/proje-firma/add", AddItem);
  router.post("/proje-firma/update", UpdateItem);
  router.post("/proje-firma/delete", DeleteItem);
  return app.use("/", router);
};
const GetList = async (req, res) => {
  const data = req.body;
  if (!data) {
    return res.json({ msg: "Data not found" });
  }
  const rows = await ArtiDoksanCertDB.Query("SELECT * FROM `proje-firma`");
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
  let valueString = Object.values(data);
  await ArtiDoksanCertDB.Query(
    "INSERT INTO `proje-firma` VALUES (0,?)",
    [[...valueString]]
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
  await ArtiDoksanCertDB.Query("UPDATE `proje-firma` SET ? WHERE id = ?", [others,id]);
  return res.json({
    msg: "Ok!",
  });
};
const DeleteItem = async (req, res) => {
  const data = req.body;
  if (!data) {
    return res.json({ msg: "Data not found" });
  }
  await ArtiDoksanCertDB.Query("DELETE FROM `proje-firma` WHERE id = ?", [
    data.id,
  ]);
  return res.json({
    msg: "Ok!",
  });
};
