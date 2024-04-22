import { formatDate } from "@angular/common";
import { Component, OnInit, ViewChild } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { NgbModalRef, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { AuthGuard } from "src/app/guards/AuthGuard";
import { AuthIdentity } from "src/app/guards/AuthIdentity";
import { ConsultaListaCatalogoSJuridicaResponse } from "src/app/model/Catalogos/CatalogosSJuridica";
import { RespuestaGenerica } from "src/app/model/Operaciones/generales/RespuestaGenerica";
import { ServiciosRutas } from "src/app/model/Operaciones/generales/ServiciosRutas";
import { LecturaDomicilioRequest } from "src/app/model/Operaciones/Tramite/Domicilio";
import {
  ActualizarTramitePasoTresRequest,
  InsertarTramitePasoTresRequest,
} from "src/app/model/Operaciones/Tramite/Tramite";
import { SentFile } from "src/app/model/Utilities/File";
import { route } from "src/app/model/Utilities/route";
import { TramiteRoutes } from "src/app/model/Utilities/tramiteRoutes";
import { ServiceGenerico } from "src/app/services/service-generico.service";
import { ModuloModalMensajeComponent } from "src/app/shared/modulo-modal-mensaje/modulo-modal-mensaje.component";
import { ModuloPaginacionComponent } from "src/app/shared/modulo-paginacion/modulo-paginacion.component";
import { LocalStorageService } from "../../../services/local-storage.service";
import { TabService } from "../../modulo-declaratoria-procedencia/services/tab.service";
import { Subscription } from "rxjs";
import { FileService } from "src/app/services/file.service";

@Component({
  selector: "app-modulo-solicitud-tercer-paso",
  templateUrl: "./modulo-solicitud-tercer-paso.component.html",
  styleUrls: ["./modulo-solicitud-tercer-paso.component.css"],
  providers: [ServiceGenerico],
})
export class ModuloSolicitudTercerPasoComponent implements OnInit {
  routes: route[];

  request: any;
  response: any;
  ModelDTO: LecturaDomicilioRequest = new LecturaDomicilioRequest();
  listaSJuridica: ConsultaListaCatalogoSJuridicaResponse[] = [];
  TipoDomicilio: number = 3;
  arch_sjuridica: boolean = false;
  arch_mainifiesto: boolean = false;

  arch_sjuridicaBase64: string = null;
  arch_mainifiestoBase64: string = null;

  isDictaminador: boolean = false;
  isAsignador: boolean = false;

  operacionRespuesta: RespuestaGenerica;
  modelo_configuracion: ServiciosRutas;
  formGroup: FormGroup;
  modalrefCreacion: NgbModalRef;
  modalrefMsg: NgbModalRef;
  id_tramite: number;
  us_id: number;
  titulo: string;
  id_bloqueo: number;
  bloqueo: any = false;

  @ViewChild(ModuloPaginacionComponent, { static: true })
  routescmp: ModuloPaginacionComponent;


  ultimoPasoAlQueTenemosAcceso = Number(localStorage.getItem("ultimoPasoAlQueTenemosAcceso"));

  constructor(
    public modalService: NgbModal,
    private fb: FormBuilder,
    private auth: AuthGuard,
    private services: ServiceGenerico,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private localStorageService: LocalStorageService,
    public tabService: TabService,
    public fileService: FileService
  ) {
    this.operacionRespuesta = new RespuestaGenerica();
    this.modelo_configuracion = new ServiciosRutas();
    this.validarAcceso();
  }

  ngOnInit(): void {


    this.formGroup = this.fb.group({
      s_id_tramite: [
        0,
        {
          validators: [Validators.required],
        },
      ],
      s_domicilio: this.fb.group({
        d_id_domicilio: [0],
        d_tipo_domicilio: this.TipoDomicilio,
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
        d_numeroe: [""],
      }),
      s_cat_sjuridica: [
        "",
        {
          validators: [Validators.required],
        },
      ],
      s_cat_sjuridica_file: [
        "",
        {
          // validators: [Validators.required],
        },
      ],
      s_manifiesto_file: [
        "",
        {
          // validators: [Validators.required],
        },
      ],
      s_f_apertura: [
        "",
        {
          validators: [Validators.required],
        },
      ],
      s_f_apertura_id: [""],
    });
    this.obtenerSituaciones();
    this.us_id = AuthIdentity.ObtenerUsuarioRegistro();
    this.isDictaminador = AuthIdentity.IsDictaminador();
    if (this.isDictaminador)
      this.titulo = "Atención de solicitudes de registro";
    else
      this.validarAcceso();
    this.titulo = "Solicitud de Registro Asociación religiosa";
    this.id_tramite = Number(localStorage.getItem("id_tramite")!)
    this.obtenerPasoTres();
    this.routes = TramiteRoutes.GetRoutesByRol(3);
  }

  returnPage(message: string, error: boolean = true, page: number = 1) {
    this.openMensajes(message, error);
    if (!error) {
      this.tabService.cambiarValoresTabs(3, this.ultimoPasoAlQueTenemosAcceso)
      this.tabService.cambiarTabSolicitudRegistro(4)
    }
  }

  patchDomicilio(model: InsertarTramitePasoTresRequest) {
    this.formGroup.get("s_domicilio").patchValue(model);
  }

  OnSubmit() {
    this.editarPasoTres(this.formGroup.value);
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

  obtenerSituaciones() {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpGet(
        this.modelo_configuracion.serviciosCatalogos +
        "/ConsultaListaCatalogosSJuridica/Get?Activos=" +
        true
      )
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.listaSJuridica = [] =
              tempdate.response as ConsultaListaCatalogoSJuridicaResponse[];
          } else {
            this.listaSJuridica = [];
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
      this.isDictaminador = true;
    } else {
      let perfil = AuthIdentity.IsAsignador();
      this.bloqueo = perfil ? true : false
    }
  }

  obtenerPasoTres() {
    // buscamos si tiene info paso 2
    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpGet(
        this.modelo_configuracion.serviciosOperaciones +
        "/ConsultaDetalleTramitePasoTres/Get?i_id_c=" +
        this.id_tramite +
        "&&s_id_us=" +
        this.us_id + "&&dictaminador=" + this.isDictaminador
      )
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.response = tempdate.response[0];
            if (this.response) {
              this.id_tramite = this.response.s_id_tramite;

              let modelRequest = new ActualizarTramitePasoTresRequest();
              modelRequest.s_id_tramite = this.response.s_id_tramite;
              modelRequest.s_cat_sjuridica = this.response.s_cat_sjuridica;
              modelRequest.s_f_apertura_id = this.response.s_f_apertura_id;
              this.arch_sjuridica = this.response.s_file_exist_sjuridica;
              this.arch_mainifiesto = this.response.s_file_exist_manifiesto;
              modelRequest.s_f_apertura = this.response.s_f_apertura;
              modelRequest.s_domicilio = new LecturaDomicilioRequest();
              modelRequest.s_domicilio.d_id_domicilio =
                this.response.d_id_domicilio;
              modelRequest.s_domicilio.d_tipo_domicilio = this.TipoDomicilio;
              modelRequest.s_domicilio.d_numeroe = this.response.d_numeroe;
              modelRequest.s_domicilio.d_numeroi = this.response.d_numeroi;
              modelRequest.s_domicilio.d_colonia = this.response.d_colonia;
              modelRequest.s_domicilio.d_calle = this.response.d_calle;
              modelRequest.s_domicilio.d_cpostal = this.response.c_cpostal_n;
              this.ModelDTO = modelRequest.s_domicilio;
              if (
                modelRequest.s_f_apertura != undefined &&
                modelRequest.s_f_apertura !== ""
              ) {
                this.formGroup
                  .get("s_f_apertura")
                  .patchValue(
                    formatDate(modelRequest.s_f_apertura, "yyyy-MM-dd", "en")
                  );
              }
              this.formGroup.patchValue(modelRequest);
            }
          }
          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.operacionRespuesta.EstaEjecutando = false;
          this.returnPage("Hubo un error al obtener la información", true, 1);
        }
      );
    async (err) => {
      this.returnPage("Hubo un error al obtener la información", true, 1);
      this.operacionRespuesta.EstaEjecutando = false;
    }
    // buscamos si tiene info paso 2
  }

  async editarPasoTres(tramiteUpdate: ActualizarTramitePasoTresRequest) {
    this.operacionRespuesta.EstaEjecutando = true;

    let respuestaArchivoSituacion: boolean = await this.fileService.cargarArchivo(this.id_tramite, this.arch_sjuridicaBase64, 1);
    let respuestaArchivoManifiesto: boolean = await this.fileService.cargarArchivo(this.id_tramite, this.arch_mainifiestoBase64, 2);

    if (respuestaArchivoManifiesto === false || respuestaArchivoSituacion === false) {
      return;
    }

    this.services.HttpPost(tramiteUpdate, this.modelo_configuracion.serviciosOperaciones + "/ActualizarTramitePasoTres/Post").subscribe(
      (tempdate) => {
        if (tempdate) {
          this.response = tempdate.response[0];

          if (this.response.proceso_existoso)
            this.returnPage(this.response.mensaje, false, 4);
          else
            this.openMensajes(
              this.response.mensaje,
              this.response.proceso_existoso
            );
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

  // Validaciones
  obtenerErroresSJuridica() {
    var campo = this.formGroup.get("s_cat_sjuridica");
    if (campo.hasError("required")) return "El campo es requerido";
    if (campo.hasError("minLength")) return "El texto es muy corto";
    if (campo.hasError("maxLength")) return "El texto es demasiado largo";
  }
  obtenerErroresFileSJuridica() {
    var campo = this.formGroup.get("s_cat_sjuridica_file");
    if (campo.hasError("required")) return "El campo es requerido";
    if (campo.hasError("minLength")) return "El texto es muy corto";
    if (campo.hasError("maxLength")) return "El texto es demasiado largo";
  }
  obtenerErroresFileManifiesto() {
    var campo = this.formGroup.get("s_manifiesto_file");
    if (campo.hasError("required")) return "El campo es requerido";
    if (campo.hasError("minLength")) return "El texto es muy corto";
    if (campo.hasError("maxLength")) return "El texto es demasiado largo";
  }
  obtenerErroresFechaApertura() {
    var campo = this.formGroup.get("s_f_apertura");
    if (campo.hasError("required")) return "El campo es requerido";
    if (campo.hasError("minLength")) return "El texto es muy corto";
    if (campo.hasError("maxLength")) return "El texto es demasiado largo";
  }

  setIsLoadingArchivo(is_loading: boolean): void {
    this.operacionRespuesta.EstaEjecutando = is_loading;
  }

  setSentArch(file: SentFile): void {
    switch (file.tipo) {
      case 1:
        this.arch_sjuridica = file.sent;
        this.arch_sjuridicaBase64 = file.sent ? file.base64 : null;
        break;
      case 2:
        this.arch_mainifiesto = file.sent;
        this.arch_mainifiestoBase64 = file.sent ? file.base64 : null
        break;
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
}
