import callApi from "../util/callApi.js";

const BASE_URL = process.env.SIGNATURE_SERVICE_URL || "http://signature-service:3000";
const DEFAULT_TTL = 60 * 60 * 24;

export default class SignatureClient {
    constructor() {
        this.lastResult;
    }

    async createSignedMessage(message, ttl = DEFAULT_TTL) {
        return await callApi(`${BASE_URL}`, {
            method: "PUT",
            body: {
                message: message,
                ttl
            }
        });
    }

    async validateSignedMessage({key, signature}){
        let valid = false;
        try {
            const results = await this.decryptSignedMessage({key, signature});
            if (results && results.message) {
                valid = true;
            }
        } catch (e) {
            valid = false;
        }
        return valid;
    }

    async decryptSignedMessage({key, signature}) {
        const signedUrl = this.getSignedUrl({key, signature})
        const results = await callApi(`${signedUrl}`);
        this.lastResult = results && results.message;
        return results;
    }

    getSignedUrl({key, signature}) {
        return `${BASE_URL}?key=${key}&signature=${signature}`;
    }
}