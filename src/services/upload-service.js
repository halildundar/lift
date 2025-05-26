import multer from "multer";
import express from "express";
import { mkdirSync, existsSync,unlinkSync,rmdirSync } from "fs";
let router = express.Router({ mergeParams: true });
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const { dest_path } = req.body;
    let new_path = process.cwd() + '/public'+ dest_path;
    const isExist = existsSync(new_path);
    // console.log('detPath: ',new_path,isExist)
    if (!isExist) {
      mkdirSync(new_path, { recursive: true });
    }
    cb(null, new_path);
  },
  filename: function (req, file, cb) {
    // console.log(req.body);
    const { filename } = req.body;
    // console.log('filename: ',filename + "." + file.originalname.split(".").pop())
    // const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, filename + "." + file.originalname.split(".").pop());
  },
});

const upload = multer({ storage: storage });
export const UplaodFileApi = (app) => {
  
  router.post("/stat/fileupload", upload.single('file'),(req,res)=>{
    res.status(200).json({msg:'Ok!'})
  });
  router.post("/stat/filedelete", (req,res)=>{
    const data = req.body;
    if(!data){
      return res.json({msg:'Data Not found'})
    }
    const { filepath } = req.body;
    let new_path = process.cwd() + '/public'+ filepath;
    const isExist = existsSync(new_path);
    if(isExist){
      unlinkSync(new_path);
    }
    return res.json({msg:'Kaldırıldı'})
  });
  router.post("/stat/folderdelete", (req,res)=>{
    const data = req.body;
    if(!data){
      return res.json({msg:'Data Not found'})
    }
    const { folderpath } = req.body;
    let new_path = process.cwd() + '/public'+ folderpath;
    console.log(new_path);
    const isExist = existsSync(new_path);
    if(isExist){
      console.log("isExist:",isExist);
      rmdirSync(new_path, { recursive: true });
    }
    return res.json({msg:'Kaldırıldı'})
  });
  return app.use("/", router);
};
