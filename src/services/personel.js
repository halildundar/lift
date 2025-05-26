import express from "express";
let router = express.Router({ mergeParams: true });
import { ArtiDoksanCertDB } from "./mysql.js";
export const PersonelApi = (app) => {
  router.post("/personel/get-list", GetList);
  router.post("/personel/add", AddItem);
  router.post("/personel/update", UpdateItem);
  router.post("/personel/delete", DeleteItem);
  router.post("/personel/get-personel-name", GetPersonelName);
  return app.use("/", router);
};
const GetList = async (req, res) => {
  const data = req.body;
  if (!data) {
    return res.json({ msg: "Data not found" });
  }
  const rows = await ArtiDoksanCertDB.Query("SELECT * FROM `personel`");
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
    "INSERT INTO `personel` VALUES (0,?)",
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
  await ArtiDoksanCertDB.Query("UPDATE `personel` SET ? WHERE id = ?", [others,id]);
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
  await ArtiDoksanCertDB.Query("DELETE FROM `personel` WHERE id = ?", [
    data.id,
  ]);
  return res.json({
    msg: "Ok!",
  });
};
const GetPersonelName = async (req, res) => {
  const data = req.body;
  if (!data) {
    return res.json({ msg: "Data not found" });
  }
  const personel_id = data.personel_id;
  const denetciAdi = await ArtiDoksanCertDB.Query("Select name FROM `personel` WHERE id = ?", [personel_id]);
  return res.json(denetciAdi[0]);
};
