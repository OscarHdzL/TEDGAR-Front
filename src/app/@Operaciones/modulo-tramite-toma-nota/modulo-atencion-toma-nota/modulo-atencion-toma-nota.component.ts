import { formatDate } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { ListaAnexos } from 'src/app/model/Operaciones/anexos/Anexos';
import { ModuloVisorPdfComponent } from 'src/app/shared/modulo-visor-pdf/modulo-visor-pdf.component';
import { ThemeConstants } from '../../../@espire/shared/config/theme-constant';
import { AuthIdentity } from '../../../guards/AuthIdentity';
import { ConsultaListaCatalogoTSolRegResponse } from '../../../model/Catalogos/CatalogosTSolReg';
import { ActualizarCotejoRequest } from '../../../model/Operaciones/Cotejo/Cotejo';
import { RespuestaGenerica } from '../../../model/Operaciones/generales/RespuestaGenerica';
import { ServiciosRutas } from '../../../model/Operaciones/generales/ServiciosRutas';
import { ActualizarDomicilioLRequest, ActualizarRepresentateLegalTNRequest, ActualizarRepresentateLegalTN_Request, ActualizarRepresentateTNRequest, ConsultaDetalleTomaNotaResponse, ConsultaListaMovimientosTNotaResponse, EditarDetalleTomaNotaRequest, EditarMovEstatutosDenominacion, FinalizarTomaNota, InsertarDomicilioRequest, InsertarTomaNotaApoderadoLegalRequest, routeTN } from '../../../model/Operaciones/TomaNota/TomaNota';
import { LecturaDomicilioRequest } from '../../../model/Operaciones/Tramite/Domicilio';
import { ServiceGenerico } from '../../../services/service-generico.service';
import { ModuloModalMensajeComponent } from '../../../shared/modulo-modal-mensaje/modulo-modal-mensaje.component';
import { ModuloSolicitudMovimientosRelacionMiembrosComponent } from '../modulo-solicitud-movimientos-relacion-miembros/modulo-solicitud-movimientos-relacion-miembros.component';

@Component({
    selector: 'app-modulo-atencion-toma-nota',
    templateUrl: './modulo-atencion-toma-nota.component.html',
    styleUrls: ['./modulo-atencion-toma-nota.component.css'],
    providers: [ServiceGenerico]
})
/** modulo-atencion-toma-nota component*/
export class ModuloAtencionTomaNotaComponent implements OnInit{

  //#region formGroup
  formGroup: FormGroup;
  formGroupInicio: FormGroup;
  formGroupEstatutos: FormGroup;
  formGroupDenominacion: FormGroup;
  formGroupMiembros: FormGroup;
  formGroupRepresentante: FormGroup;
  formGroupApoderado: FormGroup;
  formGroupCotejo: FormGroup;

  formGroupRevInformacion: FormGroup;
  formGroupCotDocumentacion: FormGroup;
  formGroupTNRealizada: FormGroup;
  formGroupTNConcluir: FormGroup;

  //#endregion

  //#region any
  catalogoEditar: any;
  response: any;
  request: any;
  respuesta: any;
  //#endregion

  //#region Array
  listaSolicitudEscrito = [];
  listaModalidad = [];
  listatipomovimiento = [];
  listapoderes = [];
  listrepresentante = [];
  listtipo = [];
  listaMovimientos = [];

  categoriaSelectedArray = [];
  routes: routeTN[] = [];


  listaEstatus = [];
  listaHorarios = [];
  public listaAnexos: Array<ListaAnexos> = [];

  //#endregion

  //#region boolean
  escritosolicitud: boolean = false;
  estatutosolicitud: boolean = false;
  certificadoregistro: boolean = false;
  estatutosnuevasolicitud: boolean = false;
  escriturapublica: boolean = false;
  altaapoderadodoc: boolean = false;
  bajaapoderadodoc: boolean = false;
  cambioapoderadodoc: boolean = false;

  bnd_apoderado: number = 0;

  Representante_p_ine_exists: boolean = false;
  Representante_p_acta_exists: boolean = false;
  Representante_p_curp_exists: boolean = false;

  showPagination: boolean = false;
  showCotejoBoton: boolean = false;

  doc1: boolean = false;


  showControls: boolean = false;
  Valido: boolean = false;
  Presencial: boolean = false;

  //#region Seleccion Movimientos
  check1 = false;
  check2 = false;
  check3 = false;
  check4 = false;
  check5 = false;
  check6 = false;
  check7 = false;

  inicio = true;
  movEstatutos = false;
  movDenominacion = false;
  movMiembros = false;
  movRepresentante = false;
  movApoderado = false;
  movDomicilio1 = false;
  movDomicilio2 = false;

  EditDictaminador: boolean;


  MovRevInformacion = false;
  MovCotDocumentacion = false;
  MovTNRealizada = false;
  MovTNConcluir = false;
  //#endregion

  //#endregion

  //#region string
  tokenTramite: string;
  //#endregion

  //#region number
  us_id: number;
  status:number;
  us_id_dictam: number
  tomanota: number;
  tomantram: number;

  Representante_r_id: number;

  //#endregion

  //#region Modelos
  ModelDTO: LecturaDomicilioRequest = new LecturaDomicilioRequest();

  ModelDTONotificaciones: LecturaDomicilioRequest = new LecturaDomicilioRequest();


  operacionRespuesta: RespuestaGenerica;
  modelo_configuracion: ServiciosRutas;
  //#endregion

  //#region DataTable
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  public date: string;

  //#endregion

  //#region Modal
  modalrefMsg: NgbModalRef;
  modalrefEdicion: NgbModalRef;
  //#endregion

  isDictaminador: boolean;

  /** modulo-solicitud-toma-nota ctor */
  constructor(private services: ServiceGenerico,
              private _route: ActivatedRoute,
              private fb: FormBuilder,
              private modalService: NgbModal,
              private themeConstants: ThemeConstants,
              private router: Router) {
    this.operacionRespuesta = new RespuestaGenerica();
    this.modelo_configuracion = new ServiciosRutas();
    this.tokenTramite = this._route.snapshot.paramMap.get('id');
  }

  async ngOnInit() {
    this.us_id_dictam = AuthIdentity.ObtenerUsuarioRegistro();
    this.isDictaminador = AuthIdentity.IsDictaminador();
    /*this.inicializaTabla();*/
    /*this.obtenerRepresentantes();*/

    this.obtenerTipoMovimiento();
    this.obtenerPoderes();
    this.obtenerSolEscrito();
    this.cargarModalidades();

    this.cargarHorarios();

    this.InicializarMov_Denominacion();
    this.InicializarMov_Estatutos();
    this.InicializarPrincipal();
    this.InicializarMov_DomicilioL();
    this.InicializarMov_Representante();
    this.InicializarMov_Apoderado();
    this.Inicializar_Cotejo();

    this.Inicializar_RevInformacion();
    this.Inicializar_CotDocumentacion();
    this.Inicializar_TNRealizada();
    this.Inicializar_TNConcluir();
    this.limitaFecha();
    await this.obtenerDataPrincipal();
    await this.obtenerMovimientosTNota();
  }

  //#region FormGroup Formularios
  InicializarPrincipal() {
    this.formGroupInicio = this.fb.group({
      c_numero_sgar: [
        ""
      ],
      c_denominacion: [
        ""
      ],
      c_id_tsol_escrito: [
        ""
      ]
    });
  }

  InicializarMov_Estatutos() {
    this.formGroupEstatutos = this.fb.group({
      c_comentario: [
        "",
      ],
      //mov_estatutos_modalidad: [
      //  "",
      //  {
      //    validators: [Validators.required],
      //  }
      //]

    });
  }

  InicializarMov_Denominacion() {
    this.formGroupDenominacion = this.fb.group({
      c_denominacion: [
        "",
      ],
      c_comentario_n: [
        "",
      ],
      //mov_denominacion_modalidad: [
      //  "",
      //  {
      //    validators: [Validators.required],
      //  }
      //]

    });
  }

  InicializarMov_DomicilioL() {
    this.formGroup = this.fb.group({
      d_id_domicilio: [0],
      d_tipo_domicilio: [0],
      d_cpostal: [
        "",
      ],
      d_endidad: [""],
      d_colonia: [
        "",
      ],
      d_ciudad: [""],
      d_calle: [
        "",
      ],
      d_numeroi: [
        "",
      ],
      d_numeroe: [""],
    });
  }

  InicializarMov_Representante() {
    this.formGroupRepresentante = this.fb.group({
      s_id: ["", ],
      p_id: [0, ],
      c_id_tipo_movimiento: [
        "",
      ],
      c_id_poder: [
        "",
      ],
      p_nombre: [
        "",
      ],
      p_apaterno: [
        "",
      ],
      p_amaterno: [
        "",
      ],
      p_cargo: [
        "",
      ],
      c_organo_g: [
        "",
      ],
      t_rep_legal: [
        false,
      ],
      t_rep_asociado: [
        false,
      ],
      t_ministro_culto: [
        false,
      ],
      t_organo_gob: [
        false,
      ],

    });
  }

  InicializarMov_Apoderado() {
    this.formGroupApoderado = this.fb.group({
      s_id: ["",],
      p_id: [0,],
      c_id_tipo_movimiento: [
        "",
      ],
      c_id_poder: [
        "",
      ],
      p_nombre: [
        "",
      ],
      p_apaterno: [
        "",
      ],
      p_amaterno: [
        "",
      ],
      p_nacionalidad: [
        "",
      ],
      p_edad: [
        "",
      ],

    });
  }

  Inicializar_Cotejo(){
    this.formGroupCotejo = this.fb.group({
      c_cotejo: [
        "",
      ],
    });
  }

  Inicializar_RevInformacion() {
    this.formGroupRevInformacion = this.fb.group({
      s_id: [
        this.tokenTramite,
        {
          validators: [Validators.required],
        },
      ],
      s_estatus: [
        0,
        {
          validators: [Validators.min(1)],
        },
      ],
      s_comentarios: [],
      s_fecha: [],
      s_direccion: [],
      s_horario: [],
      s_tipo_cotejo: [],

    });
  }

  Inicializar_CotDocumentacion() {
    this.formGroupCotDocumentacion = this.fb.group({
      s_id: [
        this.tokenTramite,
        {
          validators: [Validators.required],
        },
      ],
      s_estatus: [
        0,
        {
          validators: [Validators.min(1)],
        },
      ],
      s_comentarios: [],
    });
  }

  Inicializar_TNRealizada() {
    this.formGroupTNRealizada = this.fb.group({
      s_id: [
        this.tokenTramite,
        {
          validators: [Validators.required],
        },
      ],
      s_estatus: [
        0,
        {
          validators: [Validators.min(1)],
        },
      ],
      s_comentarios: [],
      s_numero_registro: [],
      s_noficio_entrada: [],
      s_noficio_salida: [],
    });
  }

  Inicializar_TNConcluir() {
    this.formGroupTNConcluir = this.fb.group({
      s_id: [
        this.tokenTramite,
        {
          validators: [Validators.required],
        },
      ],
      s_estatus: [
        0,
        {
          validators: [Validators.min(1)],
        },
      ],
      s_comentarios: [],
    });
  }

  //#endregion

  //#region Capturar Errores Formularios

  //#region Errores Estatutos
  obtenerErroresEstatutosComentarios() {
    var campo = this.formGroupEstatutos.get("c_comentario");
    if (campo.hasError("required")) return "El campo es requerido";
  }
  //#endregion

  //#region Errores Denominacion
  obtenerErroresDenominacionNueva() {
    var campo = this.formGroupDenominacion.get("c_denominacion");
    if (campo.hasError("required")) return "El campo es requerido";
    if (campo.hasError("pattern")) return "No se permite el uso de \"comilla\",por favor verifique verifique";
  }
  obtenerErroresDenominacionComentarios() {
    var campo = this.formGroupDenominacion.get("c_comentario_n");
    if (campo.hasError("required")) return "El campo es requerido";
  }
  //#endregion

  //#region Errores Representante Legal
  obtenerErroresNombreRepre() {
    var campo = this.formGroupRepresentante.get("p_nombre");
    if (campo.hasError("required")) return "El campo es requerido";
    if (campo.hasError("min")) return "El texto es muy corto";
    if (campo.hasError("maxlength")) return "El texto es demasiado largo";
  }
  obtenerErroresPaternoRepre() {
    var campo = this.formGroupRepresentante.get("p_apaterno");
    if (campo.hasError("required")) return "El campo es requerido";
    if (campo.hasError("min")) return "El texto es muy corto";
    if (campo.hasError("maxlength")) return "El texto es demasiado largo";
  }
  obtenerErroresMaternoRepre() {
    var campo = this.formGroupRepresentante.get("p_amaterno");
    if (campo.hasError("required")) return "El campo es requerido";
    if (campo.hasError("min")) return "El texto es muy corto";
    if (campo.hasError("maxlength")) return "El texto es demasiado largo";
  }
  obtenerErroresTipoMovimiento() {
    var campo = this.formGroupRepresentante.get("c_id_tipo_movimiento");
    if (campo.hasError("required")) return "El campo es requerido";
  }
  obtenerErroresPoder() {
    var campo = this.formGroupRepresentante.get("c_id_poder");
    if (campo.hasError("required")) return "El campo es requerido";
  }
  //#endregion

  //#region Errores Apoderado
  obtenerErroresNombreApoderado() {
    var campo = this.formGroupApoderado.get("p_nombre");
    if (campo.hasError("required")) return "El campo es requerido";
    if (campo.hasError("min")) return "El texto es muy corto";
    if (campo.hasError("maxlength")) return "El texto es demasiado largo";
  }
  obtenerErroresPaternoApoderado() {
    var campo = this.formGroupApoderado.get("p_apaterno");
    if (campo.hasError("required")) return "El campo es requerido";
    if (campo.hasError("min")) return "El texto es muy corto";
    if (campo.hasError("maxlength")) return "El texto es demasiado largo";
  }
  obtenerErroresMaternoApoderado() {
    var campo = this.formGroupApoderado.get("p_amaterno");
    if (campo.hasError("required")) return "El campo es requerido";
    if (campo.hasError("min")) return "El texto es muy corto";
    if (campo.hasError("maxlength")) return "El texto es demasiado largo";
  }
  obtenerErroresTipoMovimientoApoderado() {
    var campo = this.formGroupApoderado.get("c_id_tipo_movimiento");
    if (campo.hasError("required")) return "El campo es requerido";
  }
  obtenerErroresPoderApoderado() {
    var campo = this.formGroupApoderado.get("c_id_poder");
    if (campo.hasError("required")) return "El campo es requerido";
  }
  obtenerErroresNacionalidadApoderado() {
    var campo = this.formGroupApoderado.get("p_nacionalidad");
    if (campo.hasError("required")) return "El campo es requerido";
  }
  obtenerErroresEdadApoderado() {
    var campo = this.formGroupApoderado.get("p_edad");
    if (campo.hasError("required")) return "El campo es requerido";
    if (campo.hasError("min")) return "El valor ingresado no es válido";
  }
  //#endregion

  //#region Errores Cotejo
  obtenerErroresCotejo() {
    var campo = this.formGroupCotejo.get("c_cotejo");
    if (campo.hasError("required")) return "El campo es requerido";
  }
  //#endregion

  //#region Errores Revisar Información
  obtenerErroresEstatus() {
    var campo = this.formGroupRevInformacion.get("s_estatus");
    if (campo.hasError("min")) return "El campo es requerido";
  }
  obtenerErroresComentarios() {
    var campo = this.formGroupRevInformacion.get("s_comentarios");
    //if (campo.hasError("required")) return "El campo es requerido";
  }
  obtenerErroresFecha() {
    var campo = this.formGroupRevInformacion.get("s_fecha");
    if (campo.hasError("required")) return "El campo es requerido";
  }
  obtenerErroresDireccion() {
    var campo = this.formGroupRevInformacion.get("s_direccion");
    if (campo.hasError("required")) return "El campo es requerido";
  }
  obtenerErroresHorario() {
    var campo = this.formGroupRevInformacion.get("s_horario");
    if (campo.hasError("required")) return "El campo es requerido";
  }
  //#endregion

  //#region Errores Cotejo Documentación
  obtenerErroresEstatusCotDocumentacion() {
    var campo = this.formGroupCotDocumentacion.get("s_estatus");
    if (campo.hasError("min")) return "El campo es requerido";
  }
  obtenerErroresComentariosCotDocumentacion() {
    var campo = this.formGroupCotDocumentacion.get("s_comentarios");
    if (campo.hasError("required")) return "El campo es requerido";
  }
  //#endregion

  //#region Errores Toma Nota Realizada
  obtenerErroresEstatusTNRealizada() {
    var campo = this.formGroupTNRealizada.get("s_estatus");
    if (campo.hasError("min")) return "El campo es requerido";
  }
  obtenerErroresComentariosTNRealizada() {
    var campo = this.formGroupTNRealizada.get("s_comentarios");
    if (campo.hasError("required")) return "El campo es requerido";
  }
  //#endregion

  //#region Errores Toma Nota Concluir
  obtenerErroresEstatusTNConcluir() {
    var campo = this.formGroupTNConcluir.get("s_estatus");
    if (campo.hasError("min")) return "El campo es requerido";
  }
  obtenerErroresComentariosTNConcluir() {
    var campo = this.formGroupTNConcluir.get("s_comentarios");
    if (campo.hasError("required")) return "El campo es requerido";
  }
  //#endregion

  //#endregion

  //#region Obtener Catalogos
  obtenerRepresentantes() {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpGet(
        this.modelo_configuracion.serviciosOperaciones +
        "/ConsultaDetalleTomaNotaRepresentantes/Get?i_id_c=" +
        this.tokenTramite
      ).subscribe(
        (tempdate) => {
          if (tempdate) {
            this.listrepresentante = [] = tempdate.response;
            //this.renderTabla();
          } else {
            this.listrepresentante = [];
            this.renderTabla();
          }
          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.operacionRespuesta.EstaEjecutando = false;
        }
      );
  }

  async obtenerMovimientosTNota() {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .getAsync(
        this.modelo_configuracion.serviciosCatalogos +
        "/ConsultaDetalleMovimientosTomaNota/Get?i_id_c=" +
        this.tokenTramite
      ).then( (tempdate) => {
          this.listaMovimientos = [];
          if (tempdate) {
            this.listaMovimientos = tempdate.response as ConsultaListaMovimientosTNotaResponse[];
            this.routes.push({ id: 1, text: 'Inicio', active: true });
            var text = "";
            var index = 2;
            for (var i = 0; i < this.listaMovimientos.length; i++) {
              if (this.listaMovimientos[i].s_cat_mov == 1) {
                text = "Estatutos";
              } else if (this.listaMovimientos[i].s_cat_mov == 2) {
                text = "Denominacion";
              } else if (this.listaMovimientos[i].s_cat_mov == 3) {
                text = "Miembros";
              } else if (this.listaMovimientos[i].s_cat_mov == 4) {
                text = "Representante";
              } else if (this.listaMovimientos[i].s_cat_mov == 5) {
                text = "Apoderado";
              } else if (this.listaMovimientos[i].s_cat_mov == 6) {
                text = "DomicilioLegal";
              } else if (this.listaMovimientos[i].s_cat_mov == 7) {
                text = "DomicilioNotificacion";
              }

              this.routes.push({ id: index, text: text, active: false });
              index++;
            }

            const asignador = AuthIdentity.IsAsignadorTN();

            if(!asignador && (this.status !== 27 && this.status !== 28)){
              this.routes.push({ id: index, text: 'RevisionInformacion', active: false });
              this.routes.push({ id: (index + 1), text: 'CotejoDocumentacion', active: false });
              this.routes.push({ id: (index + 2), text: 'TNRealizada', active: false });
              this.routes.push({ id: (index + 3), text: 'TNConcluir', active: false });
            }

          } else {
            this.listaMovimientos = [];
            this.routes.push({ id: 1, text: 'Inicio', active: true });
          }
          this.operacionRespuesta.EstaEjecutando = false;
        },async (err) => {
          this.operacionRespuesta.EstaEjecutando = false;
        }
      );
  }

  obtenerSolEscrito() {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpGet(
        this.modelo_configuracion.serviciosCatalogos +
        "/ConsultaListaCatalogosTSolEscrito/Get?Activos=" +
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

  private cargarModalidades(): void {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services.HttpGet(`${this.modelo_configuracion.serviciosCatalogos}/ConsultaListaCatalogosCotejo/Get?Activos=${true}`).subscribe(
      (response: any) => {
        this.operacionRespuesta.EstaEjecutando = false;
        this.listaModalidad = response.response;
      },
      (error) => {
        this.operacionRespuesta.EstaEjecutando = false;
        this.operacionRespuesta.EsMsjError = false;
      });
  }

  private estatusTN(id: number): void {
    this.listaEstatus = [];
    this.operacionRespuesta.EstaEjecutando = true;
    this.services.HttpGet(`${this.modelo_configuracion.serviciosCatalogos}/ConsultaListaCatalogosEstatusTomaNota/Get?TipoLista=`+id).subscribe(
      (response: any) => {
        this.operacionRespuesta.EstaEjecutando = false;
        this.listaEstatus = response.response;


      },
      (error) => {
        this.operacionRespuesta.EstaEjecutando = false;
        this.operacionRespuesta.EsMsjError = false;
      });
  }

  obtenerTipoMovimiento() {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpGet(
        this.modelo_configuracion.serviciosCatalogos +
        "/ConsultaListaCatalogosTMovimientos/Get?Activos=" +
        true
      )
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.listatipomovimiento = [] =
              tempdate.response as ConsultaListaCatalogoTSolRegResponse[];
          } else {
            this.listatipomovimiento = [];
          }
          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.operacionRespuesta.EstaEjecutando = false;
        }
      );
  }

  obtenerPoderes() {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpGet(
        this.modelo_configuracion.serviciosCatalogos +
        "/ConsultaListaCatalogosPoderes/Get?Activos=" +
        true
      )
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.listapoderes = [] =
              tempdate.response as ConsultaListaCatalogoTSolRegResponse[];
          } else {
            this.listapoderes = [];
          }
          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.operacionRespuesta.EstaEjecutando = false;
        }
      );
  }

  private cargarHorarios(): void {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services.HttpGet(`${this.modelo_configuracion.serviciosCatalogos}/ConsultaListaHorarios/Get`).subscribe(
      (response: any) => {
        this.operacionRespuesta.EstaEjecutando = false;
        this.listaHorarios = response.response;
      },
      (error) => {
        this.operacionRespuesta.EstaEjecutando = false;
        this.operacionRespuesta.EsMsjError = false;
      });
  }


  obtenerCotejoInformacion(id: number, movimiento: string) {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpGet(
        this.modelo_configuracion.serviciosOperaciones +
        "/ConsultaDetalleCotejoTomaNota/Get?cotejo_tipo=" + id +"&&c_id=" +
        this.tokenTramite +
        "&&s_id_us=" +
        this.us_id_dictam
      )
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.response = tempdate.response[0];

            if (this.response) {
              if (id == 9) {
                if (this.response.s_estatus <= 21) {
                  this.response.s_estatus = 0;
                } else if (this.response.s_estatus == 22) {
                  this.response.s_estatus = 22;
                } else if (this.response.s_estatus == 23) {
                  this.response.s_estatus = 23;
                } else {
                  if (this.response.s_cumple == true) {
                    this.response.s_estatus = 22;
                  } else {
                    this.response.s_estatus = 23;
                  }
                }
                if (this.response.s_horario == null) {
                  this.response.s_horario = "";
                }
                this.formGroupRevInformacion.patchValue(this.response);

                this.onChange(this.response.s_estatus);
                if (this.response.s_fecha != undefined || this.response.s_fecha != null) {
                  this.formGroupRevInformacion.get('s_fecha').patchValue(formatDate(this.response.s_fecha, 'yyyy-MM-dd', 'en'));
                }
                if (this.response.s_fecha != undefined || this.response.s_fecha != null) {
                  this.formGroupRevInformacion.get('s_horario').patchValue(formatDate(this.response.s_fecha, 'HH:mm', 'en'));
                }
              }

              if (id == 10) {
                if (this.response.s_cumple == null  && this.response.s_estatus != 22 && this.response.s_estatus != 23) {
                  this.ShowClickPage('RevisionInformacion');
                } else {
                if (this.response.s_estatus < 24) {
                  this.response.s_estatus = 0;
                } else if (this.response.s_estatus == 24) {
                  this.response.s_estatus = 24;
                } else if (this.response.s_estatus == 25) {
                  this.response.s_estatus = 25;
                } else {
                  if (this.response.s_cumple == true) {
                    this.response.s_estatus = 24;
                  } else {
                    this.response.s_estatus = 25;
                  }
                }
                this.formGroupCotDocumentacion.patchValue(this.response);
              }
            }

              if (id == 11) {
                if (this.response.s_cumple == null && this.response.s_estatus != 24 && this.response.s_estatus != 40) {
                  this.ShowClickPage('CotejoDocumentacion');
                } else {
                if (this.response.s_estatus < 25) {
                  this.response.s_estatus = 0;
                } else if (this.response.s_estatus == 26) {
                  this.response.s_estatus = 26;
                } else if (this.response.s_estatus == 40) {
                  this.response.s_estatus = 40;
                } else {
                  if (this.response.s_cumple == true) {
                    this.response.s_estatus = 26;
                  } else {
                    this.response.s_estatus = 40;
                  }
                }
                this.doc1 = this.response.s_doc1;
                this.formGroupTNRealizada.patchValue(this.response);
              }
            }

              if (id == 12) {
                if (this.response.s_cumple == null && this.response.s_estatus != 25 && this.response.s_estatus != 26) {
                  this.ShowClickPage('TNRealizada');
                } else {
                if (this.response.s_estatus < 27) {
                  this.response.s_estatus = 0;
                } else if (this.response.s_estatus == 27) {
                  this.response.s_estatus = 27;
                } else if (this.response.s_estatus == 28) {
                  this.response.s_estatus = 28;
                } else {
                  if (this.response.s_cumple == true) {
                    this.response.s_estatus = 27;
                  } else {
                    this.response.s_estatus = 28;
                  }
                }
                this.formGroupTNConcluir.patchValue(this.response);
              }
            }
          }
          } else {
            /*this.routescmp.returnSpecificPage(8);*/
            //this.ShowClickPage(movimiento);

          }
          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.operacionRespuesta.EstaEjecutando = false;
          this.openMensajes("Hubo un error al obtener la información", true);
        }
      );
  }

  //#endregion

  //#region Cargar Información Movimientos

  //#region Principal
  async obtenerDataPrincipal() {
    this.operacionRespuesta.EstaEjecutando = true;
    await this.services.getAsync(
        this.modelo_configuracion.serviciosOperaciones +
        "/ConsultaDetalleAtenderTomaNota/Get?i_id_c=" + this.tokenTramite
      )
      .then(
        (tempdate) => {
          if (tempdate) {
            this.response =
              tempdate.response[0] as ConsultaDetalleTomaNotaResponse;
            if (this.response) {
              let modelRequest = new EditarDetalleTomaNotaRequest();
              modelRequest.c_tramite = this.response.c_tramite;
              modelRequest.c_id_tsol_escrito = this.response.c_id_tsol_escrito;
              modelRequest.c_denominacion = this.response.c_denominacion;
              modelRequest.c_numero_sgar = this.response.c_numero_sgar;
              this.tomanota = this.response.c_toma_nota;
              this.tomantram = this.response.c_trtn;
              this.escritosolicitud = this.response.c_existe_escrito_solicitud;
              this.estatutosolicitud = this.response.c_existe_estatuto_solicitud;
              this.certificadoregistro = this.response.c_existe_certificado_reg_solicitud;
              this.estatutosnuevasolicitud = this.response.c_existe_ejemplar_est_solicitud;
              this.escriturapublica = this.response.c_escritura_publica;
              this.altaapoderadodoc = this.response.c_alta_apoderado_doc;
              this.bajaapoderadodoc = this.response.c_baja_apoderado_doc;
              this.cambioapoderadodoc = this.response.c_cambio_apoderado_doc;
              this.us_id = this.response.c_us;
              this.status = this.response.status;
              this.EditDictaminador = this.status == 27 || this.status == 28 ? true:false;

              this.formGroupInicio.patchValue(modelRequest);

              let modelRequestEst = new EditarDetalleTomaNotaRequest();
              modelRequestEst.c_comentario = this.response.c_coment_est;
              this.formGroupEstatutos.patchValue(modelRequestEst);

              let modelRequestDen = new EditarDetalleTomaNotaRequest();
              modelRequestDen.c_denominacion = this.response.c_n_denom;

              modelRequestDen.c_comentario_n = this.response.c_coment_n_denom;
              this.formGroupDenominacion.patchValue(modelRequestDen);

              let modelRequestCot = new EditarDetalleTomaNotaRequest();
              modelRequestCot.c_cotejo = this.response.c_cotejo;
              this.formGroupCotejo.patchValue(modelRequestCot);

              /*this.obtenerDomicilioLegal();*/
              this.consultarAnexos(this.tomanota);

            }
          } else {
            this.response = [];
          }
          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.operacionRespuesta.EstaEjecutando = false;
        }
      );
  }
  //#endregion

  //#region Domicilios
  obtenerDomicilioLegal() {
    this.operacionRespuesta.EstaEjecutando = true;
    this.ModelDTO = new LecturaDomicilioRequest();
    this.services
      .HttpGet(
        this.modelo_configuracion.serviciosOperaciones +
        "/ConsultaDetalleTomaNotaDomicilioLegal/Get?i_id_c=" +
        this.tokenTramite + '&&s_id_us=' + this.us_id + '&&c_id_trtn=' + this.tomantram + '&&c_tipo_domicilio=1'
      )
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.response = tempdate.response[0];
            if (this.response) {
              let modelRequest = new LecturaDomicilioRequest();
              modelRequest.d_id_domicilio = this.response.d_id_domicilio;
              modelRequest.d_numeroe = this.response.d_numeroe;
              modelRequest.d_numeroi = this.response.d_numeroi;
              modelRequest.d_colonia = this.response.d_colonia;
              modelRequest.d_calle = this.response.d_calle;
              modelRequest.d_cpostal = this.response.c_cpostal_n;
              this.ModelDTO = modelRequest;
              this.formGroup.patchValue(modelRequest);
            }
          } else {

            this.operacionRespuesta.EstaEjecutando = false;
            this.response = [];
          }
          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {

          this.operacionRespuesta.EstaEjecutando = false;
        }
      );
  }

  obtenerDomicilioNotificaciones() {
    this.operacionRespuesta.EstaEjecutando = true;
    this.ModelDTONotificaciones = new LecturaDomicilioRequest();
    this.services
      .HttpGet(
        this.modelo_configuracion.serviciosOperaciones +
        "/ConsultaDetalleTomaNotaDomicilioLegal/Get?i_id_c=" +
        this.tokenTramite + '&&s_id_us=' + this.us_id + '&&c_id_trtn=' + this.tomantram + '&&c_tipo_domicilio=2'
      )
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.response = tempdate.response[0];
            if (this.response) {
              let modelRequest = new LecturaDomicilioRequest();
              modelRequest.d_id_domicilio = this.response.d_id_domicilio;
              modelRequest.d_numeroe = this.response.d_numeroe;
              modelRequest.d_numeroi = this.response.d_numeroi;
              modelRequest.d_colonia = this.response.d_colonia;
              modelRequest.d_calle = this.response.d_calle;
              modelRequest.d_cpostal = this.response.c_cpostal_n;
              this.ModelDTONotificaciones = modelRequest;
              this.formGroup.patchValue(modelRequest);
            }
          } else {

            this.operacionRespuesta.EstaEjecutando = false;
            this.response = [];
          }
          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {

          this.operacionRespuesta.EstaEjecutando = false;
        }
      );
  }
  //#endregion

  //#region Representante Legal
  obtenerRepresentanteLegal() {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpGet(
        this.modelo_configuracion.serviciosOperaciones +
        "/ConsultaDetalleTomaNotaRepresentanteLegal/Get?i_id_c=" + this.tokenTramite
      )
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.response =
              tempdate.response[0]
            if (this.response) {
              let modelRequest = new ActualizarRepresentateLegalTN_Request();
              modelRequest.s_id = this.response.s_id;
              modelRequest.p_id = this.response.p_id;
              modelRequest.p_nombre = this.response.p_nombre;
              modelRequest.p_apaterno = this.response.p_apaterno;
              modelRequest.p_amaterno = this.response.p_amaterno;

              modelRequest.c_id_poder = this.response.c_poder;
              modelRequest.c_id_tipo_movimiento = this.response.c_tipo_movimiento;

              modelRequest.t_rep_legal = this.response.t_rep_legal;
              modelRequest.t_rep_asociado = this.response.t_rep_asociado;
              modelRequest.t_ministro_culto = this.response.t_ministro_culto;
              modelRequest.t_organo_gob = this.response.t_organo_gob;
              modelRequest.p_cargo = this.response.p_cargo;
              modelRequest.c_organo_g = this.response.c_organo_g;
              this.Representante_r_id = this.response.r_id;
              this.Representante_p_acta_exists = this.response.p_acta_exists;
              this.Representante_p_ine_exists = this.response.p_ine_exists;
              this.Representante_p_curp_exists = this.response.p_curp_exists;


              this.formGroupRepresentante.patchValue(modelRequest);
            }
          } else {
            this.response = [];
          }
          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.operacionRespuesta.EstaEjecutando = false;
        }
      );
  }
  //#endregion

  //#region Apoderado Legal
  obtenerApoderado() {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpGet(
        this.modelo_configuracion.serviciosOperaciones +
        "/ConsultaDetalleTomaNotaApoderado/Get?i_id_c=" + this.tokenTramite
      )
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.response =
              tempdate.response[0]
            if (this.response) {
              let modelRequest = new InsertarTomaNotaApoderadoLegalRequest();
              modelRequest.s_id = this.response.s_id;
              modelRequest.p_id = this.response.p_id;
              modelRequest.p_nombre = this.response.p_nombre;
              modelRequest.p_apaterno = this.response.p_apaterno;
              modelRequest.p_amaterno = this.response.p_amaterno;

              modelRequest.c_id_tipo_movimiento = this.response.c_tipo_movimiento;
              modelRequest.c_id_poder = this.response.c_poder;
              modelRequest.p_nacionalidad = this.response.c_nacionalidad;
              modelRequest.p_edad = this.response.c_edad;
              this.ChangeDocto(modelRequest.c_id_tipo_movimiento);
              this.formGroupApoderado.patchValue(modelRequest);
              this.obtenerDataPrincipal();
            }
          } else {
            this.response = [];
          }
          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.operacionRespuesta.EstaEjecutando = false;
        }
      );
  }
  //#endregion

  //#endregion

  //#region Guardar Info

  //#region Submit

  OnSubmitRevInformacion() {
    this.ActualizarCotejoRevInformacion();
  }

  OnSubmitCotDocumentacion() {
    this.ActualizarCotejoCotDocumentacion();
  }

  OnSubmitTNRealizada() {
    this.ActualizarCotejoTNRealizada();
  }

  OnSubmitTNConcluir() {
    this.ActualizarCotejoTNConcluir();
  }

  //#endregion

  //#region Metodos

  ActualizarCotejoRevInformacion() {
    let cotejoUpdate = new ActualizarCotejoRequest();
    cotejoUpdate = this.formGroupRevInformacion.value;
    cotejoUpdate.s_us_id = this.us_id_dictam;
    cotejoUpdate.cotejo_tipo = 9;
    if (cotejoUpdate.s_estatus == 22) {
      cotejoUpdate.s_direccion = "Londres No. 102, Piso 4, Colonia Juárez, Alcaldía Cuauhtémoc, Ciudad de México. C.P. 06600.";
    }
    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpPost(
        cotejoUpdate,
        this.modelo_configuracion.serviciosOperaciones +
        "/ActualizarAtenderCotejoTomaNota/Post"
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
               // instance.router.navigate(['/atencion/toma-nota']);
                instance.router.navigate(['/registros-tnota-dictaminador']);

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

  ActualizarCotejoCotDocumentacion() {
    let cotejoUpdate = new ActualizarCotejoRequest();
    cotejoUpdate = this.formGroupCotDocumentacion.value;
    cotejoUpdate.s_us_id = this.us_id_dictam;
    cotejoUpdate.cotejo_tipo = 10;
    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpPost(
        cotejoUpdate,
        this.modelo_configuracion.serviciosOperaciones +
        "/ActualizarAtenderCotejoTomaNota/Post"
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
               // instance.router.navigate(['/atencion/toma-nota']);
                instance.router.navigate(['/registros-tnota-dictaminador']);

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

  ActualizarCotejoTNRealizada() {
    let cotejoUpdate = new ActualizarCotejoRequest();
    cotejoUpdate = this.formGroupTNRealizada.value;
    cotejoUpdate.s_us_id = this.us_id_dictam;
    cotejoUpdate.cotejo_tipo = 11;
    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpPost(
        cotejoUpdate,
        this.modelo_configuracion.serviciosOperaciones +
        "/ActualizarAtenderCotejoTomaNota/Post"
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
               // instance.router.navigate(['/atencion/toma-nota']);
                instance.router.navigate(['/registros-tnota-dictaminador']);

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

  ActualizarCotejoTNConcluir() {
    let cotejoUpdate = new ActualizarCotejoRequest();
    cotejoUpdate = this.formGroupTNConcluir.value;
    cotejoUpdate.s_us_id = this.us_id_dictam;
    cotejoUpdate.cotejo_tipo = 12;
    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpPost(
        cotejoUpdate,
        this.modelo_configuracion.serviciosOperaciones +
        "/ActualizarAtenderCotejoTomaNota/Post"
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
               // instance.router.navigate(['/atencion/toma-nota']);
                instance.router.navigate(['/registros-tnota-dictaminador']);

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

  onChange(id: number) {
    if (id == 0) this.showControls = false;
    else this.showControls = true;

    if (id == 22) {
      // this.formGroupRevInformacion.get("s_direccion").setValidators([
      //   Validators.required
      // ]);
      // this.formGroupRevInformacion.get("s_direccion").updateValueAndValidity();
      this.formGroupRevInformacion.get("s_comentarios").clearValidators();
      // this.formGroupRevInformacion.get("s_direccion").updateValueAndValidity();
      this.formGroupRevInformacion.get("s_comentarios").reset();
      this.Valido = true;
      this.Presencial = true;
    } else if (id == 23) {
      /*this.formGroupRevInformacion.get("s_comentarios").setValidators([
        Validators.required
      ]);*/ //SE ELIMINA COMENTARIOS OBLIGATORIOS
      // this.formGroupRevInformacion.get("s_direccion").reset();

      this.formGroupRevInformacion.get("s_comentarios").updateValueAndValidity();
      // this.formGroupRevInformacion.get("s_direccion").clearValidators();
      // this.formGroupRevInformacion.get("s_direccion").updateValueAndValidity();

      this.Valido = false;
    }

  }



  //#endregion

  //#endregion

  //#region Modal


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

  openMensajesFin(Mensaje: string, Error: boolean, finalizado: boolean = false, titulo: string = "Carga de Información") {
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
        instance.router.navigate(["tomanota"]);
      }, () => {
        instance.router.navigate(["tomanota"]);
      });
    }
  }
  //#endregion

  //#region Datatable Metodos
  inicializaTabla() {
    this.dtOptions = this.themeConstants.dtOptions;
    this.dtOptions.search = false;
    this.dtOptions.searching = false;
    this.dtOptions.info = false;
    this.dtOptions.ordering = false;
    this.dtOptions.lengthChange = false;
    this.dtTrigger = new Subject();
  }

  renderTabla() {
    if ("dtInstance" in this.dtElement) {
      this.dtElement.dtInstance.then((instancia: DataTables.Api) => {
        instancia.destroy();
        this.dtTrigger.next();
      });
    } else {
      this.dtTrigger.next();
    }
  }
  //#endregion

  //#region CheckMovimientos




  //#endregion

  ShowClickPage(text) {

    this.inicio = false;
    this.movEstatutos = false;
    this.movRepresentante = false;
    this.movDomicilio2 = false;
    this.movDenominacion = false;
    this.movApoderado = false;
    this.movMiembros = false;
    this.movDomicilio1 = false;
    this.MovRevInformacion = false;
    this.MovCotDocumentacion = false;
    this.MovTNRealizada = false;
    this.MovTNConcluir = false;

    var indexAnterior = this.routes.findIndex(x => x.active == true);
    var index = this.routes.findIndex(x => x.text == text);

    var lastindex = (this.routes.length - 1);

    if (!this.inicio) {
      this.showPagination = true;
      this.routes[indexAnterior].active = false;
      this.routes[index].active = true;
      //if (lastindex == index) {
      //  this.showCotejoBoton = true;
      //} else {
      //  this.showCotejoBoton = false;
      //}
       if (index == 1) {
        this.showCotejoBoton = true;
      } else {
        this.showCotejoBoton = false;
      }
    }

    if (text == 'Inicio') { this.obtenerDataPrincipal(); this.inicio = true; } else
    if (text == 'Estatutos') { this.obtenerDataPrincipal(); this.movEstatutos = true; } else
    if (text == 'Denominacion') { this.obtenerDataPrincipal(); this.movDenominacion = true; } else
    if (text == 'Miembros') { this.inicializaTabla(); this.obtenerRepresentantes(); this.movMiembros = true } else
    if (text == 'Representante') { this.obtenerRepresentanteLegal(); this.movRepresentante = true } else
    if (text == 'Apoderado') { this.obtenerApoderado(); this.movApoderado = true } else
    if (text == 'DomicilioLegal') { this.obtenerDomicilioLegal(); this.movDomicilio1 = true } else
    if (text == 'DomicilioNotificacion') { this.obtenerDomicilioNotificaciones(); this.movDomicilio2 = true }
    if (text == 'RevisionInformacion') { this.estatusTN(9); this.obtenerCotejoInformacion(9,'CotejoDocumentacion');this.MovRevInformacion = true }
    if (text == 'CotejoDocumentacion') { this.estatusTN(10); this.obtenerCotejoInformacion(10,'TNRealizada');this.MovCotDocumentacion = true }
    if (text == 'TNRealizada') { this.estatusTN(11); this.obtenerCotejoInformacion(11,'TNConcluir');this.MovTNRealizada = true }
    if (text == 'TNConcluir') { this.estatusTN(12); this.obtenerCotejoInformacion(12,'Inicio');this.MovTNConcluir = true }

  }


  //#endregion


  //#region Otros

  patchDomicilio(model: InsertarDomicilioRequest) {
    this.formGroup.patchValue(model);
  }

  getRoles(rep: any) {
    var roles = "";
    if (rep.t_rep_legal) roles += "Representante Legal, ";
    if (rep.t_rep_asociado) roles += "Asociado, ";
    if (rep.t_ministro_culto) roles += "Ministro de Culto, ";
    if (rep.t_organo_gob) roles += "Órgano de Gobierno, ";

    if (roles.length > 0) roles = roles.substring(0, roles.length - 2);

    return roles;
  }

  setIsLoadingArchivo(is_loading: boolean): void {
    this.operacionRespuesta.EstaEjecutando = is_loading;
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
    this.date = anio+'-'+mes+'-'+dia;
     }
  //#endregion
  ChangeDocto(id) {
    this.bnd_apoderado = id;
  }


  async consultarAnexos(tnota: any){
    const params = {
      id_toma_nota: tnota,
      id_tramite: 26
    }
    await this.services.postAsync(params, this.modelo_configuracion.serviciosOperaciones + "/AnexosAsunto/ConsultarListaAnexo")
    .then((response: any) => {
         this.listaAnexos  = response.response;
      },async (error) => {
        this.listaAnexos = []
      });
  }

  detalle(archivo: any) {
    this.setIsLoading(true);

    const params = {
      id_anexo: archivo.id_anexo,
      url_anexo: archivo.url_anexo
    }
    // Realizamos una petición para obtener el documento y lo mostramos en la modal.
    this.services
      .HttpPost(params, this.modelo_configuracion.serviciosOperaciones + "/AnexosAsunto/ConsultarDetalleAnexo").subscribe(
        (response: any) => {
          if (response) {
            const modalRef = this.modalService.open(ModuloVisorPdfComponent, {
              size: "lg",
            });
            modalRef.componentInstance.src = response.response[0].base64_anexo;
            this.setIsLoading(false);
            return;
          }

          this.openMensajes("No se encontró el documento.", true);
          this.setIsLoading(false);
        },
        (error) => {
          this.openMensajes("No se encontró el documento.", true);
          this.setIsLoading(false);
        }
      );
  }
  setIsLoading(isLoading: boolean) {
    // this.is_loading.emit(isLoading);
  }

  regresarInicio() {
    if (this.isDictaminador) {
      this.router.navigate(['/registros-tnota-dictaminador']);
    } else {
      this.router.navigate(['asignacion/toma-nota']);
    }

  }
}
