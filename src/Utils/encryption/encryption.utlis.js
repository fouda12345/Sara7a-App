import CryptoJS from 'crypto-js';
export const encryptData = (data) => {
    if (typeof data !== 'string') {
        data = JSON.stringify(data);
    }
    return CryptoJS.AES.encrypt(data, process.env.ENCRYPT_PRIVATE_KEY).toString();
}

export const decryptData = (data) => {
    return CryptoJS.AES.decrypt(data, process.env.ENCRYPT_PRIVATE_KEY).toString(CryptoJS.enc.Utf8);
}