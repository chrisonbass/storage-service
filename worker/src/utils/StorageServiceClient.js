import serverUtils from 'server-utils';

const {callApi} = serverUtils;

console.log("imports", {callApi});

export default class StorageServiceClient {
  constructor({
    host = "http://storage-service",
    port = 3000
  } = {}) {
    this.host = host;
    this.port = port;
  }

  isReady() {
    const s = this;
    return new Promise((resolve, reject) => {
      let count = 0;
      const check = async () => {
        count++;
        try {
          const callApiResult = await callApi(`${s.host}:${s.port}/health-check`);
          resolve(true);
        } catch (e) {
          if (check < 3) {
            setTimeout(check, 3000);  
          } else {
            reject(e);
          }
        }
      }
      check();
    });
  }

  async getFilesReadyToScan() {
    const searchQuery = `status=${decodeURIComponent("ready_for_scan")}`
    try {
      const files = await callApi(`${this.host}:${this.port}/v1/files?${searchQuery}`, {
        headers: {
          "authorization" : "worker-api-key-001"
        }
      });
      return files;
    } catch (e) {
      console.error("Error getting unscanned files", e);
      return [];
    }
  }

  async updateFileStatus({id}, status) {
    try {
      const updateFileStatusResult = await callApi(`${this.host}:${this.port}/v1/files/${id}`, {
        method: "POST",
        headers: {
          authorization: "worker-api-key-001"
        },
        body: {
          status
        }
      });
      return updateFileStatusResult;
    } catch(e) {
      console.error("Error updating file", e);
    }
    return false;
  }
}