import { spawn } from "node:child_process";
import fs from "fs";
// const fs = require("node:fs");
import path from "path";

function cmd(command) {
  let p = spawn(command, { shell: true });
  return new Promise((resolve) => {
    p.stdout.on("data", (x) => {
      process.stdout.write(x.toString());
    });
    p.stderr.on("data", (x) => {
      process.stderr.write(x.toString());
    });
    p.on("exit", (code) => {
      resolve(code);
    });
    p.stdin.end();
  });
}
export async function makeZipFolder(folderPath,zipPath) {
  const script_path = path.join(
    process.cwd(),
    "sources/asansor/shell-scripts/make-zip.ps1"
  );
  await cmd(`powershell.exe ${script_path} -folderPath ${folderPath} -zipPath ${zipPath}`);
  return;
}
export async function addFileToZip(file_path,destZip) {
  const script_path = path.join(
    process.cwd(),
    "sources/asansor/shell-scripts/addfile-to-zip.ps1"
  );
  await cmd(`powershell.exe ${script_path} -filePath '${file_path}' -destZip ${destZip}`);
  return;
}

