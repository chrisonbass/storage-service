import ServerUtils from "server-utils";

const {respondWithCode} = ServerUtils;

export default function hasBucketNameAndPath(req, res, next) {
  let error;
  const {params} = req;
  const path = `${params && params['0']}`.trim();
  if (!path) {
    error = "Missing file path in request";
  } else if (!(params || {}).bucket_name) {
    error = "Missing bucket name in request";
  }
  req.params.path = path;
  if (error) {
    return respondWithCode(res, 400, {
      message: error
    });
  }
  next();
}