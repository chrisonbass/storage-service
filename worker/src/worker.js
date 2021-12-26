// /quarantine-storage/test-uploads/images/296720af-2aa0-494f-bcb9-3d9dcceefb41/
import fs from 'fs';
import execCommand from "./utils/execCommand.js";

const Q_PATH = "/quarantine-storage";

async function main() {
  const testFileDetails = {
    id: "296720af-2aa0-494f-bcb9-3d9dcceefb41",
    name: "3-belly-rubs",
    mimeType: "image/jpeg",
    destination: {
      "bucket": "storage-service",
      "path": "test-uploads/images"
    },
    status: "ready_for_scan",
    callback: "no-callback",
    maxFileSize: 50000000,
    path: "/quarantine-storage/test-uploads/images/296720af-2aa0-494f-bcb9-3d9dcceefb41/3-belly-rubs.jpg"
  };
  const file = testFileDetails.path;
  const fileDirectory = testFileDetails.path.substring(0, testFileDetails.path.lastIndexOf('/'));
  console.log(`STARTING SCAN ======\nfile: ${file} \nfilePath: ${fileDirectory}\n`);
  let result;
  let scanCompleted = undefined;
  let virusFound = undefined;
  try {
    await execCommand(`freshclam`);
    result = await execCommand(`clamscan --remove=yes ${file} | grep 'Infected files:' -`);
    result = `${result}`.trim().match(/Infected files: (\d+)/);
    if (result && result[1]) {
      scanCompleted = true;
      if (`${result[1]}` === '0') {
        virusFound = false;
        // confirm using fs to confirm file still exists
        virusFound = fs.existsSync(file) === true ? false : true;
      } else if (parseInt(result[1], 10) > 0) {
        virusFound = true;
      }
    }
  } catch (e) {
    console.error("error scanning \n", e);
  } 
  console.log(result, virusFound, scanCompleted);
}


main();