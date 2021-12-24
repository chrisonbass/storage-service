import fs from 'fs';
import SignatureClient from './SignatureClient.js';

const client = new SignatureClient();

export const DEFAULT_MAX_FILESIZE = 50 * 1000 * 1000; // 50 mb
const DEFAULT_CALLBACK = "no-callback";

export default class Storage {
    /**
     * Creates a signed url that can be used for 
     */
    async createFileUpload({
            name, //required
            mimeType, //required
            destination, //required
            maxFileSize, //optional
            callback //optional
        }) {
        /**
         * TODO: finalize options
         * Options ideas
         * 
         * name: // filename
         * mimetype // mimetype of file
         * destination: // client volume: final destination of file after scan
         * maxFileSize: // size in bytes
         * callback: // url endpoint for updating file status
         */
        // Link only good for 5 minutes
        const fileUploadTTL = 5 * 60;
        const unsignedMessage = {
            name,
            mimeType,
            destination,
            maxFileSize: maxFileSize || DEFAULT_MAX_FILESIZE,
            callback: callback || DEFAULT_CALLBACK
        };
        const signedMessage = await client.createSignedMessage(unsignedMessage, fileUploadTTL);
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
}
