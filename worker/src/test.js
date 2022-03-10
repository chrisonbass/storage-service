import ServerUtils from "server-utils";

console.log("utils", {ServerUtils});

const callApi = ServerUtils.callApi;
const UserServiceClient = ServerUtils.client.UserServiceClient;

const config = {
  url: "http://user-service:8080/auth/",
  realm: "todo-app",
  clientId: "todo-app",
  hostName: process.env.USER_SERVICE_HOST_NAME || "todo-app.home"
};

console.log("Creating user client with config", config);

let client = new UserServiceClient(config);

const token = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ4ZEVYX1ZydUNhQWtTZnc4NzF3M3JHTW5WYmFmejgxNHJuRndURklpRWI4In0.eyJleHAiOjE2NDIxMjkxOTIsImlhdCI6MTY0MjEyODg5MiwiYXV0aF90aW1lIjoxNjQyMTI2MjI1LCJqdGkiOiI1YTNmNzBmNC1mMDU1LTQxNzItYjc0OC04ODNhNDUzNzRlOWEiLCJpc3MiOiJodHRwOi8vdXNlci50b2RvLWFwcC5ob21lL2F1dGgvcmVhbG1zL3RvZG8tYXBwIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6IjA0OWUxYTExLTIzYjctNGY3Mi1hYTNmLTBmY2EzZmY1MzQ2MiIsInR5cCI6IkJlYXJlciIsImF6cCI6InRvZG8tYXBwIiwibm9uY2UiOiJmNDdmNTNkYy04NDViLTRmN2UtOGJkMC0wNTIxYzAzNWMwYmIiLCJzZXNzaW9uX3N0YXRlIjoiZjhiNWQyMzktZDYxOC00ODIxLWEwODktYTU2OGViNWViMDc3IiwiYWNyIjoiMCIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwOi8vdG9kby1hcHAuaG9tZSJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiIsImRlZmF1bHQtcm9sZXMtdG9kby1hcHAiXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6Im9wZW5pZCBlbWFpbCBwcm9maWxlIiwic2lkIjoiZjhiNWQyMzktZDYxOC00ODIxLWEwODktYTU2OGViNWViMDc3IiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5hbWUiOiJDaHJpcyBNb3NzIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiY21vc3NAai5tYWlsIiwiZ2l2ZW5fbmFtZSI6IkNocmlzIiwiZmFtaWx5X25hbWUiOiJNb3NzIiwiZW1haWwiOiJjbW9zc0BqLm1haWwifQ.mInxmeO3aS8leLD74j8BqmMwbzEAOYrYL70OlscAHHYyQf1IG6MoJUf8RDdjtDwqY0QKnkKZtdlNkXNNFUMhBc7GmwH6og5Nd-bdj93jD-Tg9426C7sG5acw6yVLRnhEvw6z9w4WAeoHK0OsjTQA9QeOBqwgzi0Ed8fpONJ-Vfjm6UyFgWnsOXvUSEusdVEZWHNgSmzw10hKg4lUjX-aoORYinUUZvF1As-YIbjM66e1H0O2ZsaN20v4mwhU1Cacgf0A52WUbuTynZaHAIGSZd7utSgQ52Parhzf6dlvRxHPw3-RYOXUiXgJGCUJIP050UGOk5XjA-JPm4J-La-PYQ";

const parseToken = (t) => {
  return JSON.parse(Buffer.from(t.split(/\./)[1], 'base64').toString('utf8'));
}

const check = async () => {
  const parsed = parseToken(token);
  const issuer = new URL(parsed.iss);
  try {
    client = new UserServiceClient({
      ...config,
      hostName: issuer.hostname
    });
    const userRecord = await client.checkToken(token);
    console.log("user record", userRecord);
    // const user = await client.parseToken(token);
    // console.log(JSON.stringify(user, null, 2));
  } catch (e) {
    console.error("Error getting user details", e);
  }
  try {
    const res = await callApi(`${config.url}realms/${config.realm}/protocol/openid-connect/userinfo`, {
      headers: {
        "Host": issuer.hostname,
        "Authorization": `Bearer ${token}`
      }
    });
    console.log(JSON.stringify(res, null, 2));
  } catch (e) {
    console.error("Error checking api", e);
  }
}

check();