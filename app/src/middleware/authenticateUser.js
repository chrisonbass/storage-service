import ServerUtils from "server-utils";
import {workerApiKey, userServiceBaseUrl, userServiceHostName} from "../config/constants.js"

const UserServiceClient = ServerUtils.client.UserServiceClient;

const client = new UserServiceClient({
  url: `${userServiceBaseUrl}/auth/`,
  realm: "todo-app",
  client: "todo-app",
  hostName: userServiceHostName
});

export default async function authenticateUser(req, res, next) {
  const headers = req.headers;
  const {authorization} = req.headers;
  // validate user
  if (authorization && authorization.match(/^Bearer/)) {
    console.log("Checking user token", client);
    const userRecord = await client.checkToken(authorization.replace(/^Bearer/,'').trim());
    if (userRecord) {
      req.user = userRecord;
    }
  }
  // validate worker
  else if (authorization === workerApiKey) {
    req.isWorker = true;
  }
  return next();
};