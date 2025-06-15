import express from "express";
let router = express.Router({ mergeParams: true });
import { join } from "node:path";
import { readdirSync,existsSync } from "node:fs";
import { ArtiDoksanCertDB } from "../mysql.js";
export const DanismanBasvuruApi = (app) => {
  router.post("/danis_basvuru/get-list", GetList);
  router.post("/danis_basvuru/add", AddItem);
  router.post("/danis_basvuru/update", UpdateItem);
  router.post("/danis_basvuru/delete", DeleteItem);
  router.post("/danis_basvuru/get-basvuru", GetBasvuruById);
  router.post("/danis_basvuru/get-ortak-files", GetOrtakFiles);
  return app.use("/", router);
};
const GetOrtakFiles = async (req, res) => {
  const data = req.body;
  if (!data) {
    return res.json({ msg: "Data not found" });
  }
  const { danisman_id } = data;
  let folderpath = join(
    process.cwd(),
    "public/uploads/danisman/" + danisman_id + "/ortak"
  );
  // folderpath = join(process.cwd(),"public")
  let files = [];
  if (existsSync(folderpath)) {
    readdirSync(folderpath).forEach((file) => {
      files.push(file);
    });
  }
  return res.json({ files: files });
};
const GetList = async (req, res) => {
  const data = req.body;
  if (!data) {
    return res.json({ msg: "Data not found" });
  }
  const { danisman_id } = data;
  const rows = await ArtiDoksanCertDB.Query(
    "SELECT * FROM `danis_basvuru` WHERE danisman_id = ?",
    [danisman_id]
  );
  return res.json(rows);
};
const AddItem = async (req, res) => {
  const data = req.body;
  if (!data) {
    return res.json({ msg: "Data not found" });
  }
  await ArtiDoksanCertDB.Query("INSERT INTO `danis_basvuru` SET ?", [data]);
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
  await ArtiDoksanCertDB.Query("UPDATE `danis_basvuru` SET ? WHERE id = ?", [
    others,
    id,
  ]);
  return res.json({
    msg: "Ok!",
  });
};
const DeleteItem = async (req, res) => {
  const data = req.body;
  if (!data) {
    return res.json({ msg: "Data not found" });
  }
  await ArtiDoksanCertDB.Query("DELETE FROM `danis_basvuru` WHERE id = ?", [
    data.id,
  ]);
  return res.json({
    msg: "Ok!",
  });
};
const GetBasvuruById = async (req, res) => {
  const data = req.body;
  if (!data) {
    return res.json({ msg: "Data not found" });
  }
  const resp = await ArtiDoksanCertDB.Query(
    "Select * FROM `danis_basvuru` WHERE id = ?",
    [data.id]
  );
  return res.json(resp[0]);
};
