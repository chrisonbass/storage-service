import fs from 'fs';
import execCommand from '../util/execCommand.js';
import SignatureClient from './SignatureClient.js';

const client = new SignatureClient();

const QUAR_STORE = "quarantine-storage";
const CLIENT_STORE = "client-storage";

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
        return `http://localhost:8000/v1/upload?key=${k}&signature=${s}`;
    }

    async saveFile(fileUploadRequest, fileType, fileBuffer) {
        const {destination, name, id} = fileUploadRequest;
        const {ext} = fileType;
        const {path} = destination;
        let quarantinePath = `/${QUAR_STORE}/${path}/${id}`;
        await execCommand(`mkdir -p '${quarantinePath}'`);
        quarantinePath = `${quarantinePath}/${name}.${ext}`;
        fs.writeFileSync(quarantinePath, fileBuffer);
        return quarantinePath;
    }
}
