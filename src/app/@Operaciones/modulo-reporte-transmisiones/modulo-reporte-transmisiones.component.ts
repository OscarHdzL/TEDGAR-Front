import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { ThemeConstants } from '../../@espire/shared/config/theme-constant';
import { RespuestaGenerica } from '../../model/Operaciones/generales/RespuestaGenerica';
import { ServiciosRutas } from '../../model/Operaciones/generales/ServiciosRutas';
import { ServiceGenerico } from '../../services/service-generico.service';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { ReporteTransmisionDatosResponse, ReporteTransmisionEstatusResponse, ReporteTransmisionMedioResponse } from '../../model/Operaciones/reportes/ReporteTransmision';
const EXCEL_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=UTF-8';
const EXCEL_EXT = '.xlsx';
@Component({
  selector: 'app-modulo-reporte-transmisiones',
  templateUrl: './modulo-reporte-transmisiones.component.html',
  styleUrls: ['./modulo-reporte-transmisiones.component.css'],
  providers: [ServiceGenerico]

})
export class ModuloReporteTransmisionesComponent implements OnInit {

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();

  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  isDtInitialized: boolean = false;

  public visibleExecel: boolean;
  public listRegistros: Array<ReporteTransmisionDatosResponse> = [];
  public operacionRespuesta: RespuestaGenerica;
  public formFiltros: FormGroup;
  private servicios: ServiciosRutas;
  public selectCatEstatus: ReporteTransmisionEstatusResponse[];
  public selectMedioComunicacion: ReporteTransmisionMedioResponse[]=[];
  public titulo: string;
  public nombreReporte: string = 'Reporte de transmisiones';
  @ViewChild("contentReporte", { static: false }) ModalLimpiarReporte: TemplateRef<any>;

  
  //#region inicializar componente
  constructor(private services: ServiceGenerico,
    private themeConstants: ThemeConstants,
    private modalService: NgbModal,
    private translate: TranslateService,
    private form: FormBuilder, private _route: ActivatedRoute) {
    this.themeConstants = new ThemeConstants(translate);
    this.operacionRespuesta = new RespuestaGenerica();
    this.servicios = new ServiciosRutas();
  }

  ngOnInit(): void {    
    this.inicializatabla();
    this.cargarCatalogoEstatus();
    this.consultadatosinicial();
    this.initControlForm();
    this.selectMedioComunicacion.push({medio_nombre:'Radio'},{medio_nombre:'Televisión'},{medio_nombre:'Ambas'})
  }
  //#region inicializa vista
  private initControlForm(): void {
    this.formFiltros = this.form.group({
      medioComunicacion: [null],
      estatusTransmision: [null],
      denominacion: [null],
      actoReligioso: [null],
      fechai: ['null', null],
      fechaf: ['null', null]
    });
  }

  inicializatabla() {
    let label_export_excel: string = 'excel';
    let dom: string = 'Bfrtip';
    let buttons: object = {
      buttons: [
        {
          extend: 'excel',
          className: 'btn btn-primary',
          text: label_export_excel
        }
      ],
      dom: {
        button: {
          className: 'btn'
        }
      }
    };
    this.dtOptions = { ...this.themeConstants.dtOptions, dom: dom, buttons: buttons } as DataTables.Settings;
    this.dtOptions.search = false;
    this.dtOptions.searching = false;
    this.dtOptions.info = false;
    this.dtOptions.ordering = false;
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
  private cargarCatalogoEstatus(): void {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpGet(`${this.servicios.serviciosOperaciones}/ReporteTransmision/ConsultarFiltrosEstatusTransmision`).subscribe(
        (response: any) => {
          this.operacionRespuesta.EstaEjecutando = false;
          this.selectCatEstatus = response.response as ReporteTransmisionEstatusResponse[];
        },
        (error) => {
          this.operacionRespuesta.EstaEjecutando = false;
          this.operacionRespuesta.EsMsjError = false;
        });
  }
  //#endregion

  //#endregion


  public ConsultaDatos(): void {
    this.operacionRespuesta.EstaEjecutando = true;
    const params = {
      medio_comunicacion: this.formFiltros.get('medioComunicacion').value,
      estatus_transmision: this.formFiltros.get('estatusTransmision').value,
      denominacion: this.formFiltros.get('denominacion').value,
      acto_religioso: this.formFiltros.get('actoReligioso').value,
      fecha_inicio: (this.formFiltros.get('fechai').value == 'null' || this.formFiltros.get('fechai').value == undefined || this.formFiltros.get('fechai').value == '') ? null : this.formFiltros.get('fechai').value,
      fecha_fin: (this.formFiltros.get('fechaf').value == 'null' || this.formFiltros.get('fechaf').value == undefined || this.formFiltros.get('fechaf').value == '') ? null : this.formFiltros.get('fechaf').value,
    }
    params.medio_comunicacion = params.medio_comunicacion == 'Ambas'? null:params.medio_comunicacion;
    params.medio_comunicacion = params.medio_comunicacion == '0'? null:params.medio_comunicacion;
    params.estatus_transmision = params.estatus_transmision == '0'? null:params.estatus_transmision;    

    this.services.HttpPost(params, `${this.servicios.serviciosOperaciones}/ReporteTransmision/ConsultarReporteTransmision`)
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
      this.operacionRespuesta.Msj = error.response[0];
    });

  }

  public consultadatosinicial(): void {
    this.operacionRespuesta.EstaEjecutando = true;
    const params = {
      medio_comunicacion: null,
      estatus_transmision: null,
      denominacion: null,
      acto_religioso: null,
      fecha_inicio: null,
      fecha_fin: null,
    }
    this.services.HttpPost(params, `${this.servicios.serviciosOperaciones}/ReporteTransmision/ConsultarReporteTransmision`)
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
        this.operacionRespuesta.Msj = error.response[0];
      });

  }


  //#region misc reporte
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
      medioComunicacion: [null],
      estatusTransmision: [null],
      denominacion: [null],
      actoReligioso: [null],
      fechai: ['null', null],
      fechaf: ['null', null]
    });
    this.modalService.dismissAll();
    this.consultadatosinicial();
  }

  openlimpiarReporte() {
    const modalref = this.modalService.open(this.ModalLimpiarReporte, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
  }
  //#endregion


}
