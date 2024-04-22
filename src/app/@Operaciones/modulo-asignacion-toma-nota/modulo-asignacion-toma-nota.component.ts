import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { ThemeConstants } from '../../@espire/shared/config/theme-constant';
import { AuthGuard } from '../../guards/AuthGuard';
import { AuthIdentity } from '../../guards/AuthIdentity';
import { AsignacionTomaNotaRequest } from 'src/app/model/Operaciones/AsignacionTomaNota/AsignacionTomaNota';
import { RespuestaGenerica } from '../../model/Operaciones/generales/RespuestaGenerica';
import { ServiciosRutas } from '../../model/Operaciones/generales/ServiciosRutas';
import { ServiceGenerico } from '../../services/service-generico.service';
import { ModuloModalMensajeComponent } from '../../shared/modulo-modal-mensaje/modulo-modal-mensaje.component';
import {Router} from '@angular/router';

@Component({
  selector: 'app-modulo-asignacion-toma-nota',
  templateUrl: './modulo-asignacion-toma-nota.component.html',
  styleUrls: ['./modulo-asignacion-toma-nota.component.css'],
  providers: [ServiceGenerico]
})
/** modulo-asignacion-toma-nota component*/
export class ModuloAsignacionTomaNotaComponent implements OnInit {
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  recordsTotal: number;

  isDtInitialized: boolean = false;
  modalrefMsg: NgbModalRef;
  listRegistros = [];
  listDicataminador = [];
  dictaminadores: AsignacionTomaNotaRequest[] = [];
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
    private fb: FormBuilder,
    private router: Router
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
        "/ConsultaListaUsuariosDictaminadorTomaNota/Get"
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
    this.dtOptions.serverSide = true;

    this.dtOptions.ajax = (dataTablesParameters: any, callback) => {
      this.services
        .HttpPost(
          dataTablesParameters,
          this.modelo_configuracion.serviciosOperaciones +
          `/ConsultaListaTomaNota/ConteoTomaNota?c_activo=${true}`
        )
        .subscribe(
          async (count) => {
            if (count) {
              this.recordsTotal = count.response[0].totalrecords;
              this.services
                .HttpPost(
                  dataTablesParameters,
                  this.modelo_configuracion.serviciosOperaciones +
                  `/ConsultaListaTomaNota/ListaTomaNota?c_activo=${true}`
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
      { data: "reg_numero_folio" },
      { data: "reg_cat_denominacion" },
      { data: "reg_cat_solicitud_escrito" },
      { data: "reg_fecha" },
      { data: "reg_numero_registro" },
      { data: "reg_estatus" },

      // { data: "reg_pais_origen" },
    ];
  }
  onChange(us_id: number, id: number) {
    let asingnacionRegistro = {
      s_id: id,
      us_dictaminador_id: us_id,
      us_asigna_id: this.us_id,
    };
    let asignaExiste = this.dictaminadores
      .filter((c) => c.s_id === asingnacionRegistro.s_id)
      .shift();
    if (asignaExiste != undefined) {
      asignaExiste.s_id = asingnacionRegistro.s_id;
      asignaExiste.us_asigna_id = asingnacionRegistro.us_asigna_id;
      asignaExiste.us_asigna_id = asingnacionRegistro.us_asigna_id;
      asignaExiste.us_dictaminador_id = asingnacionRegistro.us_dictaminador_id;
    } else {
      this.dictaminadores.push(asingnacionRegistro);
    }
    try {
      this.dictaminadores = this.dictaminadores.filter(
        (c) => c.us_dictaminador_id != null || c.us_dictaminador_id != undefined
      );
    } catch (error) { }
  }
  openMensajes(Errores: string[], Mensajes: string[]) {
    this.modalrefMsg = this.modalService.open(ModuloModalMensajeComponent, {
      ariaLabelledBy: "modal-basic-title",
    });
    this.modalrefMsg.componentInstance.mensajesError = [];
    this.modalrefMsg.componentInstance.mensajesExito = [];
    this.modalrefMsg.componentInstance.mensajesTitulo = "Asignación";
    if (Errores?.length > 0) {
      this.modalrefMsg.componentInstance.showErrors = true;
      this.modalrefMsg.componentInstance.mensajesError.push(Errores);
    }
    if (Mensajes?.length > 0) {
      this.modalrefMsg.componentInstance.showExitos = true;
      this.modalrefMsg.componentInstance.mensajesExito.push(Mensajes);
    }
  }
  OnSubmit() {
    this.asignarResgistro();
  }
  resetMsg() {
    this.mensajesError = [];
    this.mensajesExito = [];
  }
  asignarResgistro() {
    this.resetMsg();
    if (this.dictaminadores?.length === 0) return;
    this.services
      .HttpPost(
        this.dictaminadores,
        this.modelo_configuracion.serviciosOperaciones +
        "/AsignarDictaminadorTomaNota/Post"
      )
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.reload();

            this.respuestaArr = tempdate.response;
            this.respuestaArr.forEach((c) => {
              if (c.proceso_exitoso) this.mensajesExito.push(c.mensaje);
              else this.mensajesError.push(c.mensaje);
            });
            this.openMensajes(this.mensajesError, this.mensajesExito);
          } else {
            this.openMensajes(["Por favor asigne un dictaminador"], []);
          }
          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.openMensajes(
            ["Hubo un error al intentar asignar el dictaminador."],
            []
          );
          this.operacionRespuesta.EstaEjecutando = false;
        }
      );
  }
  reload() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  mandarVerDetalle(id_tramite: number) {
    this.router.navigate(['/atencion/toma-nota/' + id_tramite]);
  }

}
