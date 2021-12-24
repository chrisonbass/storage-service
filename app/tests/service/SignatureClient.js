import SignatureClient from "../../src/service/SignatureClient.js";
import {ok, equal} from 'assert';

describe("Signature Client", () => {
    const client = new SignatureClient();
    let createResult;
    const testMessage = {
        sample: "example message 002"
    };
    it("#createMessage", async () => {
        const result = await client.createSignedMessage(testMessage);
        ok(result);
        ok(result.key);
        createResult = result;
    });

    it("#validatesPreviouslyCreatedMessage", async () => {
        const result = await client.validateSignedMessage(createResult);
        equal(result, true);
    });

    it("#lastResultMatchesRequest", async () => {
        equal(JSON.stringify(testMessage), JSON.stringify(client.lastResult));
    });

    const wait = async (seconds) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => { 
                resolve(true); 
            }, seconds * 1000);
        });
    };
    it("#expiresMessage", async () => {
        const expireResult = await client.createSignedMessage(testMessage, 3);
        const waiter = await wait(4);
        let valid;
        try {
            valid = await client.decryptSignedMessage(expireResult);
            valid = valid && valid.message ? true : false;
        } catch (e) {
            valid = false;
        }
        equal(valid, false);
    }).timeout(8000);
});