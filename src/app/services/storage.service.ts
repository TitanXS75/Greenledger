import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

const ENC_KEY = 'GreenLedger2025';

@Injectable({ providedIn: 'root' })
export class StorageService {
  setEncrypted(key: string, value: string): void {
    const encrypted = CryptoJS.AES.encrypt(value, ENC_KEY).toString();
    localStorage.setItem(key, encrypted);
  }

  getDecrypted(key: string): string | null {
    const enc = localStorage.getItem(key);
    if (!enc) return null;
    const bytes = CryptoJS.AES.decrypt(enc, ENC_KEY);
    return bytes.toString(CryptoJS.enc.Utf8) || null;
  }
}
