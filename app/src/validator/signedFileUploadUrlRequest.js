import ServerUtils from "server-utils";
import {isValidMimeType} from "../config/mimeTypes.js";

const {respondWithCode} = ServerUtils;

const uuidValidator = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;

/**
 * Express Middleware - validates signed file upload url request
 * Requires:
 *  - name - file name
 *  - mimeType - valid mime type
 *  - destination - path in client storage
 * 
 * Optional:
 *  - label
 *  - description
 *  - maxFileSize
 */
const signedFileUploadUrlRequest = (req, res, next) => {
    const {body} = req;
    const {name, mimeType, destination, createdBy} = body || {};
    if (!name || !mimeType || !destination) {
        return respondWithCode(res, 400, {
            message: "One or more required fields are missing: `name`, `mimeType`, or `destination`"
        });
    }
    if (!isValidMimeType(mimeType)) {
        return respondWithCode(res, 400, {
            message: "Unknown file mime type"
        });
    }
    if (createdBy && !uuidValidator.test(createdBy)) {
        return respondWithCode(res, 400, {
            message: "Invalid property.  `createdBy` must be a valid uuid"
        });
    }
    return next();
};

export default signedFileUploadUrlRequest;