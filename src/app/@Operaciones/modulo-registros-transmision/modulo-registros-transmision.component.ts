import { TemplateRef, ViewChild } from "@angular/core";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { DataTableDirective } from "angular-datatables";
import { Subject } from "rxjs";
import { ThemeConstants } from "../../@espire/shared/config/theme-constant";
import { AuthIdentity } from "src/app/guards/AuthIdentity";
import { CatalogoEstados } from "../../model/Catalogos/CatalogoEstados";
import { CatalogoMunicipio } from "../../model/Catalogos/CatalogoMunicipio";
import { ConsultaListaCatalogoCredoResponse } from "../../model/Catalogos/CatalogosCredo";
import { RespuestaGenerica } from "../../model/Operaciones/generales/RespuestaGenerica";
import { ServiciosRutas } from "../../model/Operaciones/generales/ServiciosRutas";
import {
  DatosReporteRequest,
  DatosReporteTramiteResponse,
} from "../../model/Operaciones/reportes/ReportesRegistro";
import { ServiceGenerico } from "../../services/service-generico.service";
import { CatalogoEstatus } from "../../model/Catalogos/CatalogoEstatus";
import { formatDate } from "@angular/common";
import {
  CanActivate,
  Router,
  ActivatedRoute,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
} from "@angular/router";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { LocalStorageService } from "../../services/local-storage.service";
import { transformDateForSorting } from "src/app/model/Operaciones/generales/SortDateDataTable";

const EXCEL_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=UTF-8";
const EXCEL_EXT = ".xlsx";

@Component({
  selector: "app-modulo-registros-transmision",
  templateUrl: "./modulo-registros-transmision.component.html",
  styleUrls: ["./modulo-registros-transmision.component.css"],
  providers: [ServiceGenerico],
})
/** modulo-reporte-transmision component*/
export class ModuloRegistrosTransmisionComponent implements OnInit {
  /** modulo-reporte-transmision ctor */

  //public formLogin: FormGroup;
  dtOptions: DataTables.Settings = {};
  /*modal: NgbModalRef;*/
  dtTrigger: Subject<any> = new Subject();

  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  isDtInitialized: boolean = false;

  public mensajeEliminar: string;
  public visibleExecel: boolean;
  public listRegistros: Array<DatosReporteTramiteResponse> = [];
  public operacionRespuesta: RespuestaGenerica;
  public formFiltros: FormGroup;
  private servicios: ServiciosRutas;
  public selectCatEstatus: CatalogoEstatus[];
  public selectCatEstados: CatalogoEstados[];

  public idUsuario: number;
  private id_bloqueo: number;
  private id_tramite: number;
  public selectCatMunicipio: CatalogoMunicipio[];
  public selectCatCredo: ConsultaListaCatalogoCredoResponse[];
  routeUrl: string;
  tipoTramite: number;
  id_transmision_global: number;
  public titulo: string;
  public nombreReporte: string;

  @ViewChild("contentReporte", { static: false })
  ModalLimpiarReporte: TemplateRef<any>;
  @ViewChild("confirmarEliminar", { static: false })
  ModalConfirmacion: TemplateRef<any>;

  constructor(
    private services: ServiceGenerico,
    private themeConstants: ThemeConstants,
    private modalService: NgbModal,
    private router: Router,
    private localStorageService: LocalStorageService,
    private translate: TranslateService,
    private form: FormBuilder,
    private _route: ActivatedRoute
  ) {
    this.themeConstants = new ThemeConstants(translate);
    this.operacionRespuesta = new RespuestaGenerica();
    this.servicios = new ServiciosRutas();
    this.routeUrl = this._route.snapshot.routeConfig.path;
    //this.initControlForm();
  }

  ngOnInit(): void {
    this.idUsuario = AuthIdentity.ObtenerUsuarioRegistro();
    this.tipoTramite = 3;
    this.inicializatabla();
    this.cargarCatalogoEstatus();
    this.initControlForm();
    this.ConsultaDatos();
  }

  inicializatabla() {
    let label_export_excel: string = "excel";

    let dom: string = "Bfrtip";
    let buttons: object = {
      buttons: [
        {
          extend: "excel",
          className: "btn btn-primary",
          text: label_export_excel,
        },
      ],
      dom: {
        button: {
          className: "btn",
        },
      },
    };
    this.dtOptions = {
      ...this.themeConstants.dtOptions,
      dom: dom,
      buttons: buttons,
      columnDefs: [
        {
          targets: [4,5], // Esto apunta a las columnas de fecha
          render: (data: any, type: any, row: any, meta: any) =>
            transformDateForSorting(data, type),
        },
      ],
    } as DataTables.Settings;
    this.dtOptions.search = false;
    this.dtOptions.searching = false;
    this.dtOptions.info = false;
    this.dtOptions.ordering = true;
    this.dtOptions.scrollX = true;
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

  public ConsultaDatos(): void {
    this.operacionRespuesta.EstaEjecutando = true;

    const params = {
      id_usuario: this.idUsuario,
      representante_desc: this.formFiltros.get("representante").value,
      numero_sgar_desc: this.formFiltros.get("nombre").value,
      estatus_desc: this.formFiltros.get("estatus").value,
      denominacion_desc: this.formFiltros.get("denominacion").value,
    };
    this.services
      .HttpPost(
        params,
        `${this.servicios.serviciosOperaciones}/ConsultaListaRegistrosTransmision/ConsultaListaRegistrosTransmision`
      )
      .subscribe(
        (response: any) => {
          this.operacionRespuesta.EstaEjecutando = false;
          this.listRegistros = response.response;
          this.renderTabla();
          this.visibleExecel = true;

          if (response.mensaje != null) {
            this.operacionRespuesta.EsMsjError = true;
            this.operacionRespuesta.Msj = response.response.mensaje;
          }
        },
        (error) => {
          this.operacionRespuesta.EstaEjecutando = false;
          this.operacionRespuesta.EsMsjError = false;
          this.operacionRespuesta.Msj = error.response[0];
        }
      );
  }

  public consultadatosinicial(): void {
    this.operacionRespuesta.EstaEjecutando = true;

    const params = {
      id_usuario: this.idUsuario,
      representante: null,
      nombre: null,
      estatus: null,
      denominacion: null,
    };

    this.services
      .HttpPost(
        params,
        `${this.servicios.serviciosOperaciones}/ConsultaListaRegistrosTransmision/ConsultaListaRegistrosTransmision`
      )
      .subscribe(
        (response: any) => {
          this.operacionRespuesta.EstaEjecutando = false;

          this.listRegistros = response.response;
          this.renderTabla();

          if (response.mensaje != null) {
            this.operacionRespuesta.EsMsjError = true;
            this.operacionRespuesta.Msj = response.response.mensaje;
          }
        },
        (error) => {
          this.operacionRespuesta.EstaEjecutando = false;
          this.operacionRespuesta.EsMsjError = false;
          this.operacionRespuesta.Msj = error.response[0];
        }
      );
  }

  private initControlForm(): void {
    this.formFiltros = this.form.group({
      nombre: ["", null],
      denominacion: ["", null],
      representante: ["", null],
      estatus: [null, null],
    });
  }

  cargarCatalogoEstados(): void {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpGet(`${this.servicios.serviciosOperaciones}/ConsultaEstados/Get`)
      .subscribe(
        (response: any) => {
          this.operacionRespuesta.EstaEjecutando = false;
          this.selectCatEstados = response.response as CatalogoEstados[];
        },
        (error) => {
          this.operacionRespuesta.EstaEjecutando = false;
          this.operacionRespuesta.EsMsjError = false;
        }
      );
  }

  private cargarCatalogoEstatus(): void {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpGet(
        `${this.servicios.serviciosOperaciones}/ConsultaEstatusRegistro/Get?tipotramite=${this.tipoTramite}`
      )
      .subscribe(
        (response: any) => {
          this.operacionRespuesta.EstaEjecutando = false;
          this.selectCatEstatus = response.response as CatalogoEstados[];
        },
        (error) => {
          this.operacionRespuesta.EstaEjecutando = false;
          this.operacionRespuesta.EsMsjError = false;
        }
      );
  }

  limpiarReporte() {
    this.formFiltros = this.form.group({
      nombre: ["", null],
      denominacion: ["", null],
      representante: ["", null],
      estatus: [null, null],
    });
    this.modalService.dismissAll();
    this.consultadatosinicial();
  }

  eliminarTransmision(id_transmision: number) {
    this.operacionRespuesta.EstaEjecutando = true;

    const params = {
      id_transmision: id_transmision,
    };

    this.services
      .HttpPost(
        params,
        `${this.servicios.serviciosOperaciones}/EliminarRegistroTransmision/EliminarRegistro`
      )
      .subscribe(
        (response: any) => {
          this.operacionRespuesta.EstaEjecutando = false;

          this.mensajeEliminar = response.response.mensaje;
          this.renderTabla();
          this.ConsultaDatos();
          this.modalService.dismissAll();
          if (response.mensaje != null) {
            this.operacionRespuesta.EsMsjError = true;
            this.operacionRespuesta.Msj = response.response.mensaje;
          }
        },
        (error) => {
          this.operacionRespuesta.EstaEjecutando = false;
          this.operacionRespuesta.EsMsjError = false;
          this.operacionRespuesta.Msj = error.response[0];
        }
      );
  }

  mandarModificacion(id_transmision: number) {
    this.router.navigate(["/solicitud-transmision/" + id_transmision]);
  }

  mandarNotificaciones(id_transmision: number) {
    this.router.navigate(["/consulta-transmision-Id/" + id_transmision]);
  }

  mandarVerDetalle(id_transmision: number) {
    this.router.navigate(["/consulta-transmision/" + id_transmision]);
  }

  mandarNuevoRegistro() {
    this.router.navigate(["/solicitud-transmision/"]);
  }

  openlimpiarReporte() {
    const modalref = this.modalService.open(this.ModalLimpiarReporte, {
      ariaLabelledBy: "modal-basic-title",
      backdrop: "static",
    });
  }

  openConfirmacion(id_transmision: number) {
    this.id_transmision_global = id_transmision;

    const modalref = this.modalService.open(this.ModalConfirmacion, {
      ariaLabelledBy: "modal-basic-title",
      backdrop: "static",
    });
  }
}
