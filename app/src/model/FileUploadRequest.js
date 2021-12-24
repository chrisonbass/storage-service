import crypto from 'crypto';
import * as FileUploadStatus from './FileUploadStatus.js';

let temp_db = {};

export default class FileUploadRequest {
    constructor({id, name, mimeType, destination} = {}) {
        this.id = id || crypto.randomUUID();
        this.name = name;
        this.mimeType = mimeType;
        this.destination = destination;
        this.status = FileUploadStatus.REQUESTED;
    }

    async save(){
        return new Promise((resolve, reject) => {
            temp_db[this.id] = this;
            resolve(true);
        });
    }

    static async getById(id) {
        return new Promise((resolve, reject) => {
            if (temp_db[id]) {
                resolve(temp_db[id]);
            } else {
                reject();
            }
        });
    }
}