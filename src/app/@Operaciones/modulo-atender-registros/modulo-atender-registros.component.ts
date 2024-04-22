import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgbModalRef, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { ThemeConstants } from 'src/app/@espire/shared/config/theme-constant';
import { AuthGuard } from 'src/app/guards/AuthGuard';
import { AuthIdentity } from 'src/app/guards/AuthIdentity';
import { AsignacionRegistroRequest } from 'src/app/model/Operaciones/AsignacionRegistro/AsignacionRegistro';
import { RespuestaGenerica } from 'src/app/model/Operaciones/generales/RespuestaGenerica';
import { ServiciosRutas } from 'src/app/model/Operaciones/generales/ServiciosRutas';
import { ServiceGenerico } from 'src/app/services/service-generico.service';

@Component({
  selector: 'app-modulo-atender-registros',
  templateUrl: './modulo-atender-registros.component.html',
  styleUrls: ['./modulo-atender-registros.component.scss'],
  providers: [ServiceGenerico],
})
export class ModuloAtenderRegistrosComponent implements OnInit {
    dtOptions: DataTables.Settings = {};
    dtTrigger: Subject<any> = new Subject();
    @ViewChild(DataTableDirective, { static: false })
    dtElement: DataTableDirective;
    recordsTotal: number;
  
    isDtInitialized: boolean = false;
    modalrefMsg: NgbModalRef;
    listRegistros = [];
    listDicataminador = [];
    dictaminadores: AsignacionRegistroRequest[] = [];
    closeResult = "";
    us_id: number;
    respuestaArr = [];
    mensajesExito = [];
    mensajesError = [];
  
    private modelo_configuracion: ServiciosRutas;
    public operacionRespuesta: RespuestaGenerica;
  
    constructor(
      private themeConstants: ThemeConstants,
      public modalService: NgbModal,
      private auth: AuthGuard,
      private services: ServiceGenerico,
      private fb: FormBuilder
    ) {
      this.operacionRespuesta = new RespuestaGenerica();
      this.modelo_configuracion = new ServiciosRutas();
    }
  
    ngOnInit(): void {
      this.inicializaTabla();
      this.llenarTablaTramites();
      this.obtenerDictaminadores();
      this.us_id = AuthIdentity.ObtenerUsuarioRegistro();
    }
  
    inicializaTabla() {
      this.dtOptions = this.themeConstants.dtOptions;
      this.dtTrigger = new Subject();
    }
    obtenerDictaminadores() {
      this.operacionRespuesta.EstaEjecutando = true;
      this.services
        .HttpGet(
          this.modelo_configuracion.serviciosCatalogos +
            "/ConsultaListaUsuariosDicataminador/Get"
        )
        .subscribe(
          (tempdate) => {
            if (tempdate) {
              this.listDicataminador = [] = tempdate.response;
            } else {
              this.listDicataminador = [];
            }
            this.operacionRespuesta.EstaEjecutando = false;
          },
          async (err) => {
            this.operacionRespuesta.EstaEjecutando = false;
          }
        );
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
    
    public async llenarTablaTramites() {
      this.operacionRespuesta.EstaEjecutando = true;
      let id_us= parseInt(AuthIdentity.ObtenerUsuarioRegistro());
        this.services
          .HttpGet(
            this.modelo_configuracion.serviciosOperaciones +
            "/ConsultaListaTramitesDictaminador/ListaTramites?id_usuario=" + id_us + "&Activos=true"
          )
          .subscribe(
            (tempdate) => {
                    if (tempdate) {
                      this.listRegistros = [] = tempdate.response;
                      this.renderTabla();
                    } else {
                      this.listRegistros = [];
                      this.renderTabla();
                    }
                    this.operacionRespuesta.EstaEjecutando = false;
            },
            async (err) => {
              this.operacionRespuesta.EstaEjecutando = false;
            }
          );
    }
    /*
    public async llenarTablaTramites() {
      this.dtOptions.serverSide = true;
      let id_us= parseInt(AuthIdentity.ObtenerUsuarioRegistro());
      this.dtOptions.ajax = (dataTablesParameters: any, callback) => {
        this.services
          .HttpPost(
            dataTablesParameters,
            this.modelo_configuracion.serviciosOperaciones +
              `/ConsultaListaTramitesDictaminador/ConteoTramites?&&c_id=${id_us}&&c_activo=${true}`
          )
          .subscribe(
            async (count) => {
              if (count) {
                this.recordsTotal = count.response[0].totalrecords;
                this.services
                  .HttpPost(
                    dataTablesParameters,
                    this.modelo_configuracion.serviciosOperaciones +
                      `/ConsultaListaTramitesDictaminador/ListaTramites?c_id=${id_us}&&c_activo=${true}`
                  )
                  .subscribe(async (tempdate) => {
                    if (tempdate) {
                      this.listRegistros = await tempdate.response;
                      callback({
                        recordsTotal: await this.recordsTotal,
                        recordsFiltered: await this.recordsTotal,
                        data: [],
                      });
                    } else {
                      this.listRegistros = [];
                      callback({
                        recordsTotal: 0,
                        recordsFiltered: 0,
                        data: [],
                      });
                    }
                  });
              }
            },
            (error) => {
              this.listRegistros = [];
            }
          );
      };
      this.dtOptions.columns = [
        { data: "reg_cat_solicitud_escrito" },
        { data: "reg_cat_denominacion" },
        { data: "reg_numero_registro" },
        // { data: "reg_pais_origen" },
        { data: "reg_fecha" },
        { data: "reg_estatus" },
      ];
    }*/
    reload() {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.ajax.reload();
      });
    }
  }
  
