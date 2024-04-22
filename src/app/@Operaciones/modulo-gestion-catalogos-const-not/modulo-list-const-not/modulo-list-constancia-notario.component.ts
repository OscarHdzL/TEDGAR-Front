import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import { Router } from "@angular/router";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { DataTableDirective } from "angular-datatables";
import { Subject } from "rxjs";
import { ThemeConstants } from "src/app/@espire/shared/config/theme-constant";
import { AuthGuard } from "src/app/guards/AuthGuard";
import {
  BorraCatalagoConstanciaNotarioArraigoRequest,
  BorraCatalogoConstanciaNotarioArraigoResponse,
  CatalogoConstanciaNotarioArraigoInsertRequest,
  CatalogoConstanciaNotarioArraigoInsertResponse,
  ConsultaListaCatalogoConstanciaNotarioArraigoResponse,
  EditarCatalogoConstanciaNotarioArraigoRequest,
  EditarCatalogoConstanciaNotarioArraigoResponse,
} from "src/app/model/Catalogos/CatalogosConstanciaNotarioArraigo";
import { RespuestaGenerica } from "src/app/model/Operaciones/generales/RespuestaGenerica";
import { ServiciosRutas } from "src/app/model/Operaciones/generales/ServiciosRutas";
import { ServiceGenerico } from "src/app/services/service-generico.service";
import { ModuloModalMensajeComponent } from "src/app/shared/modulo-modal-mensaje/modulo-modal-mensaje.component";
import { ModuloFormularioCreacionConstanciaNotarioComponent } from "../modulo-formulario-creacion-const-not/modulo-form-creacion-const-not.component";
import { ModuloFormularioEdicionConstanciaNotarioComponent } from "../modulo-formulario-edicion-const-not/modulo-form-edicion-const-not.component";

@Component({
  selector: "app-modulo-list-constancia-notario",
  templateUrl: "./modulo-list-constancia-notario.component.html",
  styleUrls: ["./modulo-list-constancia-notario.component.css"],
  providers: [ServiceGenerico],
})
export class ModuloListConstanciaNotarioComponent implements OnInit {
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  isDtInitialized: boolean = false;
  public BorraCatalogoConstanciaNotarioArraigo: BorraCatalagoConstanciaNotarioArraigoRequest;
  modalrefCreacion: NgbModalRef;
  modalrefEdicion: NgbModalRef;
  modalrefMsg: NgbModalRef;

  private modelo_configuracion: ServiciosRutas;
  public operacionRespuesta: RespuestaGenerica;
  respuesta: CatalogoConstanciaNotarioArraigoInsertResponse[];
  RespuestaBorradoCatalogo: BorraCatalogoConstanciaNotarioArraigoResponse;
  RespuestaEditardoCatalogo: EditarCatalogoConstanciaNotarioArraigoResponse;
  mensajesExito: string[];
  mensajesError: string[];
  showErrors = false;
  showExitos = false;

  listcatalogo: Array<ConsultaListaCatalogoConstanciaNotarioArraigoResponse> =
    [];
  constructor(
    private themeConstants: ThemeConstants,
    public modalService: NgbModal,
    private auth: AuthGuard,
    private services: ServiceGenerico,
    private router: Router
  ) {
    this.BorraCatalogoConstanciaNotarioArraigo =
      new BorraCatalagoConstanciaNotarioArraigoRequest();
    this.operacionRespuesta = new RespuestaGenerica();
    this.modelo_configuracion = new ServiciosRutas();
    this.RespuestaBorradoCatalogo =
      new BorraCatalogoConstanciaNotarioArraigoResponse();
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
      ModuloFormularioCreacionConstanciaNotarioComponent,
      { ariaLabelledBy: "modal-basic-title", size: "lg" }
    );
    this.modalrefCreacion.componentInstance.registrarCatalogo.subscribe(
      ($e) => {
        if (!this.operacionRespuesta.EstaEjecutando) this.registrarCatalogo($e);
      }
    );
  }
  openEdicion(
    catalogoEditar: ConsultaListaCatalogoConstanciaNotarioArraigoResponse
  ) {
    this.modalrefEdicion = this.modalService.open(
      ModuloFormularioEdicionConstanciaNotarioComponent,
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
    var borrarcatalogo = new BorraCatalagoConstanciaNotarioArraigoRequest();
    borrarcatalogo.c_id = idcatalogo;
    borrarcatalogo.c_activo = !estado;
    this.BorraCatalogo(borrarcatalogo);
  }

  obtenerCatalogos() {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpGet(
        this.modelo_configuracion.serviciosCatalogos +
          "/ConsultaListaCatalogosCnotarioarr/Get"
      )
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.listcatalogo = [] =
              tempdate.response as ConsultaListaCatalogoConstanciaNotarioArraigoResponse[];
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
    catalogosInsert: CatalogoConstanciaNotarioArraigoInsertRequest[]
  ) {
    this.operacionRespuesta.EstaEjecutando = true;
    this.resetMensajes();
    this.services
      .HttpPost(
        catalogosInsert,
        this.modelo_configuracion.serviciosCatalogos +
          "/InsertarCatalogosCnotarioarr/Post"
      )
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.mensajesError = [];
            this.mensajesExito = [];
            this.respuesta =
              tempdate.response as CatalogoConstanciaNotarioArraigoInsertResponse[];
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
    catalogoDesactivar: BorraCatalagoConstanciaNotarioArraigoRequest
  ) {
    this.operacionRespuesta.EstaEjecutando = true;
    this.resetMensajes();
    this.services
      .HttpPost(
        catalogoDesactivar,
        this.modelo_configuracion.serviciosCatalogos +
          "/BorraCatalogoCnotarioarr/Post"
      )
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.RespuestaBorradoCatalogo =
              tempdate.response[0] as BorraCatalogoConstanciaNotarioArraigoResponse;
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
          this.openMensajes();
          this.obtenerCatalogos();
          this.operacionRespuesta.EstaEjecutando = false;
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
    catalogoEditar: EditarCatalogoConstanciaNotarioArraigoRequest
  ) {
    this.resetMensajes();

    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpPost(
        catalogoEditar,
        this.modelo_configuracion.serviciosCatalogos +
          "/ActualizarCatalogoCnotarioarr/Post"
      )
      .subscribe(
        async (tempdate) => {
          if (tempdate) {
            this.RespuestaEditardoCatalogo = tempdate
              .response[0] as EditarCatalogoConstanciaNotarioArraigoResponse;

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
