import { formatDate } from "@angular/common";
import { Component, OnInit, ViewChild } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { NgbModalRef, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { min } from "rxjs/operators";
import { AuthGuard } from "src/app/guards/AuthGuard";
import { AuthIdentity } from "src/app/guards/AuthIdentity";
import { ActualizarCotejoRequest } from "src/app/model/Operaciones/Cotejo/Cotejo";
import { RespuestaGenerica } from "src/app/model/Operaciones/generales/RespuestaGenerica";
import { ServiciosRutas } from "src/app/model/Operaciones/generales/ServiciosRutas";
import { SentFile } from "src/app/model/Utilities/File";
import { route } from "src/app/model/Utilities/route";
import { TramiteRoutes } from "src/app/model/Utilities/tramiteRoutes";
import { ServiceGenerico } from "src/app/services/service-generico.service";
import { ModuloModalMensajeComponent } from "src/app/shared/modulo-modal-mensaje/modulo-modal-mensaje.component";
import { ModuloPaginacionComponent } from "src/app/shared/modulo-paginacion/modulo-paginacion.component";

@Component({
  selector: "app-modulo-cotejo-documentacion",
  templateUrl: "./modulo-cotejo-documentacion.component.html",
  styleUrls: ["./modulo-cotejo-documentacion.component.css"],
  providers: [ServiceGenerico],
})
export class ModuloCotejoDocumentacionComponent implements OnInit {
  routes: route[];
  request: any;
  response: any;
  listaEstatus = [];
  listaHorarios = [];

  showControls: boolean = false;
  isDictaminador: boolean = false;
  Valido: boolean = false;
  Presencial: boolean = false;
  id_tramite: number;
  us_id: number;
  titulo: string;

  operacionRespuesta: RespuestaGenerica;
  modelo_configuracion: ServiciosRutas;

  formGroup: FormGroup;

  modalrefMsg: NgbModalRef;

  @ViewChild(ModuloPaginacionComponent, { static: true })
  routescmp: ModuloPaginacionComponent;
  public date: string;
  public tab7: boolean;
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
    this.us_id = AuthIdentity.ObtenerUsuarioRegistro();
    this.isDictaminador = AuthIdentity.IsDictaminador();
    this.routes = TramiteRoutes.GetRoutesByRol(7);
    this.tab7 = false;
    this.id_tramite = Number(localStorage.getItem("id_tramite")!)
    this.formGroup = this.fb.group({
      s_id: [this.id_tramite, { validators: [Validators.required] }],
      s_estatus: [0, { validators: [Validators.min(1)] }],
      s_comentarios: [],
      s_fecha: [],
      s_direccion: [],
      s_horario: [],
      s_horario2: [],
      s_tipo_cotejo: [],

    });
    await this.cargarModalidades();
    // this.cargarHorarios();
    await this.obtenerCotejo();
    this.limitaFecha();
  }

  onChange(id: number) {
    if (id == 0) this.showControls = false;
    else this.showControls = true;

    if (id == 14) {
      // this.formGroup.get("s_direccion").setValidators([
      //   Validators.required
      // ]);
      // this.formGroup.get("s_direccion").updateValueAndValidity();
      this.formGroup.get("s_comentarios").clearValidators();
      // this.formGroup.get("s_direccion").updateValueAndValidity();
      this.formGroup.get("s_comentarios").reset();
      this.Valido = true;
      this.Presencial = true;
    } else if (id == 15) {
      this.formGroup.get("s_comentarios").setValidators([
        Validators.required
      ]);
      // this.formGroup.get("s_direccion").reset();

      this.formGroup.get("s_comentarios").updateValueAndValidity();
      // this.formGroup.get("s_direccion").clearValidators();
      // this.formGroup.get("s_direccion").updateValueAndValidity();

      this.Valido = false;
    }

  }
  returnPage(message: string, error: boolean = true, page: number = 1) {
    this.openMensajes(message, error);

    let instance = this;
    if (page != 0) {
      setTimeout(function () {
        instance.routescmp.returnSpecificPage(page);
      }, 3000);
    } else {
      setTimeout(function () {
        //instance.router.navigate(['/atencion/registro']);
        instance.router.navigate(['/registros-tramite-dictaminador']);

      }, 3000);
    }
  }

  async OnSubmit() {
    await this.ActualizarCotejo();
  }
  private async cargarModalidades() {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services.HttpGet(`${this.modelo_configuracion.serviciosCatalogos}/ConsultaListaCatalogosEstatus/Get?TipoLista=7`).subscribe(
      (response: any) => {
        this.operacionRespuesta.EstaEjecutando = false;
        this.listaEstatus = response.response;
      },
      (error) => {
        this.operacionRespuesta.EstaEjecutando = false;
        this.operacionRespuesta.EsMsjError = false;
      });
  }

  private cargarHorarios(fecha: any): void {
    this.operacionRespuesta.EstaEjecutando = true;

    this.services.HttpGet(this.modelo_configuracion.serviciosOperaciones + '/ConsultaHorariosBloqueo/Get?id_usuario_dictaminador=' + this.us_id + '&fecha_cotejo_inicio=' + fecha + ' 07:00:00&fecha_cotejo_fin=' + fecha + ' 23:59:59').subscribe(
      (response: any) => {
        this.operacionRespuesta.EstaEjecutando = false;
        this.listaHorarios = response.response;
      },
      (error) => {
        this.operacionRespuesta.EstaEjecutando = false;
        this.operacionRespuesta.EsMsjError = false;
      });
  }

  async obtenerCotejo() {
    this.operacionRespuesta.EstaEjecutando = true;
    await this.services
      .HttpGet(
        this.modelo_configuracion.serviciosOperaciones +
        "/ConsultaDetalleCotejo/Get?cotejo_tipo=7&&c_id=" +
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
              if (this.response.s_estatus < 14) {
                this.response.s_estatus = 0;
              } else if (this.response.s_estatus == 14) {
                this.response.s_estatus = 14;
              } else if (this.response.s_estatus == 15) {
                this.response.s_estatus = 15;
              } else {
                if (this.response.s_cumple == true) {
                  this.response.s_estatus = 14;
                } else {
                  this.response.s_estatus = 15;
                }
              }
              // console.log(this.response)

              if (this.response.s_horario == null) {
                this.response.s_horario = "";
              }
              this.formGroup.patchValue(this.response);
              this.onChange(this.response.s_estatus);
              if (this.response.s_fecha != undefined || this.response.s_fecha != null) {
                this.formGroup.get('s_fecha').patchValue(formatDate(this.response.s_fecha, 'yyyy-MM-dd', 'en'));
              }
              if (this.response.s_fecha != undefined || this.response.s_fecha != null) {
                this.formGroup.get('s_horario').setValue(formatDate(this.response.s_fecha, 'HH:mm', 'en'));
                this.formGroup.get('s_horario2').setValue(formatDate(this.response.s_fecha, 'HH:mm', 'en'));
                this.tab7 = true;
              }
            }
          } else {
            this.routescmp.returnSpecificPage(7);
          }
          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.operacionRespuesta.EstaEjecutando = false;
          this.returnPage("Hubo un error al obtener la información", true, 0);
        }
      );
  }
  obtenerErroresEstatus() {
    var campo = this.formGroup.get("s_estatus");
    if (campo.hasError("min")) return "El campo es requerido";
  }
  obtenerErroresComentarios() {
    var campo = this.formGroup.get("s_comentarios");
    if (campo.hasError("required")) return "El campo es requerido";
  }
  obtenerErroresFecha() {
    var campo = this.formGroup.get("s_fecha");
    if (campo.hasError("required")) return "El campo es requerido";
  }
  obtenerErroresDireccion() {
    var campo = this.formGroup.get("s_direccion");
    if (campo.hasError("required")) return "El campo es requerido";
  }
  obtenerErroresHorario() {
    var campo = this.formGroup.get("s_horario");
    if (campo.hasError("required")) return "El campo es requerido";
  }
  async ActualizarCotejo() {
    let cotejoUpdate = new ActualizarCotejoRequest();
    cotejoUpdate = this.formGroup.value;
    cotejoUpdate.s_us_id = this.us_id;
    cotejoUpdate.cotejo_tipo = 7;
    if (cotejoUpdate.s_estatus == 14) {
      cotejoUpdate.s_direccion = "Londres No. 102, Piso 4, Colonia Juárez, Alcaldía Cuauhtémoc, Ciudad de México. C.P. 06600.";
    }
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
                // instance.router.navigate(['/atencion/registro']);
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
    titulo: string = "Carga de Información"
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

  limitaFecha() {
    var fecha = new Date();
    var anio = fecha.getFullYear();
    var _dia = fecha.getDate();
    var _mes = fecha.getMonth();//viene con valores de 0 al 11
    _mes = _mes + 1;//ahora lo tienes de 1 al 12
    var mes;
    var dia;
    if (_mes < 10) {
      mes = "0" + _mes;
    } else {
      mes = _mes;
    }
    if (_dia < 10) {
      dia = "0" + _dia;
    } else {
      dia = _dia;
    }
    this.date = anio + '-' + mes + '-' + dia;
  }
  #endregion
}
