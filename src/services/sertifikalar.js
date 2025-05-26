import express from "express";
let router = express.Router({ mergeParams: true });
import { ArtiDoksanCertDB } from "./mysql.js";
export const SertifikaApi = (app) => {
  router.post("/sertifikalar/get-list", GetSertifikalarForComp);
  router.post("/sertifikalar/add", AddSertifikaForComp);
  router.post("/sertifikalar/update", UpdateSertifikaForComp);
  router.post("/sertifikalar/delete", DeleteSertifikaForComp);
  return app.use("/", router);
};
const GetSertifikalarForComp = async (req, res) => {
  const data = req.body;
  if (!data) {
    return res.json({ msg: "Data not found" });
  }
  const rows = await ArtiDoksanCertDB.Query("SELECT * FROM `" + data.component+"`");
  return res.json({
    msg: "Ok!",
    data: rows,
  });
};
const AddSertifikaForComp = async (req, res) => {
  const data = req.body;
  if (!data) {
    return res.json({ msg: "Data not found" });
  }
  let values = [0];
  console.log(JSON.stringify(data.certdata));
  for (let index = 0; index < Object.values(data.certdata).length; index++) {
    const element = Object.values(data.certdata)[index];
    if(typeof element == 'object'){
      values.push(JSON.stringify(element))
    }else{
      values.push(element);
    }
  }
  console.log(values);
  await ArtiDoksanCertDB.Query("INSERT INTO `"+data.component+"` VALUES (?)",[values])
  return res.json({
    msg: "Ok!",
  });
};
const UpdateSertifikaForComp = async (req, res) => {
  const data = req.body;
  if (!data) {
    return res.json({ msg: "Data not found" });
  }
  const {id,...others}=data.certdata;
  await ArtiDoksanCertDB.Query("UPDATE `" + data.component +"` SET ? WHERE id = ?",[others,id]);
  return res.json({
    msg: "Ok!",
  });
};
const DeleteSertifikaForComp = async (req, res) => {
  const data = req.body;
  if (!data) {
    return res.json({ msg: "Data not found" });
  }
  await ArtiDoksanCertDB.Query("DELETE FROM `"+ data.component+"` WHERE id = ?",[data.certdata.id]);
  return res.json({
    msg: "Ok!",
  });
};