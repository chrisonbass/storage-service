import respondWithCode from "../util/respondWithCode.js";
import SignatureClient from "../service/SignatureClient.js";

const signatureClient = new SignatureClient();

export default async function hasValidSignedUrl(req, res, next) {
  const {query} = req;
  const {key, signature} = query || {};
  if (key && signature) {
    let isValid = false;
    try {
      const unsignedMessage = await signatureClient.decryptSignedMessage({key, signature});
      if (unsignedMessage) {
        isValid = true;
        req.params.unsignedMessage = unsignedMessage;
      }
    } catch (e) {
      isValid = false;
    }
    if (isValid) {
      return next();
    }
  }
  respondWithCode(res, 401, {
    message: "This endpoint requires a valid signed url"
  });
};