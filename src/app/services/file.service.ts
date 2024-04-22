import { Injectable, OnInit } from '@angular/core';
import { ServiciosRutas } from '../model/Operaciones/generales/ServiciosRutas';
import { ServiceGenerico } from './service-generico.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModuloModalMensajeComponent } from '../shared/modulo-modal-mensaje/modulo-modal-mensaje.component';
import { WebRestService } from '../@Operaciones/modulo-declaratoria-procedencia/services/crud.rest.service';

@Injectable({
  providedIn: 'root'
})
export class FileService implements OnInit {

  private servicios: ServiciosRutas;
  modalrefMsg: NgbModalRef;
  constructor(private services: ServiceGenerico,
    private modalService: NgbModal,
    public webRestService: WebRestService) {
    this.servicios = new ServiciosRutas();
  }

  ngOnInit() { }

  public async cargarArchivo(id, base64Document, id_archivo_tramite): Promise<boolean> {
    if (base64Document == null) return;

    const params = {
      id: id,
      archivo: base64Document,
      idArchivoTramite: id_archivo_tramite,
    };
    let respuesta = await this.webRestService.postAsync(params, this.servicios.serviciosOperaciones + "/InsertarArchivo/Post");
    if (respuesta) {
      if (respuesta[0].proceso_existoso == true) {
        return true;
      }
    } else {
      this.openMensajes("El documento no se ha cargado de forma exitosa, por favor intente de nuevo.", true, "Carga de Documento");
      return false;
    }
  }


  openMensajes(Mensaje: string, Error: boolean, titulo: string) {
    this.modalrefMsg = this.modalService.open(ModuloModalMensajeComponent, {
      ariaLabelledBy: "modal-basic-title",
    });
    this.modalrefMsg.componentInstance.mensajesExito = [];
    this.modalrefMsg.componentInstance.mensajesError = [];
    this.modalrefMsg.componentInstance.mensajeTitulo = titulo;

    if (Error) {
      this.modalrefMsg.componentInstance.showErrors = true;
      this.modalrefMsg.componentInstance.mensajesError.push(Mensaje);
    } else {
      this.modalrefMsg.componentInstance.showExitos = true;
      this.modalrefMsg.componentInstance.mensajesExito.push(Mensaje);
    }
  }

}
