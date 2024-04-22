import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { Subject } from "rxjs";
import { DataTableDirective } from "angular-datatables";
import { RespuestaGenerica } from "../../model/Operaciones/generales/RespuestaGenerica";
import { ThemeConstants } from "../../@espire/shared/config/theme-constant";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { ServiceGenerico } from "../../services/service-generico.service";
import { ServiciosRutas } from "../../model/Operaciones/generales/ServiciosRutas";
import { CatalogoPlantillaTransmisionResponse } from "../../model/Catalogos/CatalogoPlantillaTransmision";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ModuloModalMensajeComponent } from "src/app/shared/modulo-modal-mensaje/modulo-modal-mensaje.component";
import * as _ from "lodash";

@Component({
  selector: 'app-modulo-gestion-catalogo-plantilla-transmision',
  templateUrl: './modulo-gestion-catalogo-plantilla-transmision.component.html',
  styleUrls: ['./modulo-gestion-catalogo-plantilla-transmision.component.css'],
  providers: [ServiceGenerico],
})
export class ModuloGestionCatalogoPlantillaTransmisionComponent implements OnInit {

  //#region Propiedades privadas
  private modelo_configuracion: ServiciosRutas;
  //#endregion

  //#region Propiedades publicas
  public operacionRespuesta: RespuestaGenerica;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
   isDtInitialized: boolean = false;
  public modalrefCreacion: NgbModalRef;
  public modalrefEdicion: NgbModalRef;
  public modalrefMsg: NgbModalRef;
  public listcatalogo: CatalogoPlantillaTransmisionResponse[];
  public fromCatalago: FormGroup;
  public itemSeleccionado: CatalogoPlantillaTransmisionResponse;
  @ViewChild("modalOperaciones", { static: false }) modalOperaciones: TemplateRef<any>;
  @ViewChild("confirmarEliminar", { static: false }) ModalConfirmacion: TemplateRef<any>;
  //#endregion


  //#region Variables generales
  public operacionTituloModel: string;
  public ext: string;
  private allowed_types: string[];
  private aux_id: number = 0;
  //#endregion

  constructor(private themeConstants: ThemeConstants,
              public modalService: NgbModal,
              private services: ServiceGenerico,
              private form: FormBuilder) {
    this.operacionRespuesta = new RespuestaGenerica();
    this.modelo_configuracion = new ServiciosRutas();
    this.listcatalogo = new Array<CatalogoPlantillaTransmisionResponse>();
  }

  //#region Métodos publicos
  ngOnInit(): void {
    this.inicializaTabla();
    this.iniFormulario();
    this.CargarListaPlantillas();

  }

  public async abrirModalNuevoRegistro() {
    this.operacionTituloModel = 'Agregar plantilla';
    this.fromCatalago.reset();
    this.fromCatalago.controls['ArchivoBase64'].addValidators(Validators.required);
    this.fromCatalago.controls['ArchivoBase64'].updateValueAndValidity();
    const modalOperacionesRef = this.modalService.open(this.modalOperaciones, { ariaLabelledBy: 'modal-basic-title', size: 'lg' });
    await modalOperacionesRef.result.then(async () => {},() => {
         this.CargarListaPlantillas();
    });
  }

  public async preCargarArchivo(archivo: File) {
    this.allowed_types = (this.aux_id === 9 || this.aux_id === 10) ? ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'] : ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    if (archivo === null || archivo === undefined) {
        return;
    }

    if (!_.includes(this.allowed_types, archivo[0].type)) {
      this.openMensajes( ['El documento no tiene el formato correcto, por favor intente de nuevo'], []);
      return;
    }

    if ((archivo[0].size / 1024) > 1000) {
      this.openMensajes( ['El máximo tamaño permitido es de 1MB'], []);
      return;
    }

    const esValido = this.ejecutaProcesoValidacion(archivo);
    this.ext = this.obtenerExtensionDeArchivo(archivo[0]);

    if ( esValido === true) {
        this.operacionRespuesta.EstaEjecutando = true;
        this.fromCatalago.controls['ArchivoBase64'].reset();
        await this.ConvertirArchivoBase64(archivo[0])
        .then( async (base64: any) => {
              this.operacionRespuesta.EstaEjecutando = false;
              this.fromCatalago.controls['ArchivoBase64'].setValue(base64);
              this.fromCatalago.controls['ArchivoBase64'].markAsTouched();
        }).catch(async error => {
              this.operacionRespuesta.EstaEjecutando = false;
              this.fromCatalago.controls['ArchivoBase64'].reset();
              this.fromCatalago.controls['ArchivoBase64'].markAsTouched();
       });
    }
  }

  public async procesarPersistencia() {
    if (this.fromCatalago.invalid) {
        this.fromCatalago.controls['ArchivoBase64'].markAsTouched();
        this.fromCatalago.controls['c_nombre'].markAsTouched();
    }
    const id = this.fromCatalago.controls.i_id.value;
    await this.actulizarPlantilla();
  }

  public seleccionarPlantillaActual(i_id: number): void {
     if (i_id > 0) {
        const param = { i_id: i_id.toString() };
        this.operacionRespuesta.EstaEjecutando = true;
        this.services.HttpPost(param,`${this.modelo_configuracion.serviciosCatalogos}/ActulizarPlantillaDocTransmision/SeleccionaPlantilla`)
        .subscribe(async (respuesta: any) => {
            this.operacionRespuesta.EstaEjecutando = false;
            if (respuesta?.response[0]?.proceso_exitoso === true) {
                await this.CargarListaPlantillas();
            } else {
              this.openMensajes(["No se pudo realizar la acción"], []);
            }
        },(error) => { this.operacionRespuesta.EstaEjecutando = false; });
     }
  }

  public async editarElementoPlantilla(item: CatalogoPlantillaTransmisionResponse) {
    this.aux_id = item.i_id;
    if (item) {
       this.fromCatalago.reset();
       this.fromCatalago.controls['ArchivoBase64'].clearValidators();
       this.fromCatalago.controls['ArchivoBase64'].updateValueAndValidity();
       this.fromCatalago.controls['i_id'].setValue(item.i_id);
       this.fromCatalago.controls['c_nombre'].setValue(item.c_nombre);
       this.operacionTituloModel = 'Modificar plantilla';
       const modeloOperaciones = this.modalService.open(this.modalOperaciones, { ariaLabelledBy: 'modal-basic-title', size: 'lg' });
       await modeloOperaciones.result.then(async () => { },() => {
             this.CargarListaPlantillas();
        });
    }
  }

  public bajaElementoPlantilla(item: CatalogoPlantillaTransmisionResponse): void {
     this.itemSeleccionado = null;
     this.itemSeleccionado = item;
     const modalref = this.modalService.open(this.ModalConfirmacion, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
  }

  public eliminarPlantilla(): void {
      if ( this.itemSeleccionado) {
        const param = {
           i_id: this.itemSeleccionado.i_id.toString(),
           c_nombre: this.itemSeleccionado.c_nombre,
           c_ruta: this.itemSeleccionado.c_ruta,
        };
        this.services.HttpPost(param,`${this.modelo_configuracion.serviciosCatalogos}/BorrarPlantillaDocTransmision/Post`)
          .subscribe( async (respuesta: any) => {
            this.operacionRespuesta.EstaEjecutando = false;
            if (respuesta?.response[0]?.proceso_exitoso === true) {
                 this.modalService.dismissAll();
                 this.openMensajes([], ["La plantilla se eliminó de forma exitosa."]);
                 await this.CargarListaPlantillas();
            } else {
              this.openMensajes(["No se pudo realizar la acción"], []);
            }
        },(error) =>  this.operacionRespuesta.EstaEjecutando = false );

      }
  }

  //#endregion

  //#region Métodos privados
  private iniFormulario(): void {
    this.fromCatalago = this.form.group({
      i_id: [""],
      c_nombre: [null, Validators.required],
      ArchivoBase64: [null, Validators.required],
    });
  }

  private inicializaTabla(): void {
    this.dtOptions = this.themeConstants.dtOptions;
    this.dtTrigger = new Subject();
  }

  private renderTabla(): void {
    if ("dtInstance" in this.dtElement) {
      this.dtElement.dtInstance.then((instancia: DataTables.Api) => {
        instancia.destroy();
        this.dtTrigger.next();
      });
    } else {
      this.dtTrigger.next();
    }
  }

  private CargarListaPlantillas(): void {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services.HttpGet(`${this.modelo_configuracion.serviciosCatalogos}/ConsultaListaPlantillaDocTransmision/Get`)
    .subscribe((respuesta: any) => {
        this.operacionRespuesta.EstaEjecutando = false;
        if (respuesta) {
          this.listcatalogo = respuesta as CatalogoPlantillaTransmisionResponse[];
          this.renderTabla();
          // console.log("listcatalogo", this.listcatalogo);
        } else {
          this.listcatalogo = [];
          this.renderTabla();
        }
    },(error) => this.operacionRespuesta.EstaEjecutando = false );



  }

  private ejecutaProcesoValidacion(archivo: File): boolean {
      let sonValidos = true;
      const arg  = this.obtenerExtension(archivo[0].type);
      const esValidoTamanio = this.esValidoElTamanoArchivo(archivo[0].size);
      //if (arg === 'vnd.openxmlformats-officedocument.wordprocessingml.document' && esValidoTamanio) {
      if (esValidoTamanio) {
        return sonValidos;
      } else {
        sonValidos = false;
        this.fromCatalago.controls['ArchivoBase64'].reset();
        this.fromCatalago.controls['ArchivoBase64'].markAsTouched();
      }

      return sonValidos;
  }

  private obtenerExtension(tipo: string): string {
    const arg = tipo.split('/');
    return arg.length > 0 ? `${arg[1]}` : 'docx';
  }

  private esValidoElTamanoArchivo(tamanio: number): boolean {
    if (Math.round(tamanio / 1024) < Math.round(3000000 / 1024)  ) {
      return true;
    } else {
      return false;
    }
  }

  private obtenerExtensionDeArchivo(archivo) {
    const nombreCompleto = archivo.name;
    const ultimoPunto = nombreCompleto.lastIndexOf(".");

    if (ultimoPunto !== -1) {
      const extension = nombreCompleto.slice(ultimoPunto + 1);
      return extension;
    } else {
      return "Sin extensión";
    }
  }

  async ConvertirArchivoBase64(archivoActual: File) {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();
      reader.onloadend  = () => {
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(archivoActual as Blob);
    });
  }

  private async insertarPlantilla() {
        const param = {
            c_nombre: this.fromCatalago.controls["c_nombre"].value,
            ArchivoBase64: this.fromCatalago.controls["ArchivoBase64"].value,
        };
        this.operacionRespuesta.EstaEjecutando = true;
        await this.services.postAsync(param,`${this.modelo_configuracion.serviciosCatalogos}/InsertarPlantillaDocTransmision/Post`)
        .then(async (respuesta: any) => {
            this.operacionRespuesta.EstaEjecutando = false;
            if (respuesta?.response[0]?.proceso_exitoso === true) {
              this.fromCatalago.reset();
              this.modalService.dismissAll(this.modalOperaciones);
              this.openMensajes([], ["Se guardo la información de forma exitosa."]);
            } else {
              this.openMensajes(["No se pudo realizar la acción"], []);
            }
        }).catch(async error => {
           this.operacionRespuesta.EstaEjecutando = false;
        });
  }

  private async actulizarPlantilla() {
        const param = {
          i_id: this.fromCatalago.controls.i_id.value.toString(),
          c_nombre: this.fromCatalago.controls["c_nombre"].value + '.' + this.ext,
          ArchivoBase64: this.fromCatalago.controls["ArchivoBase64"].value,
        };

        // console.log(param);
      this.operacionRespuesta.EstaEjecutando = true;
      await this.services.postAsync(param,`${this.modelo_configuracion.serviciosCatalogos}/ActulizarPlantillaDocTransmision/Post`)
      .then(async (respuesta: any) => {
          this.operacionRespuesta.EstaEjecutando = false;
          if (respuesta?.response[0]?.proceso_exitoso === true) {
            this.fromCatalago.reset();
            this.modalService.dismissAll(this.modalOperaciones);
            this.openMensajes([], ["Se guardo la información de forma exitosa."]);
          } else {
            this.openMensajes(["No se pudo realizar la acción"], []);
          }
      }).catch(async error => {
         this.operacionRespuesta.EstaEjecutando = false;
      });
  }

  private openMensajes(Errores: string[], Mensajes: string[]): void {
    this.modalrefMsg = this.modalService.open(ModuloModalMensajeComponent, { ariaLabelledBy: "modal-basic-title"});
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
  //#endregion
}
