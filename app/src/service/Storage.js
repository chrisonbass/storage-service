import fs from 'fs';
import { readdir, rmdir } from 'fs/promises';
import { fileTypeFromBuffer } from 'file-type';
import ServerUtils from "server-utils";
import SignatureClient from './SignatureClient.js';

const {execCommand} = ServerUtils;

const client = new SignatureClient();

const QUAR_STORE = "quarantine-storage";
const CLIENT_STORE = "client-storage";

const EXTERNAL_PORT = process.env.EXTERNAL_PORT || "8000";

export default class Storage {
    /**
     * Creates a signed url that can be used for 
     */
    async createFileUpload(fileDetails) {
        // Link only good for 5 minutes
        const fileUploadTTL = 5 * 60;
        const signedMessage = await client.createSignedMessage(fileDetails, fileUploadTTL);
        return signedMessage;
    }

    async getSignedFileUploadUrl(options = {}){
        const signature = await this.createFileUpload(options);
        return this.getSignedFileUploadUrlFromSignature(signature);
    }

    getSignedFileUploadUrlFromSignature({key, signature}){
        const k = encodeURIComponent(key);
        const s = encodeURIComponent(signature);
        return `http://localhost:${EXTERNAL_PORT}/v1/upload?key=${k}&signature=${s}`;
    }

    async saveFile(fileUploadRequest, fileType, fileBuffer) {
        const {name, id} = fileUploadRequest;
        const {ext} = fileType;
        let quarantinePath = `/${QUAR_STORE}/${id}`;
        try {
            await execCommand(`mkdir -p '${quarantinePath}'`);
            quarantinePath = `${quarantinePath}/${name.substring(0, name.lastIndexOf("."))}.${ext}`;
            fs.writeFileSync(quarantinePath, fileBuffer);
        } catch (e) {
            console.error("Error saving file to quarantine path", e);
        }
        return quarantinePath;
    }

    async moveFileToClientStorage(fileUploadRequest) {
        const {fullPath, destination, name} = fileUploadRequest;
        const {bucket, path} = destination;
        const fileBuffer = fs.readFileSync(fullPath);
        const type = await fileTypeFromBuffer(fileBuffer);
        const filePath = `/${CLIENT_STORE}/${bucket}/${path}/${name}.${type.ext}`;
        const destinationPath = filePath.substring(0, filePath.lastIndexOf("/"));
        const mkdirRes = await execCommand(`mkdir -p '${destinationPath}'`);
        fs.writeFileSync(filePath, fileBuffer);
        if (fs.existsSync(filePath)) {
            // removed quarantined path
            fs.unlinkSync(fullPath);
            return filePath;
        }
        return false;
    }

    async outputFile({bucket, path}) {
        const filePath = `/${CLIENT_STORE}/${bucket}/${path}`;
        if (fs.existsSync(filePath)) {
            const buffer = fs.readFileSync(filePath);
            const fileType = await fileTypeFromBuffer(buffer);
            return {
                fileType,
                fileBuffer: buffer
            };
        }
        return null;
    }

    async deleteFileAndEmptyParentFolders(filePath) {
        let parentFolder = `${filePath}`.substring(0, filePath.lastIndexOf('/'));
        const removeEmptyParent = async () => {
            let files;
            try {
                files = await readdir(parentFolder);
            } catch (e) {
                return;
            }
            if (files.length) {
                return;
            }
            try {
                await rmdir(parentFolder);
            } catch (e) {
                return;
            }
            parentFolder = parentFolder.substring(0, parentFolder.lastIndexOf('/'));
            if (parentFolder === `/${CLIENT_STORE}`) {
                return;
            }
            removeEmptyParent();
        };
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            await removeEmptyParent();
            return !fs.existsSync(filePath);
        } 
        return true;
    }
}
