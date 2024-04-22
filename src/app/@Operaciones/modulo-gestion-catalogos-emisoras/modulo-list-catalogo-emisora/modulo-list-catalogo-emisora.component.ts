import {
  Component,
  OnInit,
  ViewChild
} from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { ModuloModalMensajeComponent } from 'src/app/shared/modulo-modal-mensaje/modulo-modal-mensaje.component';
import { ThemeConstants } from '../../../@espire/shared/config/theme-constant';
import { AuthGuard } from '../../../guards/AuthGuard';
import {
  BorraCatalagoEmisoraRequest,
  BorraCatalogoEmisoraResponse,
  CatalogoEmisoraInsertRequest,
  CatalogoEmisoraInsertResponse,
  ConsultaListaCatalogoEmisoraResponse,
  EditarCatalogoEmisoraRequest,
  EditarCatalogoEmisoraResponse
} from '../../../model/Catalogos/CatalogosEmisora';
import { RespuestaGenerica } from '../../../model/Operaciones/generales/RespuestaGenerica';
import { ServiciosRutas } from '../../../model/Operaciones/generales/ServiciosRutas';
import { ServiceGenerico } from '../../../services/service-generico.service';import { ModuloFormularioCreacionEmisoraComponent } from '../modulo-formulario-creacion-emisora/modulo-formulario-creacion-emisora.component';
import { ModuloFormularioEdicionEmisoraComponent } from '../modulo-formulario-edicion-emisora/modulo-formulario-edicion-emisora.component';
@Component({
    selector: 'app-modulo-list-catalogo-emisora',
    templateUrl: './modulo-list-catalogo-emisora.component.html',
  styleUrls: ['./modulo-list-catalogo-emisora.component.css'],
  providers: [ServiceGenerico]
})

export class ModuloListCatalogoEmisoraComponent implements OnInit{
  
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  isDtInitialized: boolean = false;
  public BorraCatalogosEmisora: BorraCatalagoEmisoraRequest;
  modalrefCreacion: NgbModalRef;
  modalrefEdicion: NgbModalRef;
  modalrefMsg: NgbModalRef;

  closeResult = "";

  private modelo_configuracion: ServiciosRutas;
  public operacionRespuesta: RespuestaGenerica;
  respuesta: CatalogoEmisoraInsertResponse[];
  RespuestaBorradoCatalogo: BorraCatalogoEmisoraResponse;
  RespuestaEditardoCatalogo: EditarCatalogoEmisoraResponse;
  mensajesExito: string[];
  mensajesError: string[];
  showErrors = false;
  showExitos = false;

  listcatalogo: Array<ConsultaListaCatalogoEmisoraResponse> =
    [];

  constructor(private themeConstants: ThemeConstants,
    public modalService: NgbModal,
    private auth: AuthGuard,
    private services: ServiceGenerico,
    private router: Router) {
    this.BorraCatalogosEmisora = {} as BorraCatalagoEmisoraRequest;
    this.operacionRespuesta = new RespuestaGenerica();
    this.modelo_configuracion = new ServiciosRutas();
    this.RespuestaBorradoCatalogo = {} as BorraCatalogoEmisoraResponse;
  }


  ngOnInit(): void {
    this.inicializaTabla();
    this.obtenerCatalogos();
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

  open() {
    this.modalrefCreacion = this.modalService.open(
      ModuloFormularioCreacionEmisoraComponent,
      { ariaLabelledBy: "modal-basic-title", size: "lg" }
    );
    this.modalrefCreacion.componentInstance.registrarCatalogo.subscribe(
      ($e) => {
        if (!this.operacionRespuesta.EstaEjecutando) this.registrarCatalogo($e);
      }
    );
  }
  openEdicion( catalogoEditar: EditarCatalogoEmisoraRequest ) {
    this.modalrefEdicion = this.modalService.open(
      ModuloFormularioEdicionEmisoraComponent,
      { ariaLabelledBy: "modal-basic-title", size: "lg" }
    );
    this.modalrefEdicion.componentInstance.ActualizarCatalogo.subscribe(
      ($e) => {
        if (!this.operacionRespuesta.EstaEjecutando) this.EditarCatalogo($e);
      }
    );
    this.modalrefEdicion.componentInstance.catalogoEditar = catalogoEditar;
  }
  openMensajes() {
    this.modalrefMsg = this.modalService.open(
      ModuloModalMensajeComponent,
      { ariaLabelledBy: "modal-basic-title", }
    );
    
    this.modalrefMsg.componentInstance.mensajesExito = this.mensajesExito;
    this.modalrefMsg.componentInstance.mensajesError = this.mensajesError;
    this.modalrefMsg.componentInstance.showErrors = this.showErrors;
    this.modalrefMsg.componentInstance.showExitos = this.showExitos;
  }

  OnChange(estado: boolean, idcatalogo: number) {
    var borrarcatalogo = {} as BorraCatalagoEmisoraRequest;
    borrarcatalogo.id = idcatalogo;
    borrarcatalogo.activo = estado ? 0 : 1;
    this.BorraCatalogo(borrarcatalogo);
  }

  obtenerCatalogos() {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpGet(
        this.modelo_configuracion.serviciosCatalogos +
        "/CatalogoMediosTransmision/Get"
      )
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.listcatalogo = [] = tempdate.response as ConsultaListaCatalogoEmisoraResponse[];
            this.renderTabla();
          } else {
            this.listcatalogo = [];
            this.renderTabla();
          }
          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.operacionRespuesta.EstaEjecutando = false;
        }
      );
  }

  registrarCatalogo(catalogosInsert: CatalogoEmisoraInsertRequest) {
    this.operacionRespuesta.EstaEjecutando = true;
    this.resetMensajes();
    this.services
      .HttpPost(
        catalogosInsert,
        this.modelo_configuracion.serviciosCatalogos +
        "/CatalogoMediosTransmision/Post"
      )
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.showExitos = true;
            this.mensajesExito.push("El componente se agregó correctamente");
            this.obtenerCatalogos();
          } else {
            this.showErrors = true;
            this.mensajesError.push("No se pudo realizar la acción");
          }

          this.modalrefCreacion.close();
          this.operacionRespuesta.EstaEjecutando = false;
          this.openMensajes();
        },
        async (err) => {
          this.showErrors = true;
          this.mensajesError.push("No se pudo realizar la acción");
          this.modalrefCreacion.close();
          this.operacionRespuesta.EstaEjecutando = false;
          this.openMensajes();
        }
      );
  }

  BorraCatalogo( catalogoDesactivar: BorraCatalagoEmisoraRequest ) {
    this.operacionRespuesta.EstaEjecutando = true;
    this.resetMensajes();
    this.services
      .HttpPost(
        catalogoDesactivar,
        this.modelo_configuracion.serviciosCatalogos +
        "/CatalogoMediosTransmision/Delete"
      )
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.RespuestaBorradoCatalogo =
              tempdate.response[0] as BorraCatalogoEmisoraResponse;
            if (this.RespuestaBorradoCatalogo.proceso_exitoso) {
              this.showExitos = true;
              this.mensajesExito.push(this.RespuestaBorradoCatalogo.mensaje);
            } else {
              this.showErrors = true;
              this.mensajesError.push(this.RespuestaBorradoCatalogo.mensaje);
            }
          } else {
            this.showErrors = true;
            this.mensajesError.push("No se pudo realizar la acción");
          }

          this.obtenerCatalogos();
          this.operacionRespuesta.EstaEjecutando = false;
          this.openMensajes();
        },
        async (err) => {
          this.operacionRespuesta.EstaEjecutando = false;
          this.showErrors = true;
          this.mensajesError.push("No se pudo realizar la acción");
          this.openMensajes();
        }
      );
  }
  EditarCatalogo(
    catalogoEditar: EditarCatalogoEmisoraRequest
  ) {
    this.resetMensajes();

    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpPut(
        catalogoEditar,
        this.modelo_configuracion.serviciosCatalogos +
        "/CatalogoMediosTransmision/Put"
      )
      .subscribe(
        async (tempdate) => {
          if (tempdate) {
            this.showExitos = true;
            this.mensajesExito.push("El componente se edito correctamente");
            this.obtenerCatalogos();
          } else {
            this.showErrors = true;
            this.mensajesError.push("No se pudo realizar la acción");
          }
          this.modalrefEdicion.close();
          this.operacionRespuesta.EstaEjecutando = false;
          this.openMensajes();
        },
        async (err) => {
          this.modalrefEdicion.close();
          this.operacionRespuesta.EstaEjecutando = false;
          this.showErrors = true;
          this.mensajesError.push("No se pudo realizar la acción");
          this.openMensajes();
        }
      );
  }
  resetMensajes() {
    this.showErrors = false;
    this.showExitos = false;
    this.mensajesExito = [];
    this.mensajesError = [];
  }



}
