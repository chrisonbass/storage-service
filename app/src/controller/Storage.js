import StorageService from "../service/Storage.js";
import respondWithCode from "../util/respondWithCode.js";

const service = new StorageService();

export default class Storage {
    constructor(){ 
        this.getFileUploadSignedUrl = this.getFileUploadSignedUrl.bind(this);
        this.handleFileUpload = this.handleFileUpload.bind(this);
    }

    async getFileUploadSignedUrl(req, res) {
        try {
            const signedFileUploadUrlResponse = await service.getSignedFileUploadUrl(req.body || {});
            res.send({
                url: signedFileUploadUrlResponse
            }); 
        } catch (e) {
            console.error("Error creating signed file upload url", e);
            respondWithCode(res, 400, {
                message: "Error creating signed url"
            });
        }
    }

    async handleFileUpload(req, res) {
        try {
            res.send({message: "Request received"}); 
        } catch (e) {
            console.error("Error handling file upload", e);
            respondWithCode(res, 400, {
                message: "Error during upload"
            });
       }
    }
}