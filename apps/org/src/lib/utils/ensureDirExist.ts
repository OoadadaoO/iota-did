import * as fs from "fs";
import * as path from "path";

export function ensureDirExist(filePath: string) {
  const dir = path.dirname(filePath);

  fs.mkdir(dir, { recursive: true }, (err) => {
    if (err) {
      console.error(`Error creating directory ${dir}:`, err);
    } else {
      console.log(`Directory ${dir} is ready.`);
    }
  });
}
