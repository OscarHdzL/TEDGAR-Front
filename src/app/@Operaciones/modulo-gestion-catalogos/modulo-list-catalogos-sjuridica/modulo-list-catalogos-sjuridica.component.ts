import { Component, OnInit, ViewChild } from "@angular/core";

import { Subject } from "rxjs";
import { DataTableDirective } from "angular-datatables";
import { RespuestaGenerica } from "src/app/model/Operaciones/generales/RespuestaGenerica";
import { ThemeConstants } from "src/app/@espire/shared/config/theme-constant";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { ModuloFormularioCreacionSjuridicaComponent } from "../modulo-formulario-creacion-sjuridica/modulo-formulario-creacion-sjuridica.component";
import {
  BorraCatalagoSJuridicaRequest,
  BorraCatalogoSJuridicaResponse,
  CatalogoSJuridicaInsertRequest,
  ConsultaListaCatalogoSJuridicaResponse,
  ActualizarCatalogoSJuridicaRequest,
  CatalogoSJuridicaInsertResponse,
  EditarCatalogoSJuridicaResponse,
} from "src/app/model/Catalogos/CatalogosSJuridica";
import { ModuloFormularioEdicionSjuridicaComponent } from "../modulo-formulario-edicion-sjuridica/modulo-formulario-edicion-sjuridica.component";
import { Router } from "@angular/router";
import { AuthGuard } from "src/app/guards/AuthGuard";
import { ServiciosRutas } from "src/app/model/Operaciones/generales/ServiciosRutas";
import { ServiceGenerico } from "src/app/services/service-generico.service";
import { ModuloModalMensajeComponent } from "src/app/shared/modulo-modal-mensaje/modulo-modal-mensaje.component";

@Component({
  selector: "app-modulo-list-catalogos-sjuridica",
  templateUrl: "./modulo-list-catalogos-sjuridica.component.html",
  styleUrls: ["./modulo-list-catalogos-sjuridica.component.css"],
  providers: [ServiceGenerico],
})
export class ModuloListCatalogosJuridicaComponent implements OnInit {
    dtOptions: DataTables.Settings = {};
    dtTrigger: Subject<any> = new Subject();
    @ViewChild(DataTableDirective, { static: false })
    dtElement: DataTableDirective;
    isDtInitialized: boolean = false;
    public BorraCatalogoSJuridica: BorraCatalagoSJuridicaRequest;
    modalrefCreacion: NgbModalRef;
    modalrefEdicion: NgbModalRef;
    modalrefMsg: NgbModalRef;
  
    closeResult = "";
  
    private modelo_configuracion: ServiciosRutas;
    public operacionRespuesta: RespuestaGenerica;
    respuesta: CatalogoSJuridicaInsertResponse[];
    RespuestaBorradoCatalogo: BorraCatalogoSJuridicaResponse;
    RespuestaEditardoCatalogo: EditarCatalogoSJuridicaResponse;
    mensajesExito: string[];
    mensajesError: string[];
    showErrors = false;
    showExitos = false;
  
    listcatalogo: Array<ConsultaListaCatalogoSJuridicaResponse> =
      [];
    constructor(
      private themeConstants: ThemeConstants,
      public modalService: NgbModal,
      private auth: AuthGuard,
      private services: ServiceGenerico,
      private router: Router
    ) {
      this.BorraCatalogoSJuridica =
        new BorraCatalagoSJuridicaRequest();
      this.operacionRespuesta = new RespuestaGenerica();
      this.modelo_configuracion = new ServiciosRutas();
      this.RespuestaBorradoCatalogo =
        new BorraCatalogoSJuridicaResponse();
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
        ModuloFormularioCreacionSjuridicaComponent,
        { ariaLabelledBy: "modal-basic-title", size: "lg" }
      );
      this.modalrefCreacion.componentInstance.registrarCatalogo.subscribe(
        ($e) => {
          if (!this.operacionRespuesta.EstaEjecutando) this.registrarCatalogo($e);
        }
      );
    }

    openEdicion(
      catalogoEditar: ConsultaListaCatalogoSJuridicaResponse
    ) {
      this.modalrefEdicion = this.modalService.open(
        ModuloFormularioEdicionSjuridicaComponent,
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
      var borrarcatalogo = new BorraCatalagoSJuridicaRequest();
      borrarcatalogo.c_id = idcatalogo;
      borrarcatalogo.c_activo = !estado;
      this.BorraCatalogo(borrarcatalogo);
    }
  
    obtenerCatalogos() {
      this.operacionRespuesta.EstaEjecutando = true;
      this.services
        .HttpGet(
          this.modelo_configuracion.serviciosCatalogos +
            "/ConsultaListaCatalogosSJuridica/Get"
        )
        .subscribe(
          (tempdate) => {
            if (tempdate) {
              this.listcatalogo = [] =
                tempdate.response as ConsultaListaCatalogoSJuridicaResponse[];
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
      catalogosInsert: CatalogoSJuridicaInsertRequest[]
    ) {
      this.operacionRespuesta.EstaEjecutando = true;
      this.resetMensajes();
      this.services
        .HttpPost(
          catalogosInsert,
          this.modelo_configuracion.serviciosCatalogos +
            "/InsertarCatalogosSJuridica/Post"
        )
        .subscribe(
          (tempdate) => {
            if (tempdate) {
              this.mensajesError = [];
              this.mensajesExito = [];
              this.respuesta =
                tempdate.response as CatalogoSJuridicaInsertResponse[];
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
      catalogoDesactivar: BorraCatalagoSJuridicaRequest
    ) {
      this.operacionRespuesta.EstaEjecutando = true;
      this.resetMensajes();
      this.services
        .HttpPost(
          catalogoDesactivar,
          this.modelo_configuracion.serviciosCatalogos +
            "/BorraCatalogoSJuridica/Post"
        )
        .subscribe(
          (tempdate) => {
            if (tempdate) {
              this.RespuestaBorradoCatalogo =
                tempdate.response[0] as BorraCatalogoSJuridicaResponse;
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
      catalogoEditar: ActualizarCatalogoSJuridicaRequest
    ) {
      this.resetMensajes();
  
      this.operacionRespuesta.EstaEjecutando = true;
      this.services
        .HttpPost(
          catalogoEditar,
          this.modelo_configuracion.serviciosCatalogos +
            "/ActualizarCatalogoSJuridica/Post"
        )
        .subscribe(
          async (tempdate) => {
            if (tempdate) {
              this.RespuestaEditardoCatalogo = tempdate
                .response[0] as EditarCatalogoSJuridicaResponse;
  
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
  