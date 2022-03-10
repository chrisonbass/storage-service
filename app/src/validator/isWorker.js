import ServerUtils from "server-utils";

const {respondWithCode} = ServerUtils;

export default function isWorker(req, res, next) {
  if (req.isWorker) {
    return next();
  }
  respondWithCode(res, 403, "ACCESS DENIED");
}