import "react-native-get-random-values";
import CryptoJS from "crypto-js";

const SECRET_KEY = "20c70e4505678a4d6695bdf46bfd56c4566bac237e153ffa77728db09f0ddff4";

export function encrypt(data) {
  const key = CryptoJS.SHA256(SECRET_KEY);
  const iv = CryptoJS.lib.WordArray.random(16);
  const ciphertext = CryptoJS.AES.encrypt(
    JSON.stringify(data),
    key,
    { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
  ).toString();
  const ivB64 = CryptoJS.enc.Base64.stringify(iv);
  return `${ivB64}:${ciphertext}`;
}

export function decrypt(ciphertext) {
  if (typeof ciphertext !== "string") throw new Error("Invalid ciphertext");
  // New format: ivBase64:ciphertext
  if (ciphertext.includes(":")) {
    const [ivB64, ct] = ciphertext.split(":");
    const key = CryptoJS.SHA256(SECRET_KEY);
    const iv = CryptoJS.enc.Base64.parse(ivB64);
    const bytes = CryptoJS.AES.decrypt(ct, key, { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    const plain = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(plain);
  }
  // Legacy fallback (OpenSSL-like passphrase mode)
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
  const plain = bytes.toString(CryptoJS.enc.Utf8);
  return JSON.parse(plain);
}
