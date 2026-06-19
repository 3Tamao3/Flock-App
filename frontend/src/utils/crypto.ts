import CryptoJS from 'crypto-js';

export const encrypt = (message: string, chatId: string): string =>
  CryptoJS.AES.encrypt(message, chatId).toString();

export const decrypt = (cipherText: string, chatId: string): string =>
  CryptoJS.AES.decrypt(cipherText, chatId).toString(CryptoJS.enc.Utf8);
