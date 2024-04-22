import {Component, OnInit} from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AuthIdentity } from 'src/app/guards/AuthIdentity';
import { PermisoPersonaResponse } from 'src/app/model/Catalogos/PermisosPersona';
import { RespuestaGenerica } from 'src/app/model/Operaciones/generales/RespuestaGenerica';
import { ServiciosRutas } from 'src/app/model/Operaciones/generales/ServiciosRutas';
import { ServiceGenerico } from 'src/app/services/service-generico.service';
import { ModuloModalMensajeComponent } from 'src/app/shared/modulo-modal-mensaje/modulo-modal-mensaje.component';
import {DescargarPlantillaComponent} from '../../shared/descargar-plantilla/descargar-plantilla';

@Component({
  selector: 'app-modulo-transmisiones-nota',
  templateUrl: './modulo-transmisiones.component.html',
  styleUrls: ['./modulo-transmisiones.component.css'],
  providers: [ServiceGenerico],
})

export class ModuloTransmisionesComponent extends DescargarPlantillaComponent implements OnInit {

  public operacionRespuesta: RespuestaGenerica;
  private modelo_configuracion: ServiciosRutas;
  private modalrefMsg: NgbModalRef;

  private id_usuario: number;
  public id_transmision: number;
  public aux_id_transmision = 0;
  public id_estatus_trans: number;

  constructor(private services: ServiceGenerico,
              private modalService: NgbModal) {
    super();
    this.operacionRespuesta = new RespuestaGenerica();
    this.modelo_configuracion = new ServiciosRutas();
  }

  async ngOnInit() {
    this.id_usuario = AuthIdentity.ObtenerUsuarioRegistro();
    await this.obtenerTramiteTransmision();
  }

   async obtenerTramiteTransmision() {
    this.operacionRespuesta.EstaEjecutando = true;
    await this.services.getAsync(this.modelo_configuracion.serviciosOperaciones +"/ConsultaTramiteTransmision/Get?s_id_us=" + this.id_usuario)
      .then((tempdate) => {
          if (tempdate) {
            let modeloTramite = tempdate.response[0];
            this.id_transmision = modeloTramite.i_id_tbl_transmision;
            this.id_estatus_trans = modeloTramite.i_id_tbl_estatus;
            this.aux_id_transmision = ((this.id_estatus_trans == 33 || this.id_estatus_trans == 34 ) ? 0 : this.id_transmision);
          } else {
            this.openMensajes(["No se pudo realizar la acción"], []);
          }
          this.operacionRespuesta.EstaEjecutando = false;
        }, (err) => {
          this.operacionRespuesta.EstaEjecutando = false;
        });
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

}
