
import crypto from 'crypto';

export const randomHash = (length = 20) => {
    return crypto.randomBytes(length).toString('hex');
}

export const uuid = () => crypto.randomUUID();