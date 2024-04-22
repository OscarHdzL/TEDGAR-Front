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
import { DatosReporteRequest } from "../../model/Operaciones/reportes/ReportesRegistro";
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
  selector: "app-modulo-registros-tramite",
  templateUrl: "./modulo-registros-tramite.component.html",
  styleUrls: ["./modulo-registros-tramite.component.css"],
  providers: [ServiceGenerico],
})
/** modulo-reporte-registro component*/
export class ModuloRegistrosTramiteComponent implements OnInit {
  /** modulo-reporte-registro ctor */

  //public formLogin: FormGroup;
  dtOptions: DataTables.Settings = {};
  /*modal: NgbModalRef;*/
  dtTrigger: Subject<any> = new Subject();

  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  isDtInitialized: boolean = false;

  public mensajeEliminar: string;
  public visibleExecel: boolean;
  public listRegistros: Array<DatosReporteRequest> = [];
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
  id_tramite_global: number;
  public titulo: string;
  public nombreReporte: string;

  @ViewChild("contentReporte", { static: false })
  ModalLimpiarReporte: TemplateRef<any>;
  @ViewChild("confirmarEliminar", { static: false })
  ModalConfirmacion: TemplateRef<any>;
  @ViewChild("modalExito", { static: false }) ModalExito: TemplateRef<any>;

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
  }

  ngOnInit(): void {
    this.idUsuario = AuthIdentity.ObtenerUsuarioRegistro();
    this.tipoTramite = 1;
    this.inicializatabla();
    this.cargarCatalogoEstados();
    this.obtenerCredo();
    this.cargarCatalogoEstatus();
    this.consultadatosinicial();
    this.initControlForm();
  }

  inicializatabla() {
    this.dtOptions = {
      ...this.themeConstants.dtOptions,
      columnDefs: [
        {
          targets: [3, 5], // Esto apunta a las columnas de fecha
          render: (data: any, type: any, row: any, meta: any) =>
            transformDateForSorting(data, type),
        },
      ],
    };

    this.dtTrigger = new Subject();
    this.dtOptions.search = false;
    this.dtOptions.searching = false;
    this.dtOptions.info = false;
    this.dtOptions.ordering = true;
    this.dtOptions.scrollX = true;
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
      credo_desc: this.formFiltros.get("credo").value,
      numero_sgar: this.formFiltros.get("folio").value,
      estatus_desc: this.formFiltros.get("estatus").value,
      denominacion_desc: this.formFiltros.get("denominacion").value,
    };
    this.services
      .HttpPost(
        params,
        `${this.servicios.serviciosOperaciones}/ConsultaListaRegistrosTramite/ConsultaListaRegistrosTramite`
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
      credo: null,
      folio: null,
      estatus: null,
      denominacion: null,
    };

    this.services
      .HttpPost(
        params,
        `${this.servicios.serviciosOperaciones}/ConsultaListaRegistrosTramite/ConsultaListaRegistrosTramite`
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
      folio: ["", null],
      denominacion: ["", null],
      credo: [null, null],
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

  public cargarCatalogoMunicipio(): void {
    var idEstado = this.formFiltros.get("entidadregistro").value;
    this.operacionRespuesta.EstaEjecutando = true;
    if (idEstado != "") {
      this.services
        .HttpGet(
          `${this.servicios.serviciosOperaciones}/ConsultaMunicipios/Get?idestadoreporte=${idEstado}`
        )
        .subscribe(
          (response: any) => {
            this.operacionRespuesta.EstaEjecutando = false;
            if (response.mensaje == null) {
              this.selectCatMunicipio =
                response.response as CatalogoMunicipio[];
            }
            if (response.mensaje != null) {
              this.selectCatMunicipio = null;
            }
          },
          (error) => {
            this.operacionRespuesta.EstaEjecutando = false;
            this.operacionRespuesta.EsMsjError = false;
          }
        );
    }
    if (idEstado == "") {
      this.selectCatMunicipio = null;
    }
  }

  obtenerCredo() {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpGet(
        this.servicios.serviciosCatalogos +
          "/ConsultaListaCatalogosCredo/Get?Activos=" +
          true
      )
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.selectCatCredo = [] =
              tempdate.response as ConsultaListaCatalogoCredoResponse[];
          } else {
            this.selectCatCredo = [];
          }
          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.operacionRespuesta.EstaEjecutando = false;
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
      folio: ["", null],
      denominacion: ["", null],
      credo: [null, null],
      estatus: [null, null],
    });
    this.modalService.dismissAll();
    this.consultadatosinicial();
  }

  eliminarTramite(id_tramite: number) {
    this.operacionRespuesta.EstaEjecutando = true;

    const params = {
      id_tramite: id_tramite,
    };

    this.services
      .HttpPost(
        params,
        `${this.servicios.serviciosOperaciones}/EliminarRegistroTramite/EliminarRegistro`
      )
      .subscribe(
        (response: any) => {
          this.operacionRespuesta.EstaEjecutando = false;

          this.mensajeEliminar = response.response.mensaje;
          this.renderTabla();
          this.ConsultaDatos();
          this.modalService.dismissAll();
          const modalref = this.modalService.open(this.ModalExito, {
            ariaLabelledBy: "modal-basic-title",
            backdrop: "static",
          });
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

  mandarModificacion(reporte: any) {
    localStorage.setItem("solicitudregistroconsulta", null);
    localStorage.setItem("id_tramite", String(reporte.id_registro));
    if (
      reporte.id_estatus === 8 ||
      reporte.id_estatus === 15 ||
      reporte.id_estatus === 17
    ) {
      localStorage.setItem("ultimoPasoLlenado", "6");
    } else {
      localStorage.setItem("ultimoPasoLlenado", reporte.estatus.split(" ")[2]);
    }
    this.router.navigate(["alta-solicitud-registro"]);
    // this.router.navigate(['/solicitudregistro/' + id_tramite]);
  }

  mandarVerDetalle(tramite: any) {
    localStorage.setItem("solicitudregistroconsulta", null);
    // console.log(tramite.estatus.split(" ")[2])
    let ultimoPaso = tramite.estatus.split(" ")[2];

    if (!ultimoPaso || ultimoPaso.length > 1) {
      ultimoPaso = 6;
    }

    const params = {
      idbloqueo: 1,
    };
    if (tramite.id_registro) {
      this.localStorageService.setJsonValue(
        "solicitudregistroconsulta",
        params
      );
      localStorage.setItem("solicitudregistroconsulta", "1");
    } else {
      this.localStorageService.setJsonValue("solicitudregistro", []);
    }

    localStorage.setItem("id_tramite", String(tramite.id_registro));
    localStorage.setItem("ultimoPasoLlenado", ultimoPaso);
    this.router.navigate(["alta-solicitud-registro"]);
    // this.router.navigate(['/solicitudregistro/' + id_tramite]);
  }
  mandarNotificaciones(id_tramite: number) {
    const params = {
      idbloqueo: 0,
    };
    if (id_tramite) {
      this.localStorageService.setJsonValue(
        "solicitudregistroconsulta",
        params
      );
      localStorage.setItem("solicitudregistroconsulta", "0");
    } else {
      this.localStorageService.setJsonValue("solicitudregistro", []);
    }
    this.router.navigate(["/consulta-registro-tramite/" + id_tramite]);
  }

  mandarNuevoRegistro() {
    localStorage.setItem("solicitudregistroconsulta", "0");
    this.router.navigate(["/solicitudregistro/" + 0]);
  }

  openlimpiarReporte() {
    const modalref = this.modalService.open(this.ModalLimpiarReporte, {
      ariaLabelledBy: "modal-basic-title",
      backdrop: "static",
    });
  }

  openConfirmacion(id_tramite: number) {
    this.id_tramite_global = id_tramite;

    const modalref = this.modalService.open(this.ModalConfirmacion, {
      ariaLabelledBy: "modal-basic-title",
      backdrop: "static",
    });
  }

  public async irA(ruta: string, ultimoPasoLlenado: any) {
    localStorage.setItem("ultimoPasoLlenado", String(ultimoPasoLlenado));
    localStorage.setItem("id_tramite", String(0));
    this.router.navigate([ruta]);
  }
}
