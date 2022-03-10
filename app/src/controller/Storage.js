import ServerUtils from "server-utils";
import FileUploadRequest from '../model/FileUploadRequest.js';
import StorageService from '../service/Storage.js'
import * as FileUploadStatus from '../model/FileUploadStatus.js';

const {respondWithCode} = ServerUtils;

const service = new StorageService();

export default class Storage {
    constructor(dao){ 
        this.dao = dao;

        // bind methods for use as express middleware
        this.getFileUploadSignedUrl = this.getFileUploadSignedUrl.bind(this);
        this.handleFileUpload = this.handleFileUpload.bind(this);
        this.getFile = this.getFile.bind(this);
        this.getFileDetails = this.getFileDetails.bind(this);
        this.queryFiles = this.queryFiles.bind(this);
        this.updateFile = this.updateFile.bind(this);
        this.deleteFile = this.deleteFile.bind(this);
        this.getScannableFiles = this.getScannableFiles.bind(this);
    }

    async getScannableFiles(req, res) {
        const fileUploadRequests = await this.dao.filterByStatus({
            status: FileUploadStatus.READY_FOR_SCAN
        });
        return res.send(fileUploadRequests || []);
    }

    async getFileUploadSignedUrl(req, res) {
        try {
            let fileUploadRequest = new FileUploadRequest(req.body);
            if (req.user) {
                fileUploadRequest.createdBy = req.user.sub;
            }
            const signedUploadUrl = await service.getSignedFileUploadUrl(fileUploadRequest.getSignatureMessage());
            if (signedUploadUrl) {
                const saveResult = await this.dao.create(fileUploadRequest);
                if (saveResult) {
                    return res.send({
                        fileUploadRequest: saveResult,
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
            const fileUploadRequest = await this.dao.getById(unsignedMessage.id);
            const updated = new FileUploadRequest({...fileUploadRequest});
            if (fileUploadRequest) {
                const savedPath = await service.saveFile(fileUploadRequest, fileType, req.body);
                if (savedPath) {
                    updated.status = FileUploadStatus.READY_FOR_SCAN;
                    updated.fullPath = savedPath;
                    const updateResult = await this.dao.update(fileUploadRequest, updated);
                    return res.send(updateResult);

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

    async getFileDetails(req, res) {
        res.send(req.params.fileUploadRequest);
    }

    async getFile(req, res) {
        try {
            const {bucket_name, path} = (req.params || {});
            console.log("get file request", {bucket_name, path});
            const fileDetails = await service.outputFile({
                bucket: bucket_name,
                path
            });
            const {fileType, fileBuffer} = fileDetails || {};
            if (fileBuffer && fileType && fileType.mime) {
                res.setHeader("Content-Type", fileType.mime);
                return res.send(fileBuffer);
            }
            return respondWithCode(res, 404);
        } catch (e) {
            respondWithCode(res, 400, {
                message: "Error getting file",
                error: e
            });
        }
    }

    async queryFiles(req, res) {
        const {
            status
        } = req.query || {};
        if (status) {
            const createdBy = (req.user || {}).sub;
            const fileUploadRequests = await this.dao.filterUserFiles({
                createdBy,
                status
            });
            return res.send(fileUploadRequests || []);
        }
        respondWithCode(res, 400, {
            message: "Invalid request"
        });
    }

    async updateFile(req, res) {
        const {body} = req;
        const {fileUploadRequest} = req.params;
        const updatedRequest = new FileUploadRequest({
            ...fileUploadRequest,
            ...{
                status: body.status || fileUploadRequest.status
            },
            lastModified: new Date().toLocaleString()
        });
        const updatedFile = await this.dao.update(fileUploadRequest, updatedRequest);
        if (updatedFile) {
            if (
                fileUploadRequest.status !== FileUploadStatus.SCAN_COMPLETE && 
                updatedFile.status === FileUploadStatus.SCAN_COMPLETE
            ) {
                const updatedPath = await service.moveFileToClientStorage(updatedFile);
                if (updatedPath) {
                    const movedResult = await this.dao.update(
                        updatedFile,
                        new FileUploadRequest({
                            ...updatedFile,
                            fullPath: updatedPath,
                            status: FileUploadStatus.AVAILABE,
                        })
                    );
                    if (movedResult) {
                        return res.send(movedResult);
                    }
                }
            }
            return res.send(updatedFile);
        }
        respondWithCode(res, 400, {
            message: "Invalid request"
        });
    }

    async deleteFile(req, res) {
        const {id} = req.params;
        const fileDetails = await this.dao.getById(id);
        if (fileDetails && fileDetails.id) {
            const isDeleted = await service.deleteFileAndEmptyParentFolders(fileDetails.fullPath);
            if (isDeleted) {
                await this.dao.delete(fileDetails);
                return respondWithCode(res, 204);
            }
        }
        respondWithCode(res, 400);
    }
}

// http://storage-service:3000/v1/bucket/image-bucket/test-uploads/images/3-belly-rubs.jpg