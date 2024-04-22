import { TemplateRef, ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { ThemeConstants } from '../../@espire/shared/config/theme-constant';
import { AuthIdentity } from "src/app/guards/AuthIdentity";
import { CatalogoEstados } from '../../model/Catalogos/CatalogoEstados';
import { CatalogoMunicipio } from '../../model/Catalogos/CatalogoMunicipio';
import { ConsultaListaCatalogoCredoResponse } from '../../model/Catalogos/CatalogosCredo';
import { RespuestaGenerica } from '../../model/Operaciones/generales/RespuestaGenerica';
import { ServiciosRutas } from '../../model/Operaciones/generales/ServiciosRutas';
import { DatosReporteRequest } from '../../model/Operaciones/reportes/ReportesRegistro';
import { ServiceGenerico } from '../../services/service-generico.service';
import { CatalogoEstatus } from '../../model/Catalogos/CatalogoEstatus';
import { formatDate } from '@angular/common';
import { CanActivate, Router, ActivatedRoute, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from "@angular/router";
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { transformDateForSorting } from 'src/app/model/Operaciones/generales/SortDateDataTable';

const EXCEL_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=UTF-8';
const EXCEL_EXT = '.xlsx';

@Component({
    selector: 'app-modulo-registros-toma-nota-dictaminador',
  templateUrl: './modulo-registros-toma-nota-dictaminador.component.html',
  styleUrls: ['./modulo-registros-toma-nota-dictaminador.component.css'],
  providers: [ServiceGenerico]
})
/** modulo-reporte-registro component*/
export class ModuloRegistrosTomaNotaDictaminadorComponent implements OnInit {
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
  public selectCatMunicipio: CatalogoMunicipio[];
  public selectCatCredo: ConsultaListaCatalogoCredoResponse[];
  routeUrl: string;
  tipoTramite: number;
  id_toma_nota: number;
  public titulo: string;
  public nombreReporte: string;
  @ViewChild("contentReporte", { static: false }) ModalLimpiarReporte: TemplateRef<any>;
  @ViewChild("confirmarEliminar", { static: false }) ModalConfirmacion: TemplateRef<any>;


  constructor(private services: ServiceGenerico,
              private themeConstants: ThemeConstants,
              private modalService: NgbModal,
              private router: Router,
              private translate: TranslateService,
              private form: FormBuilder, private _route: ActivatedRoute) {
    this.themeConstants = new ThemeConstants(translate);
    this.operacionRespuesta = new RespuestaGenerica();
    this.servicios = new ServiciosRutas();
    this.routeUrl = this._route.snapshot.routeConfig.path;
  }

  ngOnInit(): void {
    this.idUsuario = AuthIdentity.ObtenerUsuarioRegistro();
    this.tipoTramite = 5;
    this.id_bloqueo = 0;
    this.inicializatabla();
    this.cargarCatalogoEstatus();
    this.consultadatosinicial();
    this.initControlForm();
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

    this.dtOptions = {
      ...this.themeConstants.dtOptions,
      /* dom: dom,
      buttons: buttons, */
      columnDefs: [
        {
          targets: [3], // Esto apunta a las columnas de fecha
          render: (data: any, type: any, row: any, meta: any) =>
            transformDateForSorting(data, type),
        },
      ],
    } as DataTables.Settings;
    this.dtOptions.search = false;
    this.dtOptions.searching = false;
    this.dtOptions.info = true;
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
      denominacion_desc: this.formFiltros.get('denominacion').value,
      nombre_desc: this.formFiltros.get('nombre').value,
      estatus_desc: this.formFiltros.get('estatus').value,
     

    }
    this.services.HttpPost(params, `${this.servicios.serviciosOperaciones}/ConsultaListaRegistrosTNotaDictaminador/ConsultaListaRegistrosTNotaDictaminador`)
      .subscribe((response: any) => {
        this.operacionRespuesta.EstaEjecutando = false;

        this.listRegistros = response.response;
        this.renderTabla();      
         this.visibleExecel = true;
        

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
      id_usuario: this.idUsuario,
      nombre_desc:null,
      estatus_desc: null,
      denominacion_desc: null
    }

    this.services.HttpPost(params, `${this.servicios.serviciosOperaciones}/ConsultaListaRegistrosTNotaDictaminador/ConsultaListaRegistrosTNotaDictaminador`)
      .subscribe((response: any) => {
        this.operacionRespuesta.EstaEjecutando = false;
        this.listRegistros = response.response;
        this.renderTabla();
        if (response != null) {
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
      nombre: [null],
      denominacion: [null],
      estatus: [null],
    });
  }


  private cargarCatalogoEstatus(): void {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpGet(`${this.servicios.serviciosOperaciones}/ConsultaEstatusRegistro/Get?tipotramite=${this.tipoTramite}`).subscribe(
        (response: any) => {
          this.operacionRespuesta.EstaEjecutando = false;
          this.selectCatEstatus = response.response as CatalogoEstados[];
        },
        (error) => {
          this.operacionRespuesta.EstaEjecutando = false;
          this.operacionRespuesta.EsMsjError = false;
        });
  }

  limpiarReporte() {
    this.formFiltros.reset();
    this.modalService.dismissAll();
    this.consultadatosinicial();
  }

  eliminarTnota(id_tnota: number) {
    this.operacionRespuesta.EstaEjecutando = true;
    const params = {
      id_tnota: id_tnota  
    }
    this.services.HttpPost(params, `${this.servicios.serviciosOperaciones}/EliminarRegistroTomaNota/EliminarRegistro`)
      .subscribe((response: any) => {
        this.operacionRespuesta.EstaEjecutando = false;
        this.mensajeEliminar = response.response.mensaje;
        this.renderTabla();
        this.ConsultaDatos();
        this.modalService.dismissAll();

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

  mandarModificacion(id_tramite: number) {
    this.router.navigate(['/solicitudtomanota/'+id_tramite]);

  }
  mandarVerDetalle(id_tramite: number) {
    
    this.router.navigate(['/solicitudtomanotaconsulta/'+id_tramite]);

  }
  mandarNotificaciones(id_tramite: number){
    this.router.navigate(['/consulta-registro/']);
  }

  mandarNuevoRegistro() {
    this.router.navigate(['/solicitudtomanota/0']);

  }

  openlimpiarReporte() {
    const modalref = this.modalService.open(this.ModalLimpiarReporte, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
  }

  openConfirmacion(id_tnota: number) {
    this.id_toma_nota = id_tnota;
  
    const modalref = this.modalService.open(this.ModalConfirmacion, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
  }

}
