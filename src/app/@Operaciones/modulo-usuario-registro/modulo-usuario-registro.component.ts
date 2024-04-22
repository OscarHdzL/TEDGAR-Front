import { Component, OnInit } from "@angular/core";
import { ServiceGenerico } from "src/app/services/service-generico.service";
import { RespuestaGenerica } from "src/app/model/Operaciones/generales/RespuestaGenerica";
import { ServiciosRutas } from "../../model/Operaciones/generales/ServiciosRutas";
import { ThemeConstants } from "src/app/@espire/shared/config/theme-constant";
import { FormBuilder, FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import {
  InsertarUsuarioSistemaRequest,
  InsertarUsuarioSistemaResponse,
  ConsultaDetalleUsuarioSistemaResponse,
} from "../../model/UsuarioSistema";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import * as CryptoJS from 'crypto-js';
import { WebStorageService } from "src/app/services/web-storage.service";

const SECRET_KEY = 'segob-202X';
@Component({
  selector: "app-modulo-usuario-registro",
  templateUrl: "./modulo-usuario-registro.component.html",
  styleUrls: ["./modulo-usuario-registro.component.css"],
  providers: [ServiceGenerico],
})
export class ModuloUsuarioSistemaRegistroComponent implements OnInit {
  public usuarioSistemaRequest: InsertarUsuarioSistemaRequest =
    new InsertarUsuarioSistemaRequest();
  public operacionRespuesta: RespuestaGenerica;
  private modelo_configuracion: ServiciosRutas;

  // campos formulario
  nombre: string;
  apellido_p: string;
  apellido_m: string;
  correo_electronico: string;
  usuario: string;
  telefono_movil: string;
  nombre_perfil: string;
  contrasena: string;
  aviso_privacidad: boolean;

  respuesta: InsertarUsuarioSistemaResponse;
  tokenIDUsuarioSistema: string;
  usuarioSistemaResponse: ConsultaDetalleUsuarioSistemaResponse;
  id_ca_perfiles: number;
  public titulo: string;
  public editarCampo: boolean;
  public mensajeRespuesta: string;
  modalrefMsg: NgbModalRef;

  controltype = 'password';
  showpass = false;

  constructor(
    private services: ServiceGenerico,
    private themeConstants: ThemeConstants,
    private formBuilder: FormBuilder,
    private _route: ActivatedRoute,
    private router: Router,
    public modalService: NgbModal,
    private webStorageService: WebStorageService
     ) {
    this.operacionRespuesta = new RespuestaGenerica();
    this.modelo_configuracion = new ServiciosRutas();
  }

  ngOnInit(): void {
  }

  public guardarUsuarioSistema(content) {
    this.usuarioSistemaRequest = new InsertarUsuarioSistemaRequest();
    // this.usuarioSistemaRequest.contrasena = this.webStorageService.encryptString(this.contrasena);
    this.usuarioSistemaRequest.nombre = this.nombre;
    this.usuarioSistemaRequest.apellido_p = this.apellido_p;
    this.usuarioSistemaRequest.apellido_m = this.apellido_m;
    this.usuarioSistemaRequest.correo_electronico = this.correo_electronico;
    this.usuarioSistemaRequest.usuario = this.usuario;
    this.usuarioSistemaRequest.contrasena = this.contrasena;
    this.usuarioSistemaRequest.telefono_movil = this.telefono_movil;
    this.usuarioSistemaRequest.b_privacidad = this.aviso_privacidad;
    this.usuarioSistemaRequest.url = location.origin;
    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpPost(
        this.usuarioSistemaRequest,
        this.modelo_configuracion.serviciosOperaciones +
          "/InsertarUsuarioSistema/Post"
      )
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.respuesta = tempdate as InsertarUsuarioSistemaResponse;
            if (this.respuesta.proceso_exitoso == true) {
              this.open(content);
            } else {
              this.mensajeRespuesta = this.respuesta.mensaje;
            }
          } else {
          }
          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.operacionRespuesta.EstaEjecutando = false;
        }
      );
  }
  open(content) {
    let instance = this;
    this.modalService
      .open(content, { ariaLabelledBy: "modal-basic-title" })
      .result.then(() => {
        instance.router.navigate(["iniciar-sesion"]);
      },() => {
        instance.router.navigate(["iniciar-sesion"]);
      });
  }
  showPass() {
    if (this.controltype === "password") {
      this.controltype="text";
      this.showpass = true;
    } else {
     this.controltype= "password";
     this.showpass = false;

    }
  }

  regresar() {
    this.router.navigate(["/iniciar-sesion"]);
  }
}
