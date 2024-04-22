import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { ServiceGenerico } from "../../services/service-generico.service";
import { ServiciosRutas } from "../../model/Operaciones/generales/ServiciosRutas";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import * as _ from "lodash";
import { ModuloVisorPdfComponent } from "../modulo-visor-pdf/modulo-visor-pdf.component";
import { ModuloModalMensajeComponent } from "../modulo-modal-mensaje/modulo-modal-mensaje.component";
import { ModuloModalAdvertenciaComponent } from "../modulo-modal-advertencia/modulo-modal-advertencia.component";
import { SentFile } from "src/app/model/Utilities/File";
import { AuthIdentity } from "src/app/guards/AuthIdentity";
import { LocalStorageService } from "../../services/local-storage.service";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-modulo-carga-archivo",
  templateUrl: "./modulo-carga-archivo.component.html",
  styleUrls: ["./modulo-carga-archivo.component.css"],
  providers: [ServiceGenerico],
})
export class ModuloCargaArchivoComponent implements OnInit {
  @Input() id: number;
  @Input() id_archivo_tramite: number;
  @Input() archivo_registrado: boolean;
  @Input() isDictaminador: boolean = false;
  @Input() indice: number;


  @Output() is_loading: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() is_sent_arch: EventEmitter<SentFile> = new EventEmitter<SentFile>();

  private selectedFile: File = null;
  private servicios: ServiciosRutas;
  private max_size: number;
  id_bloqueo: number;
  bloqueo: boolean;
  bloqueoTN: boolean;
  id_tramite: number;
  private allowed_types: string[];
  modalrefMsg: NgbModalRef;
  modalrefAdvertencia: NgbModalRef;
  base64: string = null;

  constructor(private services: ServiceGenerico,
    private modalService: NgbModal,
    private localStorageService: LocalStorageService,
    private _route: ActivatedRoute) {
    this.servicios = new ServiciosRutas();
  }

  ngOnInit(): void {
    // TODO: Dependiendo del tipo de archivo, determinamos los documentos permitidos y el tamaño máximo
    this.max_size = 20971520;
    this.allowed_types = ["application/pdf"];
  }



  cargarArchivo(event) {
    this.selectedFile = <File>event.target.files[0];

    if (this.selectedFile.size > this.max_size) {
      this.openMensajes(
        "El máximo tamaño permitido es " + this.max_size / 1000 + "Mb",
        true, "Carga de Documento"
      );
      return false;
    }

    if (!_.includes(this.allowed_types, this.selectedFile.type)) {
     this.openMensajes(
        "El documento no tiene formato PDF, por favor intente de nuevo.",
        true, "Carga de Documento"
      );
      return false;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const base64Document = e.target.result;
      this.base64 = base64Document;
      this.archivo_registrado = true;
      this.setUploadArch(this.id_archivo_tramite, true, base64Document);

      // const params = {
      //   id: this.id,
      //   archivo: base64Document,
      //   idArchivoTramite: this.id_archivo_tramite,
      // };
      // this.setIsLoading(true);
      // this.services.HttpPost(params, this.servicios.serviciosOperaciones + "/InsertarArchivo/Post").subscribe((response: any) => {
      //   if (response) {
      //     if (response[0].proceso_exitoso == true) {
      //       this.openMensajes("El documento se ha cargado de forma exitosa.", false, "Carga de Documento"
      //       );
      //       this.archivo_registrado = true;
      //       this.setUploadArch(this.id_archivo_tramite, true);
      //       this.setIsLoading(false);
      //       return;
      //     }
      //   }

      //   this.openMensajes("El documento no se ha cargado de forma exitosa, por favor intente de nuevo.", true, "Carga de Documento"
      //   );
      //   this.setIsLoading(false);
      // },
      //   (error) => {
      //     this.openMensajes(
      //       "El documento no se ha cargado de forma exitosa, por favor intente de nuevo.",
      //       true, "Carga de Documento"
      //     );
      //     this.setIsLoading(false);
      //   }
      // );
    };
    event.srcElement.value = null;
    reader.readAsDataURL(this.selectedFile);
  }

  detalle() {
    this.setIsLoading(true);
    if (this.base64 == null) {
      this.services.HttpGet(this.servicios.serviciosOperaciones + "/ConsultaArchivo/Get?id=" + this.id + "&idArchivoTramite=" + this.id_archivo_tramite).subscribe(
        (response: any) => {
          if (response) {
            if (response.response[0].proceso_exitoso == true) {
              const modalRef = this.modalService.open(ModuloVisorPdfComponent, { size: "lg", });
              modalRef.componentInstance.src = response.response[0].ruta;
              this.setIsLoading(false);
              return;
            }
          }
        },
        (error) => {
          this.openMensajes("No se encontró el documento.", true, "Eliminación del Documento");
          this.setIsLoading(false);
        }
      );
    } else {
      const modalRef = this.modalService.open(ModuloVisorPdfComponent, { size: "lg", });
      modalRef.componentInstance.src = this.base64.split(",")[1];
      this.setIsLoading(false);
    }

  }

  openAdvertencia() {
    this.modalrefAdvertencia = this.modalService.open(ModuloModalAdvertenciaComponent, { ariaLabelledBy: "modal-basic-title", });
    this.modalrefAdvertencia.componentInstance.mensajeTitulo = "Eliminación del Documento";
    this.modalrefAdvertencia.componentInstance.mensaje = "¿Está seguro que desea eliminar el documento?";
    this.modalrefAdvertencia.result.then(async (result) => {
      if (result) await this.eliminar();
    });
  }

  async eliminar() {
    this.setUploadArch(this.id_archivo_tramite, false);
    this.base64 = null;
    return;
    const params = {
      id: this.id,
      idArchivoTramite: this.id_archivo_tramite,
    };

    this.setIsLoading(true);

    this.services.HttpPost(params, this.servicios.serviciosOperaciones + "/BorraArchivo/Post").subscribe((response: any) => {
      if (response) {
        if (response.response.proceso_exitoso == true) {
          this.openMensajes("El documento se ha eliminado de forma exitosa.", false, "Eliminación del Documento");
          this.archivo_registrado = false;
          this.setIsLoading(false);
          this.setUploadArch(this.id_archivo_tramite, false);
          return;
        }
      }

      this.openMensajes("El documento no se ha eliminado de forma exitosa, por favor intente de nuevo.", true, "Eliminación del Documento");
      this.setIsLoading(false);
    },
      (error) => {
        this.openMensajes(
          "El documento no se ha eliminado de forma exitosa, por favor intente de nuevo.",
          true, "Eliminación del Documento"
        );
        this.setIsLoading(false);
      }
    );
  }

  setIsLoading(isLoading: boolean) {
    this.is_loading.emit(isLoading);
  }
  setUploadArch(tipoArch: number, sent: boolean, base64?: any) {
    let archsent = new SentFile();
    archsent.sent = sent;
    archsent.tipo = tipoArch;
    archsent.base64 = base64;
    archsent.indice = this.indice
    this.is_sent_arch.emit(archsent);
  }

  //#region Mensajes
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
  //#endregion
}
