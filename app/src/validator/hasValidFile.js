import {fileTypeFromBuffer} from 'file-type';
import {isValidMimeType} from "../config/mimeTypes.js";
import respondWithCode from "../util/respondWithCode.js";

// helper function to responsd with error
const sendError = (res, message) => {
  respondWithCode(res, 400, {message});
};

/**
 * Validates upload file against original signed request
 */
export default async function hasValidFile(req, res, next) {
  const isBuffer = req.body instanceof Buffer;
  if (isBuffer) {
    const fileBuffer = req.body;
    const {params} = req;
    const {unsignedMessage} = params || {};
    const {mimeType, maxFileSize} = unsignedMessage || {};
    const fileType = await fileTypeFromBuffer(req.body);
    if (fileType && isValidMimeType(fileType.mime)) {
      if (fileBuffer.length > maxFileSize) {
        return sendError(res, "File exceeds allowed file size");
      }
      if (fileType.mime !== `${mimeType}`.toLocaleLowerCase()) {
        return sendError(res, `File is the wrong file type.  Expected ${mimeType}`);
      }
      req.params.fileType = fileType;
      return next();
    }
  }
  sendError(res, "No file present in request.  File should be submitted as the body of the request.");
};