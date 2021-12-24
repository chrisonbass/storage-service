import crypto from 'crypto';
import * as FileUploadStatus from './FileUploadStatus.js';

export const DEFAULT_MAX_FILESIZE = 50 * 1000 * 1000; // 50 mb
const DEFAULT_CALLBACK = "no-callback";

let temp_db = {};

export default class FileUploadRequest {
    constructor({id, name, mimeType, destination, callback, status, maxFileSize} = {}) {
        this.id = id || crypto.randomUUID();
        this.name = name;
        this.mimeType = mimeType;
        this.destination = destination;
        this.status = status || FileUploadStatus.REQUESTED;
        this.callback = callback || DEFAULT_CALLBACK;
        this.maxFileSize = maxFileSize || DEFAULT_MAX_FILESIZE;
        if (this.maxFileSize > DEFAULT_MAX_FILESIZE) {
            this.maxFileSize = DEFAULT_MAX_FILESIZE;
        }
    }

    // Static Methods
    static async getById(id) {
        return new Promise((resolve, reject) => {
            if (temp_db[id]) {
                resolve(temp_db[id]);
            } else {
                reject();
            }
        });
    }

    // Instance Methods
    getSignatureMessage() {
        return {
            id: this.id,
            mimeType: this.mimeType,
            maxFileSize: this.maxFileSize
        };
    }

    async save(){
        return new Promise((resolve, reject) => {
            temp_db[this.id] = this;
            resolve(true);
        });
    }

}