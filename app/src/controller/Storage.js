import respondWithCode from '../util/respondWithCode.js';
import FileUploadRequest from '../model/FileUploadRequest.js';
import StorageService from '../service/Storage.js'
import * as FileUploadStatus from '../model/FileUploadStatus.js';

const service = new StorageService();

export default class Storage {
    constructor(){ 
        this.getFileUploadSignedUrl = this.getFileUploadSignedUrl.bind(this);
        this.handleFileUpload = this.handleFileUpload.bind(this);
    }

    async getFileUploadSignedUrl(req, res) {
        try {
            let fileUploadRequest = new FileUploadRequest(req.body);
            const signedUploadUrl = await service.getSignedFileUploadUrl(fileUploadRequest.getSignatureMessage());
            if (signedUploadUrl) {
                const saveResult = await fileUploadRequest.save();
                if (saveResult) {
                    return res.send({
                        ...fileUploadRequest,
                        uploadUrl: signedUploadUrl
                    });
                }
            }
            respondWithCode(res, 400, {
                message: "Error creating signed url"
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
            const {unsignedMessage, fileType} = req.params;
            const fileUploadRequest = await FileUploadRequest.getById(unsignedMessage.id);
            if (fileUploadRequest) {
                const savedPath = await service.saveFile(fileUploadRequest, fileType, req.body);
                if (savedPath) {
                    fileUploadRequest.status = FileUploadStatus.READY_FOR_SCAN;
                    fileUploadRequest.path = savedPath;
                    fileUploadRequest.save();
                    return res.send(fileUploadRequest);
                }
            }
            respondWithCode(res, 400, {
                message: "Error during upload"
            });
        } catch (e) {
            console.error("Error handling file upload", e);
            respondWithCode(res, 400, {
                message: "Error during upload",
                error: e
            });
       }
    }
}