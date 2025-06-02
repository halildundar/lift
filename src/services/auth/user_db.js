import { compare } from "bcryptjs";
import { ArtiDoksanCertDB } from "../mysql.js";

export let handleLogin = async (email, passw) => {
  let user = await findUserByEmail(email);
  const isMatch = await compare(passw, user.sifre);
  if (isMatch) {
    return isMatch;
  }
  return `The password that you've entered is incorrect`;
};
export let findUserByEmail = async (email) => {
  try {
    const rows = await ArtiDoksanCertDB.Query("SELECT * FROM `personel` WHERE `email` = ? ", email);
    return rows[0];
  } catch (error) {
    console.log(error);
    return false;
  }
};
export let findUserById = async (id) => {
  try {
    const rows = await ArtiDoksanCertDB.Query("SELECT * FROM `personel` WHERE `id` = ? ", id);
    return rows[0];
  } catch (error) {
    console.log(error);
    return false;
  }
};
export let comparePassword = (passw, userObject) => {
  return new Promise(async (resolve, reject) => {
    try {
      // const isMatch = await compare(passw, userObject.passw);
      const isMatch = passw === userObject.sifre;
      if (isMatch) {
        resolve(true);
      }else{
        resolve(`The password that you've entered is incorrect`);
      }
    } catch (e) {
      reject(e);
    }
  });
};

export let getpersonel = async ()=>{
  try {
    const rows = await ArtiDoksanCertDB.Query("SELECT * FROM `personel`");
    console.log(rows);
    return rows;
  } catch (error) {
    console.log(error);
    return false;
  }
}
export let updateUser = async (id,queryData)=>{
  try {
    const rows = await ArtiDoksanCertDB.Query("UPDATE `personel` SET ? WHERE id = ?",[queryData,id]);
    return rows;
  } catch (error) {
    console.log(error);
    return false;
  }
}
export let saveUser = async (queryData)=>{
  try {
    const rows = await ArtiDoksanCertDB.Query("INSERT INTO `personel` VALUES (0,?)",[queryData]);
    return rows;
  } catch (error) {
    console.log(error);
    return false;
  }
}
export let deleteUser = async (id)=>{
  try {
    const rows = await ArtiDoksanCertDB.Query("DELETE FROM `personel` WHERE id = ?",[id]);
    return rows;
  } catch (error) {
    console.log(error);
    return false;
  }
}

