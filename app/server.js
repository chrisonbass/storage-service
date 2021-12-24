import express from 'express';
import fileUpload from 'express-fileupload';
import bodyParser from 'body-parser';
import StorageController from './src/controller/Storage.js';
import hasValidSignedUrl from './src/validator/hasValidSignedUrl.js';
import signedFileUploadUrlRequest from './src/validator/signedFileUploadUrlRequest.js';
import hasValidFile from './src/validator/hasValidFile.js';

const app = express();
const port = 3000
const hostname = '0.0.0.0';

const storageController = new StorageController();

const rawParser = bodyParser.raw({limit: '50mb', type: '*/*'});

// Setup prereqs before starting server
const serviceSetup = async () => {
  // start dependencies here
  return Promise.resolve();
};

const main = async () => {
  await serviceSetup();

  // Add JSON body parsing
  app.use(express.json());

  // Add File parsing
  app.use(fileUpload({
    createParentPath: true
  }));

  // Start Routes
  app.get('/health-check', (req, res) => {
    res.send("works");
  });

  const uploadRouter = express.Router();
  uploadRouter.route('/upload')
    // Request file upload signed url
    .post(signedFileUploadUrlRequest, storageController.getFileUploadSignedUrl)
    // Upload using Signed Url
    .put(
      // Authenticate signed url
      hasValidSignedUrl, 
      // Parse body - body of request should be the binary file
      rawParser, 
      // Validate file using details from decrypted signature
      hasValidFile,
      // Handle Upload
      storageController.handleFileUpload);

  app.use('/v1', uploadRouter);

  app.listen(port, hostname, () => {
    console.log(`Storage Service running at http://${hostname}:${port}`)
  });
};

main();
