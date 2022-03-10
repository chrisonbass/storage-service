import ServerUtils from "server-utils";

const {respondWithCode} = ServerUtils;

export default function isAuthenticated(req, res, next) {
  if (req.isWorker || (req.user && req.user.sub)) {
    return next();
  }
  return respondWithCode(res, 401, {
    message: "Unauthorized access"
  });
}