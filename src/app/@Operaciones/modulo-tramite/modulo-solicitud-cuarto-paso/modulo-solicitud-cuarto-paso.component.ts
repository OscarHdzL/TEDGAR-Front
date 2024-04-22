import { Component, OnInit, ViewChild } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { NgbModalRef, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { param } from "jquery";
import { AuthGuard } from "src/app/guards/AuthGuard";
import { AuthIdentity } from "src/app/guards/AuthIdentity";
import { ConsultaListaCatalogoAvisoAperturaResponse } from "src/app/model/Catalogos/CatalogosAvisoApertura";
import { RespuestaGenerica } from "src/app/model/Operaciones/generales/RespuestaGenerica";
import { ServiciosRutas } from "src/app/model/Operaciones/generales/ServiciosRutas";
import {
  ActualizarTramitePasoCuatroRequest,
  InsertarTramitePasoCuatroRequest,
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
  selector: "app-modulo-solicitud-cuarto-paso",
  templateUrl: "./modulo-solicitud-cuarto-paso.component.html",
  styleUrls: ["./modulo-solicitud-cuarto-paso.component.css"],
  providers: [ServiceGenerico],
})
export class ModuloSolicitudCuartoPasoComponent implements OnInit {
  routes: route[];

  request: any;
  response: any;
  listaAvisos = [];
  id_tramite: number;
  us_id: number;
  titulo: string;

  arch_ine_us: boolean = false;
  arch_ine_prop: boolean = false;
  arch_titulo: boolean = false;
  arch_avisoap: boolean = false;
  arch_estatuto: boolean = false;

  arch_ine_usBase64: string = null;
  arch_ine_propBase64: string = null;
  arch_tituloBase64: string = null;
  arch_avisoapBase64: string = null;
  arch_estatutoBase64: string = null;

  operacionRespuesta: RespuestaGenerica;
  modelo_configuracion: ServiciosRutas;
  formGroup: FormGroup;
  id_bloqueo: number;
  bloqueo: any;
  modalrefCreacion: NgbModalRef;
  modalrefMsg: NgbModalRef;
  isDictaminador: boolean = false;

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
      s_id: [
        0,
        {
          validators: [Validators.required],
        },
      ],
      s_superficie: [
        "",
        {
          validators: [
            Validators.required,
            Validators.min(1),
            Validators.maxLength(20),
          ],
        },
      ],
      s_medidas: [
        "",
        {
          validators: [
            Validators.required,
            Validators.min(1),
            Validators.maxLength(20),
          ],
        },
      ],
      s_colindancia_text_1: [
        "",
        {
          validators: [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(200),
          ],
        },
      ],
      s_colindancia_text_2: [
        "",
        {
          validators: [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(200),
          ],
        },
      ],
      s_colindancia_text_3: [
        "",
        {
          validators: [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(200),
          ],
        },
      ],
      s_colindancia_text_4: [
        "",
        {
          validators: [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(200),
          ],
        },
      ],
      s_colindancia_num_1: [
        "",
        {
          validators: [
            Validators.required,
            Validators.min(1),
            Validators.maxLength(8),
          ],
        },
      ],
      s_colindancia_num_2: [
        "",
        {
          validators: [
            Validators.required,
            Validators.min(1),
            Validators.maxLength(8),
          ],
        },
      ],
      s_colindancia_num_3: [
        "",
        {
          validators: [
            Validators.required,
            Validators.min(1),
            Validators.maxLength(8),
          ],
        },
      ],
      s_colindancia_num_4: [
        "",
        {
          validators: [
            Validators.required,
            Validators.min(1),
            Validators.maxLength(8),
          ],
        },
      ],
      s_colindancia_usos: [
        "",
        {
          validators: [
            Validators.required,
          ],
        },
      ],
      s_ine_propietario_file: [
        "",
        {
          // validators: [Validators.required],
        },
      ],
      s_ine_usuario_file: [
        "",
        {
          // validators: [Validators.required],
        },
      ],
      s_titulo_propiedad_file: [
        "",
        {
          // validators: [Validators.required],
        },
      ],
      s_aviso_apertura: [
        "",
        {
          validators: [Validators.required, Validators.min(1)],
        },
      ],
      s_aviso_apertura_file: [
        "",
        {
          // validators: [Validators.required],
        },
      ],
      s_estatuto_file: [
        "",
        {
          // validators: [Validators.required],
        },
      ],
    });
    this.obtenerAvisos();
    this.us_id = AuthIdentity.ObtenerUsuarioRegistro();
    this.isDictaminador = AuthIdentity.IsDictaminador();
    if (this.isDictaminador)
      this.titulo = "Atención de solicitudes de registro";
    else
      this.validarAcceso();
    this.titulo = "Solicitud de Registro Asociación religiosa";
    this.id_tramite = Number(localStorage.getItem("id_tramite")!)
    this.obtenerPasoCuatro();
    this.routes = TramiteRoutes.GetRoutesByRol(4);
  }

  returnPage(message: string, error: boolean = true, page: number = 1) {
    this.openMensajes(message, error);
    if (!error) {
      this.tabService.cambiarValoresTabs(4, this.ultimoPasoAlQueTenemosAcceso)
      this.tabService.cambiarTabSolicitudRegistro(5)
    }

  }

  obtenerAvisos() {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpGet(
        this.modelo_configuracion.serviciosCatalogos +
        "/ConsultaListaCatalogosAvisoApertura/Get"
      )
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.listaAvisos = [] =
              tempdate.response as ConsultaListaCatalogoAvisoAperturaResponse[];
          } else {
            this.listaAvisos = [];
          }
          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.operacionRespuesta.EstaEjecutando = false;
        }
      );
  }

  OnSubmit() {
    this.editarPasoCuatro(this.formGroup.value);
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

  obtenerPasoCuatro() {
    this.operacionRespuesta.EstaEjecutando = true;
    // buscamos si tiene info paso 3
    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpGet(
        this.modelo_configuracion.serviciosOperaciones +
        "/ConsultaDetalleTramitePasoCuatro/Get?i_id_c=" +
        this.id_tramite + '&&s_id_us=' + this.us_id + '&&dictaminador=' + this.isDictaminador
      )
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.response = tempdate.response[0];
            this.response = tempdate.response[0];
            if (this.response) {
              this.id_tramite = this.response.s_id;
              let modelRequest = new ActualizarTramitePasoCuatroRequest();
              modelRequest.s_id = this.response.s_id;
              modelRequest.s_superficie = this.response.s_superficie;
              modelRequest.s_medidas = this.response.s_medidas;
              modelRequest.s_colindancia_text_1 = this.response.s_colindancia_text_1;
              modelRequest.s_colindancia_text_2 = this.response.s_colindancia_text_2;
              modelRequest.s_colindancia_text_3 = this.response.s_colindancia_text_3;
              modelRequest.s_colindancia_text_4 = this.response.s_colindancia_text_4;
              modelRequest.s_colindancia_num_1 = this.response.s_colindancia_num_1;
              modelRequest.s_colindancia_num_2 = this.response.s_colindancia_num_2;
              modelRequest.s_colindancia_num_3 = this.response.s_colindancia_num_3;
              modelRequest.s_colindancia_num_4 = this.response.s_colindancia_num_4;
              modelRequest.s_colindancia_usos = this.response.s_usos;
              modelRequest.s_aviso_apertura = this.response.s_aviso_apertura;
              this.arch_ine_prop = this.response.s_ine_propietario_file;
              this.arch_ine_us = this.response.s_ine_usuario_file;
              this.arch_titulo = this.response.s_titulo_propiedad_file;
              this.arch_avisoap = this.response.s_aviso_apertura_file;
              this.arch_estatuto = this.response.s_estatuto_file;
              this.formGroup.patchValue(modelRequest);
            }
          } else {
            this.returnPage("Antes de continuar complete el primer paso.");
          }
          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.returnPage("Hubo un error al obtener la información");

          this.operacionRespuesta.EstaEjecutando = false;
        }
      );
    // buscamos si tiene info paso 3
  }

  async editarPasoCuatro(tramiteUpdate: ActualizarTramitePasoCuatroRequest) {
    this.operacionRespuesta.EstaEjecutando = true;

    let arch_ine_usBase64: boolean = await this.fileService.cargarArchivo(this.id_tramite, this.arch_ine_usBase64, 3);
    let arch_ine_propBase64: boolean = await this.fileService.cargarArchivo(this.id_tramite, this.arch_ine_propBase64, 4);
    let arch_tituloBase64: boolean = await this.fileService.cargarArchivo(this.id_tramite, this.arch_tituloBase64, 5);
    let arch_avisoapBase64: boolean = await this.fileService.cargarArchivo(this.id_tramite, this.arch_avisoapBase64, 6);
    let arch_estatutoBase64: boolean = await this.fileService.cargarArchivo(this.id_tramite, this.arch_estatutoBase64, 13);


    if (arch_ine_usBase64 === false || arch_ine_propBase64 === false || arch_tituloBase64 === false || arch_avisoapBase64 === false || arch_estatutoBase64 === false) {
      return;
    }

    this.services
      .HttpPost(
        tramiteUpdate,
        this.modelo_configuracion.serviciosOperaciones +
        "/ActualizarTramitePasoCuatro/Post"
      )
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.response = tempdate.response[0];
            if (this.response.proceso_existoso)
              this.returnPage(this.response.mensaje, false, 5);
            else
              this.openMensajes(
                this.response.mensaje,
                true
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

  setIsLoadingArchivo(is_loading: boolean): void {
    this.operacionRespuesta.EstaEjecutando = is_loading;
  }

  setSentArch(file: SentFile): void {
    switch (file.tipo) {
      case 3:
        this.arch_ine_us = file.sent;
        this.arch_ine_usBase64 = file.sent ? file.base64 : null;
        break;
      case 4:
        this.arch_ine_prop = file.sent;
        this.arch_ine_propBase64 = file.sent ? file.base64 : null;
        break;
      case 5:
        this.arch_titulo = file.sent;
        this.arch_tituloBase64 = file.sent ? file.base64 : null;
        break;
      case 6:
        this.arch_avisoap = file.sent;
        this.arch_avisoapBase64 = file.sent ? file.base64 : null;
        break;
      case 13:
        this.arch_estatuto = file.sent;
        this.arch_estatutoBase64 = file.sent ? file.base64 : null;
        break;
    }
  }
  //#region Validaciones
  obtenerErroresSuperficie() {
    var campo = this.formGroup.get("s_superficie");
    if (campo.hasError("required")) return "El campo es requerido";
    if (campo.hasError("min")) return "El valor no es válido";
  }
  obtenerErroresMedidas() {
    var campo = this.formGroup.get("s_medidas");
    if (campo.hasError("required")) return "El campo es requerido";
    if (campo.hasError("min")) return "El valor no es válido";
  }
  obtenerErroresColindancia1() {
    var campo = this.formGroup.get("s_colindancia_text_1");
    if (campo.hasError("required")) return "El campo es requerido";
    if (campo.hasError("minlength")) return "El texto es muy corto";
    if (campo.hasError("maxlength")) return "El texto es demasiado largo";
  }
  obtenerErroresColindancia2() {
    var campo = this.formGroup.get("s_colindancia_text_2");
    if (campo.hasError("required")) return "El campo es requerido";
    if (campo.hasError("minlength")) return "El texto es muy corto";
    if (campo.hasError("maxlength")) return "El texto es demasiado largo";
  }
  obtenerErroresColindancia3() {
    var campo = this.formGroup.get("s_colindancia_text_3");
    if (campo.hasError("required")) return "El campo es requerido";
    if (campo.hasError("minlength")) return "El texto es muy corto";
    if (campo.hasError("maxlength")) return "El texto es demasiado largo";
  }
  obtenerErroresColindancia4() {
    var campo = this.formGroup.get("s_colindancia_text_4");
    if (campo.hasError("required")) return "El campo es requerido";
    if (campo.hasError("minlength")) return "El texto es muy corto";
    if (campo.hasError("maxlength")) return "El texto es demasiado largo";
  }
  obtenerErroresColindanciaNum1() {
    var campo = this.formGroup.get("s_colindancia_num_1");
    if (campo.hasError("required")) return "El campo es requerido";
    if (campo.hasError("minlength")) return "El número es muy corto";
    if (campo.hasError("maxlength")) return "El número es demasiado largo";
  }
  obtenerErroresColindanciaNum2() {
    var campo = this.formGroup.get("s_colindancia_num_2");
    if (campo.hasError("required")) return "El campo es requerido";
    if (campo.hasError("minlength")) return "El número es muy corto";
    if (campo.hasError("maxlength")) return "El número es demasiado largo";
  }
  obtenerErroresColindanciaNum3() {
    var campo = this.formGroup.get("s_colindancia_num_3");
    if (campo.hasError("required")) return "El campo es requerido";
    if (campo.hasError("minlength")) return "El número es muy corto";
    if (campo.hasError("maxlength")) return "El número es demasiado largo";
  }
  obtenerErroresColindanciaNum4() {
    var campo = this.formGroup.get("s_colindancia_num_4");
    if (campo.hasError("required")) return "El campo es requerido";
    if (campo.hasError("minlength")) return "El número es muy corto";
    if (campo.hasError("maxlength")) return "El número es demasiado largo";
  }
  obtenerErroresEstatuto() {
    var campo = this.formGroup.get("s_ine_estatuto_file");
    if (campo.hasError("required")) return "El campo es requerido";
    if (campo.hasError("minlength")) return "El texto es muy corto";
    if (campo.hasError("maxlength")) return "El texto es demasiado largo";
  }
  obtenerErroresAvisoAP() {
    var campo = this.formGroup.get("s_aviso_apertura");
    if (campo.hasError("required")) return "El campo es requerido";
    if (campo.hasError("min")) return "El campo es requerido";
    if (campo.hasError("maxlength")) return "El texto es demasiado largo";
  }
  obtenerErroresColindanciaUsos() {
    var campo = this.formGroup.get("s_colindancia_usos");
    if (campo.hasError("required")) return "El campo es requerido";
  }
  //#endregion

  //#region Mensajes
  openMensajes(Mensaje: string, Error: boolean) {
    this.modalrefMsg = this.modalService.open(ModuloModalMensajeComponent, {
      ariaLabelledBy: "modal-basic-title",
    });
    this.modalrefMsg.componentInstance.mensajesError = [];
    this.modalrefMsg.componentInstance.mensajesExito = [];
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
