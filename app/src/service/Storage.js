import fs from 'fs';
import execCommand from '../util/execCommand.js';
import SignatureClient from './SignatureClient.js';

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
            quarantinePath = `${quarantinePath}/${name}.${ext}`;
            fs.writeFileSync(quarantinePath, fileBuffer);
        } catch (e) {
            console.error("Error saving file to quarantine path", e);
        }
        return quarantinePath;
    }
}
