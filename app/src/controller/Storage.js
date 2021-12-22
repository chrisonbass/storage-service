import StorageService from "../service/Storage";

const service = new StorageService();

export default class Storage {
    constructor(){ 
        this.getFileUploadSignedUrl = this.getFileUploadSignedUrl.bind(this);
    }

    async getFileUploadSignedUrl(req, res) {
        try {
            const signedFileUploadUrlResponse = service.getSignedFileUploadUrl(req.body || {});
            res.send(signedFileUploadUrlResponse); 
        } catch (e) {
            console.error("Error creating signed file upload url", e);
            res.status(400);
            res.send({
                message: "Error creating signed url"
            });
        }
    }
}