import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { ServiceGenerico } from "src/app/services/service-generico.service";
import { RespuestaGenerica } from "../../model/Operaciones/generales/RespuestaGenerica";
import { ServiciosRutas } from "../../model/Operaciones/generales/ServiciosRutas";
import { JwtHelperService } from "@auth0/angular-jwt";
import { LocalStorageService } from "src/app/services/local-storage.service";
import { CatalogoRutas } from "src/app/model/Catalogos/CatalogoRutas";
import { AuthService } from "src/app/services/auth.service";

@Component({
  selector: "app-modulo-autenticacion",
  templateUrl: "./modulo-autenticacion.component.html",
  styleUrls: ["./modulo-autenticacion.component.css"],
  providers: [ServiceGenerico],
})
export class ModuloAutenticacionComponent implements OnInit {
  public formLogin: FormGroup;
  public operacionRespuesta: RespuestaGenerica;

  private servicios: ServiciosRutas;
  ListModulos: Array<CatalogoRutas> = [];

  controltype ="password";

  showpass=false;


  constructor(
    private services: ServiceGenerico,
    private form: FormBuilder,
    private router: Router,
    private localStorageService: LocalStorageService,
    private authService: AuthService
  ) {
    this.operacionRespuesta = new RespuestaGenerica();
    this.servicios = new ServiciosRutas();
    this.initControlForm();
  }

  ngOnInit(): void {}

  //#region Métodos publicos
  public EjecutarAutenticacion(): void {
    if (this.esValidoElFormulario()) {
      this.operacionRespuesta.EstaEjecutando = true;
      this.services
        .HttpPost(
          this.formLogin.value,
          `${this.servicios.serviciosOperaciones}/InicioSesion/Post`
        )
        .subscribe(
          (response: any) => {
            this.operacionRespuesta.EstaEjecutando = false;

            if (response.response.mensaje != null) {
              this.operacionRespuesta.EsMsjError = true;
              this.operacionRespuesta.Msj = response.response.mensaje;
            }

            if (response.response.token != null) {
              var usuario = this.obtenerValoresJWT(response.response.token);
              localStorage.setItem("jwt", response.response.token);
              // localStorage.setItem("jwtData", JSON.stringify(usuario));
              this.obtenerModulos(usuario);
              this.mostrarVista(usuario);
            }
          },
          (error) => {
            this.operacionRespuesta.EstaEjecutando = false;
            this.operacionRespuesta.EsMsjError = false;
            this.operacionRespuesta.Msj = error.response[0];
          }
        );
    }
  }

  showPass() {
    if (this.controltype === "password") {
      this.controltype="text";
      this.showpass=true;
    } else {
     this.controltype= "password";
     this.showpass=false;

    }
  }
  //#endregion

  //#region Métodos privados
  private initControlForm(): void {
    this.formLogin = this.form.group({
      usuarioCorreo: [
        "",
        Validators.compose([Validators.required]),
      ],
      contrasenia: ["", Validators.required],
    });
  }

  private esValidoElFormulario(): boolean {
    if (
      !this.formLogin.get("usuarioCorreo").valid ||
      !this.formLogin.get("contrasenia").valid
    ) {
      this.operacionRespuesta.EsMsjError = false;

      if (!this.formLogin.get("usuarioCorreo").valid) {
        this.operacionRespuesta.Msj = "El usuario o correo no puede ser vacio";
        return false;
      }

      if (!this.formLogin.get("contrasenia").valid) {
        this.operacionRespuesta.Msj =
          "El campo de la contraseña no puede ser vacío";
        return false;
      }
    }

    return true;
  }

  private obtenerValoresJWT(jwt: string): any {
    const helper = new JwtHelperService();

    const informacionToken = helper.decodeToken(jwt);

    return JSON.parse(informacionToken.UserData);
  }

  private mostrarVista(usuario: any): void {
    let ruta: string = "/";

    switch (usuario.IdPerfil) {
      // Persona
      case 1:
        ruta = "/tramites-electronicos";
        break;
      // // Supervisor
      // case 2:
      //   ruta = "/datos-alumnos";
      //   break;
      // // Usuario Final
      // case 3:
      //   if (usuario.AvisoPrivacidad === true) {
      //     ruta = "/mi-registro";
      //   } else {
      //     ruta = "/aviso-privacidad";
      //   }
      //   break;
      default:
        ruta = "/";
    }
    this.router.navigate([ruta]);
  }

  public async obtenerModulos(usuario: any) {
    this.ListModulos = [];
    this.services
      .HttpGet(`${this.servicios.serviciosOperaciones}/ConsultaModulosPerfil/Get?id_ca_perfiles=` + usuario.IdPerfil)
      .subscribe(
        async (tempdate) => {
          const datosTemp = tempdate.response as CatalogoRutas[];
          this.ListModulos = this.ordernarMenusEnDuro(Number(usuario.IdPerfil), datosTemp);
          var listGroupModulos = null;
          listGroupModulos = this.ListModulos.reduce(function (obj, item) {
            obj[item.cabecera] = obj[item.cabecera] || [];
            obj[item.cabecera].push(item);
            return obj;
          }, {});
          this.localStorageService.setJsonValue("ListaMenu", this.ListModulos);
          this.localStorageService.setJsonValue("ListaMenuAgrupado", listGroupModulos);
          this.authService.EsEstaAutenticado(true);
        },
        async (err) => {
          this.ListModulos = [];
        }
      );
  }

  private ordernarMenusEnDuro(IdPerfil: number, catalogos: CatalogoRutas[]): CatalogoRutas[] {
    let argOrdenar = new Array<CatalogoRutas>();
    switch (IdPerfil) {
      case 1:
        {
            argOrdenar.push(catalogos.find(f => f.ruta === 'tramites'));
            argOrdenar.push(catalogos.find(f => f.ruta === 'tomanota'));
            argOrdenar.push(catalogos.find(f => f.ruta === 'transmisiones'));
            argOrdenar.push(catalogos.find(f => f.ruta === 'declaratoria-procedencia'));
          // argOrdenar.push(catalogos.find(f => f.ruta === 'registros-tramite'));
          // argOrdenar.push(catalogos.find(f => f.ruta === 'registros-toma-nota'));
          // argOrdenar.push(catalogos.find(f => f.ruta === 'registros-transmision'));


        }
        break;
      default:
        argOrdenar = catalogos;
    }

    return argOrdenar;
  }

  //#endregion
}
