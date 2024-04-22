import { Component, EventEmitter, Input, OnDestroy, OnInit, Output,ViewChild } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Anexos, ListaAnexos } from 'src/app/model/Operaciones/anexos/Anexos';
import { HttpClient } from '@angular/common/http';
import * as _ from "lodash";

import { ServiceGenerico } from 'src/app/services/service-generico.service';
import { ServiciosRutas } from 'src/app/model/Operaciones/generales/ServiciosRutas';
import { archivosAnexo } from 'src/app/model/Operaciones/TomaNota/TomaNota';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModuloModalMensajeComponent } from 'src/app/shared/modulo-modal-mensaje/modulo-modal-mensaje.component';
import { ModuloVisorPdfComponent } from 'src/app/shared/modulo-visor-pdf/modulo-visor-pdf.component';
import { ModuloModalAdvertenciaComponent } from 'src/app/shared/modulo-modal-advertencia/modulo-modal-advertencia.component';
import { ActivatedRoute } from '@angular/router';
import {SentFile} from '../../model/Utilities/File';
// import { API } from '../../model/Operaciones/generales/ServiciosRutas';

@Component({
  selector: 'app-modulo-anexos',
  templateUrl: './modulo-anexos.component.html',
  styleUrls: ['./modulo-anexos.component.css']
})
export class ModuloAnexosComponent implements OnInit {

  // @Input()  anexos: FormGroup;
  @Input() id: number;
  @Input() id_archivo_tramite: number;
  @Output() is_loading: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() isDictaminador:boolean=false;

  @Output() is_sent_anexos: EventEmitter<Anexos[]> = new EventEmitter<Anexos[]>();

  public listaArchivosModal: Anexos[] = [];
  file: any;
  modelo_configuracion: ServiciosRutas;
  public id_asunto: any;
  public listaAnexos: Array<ListaAnexos> = [];
  public btnGuardarArchivos: boolean = false;
  max_size: number;
  allowed_types: string[];
  modalrefMsg: NgbModalRef;
  modalrefAdvertencia: NgbModalRef;
  id_bloqueo:number;
  bloqueoTN:boolean;

  listArchivosDelete = [];


    constructor(private services: ServiceGenerico, private _route : ActivatedRoute,  http: HttpClient, private modalService: NgbModal) {
    this.modelo_configuracion = new ServiciosRutas();

  }

  ngOnInit(): void {
    this.max_size = 20971520;
    this.allowed_types = ["application/pdf"];
    this.consultarAnexos();

    if((this._route.snapshot.routeConfig.path).includes("solicitudtomanotaconsulta")){
      this.id_bloqueo = 1;
      }
      this.bloqueoTN = this.id_bloqueo == 1 ? true: false;
  }

  cargarArchivo(){
    const inputFile = document.getElementById('ArchivoModal') as HTMLInputElement;
    inputFile.click();
  }


  async agregarArchivo(event: any) {
     const archivo = event.target.files;

    for (let x = 0; x <= archivo.length - 1; x++) {
      if (archivo[x].size > this.max_size) {
        this.openMensajes(
          "El máximo tamaño permitido es " + this.max_size / 1000 + "Mb",
          true,"Carga de Documento"
        );
        return false;
      }

      if (!_.includes(this.allowed_types, archivo[x].type)) {
        this.openMensajes(
          "El documento no tiene formato PDF, por favor intente de nuevo.",
          true,"Carga de Documento"
        );
        return false;
      }

      const archivoItem: Blob = archivo[x];
      const archivo_Item = archivo[x];
      const base64 = await this.blobToData(archivoItem);

      this.listaArchivosModal.push({
        id_asunto: this.id,
        nombre_anexo: archivo_Item.name,
        anexo: archivoItem,
        extension: '.pdf',
        base64: base64
      });

      this.listaAnexos.push({
        id_asunto: this.id,
        nombre_anexo: archivo_Item.name,
        base64: base64
      });
    }

    this.is_sent_anexos.emit(this.listaArchivosModal);
    //this.guardarArchivos();
  }

  blobToData = (blob: Blob): any => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.readAsDataURL(blob)
    });

  }


  public guardarArchivos() {
    let i: number;
    for (i = 0; i < this.listaArchivosModal.length; i++) {
       const formData: any = new FormData();
      formData.append('id_asunto',    this.listaArchivosModal[i].id_asunto);
      formData.append('nombre_anexo', this.listaArchivosModal[i].nombre_anexo);
      formData.append('anexo',        this.listaArchivosModal[i].anexo);
      formData.append('extension',    this.listaArchivosModal[i].extension);
      formData.append('id_tramite',    this.id_archivo_tramite);
      this.services.HttpPostFile(formData, this.modelo_configuracion.serviciosOperaciones + "/AnexosAsunto/InsertarAnexoAsunto").subscribe(
        (response: any) => {
          this.consultarAnexos();
      },(error) => { });

    }
    // this.consultarAnexos();

    // borramos el array
    this.listaArchivosModal = [];


  }

  consultarAnexos(){
    const params = {
      id_toma_nota: this.id,
      id_tramite: this.id_archivo_tramite
    }
    this.services
    .HttpPost(params, this.modelo_configuracion.serviciosOperaciones + "/AnexosAsunto/ConsultarListaAnexo").subscribe(
      (response: any) => {
         this.listaAnexos  = response.response;

      },
      (error) => {
        this.listaAnexos = []
      });

  }


  detalle(archivo: any, base64: string) {
    this.setIsLoading(true);

    if (base64 === undefined) {
      const params = {
        id_anexo: archivo.id_anexo,
        url_anexo: archivo.url_anexo
      }
      // Realizamos una petición para obtener el documento y lo mostramos en la modal.
     this.services
      .HttpPost(params, this.modelo_configuracion.serviciosOperaciones + "/AnexosAsunto/ConsultarDetalleAnexo").subscribe(
        (response: any) => {
          if (response) {
            const modalRef = this.modalService.open(ModuloVisorPdfComponent, {
              size: "lg",
            });
            modalRef.componentInstance.src = response.response[0].base64_anexo;
            this.setIsLoading(false);
            return;
          }

          this.openMensajes("No se encontró el documento.", true,"Visualización del Documento");
          this.setIsLoading(false);
        },
        (error) => {
          this.openMensajes("No se encontró el documento.", true,"Eliminación del Documento");
          this.setIsLoading(false);
        }
      );
    } else {
      const modalRef = this.modalService.open(ModuloVisorPdfComponent, { size: "lg", });
      modalRef.componentInstance.src = base64.split(",")[1];
      this.setIsLoading(false);
    }
  }
  setIsLoading(isLoading: boolean) {
    this.is_loading.emit(isLoading);
  }


  openAdvertencia(archivo: any, index: number) {
    this.modalrefAdvertencia = this.modalService.open(
      ModuloModalAdvertenciaComponent,
      {
        ariaLabelledBy: "modal-basic-title",
      }
    );
    this.modalrefAdvertencia.componentInstance.mensajeTitulo = "Eliminación del Documento";
    this.modalrefAdvertencia.componentInstance.mensaje =
      "¿Está seguro que desea eliminar el documento?";
    this.modalrefAdvertencia.result.then((result) => {
      if (result) {
        if (archivo.base64 === undefined) {

          this.listArchivosDelete.push({
            id_anexo: archivo.id_anexo
          });

          this.is_sent_anexos.emit(this.listArchivosDelete);
          //this.is_sent_anexos.emit(this.listArchivosDelete);
        }
        this.listaAnexos.splice(index, 1);
        this.listaArchivosModal.splice(index, 1);
        //this.eliminarAnexo(archivo)
      };
    });
  }


   eliminarAnexo(archivo: any){

    const params = {
      id_anexo: archivo.id_anexo
    }
    this.services
    .HttpPost(params, this.modelo_configuracion.serviciosOperaciones + "/AnexosAsunto/BorrarAnexoAsunto").subscribe(
      (response: any) => {
        if(response.response[0].proceso_exitoso === true){
          this.openMensajes(
            "El documento se ha eliminado de forma exitosa.",
            false,"Eliminación del Documento"
          );
          this.setIsLoading(false);
          this.consultarAnexos();
        }

      },
      (error) => {
        this.openMensajes(
          "El documento no se ha eliminado de forma exitosa, por favor intente de nuevo.",
          true,"Eliminación del Documento"
        );
      });
  }



    //#region Mensajes
    openMensajes(Mensaje: string, Error: boolean,titulo:string) {
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
    //#endregion
}
