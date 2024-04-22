import {Injectable} from '@angular/core';
import {WebStorageService} from './web-storage.service';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor(
    private webStorageService: WebStorageService
  ) {
  }

  setJsonValue(key: string, value: any) {

    this.webStorageService.secureStorage.setItem(key, value);
  }

  getJsonValue(key: string) {

    return this.webStorageService.secureStorage.getItem(key);
  }

  clearToken() {

    return this.webStorageService.secureStorage.clear();
  }

  deleteJsonValue(key: string){
    
    let value = this.webStorageService.secureStorage.getItem(key);
    return value;

  }
}
