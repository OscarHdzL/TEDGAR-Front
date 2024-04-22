import { Component, OnInit, TemplateRef, ViewChild, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';;
import { CatalogoMediosTrasmision } from 'src/app/model/Catalogos/CatalogoMediosTransmision';
import { ThemeConstants } from '../../../@espire/shared/config/theme-constant';
import { AuthIdentity } from '../../../guards/AuthIdentity';
import { RespuestaGenerica } from '../../../model/Operaciones/generales/RespuestaGenerica';
import { ServiciosRutas } from '../../../model/Operaciones/generales/ServiciosRutas';
import { ServiceGenerico } from '../../../services/service-generico.service';
import { ModuloModalMensajeComponent } from '../../../shared/modulo-modal-mensaje/modulo-modal-mensaje.component';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { ActualizarEstatusTransmisionRequest, CatalogoFecha, RangoFrecuenciaHorario, TramiteTransmisionRequest, TramiteTransmisionResponse } from 'src/app/model/Operaciones/Transmisiones/Transmision';
import { DataTableDirective } from 'angular-datatables';
import { async, Subject } from 'rxjs';
import { ActosFechasHorariosRequest, ActosReligiosos, ActosReligiososRequest, EliminarFechasEmisorasRequest } from 'src/app/model/Operaciones/Transmisiones/ActosReligiosos';
import { CatalogoEstados } from 'src/app/model/Catalogos/CatalogoEstados';
import { FileService } from '../../../services/file.service';
import { SentFile } from '../../../model/Utilities/File';
import { Anexos } from '../../../model/Operaciones/Anexos/Anexos';

@Component({
  selector: 'app-modulo-solicitud-transmision',
  templateUrl: './modulo-solicitud-transmision.component.html',
  styleUrls: ['./modulo-solicitud-transmision.component.css'],
  providers: [ServiceGenerico]
})

export class ModuloSolicitudTransmisionComponent implements OnInit {

  @ViewChild("modalCargarDoc", { static: false }) modalCargarDoc: TemplateRef<any>;
  @ViewChild("modalMensajes", { static: false }) modalMensajes: TemplateRef<any>;
  @ViewChild("modalNuevoMedioTrans", { static: false }) modalNuevoMedioTrans: TemplateRef<any>;
  @ViewChild("modalNuevoHorario", { static: false }) modalNuevoHorario: TemplateRef<any>;
  modalrefMsg: NgbModalRef;

  public updateObserver$: EventEmitter<string>;

  formGroupDatosGenerales: FormGroup;
  formGroupActosReligiosos: FormGroup;
  formGroupMedioTransmision: FormGroup;
  formGroupHorario: FormGroup;
  formConsultaActosReligiosos: FormGroup;

  solicitudTrans: boolean = false;
  identificacion: boolean = false;

  b_nuevoActo: boolean = false;
  b_horarios: boolean = false;
  b_televisora: boolean;
  b_fechasRango: boolean = false;
  b_fechasFrecuencia: boolean = false;
  b_fechasCalendario: boolean = false;
  b_camposHabilitados: boolean = true;
  b_editar: boolean = false;

  //Catalogos
  lstTelevision: CatalogoMediosTrasmision[];
  lstRadio: CatalogoMediosTrasmision[];
  lstEstadosRep: CatalogoEstados[];

  //Temporales
  lstRangoHorario: Array<RangoFrecuenciaHorario> = [];
  lstFrecuenciaHorario: Array<RangoFrecuenciaHorario> = [];
  lstCalendarioHorario: Array<any> = [];
  lstMediosTransmision: Array<CatalogoMediosTrasmision> = [];

  //Consulta
  lstActosReligiosos: ActosReligiosos[] = [];
  lstActosFechasRangos: RangoFrecuenciaHorario[] = [];
  lstActosFechasFrecuencia: RangoFrecuenciaHorario[] = [];
  lstActosMedios: CatalogoMediosTrasmision[] = [];

  //Edición
  lstFechasEliminadas: Array<any> = [];
  lstMediosEliminados: Array<any> = [];

  //FechaMinima
  DateActual: any;
  puedeAgregarFecha: boolean = true;
  seleccionoFrecuenciaTodosLos?: boolean = null;
  // Anio
  ultimoAnioSeleccionado: number;

  us_id: number;
  i_id_transmision: number = 0;
  i_id_estatus: number = 0;
  i_id_acto: number = 0;
  operacionRespuesta: RespuestaGenerica;
  modelo_configuracion: ServiciosRutas;
  tieneDocCargados: boolean = false;

  isDictaminador: boolean = false;

  lstCatDias = [];
  lstCatMes = [];
  lstCatAnio = [];
  lstPeriodo = [];
  lstCatDiasBase = [];
  lstCatMesBase = [];
  argDiasSemana = [];

  dropdownSettings: IDropdownSettings = {};
  dropdownSettingsDias: IDropdownSettings = {};

  dtOptionsTel: DataTables.Settings = {};
  dtTriggerTel: Subject<any> = new Subject();
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  recordsTotal: number;

  dtOptionsRadio: DataTables.Settings = {};
  dtTriggerRadio: Subject<any> = new Subject();

  solicitudTransBase64: string = null;
  solicitudTransDelete: boolean = false;
  idOficioSolicitud: number = 0;

  public listaArchivosModal: Anexos[] = [];
  public listArchivosDelete = [];


  constructor(private services: ServiceGenerico,
    private _route: ActivatedRoute,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private themeConstants: ThemeConstants,
    private router: Router,
    public fileService: FileService) {
    this.operacionRespuesta = new RespuestaGenerica();
    this.modelo_configuracion = new ServiciosRutas();
    this.i_id_transmision = Number(this._route.snapshot.paramMap.get('transmision'));

    /*this.services.updateObserver$.subscribe(action => {
      if (action == 'actualizar') {
        this.obtenerMediosTransmision();
      }
    });*/
  }

  ngOnInit(): void {
    this.us_id = AuthIdentity.ObtenerUsuarioRegistro();
    this.isDictaminador = AuthIdentity.IsDictaminador();
    this.iniciarFechaCalendario();
    this.obtenerTramiteTransmision();
    this.inicializarFormDatosGenerales();
    this.inicializarFormActosReligiosos();
    this.inicializarActosReligiosos();
    this.inicializarFormHorario();
    this.obtenerCatFechas();
    this.initiAnioCat();
    this.obtenerMediosTransmision();
    this.inicializaTablaTelevision();
    this.inicializaTablaRadio();
  }

  iniciarFechaCalendario(): void {
    let fechaActual = new Date();
    this.DateActual = fechaActual.getFullYear() + '-' + ('0' + (fechaActual.getMonth() + 1)).slice(-2) + '-' + ('0' + fechaActual.getDate()).slice(-2);

  }

  inicializarFormDatosGenerales() {
    this.formGroupDatosGenerales = this.fb.group({
      rep_nombre_completo: [""],
      denominacion: [""],
      numero_sgar: [""],
      domicilio: ["", Validators.required],
      correo_electronico: ["", [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$")]],
      numero_tel: ["", [Validators.required, Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$")]]
    });
  }

  inicializarFormActosReligiosos() {
    this.formGroupActosReligiosos = this.fb.group({
      c_acto_religioso: ["", Validators.required],
    });

    this.lstRangoHorario = [];
    this.lstFrecuenciaHorario = [];
    this.lstMediosTransmision = [];
    this.lstFechasEliminadas = [];
    this.lstMediosEliminados = [];
  }

  inicializarActosReligiosos() {
    this.formConsultaActosReligiosos = this.fb.group({
      c_nombre: [""],
    });
  }

  inicializarFormMediosTransmision() {
    this.formGroupMedioTransmision = this.fb.group({
      frecuencia_canal: [""],
      proveedor: [""],
      televisora_radiodifusora: [""],
      lugar_transmision: ["", Validators.required],
      municipio: [""]
    });

    this.obtenerEstados();
  }

  inicializarFormHorario() {
    this.formGroupHorario = this.fb.group({
      c_fecha_inicio: [""],
      c_fecha_fin: [""],
      c_hora_inicio: [""],
      c_hora_fin: [""],
      i_id_cat_periodo: [""],
      cat_dia: [""],
      cat_mes: [""],
      cat_anio: [""]
    });

    this.formGroupHorario.controls['c_fecha_inicio'].setValue(this.DateActual);
    this.b_fechasRango = false;
    this.b_fechasFrecuencia = false;
    this.b_fechasCalendario = false;
    this.lstCalendarioHorario = [];
  }

  validarFechaActual(control: any, esFechaRango: false): void {
    const fecha = this.formGroupHorario.get(control.name).value;
    if (fecha !== "") {
      const fechaActual = new Date(new Date().toISOString().split("T")[0]);
      var mifechaSeleccionada = new Date(fecha);
      if (mifechaSeleccionada < fechaActual) {
        this.openMensajes(["La fecha es errónea, favor de seleccionar una fecha valida."], []);
        this.puedeAgregarFecha = false;
      } else {
        this.puedeAgregarFecha = true;
      }
    }

    if (esFechaRango) {
      const fechaInicio = this.formGroupHorario.get('c_fecha_inicio').value;
      const fechaFin = this.formGroupHorario.get('c_fecha_fin').value;
      if (fechaInicio !== "" && fechaFin !== "") {
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        if (fin < inicio) {
          this.openMensajes(["La fecha fin que selecciono debe ser mayor ala fecha inicio."], []);
          this.puedeAgregarFecha = false;
        } else {
          this.puedeAgregarFecha = true;
        }
      }
    }
  }

  inicializaTablaTelevision() {
    this.dtOptionsTel = this.themeConstants.dtOptions;
    this.dtTriggerTel = new Subject();
  }

  inicializaTablaRadio() {
    this.dtOptionsRadio = this.themeConstants.dtOptions;
    this.dtTriggerRadio = new Subject();
  }

  obtenerCatFechas() {
    this.dropdownSettings = {
      idField: 'i_id',
      textField: 'c_nombre',
      enableCheckAll: false,
    };

    this.lstCatDiasBase = [
      { i_id: 1, c_nombre: 'Lunes' },
      { i_id: 2, c_nombre: 'Martes' },
      { i_id: 3, c_nombre: 'Miércoles' },
      { i_id: 4, c_nombre: 'Jueves' },
      { i_id: 5, c_nombre: 'Viernes' },
      { i_id: 6, c_nombre: 'Sábado' },
      { i_id: 7, c_nombre: 'Domingo' }
    ];

    this.lstCatMesBase = [
      { i_id: 1, c_nombre: 'Enero' },
      { i_id: 2, c_nombre: 'Febrero' },
      { i_id: 3, c_nombre: 'Marzo' },
      { i_id: 4, c_nombre: 'Abril' },
      { i_id: 5, c_nombre: 'Mayo' },
      { i_id: 6, c_nombre: 'Junio' },
      { i_id: 7, c_nombre: 'Julio' },
      { i_id: 8, c_nombre: 'Agosto' },
      { i_id: 9, c_nombre: 'Septiembre' },
      { i_id: 10, c_nombre: 'Octubre' },
      { i_id: 11, c_nombre: 'Noviembre' },
      { i_id: 12, c_nombre: 'Diciembre' }
    ];

    this.argDiasSemana = [
      { valorDia: 1, i_id: 1, nombre: 'Lunes' },
      { valorDia: 2, i_id: 2, nombre: 'Martes' },
      { valorDia: 3, i_id: 3, nombre: 'Miércoles' },
      { valorDia: 4, i_id: 4, nombre: 'Jueves' },
      { valorDia: 5, i_id: 5, nombre: 'Viernes' },
      { valorDia: 6, i_id: 6, nombre: 'Sábado' },
      { valorDia: 0, i_id: 7, nombre: 'Domingo' },
    ];

    this.lstPeriodo = [
      { i_id: 1, c_nombre: 'Todos los' },
      { i_id: 2, c_nombre: 'Diario' }
    ];
  }

  initiAnioCat(): void {
    let anioActual = new Date().getFullYear();
    let anioSeguiente = anioActual + 1;
    this.lstCatAnio = [
      { i_id: 1, c_nombre: `${anioActual}` },
      { i_id: 2, c_nombre: `${anioSeguiente}` }
    ];
  }

  SeleccionoMeses(anio: any): void {

    let anioActual = new Date().getFullYear();
    this.ultimoAnioSeleccionado = Number(anio.c_nombre);
    if (Number(anio.c_nombre) > anioActual) {
      this.lstCatMes = [];
      this.lstCatMes = this.lstCatMesBase;
    } else {
      this.lstCatMes = [];
      let mesActual = new Date().getMonth() + 1;
      for (var index = mesActual; index <= 12; index++) {

        let mes = this.lstCatMesBase.find(f => f.i_id === index);

        if (mes != undefined || mes != null) {
          this.lstCatMes.push(mes);
        }
      }
    }
  }

  SeleccionioDias(dias: any): void {
    let fechaActual = new Date();
    if (dias.i_id > fechaActual.getMonth() + 1 || this.ultimoAnioSeleccionado > fechaActual.getFullYear()) {
      this.lstCatDias = [];
      this.lstCatDias = this.lstCatDiasBase;
    } else {
      this.lstCatDias = [];
      let diasDelMes = this.ObtenerDiasMes(fechaActual.getFullYear(), dias.i_id);
      let ultimosSieteDias = (diasDelMes - 7);
      let diaIniciar = (fechaActual.getDate() > ultimosSieteDias) ? fechaActual.getDate() : (ultimosSieteDias + 1);
      for (var index = diaIniciar; index <= diasDelMes; index++) {
        let fecha = new Date(`${fechaActual.getFullYear()}-${dias.i_id}-${index}`);
        let existeDia = this.argDiasSemana.find(f => f.valorDia == fecha.getDay());
        let yaSeAgregoDia = this.lstCatDias.find(f => f.i_id === existeDia.i_id);

        if (existeDia && (yaSeAgregoDia === undefined || yaSeAgregoDia === null)) {
          this.lstCatDias.push({ i_id: existeDia.i_id, c_nombre: existeDia.nombre });
        }
      }

      let ordernarDias = this.lstCatDias.sort((first, second) => 0 - (first.i_id > second.i_id ? -1 : 1));

    }

  }

  actulizarMeses(anio: any): void {
    let fechaActual = new Date();
    if (anio) {
      let i_id = (anio.i_id - 1);
      let anioAnterior = (Number(anio.c_nombre) - 1);
      if (anioAnterior >= fechaActual.getFullYear()) {
        this.SeleccionoMeses({ i_id: i_id, c_nombre: `${anioAnterior}` });
      } else if (anioAnterior < fechaActual.getFullYear()) {
        this.lstCatMes = [];
      }
    }
  }

  actulizarDias(dias: any): void {
    let fechaActual = new Date();
    if (dias) {
      let mesAnterior = (Number(dias.i_id) - 1)
      if ((mesAnterior > 0 && mesAnterior >= fechaActual.getMonth() + 1) || this.ultimoAnioSeleccionado > fechaActual.getFullYear()) {
        this.SeleccionioDias({ i_id: mesAnterior, c_nombre: '' });
      } else if (mesAnterior < fechaActual.getMonth() + 1) {
        this.lstCatDias = [];
      }
    }
  }

  private ObtenerDiasMes(anio: number, mes: number) {
    return new Date(anio, mes, 0).getDate();
  }

  obtenerEstados() {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpGet(
        this.modelo_configuracion.serviciosOperaciones +
        "/ConsultaEstados/Get")
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.lstEstadosRep = tempdate.response;
          } else {
            this.openMensajes(["No se pudo realizar la acción"], []);
          }
          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.operacionRespuesta.EstaEjecutando = false;
        }
      );
  }

  obtenerTramiteTransmision() {
    this.us_id = this.isDictaminador ? 0 : this.us_id; //SE AGREGA PARA QUE NO VALIDE USUARIO Y SE OBTENGA INFO
    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpGet(
        this.modelo_configuracion.serviciosOperaciones +
        // '/ConsultaDetalleTramiteTransmision/Get?i_id_transmision=0' +'&s_id_us=' + this.us_id)
        '/ConsultaDetalleTramiteTransmision/Get?i_id_transmision=' + this.i_id_transmision + '&s_id_us=' + this.us_id)
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            let modeloTramite = tempdate.response[0];
            this.formGroupDatosGenerales.patchValue(modeloTramite);
            this.i_id_transmision = modeloTramite.i_id_tbl_transmision;
            this.i_id_estatus = modeloTramite.estatus;
            this.identificacion = (modeloTramite.b_identificacion == 0 || modeloTramite.b_identificacion == null ? false : true);
            this.solicitudTrans = (modeloTramite.b_solicitudTrans == 0 || modeloTramite.b_solicitudTrans == null ? false : true);
            this.idOficioSolicitud = modeloTramite.b_solicitudTrans;
            this.deshabilitarCampos(modeloTramite)
            if (this.i_id_transmision !== 0) {
              this.obtenerActosReligiosos();
              this.consultarListArchivosTransmision();
            }
          } else {
            this.openMensajes(["No se pudo realizar la acción"], []);
          }
          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.operacionRespuesta.EstaEjecutando = false;
        }
      );
  }

  obtenerMediosTransmision() {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpGet(
        this.modelo_configuracion.serviciosCatalogos +
        "/CatalogoMediosTransmision/Get")
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            var lstMedios = tempdate.response;
            this.lstTelevision = lstMedios.filter(function (item) {
              return item.televisora == true;
            });

            this.lstRadio = lstMedios.filter(function (item) {
              return item.televisora == false;
            });

          } else {
            this.lstTelevision = [];
            this.lstRadio = [];
          }
          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.operacionRespuesta.EstaEjecutando = false;
        }
      );
  }

  obtenerActosReligiosos() {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpGet(this.modelo_configuracion.serviciosOperaciones +
        "/ConsultaActosReligiosos/GetActosReligiosos?i_id_transmision=" + this.i_id_transmision)
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.lstActosReligiosos = tempdate.response;

            this.lstActosReligiosos.forEach(element => {
              element.ruta = '#panel-' + element.i_id_acto;
            });
          } else {
            this.openMensajes(["No se pudo realizar la acción"], []);
          }
          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.operacionRespuesta.EstaEjecutando = false;
        }
      );
  }

  obtenerActosMediosTransmision(idActo: number, nombreActo?: string) {
    this.operacionRespuesta.EstaEjecutando = true;

    this.lstActosMedios = [];
    this.lstActosFechasRangos = [];
    this.lstActosFechasFrecuencia = [];

    this.formConsultaActosReligiosos.get('c_nombre').setValue(nombreActo);

    this.services
      .HttpGet(this.modelo_configuracion.serviciosOperaciones +
        "/ConsultaActosReligiosos/GetActosMediosTransmision?i_id_acto_religioso=" + idActo)
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.lstActosMedios = tempdate.response;
            this.lstMediosTransmision = this.lstActosMedios;
            this.obtenerActosFechas(idActo);
          } else {
            this.openMensajes(["No se pudo realizar la acción"], []);
          }
          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.operacionRespuesta.EstaEjecutando = false;
        }
      );
  }

  obtenerActosFechas(idActo: number) {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpGet(this.modelo_configuracion.serviciosOperaciones +
        "/ConsultaActosReligiosos/GetActosFechas?i_id_acto_religioso=" + idActo)
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            var lstActosFechas = tempdate.response;

            for (let i = 0; i < lstActosFechas.length; i++) {
              lstActosFechas[i].cat_dia = this.convertirStringObjet(lstActosFechas[i].cat_dia)
              lstActosFechas[i].cat_mes = this.convertirStringObjet(lstActosFechas[i].cat_mes)
              lstActosFechas[i].cat_anio = this.convertirStringObjet(lstActosFechas[i].cat_anio)
            }

            this.lstActosFechasRangos = lstActosFechas.filter(function (item) {
              return (item.i_id_cat_periodo == null || item.i_id_cat_periodo == 0);
            });

            this.lstRangoHorario = this.lstActosFechasRangos;

            this.lstActosFechasFrecuencia = lstActosFechas.filter(function (item) {
              return (item.i_id_cat_periodo != null && item.i_id_cat_periodo != 0);
            });

            this.lstFrecuenciaHorario = this.lstActosFechasFrecuencia;

          } else {
            this.openMensajes(["No se pudo realizar la acción"], []);
          }
          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.operacionRespuesta.EstaEjecutando = false;
        }
      );
  }


  async obtenerModelActoReligioso() {
    let emisorasActos: Array<CatalogoMediosTrasmision> = [];

    if (this.lstMediosTransmision.length > 0) {
      this.lstMediosTransmision.forEach(item => {
        if (item.i_id_emisora == 0 || item.i_id_emisora == undefined) {
          emisorasActos.push(item);
        }
      });
    }

    let fechasHorario: Array<ActosFechasHorariosRequest> = [];
    if (this.lstRangoHorario.length > 0) {
      this.lstRangoHorario.forEach(item => {
        if (item.i_id == 0 || item.i_id == undefined) {
          fechasHorario.push(item);
        }
      });

      fechasHorario.forEach(item => {
        item.i_id_tbl_acto_religioso = 0;
        item.i_id_cat_periodo = 0;
      });
    }

    let dias: any = '';
    let mes: any = '';
    let anio: any = '';
    if (this.lstFrecuenciaHorario.length > 0) {
      this.lstFrecuenciaHorario.forEach(item => {
        if (item.i_id == 0 || item.i_id == undefined) {
          item.i_id_cat_periodo = Number(item.i_id_cat_periodo);

          for (let i of item.cat_dia) {
            var str1 = new String(i.i_id + ',');
            dias = str1.concat(dias);
            item.cat_dia = dias.substring(0, dias.length - 1);
          }

          for (let i of item.cat_mes) {
            var str1 = new String(i.i_id + ',');
            mes = str1.concat(mes);
            item.cat_mes = mes.substring(0, mes.length - 1);
          }

          for (let i of item.cat_anio) {
            var str1 = new String(i.i_id + ',');
            anio = str1.concat(anio);
            item.cat_anio = anio.substring(0, anio.length - 1);
          }

          fechasHorario.push(item);

          dias = '';
          mes = '';
          anio = '';
        }
      });
    }

    let guardarActoModel: ActosReligiososRequest = {
      i_id_tbl_transmision: this.i_id_transmision,
      i_id_acto: this.i_id_acto,
      c_nombre: this.formGroupActosReligiosos.get('c_acto_religioso').value,
      cat_Emisoras: emisorasActos, //mediosTransmision.substring(0, mediosTransmision.length - 1),
      cat_FechasHorario: fechasHorario,
    };

    if (this.b_editar === true) {
      let modelEliminar: EliminarFechasEmisorasRequest;

      this.lstMediosEliminados.forEach(emisora => {
        modelEliminar = {
          id_tipo: 1,
          i_id_entidad: emisora
        }
        this.eliminarFechasEmisoras(modelEliminar);
      });

      this.lstFechasEliminadas.forEach(fecha => {
        modelEliminar = {
          id_tipo: 2,
          i_id_entidad: fecha
        }
        this.eliminarFechasEmisoras(modelEliminar);
      });

    }

    if (this.i_id_transmision == 0) {
      this.guardarTramiteTransmision(guardarActoModel);
    } else {
      this.guardarActoReligioso(guardarActoModel);
    }

  }

  guardarActoReligioso(model: ActosReligiososRequest) {
    this.operacionRespuesta.EstaEjecutando = true;
    model.i_id_tbl_transmision = this.i_id_transmision;
    this.services
      .HttpPost(
        model,
        this.modelo_configuracion.serviciosOperaciones +
        "/InsertarTransmisionActosReligiosos/Post")
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.obtenerActosReligiosos();
          } else {
            this.openMensajes(["No se pudo realizar la acción"], []);
          }

          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.openMensajes(["No se pudo realizar la acción"], []);
          this.operacionRespuesta.EstaEjecutando = false;
        }
      );

    this.b_nuevoActo = false;
  }

  guardarTramiteTransmision(guardarActoModel?: ActosReligiososRequest) {
    this.operacionRespuesta.EstaEjecutando = true;
    let modelTranmision = this.formGroupDatosGenerales.value as TramiteTransmisionRequest;
    modelTranmision.id_transmision = this.i_id_transmision;
    modelTranmision.id_usuario = this.us_id;
    this.services
      .HttpPost(
        modelTranmision,
        this.modelo_configuracion.serviciosOperaciones +
        "/InsertarTramiteTransmision/Post")
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.i_id_transmision = tempdate.response[0].i_id_transmision;
            if (guardarActoModel !== undefined) {
              this.guardarActoReligioso(guardarActoModel);
            } else {
              //this.router.navigate(['/tramites-electronicos']);
              if (this.isDictaminador) {
                this.openMensajes([], ['Se ha guardado correctamente la información']);
                this.router.navigate(['/registros-transmision-dictaminador']);
              } else {
                this.router.navigate(['/registros-transmision']);
              }
            }

          } else {
            this.openMensajes(["No se pudo realizar la acción"], []);
          }

          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.openMensajes(["No se pudo realizar la acción"], []);
          this.operacionRespuesta.EstaEjecutando = false;
        }
      );
  }

  async enviarTramiteTransmision() {

    await this.consultarListArchivosTransmision();

    /*if (!this.tieneDocCargados) {
        this.openMensajes(["No se pudo realizar la acción, aun no tiene toda la documentación cargada."], []);
        this.operacionRespuesta.EstaEjecutando = false;
        return;
    }*/

    this.operacionRespuesta.EstaEjecutando = true;
    let modelTranmision = this.formGroupDatosGenerales.value as TramiteTransmisionRequest;
    modelTranmision.id_transmision = this.i_id_transmision;
    this.services
      .HttpPost(
        modelTranmision,
        this.modelo_configuracion.serviciosOperaciones +
        "/InsertarTramiteTransmision/Post")
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            //this.i_id_transmision = tempdate.response[0].i_id_transmision;
            /** */

            const estatus = (this.i_id_estatus === 31 ? 30 : 35);
            let modelActualizarEstatusTransmision: ActualizarEstatusTransmisionRequest = {
              i_id_transmision: this.i_id_transmision,
              i_id_estatus: Number(estatus) //REGISTRADA
            };
            this.services
              .HttpPost(
                modelActualizarEstatusTransmision,
                this.modelo_configuracion.serviciosOperaciones +
                "/ActualizarEstatusTransmision/Post")
              .subscribe(async (tempdate) => {
                if (tempdate) {
                  this.openMensajes([], tempdate.response[0].mensaje);
                  setTimeout(() => {
                    this.router.navigate(['/tramites-electronicos']);
                  }, 1000);

                } else {
                  this.openMensajes(["No se pudo realizar la acción"], []);
                }
                this.operacionRespuesta.EstaEjecutando = false;
              });

            /** */

          } else {
            this.openMensajes(["No se pudo realizar la acción"], []);
          }

          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.openMensajes(["No se pudo realizar la acción"], []);
          this.operacionRespuesta.EstaEjecutando = false;
        }
      );
  }

  agregarMediosTransmision() {
    let modelEmisoras: CatalogoMediosTrasmision = this.formGroupMedioTransmision.value;
    modelEmisoras.b_televisora = this.b_televisora;
    const idEstado = Number(this.formGroupMedioTransmision.get('lugar_transmision').value)

    this.lstEstadosRep.filter(function (item) {
      if (Number(item.idEstado) === idEstado) {
        modelEmisoras.lugar_transmision = item.nombre
        modelEmisoras.i_id_estado = Number(idEstado);
      }
    });

    if (modelEmisoras.municipio !== "" && modelEmisoras.municipio.length > 0) {
      modelEmisoras.lugar_transmision += `, ${modelEmisoras.municipio}`;
    } else {
      modelEmisoras.municipio = null;
    }

    this.lstMediosTransmision.push(modelEmisoras);
    const modalref = this.modalService.dismissAll(this.modalNuevoMedioTrans);
  }

  eliminarMediosTransmision(elemento: number, idElemento?: number) {
    this.lstMediosTransmision.splice(elemento, 1);
    if (idElemento != undefined) {
      this.lstMediosEliminados.push(idElemento);
    }
  }

  guardarMedioTransmision() {
    this.operacionRespuesta.EstaEjecutando = true;
    const modalref = this.modalService.dismissAll(this.modalNuevoMedioTrans);

    const tablaRender: any = (this.b_televisora == true ? 'this.dtOptionsTel' : 'this.dtOptionsRadio');

    let medioTransmision = new CatalogoMediosTrasmision();
    medioTransmision = this.formGroupMedioTransmision.value;
    medioTransmision.b_televisora = this.b_televisora;
    medioTransmision.i_id_estado = Number(this.formGroupMedioTransmision.get('lugar_transmision').value);
    this.services.HttpPost(medioTransmision, this.modelo_configuracion.serviciosCatalogos + "/CatalogoMediosTransmision/Post")
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.obtenerMediosTransmision();
          } else {
            this.openMensajes(["No se pudo realizar la acción"], []);
          }
          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.openMensajes(["No se pudo realizar la acción"], []);
          this.operacionRespuesta.EstaEjecutando = false;
        }
      );
  }

  async eliminarFechasEmisoras(model: EliminarFechasEmisorasRequest) {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpPost(
        model,
        this.modelo_configuracion.serviciosOperaciones +
        "/EliminarFechasEmisoras/Post")
      .subscribe(
        (tempdate) => {
          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.openMensajes(["No se pudo realizar la acción"], []);
          this.operacionRespuesta.EstaEjecutando = false;
        }
      );
  }

  agregarHorario() {
    this.modalService.dismissAll(this.modalNuevoHorario);

    let rangoFrecuenciaHorario = new RangoFrecuenciaHorario();
    rangoFrecuenciaHorario = this.formGroupHorario.value;

    if (this.b_fechasRango) {
      this.lstRangoHorario.push(rangoFrecuenciaHorario);
    }

    if (this.b_fechasFrecuencia) {
      this.lstPeriodo.filter(function (item) {
        if (Number(item.i_id) === Number(rangoFrecuenciaHorario.i_id_cat_periodo)) {
          rangoFrecuenciaHorario.c_periodo = item.c_nombre
        }
      });

      this.lstFrecuenciaHorario.push(rangoFrecuenciaHorario);
    }

    if (this.b_fechasCalendario) {
      this.lstCalendarioHorario.forEach(element => {
        let agregarFecha = {
          c_fecha_inicio: element,
          c_hora_inicio: this.formGroupHorario.get('c_hora_inicio').value,
          c_hora_fin: this.formGroupHorario.get('c_hora_fin').value
        };

        this.lstRangoHorario.push(agregarFecha);
      });

    }
  }

  async editarActo(id_acto: number, nombre_acto: string) {
    this.b_nuevoActo = true;
    this.b_editar = true;
    this.i_id_acto = id_acto;
    this.lstFechasEliminadas = [];
    this.lstMediosEliminados = [];
    this.formGroupActosReligiosos.get('c_acto_religioso').setValue(nombre_acto);
    await this.obtenerActosMediosTransmision(id_acto);
  }

  eliminarHorario(tipo: number, elemento: number, idElemento: number) {
    if (tipo == 1) {
      this.lstRangoHorario.splice(elemento, 1);
    } else {
      this.lstFrecuenciaHorario.splice(elemento, 1);
    }

    if (idElemento != undefined) {
      this.lstFechasEliminadas.push(idElemento)
    }
  }

  eliminarFecha(elemento: number) {
    this.lstCalendarioHorario.splice(elemento, 1);
  }

  agregarFecha(): void {
    let fecha = this.formGroupHorario.get('c_fecha_inicio').value;
    if (fecha) {
      this.lstCalendarioHorario.push(fecha);
    }

  }
  onChange(valor) {
    console.log(valor)
    this.b_fechasRango = (valor.value == 1 ? true : false);
    this.b_fechasFrecuencia = (valor.value == 2 ? true : false);
    this.b_fechasCalendario = (valor.value == 3 ? true : false);

    if (this.b_fechasRango) {
      this.formGroupHorario.controls['c_fecha_inicio'].setValidators([Validators.required]);
      this.formGroupHorario.controls['c_hora_inicio'].setValidators([Validators.required]);
      this.formGroupHorario.controls['c_hora_fin'].setValidators([Validators.required]);

      this.formGroupHorario.controls['c_fecha_fin'].setValidators([]);
      this.formGroupHorario.controls['i_id_cat_periodo'].setValidators([]);
      this.formGroupHorario.controls['cat_dia'].setValidators([]);
      this.formGroupHorario.controls['cat_mes'].setValidators([]);
      this.formGroupHorario.controls['cat_anio'].setValidators([]);

    }

    if (this.b_fechasFrecuencia) {
      this.formGroupHorario.controls['i_id_cat_periodo'].setValidators([Validators.required]);
      this.formGroupHorario.controls['c_hora_inicio'].setValidators([Validators.required]);
      this.formGroupHorario.controls['c_hora_fin'].setValidators([Validators.required]);
      this.formGroupHorario.controls['cat_anio'].setValidators([Validators.required]);
      this.formGroupHorario.controls['cat_mes'].setValidators([Validators.required]);

      this.formGroupHorario.controls['cat_dia'].setValidators([]);
      this.formGroupHorario.controls['c_fecha_inicio'].setValidators([]);
      this.formGroupHorario.controls['c_fecha_fin'].setValidators([]);
    }

    if (this.b_fechasCalendario) {
      this.formGroupHorario.controls['c_fecha_inicio'].setValidators([Validators.required]);
      this.formGroupHorario.controls['c_hora_inicio'].setValidators([Validators.required]);
      this.formGroupHorario.controls['c_hora_fin'].setValidators([Validators.required]);

      this.formGroupHorario.controls['c_fecha_fin'].setValidators([]);
      this.formGroupHorario.controls['i_id_cat_periodo'].setValidators([]);
      this.formGroupHorario.controls['cat_dia'].setValidators([]);
      this.formGroupHorario.controls['cat_mes'].setValidators([]);
      this.formGroupHorario.controls['cat_anio'].setValidators([]);
    }

    this.formGroupHorario.controls['c_fecha_inicio'].updateValueAndValidity();
    this.formGroupHorario.controls['c_hora_inicio'].updateValueAndValidity();
    this.formGroupHorario.controls['c_hora_fin'].updateValueAndValidity();
    this.formGroupHorario.controls['c_fecha_fin'].updateValueAndValidity();
    this.formGroupHorario.controls['i_id_cat_periodo'].updateValueAndValidity();
    this.formGroupHorario.controls['cat_dia'].updateValueAndValidity();
    this.formGroupHorario.controls['cat_mes'].updateValueAndValidity();
    this.formGroupHorario.controls['cat_anio'].updateValueAndValidity();
  }

  abrirFormActoReligioso() {
    this.inicializarFormActosReligiosos();
    this.b_nuevoActo = true;
    this.i_id_acto = 0;
  }

  cerrarFormActoReligioso() {
    this.b_nuevoActo = false;
  }

  abrirModalAgregarHorario() {
    this.inicializarFormHorario();
    const modalref = this.modalService.open(this.modalNuevoHorario, { ariaLabelledBy: 'modal-basic-title', size: 'lg' });
  }

  async abrirModalCargarDoc() {
    this.solicitudTransDelete = false;
    this.obtenerTramiteTransmision();
    this.listaArchivosModal = [];
    this.listArchivosDelete = [];
    const modalref = await this.modalService.open(this.modalCargarDoc, { ariaLabelledBy: 'modal-basic-title' });
    await modalref.result.then(async respuesta => { },
      resultado => {
        this.obtenerTramiteTransmision();
      });
  }

  abrirModalMensajes() {
    const modalref = this.modalService.open(this.modalMensajes, { ariaLabelledBy: 'modal-basic-title' });
  }

  abrirModalNuevoMedioTrans(tipo: number) {
    this.inicializarFormMediosTransmision();
    this.b_televisora = (tipo == 1 ? true : false);
    const modalref = this.modalService.open(this.modalNuevoMedioTrans, { ariaLabelledBy: 'modal-basic-title' });
  }

  convertirStringObjet(item: string) {
    var arrayJson: Array<CatalogoFecha> = [];
    arrayJson = JSON.parse(item);
    return arrayJson;
  }

  deshabilitarCampos(model: TramiteTransmisionResponse) {
    this.b_camposHabilitados = (model.estatus != 31 ? false : true);
  }

  setIsLoadingArchivo(is_loading: boolean): void {
    this.operacionRespuesta.EstaEjecutando = is_loading;
  }

  openMensajes(Errores: string[], Mensajes: string[]) {
    this.modalrefMsg = this.modalService.open(ModuloModalMensajeComponent, {
      ariaLabelledBy: "modal-basic-title",
    });
    this.modalrefMsg.componentInstance.mensajesError = [];
    this.modalrefMsg.componentInstance.mensajesExito = [];
    this.modalrefMsg.componentInstance.mensajesTitulo = "Solicitud Enviada";
    if (Errores?.length > 0) {
      this.modalrefMsg.componentInstance.showErrors = true;
      this.modalrefMsg.componentInstance.mensajesError.push(Errores);
    }
    if (Mensajes?.length > 0) {
      this.modalrefMsg.componentInstance.showExitos = true;
      this.modalrefMsg.componentInstance.mensajesExito.push(Mensajes);
    }
  }

  async consultarListArchivosTransmision() {
    this.operacionRespuesta.EstaEjecutando = true;
    await this.services.getAsync(`${this.modelo_configuracion.serviciosOperaciones}/ConsultaListaArchivos/Get?transmisionId=${this.i_id_transmision}`)
      .then(async (respuesta: any) => {
        this.operacionRespuesta.EstaEjecutando = false;
        if (respuesta) {
          if (respuesta.response[0].cantidadArchivos >= 2) {
            this.tieneDocCargados = true;
          }
        }
      }).catch(async error => {
        this.operacionRespuesta.EstaEjecutando = false;
      });
  }

  seleccionoTipoPeriodo(valor: any): void {

    if (valor !== "" && valor === "1") {
      this.seleccionoFrecuenciaTodosLos = true;
      this.limpiarControlCat_Dia();
    } else {
      this.seleccionoFrecuenciaTodosLos = false;
      this.formGroupHorario.controls.cat_dia.setValue([{ i_id: "", c_nombre: "" }]);
      this.limpiarControlCat_Dia(true);
    }

    if (this.seleccionoFrecuenciaTodosLos) {
      this.formGroupHorario.controls['cat_dia'].setValidators([Validators.required]);
    } else {
      this.formGroupHorario.controls['cat_dia'].setValidators([]);
    }
    this.formGroupHorario.controls['cat_dia'].updateValueAndValidity();

  }

  limpiarControlCat_Dia(esDiario: boolean = false): void {
    const miElementos = (this.formGroupHorario.controls.cat_dia as FormArray);

    if (miElementos.value.length > 0) {
      const totalElementos = miElementos.value.length;
      for (let index = 0; index <= totalElementos; index++) {
        miElementos.value.splice(index);
      }
    }

    if (esDiario) {
      this.lstCatDiasBase.forEach(dia => miElementos.value.push(dia));
    }
  }

  setSentArch(file: SentFile): void {
    this.solicitudTransDelete = file.base64 == undefined ? true : false;
    this.solicitudTrans = file.sent ? true : null;
    this.solicitudTransBase64 = file.sent ? file.base64 : null;
  }

  public guardarArchivos() {
    let i: number;
    for (i = 0; i < this.listaArchivosModal.length; i++) {
      const formData: any = new FormData();
      formData.append('id_asunto', this.listaArchivosModal[i].id_asunto);
      formData.append('nombre_anexo', this.listaArchivosModal[i].nombre_anexo);
      formData.append('anexo', this.listaArchivosModal[i].anexo);
      formData.append('extension', this.listaArchivosModal[i].extension);
      formData.append('id_tramite', 27);

      this.services.HttpPostFile(formData, this.modelo_configuracion.serviciosOperaciones + '/AnexosAsunto/InsertarAnexoAsunto')
        .subscribe((response: any) => {
          this.consultarListArchivosTransmision();
        });

    }
    this.listaArchivosModal = [];
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
            this.consultarListArchivosTransmision();
          }

        },
        (error) => {
          /*this.openMensajes(
            'El documento no se ha eliminado de forma exitosa, por favor intente de nuevo.',
            true
          );*/
        });

    this.listArchivosDelete = [];
  }

  async guardarAnexos() {

    this.modalService.dismissAll();

    this.guardarArchivos();

    if (this.listArchivosDelete.length > 0) {
      for (let i = 0; i < this.listArchivosDelete.length; i++) {
        this.eliminarAnexo(this.listArchivosDelete[i]);
      }
    }

    if (this.solicitudTransDelete) {
      this.eliminar();
    }

    if (this.solicitudTransBase64 !== null) {
      await this.fileService.cargarArchivo(this.i_id_transmision, this.solicitudTransBase64, 28);
    }
  }

  guardarAnexosIne(file: any) {
    for (let i = 0; i < file.length; i++) {
      if (file[i].base64 === undefined) {
        this.listArchivosDelete.push(file[i]);
      } else {
        this.listaArchivosModal.push(file[i]);
      }
    }
  }

  irPaginaPrincipal() {
    this.modalService.dismissAll();
    if (this.isDictaminador) {
      this.router.navigate(['/registros-transmision-dictaminador']);
    } else {
      this.router.navigate(['/registros-transmision']);
    }
  }

  async eliminar() {
    const params = {
      id: this.i_id_transmision,
      idArchivoTramite: 28,
    };

    this.services.HttpPost(params, this.modelo_configuracion.serviciosOperaciones + "/BorraArchivo/Post").subscribe((response: any) => {
      if (response) {
        if (response.response.proceso_exitoso == true) {
        }
      }
    },
      (error) => {
        this.openMensajes(['El documento no se ha eliminado de forma exitosa, por favor intente de nuevo.'], []);
      }
    );
  }


}
