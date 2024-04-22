import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { ThemeConstants } from '../../../@espire/shared/config/theme-constant';
import { AuthGuard } from '../../../guards/AuthGuard';
import { BorraCatalagoPaisoRequest, BorraCatalogoPaisoResponse, CatalogoPaisoInsertRequest, CatalogoPaisoInsertResponse, ConsultaListaCatalogoPaisoResponse, EditarCatalogoPaisoRequest, EditarCatalogoPaisoResponse } from '../../../model/Catalogos/CatalogosPaiso';
import { RespuestaGenerica } from '../../../model/Operaciones/generales/RespuestaGenerica';
import { ServiciosRutas } from '../../../model/Operaciones/generales/ServiciosRutas';
import { ServiceGenerico } from '../../../services/service-generico.service';
import { ModuloModalMensajeComponent } from '../../../shared/modulo-modal-mensaje/modulo-modal-mensaje.component';
import { ModuloFormularioCreacionPaisoComponent } from '../modulo-formulario-creacion-paiso/modulo-formulario-creacion-paiso.component';
import { ModuloFormularioEdicionPaisoComponent } from '../modulo-formulario-edicion-paiso/modulo-formulario-edicion-paiso.component';

@Component({
    selector: 'app-modulo-list-catalogo-paiso',
    templateUrl: './modulo-list-catalogo-paiso.component.html',
  styleUrls: ['./modulo-list-catalogo-paiso.component.css'],
  providers: [ServiceGenerico]
})
/** modulo-list-catalogo-paiso component*/
export class ModuloListCatalogoPaisoComponent implements OnInit{

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  isDtInitialized: boolean = false;
  public BorraCatalogosCredo: BorraCatalagoPaisoRequest;
  modalrefCreacion: NgbModalRef;
  modalrefEdicion: NgbModalRef;
  modalrefMsg: NgbModalRef;

  closeResult = "";

  private modelo_configuracion: ServiciosRutas;
  public operacionRespuesta: RespuestaGenerica;
  respuesta: CatalogoPaisoInsertResponse[];
  RespuestaBorradoCatalogo: BorraCatalogoPaisoResponse;
  RespuestaEditardoCatalogo: EditarCatalogoPaisoResponse;
  mensajesExito: string[];
  mensajesError: string[];
  showErrors = false;
  showExitos = false;

  listcatalogo: Array<ConsultaListaCatalogoPaisoResponse> =
    [];
    /** modulo-list-catalogo-paiso ctor */
  constructor(private themeConstants: ThemeConstants,
    public modalService: NgbModal,
    private auth: AuthGuard,
    private services: ServiceGenerico,
    private router: Router) {
    this.BorraCatalogosCredo =
      new BorraCatalagoPaisoRequest();
    this.operacionRespuesta = new RespuestaGenerica();
    this.modelo_configuracion = new ServiciosRutas();
    this.RespuestaBorradoCatalogo =
      new BorraCatalogoPaisoResponse();
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
      ModuloFormularioCreacionPaisoComponent,
      { ariaLabelledBy: "modal-basic-title", size: "lg" }
    );
    this.modalrefCreacion.componentInstance.registrarCatalogo.subscribe(
      ($e) => {
        if (!this.operacionRespuesta.EstaEjecutando) this.registrarCatalogo($e);
      }
    );
  }
  openEdicion(
    catalogoEditar: EditarCatalogoPaisoRequest
  ) {
    this.modalrefEdicion = this.modalService.open(
      ModuloFormularioEdicionPaisoComponent,
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
    var borrarcatalogo = new BorraCatalagoPaisoRequest();
    borrarcatalogo.c_id = idcatalogo;
    borrarcatalogo.c_activo = !estado;
    this.BorraCatalogo(borrarcatalogo);
  }

  obtenerCatalogos() {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpGet(
        this.modelo_configuracion.serviciosCatalogos +
        "/ConsultaListaCatalogosPaiso/Get"
      )
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.listcatalogo = [] =
              tempdate.response as ConsultaListaCatalogoPaisoResponse[];
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

  registrarCatalogo(
    catalogosInsert: CatalogoPaisoInsertRequest
  ) {
    this.operacionRespuesta.EstaEjecutando = true;
    this.resetMensajes();
    this.services
      .HttpPost(
        catalogosInsert,
        this.modelo_configuracion.serviciosCatalogos +
        "/InsertarCatalogosPaiso/Post"
      )
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.mensajesError = [];
            this.mensajesExito = [];
            this.respuesta =
              tempdate.response as CatalogoPaisoInsertResponse[];
            this.respuesta.forEach((c) => {
              if (c.proceso_exitoso) this.mensajesExito.push(c.mensaje);
              else this.mensajesError.push(c.mensaje);
            });
            if (this.mensajesError.length > 0) this.showErrors = true;
            if (this.mensajesExito.length > 0) this.showExitos = true;
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

  BorraCatalogo(
    catalogoDesactivar: BorraCatalagoPaisoRequest
  ) {
    this.operacionRespuesta.EstaEjecutando = true;
    this.resetMensajes();
    this.services
      .HttpPost(
        catalogoDesactivar,
        this.modelo_configuracion.serviciosCatalogos +
        "/BorraCatalogoPaiso/Post"
      )
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.RespuestaBorradoCatalogo =
              tempdate.response[0] as BorraCatalogoPaisoResponse;
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
    catalogoEditar: EditarCatalogoPaisoRequest
  ) {
    this.resetMensajes();

    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpPost(
        catalogoEditar,
        this.modelo_configuracion.serviciosCatalogos +
        "/ActualizarCatalogoPaiso/Post"
      )
      .subscribe(
        async (tempdate) => {
          if (tempdate) {
            this.RespuestaEditardoCatalogo = tempdate
              .response[0] as EditarCatalogoPaisoResponse;

            if (this.RespuestaEditardoCatalogo.proceso_exitoso) {
              this.showExitos = true;
              this.mensajesExito.push(this.RespuestaEditardoCatalogo.mensaje);
            } else {
              this.showErrors = true;
              this.mensajesError.push(this.RespuestaEditardoCatalogo.mensaje);
            }

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
