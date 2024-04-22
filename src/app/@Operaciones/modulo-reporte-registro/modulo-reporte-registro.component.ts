import { TemplateRef, ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { ThemeConstants } from '../../@espire/shared/config/theme-constant';
import { CatalogoEstados } from '../../model/Catalogos/CatalogoEstados';
import { CatalogoMunicipio } from '../../model/Catalogos/CatalogoMunicipio';
import { ConsultaListaCatalogoCredoResponse } from '../../model/Catalogos/CatalogosCredo';
import { RespuestaGenerica } from '../../model/Operaciones/generales/RespuestaGenerica';
import { ServiciosRutas } from '../../model/Operaciones/generales/ServiciosRutas';
import { DatosReporteRequest, DatosReporteTnotaResponse } from '../../model/Operaciones/reportes/ReportesRegistro';
import { ServiceGenerico } from '../../services/service-generico.service';
import { CatalogoEstatus } from '../../model/Catalogos/CatalogoEstatus';
import { formatDate } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

const EXCEL_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=UTF-8';
const EXCEL_EXT = '.xlsx';

@Component({
    selector: 'app-modulo-reporte-registro',
    templateUrl: './modulo-reporte-registro.component.html',
  styleUrls: ['./modulo-reporte-registro.component.css'],
  providers: [ServiceGenerico]
})
/** modulo-reporte-registro component*/
export class ModuloReporteRegistroComponent implements OnInit {
  /** modulo-reporte-registro ctor */

  //public formLogin: FormGroup;
  dtOptions: DataTables.Settings = {};
  /*modal: NgbModalRef;*/
  dtTrigger: Subject<any> = new Subject();

  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  isDtInitialized: boolean = false;

  public visibleExecel: boolean;
  public listRegistros: Array<DatosReporteRequest> = [];
  public listRegistrosTnota: Array<DatosReporteTnotaResponse> = [];
  public operacionRespuesta: RespuestaGenerica;
  public formFiltros: FormGroup;
  private servicios: ServiciosRutas;
  public selectCatEstatus: CatalogoEstatus[];
  public selectCatEstados: CatalogoEstados[];
  public selectCatMunicipio: CatalogoMunicipio[];
  public selectCatCredo: ConsultaListaCatalogoCredoResponse[];
  public selectCatMovRealizado: Array<any>[];
  routeUrl: string;
  tipoTramite: number;
  public titulo: string;
  public nombreReporte: string;
  @ViewChild("contentReporte", { static: false }) ModalLimpiarReporte: TemplateRef<any>;
  servicioNombre: string;

  constructor(private services: ServiceGenerico,
    private themeConstants: ThemeConstants,
    private modalService: NgbModal,
    private translate: TranslateService,
    private form: FormBuilder, private _route: ActivatedRoute) {
    this.themeConstants = new ThemeConstants(translate);
    this.operacionRespuesta = new RespuestaGenerica();
    this.servicios = new ServiciosRutas();
    this.routeUrl = this._route.snapshot.routeConfig.path;
        //this.initControlForm();
  }

  ngOnInit(): void {

    if (this.routeUrl.includes('reporte-registro')) {
      this.tipoTramite = 1;
      this.titulo = 'Reportes registro';
      this.nombreReporte = "Reporte_Registro";
      this.servicioNombre = "ConsultarReporte";
    } else if (this.routeUrl.includes('reporte-toma-nota')) {
      this.tipoTramite = 2;
      this.titulo = 'Reportes toma de nota';
      this.nombreReporte = "Reporte_Toma_Nota";
      this.servicioNombre = "ConsultarReporteTnota";
    }
    this.inicializatabla();
    this.cargarCatalogoEstados();
    this.obtenerCredo();
    this.obtenerMovRealizados();
    this.cargarCatalogoEstatus();
    this.consultadatosinicial();
    this.initControlForm();
  }

  inicializatabla() {

    // let label_export_excel: string = 'excel';

    // let dom: string = 'Bfrtip';
    // let buttons: object = {
    //   buttons: [
    //     {
    //       extend: 'excel',
    //       className: 'btn btn-primary',
    //       text: label_export_excel
    //     }
    //   ],
    //   dom: {
    //     button: {
    //       className: 'btn'
    //     }
    //   }
    // };
    // this.dtOptions = { ...this.themeConstants.dtOptions, dom: dom, buttons: buttons } as DataTables.Settings;
    // this.dtOptions.search = false;
    // this.dtOptions.searching = false;
    // this.dtOptions.info = false;
    // this.dtOptions.ordering = false;
    // this.dtTrigger = new Subject();

    this.dtOptions = this.themeConstants.dtOptions;
    this.dtTrigger = new Subject();

    this.dtOptions.search = false;
    this.dtOptions.searching = false;
  }

  //modalmostrar(modaltemplate) {
  //  this.modal = this.modalservice.open(modaltemplate);
  //}

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
      entidadregistro: this.formFiltros.get('entidadregistro').value,
      credoregistro: this.formFiltros.get('credoregistro').value,
      movRealizado: this.formFiltros.get('movRealizado').value,
      municipioregistro: this.formFiltros.get('municipioregistro').value,
      estatusregistro: this.formFiltros.get('estatusregistro').value,
      fechai: (this.formFiltros.get('fechai').value == 'null' || this.formFiltros.get('fechai').value == undefined || this.formFiltros.get('fechai').value == '') ? null : this.formFiltros.get('fechai').value,
      fechaf: (this.formFiltros.get('fechaf').value == 'null' || this.formFiltros.get('fechaf').value == undefined || this.formFiltros.get('fechaf').value == '') ? null : this.formFiltros.get('fechaf').value,
      ttramite: this.tipoTramite,
    }

    this.services.HttpPost(params, `${this.servicios.serviciosOperaciones}/Reporte/` + this.servicioNombre)
      .subscribe((response: any) => {
        this.operacionRespuesta.EstaEjecutando = false;

        this.listRegistros = response.response;
        this.renderTabla();

        if (response.response.length > 0) {
          this.visibleExecel = true;
        }

        if (response.response.length <= 0) {
          this.visibleExecel = false;
        }

        if (response.mensaje != null) {
          this.operacionRespuesta.EsMsjError = true;
          this.operacionRespuesta.Msj = response.response.mensaje;
        }

      }, (error) => {
        this.operacionRespuesta.EstaEjecutando = false;
        this.operacionRespuesta.EsMsjError = false;
        this.operacionRespuesta.Msj = error.response[0]
      });
  }

  public consultadatosinicial(): void {

    this.operacionRespuesta.EstaEjecutando = true;
    const params = {
      entidadregistro: 0,
      credoregistro: 0,
      movRealizado: 0,
      municipioregistro: 0,
      estatusregistro: 0,
      fechai: null,
      fechaf: null,
      ttramite: this.tipoTramite
    }
    this.services.HttpPost(params, `${this.servicios.serviciosOperaciones}/Reporte/` + this.servicioNombre)
      .subscribe((response: any) => {
        this.operacionRespuesta.EstaEjecutando = false;

        this.listRegistros = response.response;
        this.renderTabla();

        if (response.response.length > 0) {
          this.visibleExecel = true;
        }

        if (response.response.length <= 0) {
          this.visibleExecel = false;
        }

        if (response.mensaje != null) {
          this.operacionRespuesta.EsMsjError = true;
          this.operacionRespuesta.Msj = response.response.mensaje;
        }

      }, (error) => {
        this.operacionRespuesta.EstaEjecutando = false;
        this.operacionRespuesta.EsMsjError = false;
        this.operacionRespuesta.Msj = error.response[0]
      });

  }

  private initControlForm(): void {

    this.formFiltros = this.form.group({
      entidadregistro: ['0', null],
      credoregistro: ['0', null],
      movRealizado: ['0', null],
      municipioregistro: ['0', null],
      estatusregistro: ['0', null],
      fechai: ['null', null],
      fechaf: ['null', null]
    });
  }

  cargarCatalogoEstados(): void {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpGet(`${this.servicios.serviciosOperaciones}/ConsultaEstados/Get`).subscribe(
        (response: any) => {
          this.operacionRespuesta.EstaEjecutando = false;
          this.selectCatEstados = response.response as CatalogoEstados[];
        },
        (error) => {
          this.operacionRespuesta.EstaEjecutando = false;
          this.operacionRespuesta.EsMsjError = false;
        });
  }

  public cargarCatalogoMunicipio(): void {
    var idEstado = this.formFiltros.get('entidadregistro').value;
    this.operacionRespuesta.EstaEjecutando = true;
    if (idEstado != "") {
      this.services
        .HttpGet(`${this.servicios.serviciosOperaciones}/ConsultaMunicipios/Get?idestadoreporte=${idEstado}`).subscribe(
          (response: any) => {
            this.operacionRespuesta.EstaEjecutando = false;
            if (response.mensaje == null) {
              this.selectCatMunicipio = response.response as CatalogoMunicipio[];
            }
            if (response.mensaje != null) {
              this.selectCatMunicipio = null;
            }


          },
          (error) => {
            this.operacionRespuesta.EstaEjecutando = false;
            this.operacionRespuesta.EsMsjError = false;
          });
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

  obtenerMovRealizados() {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpGet(
        this.servicios.serviciosCatalogos +
        "/ConsultaListaCatalogosMovRealizados/Get?Activos=" +
        true
      )
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.selectCatMovRealizado = [] = tempdate.response as any[];
          } else {
            this.selectCatMovRealizado = [];
          }
          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.operacionRespuesta.EstaEjecutando = false;
        }
      );
  }

  private cargarCatalogoEstatus(): void {
  //.HttpGet(`${this.servicios.serviciosOperaciones}/ConsultaEstatus/Get`).subscribe(
    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpGet(`${this.servicios.serviciosCatalogos}/CatalogosTramiteDeclaratoria/GetEstatusReporte?p_tipo_tramite=` + this.tipoTramite).subscribe(
        (response: any) => {
          this.operacionRespuesta.EstaEjecutando = false;
          this.selectCatEstatus = response.response //as CatalogoEstados[];
        },
        (error) => {
          this.operacionRespuesta.EstaEjecutando = false;
          this.operacionRespuesta.EsMsjError = false;
        });
  }

  exportToExcel(json: any[], excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const workbook: XLSX.WorkBook = {
      Sheets: { 'data': worksheet },
      SheetNames: ['data']
    };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcel(excelBuffer, excelFileName);
  }

  private saveAsExcel(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXT)
  }

  exportAsXLSX(): void {
    this.exportToExcel(this.listRegistros, this.nombreReporte);
  }

  limpiarReporte() {
    this.formFiltros = this.form.group({
      entidadregistro: ['0', null],
      credoregistro: ['0', null],
      movRealizado: ['0', null],
      municipioregistro: ['0', null],
      estatusregistro: ['0', null],
      fechai: ['null', null],
      fechaf: ['null', null]
    });
    this.modalService.dismissAll();
    this.consultadatosinicial();
  }

  openlimpiarReporte() {
    const modalref = this.modalService.open(this.ModalLimpiarReporte, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
  }

}
