import {Injectable} from '@angular/core';
import SecureStorage from 'secure-web-storage';

import * as CryptoJS from 'crypto-js';

const SECRET_KEY = 'segob-202X';

@Injectable({
  providedIn: 'root'
})
export class WebStorageService {

  public secureStorage = new SecureStorage(localStorage, {
    hash: function hash(key) {

      key = CryptoJS.SHA256(key, SECRET_KEY);

      return key.toString();
    },
    encrypt: function encrypt(data) {

      data = CryptoJS.AES.encrypt(data, SECRET_KEY);

      data = data.toString();

      return data;
    },
    decrypt: function decrypt(data) {

      data = CryptoJS.AES.decrypt(data, SECRET_KEY);

      data = data.toString(CryptoJS.enc.Utf8);

      return data;
    }
  });

  public encryptString(data): string{

    data = CryptoJS.AES.encrypt(data, SECRET_KEY);

    data = data.toString();

    return data;

  } 
}
