import FileUploadRequest from "../model/FileUploadRequest";
import Storage from "./Storage";

const service = new Storage();

export default class StorageRequest {
    constructor() {
        this.getSignedFileUploadUrl = this.getSignedFileUploadUrl.bind(this);
    }

    async getSignedFileUploadUrl(options = {}){
        const {name, mimeType, destination} = options;
        let fileUploadRequest = new FileUploadRequest({name, mimeType, destination});
        const signedUploadUrl = await service.getSignedFileUploadUrl({
            ...options,
            id: fileUploadRequest.id
        });
        if (signedUploadUrl) {
            const saveResult = await fileUploadRequest.save();
            if (saveResult) {
                return signedUploadUrl;
            }
        }
        throw new Error("Error creating signed url");
    }
}