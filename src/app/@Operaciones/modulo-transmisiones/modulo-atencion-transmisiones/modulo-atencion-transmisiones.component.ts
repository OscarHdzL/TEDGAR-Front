import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { ThemeConstants } from 'src/app/@espire/shared/config/theme-constant';
import { AuthGuard } from 'src/app/guards/AuthGuard';
import { AuthIdentity } from 'src/app/guards/AuthIdentity';
import { RespuestaGenerica } from 'src/app/model/Operaciones/generales/RespuestaGenerica';
import { ServiciosRutas } from 'src/app/model/Operaciones/generales/ServiciosRutas';
import { ServiceGenerico } from 'src/app/services/service-generico.service';
import { ModuloModalMensajeComponent } from 'src/app/shared/modulo-modal-mensaje/modulo-modal-mensaje.component';

@Component({
  selector: 'app-modulo-atencion-transmisiones',
  templateUrl: './modulo-atencion-transmisiones.component.html',
  styleUrls: ['./modulo-atencion-transmisiones.component.css'],
  providers: [ServiceGenerico]
})

export class ModuloAtencionTransmisionesComponent implements OnInit {
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  recordsTotal: number;

  isDtInitialized: boolean = false;
  modalrefMsg: NgbModalRef;
  listRegistros = [];
  listDictaminador = [];
  closeResult = "";
  us_id: number;
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
    this.llenarTablaTransmisiones();
    // this.us_id = AuthIdentity.ObtenerUsuarioRegistro();
  }

  inicializaTabla() {
    this.dtOptions = this.themeConstants.dtOptions;
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

  llenarTablaTransmisiones() {
    this.us_id = AuthIdentity.ObtenerUsuarioRegistro();
    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpGet(
        this.modelo_configuracion.serviciosOperaciones +
        "/ConsultaEstatusTransmision/Get?id_estatus=30&id_dictaminador="+this.us_id
      )
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.listRegistros = [] =
              tempdate.response as any[];
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

  reload() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

}
