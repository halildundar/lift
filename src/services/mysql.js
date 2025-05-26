import mysql from "mysql";
import { config } from "dotenv";
config({ path: ["const.env"] });
let dbConfig = {
  connectionLimit: 5, // default 10
  host: process.env.MYSQL_DB_HOST,
  user:process.env.NODE_ENV == "development" ? process.env.MYSQL_DB_USERNAME : process.env.MYSQL_DB_USERNAME1,
  password:process.env.NODE_ENV == "development" ? process.env.MYSQL_DB_PASSWORD : process.env.MYSQL_DB_PASSWORD1,
  database: process.env.MYSQL_DB_NAME,
  connectionLimit: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

const NewDB = function (database,user,password) {
  const dbConfigN = {...dbConfig,database,user,password};
  const pool = mysql.createPool(dbConfigN);
  const Connection = () => {
    return new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) reject(err);
        console.log("MySQL pool connected: threadId " + connection.threadId);
        const query = (sql, binding) => {
          return new Promise((resolve, reject) => {
            connection.query(sql, binding, (err, result) => {
              if (err) reject(err);
              resolve(result);
            });
          });
        };
        const release = () => {
          return new Promise((resolve, reject) => {
            if (err) reject(err);
            console.log("MySQL pool released: threadId " + connection.threadId);
            resolve(connection.release());
          });
        };
        resolve({ query, release });
      });
    });
  };
  const Query = (sql, binding) => {
    return new Promise((resolve, reject) => {
      pool.query(sql, binding, (err, result, fields) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  };
  return {Connection,Query}
};

// export const ArtiDoksanCertDB = new NewDB('artidoksancert','root','');
export const ArtiDoksanCertDB = new NewDB('artidoksan','adminn','Sb*i95_lJcG2xyfc');
// export const GeneralDB = new NewDB('geneldata','root','');
// export const pool = mysql.createPool(dbConfig);
// export const Connection = () => {
//   return new Promise((resolve, reject) => {
//     pool.getConnection((err, connection) => {
//       if (err) reject(err);
//       console.log("MySQL pool connected: threadId " + connection.threadId);
//       const query = (sql, binding) => {
//         return new Promise((resolve, reject) => {
//           connection.query(sql, binding, (err, result) => {
//             if (err) reject(err);
//             resolve(result);
//           });
//         });
//       };
//       const release = () => {
//         return new Promise((resolve, reject) => {
//           if (err) reject(err);
//           console.log("MySQL pool released: threadId " + connection.threadId);
//           resolve(connection.release());
//         });
//       };
//       resolve({ query, release });
//     });
//   });
// };
// export const Query = (sql, binding) => {
//   return new Promise((resolve, reject) => {
//     pool.query(sql, binding, (err, result, fields) => {
//       if (err) reject(err);
//       resolve(result);
//     });
//   });
// };
