import CryptoJS from "crypto-js";

const SECRET_KEY = "20c70e4505678a4d6695bdf46bfd56c4566bac237e153ffa77728db09f0ddff4";

export function encrypt(data) {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
}

export function decrypt(ciphertext) {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}
