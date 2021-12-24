import {isValidMimeType} from "../config/mimeTypes";
import respondWithCode from "../util/respondWithCode";
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
    const {name, mimeType, destination} = body || {};
    if (!name || !mimeType || !destination) {
        return respondWithCode(res, 400, {
            message: "One or more required fields are missing: `name`, `description`, or `destination`"
        });
    }
    if (!isValidMimeType(mimeType)) {
        return respondWithCode(res, 400, {
            message: "Unknown file mime type"
        });
    }
    return next();
};

export default signedFileUploadUrlRequest;