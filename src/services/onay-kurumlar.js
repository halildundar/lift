import express from "express";
let router = express.Router({ mergeParams: true });
import { ArtiDoksanCertDB } from "./mysql.js";
export const OnayKurumApi = (app) => {
  router.post("/onay-kurumlar/get-list", GetList);
  router.post("/onay-kurumlar/add", AddItem);
  router.post("/onay-kurumlar/update", UpdateItem);
  router.post("/onay-kurumlar/delete", DeleteItem);
  return app.use("/", router);
};
const GetList = async (req, res) => {
  const data = req.body;
  if (!data) {
    return res.json({ msg: "Data not found" });
  }
  const rows = await ArtiDoksanCertDB.Query("SELECT * FROM `onay-kurumlar`");
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
    "INSERT INTO `onay-kurumlar` VALUES (0,?)",
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
  await ArtiDoksanCertDB.Query("UPDATE `onay-kurumlar` SET ? WHERE id = ?", [others,id]);
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
  await ArtiDoksanCertDB.Query("DELETE FROM `onay-kurumlar` WHERE id = ?", [
    data.id,
  ]);
  return res.json({
    msg: "Ok!",
  });
};
