import { Component, OnInit, ViewChild } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { NgbModalRef, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { AuthGuard } from "src/app/guards/AuthGuard";
import { AuthIdentity } from "src/app/guards/AuthIdentity";
import { ActualizarCotejoRequest } from "src/app/model/Operaciones/Cotejo/Cotejo";
import { RespuestaGenerica } from "src/app/model/Operaciones/generales/RespuestaGenerica";
import { ServiciosRutas } from "src/app/model/Operaciones/generales/ServiciosRutas";
import { route } from "src/app/model/Utilities/route";
import { TramiteRoutes } from "src/app/model/Utilities/tramiteRoutes";
import { ServiceGenerico } from "src/app/services/service-generico.service";
import { ModuloModalMensajeComponent } from "src/app/shared/modulo-modal-mensaje/modulo-modal-mensaje.component";
import { ModuloPaginacionComponent } from "src/app/shared/modulo-paginacion/modulo-paginacion.component";

@Component({
  selector: "app-modulo-finalizacion-cotejo",
  templateUrl: "./modulo-finalizacion-cotejo.component.html",
  styleUrls: ["./modulo-finalizacion-cotejo.component.css"],
  providers: [ServiceGenerico],
})
export class ModuloFinalizacionCotejoComponent implements OnInit {
  routes: route[];
  request: any;
  response: any;
  listaEstatus = [];

  showControls: boolean = false;
  isDictaminador: boolean = false;
  Valido: boolean = false;
  cumple: boolean = false;
  doc1: boolean = false;
  doc2: boolean = false;
  id_tramite: number = Number(localStorage.getItem("id_tramite")!)
  us_id: number;
  titulo: string;

  operacionRespuesta: RespuestaGenerica;
  modelo_configuracion: ServiciosRutas;

  formGroup: FormGroup;

  modalrefMsg: NgbModalRef;

  @ViewChild(ModuloPaginacionComponent, { static: true })
  routescmp: ModuloPaginacionComponent;

  constructor(
    public modalService: NgbModal,
    private fb: FormBuilder,
    private auth: AuthGuard,
    private services: ServiceGenerico,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.operacionRespuesta = new RespuestaGenerica();
    this.modelo_configuracion = new ServiciosRutas();
    this.titulo = "Atención de solicitudes de registro";
  }

  async ngOnInit() {
    this.formGroup = this.fb.group({
      s_id: [this.id_tramite, Validators.required],
      s_estatus: [0, Validators.min(1)],
      s_comentarios: [null, Validators.required],
      s_numero_registro: [null],
    });
    this.cumple = true;
    this.us_id = AuthIdentity.ObtenerUsuarioRegistro();
    this.isDictaminador = AuthIdentity.IsDictaminador();
    await this.cargarModalidades();
    await this.obtenerCotejo();
    this.routes = TramiteRoutes.GetRoutesByRol(9);
  }

  onChange(id: number) {
    if (id == 0) this.showControls = false;
    else this.showControls = true;


    if (id == 39) {
      this.formGroup.get("s_numero_registro").clearValidators();
      this.Valido = false;

    } else if (id == 18) {
      this.formGroup.get("s_numero_registro").setValidators([
        Validators.required
      ]);

      this.formGroup.get("s_numero_registro").updateValueAndValidity();

      this.Valido = true;
    }

  }

  returnPage(message: string, error: boolean = true, page: number = 1) {
    this.openMensajes(message, error);

    let instance = this;
    setTimeout(function () {
      instance.routescmp.returnSpecificPage(page);
    }, 3500);
  }

  async OnSubmit() {
    let cotejoUpdate = new ActualizarCotejoRequest();
    let certificadoReg;
    let DictamenReg;
    if (cotejoUpdate.s_estatus == 18) {
      this.services
        .HttpGet(
          this.modelo_configuracion.serviciosOperaciones +
          "/ConsultaDetalleCotejo/Get?cotejo_tipo=9&&c_id=" +
          this.id_tramite + "&&s_id_us=" + this.us_id)
        .subscribe(
          (tempdate) => {
            if (tempdate) {
              this.response = tempdate.response[0];
              if (this.response) {
                certificadoReg = this.response.s_doc1;
                DictamenReg = this.response.s_doc2;
                if (certificadoReg == true && DictamenReg == true) {
                  this.ActualizarCotejo();
                } else {
                  this.openMensajes('Por favor, suba la documentación', true);
                }
              }
            }
          },
          async (err) => {
            this.returnPage("Hubo un error al obtener la información", true, 0);
          }
        );
    } else {
      await this.ActualizarCotejo();
    }
  }
  private async cargarModalidades() {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpGet(
        `${this.modelo_configuracion.serviciosCatalogos}/ConsultaListaCatalogosEstatus/Get?TipoLista=9`
      )
      .subscribe(
        (response: any) => {
          this.operacionRespuesta.EstaEjecutando = false;
          this.listaEstatus = response.response;
        },
        (error) => {
          this.operacionRespuesta.EstaEjecutando = false;
          this.operacionRespuesta.EsMsjError = false;
        }
      );
  }
  async obtenerCotejo() {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpGet(
        this.modelo_configuracion.serviciosOperaciones +
        "/ConsultaDetalleCotejo/Get?cotejo_tipo=9&&c_id=" +
        this.id_tramite +
        "&&s_id_us=" +
        this.us_id
      )
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.response = tempdate.response[0];

            if (this.response) {
              this.id_tramite = this.response.s_id;
              if (this.response.s_estatus == 39) {
                this.response.s_estatus = 39;
              } else if (this.response.s_estatus == 10) {
                this.routescmp.returnSpecificPage(8);
              }
              else if (this.response.s_estatus == 14) {
                this.routescmp.returnSpecificPage(8);
              } else if (this.response.s_estatus == 17) {
                this.response.s_estatus = 0;
                this.cumple = false;
              } else if (this.response.s_estatus < 17) {
                this.response.s_estatus = 0;
              }
              this.doc1 = this.response.s_doc1;
              this.doc2 = this.response.s_doc2;
              this.formGroup.patchValue(this.response);
              this.onChange(this.response.s_estatus);
            }
          } else {
            this.routescmp.returnSpecificPage(8);
          }
          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.operacionRespuesta.EstaEjecutando = false;
          this.returnPage("Hubo un error al obtener la información", true, 0);
        }
      );
  }
  obtenerErroresNumeroRegistro() {
    var campo = this.formGroup.get("s_numero_registro");
    if (campo.hasError("required")) return "El campo es requerido";
  }
  obtenerErroresEstatus() {
    var campo = this.formGroup.get("s_estatus");
    if (campo.hasError("min")) return "El campo es requerido";
  }
  obtenerErroresComentarios() {
    var campo = this.formGroup.get("s_comentarios");
    if (campo.hasError("required")) return "El campo es requerido";
  }

  async ActualizarCotejo() {
    let cotejoUpdate = new ActualizarCotejoRequest();
    cotejoUpdate = this.formGroup.value;
    cotejoUpdate.s_us_id = this.us_id;
    cotejoUpdate.cotejo_tipo = 9;
    // cotejoUpdate.s_numero_registro

    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpPost(
        cotejoUpdate,
        this.modelo_configuracion.serviciosOperaciones +
        "/ActualizarCotejo/Post"
      )
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.response = tempdate.response[0];
            this.openMensajes(
              this.response.mensaje,
              !this.response.proceso_existoso
            );
            if (this.response.proceso_existoso) {
              let instance = this;

              setTimeout(function () {
                // instance.router.navigate(["/atencion/registro"]);
                instance.router.navigate(['/registros-tramite-dictaminador']);

              }, 2000);
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

  //#region Mensajes
  openMensajes(
    Mensaje: string,
    Error: boolean,
    titulo: string = "Envío Notificación"
  ) {
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
  }
  //#endregion
}
