import express from 'express';
import fileUpload from 'express-fileupload';
import bodyParser from 'body-parser';
import StorageController from './src/controller/Storage.js';
import hasValidSignedUrl from './src/validator/hasValidSignedUrl.js';
import signedFileUploadUrlRequest from './src/validator/signedFileUploadUrlRequest.js';
import hasValidFile from './src/validator/hasValidFile.js';
import PostgresClient from './src/dao/PostgresClient.js';
import hasBucketNameAndPath from './src/validator/hasBucketNameAndPath.js';
import FileDao from './src/dao/FileDao.js';
import isWorker from './src/validator/isWorker.js';
import isValidFileUpdateRequest from './src/validator/isValidFileUpdateRequest.js';

const app = express();
const port = process.env.INTERNAL_PORT || 3000;
const hostname = '0.0.0.0';

let storageController;

const rawParser = bodyParser.raw({limit: '50mb', type: '*/*'});

const postgresConfig = {
  host: "storage-service-db", 
  database: "file_storage", 
  user: "file_user", 
  password: "test1234"
};

const postgresClient = new PostgresClient(postgresConfig);

// Setup prereqs before starting server
const serviceSetup = async () => {
  await postgresClient.init();
  // start dependencies here
  console.log("=== finished initializing postgres connection ===");
};

const main = async () => {
  await serviceSetup();

  /**
   * File data access object
   */
  const fileDao = new FileDao(postgresClient);

  storageController = new StorageController(fileDao);

  // Add JSON body parsing
  app.use(express.json());

  // Add File parsing
  app.use(fileUpload({
    createParentPath: true
  }));

  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    return next();
  });

  // Start Routes
  app.get('/health-check', (req, res) => {
    res.send("works");
  });

  const uploadRouter = express.Router();
  uploadRouter.route('/')
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

  const bucketRouter = express.Router();
  bucketRouter.route('/:bucket_name/*')
      // outputs the file binary
      .get(hasBucketNameAndPath, storageController.getFile);

  const fileRouter = express.Router();
  fileRouter
    // get file details
    .get('/:id', isValidFileUpdateRequest(fileDao), storageController.getFileDetails)
    // queries files, only for worker
    .get('/', isWorker, storageController.queryFiles)
    // removes file
    .delete('/:id', isValidFileUpdateRequest(fileDao), storageController.deleteFile)
    // update file details, only for worker
    .post('/:id', isWorker, isValidFileUpdateRequest(fileDao), storageController.updateFile);

  const version1Routes = express.Router();
  version1Routes.use('/upload', uploadRouter);
  version1Routes.use('/bucket', bucketRouter);
  version1Routes.use('/files', fileRouter);

  app.use('/v1', version1Routes);

  app.listen(port, hostname, () => {
    console.log(`Storage Service running at http://${hostname}:${port}`)
  });
};

main();
