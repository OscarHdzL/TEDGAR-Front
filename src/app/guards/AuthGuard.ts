import { Injectable } from "@angular/core";
import { CanActivate, Router, ActivatedRoute, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from "@angular/router";
import { JwtHelperService } from "@auth0/angular-jwt";
import { Observable, Subject } from "rxjs";
import { CatalogoRutas } from "../model/Catalogos/CatalogoRutas";
import { LocalStorageService } from '../services/local-storage.service';
import { AuthIdentity } from "./AuthIdentity";

@Injectable()
export class AuthGuard implements CanActivate {
  idPerfil: number;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private jwtHelper: JwtHelperService,
    private localStorageService: LocalStorageService
  ) {}
  public ListModulos: any[];

  // canActivate(
  //   next: ActivatedRouteSnapshot,
  //   state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

  //     const subject = new Subject<boolean>();
  //     return this.authorizationService.isAuthorized(next.routeConfig.path).then(data=>{
  //     
  //       if(data)
  //       {
  //        
  //         return true;
  //       }
  //       else
  //       {
  //        
  //         this.router.navigate(['/ConsolaCentral/no-autorizado']);
  //       }

  //     });
  // }

  canActivate(): boolean {
    const token = localStorage.getItem("jwt");

    if (token && !this.jwtHelper.isTokenExpired(token, 300)) {
      var urlactual = location.pathname;
      this.ListModulos = this.localStorageService.getJsonValue("ListaMenu");
      const resultado = this.ListModulos.find((Model) => "/" + Model.ruta === urlactual);
      this.idPerfil = AuthIdentity.ObtenerPerfilUsuarioSesion();
      
      if (urlactual === '/tramites-electronicos' && this.idPerfil == 1) {
        this.router.navigate([urlactual]);
      } else if (urlactual === '/' && this.idPerfil == 1){
        this.router.navigate(['/tramites-electronicos']);
      } else {

        if (resultado != null) {
          this.router.navigate(["/" + resultado.ruta]);
        } else {
          this.router.navigate(["/"]);
        }

      }
      return true;
    } else if (location.pathname.includes("/confirmar-correo/")) {
      this.router.navigate([location.pathname]);
      // return true;
    } else if (location.pathname.includes("/recuperar-contrasena/")) {
      this.router.navigate([location.pathname]);
      // return true;
    } else {
      localStorage.clear();
      this.router.navigate(["/iniciar-sesion"]);
      return false;
    }
  }

  public logOut(): void {
    localStorage.clear();
    // localStorage.removeItem("jwt");
    // localStorage.removeItem("jwtData");
  }
}

