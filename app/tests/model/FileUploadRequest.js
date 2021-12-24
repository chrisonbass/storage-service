import FileUploadRequest from "../../src/model/FileUploadRequest.js";
import {ok} from 'assert';

describe("File Upload Reques", () => {
    it("saves", async () => {
        const request = new FileUploadRequest({
            name: "file_upload",
            mimeType: "image/jpeg",
            destination: "storage-service/file-path"
        });
        await request.save();
        const foundRequest = await FileUploadRequest.getById(request.id);
        ok(foundRequest);
    });
});