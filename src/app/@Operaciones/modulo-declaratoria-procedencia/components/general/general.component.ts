import { Component, OnDestroy, ViewChild } from '@angular/core';
import { FormGroup, FormControl, FormArray } from '@angular/forms';
import { WebRestService } from '../../services/crud.rest.service';
import { ServiciosRutas } from 'src/app/model/Operaciones/generales/ServiciosRutas';
import { ModuloVisorPdfComponent } from 'src/app/shared/modulo-visor-pdf/modulo-visor-pdf.component';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModuloModalMensajeComponent } from 'src/app/shared/modulo-modal-mensaje/modulo-modal-mensaje.component';
import { AppInjectorService } from '../../services/app-injector.service';
import { ModuloModalAdvertenciaComponent } from 'src/app/shared/modulo-modal-advertencia/modulo-modal-advertencia.component';
import { AuthIdentity } from 'src/app/guards/AuthIdentity';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

const EXCEL_TYPE =
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=UTF-8';
const EXCEL_EXT = '.xlsx';

@Component({
    selector: 'app-general',
    template: ""
})
export class GeneralComponent implements OnDestroy {
    @ViewChild('tableModalSalir') tableModalSalir: any;

    public max_size = 250 * 1024 * 1024;
    public allowed_types = ["application/pdf"];
    modelo_configuracion: ServiciosRutas;
    modalrefMsg: NgbModalRef;
    public base64 = null;
    modalrefAdvertencia: NgbModalRef;
    public idPerfil = AuthIdentity.ObtenerUsuarioSesion().IdPerfil;
    us_id = AuthIdentity.ObtenerUsuarioRegistro();
    deshabilitar: boolean = false;
    protected webRestService: WebRestService;
    protected modalService: NgbModal;


    constructor() {
        const injector = AppInjectorService.getInjector();
        this.webRestService = injector.get(WebRestService)
        this.modalService = injector.get(NgbModal);
        this.modelo_configuracion = new ServiciosRutas();
        this.deshabilitar = this.idPerfil == 11 || this.idPerfil == 12 ? true : false;
    }

    ngOnDestroy(): void {
    }

    validaCamposFormulario(formGroups: FormGroup[]) {
        formGroups.forEach((formulario) => {
            Object.keys(formulario.controls).forEach((field) => {
                const control = formulario.get(field);
                if (control instanceof FormControl) {
                    control.markAsTouched({ onlySelf: true });
                } else if (control instanceof FormGroup) {
                    this.validaCamposFormulario([control]);
                } else if (control instanceof FormArray) {
                    control.controls.forEach((element) => {
                        if (element instanceof FormControl) {
                            element.markAsTouched({ onlySelf: true });
                        } else if (element instanceof FormGroup) {
                            this.validaCamposFormulario([element]);
                        }
                    });
                }
            });
        });
    }

    bloqueaCamposFormulario(formGroups: FormGroup[]) {
        formGroups.forEach((formulario) => {
            Object.keys(formulario.controls).forEach((field) => {
                const control = formulario.get(field);
                if (control instanceof FormControl) {
                    //control.markAsTouched({ onlySelf: true });
                    control.disable({ onlySelf: true });
                } else if (control instanceof FormGroup) {
                    this.validaCamposFormulario([control]);
                } else if (control instanceof FormArray) {
                    control.controls.forEach((element) => {
                        if (element instanceof FormControl) {
                            //element.markAsTouched({ onlySelf: true });
                            element.disable({ onlySelf: true });
                        } else if (element instanceof FormGroup) {
                            this.validaCamposFormulario([element]);
                        }
                    });
                }
            });
        });
    }

    openModalSalir() {
        this.tableModalSalir.nativeElement.className = 'modal show-modal';
    }

    closeModalSalir() {
        this.tableModalSalir.nativeElement.className = 'modal hide-modal';
    }

    async cargarArchivo(event, idArchivoTramiteD, idDeclaratoria, modificacion?) {
        let selectedFile = null;
        if (modificacion) selectedFile = event;
        else selectedFile = <File>event.target.files[0];

        if (selectedFile.size > this.max_size) {
            this.openMensajes(
                "El máximo tamaño permitido es " + 250 + "Mb",
                true, "Carga de Documento"
            );
            return false;
        }

        let reader: any = await this.readFile(event, modificacion ? 1 : null);
        const params = {
            id: idDeclaratoria,
            archivo: reader,
            idArchivoTramite: idArchivoTramiteD,
        };
        let respuesta = await this.webRestService.postAsync(params, this.modelo_configuracion.serviciosOperaciones + "/InsertarArchivo/Post")
        // if (respuesta != null && respuesta[0].id) {
        //     this.openMensajes(
        //         "El documento se ha cargado de forma exitosa.",
        //         false, "Carga de Documento"
        //     );
        //     return respuesta;
        // } else {
        //     this.openMensajes(
        //         "El documento no se ha cargado de forma exitosa, por favor intente de nuevo.",
        //         true, "Carga de Documento"
        //     );
        //     return respuesta;
        // }

    }

    async detalle(id: number, archivoTramite: number, tipo?) {

        let respuesta = await this.webRestService.getAsync(this.modelo_configuracion.serviciosOperaciones + "/ConsultaArchivo/Get?id=" + id + "&idArchivoTramite=" + archivoTramite)

        if (tipo) {
            return respuesta.response[0].ruta;
        }

        let tipoDoc = respuesta.response[0].ext.includes("pdf") ? 1 : respuesta.response[0].ext.includes("docx") ? 2 : 3;

        if(tipoDoc == 3) return respuesta.response[0].ruta;

        if (respuesta != null) {
            const modalRef = this.modalService.open(ModuloVisorPdfComponent, {
                size: "lg",
            });
            modalRef.componentInstance.src = respuesta.response[0].ruta;
            modalRef.componentInstance.esWord = tipoDoc == 2 ? true : false;
            modalRef.componentInstance.esImagen = tipoDoc == 3 ? true : false;
        }
    }

    openAdvertencia(idDocumento?, tipo?) {
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
            if (result) this.eliminar(idDocumento, tipo);
        });
    }

    async eliminar(idDocumento, tipo) {
        const params = {
            id: idDocumento,
            idArchivoTramite: tipo,
        };

        let respuesta = await this.webRestService.postAsync(params, this.modelo_configuracion.serviciosOperaciones + "/BorraArchivo/Post")
        if (respuesta != null && respuesta.response?.proceso_exitoso == true) {
            this.openMensajes(
                "El documento se ha eliminado de forma exitosa.",
                false, "Eliminación del Documento"
            );
        } else {
            this.openMensajes(
                "El documento no se ha eliminado de forma exitosa, por favor intente de nuevo.",
                true, "Eliminación del Documento"
            );
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

    exportAsXLSX(listaRegistros, nombreReporte): void {
        this.exportToExcel(listaRegistros, nombreReporte);
    }


    public readFile(event, modificacion?) {
        return new Promise((resolve, reject) => {
            let selectedFile = null;
            if (modificacion) selectedFile = event
            else selectedFile = <File>event.target.files[0];
            var reader = new FileReader();
            reader.readAsDataURL(selectedFile);

            reader.onload = () => {
                resolve(reader.result)
            };
            reader.onerror = reject;
        });
    }


}
