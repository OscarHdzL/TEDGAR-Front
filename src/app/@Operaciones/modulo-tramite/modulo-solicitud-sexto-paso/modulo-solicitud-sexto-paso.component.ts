import { Component, OnInit, ViewChild } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { NgbModalRef, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { AuthGuard } from "src/app/guards/AuthGuard";
import { AuthIdentity } from "src/app/guards/AuthIdentity";
import { ConsultaListaCatalogoConstanciaNotarioArraigoResponse } from "src/app/model/Catalogos/CatalogosConstanciaNotarioArraigo";
import { RespuestaGenerica } from "src/app/model/Operaciones/generales/RespuestaGenerica";
import { ServiciosRutas } from "src/app/model/Operaciones/generales/ServiciosRutas";
import { ActualizarDomicilioRequest } from "src/app/model/Operaciones/Tramite/Domicilio";
import { ActualizarTramitePasoSextoRequest, ConsultaDetalleTramitePasoUnoResponse, FinalizarTramite } from "src/app/model/Operaciones/Tramite/Tramite";
import { SentFile } from "src/app/model/Utilities/File";
import { route } from "src/app/model/Utilities/route";
import { TramiteRoutes } from "src/app/model/Utilities/tramiteRoutes";
import { LocalStorageService } from "src/app/services/local-storage.service";
import { ServiceGenerico } from "src/app/services/service-generico.service";
import { ModuloModalMensajeComponent } from "src/app/shared/modulo-modal-mensaje/modulo-modal-mensaje.component";
import { ModuloPaginacionComponent } from "src/app/shared/modulo-paginacion/modulo-paginacion.component";
import { Subscription, async } from 'rxjs';
import { TabService } from "../../modulo-declaratoria-procedencia/services/tab.service";
import { FileService } from "src/app/services/file.service";

@Component({
  selector: "app-modulo-solicitud-sexto-paso",
  templateUrl: "./modulo-solicitud-sexto-paso.component.html",
  styleUrls: ["./modulo-solicitud-sexto-paso.component.css"],
  providers: [ServiceGenerico],
})
export class ModuloSolicitudSextoPasoComponent implements OnInit {
  routes: route[];
  request: any;
  response: any;
  listaNotario = [];
  listaModalidad = [];

  arch_doc_1: boolean = false;
  arch_doc_2: boolean = false;
  arch_notario: boolean = false;

  arch_doc_1Base64: string = null;
  arch_doc_2Base64: string = null;
  arch_notarioBase64: string = null;

  id_notarioarr: boolean = false;
  isDictaminador: boolean = false;
  isPublico: boolean = true;
  id_tramite: number;
  us_id: number;
  titulo: string;
  id_bloqueo: number;
  bloqueo: any = false;
  tipoSolicitudEscrito: string;
  msjLabelMostrar: string;

  operacionRespuesta: RespuestaGenerica;
  modelo_configuracion: ServiciosRutas;

  formGroup: FormGroup;

  modalrefMsg: NgbModalRef;

  @ViewChild(ModuloPaginacionComponent, { static: true })
  routescmp: ModuloPaginacionComponent;

  validarConstancia = false;


  ultimoPasoAlQueTenemosAcceso = Number(localStorage.getItem("ultimoPasoAlQueTenemosAcceso"));

  constructor(public modalService: NgbModal,
    private fb: FormBuilder,
    private auth: AuthGuard,
    private services: ServiceGenerico,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private localStorageService: LocalStorageService,
    public tabService: TabService,
    public fileService: FileService) {
    this.operacionRespuesta = new RespuestaGenerica();
    this.modelo_configuracion = new ServiciosRutas();
    this.validarAcceso();
    this.iniciarFormulario();
  }

  async ngOnInit() {

    this.us_id = AuthIdentity.ObtenerUsuarioRegistro();
    this.isDictaminador = AuthIdentity.IsDictaminador();
    this.isPublico = AuthIdentity.IsUsuarioPublico();
    this.id_tramite = Number(localStorage.getItem("id_tramite")!)
    if (this.isDictaminador)
      this.titulo = "Atención de solicitudes de registro";
    else
      this.validarAcceso();
    this.titulo = "Solicitud de Registro Asociación religiosa";
    this.routes = TramiteRoutes.GetRoutesByRol(6);
    await this.cargarModalidades();
    await this.obtenerConsultaDetalle();
    await this.obtenerPasoSexto();
  }

  async ngAfterViewInit() {
    await this.obtenerPasoSexto();
  }

  private iniciarFormulario(): void {
    this.formGroup = this.fb.group({
      s_id: ["", { validators: [Validators.required], }],
      s_cat_notarioarr: [0, { validators: [Validators.min(1)], },],
      s_cat_modalidad: [0, { validators: [Validators.min(1)], },],
    });
  }

  validarAcceso(): void {
    let params = this.localStorageService.getJsonValue('solicitudregistroconsulta');
    if (params != null && localStorage.getItem("solicitudregistroconsulta") === "1") {
      this.bloqueo = params.idbloqueo
      this.isDictaminador = true;
    } else {
      let perfil = AuthIdentity.IsAsignador();
      this.bloqueo = perfil ? true : false
    }
  }

  async obtenerConsultaDetalle() {

    this.operacionRespuesta.EstaEjecutando = true;
    this.services.getAsync(`${this.modelo_configuracion.serviciosOperaciones}/ConsultaDetalleTramitePasoUno/Get?i_id_c=${this.id_tramite}&&s_id_us=${this.us_id}&&dictaminador=${this.isDictaminador}`)
      .then(async (tempdate) => {
        this.operacionRespuesta.EstaEjecutando = false;
        if (tempdate != null && tempdate.response[0]) {
          const responseUno = tempdate.response[0] as ConsultaDetalleTramitePasoUnoResponse;
          this.tipoSolicitudEscrito = responseUno.s_cat_solicitud_escrito.toString();
          this.msjLabelMostrar = this.tipoSolicitudEscrito === '1' ? 'Escrito de matriz' : 'Constancia Notorio Arraigo';
          await this.obtenerNotario();
        } else {
          await this.obtenerNotario();
        }
      }, async (err) => {
        await this.obtenerNotario();
        this.operacionRespuesta.EstaEjecutando = false;
      });
  }

  async obtenerNotario() {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services.getAsync(this.modelo_configuracion.serviciosCatalogos + "/ConsultaListaCatalogosCnotarioarr/Get?tipoSolicitud=" + this.tipoSolicitudEscrito)
      .then((tempdate) => {
        this.operacionRespuesta.EstaEjecutando = false;
        this.listaNotario = [];
        if (tempdate) {
          const filtrarTemp = tempdate.response as ConsultaListaCatalogoConstanciaNotarioArraigoResponse[];
          this.listaNotario = filtrarTemp.filter(f => f.c_activo === true);
          if (!this.isDictaminador && !this.isPublico) {
            //this.formGroup.controls['s_cat_notarioarr'].reset();
            //this.formGroup.controls['s_cat_notarioarr'].setValue(0);
          } else if (!this.isDictaminador && this.isPublico) {
            // this.formGroup.controls['s_cat_notarioarr'].reset();
            // this.formGroup.controls['s_cat_notarioarr'].setValue(0);
          }
        }
      }, async (err) => {
        this.operacionRespuesta.EstaEjecutando = false;
      }
      );
  }



  returnPage(message: string, error: boolean = true, page: number = 1) {
    this.openMensajes(message, error);
  }

  async OnSubmit() {
    if(this.formGroup.controls['s_cat_notarioarr'].value == 1) {
      this.validarConstancia = true;
      return;
    }
    await this.editarPasoSexto();
    this.tabService.cambiarValoresTabs(6, this.ultimoPasoAlQueTenemosAcceso)
    this.tabService.cambiarTabSolicitudRegistro(6)
    this.exitPublic()
  }

  exitPublic() {
    this.isDictaminador = AuthIdentity.IsDictaminador();
    const asignador = AuthIdentity.IsAsignador();
    if (this.isDictaminador || asignador) {
      if (asignador) {
        this.router.navigate(['/asignacion/registro-asociacion']);
      } else {
        this.router.navigate(['/registros-tramite-dictaminador']);
      }
    } else {
      this.router.navigate(['/registros-tramite'])
    }
  }

  async obtenerPasoSexto() {
    this.operacionRespuesta.EstaEjecutando = true;
    await this.services
      .HttpGet(this.modelo_configuracion.serviciosOperaciones +
        "/ConsultaDetalleTramitePasoSexto/Get?i_id_c=" +
        this.id_tramite + '&&s_id_us=' + this.us_id + '&&dictaminador=' + this.isDictaminador).subscribe(
          (tempdate: any) => {
            if (tempdate) {
              this.response = tempdate.response[0];
              if (this.response) {
                this.id_tramite = this.response.s_id;
                this.id_notarioarr = this.response.s_id_cnotorioarr;
                this.arch_notario = this.response.s_doc_notario;
                this.arch_doc_1 = this.response.s_doc_ext_1;
                this.arch_doc_2 = this.response.s_doc_ext_2;
                this.formGroup.patchValue(this.response);
                this.formGroup.get('s_cat_notarioarr').setValue(Number(this.response.s_cat_notarioarr));
              }
            } else {
              this.returnPage("Antes de continuar complete el primer paso.", true, 1);
            }
          },
          (error) => {
            this.operacionRespuesta.EstaEjecutando = false;
            this.operacionRespuesta.EsMsjError = false;
          });
  }

  async editarPasoSexto() {
    let tramiteUpdate = new ActualizarTramitePasoSextoRequest();
    tramiteUpdate = this.formGroup.value;
    this.operacionRespuesta.EstaEjecutando = true;

    let arch_notario: boolean = await this.fileService.cargarArchivo(this.id_tramite, this.arch_notarioBase64, 10);
    let doc1: boolean = await this.fileService.cargarArchivo(this.id_tramite, this.arch_doc_1Base64, 11);
    let doc2: boolean = await this.fileService.cargarArchivo(this.id_tramite, this.arch_doc_2Base64, 12);


    if (arch_notario === false || doc1 === false || doc2 === false) {
      return;
    }


    this.services
      .HttpPost(
        tramiteUpdate,
        this.modelo_configuracion.serviciosOperaciones +
        "/ActualizarTramitePasoSexto/Post"
      )
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.response = tempdate.response[0];
            this.openMensajes(this.response.mensaje, !this.response.proceso_existoso);
          } else {
            this.openMensajes("No se pudo realizar la acción", true);
          }

          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.openMensajes("No se pudo realizar la acción", true);
          this.operacionRespuesta.EstaEjecutando = false;
        }
      );
  }

  async Finalizar() {
    if(this.formGroup.controls['s_cat_notarioarr'].value == 1) {
      this.validarConstancia = true;
      return;
    }

    let tramiteUpdate = new ActualizarTramitePasoSextoRequest();
    tramiteUpdate = this.formGroup.value;
    this.operacionRespuesta.EstaEjecutando = true;

    let arch_notario: boolean = await this.fileService.cargarArchivo(this.id_tramite, this.arch_notarioBase64, 10);
    let doc1: boolean = await this.fileService.cargarArchivo(this.id_tramite, this.arch_doc_1Base64, 11);
    let doc2: boolean = await this.fileService.cargarArchivo(this.id_tramite, this.arch_doc_2Base64, 12);


    if (arch_notario === false || doc1 === false || doc2 === false) {
      return;
    }

    //"/ActualizarTramitePasoSexto/Post"
    this.services
      .HttpPost(
        tramiteUpdate,
        this.modelo_configuracion.serviciosOperaciones +
        "/ActualizarTramitePasoSexto/Finalizar"
      )
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.operacionRespuesta.EstaEjecutando = true;
            let params = new FinalizarTramite();
            params.s_id = this.id_tramite;
            params.s_id_us = this.us_id;
            this.services
              .HttpPost(
                params,
                this.modelo_configuracion.serviciosOperaciones +
                "/FinalizarTramite/Post"
              )
              .subscribe(
                (tempdate) => {
                  if (tempdate) {
                    this.response = tempdate.response[0];
                    this.openMensajes(this.response.mensaje, !this.response.proceso_existoso, this.response.proceso_existoso);
                    this.tabService.cambiarValoresTabs(6, this.ultimoPasoAlQueTenemosAcceso)
                    this.tabService.cambiarTabSolicitudRegistro(6)
                    this.exitPublic()
                  } else {
                    this.openMensajes("No se pudo realizar la acción", true);
                  }

                  this.operacionRespuesta.EstaEjecutando = false;
                },
                async (err) => {
                  this.openMensajes("No se pudo realizar la acción", true);
                  this.operacionRespuesta.EstaEjecutando = false;
                }
              );
          } else {
            this.openMensajes("No se pudo realizar la acción", true);
          }

          // this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.openMensajes("No se pudo realizar la acción", true);
          this.operacionRespuesta.EstaEjecutando = false;
        }
      );
  }

  setIsLoadingArchivo(is_loading: boolean): void {
    this.operacionRespuesta.EstaEjecutando = is_loading;
  }
  // Validaciones
  obtenerErroresNotarioArr() {
    var campo = this.formGroup.get("s_cat_notarioarr");
    if (campo.hasError("required")) return "El campo es requerido";
    if (campo.hasError("min")) return "El campo es requerido";
    return "";
  }

  obtenerErroresModalidad() {
    var campo = this.formGroup.get("s_cat_modalidad");
    if (campo.hasError("min")) return "El campo es requerido";
    return "";
  }

  async cargarModalidades() {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services.getAsync(`${this.modelo_configuracion.serviciosCatalogos}/ConsultaListaCatalogosCotejo/Get?Activos=${true}`)
      .then((response: any) => {
        this.operacionRespuesta.EstaEjecutando = false;
        this.listaModalidad = response.response;
      },
        (error) => {
          this.operacionRespuesta.EstaEjecutando = false;
          this.operacionRespuesta.EsMsjError = false;
        });
  }

  setSentArch(file: SentFile): void {
    switch (file.tipo) {
      case 10:
        this.arch_notario = file.sent;
        this.arch_notarioBase64 = file.sent ? file.base64 : null;
        break;
      case 11:
        this.arch_doc_1 = file.sent;
        this.arch_doc_1Base64 = file.sent ? file.base64 : null;
        break;
      case 12:
        this.arch_doc_2 = file.sent;
        this.arch_doc_2Base64 = file.sent ? file.base64 : null;
        break;
    }
  }
  //#region Mensajes
  openMensajes(Mensaje: string, Error: boolean, finalizado: boolean = false, titulo: string = "Carga de Información") {
    this.modalrefMsg = this.modalService.open(ModuloModalMensajeComponent, {
      ariaLabelledBy: "modal-basic-title",
    });
    this.modalrefMsg.componentInstance.mensajesExito = [];
    this.modalrefMsg.componentInstance.mensajesError = [];
    this.modalrefMsg.componentInstance.mensajesTitulo = titulo;
    if (Error) {
      this.modalrefMsg.componentInstance.showErrors = true;
      this.modalrefMsg.componentInstance.mensajesError.push(Mensaje);
    } else {
      this.modalrefMsg.componentInstance.showExitos = true;
      this.modalrefMsg.componentInstance.mensajesExito.push(Mensaje);
    }
    if (finalizado) {
      let instance = this;
      this.modalrefMsg.result.then(() => {
        instance.router.navigate(["tramites-electronicos"]);
      }, () => {
        instance.router.navigate(["tramites-electronicos"]);
      });
    }
  }
  //#endregion

}
