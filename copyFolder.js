import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  unlinkSync,
} from "fs";
import { resolve } from "path";

//packege.json file
let data = readFileSync("package.json");
data = JSON.parse(data);
data.type = "commonjs";

if (process.env.NODE_ENV !== "production") {
  data.devDependencies = {
    nodemon: data.devDependencies.nodemon,
  };
  // data.scripts.serve = 'nodemon server.js -e js,hbs,json --ignore ./public/**/*.js';
  data.scripts.serve = "nodemon server.js -e js,hbs,json --ignore ./public/";
} else {
  delete data.devDependencies;
  delete data.scripts.serve;
  unlinkSync(resolve(process.cwd(), "dist/viewchanges.js"));
  unlinkSync(resolve(process.cwd(), "dist/server.js.LICENSE.txt"));
}

delete data.scripts.test;
delete data.scripts.build;
writeFileSync("dist/package.json", JSON.stringify(data));
