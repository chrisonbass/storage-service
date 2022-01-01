import respondWithCode from "../util/respondWithCode.js";

const apiKey = process.env.WORKER_API_KEY || "worker-api-key-001";

export default function isWorker(req, res, next) {
  const {authorization} = req.headers || {};
  if (authorization === apiKey) {
    return next();
  }
  respondWithCode(res, 403, "ACCESS DENIED");
}