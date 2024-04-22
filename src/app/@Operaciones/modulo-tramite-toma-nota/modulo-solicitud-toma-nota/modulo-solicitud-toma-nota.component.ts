import { AfterContentInit, AfterViewInit, Component, ComponentFactoryResolver, OnInit, TemplateRef, ViewChild, ViewContainerRef, OnDestroy, ComponentFactory, ComponentRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import {Observable, ReplaySubject, Subject} from 'rxjs';
import {Anexos, docRep, ListaAnexos} from 'src/app/model/Operaciones/anexos/Anexos';
import { ModuloCargaArchivoMultipleComponent } from 'src/app/shared/modulo-carga-archivo-multiple/modulo-carga-archivo-multiple.component';
import { ModuloCargaArchivoComponent } from 'src/app/shared/modulo-carga-archivo/modulo-carga-archivo.component';
import { ModuloModalAdvertenciaComponent } from 'src/app/shared/modulo-modal-advertencia/modulo-modal-advertencia.component';
import { ModuloVisorPdfComponent } from 'src/app/shared/modulo-visor-pdf/modulo-visor-pdf.component';
import { ThemeConstants } from '../../../@espire/shared/config/theme-constant';
import { AuthIdentity } from '../../../guards/AuthIdentity';
import { ConsultaListaCatalogoTSolRegResponse } from '../../../model/Catalogos/CatalogosTSolReg';
import { RespuestaGenerica } from '../../../model/Operaciones/generales/RespuestaGenerica';
import { ServiciosRutas } from '../../../model/Operaciones/generales/ServiciosRutas';
import { ActualizarApoderadoLegalTNResponse, ActualizarDomicilioLRequest, ActualizarRepresentateLegalTNRequest, ActualizarRepresentateLegalTN_Request, ActualizarRepresentateTNRequest, ConsultaDetalleTomaNotaResponse, ConsultaListaMovimientosTNotaResponse, EditarComentario, EditarDetalleTomaNotaRequest, EditarMovEstatutosDenominacion, FinalizarTomaNota, InsertarDomicilioRequest, InsertarTomaNotaApoderadoLegalRequest, RequestParamMovimientos, listaMovimientos, routeTN } from '../../../model/Operaciones/TomaNota/TomaNota';
import { LecturaDomicilioRequest } from '../../../model/Operaciones/Tramite/Domicilio';
import { ServiceGenerico } from '../../../services/service-generico.service';
import { ModuloModalMensajeComponent } from '../../../shared/modulo-modal-mensaje/modulo-modal-mensaje.component';
import { ModuloSolicitudMovimientosRelacionMiembrosComponent } from '../modulo-solicitud-movimientos-relacion-miembros/modulo-solicitud-movimientos-relacion-miembros.component';
import * as _ from 'lodash';
import { TramiteTransmisionRequest } from 'src/app/model/Operaciones/Transmisiones/Transmision';
import { TableRowHeightAttributes } from 'docx';
import {SentFile} from '../../../model/Utilities/File';
import {FileService} from '../../../services/file.service';
import {resetTempProgramHandlerForTest} from '@angular/compiler-cli/src/transformers/program';

@Component({
  selector: 'app-modulo-solicitud-toma-nota',
  templateUrl: './modulo-solicitud-toma-nota.component.html',
  styleUrls: ['./modulo-solicitud-toma-nota.component.css'],
  providers: [ServiceGenerico]
})
/** modulo-solicitud-toma-nota component*/
// export class ModuloSolicitudTomaNotaComponent implements OnInit, AfterViewInit, OnDestroy {
export class ModuloSolicitudTomaNotaComponent implements OnInit {
  // componentRef: any;

  @ViewChild('contentEXito', { static: false }) ModalExito: TemplateRef<any>;
  // @ViewChild('container', { read: ViewContainerRef }) container: ViewContainerRef;

  // miFactory: ComponentFactory<any>;
  componentRef: ComponentRef<ModuloCargaArchivoMultipleComponent> = null; // se declara una variable referencia.
  // componentRef2: ComponentRef<ModuloCargaArchivoComponent> = null; // se declara una variable referencia.
  @ViewChild('componenteDinamico', { read: ViewContainerRef }) compDynamicContainer: ViewContainerRef;


  max_size: number;
  allowed_types: string[];
  listaMovimientos = [];



  // formGroup: any;
  // fb: any;
  //#region formGroup
  formGroup: FormGroup;
  formGroupInicio: FormGroup;
  formGroupEstatutos: FormGroup;
  formGroupDenominacion: FormGroup;
  formGroupMiembros: FormGroup;
  formGroupRepresentante: FormGroup;
  formGroupApoderado: FormGroup;
  formGroupCotejo: FormGroup;
  //#endregion

  //#region any
  catalogoEditar: any;
  response: any;
  request: any;
  respuesta: any;
  result: boolean;
  //#endregion

  //#region Array
  listaSolicitudEscrito = [];
  listaModalidad = [];
  listatipomovimiento = [];
  listapoderes = [];
  listrepresentante = [];

  listtipo = [];

  categoriaSelectedArray = [];
  routes: routeTN[] = [];
  //#endregion

  //#region boolean
  escritosolicitud = false;
  estatutosolicitud = false;
  certificadoregistro = false;
  estatutosnuevasolicitud = false;
  escriturapublica = false;
  altaapoderadodoc = false;
  bajaapoderadodoc = false;
  cambioapoderadodoc = false;

  bnd_apoderado = 0;
  id_bloqueo: number;
  bloqueoTN: boolean;

  Representante_p_ine_exists = false;
  Representante_ineBase64: string = null;
  Representante_p_acta_exists = false;
  Representante_actaBase64: string = null;
  Representante_p_curp_exists = false;
  Representante_curpBase64: string = null;

  showPagination = false;
  showCotejoBoton = false;

  state: boolean;

  //#region Seleccion Movimientos
  check1 = false;
  checkEstatutos = false;

  check2 = false;
  checkDenominacion = false;

  check3 = false;
  checkMiembros = false;

  check4 = false;
  checkRepresentante = false;

  check5 = false;
  checkApoderado = false;

  check6 = false;
  checkDomicilioLegal = false;

  check7 = false;
  checkDomicilioNotificacion = false;

  inicio = true;
  movEstatutos = false;
  movDenominacion = false;
  movMiembros = false;
  movRepresentante = false;
  movApoderado = false;
  movDomicilio1 = false;
  movDomicilio2 = false;

  isDictaminador = false;

  //#endregion

  //#endregion

  //#region string
  tokenTramite: string;
  esVistaPrevia = false;
  //#endregion

  //#region number
  us_id: number;
  id_tramite: number;
  tomanota: number = 0;
  tomantram: number;

  sizeRepresentantes: number;
  sizeRepresentanteLegal: number;
  sizeApoderado: number;
  domicilioLegal: number;
  domicilioNotificaciones: number;
  Representante_r_id: number;
  //#endregion

  estatutos: string;
  comen_deno: string;
  nSgar: string;
  denominacion: string;
  tipoSolicitudEscrito: number;

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
  //#endregion

  //#region Modal
  modalrefMsg: NgbModalRef;
  modalrefEdicion: NgbModalRef;
  modalrefAdvertencia: NgbModalRef;
  //#endregion
  public listaAnexos: Array<ListaAnexos> = [];
  public listaAnexosOtros: Array<ListaAnexos> = [];
  public listMovimientos: listaMovimientos;
  public listaArchivosModal: Anexos[] = [];
  public listaArchivosModalEstatutos: Anexos[] = [];
  public listaArchivosEscritura: Anexos[] = [];

  public RepresentanteInsert: boolean;
  invalidrol = true;
  hideparam = true;
  public bnd_c_numero_sgar = true;
  public bnd_c_denominacion = true;
  public doctosCompletos: boolean;
  public doctosCompletosEstatutos: boolean;
  public doctosCompletosDenominacion: boolean;
  public procedeFinalizar: boolean;
  mensajeNoProcede: string;
  txtTituloBoton = 'Subir documentos';
  public registroCompletosRepresentante: boolean;
  public doctosCompletosRepresentante: boolean;
  public registroCompletosApoderado: boolean;
  public doctosCompletosApoderado: boolean;
  public doctosPoderApoderado: boolean;

  public escritosolicitudBase64: string = null;
  public estatutosolicitudBase64: string = null;
  public certificadoregistroBase64: string = null;
  public estatutosnuevasolicitudBase64: string = null;
  public escriturapublicaBase64: string = null;
  public altaapoderadodocBase64: string = null;
  public bajaapoderadodocBase64: string = null;
  public cambioapoderadodocBase64: string = null;

  public idTramite_aux: number = 0;

  public listArchivosDelete = [];
  public listArchivos: docRep[] = [];

  get p_cargo() {
    return this.formGroupRepresentante.get('p_cargo');
  }
  get c_organo_g() {
    return this.formGroupRepresentante.get('c_organo_g');
  }

  contador = 0;

  //#region Movimientos Validaciones
  private movimientosControlCheckbox: RequestParamMovimientos;
  //#endregion

  /** modulo-solicitud-toma-nota ctor */
  constructor(private services: ServiceGenerico,
    private _route: ActivatedRoute,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private themeConstants: ThemeConstants,
    private router: Router,
    private resolver: ComponentFactoryResolver,
    public fileService: FileService) {
    this.operacionRespuesta = new RespuestaGenerica();
    this.modelo_configuracion = new ServiciosRutas();
    // this.tokenTramite = this._route.snapshot.paramMap.get('tramite');
  }



  async ngOnInit() {
    this.movimientosControlCheckbox = new RequestParamMovimientos(null, null);
    this.listMovimientos = new listaMovimientos;
    this.listMovimientos.estatutos = false;
    this.listMovimientos.apodLegal = false;
    this.listMovimientos.denominacion = false;
    this.listMovimientos.listAsociados = false;
    this.listMovimientos.repreLegal = false;
    this.listMovimientos.domicilioLegal = false;
    this.listMovimientos.domicilioNotificacion = false;
    this.max_size = 20971520;
    this.allowed_types = ['application/pdf'];
    this.id_tramite = parseInt(this._route.snapshot.paramMap.get('Id'));
    this.idTramite_aux = parseInt(this._route.snapshot.paramMap.get('Id'));
    this.us_id = AuthIdentity.ObtenerUsuarioRegistro();
    this.obtenerSolEscrito();
    this.inicializaTabla();
    this.obtenerTipoMovimiento();
    this.obtenerPoderes();
    this.cargarModalidades();
    this.InicializarMov_Denominacion();
    this.InicializarMov_Estatutos();
    this.InicializarPrincipal();
    this.InicializarMov_DomicilioL();
    this.InicializarMov_Representante();
    this.InicializarMov_Apoderado();
    this.Inicializar_Cotejo();
    await this.obtenerDataPrincipal();
    if (this.id_tramite == 0 || this.id_tramite == null) {
        this.id_tramite = parseInt(this._route.snapshot.paramMap.get('Id'));
    }



    if ((this._route.snapshot.routeConfig.path).includes('solicitudtomanotaconsulta')) {
      this.id_bloqueo = 1;
      this.isDictaminador = true;

    }
    this.bloqueoTN = this.id_bloqueo == 1 ? true : false;
    this.movimientosControlCheckbox.p_id_tramite = this.tomanota;
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }


  //#region FormGroup Formularios
  InicializarPrincipal() {
    this.formGroupInicio = this.fb.group({
      c_numero_sgar: [''],
      c_denominacion: [''],
      c_id_tsol_escrito: [0],
      comentario_tnota: ['']
    });
  }

  InicializarMov_Estatutos() {
    this.formGroupEstatutos = this.fb.group({
      c_comentario: [
        '',
        {
          validators: [Validators.required],
        },
      ],
      // mov_estatutos_modalidad: [
      //  "",
      //  {
      //    validators: [Validators.required],
      //  }
      // ]

    });
  }

  InicializarMov_Denominacion() {
    this.formGroupDenominacion = this.fb.group({
      c_denominacion: [
        '',
        {
          validators: [Validators.required],
        },
      ],
      c_comentario_n: [''],
      // mov_denominacion_modalidad: [
      //  "",
      //  {
      //    validators: [Validators.required],
      //  }
      // ]

    });
  }

  InicializarMov_DomicilioL() {
    this.formGroup = this.fb.group({
      d_id_domicilio: [0],
      d_tipo_domicilio: [0],
      d_cpostal: [
        '',
        {
          validators: [
            Validators.required,
            Validators.maxLength(5),
            Validators.maxLength(6),
          ],
        },
      ],
      d_endidad: [''],
      d_colonia: [
        '',
        {
          validators: [Validators.required],
        },
      ],
      d_ciudad: [''],
      d_calle: [
        '',
        {
          validators: [
            Validators.required,
            Validators.minLength(1),
            Validators.maxLength(250),
          ],
        },
      ],
      d_numeroi: [''],
      d_numeroe: [''],
    });
  }

  InicializarMov_Representante() {
    this.formGroupRepresentante = this.fb.group({
      s_id: ['',],
      p_id: [0,],
      c_id_tipo_movimiento: [
        '',
        {
          validators: [
            Validators.required,
          ],
        },
      ],
      c_id_poder: [
        '',
        {
          validators: [
            Validators.required,
          ],
        },
      ],
      p_nombre: [
        '',
        {
          validators: [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(50),
          ],
        },
      ],
      p_apaterno: [
        '',
        {
          validators: [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(50),
          ],
        },
      ],
      p_amaterno: [
        '',
        {
          validators: [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(50),
          ],
        },
      ],
      p_cargo: [
        '',
        {
          validators: [
          ],
        },
      ],
      c_organo_g: [
        '',
        {
          validators: [
          ],
        },
      ],
      t_rep_legal: [
        false,
        {
          validators: [],
        },
      ],
      t_rep_asociado: [
        false,
        {
          validators: [],
        },
      ],
      t_ministro_culto: [
        false,
        {
          validators: [],
        },
      ],
      t_organo_gob: [
        false,
        {
          validators: [],
        },
      ],

    });
    this.enableValidations();

  }

  enableValidations() {
    if (this.formGroupRepresentante.get('t_rep_legal').value || this.formGroupRepresentante.get('t_ministro_culto').value ||
      this.formGroupRepresentante.get('t_rep_asociado').value || this.formGroupRepresentante.get('t_organo_gob').value) {
      this.invalidrol = false;
    } else { this.invalidrol = true; }

    if (this.formGroupRepresentante.get('t_organo_gob').value) {
      this.p_cargo.setValidators([
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(60),
      ]);
      this.c_organo_g.setValidators([
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(60),
      ]);
      this.hideparam = false;
      this.formGroupRepresentante.get('c_organo_g').updateValueAndValidity();
      this.formGroupRepresentante.get('p_cargo').updateValueAndValidity();
    } else {
      this.hideparam = true;
      this.p_cargo.clearValidators();
      this.c_organo_g.clearValidators();
      this.formGroupRepresentante.get('c_organo_g').updateValueAndValidity();
      this.formGroupRepresentante.get('c_organo_g').reset();
      this.formGroupRepresentante.get('p_cargo').updateValueAndValidity();
      this.formGroupRepresentante.get('p_cargo').reset();
    }
  }
  obtenerErroresCargo() {
    const campo = this.formGroupRepresentante.get('p_cargo');
    if (campo.hasError('required')) { return 'El campo es requerido'; }
    if (campo.hasError('minlength')) { return 'El texto es muy corto'; }
    if (campo.hasError('maxlength')) { return 'El texto es demasiado largo'; }
  }
  obtenerErroresCargoG() {
    const campo = this.formGroupRepresentante.get('c_organo_g');
    if (campo.hasError('required')) { return 'El campo es requerido'; }
    if (campo.hasError('minlength')) { return 'El texto es muy corto'; }
    if (campo.hasError('maxlength')) { return 'El texto es demasiado largo'; }
  }
  getRequired(tipo: number): boolean {
    if (tipo === 1) {
      return this.formGroupRepresentante.get('p_cargo').hasValidator(Validators.required);
    } else { return this.formGroupRepresentante.get('c_organo_g').hasValidator(Validators.required); }
  }

  InicializarMov_Apoderado() {
    this.formGroupApoderado = this.fb.group({
      s_id: ['',],
      p_id: [0,],
      c_id_tipo_movimiento: [
        '',
        {
          validators: [
            Validators.required,
          ],
        },
      ],
      c_id_poder: [
        '',
        {
          validators: [
            Validators.required,
          ],
        },
      ],
      p_nombre: [
        '',
        {
          validators: [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(50),
          ],
        },
      ],
      p_apaterno: [
        '',
        {
          validators: [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(50),
          ],
        },
      ],
      p_amaterno: [
        '',
        {
          validators: [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(50),
          ],
        },
      ],
      p_nacionalidad: [
        '',
        {
          validators: [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(50),
          ],
        },
      ],
      p_edad: [
        '',
        {
          validators: [
            Validators.required,
            Validators.min(18)
          ],
        },
      ],

    });
  }

  Inicializar_Cotejo() {
    this.formGroupCotejo = this.fb.group({
      c_cotejo: [
        '',
        {
          validators: [
            Validators.required
          ],
        },
      ],
    });
  }
  //#endregion

  //#region Capturar Errores Formularios

  //#region Errores Estatutos
  obtenerErroresEstatutosComentarios() {
    const campo = this.formGroupEstatutos.get('c_comentario');
    if (campo.hasError('required')) { return 'El campo es requerido'; }
  }
  //#endregion

  //#region Errores Denominacion
  obtenerErroresDenominacionNueva() {
    const campo = this.formGroupDenominacion.get('c_denominacion');
    if (campo.hasError('required')) { return 'El campo es requerido'; }
    if (campo.hasError('pattern')) { return 'No se permite el uso de "comilla",por favor verifique verifique'; }
  }
  obtenerErroresDenominacionComentarios() {
    const campo = this.formGroupDenominacion.get('c_comentario_n');
    // if (campo.hasError("required")) return "El campo es requerido";
  }
  //#endregion

  //#region Errores Representante Legal
  obtenerErroresNombreRepre() {
    const campo = this.formGroupRepresentante.get('p_nombre');
    if (campo.hasError('required')) { return 'El campo es requerido'; }
    if (campo.hasError('min')) { return 'El texto es muy corto'; }
    if (campo.hasError('maxlength')) { return 'El texto es demasiado largo'; }
  }
  obtenerErroresPaternoRepre() {
    const campo = this.formGroupRepresentante.get('p_apaterno');
    if (campo.hasError('required')) { return 'El campo es requerido'; }
    if (campo.hasError('min')) { return 'El texto es muy corto'; }
    if (campo.hasError('maxlength')) { return 'El texto es demasiado largo'; }
  }
  obtenerErroresMaternoRepre() {
    const campo = this.formGroupRepresentante.get('p_amaterno');
    if (campo.hasError('required')) { return 'El campo es requerido'; }
    if (campo.hasError('min')) { return 'El texto es muy corto'; }
    if (campo.hasError('maxlength')) { return 'El texto es demasiado largo'; }
  }
  obtenerErroresTipoMovimiento() {
    const campo = this.formGroupRepresentante.get('c_id_tipo_movimiento');
    if (campo.hasError('required')) { return 'El campo es requerido'; }
  }
  obtenerErroresPoder() {
    const campo = this.formGroupRepresentante.get('c_id_poder');
    if (campo.hasError('required')) { return 'El campo es requerido'; }
  }
  //#endregion

  //#region Errores Apoderado
  obtenerErroresNombreApoderado() {
    const campo = this.formGroupApoderado.get('p_nombre');
    if (campo.hasError('required')) { return 'El campo es requerido'; }
    if (campo.hasError('min')) { return 'El texto es muy corto'; }
    if (campo.hasError('maxlength')) { return 'El texto es demasiado largo'; }
  }
  obtenerErroresPaternoApoderado() {
    const campo = this.formGroupApoderado.get('p_apaterno');
    if (campo.hasError('required')) { return 'El campo es requerido'; }
    if (campo.hasError('min')) { return 'El texto es muy corto'; }
    if (campo.hasError('maxlength')) { return 'El texto es demasiado largo'; }
  }
  obtenerErroresMaternoApoderado() {
    const campo = this.formGroupApoderado.get('p_amaterno');
    if (campo.hasError('required')) { return 'El campo es requerido'; }
    if (campo.hasError('min')) { return 'El texto es muy corto'; }
    if (campo.hasError('maxlength')) { return 'El texto es demasiado largo'; }
  }
  obtenerErroresTipoMovimientoApoderado() {
    const campo = this.formGroupApoderado.get('c_id_tipo_movimiento');
    if (campo.hasError('required')) { return 'El campo es requerido'; }
  }
  obtenerErroresPoderApoderado() {
    const campo = this.formGroupApoderado.get('c_id_poder');
    if (campo.hasError('required')) { return 'El campo es requerido'; }
  }
  obtenerErroresNacionalidadApoderado() {
    const campo = this.formGroupApoderado.get('p_nacionalidad');
    if (campo.hasError('required')) { return 'El campo es requerido'; }
  }
  obtenerErroresEdadApoderado() {
    const campo = this.formGroupApoderado.get('p_edad');
    if (campo.hasError('required')) { return 'El campo es requerido'; }
    if (campo.hasError('min')) { return 'El valor ingresado no es válido'; }
  }
  //#endregion

  //#region Errores Cotejo
  obtenerErroresCotejo() {
    const campo = this.formGroupCotejo.get('c_cotejo');
    if (campo.hasError('required')) { return 'El campo es requerido'; }
  }
  //#endregion

  //#endregion


  //#region Obtener Catalogos

  async obtenerRepresentantesBandera() {
    // this.operacionRespuesta.EstaEjecutando = true;
    await this.services.HttpGet(this.modelo_configuracion.serviciosOperaciones +
      '/ConsultaDetalleTomaNotaRepresentantes/Get?i_id_c=' +
      this.tomanota).toPromise().then(
        (tempdate) => {
          if (tempdate) {
            //this.check6 = true;
            this.listMovimientos.listAsociados = true;
          }
          this.operacionRespuesta.EstaEjecutando = false;
        });
  }

  async obtenerRepresentantes() {
    this.operacionRespuesta.EstaEjecutando = true;
    await this.services.getAsync(this.modelo_configuracion.serviciosOperaciones + '/ConsultaDetalleTomaNotaRepresentantes/Get?i_id_c=' + this.tomanota)
      .then(async (tempdate) => {
        if (tempdate) {
          this.listrepresentante = [] = tempdate.response;
          //this.check6 = true;
          this.listMovimientos.listAsociados = true;
          for (let x = 0; x <= this.listrepresentante.length - 1; x++) {
            if (this.listrepresentante[x].p_acta_exists == false || this.listrepresentante[x].p_curp_exists == false || this.listrepresentante[x].p_ine_exists == false) {
              this.doctosCompletos = false;
              if(this.listArchivos.length > 0) {
                this.doctosCompletos = true;
                let ine: boolean = await this.fileService.cargarArchivo(this.listrepresentante[x].r_id, this.listArchivos[x].ineBase64, 7);
                let acta: boolean = await this.fileService.cargarArchivo(this.listrepresentante[x].r_id, this.listArchivos[x].actaBase64, 8);
                let curp: boolean = await this.fileService.cargarArchivo(this.listrepresentante[x].r_id, this.listArchivos[x].curpBase64, 9);
              }
            } else {
              this.doctosCompletos = true;
            }
          }

          this.sizeRepresentantes = this.listrepresentante.length;
        } else {
          this.listrepresentante = [];
          //this.check6 = false;
          this.listMovimientos.listAsociados = false;
          this.sizeRepresentantes = 0;
        }

        this.operacionRespuesta.EstaEjecutando = false;
      }, async (err) => {
        this.operacionRespuesta.EstaEjecutando = false;
        //this.check6 = false;
      }
      );
  }

  async guardarDocRepresentantes() {
    for (let x = 0; x <= this.listrepresentante.length - 1; x++) {
      if (this.listrepresentante[x].p_acta_exists == null || this.listrepresentante[x].p_curp_exists == null || this.listrepresentante[x].p_ine_exists == null) {
        this.doctosCompletos = false;
        if(this.listArchivos[0].ineBase64 != null && this.listArchivos[0].actaBase64 != null && this.listArchivos[0].curpBase64 != null ) {
          this.doctosCompletos = true;
          let ine: boolean = await this.fileService.cargarArchivo(this.listrepresentante[x].r_id, this.listArchivos[x].ineBase64, 7);
          let acta: boolean = await this.fileService.cargarArchivo(this.listrepresentante[x].r_id, this.listArchivos[x].actaBase64, 8);
          let curp: boolean = await this.fileService.cargarArchivo(this.listrepresentante[x].r_id, this.listArchivos[x].curpBase64, 9);
        }
      } else {
        this.doctosCompletos = true;
      }
    }
  }

  async obtenerRepresentantesValido() {
    this.operacionRespuesta.EstaEjecutando = true;
    await this.services.HttpGet(this.modelo_configuracion.serviciosOperaciones +
      '/ConsultaDetalleTomaNotaRepresentantes/Get?i_id_c=' +
      this.tomanota).toPromise().then(
        (tempdate) => {
          if (tempdate) {
            this.listrepresentante = [] = tempdate.response;

            for (let x = 0; x <= this.listrepresentante.length - 1; x++) {
              if (this.listrepresentante[x].p_acta_exists == false || this.listrepresentante[x].p_curp_exists == false || this.listrepresentante[x].p_ine_exists == false) {
                this.doctosCompletos = false;
              } else {
                this.doctosCompletos = true;
              }
            }
          } else {
            this.listrepresentante = [];
          }
          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.operacionRespuesta.EstaEjecutando = false;
        }
      );
  }

  obtenerSolEscrito(): void {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services.HttpGet(this.modelo_configuracion.serviciosCatalogos + '/ConsultaListaCatalogosTSolEscrito/Get?Activos=' + true)
      .subscribe((tempdate) => {
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
      }, (error) => {
        this.operacionRespuesta.EstaEjecutando = false;
        this.operacionRespuesta.EsMsjError = false;
      });
  }

  obtenerTipoMovimiento(): void {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services.HttpGet(this.modelo_configuracion.serviciosCatalogos + '/ConsultaListaCatalogosTMovimientos/Get?Activos=' + true)
      .subscribe((tempdate) => {
        if (tempdate) {
          this.listatipomovimiento = [] =
            tempdate.response as ConsultaListaCatalogoTSolRegResponse[];
        } else {
          this.listatipomovimiento = [];
        }
        this.operacionRespuesta.EstaEjecutando = false;
      }, async (err) => {
        this.operacionRespuesta.EstaEjecutando = false;
      }
      );
  }

  obtenerPoderes(): void {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services.HttpGet(this.modelo_configuracion.serviciosCatalogos + '/ConsultaListaCatalogosPoderes/Get?Activos=' + true)
      .subscribe((tempdate) => {
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


  //#endregion

  //#region Cargar Información Movimientos

  //#region Principal
  async obtenerDataPrincipal() {
    this.operacionRespuesta.EstaEjecutando = true;
    await this.services.getAsync(this.modelo_configuracion.serviciosOperaciones + '/ConsultaDetalleTomaNota/Get?i_id_c=null&&s_id_us=' + this.us_id + '&&id_tramite=' + this.id_tramite)
      .then(async (tempdate) => {
        if (tempdate) {
          this.response = tempdate.response[0] as ConsultaDetalleTomaNotaResponse;
          if (this.response) {
            const modelRequest = new EditarDetalleTomaNotaRequest();
            modelRequest.c_tramite = this.response.c_tramite;
            modelRequest.c_id_tsol_escrito = this.response.c_id_tsol_escrito;
            if (this.response.c_id_tsol_escrito == null) {
              modelRequest.c_id_tsol_escrito = 0;
            }
            modelRequest.c_denominacion = this.response.c_denominacion;
            if (modelRequest.c_denominacion == '') {
              this.bnd_c_denominacion = false;
            }
            modelRequest.c_numero_sgar = this.response.c_numero_sgar;
            if (modelRequest.c_numero_sgar == '') {
              this.bnd_c_numero_sgar = false;
            }
            modelRequest.comentario_tnota = this.response.c_comentario_tnota;
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
            this.formGroupInicio.patchValue(modelRequest);

            const modelRequestEst = new EditarDetalleTomaNotaRequest();
            modelRequestEst.c_comentario = this.response.c_coment_est;
            this.formGroupEstatutos.patchValue(modelRequestEst);

            const modelRequestDen = new EditarDetalleTomaNotaRequest();
            modelRequestDen.c_denominacion = this.response.c_n_denom;

            modelRequestDen.c_comentario_n = this.response.c_coment_n_denom;
            this.formGroupDenominacion.patchValue(modelRequestDen);

            const modelRequestCot = new EditarDetalleTomaNotaRequest();
            modelRequestCot.c_cotejo = this.response.c_cotejo;
            this.formGroupCotejo.patchValue(modelRequestCot);

            await this.consultarAnexos(this.tomanota);
            this.check1 = modelRequestEst.c_comentario != '' ? true : false;
            this.check4 = modelRequestDen.c_denominacion != '' ? true : false;
            this.listMovimientos.estatutos = modelRequestEst.c_comentario != '' ? true : false;
            this.listMovimientos.denominacion = modelRequestDen.c_denominacion != '' ? true : false;
            await this.obtenerDomicilioLegal();
            await this.obtenerDomicilioNotificaciones();
            await this.obtenerRepresentanteLegal();
            await this.obtenerApoderado();
            await this.obtenerRepresentantesBandera();
            await this.obtenerRepresentantes();

            if (this.certificadoregistro == false || this.estatutosnuevasolicitud == false) {
              this.doctosCompletosDenominacion = false;
            } else {
              this.doctosCompletosDenominacion = true;
            }
          }

          this.id_tramite = tempdate.response[0].c_tramite;
          this.tomanota = tempdate.response[0].c_toma_nota;

          this.estatutos = tempdate.response[0].c_coment_est;
          this.comen_deno = tempdate.response[0].c_coment_n_denom;
          this.nSgar = tempdate.response[0].c_numero_sgar;
          this.denominacion = tempdate.response[0].c_denominacion;
          this.tipoSolicitudEscrito = tempdate.response[0].c_id_tsol_escrito;

          //#region CheckBox Seleccionados
          this.movimientosControlCheckbox.estatutos = this.check1;
          this.movimientosControlCheckbox.denominacion = this.check4;
          this.movimientosControlCheckbox.dom_notificaciones = this.check3;
          this.movimientosControlCheckbox.apoderado = this.check5;
          this.movimientosControlCheckbox.rep_legal = this.check2;
          this.movimientosControlCheckbox.dom_legal = this.check7;
          //#endregion

          setTimeout(() => {
            this.ejecutarLogicaVistaPrevia();
            this.inicializaTabla();
            this.renderTabla();
          }, 500);

        } else {
          this.response = [];
        }
        this.operacionRespuesta.EstaEjecutando = false;
      },
        async (err) => {
          this.operacionRespuesta.EstaEjecutando = false;
        });
  }

  async obtenerDataPrincipalEscritoSolicitudBandera() {
    this.operacionRespuesta.EstaEjecutando = true;
    await this.services
      .HttpGet(
        this.modelo_configuracion.serviciosOperaciones +
        '/ConsultaDetalleTomaNota/Get?i_id_c=null&&s_id_us=' + this.us_id
      )
      .toPromise().then(
        (tempdate) => {
          if (tempdate) {
            this.response =
              tempdate.response[0] as ConsultaDetalleTomaNotaResponse;
            if (this.response) {
              const modelRequest = new EditarDetalleTomaNotaRequest();
              this.escritosolicitud = this.response.c_existe_escrito_solicitud;
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

  async obtenerDataPrincipalDenominacion() {
    this.operacionRespuesta.EstaEjecutando = true;
    await this.services.getAsync(
      this.modelo_configuracion.serviciosOperaciones +
      '/ConsultaDetalleTomaNota/Get?i_id_c=null&&s_id_us=' + this.us_id + '&&id_tramite=' + this.id_tramite)
      .then((tempdate) => {

        if (tempdate) {
          this.response = tempdate.response[0] as ConsultaDetalleTomaNotaResponse;
          if (this.response) {
            const modelRequest = new EditarDetalleTomaNotaRequest();
            this.certificadoregistro = this.response.c_existe_certificado_reg_solicitud;
            this.estatutosnuevasolicitud = this.response.c_existe_ejemplar_est_solicitud;

            if (this.certificadoregistro == false || this.estatutosnuevasolicitud == false){
              if(this.certificadoregistroBase64 == null && this.estatutosnuevasolicitudBase64 == null) {
                this.doctosCompletosDenominacion = false;
              }
              else{
                this.doctosCompletosDenominacion = true;
              }
            } else {
                this.doctosCompletosDenominacion = true;
            }
          }
        } else {
          this.response = [];
        }
        this.operacionRespuesta.EstaEjecutando = false;
      }, async (err) => {
        this.operacionRespuesta.EstaEjecutando = false;
      }
      );
  }

  async consultarAnexosApoderado(tnota) {

    const params = {
      id_toma_nota: tnota,
      id_tramite: 21
    };
    await this.services
      .HttpPost(params, this.modelo_configuracion.serviciosOperaciones + '/AnexosAsunto/ConsultarListaAnexo').toPromise().then(
        (response: any) => {
          this.listaAnexos = response.response;

          if (this.listaAnexos.length == 0) {
            this.doctosCompletosApoderado = false;
          } else {
            this.doctosCompletosApoderado = true;
          }
        },
        (error) => {
          this.listaAnexos = [];
        });

  }

  async obtenerDataPrincipalApoderado() {
    this.operacionRespuesta.EstaEjecutando = true;
    await this.services
      .HttpGet(
        this.modelo_configuracion.serviciosOperaciones +
        '/ConsultaDetalleTomaNota/Get?i_id_c=null&&s_id_us=' + this.us_id + '&&id_tramite=' + this.id_tramite
      )
      .toPromise().then(
        async (tempdate) => {
          if (tempdate) {
            this.response =
              tempdate.response[0] as ConsultaDetalleTomaNotaResponse;
            if (this.response) {
              const modelRequest = new EditarDetalleTomaNotaRequest();
              this.altaapoderadodoc = this.response.c_alta_apoderado_doc;
              this.bajaapoderadodoc = this.response.c_baja_apoderado_doc;
              this.cambioapoderadodoc = this.response.c_cambio_apoderado_doc;
              if (this.altaapoderadodoc == false && this.bajaapoderadodoc == false && this.cambioapoderadodoc == false) {
                if (this.altaapoderadodocBase64 === null && this.bajaapoderadodocBase64 === null && this.cambioapoderadodocBase64 === null){
                  this.doctosPoderApoderado = false;
                } else {
                  this.doctosPoderApoderado = true;
                }
              } else {
                this.doctosPoderApoderado = true;
              }
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
  async obtenerDomicilioLegal() {
    this.operacionRespuesta.EstaEjecutando = true;
    this.ModelDTO = new LecturaDomicilioRequest();
    await this.services.getAsync(this.modelo_configuracion.serviciosOperaciones +
      '/ConsultaDetalleTomaNotaDomicilioLegal/Get?i_id_c=' +
      this.tomanota + '&&s_id_us=' + this.us_id + '&&c_id_trtn=' + this.tomantram + '&&c_tipo_domicilio=1')
      .then((tempdate) => {
        this.operacionRespuesta.EstaEjecutando = false;
        if (tempdate) {
          this.response = tempdate.response[0];
          if (this.response) {
            const modelRequest = new LecturaDomicilioRequest();
            modelRequest.d_id_domicilio = this.response.d_id_domicilio;
            modelRequest.d_numeroe = this.response.d_numeroe;
            modelRequest.d_numeroi = this.response.d_numeroi;
            modelRequest.d_colonia = this.response.d_colonia;
            modelRequest.d_calle = this.response.d_calle;
            modelRequest.d_cpostal = this.response.c_cpostal_n;
            this.ModelDTO = modelRequest;
            setTimeout(() => {
              this.formGroup.patchValue(modelRequest);
              this.check7 = modelRequest.d_cpostal != null ? true : false;
              this.listMovimientos.domicilioLegal = modelRequest.d_cpostal != null ? true : false;
              this.domicilioLegal = tempdate.response[0].c_cpostal_n;
            }, 500);
          }
        } else {
          this.operacionRespuesta.EstaEjecutando = false;
          this.response = [];
          this.check7 = false;

          this.domicilioLegal = 0;
        }

      }, async (err) => {
        this.operacionRespuesta.EstaEjecutando = false;
        this.check7 = false;
      }
      );
  }

  async obtenerDomicilioNotificaciones() {
    this.operacionRespuesta.EstaEjecutando = true;
    this.ModelDTONotificaciones = new LecturaDomicilioRequest();
    this.services.getAsync(
      this.modelo_configuracion.serviciosOperaciones +
      '/ConsultaDetalleTomaNotaDomicilioLegal/Get?i_id_c=' +
      this.tomanota + '&&s_id_us=' + this.us_id + '&&c_id_trtn=' + this.tomantram + '&&c_tipo_domicilio=2'
    ).then((tempdate) => {
      this.operacionRespuesta.EstaEjecutando = false;
      if (tempdate) {
        this.response = tempdate.response[0];
        if (this.response) {
          const modelRequest = new LecturaDomicilioRequest();
          modelRequest.d_id_domicilio = this.response.d_id_domicilio;
          modelRequest.d_numeroe = this.response.d_numeroe;
          modelRequest.d_numeroi = this.response.d_numeroi;
          modelRequest.d_colonia = this.response.d_colonia;
          modelRequest.d_calle = this.response.d_calle;
          modelRequest.d_cpostal = this.response.c_cpostal_n;
          //this.ModelDTO = modelRequest;
          this.ModelDTONotificaciones = modelRequest;
         /*setTimeout(() => {
            this.formGroup.patchValue(modelRequest);
            this.check3 = modelRequest.d_cpostal != null ? true : false;
            this.listMovimientos.domicilioNotificacion = modelRequest.d_cpostal != null ? true : false;
            this.domicilioNotificaciones = tempdate.response[0].c_cpostal_n;
          }, 500);*/
          this.formGroup.patchValue(modelRequest);
          this.check3 = modelRequest.d_cpostal != null ? true : false;
          this.listMovimientos.domicilioNotificacion = modelRequest.d_cpostal != null ? true : false;
          this.domicilioNotificaciones = tempdate.response[0].c_cpostal_n;
        }
      } else {
        this.operacionRespuesta.EstaEjecutando = false;
        this.response = [];
        this.check3 = false;
        this.domicilioNotificaciones = 0;
      }
      // this.domicilioNotificaciones = tempdate.response[0].c_cpostal_n != null ? true : false;
    }, async (err) => {
      this.operacionRespuesta.EstaEjecutando = false;
      this.check3 = false;
    }
    );
  }
  //#endregion

  //#region Representante Legal
  async obtenerRepresentanteLegal() {
    this.operacionRespuesta.EstaEjecutando = true;
    this.Representante_p_acta_exists = false;
    this.Representante_p_ine_exists = false;
    this.Representante_p_curp_exists = false;
    await this.services.getAsync(this.modelo_configuracion.serviciosOperaciones + '/ConsultaDetalleTomaNotaRepresentanteLegal/Get?i_id_c=' + this.tomanota)
      .then((tempdate) => {
        this.operacionRespuesta.EstaEjecutando = false;
        if (tempdate) {
          this.response = tempdate.response[0];
          if (this.response) {
            const modelRequest = new ActualizarRepresentateLegalTN_Request();
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
            this.check2 = true;
            this.listMovimientos.repreLegal = true;

            if (modelRequest.t_rep_legal == true || modelRequest.t_rep_asociado == true || modelRequest.t_ministro_culto == true || modelRequest.t_organo_gob == true) {
              this.invalidrol = false;
            }
            if (modelRequest.t_organo_gob == true) {
              this.hideparam = false;
            }

            if (this.Representante_p_acta_exists == false || this.Representante_p_ine_exists == false || this.Representante_p_curp_exists == false) {
              this.doctosCompletosRepresentante = false;
              this.txtTituloBoton = 'Guardar';
            } else {
              this.doctosCompletosRepresentante = true;
              this.txtTituloBoton = 'Guardar';
            }
            this.formGroupRepresentante.patchValue(modelRequest);

            this.sizeRepresentanteLegal = tempdate.response[0].p_id;
          }
        } else {
          this.response = [];
          this.check2 = false;
          this.registroCompletosRepresentante = false;
          this.sizeRepresentanteLegal = 0;
        }

      }, async (err) => {
        this.operacionRespuesta.EstaEjecutando = false;
        this.registroCompletosRepresentante = false;
        this.check2 = false;
      }
      );
  }

  async obtenerRepresentanteLegalOrgano() {
    this.operacionRespuesta.EstaEjecutando = true;
    await this.services
      .HttpGet(
        this.modelo_configuracion.serviciosOperaciones +
        '/ConsultaDetalleTomaNotaRepresentanteLegal/Get?i_id_c=' + this.tomanota
      )
      .toPromise().then(
        (tempdate) => {
          if (tempdate) {
            this.response =
              tempdate.response[0];
            if (this.response) {
              const modelRequest = new ActualizarRepresentateLegalTN_Request();
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
              // modelRequest.p_cargo = this.response.p_cargo;
              // modelRequest.c_organo_g = this.response.c_organo_g;
              this.Representante_r_id = this.response.r_id;
              this.Representante_p_acta_exists = this.response.p_acta_exists;
              this.Representante_p_ine_exists = this.response.p_ine_exists;
              this.Representante_p_curp_exists = this.response.p_curp_exists;

              if (modelRequest.t_rep_legal == true || modelRequest.t_rep_asociado == true || modelRequest.t_ministro_culto == true || modelRequest.t_organo_gob == true) {
                this.invalidrol = false;
              }
              if (modelRequest.t_organo_gob == true) {
                this.hideparam = false;
              }

              if (this.Representante_p_acta_exists == false || this.Representante_p_ine_exists == false || this.Representante_p_curp_exists == false) {
                this.doctosCompletosRepresentante = false;
                this.txtTituloBoton = 'Guardar';
              } else {
                this.doctosCompletosRepresentante = true;
                this.txtTituloBoton = 'Guardar';
              }
              this.formGroupRepresentante.patchValue(modelRequest);
            }
          } else {
            this.response = [];
            this.registroCompletosRepresentante = false;
          }
          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.operacionRespuesta.EstaEjecutando = false;
          this.registroCompletosRepresentante = false;
        }
      );
  }

  async obtenerRepresentanteLegalValida() {
    this.enableValidations();

    this.operacionRespuesta.EstaEjecutando = true;
    await this.services
      .HttpGet(
        this.modelo_configuracion.serviciosOperaciones +
        '/ConsultaDetalleTomaNotaRepresentanteLegal/Get?i_id_c=' + this.tomanota
      )
      .toPromise().then(
        (tempdate) => {
          if (tempdate) {
            this.response =
              tempdate.response[0];
            if (this.response) {
              const modelRequest = new ActualizarRepresentateLegalTN_Request();
              this.Representante_p_acta_exists = this.response.p_acta_exists;
              this.Representante_p_ine_exists = this.response.p_ine_exists;
              this.Representante_p_curp_exists = this.response.p_curp_exists;
              this.registroCompletosRepresentante = true;
              if (this.Representante_p_acta_exists == false || this.Representante_p_ine_exists == false || this.Representante_p_curp_exists == false) {
                if (this.Representante_ineBase64 === null && this.Representante_actaBase64 === null && this.Representante_curpBase64 === null){
                  this.doctosCompletosRepresentante = false;
                } else {
                  this.doctosCompletosRepresentante = true;
                }
                this.txtTituloBoton = 'Guardar';
              } else {
                this.doctosCompletosRepresentante = true;
                this.txtTituloBoton = 'Guardar';
              }
            }
          } else {
            this.response = [];
            this.doctosCompletosRepresentante = true;
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
  async obtenerApoderado() {
    this.operacionRespuesta.EstaEjecutando = true;
    await this.services.getAsync(this.modelo_configuracion.serviciosOperaciones + '/ConsultaDetalleTomaNotaApoderado/Get?i_id_c=' + this.tomanota)
      .then((tempdate) => {
        if (tempdate) {
          this.response = tempdate.response[0];
          if (this.response) {
            const modelRequest = new InsertarTomaNotaApoderadoLegalRequest();
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
            this.check5 = true;
            this.listMovimientos.apodLegal = true;
            this.sizeApoderado = tempdate.response[0].p_id;
          }
        } else {
          this.response = [];
          this.check5 = false;
          this.listMovimientos.apodLegal = false;
          this.sizeApoderado = 0;
        }


        this.operacionRespuesta.EstaEjecutando = false;
      },

        async (err) => {
          this.operacionRespuesta.EstaEjecutando = false;
          this.check5 = false;
        }
      );
  }

  async obtenerApoderadoValida() {
    this.operacionRespuesta.EstaEjecutando = true;
    await this.services
      .HttpGet(
        this.modelo_configuracion.serviciosOperaciones +
        '/ConsultaDetalleTomaNotaApoderado/Get?i_id_c=' + this.tomanota
      )
      .toPromise().then(
        (tempdate) => {
          if (tempdate) {
            this.response = tempdate.response[0];
            if (this.response) {
              const modelRequest = new InsertarTomaNotaApoderadoLegalRequest();
              modelRequest.s_id = this.response.s_id;
              modelRequest.p_id = this.response.p_id;
              modelRequest.p_nombre = this.response.p_nombre;
              modelRequest.p_apaterno = this.response.p_apaterno;
              modelRequest.p_amaterno = this.response.p_amaterno;

              modelRequest.c_id_tipo_movimiento = this.response.c_tipo_movimiento;
              modelRequest.c_id_poder = this.response.c_poder;
              modelRequest.p_nacionalidad = this.response.c_nacionalidad;
              modelRequest.p_edad = this.response.c_edad;
              this.registroCompletosApoderado = true;

            }
          } else {
            this.response = [];
            this.registroCompletosApoderado = false;
            // this.doctosCompletosApoderado = true;
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
  OnSubmit() {
    this.editarDomicilioLegal(this.formGroup.value);
  }

  async OnSubmitComentario() {
    await this.editarComentariotnota(this.formGroupInicio.value);
  }

  async OnSubmitEstatutos() {
    await this.consultarAnexosEstatutos(this.tomanota);
    if (this.doctosCompletosEstatutos == true) {
      this.editarMovEstatutos(this.formGroupEstatutos.value);
    } else {
      if (this.listaArchivosModalEstatutos.length <= 0) {
        this.openMensajes('No se ha cargado un documento de estatutos.', true);
      } else {
        this.editarMovEstatutos(this.formGroupEstatutos.value);
      }
    }
  }

  async OnSubmitDenominacion() {

    if(this.certificadoregistro == false || this.estatutosnuevasolicitud == false){
      if (this.certificadoregistroBase64 ===  null && this.estatutosnuevasolicitudBase64 === null) {
        this.operacionRespuesta.EstaEjecutando = false;
        this.openMensajes('Favor de cargar la documentación de cambio de denominación p.', true);
        return;
      }
    }

    await this.obtenerDataPrincipalDenominacion();

    if (this.doctosCompletosDenominacion == true) {
      this.editarMovDenominacion(this.formGroupDenominacion.value);
    } else {
      this.openMensajes('Favor de cargar la documentación de cambio de denominación.', true);
    }
  }

  async OnSubmitRepresentanteLegal() {
    await this.obtenerRepresentanteLegalValida();

    if (this.invalidrol == false) {
      if (this.doctosCompletosRepresentante == true && this.invalidrol == false) {

        this.editarMovRepresentanteLegal(this.formGroupRepresentante.value);
        this.txtTituloBoton = 'Guardar';
      } else {
        this.openMensajes('Favor de cargar la documentación de cambio de representante.', true);
      }

    } else {
      this.openMensajes('Favor de seleccionar un rol', true);
    }

  }
  async OnSubmitApoderado() {
    //await this.consultarAnexosApoderado(this.tomanota);   // Consulta documento escritura pública
    await this.obtenerDataPrincipalApoderado();           // consulta documentos poder
    //if (this.doctosCompletosApoderado == true && this.formGroupApoderado != undefined && this.doctosPoderApoderado == true) {
    if (this.formGroupApoderado != undefined && this.doctosPoderApoderado == true) {
      if (this.formGroupApoderado.value.c_id_tipo_movimiento == 1) {
        this.editarMovApoderado(this.formGroupApoderado.value);
      } else if (this.formGroupApoderado.value.c_id_tipo_movimiento == 2) {
        this.editarMovApoderado(this.formGroupApoderado.value);
      } else if (this.formGroupApoderado.value.c_id_tipo_movimiento == 3) {
        this.editarMovApoderado(this.formGroupApoderado.value);
      } else {
        this.openMensajes('Favor de cargar la documentación de cambio del apoderado.', true);
      }

    } else {
      this.openMensajes('Favor de cargar la documentación de cambio del apoderado.', true);
    }
  }
  //#endregion

  //#region Metodos
  async editarComentariotnota(tnotaPricipal: EditarComentario) {
    this.operacionRespuesta.EstaEjecutando = true;

    if (this.listaAnexosOtros.length == 0) {
      tnotaPricipal.comentario_tnota = '';
    }

    const params = {
      c_id: this.tomanota,
      c_comentario: tnotaPricipal.comentario_tnota,
      c_numero_sgar: tnotaPricipal.c_numero_sgar,
      c_denominacion: tnotaPricipal.c_denominacion
    };
    // InfoUpdate.c_id = this.tomanota

    let escritoSolicitudDoc: boolean = await this.fileService.cargarArchivo(this.tomanota, this.escritosolicitudBase64, 14);

    if (escritoSolicitudDoc === false ) {
      return;
    }

    await this.services.postAsync(params, this.modelo_configuracion.serviciosOperaciones + '/ActualizarTomaNotaComentario/Post').then(
      (tempdate) => {
        if (tempdate) {
          this.response = tempdate.response[0];
        } else {
          this.openMensajes('No se pudo realizar la acción', true);
        }

        this.operacionRespuesta.EstaEjecutando = false;
      }, async (err) => {
        this.openMensajes('No se pudo realizar la acción', true);
        this.operacionRespuesta.EstaEjecutando = false;
      }
    );

    this.guardarArchivos();

    if (this.listArchivosDelete.length > 0) {
      for (let i = 0; i < this.listArchivosDelete.length; i++) {
        this.eliminarAnexo(this.listArchivosDelete[i]);
      }
    }
  }


  editarDomicilioLegal(domicilioUpdate: ActualizarDomicilioLRequest) {
    this.operacionRespuesta.EstaEjecutando = true;
    domicilioUpdate.d_id_domicilio = this.tomanota;
    this.services
      .HttpPost(
        domicilioUpdate,
        this.modelo_configuracion.serviciosOperaciones +
        '/ActualizarTomaNotaDomicilioLegal/Post'
      )
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.response = tempdate.response[0];
            if (this.response.proceso_existoso) {
              this.ShowClickPage(this.obtenerEtiqueta());
              if (domicilioUpdate.d_tipo_domicilio == 2) {
                this.listMovimientos.domicilioNotificacion = true;
              } else {
                this.listMovimientos.domicilioLegal = true;
              }
              this.openMensajes(this.response.mensaje, false);
            } else {
              this.openMensajes(this.response.mensaje, true);
            }
          } else {
            this.openMensajes('No se pudo realizar la acción', true);
          }

          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.openMensajes('No se pudo realizar la acción', true);
          this.operacionRespuesta.EstaEjecutando = false;
        }
      );
  }

  editarMovEstatutos(InfoUpdate: EditarMovEstatutosDenominacion) {
    this.operacionRespuesta.EstaEjecutando = true;
    InfoUpdate.c_id = this.tomanota;
    this.services
      .HttpPost(
        InfoUpdate,
        this.modelo_configuracion.serviciosOperaciones +
        '/ActualizarTomaNotaMovEstatutosDenominacion/Post'
      )
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.listMovimientos.estatutos = true;
            this.response = tempdate.response[0];
            if (this.response.proceso_existoso) {
              /*this.returnPage(this.response.mensaje, false, 3);*/
            } else {
              this.openMensajes(
                this.response.mensaje,
                this.response.proceso_existoso
              );
              this.ShowClickPage(this.obtenerEtiqueta());
            }
          } else {
            this.openMensajes('No se pudo realizar la acción', true);
          }

          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.openMensajes('No se pudo realizar la acción', true);
          this.operacionRespuesta.EstaEjecutando = false;
        }
      );

    this.guardarArchivosEstatutos();

    if (this.listArchivosDelete.length > 0) {
      for (let i = 0; i < this.listArchivosDelete.length; i++) {
        this.eliminarAnexo(this.listArchivosDelete[i]);
      }
    }
  }

  async editarMovDenominacion(InfoUpdate: EditarMovEstatutosDenominacion) {
    this.operacionRespuesta.EstaEjecutando = true;
    InfoUpdate.c_id = this.tomanota;
    if(this.certificadoregistro == false || this.estatutosnuevasolicitud == false){
      if (this.certificadoregistroBase64 ===  null && this.estatutosnuevasolicitudBase64 === null) {
        this.operacionRespuesta.EstaEjecutando = false;
        this.openMensajes('Favor de cargar la documentación de cambio de denominación.', true);
        return;
      }
    }

    let carga: boolean = false;
    if ( this.certificadoregistroBase64 !==  null) {
      carga = await this.fileService.cargarArchivo(this.tomanota, this.certificadoregistroBase64, 19);
    }
    if ( this.estatutosnuevasolicitudBase64 !== null) {
      carga = await this.fileService.cargarArchivo(this.tomanota, this.estatutosnuevasolicitudBase64, 20);
    }

    this.services
      .HttpPost(
        InfoUpdate,
        this.modelo_configuracion.serviciosOperaciones +
        '/ActualizarTomaNotaMovEstatutosDenominacion/Post'
      )
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.listMovimientos.denominacion = true;
            this.response = tempdate.response[0];
            if (this.response.proceso_existoso) {
              /*this.returnPage(this.response.mensaje, false, 3);*/
            } else {
              this.openMensajes(
                this.response.mensaje,
                this.response.proceso_existoso
              );
              this.ShowClickPage(this.obtenerEtiqueta());
            }
          } else {
            this.openMensajes('No se pudo realizar la acción', true);
          }

          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.openMensajes('No se pudo realizar la acción', true);
          this.operacionRespuesta.EstaEjecutando = false;
        }
      );
  }

  EditarRepresentante(representanteEditar: any) {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpPost(
        representanteEditar,
        this.modelo_configuracion.serviciosOperaciones +
        '/InsertarTomaNotaRepresentante/Post'
      )
      .subscribe(
        async (tempdate) => {
          if (tempdate) {
            this.listMovimientos.listAsociados = true;
            this.respuesta = tempdate.response[0];

            this.openMensajes(
              this.respuesta.mensaje,
              !this.respuesta.proceso_exitoso
            );

            this.obtenerRepresentantes();
          } else {
            this.openMensajes('No se pudo realizar la acción', true);
          }
          this.modalrefEdicion.close();
          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.modalrefEdicion.close();
          this.operacionRespuesta.EstaEjecutando = false;
          this.openMensajes('No se pudo realizar la acción', true);
        }
      );
  }

  async editarMovRepresentanteLegal(InfoUpdate: ActualizarRepresentateLegalTN_Request) {
    let idRepresentante;
    this.operacionRespuesta.EstaEjecutando = true;
    InfoUpdate.s_id = this.tomanota;

    this.services
      .HttpPost(
        InfoUpdate,
        this.modelo_configuracion.serviciosOperaciones +
        '/InsertarTomaNotaRepresentanteLegal/Post'
      )
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.listMovimientos.repreLegal = true;
            this.response = tempdate.response[0];
            idRepresentante =  this.Representante_r_id !== 0 ? this.Representante_r_id : tempdate.response[0].c_repre;

            //if (this.response.proceso_existos) {

              if (this.Representante_ineBase64 ===  null && this.Representante_actaBase64 === null && this.Representante_curpBase64 === null) {
                this.operacionRespuesta.EstaEjecutando = false;
                return;
              }

            if (this.Representante_ineBase64 !==  null) {
              this.fileService.cargarArchivo(this.Representante_r_id , this.Representante_ineBase64, 7);
            }

            if (this.Representante_actaBase64 !==  null) {
              this.fileService.cargarArchivo(this.Representante_r_id , this.Representante_actaBase64, 8);
            }

            if (this.Representante_curpBase64 !==  null) {
              this.fileService.cargarArchivo(this.Representante_r_id , this.Representante_curpBase64, 9);
            }

            this.openMensajes(this.response.mensaje, this.response.proceso_existoso);

            this.ShowClickPage(this.obtenerEtiqueta());

              /*this.returnPage(this.response.mensaje, false, 3);*/
           /* } else {
              this.openMensajes(
                this.response.mensaje,
                this.response.proceso_existoso
              );
            }*/
          } else {
            this.openMensajes('No se pudo realizar la acción', true);
          }
          this.obtenerRepresentanteLegalOrgano();
          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.openMensajes('No se pudo realizar la acción', true);
          this.operacionRespuesta.EstaEjecutando = false;
        }
      );
    await this.obtenerRepresentanteLegalOrgano();
  }

  async editarMovApoderado(InfoUpdate: InsertarTomaNotaApoderadoLegalRequest) {
    this.operacionRespuesta.EstaEjecutando = true;
    InfoUpdate.s_id = this.tomanota;

    let altaapoderado_Doc: boolean = false;

    if (this.altaapoderadodocBase64 !== null && this.altaapoderadodocBase64 !== '') {
      altaapoderado_Doc = await this.fileService.cargarArchivo(this.tomanota, this.altaapoderadodocBase64, 22);
    }
    if (this.bajaapoderadodocBase64 !== null && this.bajaapoderadodocBase64 !== '') {
      altaapoderado_Doc = await this.fileService.cargarArchivo(this.tomanota, this.bajaapoderadodocBase64, 23);
    }
    if (this.cambioapoderadodocBase64 !== null && this.cambioapoderadodocBase64 !== '') {
      altaapoderado_Doc = await this.fileService.cargarArchivo(this.tomanota, this.cambioapoderadodocBase64, 24);
    }

    if (altaapoderado_Doc) {
      this.operacionRespuesta.EstaEjecutando = false;
      return;
    }

    this.services
      .HttpPost(
        InfoUpdate,
        this.modelo_configuracion.serviciosOperaciones +
        '/InsertarTomaNotaApoderadoLegal/Post'
      )
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.listMovimientos.apodLegal = true;
            this.response = tempdate.response[0];
            if (this.response.proceso_existoso) {
              /*this.returnPage(this.response.mensaje, false, 3);*/
            } else {
              this.openMensajes(
                this.response.mensaje,
                this.response.proceso_existoso
              );
              this.ShowClickPage(this.obtenerEtiqueta());
            }
          } else {
            this.openMensajes('No se pudo realizar la acción', true);
          }
          this.obtenerRepresentanteLegal();
          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.openMensajes('No se pudo realizar la acción', true);
          this.operacionRespuesta.EstaEjecutando = false;
        }
      );

    this.guardarArchivosEscritura();

    if (this.listArchivosDelete.length > 0) {
      for (let i = 0; i < this.listArchivosDelete.length; i++) {
        this.eliminarAnexo(this.listArchivosDelete[i]);
      }
    }
    this.listArchivosDelete = [];
  }

  ChangeSolicitudEscrito(e) { //Change en SELECT s_cat_solicitud_escrito (Tipo de Solicitud Escrito) se elimina
    let solicitudEscrito;
    solicitudEscrito = this.formGroupInicio.value.c_id_tsol_escrito;

    if (solicitudEscrito > 0) {
      this.operacionRespuesta.EstaEjecutando = true;
      this.services.HttpGet(this.modelo_configuracion.serviciosOperaciones +
        '/ActualizarSolicitudEscritoTomaNota/Get?tomanota=' + this.tomanota + '&solicitudescrito=' + solicitudEscrito)
        .subscribe(
          (tempdate) => {
            if (tempdate) {
              this.response = tempdate.response[0];
              if (this.response.proceso_existoso) {
                /*this.returnPage(this.response.mensaje, false, 3);*/
              }
              // else
              //  this.openMensajes(
              //    this.response.mensaje,
              //    this.response.proceso_existoso
              //  );
            } else {
              this.openMensajes('No se pudo realizar la acción', true);
            }
            this.obtenerRepresentanteLegal();
            this.operacionRespuesta.EstaEjecutando = false;
          },
          async (err) => {
            this.openMensajes('No se pudo realizar la acción', true);
            this.operacionRespuesta.EstaEjecutando = false;
          }
        );
    }
  }

  async ejecutarMovimientos(): Promise<void> {
    try {

      if(this.movimientosControlCheckbox !== null || this.movimientosControlCheckbox !== undefined) {
         this.operacionRespuesta.EstaEjecutando = true;
         await this.services.postAsync(this.movimientosControlCheckbox, `${this.modelo_configuracion.serviciosOperaciones}/ConsultaDetalleTomaNota/Post`).then(resolve=>{
          this.operacionRespuesta.EstaEjecutando = false;
          return resolve;
         });

      }
    } catch (e) {
      this.operacionRespuesta.EstaEjecutando = false;
    }
  }

  ChangeCotejo(e) { //SE ELIMINA CHANGE DE SELECT c_cotejo (Indique cómo desea que se lleve a cabo el cotejo..)
    let solicitudEscrito;
    solicitudEscrito = this.formGroupCotejo.value.c_cotejo;

    if (solicitudEscrito > 0) {
      this.operacionRespuesta.EstaEjecutando = true;
      this.services.HttpGet(this.modelo_configuracion.serviciosOperaciones +
        '/ActualizarCotejoTomaNota/Get?tomanota=' + this.tomantram + '&solicitudescrito=' + solicitudEscrito)
        .subscribe(
          (tempdate) => {
            if (tempdate) {
              this.response = tempdate.response[0];
              if (this.response.proceso_existoso) {
                /*this.returnPage(this.response.mensaje, false, 3);*/
              } else {
                /*this.openMensajes(
                  this.response.mensaje,
                  this.response.proceso_existoso
                );*/
              }
            } else {
              this.openMensajes('No se pudo realizar la acción', true);
            }
            this.obtenerRepresentanteLegal();
            this.operacionRespuesta.EstaEjecutando = false;
          },
          async (err) => {
            this.openMensajes('No se pudo realizar la acción', true);
            this.operacionRespuesta.EstaEjecutando = false;
          }
        );
    }
  }

  async Finalizar() {
    this.ChangeCotejo(null);
    const total = this.obtenerTotalMovimientosPorGuardar();
    const totalGuardados = this.obtenerTotalMovimientosGuardados();
    let txtMovimientos;

    if (total != totalGuardados) {
      this.modalrefAdvertencia = this.modalService.open(ModuloModalAdvertenciaComponent,
        {
          ariaLabelledBy: 'modal-basic-title',
        }
      );
      const restantes = total - totalGuardados;
      if (restantes == 1) {
        txtMovimientos = 'movimiento';
      } else {
        txtMovimientos = 'movimientos';
      }
      this.modalrefAdvertencia.componentInstance.btnAceptarTxt = 'Continuar capturando';
      this.modalrefAdvertencia.componentInstance.btnCancelarTxt = 'Finalizar';
      this.modalrefAdvertencia.componentInstance.mensajeTitulo = 'Finalizar toma de nota';
      this.modalrefAdvertencia.componentInstance.mensaje = `Los movimientos seleccionados son ${total}, falta por registrar ${total - totalGuardados}  ${txtMovimientos}. ¿Desea continuar capturando información en los movimientos faltantes?`;
      this.modalrefAdvertencia.result.then((result) => {
        if (!result) {
          this.FinalizarNota();
        }
      });
    } else {
      this.FinalizarNota();
    }
  }

  obtenerTotalMovimientosGuardados() {
    let total = 0;
    if (this.listMovimientos.estatutos) { total++; }
    if (this.listMovimientos.denominacion) { total++; }
    //if (this.listMovimientos.listAsociados) { total++; }
    if (this.listMovimientos.repreLegal) { total++; }
    if (this.listMovimientos.apodLegal) { total++; }
    if (this.listMovimientos.domicilioLegal) { total++; }
    if (this.listMovimientos.domicilioNotificacion) { total++; }
    return total;
  }

  obtenerTotalMovimientosPorGuardar() {
    return this.routes.length;
  }

  async FinalizarNota() {
    this.procedeFinalizar = true;
    this.operacionRespuesta.EstaEjecutando = true;
    let params = new FinalizarTomaNota();

    params.b_estatutos = this.listMovimientos.estatutos;
    params.b_denominacion = this.listMovimientos.denominacion;
    params.b_miembros = this.listMovimientos.listAsociados;
    params.b_representante = this.listMovimientos.repreLegal;
    params.b_apoderado = this.listMovimientos.apodLegal;
    params.b_dom_legal = this.listMovimientos.domicilioLegal;
    params.b_dom_notificacion = this.listMovimientos.domicilioNotificacion;

    await this.ObternerDatosBanderas().then(async () => {
      params = this.ParamFinalizar();
    });

    if (this.listMovimientos.estatutos == true && this.procedeFinalizar == true) {
      await this.consultarAnexosEstatutos(this.tomanota);
      if (this.doctosCompletosEstatutos == true) {
        this.procedeFinalizar = true;
      } else {
        this.procedeFinalizar = false;
        this.mensajeNoProcede = 'No se ha cargado un documento de estatutos.';
      }
    }
    if (this.listMovimientos.denominacion == true && this.procedeFinalizar == true) {
      await this.obtenerDataPrincipalDenominacion();
      if (this.doctosCompletosDenominacion == true) {
        this.procedeFinalizar = true;
      } else {
        this.procedeFinalizar = false;
        this.mensajeNoProcede = 'Favor de cargar la documentación de cambio de denominación.';
      }
    }
    if (this.listMovimientos.listAsociados == true && this.procedeFinalizar == true) {
      await this.obtenerRepresentantesValido();
      if (this.doctosCompletos == true) {
        this.procedeFinalizar = true;
      } else {
        this.procedeFinalizar = false;
        this.mensajeNoProcede = 'Favor de cargar la documentación de los representantes.';
      }
    }
    if (this.listMovimientos.repreLegal == true && this.procedeFinalizar == true) {
      await this.obtenerRepresentanteLegalValida();
      if (this.registroCompletosRepresentante == true && this.doctosCompletosRepresentante == true) {
        this.procedeFinalizar = true;
      } else {
        this.procedeFinalizar = false;
        this.mensajeNoProcede = 'Favor de cargar la documentación de cambio de representante.';
      }
    }
    if (this.listMovimientos.apodLegal == true && this.procedeFinalizar == true) {
      await this.consultarAnexosApoderado(this.tomanota);   // Consulta documento escritura pública
      await this.obtenerDataPrincipalApoderado();           // consulta documentos poder

      if (this.doctosCompletosApoderado == true && this.formGroupApoderado != undefined) {

        if (this.formGroupApoderado.value.c_id_tipo_movimiento == 1) {
          this.procedeFinalizar = true;
        } else if (this.formGroupApoderado.value.c_id_tipo_movimiento == 2) {
          this.procedeFinalizar = true;
        } else if (this.formGroupApoderado.value.c_id_tipo_movimiento == 3) {
          this.procedeFinalizar = true;
        } else {
          this.mensajeNoProcede = 'Favor de cargar la documentación de cambio del apoderado.';
          this.procedeFinalizar = false;
        }
      } else {
        this.mensajeNoProcede = 'Favor de cargar la documentación de cambio del apoderado.';
        this.procedeFinalizar = false;
      }
    }


    if (this.listMovimientos.domicilioLegal == true && this.procedeFinalizar == true) {
      if (this.formGroup.valid) {
        this.procedeFinalizar = true;
      } else {
        this.procedeFinalizar = false;
        this.mensajeNoProcede = 'Favor de llenar el domicilio legal.';
      }
    }
    if (this.listMovimientos.domicilioNotificacion == true && this.procedeFinalizar == true) {
      this.procedeFinalizar = true;
    }

    if (this.procedeFinalizar == true) {
      this.operacionRespuesta.EstaEjecutando = true;

      params = this.ParamFinalizar();

      this.services
        .HttpPost(
          params,
          this.modelo_configuracion.serviciosOperaciones +
          '/FinalizarTomaNota/Post'
        )
        .subscribe(
          (tempdate) => {
            if (tempdate) {
              this.response = tempdate.response[0];
              this.openMensajesFin(this.response.mensaje, !this.response.proceso_existoso, this.response.proceso_existoso);
            } else {
              this.openMensajes('No se pudo realizar la acción', true);
            }

            this.operacionRespuesta.EstaEjecutando = false;
          },
          async (err) => {
            this.openMensajes('No se pudo realizar la acción', true);
            this.operacionRespuesta.EstaEjecutando = false;
          }
        );
    } else {
      this.operacionRespuesta.EstaEjecutando = false;
      this.openMensajes(this.mensajeNoProcede, true);
    }

  }

  //#endregion

  //#endregion

  //#region Modal
  openEdicion(representanteEditar: ActualizarRepresentateTNRequest) {
    if (representanteEditar === null) {
      representanteEditar = new ActualizarRepresentateTNRequest();
    }
    /*representanteEditar.s_id = this.id_tramite;*/
    representanteEditar.s_id = this.tomanota;
    this.modalrefEdicion = this.modalService.open(
      ModuloSolicitudMovimientosRelacionMiembrosComponent,
      { ariaLabelledBy: 'modal-basic-title', size: 'lg' }
    );
    this.modalrefEdicion.componentInstance.ActualizarRepresentante.subscribe(
      ($e) => {
        if (!this.operacionRespuesta.EstaEjecutando) {
          this.EditarRepresentante($e);
        }
      }
    );
    this.modalrefEdicion.componentInstance.representanteEditar =
      representanteEditar;
    this.modalrefEdicion.componentInstance.listaTipoR = this.listtipo;
  }

  openMensajes(Mensaje: string, Error: boolean) {
    this.modalrefMsg = this.modalService.open(ModuloModalMensajeComponent, {
      ariaLabelledBy: 'modal-basic-title',
    });
    this.modalrefMsg.componentInstance.mensajesExito = [];
    this.modalrefMsg.componentInstance.mensajesError = [];
    this.modalrefMsg.componentInstance.mensajesTitulo = 'Carga de Información';
    if (Error) {
      this.modalrefMsg.componentInstance.showErrors = true;
      this.modalrefMsg.componentInstance.mensajesError.push(Mensaje);
    } else {
      this.modalrefMsg.componentInstance.showExitos = true;
      this.modalrefMsg.componentInstance.mensajesExito.push(Mensaje);
    }
  }

  openMensajesFin(Mensaje: string, Error: boolean, finalizado: boolean = false, titulo: string = 'Carga de Información') {
    this.modalrefMsg = this.modalService.open(ModuloModalMensajeComponent, {
      ariaLabelledBy: 'modal-basic-title',
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
      const instance = this;
      this.modalrefMsg.result.then(() => {
        instance.router.navigate(['tramites-electronicos']);
      }, () => {
        instance.router.navigate(['tramites-electronicos']);
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
    setTimeout(() => {

      if (this.dtElement === undefined) {
        return;
      }

      if ('dtInstance' in this.dtElement) {
        this.dtElement.dtInstance.then((instancia: DataTables.Api) => {
          instancia.destroy();
          this.dtTrigger.next();
        });
      } else {
        this.dtTrigger.next();
      }
    }, 2500);
  }

  //#endregion

  //#region CheckMovimientos
  checkedMovimiento(categoriaSelected: string, checked: boolean) {
    const rutaPag = [];
    let idi = 0;

    //#region Control del checbox
    this.asignarBanderasParamMovimientos(categoriaSelected, checked);
    //#endregion

    if (categoriaSelected == 'Estatutos') { idi = 1; }
    if (categoriaSelected == 'Denominacion') { idi = 2; }
    if (categoriaSelected == 'Representante') { idi = 4; }
    if (categoriaSelected == 'Miembros') { idi = 3; } else
      if (categoriaSelected == 'Representante') { idi = 4; } else
        if (categoriaSelected == 'Apoderado') { idi = 5; } else
          if (categoriaSelected == 'DomicilioLegal') { idi = 6; } else
            if (categoriaSelected == 'DomicilioNotificacion') { idi = 7; }

    if (checked == true) { // Si el elemento fue seleccionado
      this.routes.push({ id: idi, text: categoriaSelected, active: false });
    } else { // Si el elemento fue deseleccionado
      const index = this.routes.findIndex(x => x.text == categoriaSelected);
      this.routes.splice(index, 1);
    }
    this.routes.sort(function (a, b) { return a.id - b.id; });

    this.routes = this.routes.filter(
      (obj, index, self) =>
        index === self.findIndex((o) => o.text === obj.text)
    );
  }

  private asignarBanderasParamMovimientos(categoria: string, isChecked: boolean): void {
    switch(categoria) {
       case 'Estatutos':
        this.movimientosControlCheckbox.estatutos = isChecked;
       break;
       case 'DomicilioNotificacion':
        this.movimientosControlCheckbox.dom_notificaciones = isChecked;
       break;
       case 'Denominacion':
        this.movimientosControlCheckbox.denominacion = isChecked;
       break;
       case 'Apoderado':
        this.movimientosControlCheckbox.apoderado = isChecked;
       break;
       case 'Representante':
        this.movimientosControlCheckbox.rep_legal = isChecked;
       break;
       case 'DomicilioLegal':
        this.movimientosControlCheckbox.dom_legal = isChecked;
       break;
    }
  }

  async ShowMovimientos() {

    this.limpiarForms();
    await this.ChangeSolicitudEscrito(null);
    // guardado de comentarios
    await this.editarComentariotnota(this.formGroupInicio.value);
    // guardado de comentarios

    //----SE SUBEN VALIDACIONES
    await this.obtenerDataPrincipalEscritoSolicitudBandera();
    /*if (this.escritosolicitud === false) {
      this.openMensajes("Por favor adjunte el documento escrito solicitud de toma de nota", true);
      return false;
    }*/
    if(this.idTramite_aux == 0){
      if (this.escritosolicitudBase64 ===  null) {
        this.openMensajes("Por favor adjunte el documento escrito solicitud de toma de nota", true);
        return false;
      }

      if (this.formGroupInicio.controls.c_id_tsol_escrito.value == 0) {
        this.openMensajes('Por favor seleccione el tipo de solicitud escrito', true);
        return false;
      }
    }
    ////---

    if (this.id_tramite != 0) {

      const index1 = this.routes.findIndex(x => x.text == 'Estatutos');
      if (this.check1 && index1 < 0) {
        this.checkedMovimiento('Estatutos', this.check1);
      }
      const index4 = this.routes.findIndex(x => x.text == 'Denominacion');
      if (this.check4 && index4 < 0) {
        this.checkedMovimiento('Denominacion', this.check4);
      }

      const index2 = this.routes.findIndex(x => x.text == 'Representante');
      if (this.check2 && index2 < 0) {
        this.checkedMovimiento('Representante', this.check2);
      }
      /*const index6 = this.routes.findIndex(x => x.text == 'Miembros');
      if (this.check6 && index6 < 0) {
        this.checkedMovimiento('Miembros', this.check6);
      }*/
      const index5 = this.routes.findIndex(x => x.text == 'Apoderado');
      if (this.check5 && index5 < 0) {
        this.checkedMovimiento('Apoderado', this.check5);
      }
      const index7 = this.routes.findIndex(x => x.text == 'DomicilioLegal');
      if (this.check7 && index7 < 0) {
        this.checkedMovimiento('DomicilioLegal', this.check7);
      }
      const index3 = this.routes.findIndex(x => x.text == 'DomicilioNotificacion');
      if (this.check3 && index3 < 0) {
        this.checkedMovimiento('DomicilioNotificacion', this.check3);
      }
    }

    if (this.tomanota > 0 && this.id_bloqueo == 1) {
      return;
    }

    this.movimientosControlCheckbox.p_id_tramite = this.tomanota;
    let response = await this.ejecutarMovimientos();
    //await this.obtenerRepresentanteLegal();
    if (this.check1 == true) {
      // Estatutos
      await this.obtenerDataPrincipal();
      this.movEstatutos = true;
    }
    if (this.check4 == true) {
        // Denominación
        await this.obtenerDataPrincipal();
        this.movDenominacion = true;
    }
    /* if (this.check6 == true) {
          // Miembros
          this.inicializaTabla();
          this.obtenerRepresentantes();
          this.movMiembros = true;
          this.renderTabla();
    } else*/
    if (this.check2 == true) {
      // Representante
      this.movRepresentante = true;
      await this.obtenerRepresentanteLegal();
      this.renderTabla();
    }
    if (this.check5 == true) {
      // Apoderado
      await this.obtenerApoderado();
      this.movApoderado = true;
    }
    if (this.check7 == true) {
      // Dom. Legal
      await this.obtenerDomicilioLegal();
      this.movDomicilio1 = true;
    }
    if (this.check3 == true) {
      // Dom. Notificación
      await this.obtenerDomicilioNotificaciones();
      this.movDomicilio2 = true;
    }

    if (this.formGroupInicio.controls.c_numero_sgar.value == '') {
      this.openMensajes('Por favor ingrese el número SGAR', true);
      return false;
    }
    if (this.formGroupInicio.controls.c_denominacion.value == '') {
      this.openMensajes('Por favor ingrese la denominación', true);
      return false;
    }

    //SE ELIMINAN VALIDACIONES

    if (this.routes.length == 0) {
      this.openMensajes('Por favor seleccione los movimientos que desea realizar', true);
      return false;
    } else {

      if (this.listaAnexosOtros.length > 0 && this.formGroupInicio.value.comentario_tnota == '') {
        this.openMensajes('Favor de llenar el campo comentarios', true);
        return false;
      }


      if (this.movimientosControlCheckbox.estatutos == true) {
        this.checkedMovimiento('Estatutos', true);
      }
      if (this.movimientosControlCheckbox.rep_legal == true) {
        this.checkedMovimiento('Representante', true);
      }
      if (this.movimientosControlCheckbox.dom_notificaciones == true) {
        this.checkedMovimiento('DomicilioNotificacion', true);
      }
      if (this.movimientosControlCheckbox.denominacion == true) {
        this.checkedMovimiento('Denominacion', true);
      }
      if (this.movimientosControlCheckbox.apoderado == true) {
        this.checkedMovimiento('Apoderado', true);
      }
      /*if (this.listMovimientos.listAsociados == true) {
        this.checkedMovimiento('Miembros', true);
      }*/
      if (this.movimientosControlCheckbox.dom_legal == true) {
        this.checkedMovimiento('DomicilioLegal', true);
      }

      this.inicio = false;
      this.movEstatutos = false;
      this.movRepresentante = false;
      this.movDomicilio2 = false;
      this.movDenominacion = false;
      this.movApoderado = false;
      this.movMiembros = false;
      this.movDomicilio1 = false;
      const lastindex = (this.routes.length - 1);
      if (!this.inicio) {
        this.showPagination = true;
        this.routes[0].active = true;
        if (lastindex == 0) {
          this.showCotejoBoton = true;
        }
      }

      if (this.routes[0].text == 'Estatutos') { await this.obtenerDataPrincipal();  this.movEstatutos = true; } else
        if (this.routes[0].text == 'Denominacion') { await this.obtenerDataPrincipal(); this.movDenominacion = true; } else
          if (this.routes[0].text == 'Miembros') { this.inicializaTabla(); await this.obtenerRepresentantes(); this.movMiembros = true; } else
            if (this.routes[0].text == 'Representante') { await this.obtenerRepresentanteLegal(); this.movRepresentante = true; } else
              if (this.routes[0].text == 'Apoderado') { await this.obtenerApoderado(); this.movApoderado = true; } else
                if (this.routes[0].text == 'DomicilioLegal') { await this.obtenerDomicilioLegal(); this.movDomicilio1 = true; } else
                  if (this.routes[0].text == 'DomicilioNotificacion') { await this.obtenerDomicilioNotificaciones(); this.movDomicilio2 = true; }
    }

    this.listaArchivosModalEstatutos = [];
    this.listaArchivosEscritura = [];
    this.listArchivosDelete = [];
  }

  obtenerEtiqueta() {
    let etiqueta = '';
    const _index = this.routes.findIndex(x => x.active == true);

    if (_index +1 === this.routes.length) {
      return etiqueta;
    }

    this.routes.forEach((item, index) => {
      if ( _index + 1 === index) {
        etiqueta = item.text;
      }
    });
    return etiqueta;
  }

  ShowClickPage(text) {
    if (text === '') return;

    this.inicio = false;
    this.movEstatutos = false;
    this.movRepresentante = false;
    this.movDomicilio2 = false;
    this.movDenominacion = false;
    this.movApoderado = false;
    this.movMiembros = false;
    this.movDomicilio1 = false;
    const indexAnterior = this.routes.findIndex(x => x.active == true);
    const index = this.routes.findIndex(x => x.text == text);

    const lastindex = (this.routes.length - 1);
    if (!this.inicio) {
      this.showPagination = true;
      this.routes[indexAnterior].active = false;
      this.routes[index].active = true;
      if (lastindex == index) {
        this.showCotejoBoton = true;
      } else {
        this.showCotejoBoton = false;
      }
    }
    if (text == 'Inicio') { this.obtenerDataPrincipal(); this.inicio = true; } else
      if (text == 'Estatutos') { this.obtenerDataPrincipal(); this.movEstatutos = true; } else
        if (text == 'Denominacion') { this.obtenerDataPrincipal(); this.movDenominacion = true; } else
          if (text == 'Miembros') { this.obtenerRepresentantes(); this.movMiembros = true; } else
            if (text == 'Representante') { this.obtenerRepresentanteLegal(); this.movRepresentante = true; } else
              if (text == 'Apoderado') { this.obtenerApoderado(); this.movApoderado = true; } else
                if (text == 'DomicilioLegal') { this.obtenerDomicilioLegal(); this.movDomicilio1 = true; } else
                  if (text == 'DomicilioNotificacion') { this.obtenerDomicilioNotificaciones(); this.movDomicilio2 = true; }

  }

  async retornarInicio() {

    this.routes = [];
    this.showPagination = false;
    this.showCotejoBoton = false;
    this.inicio = true;
    this.movEstatutos = false;
    this.movRepresentante = false;
    this.movDomicilio2 = false;
    this.movDenominacion = false;
    this.movApoderado = false;
    this.movMiembros = false;
    this.movDomicilio1 = false;

    this.check1 = this.listMovimientos.estatutos;
    this.check2 = this.listMovimientos.repreLegal;
    this.check3 = this.listMovimientos.domicilioNotificacion;
    this.check4 = this.listMovimientos.denominacion;
    this.check5 = this.listMovimientos.apodLegal;
    this.check6 = this.listMovimientos.listAsociados;
    this.check7 = this.listMovimientos.domicilioLegal;

    await this.obtenerDataPrincipal();

    if (this.nSgar == '' && this.denominacion == '' && this.tipoSolicitudEscrito == null &&
      this.estatutos == '' && this.comen_deno == '' &&
      this.sizeRepresentantes == 0 && this.sizeRepresentanteLegal == 0 && this.sizeApoderado == 0 &&
      this.domicilioLegal == null && this.domicilioNotificaciones == null) {
      this.eliminarTnota(this.tomanota);
    }
  }
  //#endregion


  //#region Otros
  patchDomicilio(model: InsertarDomicilioRequest) {
    this.formGroup.patchValue(model);
  }

  getRoles(rep: any) {
    let roles = '';
    if (rep.t_rep_legal) { roles += 'Representante Legal, '; }
    if (rep.t_rep_asociado) { roles += 'Asociado, '; }
    if (rep.t_ministro_culto) { roles += 'Ministro de Culto, '; }
    if (rep.t_organo_gob) { roles += 'Órgano de Gobierno, '; }

    if (roles.length > 0) { roles = roles.substring(0, roles.length - 2); }

    return roles;
  }

  setIsLoadingArchivo(is_loading: boolean): void {
    // this.obtenerRepresentantes()
    this.operacionRespuesta.EstaEjecutando = is_loading;
  }
  //#endregion

  regresarInicio() {
    const asignador = AuthIdentity.IsAsignadorTN();
    if (asignador) {
      this.router.navigate(['/asignacion/toma-nota']);
      return;
    }

    if (this.nSgar == '' && this.denominacion == '' && this.tipoSolicitudEscrito == null &&
      this.estatutos == '' && this.comen_deno == '' &&
      this.sizeRepresentantes == 0 && this.sizeRepresentanteLegal == 0 && this.sizeApoderado == 0 &&
      this.domicilioLegal == null && this.domicilioNotificaciones == null) {
      //this.eliminarTnota(this.tomanota);
    }
    const instance = this;

    this.modalrefAdvertencia = this.modalService.open(ModuloModalAdvertenciaComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
      }
    );

    this.modalrefAdvertencia.componentInstance.mensajeTitulo = 'Salir de trámite toma de nota';
    this.modalrefAdvertencia.componentInstance.mensaje = '¿Está seguro de que desea salir del trámite toma de nota?';
    this.modalrefAdvertencia.result.then((result) => {
      if (result) { instance.router.navigate(['registros-toma-nota']); }
    });

  }

  async editarPasoTres() {
    //await this.obtenerRepresentantes();
    await this.guardarDocRepresentantes()
    if (this.doctosCompletos == true) {
      this.openMensajes('La información se ha cargado de forma exitosa.', false);
    } else {
      this.openMensajes('Favor de cargar la documentación de los representantes.', true);
    }
  }

  ChangeDocto(id) {
    this.bnd_apoderado = id;
  }

  eliminarTnota(id_tnota: number) {
    this.operacionRespuesta.EstaEjecutando = true;
    const params = {
      id_tnota: id_tnota
    };
    this.services.HttpPost(params, `${this.modelo_configuracion.serviciosOperaciones}/EliminarRegistroTomaNota/EliminarRegistro`)
      .subscribe((response: any) => {
        this.operacionRespuesta.EstaEjecutando = false;
        if (response.mensaje != null) {
          this.operacionRespuesta.EsMsjError = true;
          this.operacionRespuesta.Msj = response.response.mensaje;
        }

      }, (error) => {
        this.operacionRespuesta.EstaEjecutando = false;
        this.operacionRespuesta.EsMsjError = false;
        this.operacionRespuesta.Msj = error.response[0];
      });

  }


  //#region multiarchivos
  cargarArchivo() {
    const inputFile = document.getElementById('ArchivoModal') as HTMLInputElement;
    inputFile.click();
  }

  async agregarArchivo(archivo: any) {
    // se valida que todos los archivos tengan el tamaño permitido
    let error = 0;
    for (let x = 0; x < archivo.length; x++) {
      if (archivo[x].size > this.max_size) {
        error++;
      }
    }

    if (error > 0) {
      this.openMensajes('El máximo tamaño permitido es ' + this.max_size / 1000 + 'Mb', true);
      error = 0;
      return false;
    }

    // se valida que solo sean pdf
    for (let i = 0; i < archivo.length; i++) {

      if (!_.includes(this.allowed_types, archivo[i].type)) {
        error++;
      }
    }

    if (error > 0) {
      this.openMensajes(
        'El documento no tiene formato PDF, por favor intente de nuevo.',
        true
      );
      return false;
    }

    // se termina la validacion y procedemos a generar el b64
    for (let i = 0; i < archivo.length; i++) {
      const archivoItem: Blob = archivo[i];
      const archivo_Item = archivo[i];
      const base64 = await this.blobToData(archivoItem);

      this.listaArchivosModal.push({
        id_asunto: this.tomanota,
        nombre_anexo: archivo_Item.name,
        anexo: archivoItem,
        extension: '.pdf',
        base64: base64
      });

      this.listaAnexosOtros.push({
        id_asunto: this.tomanota,
        nombre_anexo: archivo_Item.name,
        base64: base64
      });
    }
    // this.guardarArchivos();
  }

  blobToData = (blob: Blob): any => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.readAsDataURL(blob)
    });

  }

  public guardarArchivos() {
    let i: number;
    for (i = 0; i < this.listaArchivosModal.length; i++) {
      const formData: any = new FormData();
      formData.append('id_asunto', this.listaArchivosModal[i].id_asunto);
      formData.append('nombre_anexo', this.listaArchivosModal[i].nombre_anexo);
      formData.append('anexo', this.listaArchivosModal[i].anexo);
      formData.append('extension', this.listaArchivosModal[i].extension);
      formData.append('id_tramite', 26);

      this.services.HttpPostFile(formData, this.modelo_configuracion.serviciosOperaciones + '/AnexosAsunto/InsertarAnexoAsunto')
        .subscribe((response: any) => {
          this.consultarAnexos(this.tomanota);
        });

    }

    // borramos el array
    this.listaArchivosModal = [];
  }

  async consultarAnexos(tnota: any) {
    this.listaAnexosOtros = [];

    const params = {
      id_toma_nota: tnota,
      id_tramite: 26
    };
    await this.services.postAsync(params, this.modelo_configuracion.serviciosOperaciones + '/AnexosAsunto/ConsultarListaAnexo')
      .then((response: any) => {
        this.listaAnexosOtros = response.response;
      }, (error) => {
        this.listaAnexosOtros = [];
      });
  }

  async consultarAnexosEstatutos(tnota) {

    const params = {
      id_toma_nota: tnota,
      id_tramite: 25
    };
    await this.services.postAsync(params, this.modelo_configuracion.serviciosOperaciones + '/AnexosAsunto/ConsultarListaAnexo')
      .then((response: any) => {
        this.listaAnexos = response.response;
        if (this.listaAnexos.length == 0) {
          this.doctosCompletosEstatutos = false;
        } else {
          this.doctosCompletosEstatutos = true;
        }
      }, (error) => {
        this.listaAnexos = [];
      });
  }

  detalle(archivo: any, base64: string) {
    this.setIsLoading(true);

    if (base64 === undefined) {
      const params = {
        id_anexo: archivo.id_anexo,
        url_anexo: archivo.url_anexo
      };
      // Realizamos una petición para obtener el documento y lo mostramos en la modal.
      this.services
        .HttpPost(params, this.modelo_configuracion.serviciosOperaciones + '/AnexosAsunto/ConsultarDetalleAnexo').subscribe(
        (response: any) => {
          if (response) {
            const modalRef = this.modalService.open(ModuloVisorPdfComponent, {
              size: 'lg',
            });
            modalRef.componentInstance.src = response.response[0].base64_anexo;
            this.setIsLoading(false);
            return;
          }

          this.openMensajes('No se encontró el documento.', true);
          this.setIsLoading(false);
        },
        (error) => {
          this.openMensajes('No se encontró el documento.', true);
          this.setIsLoading(false);
        }
      );
    } else {
      const modalRef = this.modalService.open(ModuloVisorPdfComponent, { size: "lg", });
      modalRef.componentInstance.src = base64.split(",")[1];
      this.setIsLoading(false);
    }
  }

  setIsLoading(isLoading: boolean) {
    // this.is_loading.emit(isLoading);
  }


  openAdvertencia(archivo: any, index: number) {
    this.modalrefAdvertencia = this.modalService.open(
      ModuloModalAdvertenciaComponent,
      {
        ariaLabelledBy: 'modal-basic-title',
      }
    );
    this.modalrefAdvertencia.componentInstance.mensajeTitulo = 'Eliminación del Documento';
    this.modalrefAdvertencia.componentInstance.mensaje =
      '¿Está seguro que desea eliminar el documento?';
    this.modalrefAdvertencia.result.then((result) => {
      if (result) {

        if (archivo.base64 === undefined) {
          this.listArchivosDelete.push({
            id_anexo: archivo.id_anexo
          });
        }

        this.listaAnexosOtros.splice(index, 1);
        this.listaArchivosModal.splice(index, 1);

        //this.eliminarAnexo(archivo);
      }
    });
  }


  eliminarAnexo(archivo: any) {
    const params = {
      id_anexo: archivo.id_anexo
    };
    this.services
      .HttpPost(params, this.modelo_configuracion.serviciosOperaciones + '/AnexosAsunto/BorrarAnexoAsunto').subscribe(
        (response: any) => {
          if (response.response[0].proceso_exitoso === true) {
            /*this.openMensajes(
              'El documento se ha eliminado de forma exitosa.',
              false
            );*/
            this.setIsLoading(false);
            this.consultarAnexos(this.tomanota);
          }

        },
        (error) => {
          /*this.openMensajes(
            'El documento no se ha eliminado de forma exitosa, por favor intente de nuevo.',
            true
          );*/
        });
  }

  //#region multiarchivos


  //#region Eventos Fixed error
  private ejecutarLogicaVistaPrevia(): void {
    if (this.id_tramite > 0 && this.id_bloqueo == 1 && !this.esVistaPrevia) {
      this.esVistaPrevia = true;
      this.showPagination = true;
      this.tokenTramite = this.response.c_toma_nota;
      this.routes.push({ id: 1, text: 'Inicio', active: true });
      this.ShowMovimientos();
    }
  }

  private ParamFinalizar(): FinalizarTomaNota {
    const elemento = new FinalizarTomaNota();
    elemento.i_id_trtn = this.tomantram;
    elemento.s_id_us = this.us_id;
    elemento.b_estatutos = this.check1;
    elemento.b_denominacion = this.check4;
    elemento.b_miembros = this.check6;
    elemento.b_representante = this.check2;
    elemento.b_apoderado = this.check5;
    elemento.b_dom_legal = this.check7;
    elemento.b_dom_notificacion = this.check3;
    return elemento;
  }

  private async ObternerDatosBanderas() {
    await this.obtenerDomicilioNotificacionesBandera();
    await this.obtenerRepresentantesBandera();
    await this.obtenerRepresentanteLegalBandera();
    await this.obtenerApoderadoBandera();
    await this.obtenerDomicilioLegalBandera();
    await this.obtenerBanderasPrincipal();
  }

  private async obtenerBanderasPrincipal() {
    this.operacionRespuesta.EstaEjecutando = true;
    await this.services.getAsync(this.modelo_configuracion.serviciosOperaciones + '/ConsultaDetalleTomaNota/Get?i_id_c=null&&s_id_us=' + this.us_id + '&&id_tramite=' + this.id_tramite)
      .then(async (tempdate) => {
        if (tempdate) {
          this.response = tempdate.response[0] as ConsultaDetalleTomaNotaResponse;
          const modelRequestEst = new EditarDetalleTomaNotaRequest();
          const modelRequestDen = new EditarDetalleTomaNotaRequest();
          modelRequestEst.c_comentario = this.response.c_coment_est;
          modelRequestDen.c_denominacion = this.response.c_n_denom;
          this.check1 = modelRequestEst.c_comentario != '' ? true : false;
          this.check4 = modelRequestDen.c_denominacion != '' ? true : false;
        }
        this.operacionRespuesta.EstaEjecutando = false;
      });
  }

  private async obtenerRepresentanteLegalBandera() {
    this.operacionRespuesta.EstaEjecutando = true;
    await this.services.getAsync(this.modelo_configuracion.serviciosOperaciones + '/ConsultaDetalleTomaNotaRepresentanteLegal/Get?i_id_c=' + this.tomanota)
      .then(async (tempdate) => {
        this.operacionRespuesta.EstaEjecutando = false;
        if (tempdate) {
          this.check2 = true;
        }
      });
  }

  private async obtenerApoderadoBandera() {
    this.operacionRespuesta.EstaEjecutando = true;
    await this.services.getAsync(this.modelo_configuracion.serviciosOperaciones + '/ConsultaDetalleTomaNotaApoderado/Get?i_id_c=' + this.tomanota)
      .then(async (tempdate) => {
        if (tempdate) {
          this.response = tempdate.response[0];
          if (this.response) {
            this.check5 = true;
          }
        }
        this.operacionRespuesta.EstaEjecutando = false;
      });
  }

  private async obtenerDomicilioLegalBandera() {
    this.operacionRespuesta.EstaEjecutando = true;
    await this.services.getAsync(this.modelo_configuracion.serviciosOperaciones +
      '/ConsultaDetalleTomaNotaDomicilioLegal/Get?i_id_c=' +
      this.tomanota + '&&s_id_us=' + this.us_id + '&&c_id_trtn=' + this.tomantram + '&&c_tipo_domicilio=1')
      .then(async (tempdate) => {
        this.operacionRespuesta.EstaEjecutando = false;
        if (tempdate) {
          this.check7 = tempdate.response[0].c_cpostal_n != null ? true : false;
        }
      });
  }

  private async obtenerDomicilioNotificacionesBandera() {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services.getAsync(
      this.modelo_configuracion.serviciosOperaciones +
      '/ConsultaDetalleTomaNotaDomicilioLegal/Get?i_id_c=' +
      this.tomanota + '&&s_id_us=' + this.us_id + '&&c_id_trtn=' + this.tomantram + '&&c_tipo_domicilio=2'
    ).then((tempdate) => {
      this.operacionRespuesta.EstaEjecutando = false;
      if (tempdate) {
        this.check3 = tempdate.response[0].c_cpostal_n != null ? true : false;
      }
    });
  }

  setSentArch(file: SentFile): void {
    switch (file.tipo) {
      case 7:
        this.Representante_p_ine_exists = file.sent ? true : null;
        this.Representante_ineBase64 = file.sent ? file.base64 : null;
        break;
      case 8:
        this.Representante_p_acta_exists = file.sent ? true : null;
        this.Representante_actaBase64 = file.sent ? file.base64 : null;
        break;
      case 9:
        this.Representante_p_curp_exists = file.sent ? true : null;
        this.Representante_curpBase64 = file.sent ? file.base64 : null;
        break;
      case 14:
        this.escritosolicitud = file.sent ? true : null;
        this.escritosolicitudBase64 = file.sent ? file.base64 : null;
        break;
      case 19:
        this.certificadoregistro = file.sent ? true : false;
        this.certificadoregistroBase64 = file.sent ? file.base64 : null;
        break;
      case 20:
        this.estatutosnuevasolicitud = file.sent ? true : false;
        this.estatutosnuevasolicitudBase64 = file.sent ? file.base64 : null;
        break;
      case 22:
        this.altaapoderadodoc = file.sent ? true : null;
        this.altaapoderadodocBase64 = file.sent ? file.base64 : null;
        break;
      case 23:
        this.bajaapoderadodoc = file.sent ? true : null;
        this.bajaapoderadodocBase64 = file.sent ? file.base64 : null;
        break;
      case 24:
        this.cambioapoderadodoc = file.sent ? true : null;
        this.cambioapoderadodocBase64 = file.sent ? file.base64 : null;
        break;
      /*case 7:
      this.listrepresentante[file.indice].p_ine_exists = file.sent ? true : null;
      this.listArchivos[file.indice] = {
        ineBase64: file.sent ? file.base64 : null,
        actaBase64: (this.listArchivos.length > 0) ? (this.listArchivos[file.indice].actaBase64 ? this.listArchivos[file.indice].actaBase64 : null) : null,
        curpBase64: (this.listArchivos.length > 0) ? (this.listArchivos[file.indice].curpBase64 ? this.listArchivos[file.indice].curpBase64 : null) : null
      }
      //this.listArchivos[file.indice].ineBase64 = file.sent ? file.base64 : null;
      this.contador++;
      break;
    case 8:
      this.listrepresentante[file.indice].p_acta_exists = file.sent ? true : null;
      this.listArchivos[file.indice] = {
        ineBase64: (this.listArchivos.length > 0) ? (this.listArchivos[file.indice].ineBase64 ? this.listArchivos[file.indice].ineBase64 : null) : null,
        actaBase64: file.sent ? file.base64 : null,
        curpBase64: (this.listArchivos.length > 0) ? (this.listArchivos[file.indice].curpBase64 ? this.listArchivos[file.indice].curpBase64 : null) : null
      }
      //this.listArchivos[file.indice].actaBase64 = file.sent ? file.base64 : null;
      this.contador++;
      break;
    case 9:
      this.listrepresentante[file.indice].p_curp_exists = file.sent ? true : null;
      this.listArchivos[file.indice] = {
        ineBase64: (this.listArchivos.length > 0) ? (this.listArchivos[file.indice].ineBase64 == undefined ? null : this.listArchivos[file.indice].ineBase64) : null,
        actaBase64: (this.listArchivos.length > 0) ? (this.listArchivos[file.indice].actaBase64 ? this.listArchivos[file.indice].actaBase64 : null) : null,
        curpBase64: file.sent ? file.base64 : null
      }
      //this.listArchivos[file.indice].curpBase64 = file.sent ? file.base64 : null;
      this.contador++;
      break;*/
    }
  //public estatutosolicitudBase64: string = null;
  //public escriturapublicaBase64: string = null;
  }

  guardarAnexos(file: any) {
    for (let i = 0; i < file.length; i++ ) {
      if (file[i].base64 === undefined) {
        this.listArchivosDelete.push(file[i]);
      } else {
        this.listaArchivosModalEstatutos.push(file[i]);
      }
    }
  }

  guardarEscritura(file: any) {
    for (let i = 0; i < file.length; i++ ) {
      if (file[i].base64 === undefined) {
        this.listArchivosDelete.push(file[i]);
      } else {
        this.listaArchivosEscritura.push(file[i]);
      }
    }
  }

  public guardarArchivosEstatutos() {
    let i: number;
    for (i = 0; i < this.listaArchivosModalEstatutos.length; i++) {
      const formData: any = new FormData();
      formData.append('id_asunto', this.listaArchivosModalEstatutos[i].id_asunto);
      formData.append('nombre_anexo', this.listaArchivosModalEstatutos[i].nombre_anexo);
      formData.append('anexo', this.listaArchivosModalEstatutos[i].anexo);
      formData.append('extension', this.listaArchivosModalEstatutos[i].extension);
      formData.append('id_tramite', 25);

      this.services.HttpPostFile(formData, this.modelo_configuracion.serviciosOperaciones + '/AnexosAsunto/InsertarAnexoAsunto')
        .subscribe((response: any) => {
          this.consultarAnexos(this.tomanota);
        });

    }

    // borramos el array
    this.listaArchivosModalEstatutos = [];
  }

  public guardarArchivosEscritura() {
    let i: number;
    for (i = 0; i < this.listaArchivosEscritura.length; i++) {
      const formData: any = new FormData();
      formData.append('id_asunto', this.listaArchivosEscritura[i].id_asunto);
      formData.append('nombre_anexo', this.listaArchivosEscritura[i].nombre_anexo);
      formData.append('anexo', this.listaArchivosEscritura[i].anexo);
      formData.append('extension', this.listaArchivosEscritura[i].extension);
      formData.append('id_tramite', 21);

      this.services.HttpPostFile(formData, this.modelo_configuracion.serviciosOperaciones + '/AnexosAsunto/InsertarAnexoAsunto')
        .subscribe((response: any) => {
          this.consultarAnexos(this.tomanota);
        });

    }
    // borramos el array
    this.listaArchivosEscritura = [];
  }

  public async limpiarForms() {
    this.InicializarMov_Estatutos();
    this.InicializarMov_Denominacion();
    this.InicializarMov_DomicilioL();
    this.InicializarMov_Representante();
    this.InicializarMov_Apoderado();

    //Limpiar variable base64
    this.certificadoregistro = false;
    this.certificadoregistroBase64 = null;
    this.estatutosnuevasolicitud = false;
    this.estatutosnuevasolicitudBase64 = null;

    this.Representante_ineBase64 = null;
    this.Representante_actaBase64 = null;
    this.Representante_curpBase64 = null;

    this.altaapoderadodocBase64 = null;
    this.bajaapoderadodocBase64 = null;
    this.cambioapoderadodocBase64 = null;

  }

  //#endregion
}
