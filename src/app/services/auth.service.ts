import {Injectable} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private isAuth$: Subject<boolean>;
  private menusCarga$: Subject<any>;
   
  constructor( private localStorageService: LocalStorageService) {
    this.isAuth$ = new Subject<boolean>();
    this.menusCarga$ = new Subject<any>();
  }

  //#region Métodos publicos
  public EsEstaAutenticado(isAuth: boolean): void {
    this.isAuth$.next(isAuth);
    if(!isAuth) {
      this.menusCarga$.next(null);
    }else {
      var lstMenus = this.localStorageService.getJsonValue("ListaMenuAgrupado");
      this.menusCarga$.next(lstMenus);
    }
    
  }

  public estatusActualDelUsuarioEnSesion$(): Observable<boolean>{
    return this.isAuth$.asObservable();    
  }

  public refrescarMenuPermisos$(): Observable<any> {
    return this.menusCarga$.asObservable();
  }
 
  //#endregion
}
  