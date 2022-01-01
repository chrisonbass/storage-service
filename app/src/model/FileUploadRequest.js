import crypto from 'crypto';
import * as FileUploadStatus from './FileUploadStatus.js';

export const DEFAULT_MAX_FILESIZE = 50 * 1000 * 1000; // 50 mb

export default class FileUploadRequest {
    constructor({id, 
        name, 
        mimeType, 
        destination, 
        status, 
        fullPath, 
        dateCreated,
        callback, 
        maxFileSize} = {}
    ) {
        this.id = id || crypto.randomUUID();
        this.name = name;
        this.mimeType = mimeType;
        this.destination = destination && destination.bucket && destination.path ? destination : {bucket: null, path: null};
        this.status = status || FileUploadStatus.REQUESTED;
        this.fullPath = fullPath || null;
        this.dateCreated = dateCreated ? new Date(dateCreated) : null;
        this.callback = callback || null;
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
}