import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ThemeConstants } from '../../../@espire/shared/config/theme-constant';
import { RespuestaGenerica } from '../../../model/Operaciones/generales/RespuestaGenerica';
import { ServiciosRutas } from '../../../model/Operaciones/generales/ServiciosRutas';
import { ConsultaDetalleUsuarioSistemaResponse, InsertarUsuarioSistemaRequest, InsertarUsuarioSistemaResponse } from 'src/app/model/UsuarioSistema';
import { ServiceGenerico } from '../../../services/service-generico.service';
import { ConsultaListaPerfilesResponse } from '../../../model/Operaciones/CatPerfiles/CatPerfiles';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modulo-usuario-sistema-perfil-registro',
  templateUrl: './modulo-usuario-sistema-perfil-registro.component.html',
  styleUrls: ['./modulo-usuario-sistema-perfil-registro.component.css'],
  providers: [ServiceGenerico]
})
/** modulo-usuario-sistema-registro component*/
export class ModuloUsuarioSistemaPerfilRegistroComponent {
  @ViewChild("contentActivar", { static: false }) ModalActivar: TemplateRef<any>;
  @ViewChild("contentEXito", { static: false }) ModalExito: TemplateRef<any>;

  public usuarioSistemaRequest: InsertarUsuarioSistemaRequest = new InsertarUsuarioSistemaRequest();
  public operacionRespuesta: RespuestaGenerica;
  private modelo_configuracion: ServiciosRutas;

  // campos formulario
  nombre: string;
  apellido_p: string;
  apellido_m: string;
  correo_electronico: string;
  telefono_movil: string;
  nombre_perfil: string;

  respuesta: InsertarUsuarioSistemaResponse;
  tokenIDUsuarioSistema: string;
  usuarioSistemaResponse: ConsultaDetalleUsuarioSistemaResponse;
  id_ca_perfiles: number;
  public titulo: string;
  public editarCampo: boolean;
  public showbutton: boolean;
  public mensajeRespuesta: string;
  public proceso_exitoso: boolean;

  public selectCatPerfiles: ConsultaListaPerfilesResponse[];

  constructor(private services: ServiceGenerico,
    private themeConstants: ThemeConstants,
    private formBuilder: FormBuilder, private _route: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal
  ) {
    this.operacionRespuesta = new RespuestaGenerica();
    this.modelo_configuracion = new ServiciosRutas();
    this.tokenIDUsuarioSistema = this._route.snapshot.paramMap.get('id');
  }

  ngOnInit(): void {
    this.cargarPerfiles();
    
    if (this.tokenIDUsuarioSistema != null) {
      this.ConsultaDetalleUsuarioSistema();
      this.titulo = 'Detalle Usuario Sistema';
      this.editarCampo = true;
    } else {
      this.titulo = 'Nuevo Usuario Sistema';
      this.editarCampo = false;
    }
  }



  public guardarUsuarioSistema() {
    this.operacionRespuesta.EstaEjecutando = true;
    
    this.usuarioSistemaRequest = new InsertarUsuarioSistemaRequest();
    this.usuarioSistemaRequest.nombre = this.nombre;
    this.usuarioSistemaRequest.apellido_p = this.apellido_p;
    this.usuarioSistemaRequest.apellido_m = this.apellido_m;
    this.usuarioSistemaRequest.correo_electronico = this.correo_electronico;
    this.usuarioSistemaRequest.telefono_movil = this.telefono_movil;
    this.usuarioSistemaRequest.id_ca_perfiles = this.id_ca_perfiles;
    this.usuarioSistemaRequest.url = location.origin + "/iniciar-sesion"

    this.services.HttpPost(this.usuarioSistemaRequest, this.modelo_configuracion.serviciosOperaciones + "/InsertarUsuarioSistemaPerfil/Post")
      .subscribe((tempdate) => {
        if (tempdate) {
          this.respuesta = tempdate as InsertarUsuarioSistemaResponse;
          this.modalService.dismissAll();
          this.mensajeRespuesta = this.respuesta.mensaje;
          this.operacionRespuesta.EsMsExitoso = this.respuesta.proceso_exitoso;
          this.proceso_exitoso = this.respuesta.proceso_exitoso;
          this.operacionRespuesta.EstaEjecutando = false;
          this.resetFormulario();

          this.showbutton = true;
          this.operacionRespuesta.EstaEjecutando = false;
          const modalref = this.modalService.open(this.ModalExito, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });

          //if (this.respuesta.proceso_exitoso == true) {
          //  setTimeout(() => {
          //    this.router.navigate(['/usuario-sistema/']);
          //  }, 2000);
          //}
        } else {
          // this.respuesta = [];
        }
        this.operacionRespuesta.EstaEjecutando = false;
      });
  }

  public ConsultaDetalleUsuarioSistema() {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services.HttpGet(this.modelo_configuracion.serviciosOperaciones + "/ConsultaDetalleUsuarioSistema/Get?id_usuario=" + this.tokenIDUsuarioSistema)
      .subscribe((tempdate) => {
        if (tempdate) {
          this.usuarioSistemaResponse = tempdate.response as ConsultaDetalleUsuarioSistemaResponse;
          this.nombre = this.usuarioSistemaResponse[0].nombre;
          this.apellido_p = this.usuarioSistemaResponse[0].apellido_paterno;
          this.apellido_m = this.usuarioSistemaResponse[0].apellido_materno;
          this.correo_electronico = this.usuarioSistemaResponse[0].usuario;
          this.telefono_movil = this.usuarioSistemaResponse[0].telefono_movil;
          this.nombre_perfil = this.usuarioSistemaResponse[0].nombre_perfil;
          this.id_ca_perfiles = this.usuarioSistemaResponse[0].id_perfil;
        } else {
          // this.usuarioSistemaResponse = [];
        }
        this.operacionRespuesta.EstaEjecutando = false;
      });
  }

  private cargarPerfiles(): void {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services.HttpGet(this.modelo_configuracion.serviciosOperaciones + "/ConsultaListaPerfiles/Get?activo=1")
    .subscribe(
      (response: any) => {
        this.operacionRespuesta.EstaEjecutando = false;
        this.selectCatPerfiles = response.response as ConsultaListaPerfilesResponse[];
      },
      (error) => {
        this.operacionRespuesta.EstaEjecutando = false;
        this.operacionRespuesta.EsMsjError = false;
      });
  }

  regresar() {
    this.router.navigate(['/usuario-sistema/']);
  }

  regresarExito() {
    this.modalService.dismissAll();
     setTimeout(() => {
      this.router.navigate(['/usuario-sistema/']);
    }, 500);
  }
  openActivar(content) {
    const modalref = this.modalService.open(this.ModalActivar, { ariaLabelledBy: 'modal-basic-title' });
  }

  resetFormulario() {
    this.nombre = "";
    this.apellido_p = "";
    this.apellido_m = "";
    this.correo_electronico = "";
    this.id_ca_perfiles = 0;
  }

}
