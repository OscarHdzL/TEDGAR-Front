import { Component, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { NgbModalRef, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { DataTableDirective } from "angular-datatables";
import { Subject } from "rxjs";
import { ThemeConstants } from "src/app/@espire/shared/config/theme-constant";
import { AuthGuard } from "src/app/guards/AuthGuard";
import {
  BorraCatalagoColoniaRequest,
  BorraCatalogoColoniaResponse,
  CatalogoColoniaInsertRequest,
  CatalogoColoniaInsertResponse,
  ConsultaListaCatalogoColoniaResponse,
  EditarCatalogoColoniaRequest,
  EditarCatalogoColoniaResponse,
} from "src/app/model/Catalogos/CatalogoColonia";
import { ConsultaListaCatalogoMunicipioResponse } from "src/app/model/Catalogos/CatalogoMunicipio";
import { RespuestaGenerica } from "src/app/model/Operaciones/generales/RespuestaGenerica";
import { ServiciosRutas } from "src/app/model/Operaciones/generales/ServiciosRutas";
import { ServiceGenerico } from "src/app/services/service-generico.service";
import { ModuloModalMensajeComponent } from "src/app/shared/modulo-modal-mensaje/modulo-modal-mensaje.component";
import { ModuloFormularioCreacionSjuridicaComponent } from "../../modulo-gestion-catalogos/modulo-formulario-creacion-sjuridica/modulo-formulario-creacion-sjuridica.component";
import { ModuloFormularioEdicionSjuridicaComponent } from "../../modulo-gestion-catalogos/modulo-formulario-edicion-sjuridica/modulo-formulario-edicion-sjuridica.component";
import { ModuloFormularioCreacionColoniaComponent } from "../modulo-formulario-creacion-colonia/modulo-formulario-creacion-colonia.component";
import { ModuloFormularioEdicionColoniaComponent } from "../modulo-formulario-edicion-colonia/modulo-formulario-edicion-colonia.component";

@Component({
  selector: "app-modulo-list-colonia",
  templateUrl: "./modulo-list-colonia.component.html",
  styleUrls: ["./modulo-list-colonia.component.scss"],
  providers: [ServiceGenerico],
})
export class ModuloListColoniaComponent implements OnInit {
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  recordsTotal: number;

  isDtInitialized: boolean = false;
  public BorraCatalogoColonia: BorraCatalagoColoniaRequest;
  modalrefCreacion: NgbModalRef;
  modalrefEdicion: NgbModalRef;
  modalrefMsg: NgbModalRef;
  listMunicipios: ConsultaListaCatalogoMunicipioResponse[];
  closeResult = "";

  private modelo_configuracion: ServiciosRutas;
  public operacionRespuesta: RespuestaGenerica;
  respuesta: CatalogoColoniaInsertResponse[];
  RespuestaBorradoCatalogo: BorraCatalogoColoniaResponse;
  RespuestaEditardoCatalogo: EditarCatalogoColoniaResponse;
  mensajesExito: string[];
  mensajesError: string[];
  showErrors = false;
  showExitos = false;

  listcatalogo: Array<ConsultaListaCatalogoColoniaResponse> = [];
  constructor(
    private themeConstants: ThemeConstants,
    public modalService: NgbModal,
    private auth: AuthGuard,
    private services: ServiceGenerico,
    private router: Router
  ) {
    this.BorraCatalogoColonia = new BorraCatalagoColoniaRequest();
    this.operacionRespuesta = new RespuestaGenerica();
    this.modelo_configuracion = new ServiciosRutas();
    this.RespuestaBorradoCatalogo = new BorraCatalogoColoniaResponse();
  }

  async ngOnInit() {
    await this.inicializaTabla();
    await this.llenarTablaColonias();
    this.obtenerMunicipios();
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

  obtenerMunicipios() {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpGet(
        this.modelo_configuracion.serviciosCatalogos +
          "/ConsultaListaCatalogosMunicipio/Get"
      )
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.listMunicipios = [] =
              tempdate.response as ConsultaListaCatalogoMunicipioResponse[];
          } else {
            this.listMunicipios = [];
          }
          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.operacionRespuesta.EstaEjecutando = false;
        }
      );
  }

  public async llenarTablaColonias() {
    this.dtOptions.serverSide = true;

    this.dtOptions.ajax = (dataTablesParameters: any, callback) => {
      this.services
        .HttpPost(
          dataTablesParameters,
          this.modelo_configuracion.serviciosCatalogos +
            `/ConsultaListaCatalogosColonia/ConteoColonias?c_activo=${true}`
        )
        .subscribe(
          async (count) => {
            if (count) {
              this.recordsTotal = count.response[0].totalrecords;
              this.services
                .HttpPost(
                  dataTablesParameters,
                  this.modelo_configuracion.serviciosCatalogos +
                    `/ConsultaListaCatalogosColonia/ListaColonias?c_activo=${true}`
                )
                .subscribe(async (tempdate) => {
                  if (tempdate) {
                    this.listcatalogo = await tempdate.response;
                    callback({
                      recordsTotal: await this.recordsTotal,
                      recordsFiltered: await this.recordsTotal,
                      data: [],
                    });
                  } else {
                    this.listcatalogo = [];
                    callback({
                      recordsTotal: 0,
                      recordsFiltered: 0,
                      data: [],
                    });
                  }
                });
            }
          },
          (error) => {
            this.listcatalogo = [];
          }
        );
    };
    this.dtOptions.columns = [{ data: "c_nombre" }, { data: "c_municipio" }];
  }

  open() {
    this.modalrefCreacion = this.modalService.open(
      ModuloFormularioCreacionColoniaComponent,
      { ariaLabelledBy: "modal-basic-title", size: "lg" }
    );
    this.modalrefCreacion.componentInstance.registrarCatalogo.subscribe(
      ($e) => {
        if (!this.operacionRespuesta.EstaEjecutando) this.registrarCatalogo($e);
      }
    );
    this.modalrefCreacion.componentInstance.listMunicipios =
      this.listMunicipios;
  }
  openEdicion(catalogoEditar: ConsultaListaCatalogoColoniaResponse) {
    this.modalrefEdicion = this.modalService.open(
      ModuloFormularioEdicionColoniaComponent,
      { ariaLabelledBy: "modal-basic-title", size: "lg" }
    );
    this.modalrefEdicion.componentInstance.ActualizarCatalogo.subscribe(
      ($e) => {
        if (!this.operacionRespuesta.EstaEjecutando) this.EditarCatalogo($e);
      }
    );
    this.modalrefEdicion.componentInstance.catalogoEditar = catalogoEditar;
    this.modalrefEdicion.componentInstance.listMunicipios = this.listMunicipios;
  }

  OnChange(estado: boolean, idcatalogo: number) {
    var borrarcatalogo = new BorraCatalagoColoniaRequest();
    borrarcatalogo.c_id = idcatalogo;
    borrarcatalogo.c_activo = !estado;
    this.BorraCatalogo(borrarcatalogo);
  }

  openMensajes() {
    this.modalrefMsg = this.modalService.open(ModuloModalMensajeComponent, {
      ariaLabelledBy: "modal-basic-title",
    });

    this.modalrefMsg.componentInstance.mensajesExito = this.mensajesExito;
    this.modalrefMsg.componentInstance.mensajesError = this.mensajesError;
    this.modalrefMsg.componentInstance.showErrors = this.showErrors;
    this.modalrefMsg.componentInstance.showExitos = this.showExitos;
  }

  registrarCatalogo(catalogosInsert: CatalogoColoniaInsertRequest) {
    this.operacionRespuesta.EstaEjecutando = true;
    this.resetMensajes();

    this.services
      .HttpPost(
        catalogosInsert,
        this.modelo_configuracion.serviciosCatalogos +
          "/InsertarCatalogosColonia/Post"
      )
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.RespuestaEditardoCatalogo = tempdate
              .response[0] as EditarCatalogoColoniaResponse;

            if (this.RespuestaEditardoCatalogo.proceso_exitoso) {
              this.showExitos = true;
              this.mensajesExito.push(this.RespuestaEditardoCatalogo.mensaje);
              this.llenarTablaColonias();
            } else {
              this.showErrors = true;
              this.mensajesError.push(this.RespuestaEditardoCatalogo.mensaje);
            }
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

  BorraCatalogo(catalogoDesactivar: BorraCatalagoColoniaRequest) {
    this.operacionRespuesta.EstaEjecutando = true;
    this.resetMensajes();
    this.services
      .HttpPost(
        catalogoDesactivar,
        this.modelo_configuracion.serviciosCatalogos +
          "/BorraCatalogoColonia/Post"
      )
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.RespuestaBorradoCatalogo = tempdate
              .response[0] as BorraCatalogoColoniaResponse;
            if (this.RespuestaBorradoCatalogo.proceso_exitoso) {
              this.llenarTablaColonias();
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
  EditarCatalogo(catalogoEditar: EditarCatalogoColoniaRequest) {
    this.resetMensajes();

    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpPost(
        catalogoEditar,
        this.modelo_configuracion.serviciosCatalogos +
          "/ActualizarCatalogoColonia/Post"
      )
      .subscribe(
        async (tempdate) => {
          if (tempdate) {
            this.RespuestaEditardoCatalogo = tempdate
              .response[0] as EditarCatalogoColoniaResponse;

            if (this.RespuestaEditardoCatalogo.proceso_exitoso) {
              this.llenarTablaColonias();
              this.showExitos = true;
              this.mensajesExito.push(this.RespuestaEditardoCatalogo.mensaje);
            } else {
              this.showErrors = true;
              this.mensajesError.push(this.RespuestaEditardoCatalogo.mensaje);
            }

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
