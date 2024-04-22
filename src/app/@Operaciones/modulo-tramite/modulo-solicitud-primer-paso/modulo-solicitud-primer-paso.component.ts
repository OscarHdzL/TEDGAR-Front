import { Component, OnInit, ViewChild } from "@angular/core";
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { ActivatedRoute, Router } from "@angular/router";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { AuthGuard } from "src/app/guards/AuthGuard";
import { ConsultaListaCatalogoCredoResponse } from "src/app/model/Catalogos/CatalogosCredo";
import { ConsultaListaCatalogoPaisoResponse } from "src/app/model/Catalogos/CatalogosPaiso";
import { ConsultaListaCatalogoTSolRegResponse } from "src/app/model/Catalogos/CatalogosTSolReg";
import { RespuestaGenerica } from "src/app/model/Operaciones/generales/RespuestaGenerica";
import { ServiciosRutas } from "src/app/model/Operaciones/generales/ServiciosRutas";
import {
  InsertarDomicilioRequest,
  LecturaDomicilioRequest,
} from "src/app/model/Operaciones/Tramite/Domicilio";
import {
  ConsultaDetalleTramitePasoUnoResponse,
  EditarTramitePasoUnoRequest,
  InsertarTramitePasoUnoRequest,
  InsertarTramitePasoUnoResponse,
} from "src/app/model/Operaciones/Tramite/Tramite";
import { route } from "src/app/model/Utilities/route";
import { ServiceGenerico } from "src/app/services/service-generico.service";
import { ModuloModalMensajeComponent } from "src/app/shared/modulo-modal-mensaje/modulo-modal-mensaje.component";
import { ModuloPaginacionComponent } from "src/app/shared/modulo-paginacion/modulo-paginacion.component";
import { AuthIdentity } from "src/app/guards/AuthIdentity";
import { TramiteRoutes } from "src/app/model/Utilities/tramiteRoutes";
import { LocalStorageService } from "src/app/services/local-storage.service";
import { TabService } from "../../modulo-declaratoria-procedencia/services/tab.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-modulo-solicitud-primer-paso",
  templateUrl: "./modulo-solicitud-primer-paso.component.html",
  styleUrls: ["./modulo-solicitud-primer-paso.component.css"],
  providers: [ServiceGenerico],
})
export class ModuloSolicitudPrimerPasoComponent implements OnInit {
  routes: route[];

  request: any;
  response: any;
  listaCredo: ConsultaListaCatalogoCredoResponse[] = [];
  listaSolicitudEscrito = [];
  listaPais = [];
  ModelDTO: LecturaDomicilioRequest = new LecturaDomicilioRequest();
  id_tramite: number;
  id_bloqueo: number;
  bloqueo: any = false;
  us_id: number;
  titulo: string;
  tipoSolicitud: string;
  isDictaminador: boolean = false;
  isAsignador: boolean = false;
  seleccionoMatriz: boolean = false;
  msjLabelMostrar: string;
  SolicitudId: number;
  operacionRespuesta: RespuestaGenerica;
  modelo_configuracion: ServiciosRutas;
  formGroup: FormGroup;

  modalrefMsg: NgbModalRef;

  @ViewChild(ModuloPaginacionComponent, { static: true })
  routescmp: ModuloPaginacionComponent;

  ultimoPasoAlQueTenemosAcceso = Number(localStorage.getItem("ultimoPasoAlQueTenemosAcceso"));
  constructor(
    public modalService: NgbModal,
    private fb: FormBuilder,
    private auth: AuthGuard,
    private services: ServiceGenerico,
    private activetedRoute: ActivatedRoute,
    private localStorageService: LocalStorageService,
    public tabService: TabService,
    private router: Router
  ) {
    this.operacionRespuesta = new RespuestaGenerica();
    this.modelo_configuracion = new ServiciosRutas();
    this.validarAcceso();
  }

  ngOnInit(): void {


    this.formGroup = this.fb.group({
      s_id: [0],
      s_cat_credo: [
        "",
        {
          validators: [Validators.required],
        },
      ],
      s_cat_solicitud_escrito: [
        "",
        {
          validators: [Validators.required],
        },
      ],
      s_cat_denominacion: [
        "",
        {
          validators: [
            Validators.required,

            Validators.minLength(1),
            Validators.maxLength(250),
          ],
        },
      ],
      c_matriz: [""],
      s_numero_registro: [""],
      s_pais_origen: [
        "",
        {
          validators: [Validators.required],
        },
      ],
      s_domicilio: this.fb.group({
        d_id_domicilio: [0],
        d_tipo_domicilio: 0,
        d_cpostal: [
          "",
          {
            validators: [
              Validators.required,
              Validators.maxLength(5),
              Validators.maxLength(6),
            ],
          },
        ],
        d_endidad: [""],
        d_colonia: [
          "",
          {
            validators: [Validators.required],
          },
        ],
        d_ciudad: [""],
        d_calle: [
          "",
          {
            validators: [
              Validators.required,
              Validators.minLength(1),
              Validators.maxLength(250),
            ],
          },
        ],
        d_numeroi: [
          "",
          {
            validators: [
              Validators.minLength(1),
              Validators.maxLength(6),
            ],
          },
        ],
        d_numeroe: [""]
      }),
    });
    this.obtenerPaises();
    this.obtenerCredo();
    this.obtenerSolReg();
    this.us_id = AuthIdentity.ObtenerUsuarioRegistro();
    this.isDictaminador = AuthIdentity.IsDictaminador();
    this.isAsignador = AuthIdentity.IsAsignador()



    this.id_tramite = Number(localStorage.getItem("id_tramite")!)
    // console.log(this.id_tramite)
    if (this.id_tramite != 0) {

    } else {
      localStorage.setItem("solicitudregistroconsulta", "0");
    }

    if (this.isDictaminador)
      this.titulo = "Atención de solicitudes de registro";
    else
      this.titulo = "Solicitud de Registro Asociación religiosa";
    if (this.id_tramite != null) {
      this.obtenerPasoUno();
    }

    this.routes = TramiteRoutes.GetRoutesByRol(1);
  }


  obtenerPaises() {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpGet(
        this.modelo_configuracion.serviciosCatalogos +
        "/ConsultaListaCatalogosPaiso/Get"
      )
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.listaPais = [] =
              tempdate.response as ConsultaListaCatalogoPaisoResponse[];
          } else {
            this.listaPais = [];
          }
          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.operacionRespuesta.EstaEjecutando = false;
        }
      );
  }

  validarAcceso(): void {
    let params = this.localStorageService.getJsonValue('solicitudregistroconsulta');
    if (params != null && localStorage.getItem("solicitudregistroconsulta") === "1") {
      this.bloqueo = params.idbloqueo
    } else {
      let perfil = AuthIdentity.IsAsignador();
      this.bloqueo = perfil ? true : false
    }
  }

  obtenerCredo() {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpGet(
        this.modelo_configuracion.serviciosCatalogos +
        "/ConsultaListaCatalogosCredo/Get?Activos=" +
        true
      )
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.listaCredo = [] =
              tempdate.response as ConsultaListaCatalogoCredoResponse[];
          } else {
            this.listaCredo = [];
          }
          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.operacionRespuesta.EstaEjecutando = false;
        }
      );
  }

  obtenerSolReg() {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpGet(
        this.modelo_configuracion.serviciosCatalogos +
        "/ConsultaListaCatalogosSolicitudEscrito/Get?Activos=" +
        true
      )
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.listaSolicitudEscrito = [] =
              tempdate.response as ConsultaListaCatalogoTSolRegResponse[];
          } else {
            this.listaSolicitudEscrito = [];
          }
          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.operacionRespuesta.EstaEjecutando = false;
        }
      );
  }

  obtenerPasoUno() {
    this.operacionRespuesta.EstaEjecutando = true;

    this.services

      .HttpGet(
        this.modelo_configuracion.serviciosOperaciones +
        "/ConsultaDetalleTramitePasoUno/Get?i_id_c=" +
        this.id_tramite + '&&s_id_us=' + this.us_id + '&&dictaminador=' + this.isDictaminador
      )
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.response = tempdate
              .response[0] as ConsultaDetalleTramitePasoUnoResponse;
            if (this.response) {
              let modelRequest = new EditarTramitePasoUnoRequest();
              modelRequest.s_id = this.response.s_id;
              modelRequest.s_cat_credo = this.response.s_cat_credo;
              modelRequest.s_cat_solicitud_escrito = this.response.s_cat_solicitud_escrito;
              modelRequest.s_cat_denominacion = this.response.s_cat_denominacion;
              modelRequest.s_numero_registro = this.response.s_numero_registro;
              modelRequest.s_pais_origen = this.response.s_pais_origen;
              modelRequest.s_domicilio = new LecturaDomicilioRequest();
              modelRequest.s_domicilio.d_id_domicilio = this.response.d_id_domicilio;
              modelRequest.s_domicilio.d_tipo_domicilio = this.response.d_tipo_domicilio;
              modelRequest.s_domicilio.d_numeroe = this.response.d_numeroe;
              modelRequest.s_domicilio.d_numeroi = this.response.d_numeroi;
              modelRequest.s_domicilio.d_colonia = this.response.d_colonia;
              modelRequest.s_domicilio.d_calle = this.response.d_calle;
              modelRequest.s_domicilio.d_cpostal = this.response.c_cpostal_n;
              modelRequest.c_matriz = this.response.c_matriz;
              this.seleccionoMatriz = this.response.s_cat_solicitud_escrito == '1' ? true : false;
              this.ModelDTO = modelRequest.s_domicilio;
              this.formGroup.patchValue(modelRequest);
              this.id_tramite = this.response.s_id;
              this.tipoSolicitudEscrito(this.response.s_cat_solicitud_escrito.toString());

            }
          } else {
            this.response = [];
            this.tipoSolicitudEscrito('');
          }
          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.operacionRespuesta.EstaEjecutando = false;
        }
      );
  }

  patchDomicilio(model: InsertarDomicilioRequest) {
    this.formGroup.get("s_domicilio").patchValue(model);
  }

  OnSubmit() {
    let valor = this.formGroup.controls['s_cat_denominacion'].value.trim();
    if (valor === '') return;

    if (this.formGroup.value.s_id === 0)
      this.registrarPasoUno(this.formGroup.value);
    else this.editarPasoUno(this.formGroup.value);
  }

  registrarPasoUno(tramiteInsert: InsertarTramitePasoUnoRequest) {

    this.operacionRespuesta.EstaEjecutando = true;
    tramiteInsert.s_id_us = this.us_id;
    this.services
      .HttpPost(
        tramiteInsert,
        this.modelo_configuracion.serviciosOperaciones +
        "/InsertarTramitePasoUno/Post"
      )
      .subscribe(
        async (tempdate) => {
          if (tempdate) {
            this.response = tempdate
              .response[0] as InsertarTramitePasoUnoResponse;

            if (this.response.proceso_existoso) {
              this.formGroup.get("s_id").patchValue(this.response.id_tramite);
              this.id_tramite = this.response.id_tramite;
              localStorage.setItem("id_tramite", String(this.response.id_tramite))
              await this.returnPage(this.response.mensaje, false);
            }
          } else {
            this.openMensajes(
              "No se pudo realizar la acción",
              true
            );
          }

          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.openMensajes(
            "No se pudo realizar la acción",
            true
          );

          this.operacionRespuesta.EstaEjecutando = false;
        }
      );
  }
  editarPasoUno(tramiteUpdate: EditarTramitePasoUnoRequest) {
    tramiteUpdate.s_id_us = this.us_id;

    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpPost(
        tramiteUpdate,
        this.modelo_configuracion.serviciosOperaciones +
        "/ActualizarTramitePasoUno/Post"
      )
      .subscribe(
        async (tempdate) => {
          if (tempdate) {
            this.response = tempdate.response[0];
            if (this.response.proceso_existoso) {
              this.id_tramite = this.response.id_tramite;
              await this.returnPage(this.response.mensaje, false);
            } else {
              this.openMensajes(this.response.mensaje, true);
            }
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

  async returnPage(message: string, error: boolean = true) {
    this.openMensajes(message, error);
    if (!error) {
      this.tabService.cambiarTabSolicitudRegistro(2)
      this.tabService.cambiarValoresTabs(1, this.ultimoPasoAlQueTenemosAcceso)
    }

  }

  //#region Mensajes
  openMensajes(Mensaje: string, Error: boolean) {
    this.modalrefMsg = this.modalService.open(ModuloModalMensajeComponent, {
      ariaLabelledBy: "modal-basic-title",
    });
    this.modalrefMsg.componentInstance.mensajesExito = [];
    this.modalrefMsg.componentInstance.mensajesError = [];
    this.modalrefMsg.componentInstance.mensajesTitulo = "Carga de Información";
    if (Error) {
      this.modalrefMsg.componentInstance.showErrors = true;
      this.modalrefMsg.componentInstance.mensajesError.push(Mensaje);
    } else {
      this.modalrefMsg.componentInstance.showExitos = true;
      this.modalrefMsg.componentInstance.mensajesExito.push(Mensaje);
    }
  }
  //#endregion

  // Validaciones
  obtenerErroresCredo() {
    var campo = this.formGroup.get("s_cat_credo");
    if (campo.hasError("required")) return "El campo es requerido";
    if (campo.hasError("minlength")) return "El texto es muy corto";
    if (campo.hasError("maxlength")) return "El texto es demasiado largo";
  }
  obtenerErroresSolicitudEscrito() {
    var campo = this.formGroup.get("s_cat_solicitud_escrito");
    if (campo.hasError("required")) return "El campo es requerido";
    if (campo.hasError("minlength")) return "El texto es muy corto";
    if (campo.hasError("maxlength")) return "El texto es demasiado largo";
  }
  obtenerErroresDenominacion() {
    var campo = this.formGroup.get("s_cat_denominacion");
    if (campo.hasError("required")) return "El campo es requerido";
    if (campo.hasError("minlength")) return "El texto es muy corto";
    if (campo.hasError("maxlength")) return "El texto es demasiado largo";
    if (campo.hasError("pattern")) return "No se permite el uso de \"comilla\",por favor verifique verifique";
  }

  obtenerErroresPaisOrigen() {
    var campo = this.formGroup.get("s_pais_origen");
    if (campo.hasError("required")) return "El campo es requerido";
    if (campo.hasError("minlength")) return "El texto es muy corto";
    if (campo.hasError("maxlength")) return "El texto es demasiado largo";
  }

  obtenerErroresMatriz() {
    var campo = this.formGroup.get("c_matriz");
    if (campo.hasError("required")) return "El campo es requerido";
    if (campo.hasError("pattern")) return "Solo son permitidos los siguientes / : , por favor verifique";
  }

  //#region Eventos
  public seleccionoTipoSolicitudEscrito(valor: any): void {
    if (valor && valor === '1') {
      this.msjLabelMostrar = (this.isDictaminador == true && valor === '1') ? 'No. De Registro/Matriz' : 'Número de SGAR ';

      this.seleccionoMatriz = true;
      this.formGroup.controls['c_matriz'].reset();
      this.formGroup.controls['c_matriz'].addValidators(Validators.compose([
        Validators.required,
        Validators.pattern(/^[-_/: a-zA-Z0-9]+$/)]));
      this.formGroup.controls['c_matriz'].updateValueAndValidity();
    } else {
      this.msjLabelMostrar = 'Matriz';
      this.seleccionoMatriz = false;
      this.formGroup.controls['c_matriz'].reset();
      this.formGroup.controls['c_matriz'].clearValidators();
      this.formGroup.controls['c_matriz'].updateValueAndValidity();
    }


  }

  private tipoSolicitudEscrito(valor: string): void {

    if (valor && valor === '1') {
      this.msjLabelMostrar = (this.isDictaminador == true && valor === '1') ? 'No. De Registro/Matriz' : 'Matriz';

      this.formGroup.controls['c_matriz'].addValidators(Validators.compose([
        Validators.required,
        Validators.pattern(/^[-_/: a-zA-Z0-9]+$/)]));
      this.formGroup.controls['c_matriz'].updateValueAndValidity();
      this.formGroup.controls['c_matriz'].markAsTouched();
    } else {
      this.msjLabelMostrar = 'Matriz';
      this.formGroup.controls['c_matriz'].reset();
      this.formGroup.controls['c_matriz'].clearValidators();
      this.formGroup.controls['c_matriz'].updateValueAndValidity();
    }

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

  validaCamposFormulario(formGroups: FormGroup[]) {
    formGroups.forEach((formulario) => {
      Object.keys(formulario.controls).forEach((field) => {
        const control = formulario.get(field);
        if (control instanceof FormControl) {
          control.markAsTouched({ onlySelf: true });
        } else if (control instanceof FormGroup) {
          this.validaCamposFormulario([control]);
        } else if (control instanceof FormArray) {
          control.controls.forEach((element) => {
            if (element instanceof FormControl) {
              element.markAsTouched({ onlySelf: true });
            } else if (element instanceof FormGroup) {
              this.validaCamposFormulario([element]);
            }
          });
        }
      });
    });
  }

  //#endregion
}
