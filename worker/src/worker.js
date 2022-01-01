// /quarantine-storage/test-uploads/images/296720af-2aa0-494f-bcb9-3d9dcceefb41/
import {get} from './utils/request.js';
import fs from 'fs';
import execCommand from "./utils/execCommand.js";
import StorageServiceClient from './utils/StorageServiceClient.js';

const client = new StorageServiceClient();

const setupService = async () => {
  try {
    console.log("refreshing clamav");
    await execCommand(`freshclam`);
    console.log("checking client");
    const isClientReady = await client.isReady();
    return isClientReady;
  } catch (e) {
    return false;
  }
};

async function main() {
  const serviceResult = await setupService();
  if (!serviceResult) {
    console.log("Storage Service unavailable");
    return;
  }
  console.log("Storage Service Client is Ready");
  const processNextFile = async () => {
    try {
      const files = await client.getFilesReadyToScan();
      if (files && files.length) {
        const file = files[0].fullPath;
        const fileDirectory = file.substring(0, file.lastIndexOf('/'));
        console.log(`STARTING SCAN ======\nfile: ${file} \nfilePath: ${fileDirectory}\n`);
        let result;
        let scanCompleted = undefined;
        let virusFound = undefined;
        try {
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
          console.log(result, virusFound, scanCompleted);
          if (!virusFound) {
            console.log(`SCAN COMPLETE: No virus found\n`);
            const didUpdate = await client.updateFileStatus({id: files[0].id}, "scan_complete");
            if (didUpdate) {
              console.log("Successfully updated scanned file");
              // setTimeout(processNextFile, 3000);
            }
          } else {
            console.log(`SCAN COMPLETE: Virus found, file removed\n`);
            const didUpdate = await client.updateFileStatus({id: files[0].id}, "error");
          }
        } catch (e) {
          console.error("error scanning \n", e);
        } 
     }
    } catch (e) {
      console.error("Error getting unscanned files", e);
    }
  };
  processNextFile();
  return;
  /*
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
  */
}


main();