import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { async, Subject } from 'rxjs';
import { ThemeConstants } from 'src/app/@espire/shared/config/theme-constant';
import { AuthGuard } from 'src/app/guards/AuthGuard';
import { AuthIdentity } from 'src/app/guards/AuthIdentity';
import { AsignacionTomaNotaRequest } from 'src/app/model/Operaciones/AsignacionTomaNota/AsignacionTomaNota';
import { RespuestaGenerica } from 'src/app/model/Operaciones/generales/RespuestaGenerica';
import { ServiciosRutas } from 'src/app/model/Operaciones/generales/ServiciosRutas';
import { AsignarTransmisionRequest } from 'src/app/model/Operaciones/Transmisiones/AsignarTransmision';
import { ServiceGenerico } from 'src/app/services/service-generico.service';
import { ModuloModalMensajeComponent } from 'src/app/shared/modulo-modal-mensaje/modulo-modal-mensaje.component';
import {Router} from '@angular/router';
import { transformDateForSorting } from 'src/app/model/Operaciones/generales/SortDateDataTable';

@Component({
  selector: 'app-modulo-asignacion-transmisiones',
  templateUrl: './modulo-asignacion-transmisiones.component.html',
  styleUrls: ['./modulo-asignacion-transmisiones.component.css'],
  providers: [ServiceGenerico]
})

export class ModuloAsignacionTransmisionesComponent implements OnInit {
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  recordsTotal: number;

  isDtInitialized: boolean = false;
  modalrefMsg: NgbModalRef;
  listRegistros = [];
  listDictaminador = [];
  dictaminador: AsignarTransmisionRequest;
  ArgDictaminador = new Array<AsignarTransmisionRequest>();
  ArgDictaminadorExistoso = new Array<boolean>();
  closeResult = "";
  us_id: number;
  mensajesExito = [];
  mensajesError = [];

  private modelo_configuracion: ServiciosRutas;
  public operacionRespuesta: RespuestaGenerica;
  
  public formFiltros: FormGroup;


  constructor(
    private themeConstants: ThemeConstants,
    public modalService: NgbModal,
    private auth: AuthGuard,
    private services: ServiceGenerico,
    private router: Router,
    private form: FormBuilder,
  ) {
    this.operacionRespuesta = new RespuestaGenerica();
    this.modelo_configuracion = new ServiciosRutas();
    this.ArgDictaminador = new Array<AsignarTransmisionRequest>();
    this.ArgDictaminadorExistoso = new Array<boolean>();
  }

  ngOnInit(): void {
    this.initControlForm();
    this.inicializaTabla();
    this.llenarTablaTransmisiones();
    this.obtenerDictaminadores();
    this.us_id = AuthIdentity.ObtenerUsuarioRegistro();
  }

  inicializaTabla() {
    this.dtOptions = {
      ...this.themeConstants.dtOptions,
      columnDefs: [
        {
          targets: [3], // Esto apunta a las columnas de fecha
          render: (data: any, type: any, row: any, meta: any) =>
            transformDateForSorting(data, type),
        },
      ],
    } as DataTables.Settings;
    this.dtTrigger = new Subject();
    this.dtOptions.search = false;
    this.dtOptions.searching = false;

  }
  private initControlForm(): void {

    this.formFiltros = this.form.group({
      busqueda: ['', null],
    });
  }

  obtenerDictaminadores() {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpGet(
        this.modelo_configuracion.serviciosCatalogos +
        "/ConsultaListaUsuariosDictaminadorTransmision/Get")
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.listDictaminador = [] = tempdate.response;
          } else {
            this.listDictaminador = [];
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

  /*public async llenarTablaTransmisiones() {
    this.dtOptions.serverSide = true;

    this.dtOptions.ajax = (dataTablesParameters: any, callback) => {
      this.services
        .HttpGet(
          this.modelo_configuracion.serviciosOperaciones +
          "/ConsultaEstatusTransmision/Get?id_dictaminador=0&&id_estatus=29"
        )
        .subscribe(async (tempdate) => {
          if (tempdate) {
            this.listRegistros = await tempdate.response;
            this.recordsTotal = this.listRegistros.length;
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
    };
  }*/

  public Buscar() {
    this.llenarTablaTransmisiones();
  }

  public ConsultaDatos(): void {
    this.llenarTablaTransmisiones();
  }

  limpiarReporte() {
    this.formFiltros = this.form.group({
      busqueda: ['', null],
    });
    this.modalService.dismissAll();
    this.llenarTablaTransmisiones();
  }


  llenarTablaTransmisiones() {
      this.operacionRespuesta.EstaEjecutando = true;
      let request = { id_dictaminador:0,id_estatus:29,busqueda:null };
      if(this.formFiltros.get('busqueda').value!=null&&this.formFiltros.get('busqueda').value!='') {
        request.busqueda = this.formFiltros.get('busqueda').value;
      }

      this.services.HttpPost(request,this.modelo_configuracion.serviciosOperaciones+ "/ConsultaEstatusTransmision/GetFiltrado").subscribe(
          (tempdate) => {
            if (tempdate) {
              this.listRegistros = tempdate.response;
              this.renderTabla();
            } else {
              this.listRegistros = [];
              //this.renderTabla();
            }
            this.operacionRespuesta.EstaEjecutando = false;
          },
          async (err) => {
            this.operacionRespuesta.EstaEjecutando = false;
          }
        );
    }


  onChange(idDictaminador: any, idTransmision: number) {

    if (idDictaminador === "" && idTransmision > 0) {
        const indexTransmision = this.ArgDictaminador.findIndex(element => element.id_transmision === idTransmision );
        this.ArgDictaminador.splice(indexTransmision, 1);
        return;
    }

    let existeElemento = this.ArgDictaminador.find(element => element.id_transmision === idTransmision &&
                                                              element.id_usuario_dictaminador === Number( idDictaminador ) );

    if ( existeElemento ) {
         existeElemento.id_usuario_dictaminador = Number( idDictaminador );
         existeElemento.id_transmision = idTransmision;

         const indexElement = this.ArgDictaminador.findIndex(element => element.id_transmision === idTransmision &&
                                                                        element.id_usuario_dictaminador === Number( idDictaminador ))
         this.ArgDictaminador.splice(indexElement, 1);

         this.ArgDictaminador.push( existeElemento );

    } else {
      const dictaminador = {  id_transmision: idTransmision,
                              id_usuario_dictaminador: Number(idDictaminador),
                              id_usuario_asignador: this.us_id
                            } as AsignarTransmisionRequest;

      this.ArgDictaminador.push( dictaminador );
    }


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

  resetMsg() {
    this.mensajesError = [];
    this.mensajesExito = [];
  }

  async asignarTransmision() {
    this.resetMsg();
    if (this.ArgDictaminador?.length > 0) {
        let index = 1;
        this.operacionRespuesta.EstaEjecutando = true;
        for(let request of this.ArgDictaminador) {
            const esUltimo = (index === this.ArgDictaminador?.length)
            await this.EjecutarProcesoTransmision(request, esUltimo);
            index++;
        }
    }
  }

  private async EjecutarProcesoTransmision(request: AsignarTransmisionRequest, esUltimoValor: boolean ) {
      const url = `${this.modelo_configuracion.serviciosOperaciones}/AsignarTransmisionDictaminador/Post`;
      await this.services.postAsync(request, url)
          .then((tempdate: any) => {
            if (tempdate) {
                if (esUltimoValor) {
                  this.operacionRespuesta.EstaEjecutando = false;
                  this.openMensajes(this.mensajesError, tempdate.response[0].mensaje);
                  this.llenarTablaTransmisiones();
                }
            }
      }).catch(error => {
          this.openMensajes(["Hubo un error al intentar asignar el dictaminador."],[]);
          this.operacionRespuesta.EstaEjecutando = false;
      });
  }


  reload() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  verDetalle(id_tramite: number) {
    this.router.navigate(['/consulta-transmision/' + id_tramite]);
  }

}
