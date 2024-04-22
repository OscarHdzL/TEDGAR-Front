import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { CatalogoRutas } from "src/app/model/Catalogos/CatalogoRutas";
import { LocalStorageService } from "src/app/services/local-storage.service";
import { AuthGuard } from "../../../app/guards/AuthGuard";
import { UserIdleService } from "angular-user-idle";
import { AuthService } from "src/app/services/auth.service";
import { PipeTransform, Pipe } from "@angular/core";
import { AuthIdentity } from "src/app/guards/AuthIdentity";

@Component({
  selector: "app-nav-menu",
  templateUrl: "./nav-menu.component.html",
  styleUrls: ["./nav-menu.component.css"],
  providers: [AuthGuard],
})
export class NavMenuComponent implements OnInit {
  public isAuth: boolean;

  isExpanded = false;
  public ListModulos: Array<CatalogoRutas> = [];
  listaEncabezados: any[];

  public banner:string;

  constructor(
    private auth: AuthGuard,
    private router: Router,
    private authService: AuthService,
    private localStorageService: LocalStorageService,
    private userIdle: UserIdleService
  ) {}

  ngOnInit(): void {
    this.ListModulos =
      this.localStorageService.getJsonValue("ListaMenuAgrupado");
    this.isAuth = this.auth.canActivate();
    this.authService.estatusActualDelUsuarioEnSesion$().subscribe((isAuth) => {
      this.isAuth = isAuth;
    });
    this.authService.refrescarMenuPermisos$().subscribe((modules) => {
      this.ListModulos = modules;
     
      this.banner =AuthIdentity.GetBannerSession();
    });
    this.setupidleSession();
    this.banner =AuthIdentity.GetBannerSession();
  }

  collapse() {
    this.isExpanded = false;
  }

  toggle() {
    this.isExpanded = !this.isExpanded;
  }

  //#region Métodos publicos
  public cerrarSesion(): void {
    this.auth.logOut();
    this.authService.EsEstaAutenticado(false);
    this.localStorageService.clearToken();

    this.banner = "";

    //this.router.navigate(["/iniciar-sesion"]);
    window.location.reload();
  }
  //#endregion

  setupidleSession() {
    //configuración para el tiempo de inactividad  // 600 10 minutos - 1800 30 min
    this.userIdle.stopWatching();
    this.userIdle.setConfigValues({ idle: 1800, timeout: 1 });
    this.userIdle.startWatching();
  }
}
