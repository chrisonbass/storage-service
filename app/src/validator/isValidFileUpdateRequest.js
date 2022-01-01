import respondWithCode from "../util/respondWithCode.js";

export default (fileDao) => async function isValidFileUpdateRequest(req, res, next) {
  const {id} = req.params || {};
  if (id) {
    try {
      const fileUploadRequest = await fileDao.getById(id);
      if (fileUploadRequest && fileUploadRequest.id) {
        req.params.fileUploadRequest = fileUploadRequest;
        return next();
      } 
    } catch (e) {
      console.error("Error getting file", e);
    }
  }
  respondWithCode(res, 404, "Not Found");
};