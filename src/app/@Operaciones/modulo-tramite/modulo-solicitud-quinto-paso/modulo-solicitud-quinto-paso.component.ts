import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { NgbModalRef, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Subject, Subscription } from "rxjs";
import { AuthGuard } from "src/app/guards/AuthGuard";
import { RespuestaGenerica } from "src/app/model/Operaciones/generales/RespuestaGenerica";
import { ServiciosRutas } from "src/app/model/Operaciones/generales/ServiciosRutas";
import { ServiceGenerico } from "src/app/services/service-generico.service";
import { DataTableDirective } from "angular-datatables";
import { ThemeConstants } from "src/app/@espire/shared/config/theme-constant";
import { route } from "src/app/model/Utilities/route";
import { ModuloFormularioRepresentanteComponent } from "../modulo-formulario-representante/modulo-formulario-representante.component";
import { ModuloPaginacionComponent } from "src/app/shared/modulo-paginacion/modulo-paginacion.component";
import { ActualizarRepresentateRequest } from "src/app/model/Operaciones/Representante/Representante";
import { ModuloModalMensajeComponent } from "src/app/shared/modulo-modal-mensaje/modulo-modal-mensaje.component";
import { AuthIdentity } from "src/app/guards/AuthIdentity";
import { TramiteRoutes } from "src/app/model/Utilities/tramiteRoutes";
import { LocalStorageService } from "../../../services/local-storage.service";
import { TabService } from "../../modulo-declaratoria-procedencia/services/tab.service";
import { SentFile } from "src/app/model/Utilities/File";
import { FileService } from "src/app/services/file.service";

@Component({
  selector: "app-modulo-solicitud-quinto-paso",
  templateUrl: "./modulo-solicitud-quinto-paso.component.html",
  styleUrls: ["./modulo-solicitud-quinto-paso.component.css"],
  providers: [ServiceGenerico],
})
export class ModuloSolicitudQuintoPasoComponent implements OnInit {
  routes: route[];
  response: any;

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  isDtInitialized: boolean = false;

  @ViewChild(ModuloPaginacionComponent, { static: true })
  routescmp: ModuloPaginacionComponent;

  modalrefCreacion: NgbModalRef;
  modalrefEdicion: NgbModalRef;
  modalrefMsg: NgbModalRef;
  isDictaminador: boolean = false;
  id_tramite: number;
  id_bloqueo: number;
  bloqueo: any = false;

  closeResult = "";

  private modelo_configuracion: ServiciosRutas;
  public operacionRespuesta: RespuestaGenerica;

  respuesta: any;
  listtipo = [];

  listrepresentante = [];
  us_id: number;
  titulo: string;
  ineBase64: string = null;
  actaNacBase64: string = null;
  curpBase64: string = null;
  public doctosCompletos: boolean;
  ultimoPasoAlQueTenemosAcceso = Number(localStorage.getItem("ultimoPasoAlQueTenemosAcceso"));
  constructor(
    private themeConstants: ThemeConstants,
    public modalService: NgbModal,
    private auth: AuthGuard,
    private services: ServiceGenerico,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private localStorageService: LocalStorageService,
    public tabService: TabService,
    public fileService: FileService
  ) {
    this.operacionRespuesta = new RespuestaGenerica();
    this.modelo_configuracion = new ServiciosRutas();
    this.validarAcceso();
  }

  ngOnInit(): void {


    this.inicializaTabla();
    this.us_id = AuthIdentity.ObtenerUsuarioRegistro();
    this.isDictaminador = AuthIdentity.IsDictaminador();
    this.id_tramite = Number(localStorage.getItem("id_tramite")!)
    this.obtenerTramiteId();
    this.obtenerCatalogos();
    if (this.isDictaminador)
      this.titulo = "Atención de solicitudes de registro";
    else
      this.validarAcceso();
    this.titulo = "Solicitud de Registro Asociación religiosa";
    this.routes = TramiteRoutes.GetRoutesByRol(5);
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

  openEdicion(representanteEditar: ActualizarRepresentateRequest) {
    if (representanteEditar === null)
      representanteEditar = new ActualizarRepresentateRequest();
    representanteEditar.s_id = this.id_tramite;
    this.modalrefEdicion = this.modalService.open(
      ModuloFormularioRepresentanteComponent,
      { ariaLabelledBy: "modal-basic-title", size: "lg" }
    );
    this.modalrefEdicion.componentInstance.ActualizarRepresentante.subscribe(
      ($e) => {
        if (!this.operacionRespuesta.EstaEjecutando)
          this.EditarRepresentante($e);
      }
    );
    this.modalrefEdicion.componentInstance.representanteEditar =
      representanteEditar;
    this.modalrefEdicion.componentInstance.listaTipoR = this.listtipo;
  }

  validarAcceso(): void {
    let params = this.localStorageService.getJsonValue('solicitudregistroconsulta');
    if (params != null && localStorage.getItem("solicitudregistroconsulta") === "1") {
      this.bloqueo = params.idbloqueo
      this.isDictaminador = true;
    } else {
      let perfil = AuthIdentity.IsAsignador();
      this.bloqueo = perfil ? true : false
    }
  }

  //#region Mensajes
  openMensajes(Mensaje: string, Error: boolean) {
    this.modalrefMsg = this.modalService.open(ModuloModalMensajeComponent, {
      ariaLabelledBy: "modal-basic-title",
    });
    this.modalrefMsg.componentInstance.mensajesExito = [];
    this.modalrefMsg.componentInstance.mensajesError = [];
    this.modalrefMsg.componentInstance.mensajesTitulo = "Carga de Información";

    if (Error) {
      this.modalrefMsg.componentInstance.showErrors = true;
      this.modalrefMsg.componentInstance.mensajesError.push(Mensaje);
    } else {
      this.modalrefMsg.componentInstance.showExitos = true;
      this.modalrefMsg.componentInstance.mensajesExito.push(Mensaje);
    }
  }
  //#endregion

  OnChange(idrepresentante: number) {
    this.BorraRepresentante(idrepresentante);
  }

  async obtenerRepresentantes() {
    this.operacionRespuesta.EstaEjecutando = true;
    if (this.bloqueo) {
      this.isDictaminador = false;
    }
    // buscamos si tiene info paso 4
    await this.services.HttpGet(
      this.modelo_configuracion.serviciosOperaciones +
      "/ConsultaDetalleTramitePasoQuinto/Get?i_id_c=" +
      this.id_tramite +
      "&&s_id_us=" +
      this.us_id + '&&dictaminador=' +
      this.isDictaminador
    )
      .toPromise().then(
        (tempdate) => {
          if (tempdate) {
            this.listrepresentante = [] = tempdate.response;
            if (!this.isDictaminador)
              this.renderTabla();
            for (let x = 0; x <= this.listrepresentante.length - 1; x++) {
              if (this.listrepresentante[x].p_acta_exists == false || this.listrepresentante[x].p_curp_exists == false || this.listrepresentante[x].p_ine_exists == false) {
                this.doctosCompletos = false;
              } else {
                this.doctosCompletos = true
              }
            }

          } else {
            this.listrepresentante = [];
            this.renderTabla();
          }
          if (this.bloqueo) {
            this.isDictaminador = true;
          }
          this.operacionRespuesta.EstaEjecutando = false;

        },
        async (err) => {
          this.operacionRespuesta.EstaEjecutando = false;
        }
      );
    // buscamos si tiene info paso 4
  }

  obtenerTramiteId() {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpGet(
        this.modelo_configuracion.serviciosOperaciones +
        "/ConsultaDetalleTramiteId/Get?i_id_c=" +
        this.id_tramite +
        "&&s_id_us=" +
        this.us_id + '&&dictaminador=' +
        this.isDictaminador
      )
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.respuesta = tempdate.response[0];
            if (this.respuesta != undefined) {
              if (
                this.respuesta.s_id != undefined &&
                this.respuesta.s_id != null
              ) {
                this.id_tramite = this.respuesta.s_id;
                this.obtenerRepresentantes();
              } else
                this.returnPage(
                  "Antes de continuar complete los pasos anteriores."
                );
            }
          } else {
            this.returnPage("Antes de continuar complete los pasos anteriores");
          }
          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.operacionRespuesta.EstaEjecutando = false;
          this.returnPage("Hubo un error al obtener la información");
        }
      );
  }

  returnPage(message: string, error: boolean = true, page: number = 1) {
    this.openMensajes(message, error);
    if (!error) {
      this.tabService.cambiarValoresTabs(5, this.ultimoPasoAlQueTenemosAcceso)
      this.tabService.cambiarTabSolicitudRegistro(6)
    }

  }

  obtenerCatalogos() {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpGet(
        this.modelo_configuracion.serviciosCatalogos +
        "/ConsultaListaTipoRepresentante/Get?Activos=" +
        true
      )
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.listtipo = [] = tempdate.response;
          } else {
            this.listtipo = [];
          }
          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.operacionRespuesta.EstaEjecutando = false;
        }
      );
  }

  BorraRepresentante(representanteDesactivar: any) {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpGet(
        this.modelo_configuracion.serviciosOperaciones +
        "/BorraRepresentante/Get?p_id=" +
        representanteDesactivar
      )
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.respuesta = tempdate.response[0];
            this.openMensajes(
              this.respuesta.mensaje,
              !this.respuesta.proceso_exitoso
            );
          } else {
            this.openMensajes("No se pudo realizar la acción", true);
          }

          this.obtenerRepresentantes();
          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.operacionRespuesta.EstaEjecutando = false;
          this.openMensajes("No se pudo realizar la acción", true);
        }
      );
  }
  EditarRepresentante(representanteEditar: any) {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpPost(
        representanteEditar,
        this.modelo_configuracion.serviciosOperaciones +
        "/InsertarTramitePasoCinco/Post"
      )
      .subscribe(
        async (tempdate) => {
          if (tempdate) {
            this.respuesta = tempdate.response[0];

            this.openMensajes(
              this.respuesta.mensaje,
              !this.respuesta.proceso_exitoso
            );

            this.obtenerRepresentantes();
          } else {
            this.openMensajes("No se pudo realizar la acción", true);
          }
          this.modalrefEdicion.close();
          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.modalrefEdicion.close();
          this.operacionRespuesta.EstaEjecutando = false;
          this.openMensajes("No se pudo realizar la acción", true);
        }
      );
  }

  getRoles(rep: any) {
    var roles = "";
    if (rep.t_rep_legal) roles += "Representante Legal, ";
    if (rep.t_rep_asociado) roles += "Asociado, ";
    if (rep.t_ministro_culto) roles += "Ministro de Culto, ";
    if (rep.t_organo_gob) roles += "Órgano de Gobierno, ";

    if (roles.length > 0) roles = roles.substring(0, roles.length - 2);

    return roles;
  }
  setIsLoadingArchivo(is_loading: boolean): void {
    this.operacionRespuesta.EstaEjecutando = is_loading;
  }


  async OnSubmit() {
    await this.editarPasoCinco();
  }

  exitPublic() {
    this.isDictaminador = AuthIdentity.IsDictaminador();
    const asignador = AuthIdentity.IsAsignador();
    if (this.isDictaminador || asignador) {
      if (asignador) {
        this.router.navigate(['/asignacion/registro-asociacion']);
      } else {
        this.router.navigate(['/registros-tramite-dictaminador']);
      }
    } else {
      this.router.navigate(['/registros-tramite'])
    }
  }

  async editarPasoCinco() {
    // this.operacionRespuesta.EstaEjecutando = true;
    // await this.obtenerRepresentantes();
    let documentosFaltantes = 0;

    for (let i = 0; i < this.listrepresentante.length; i++) {
      // console.log(this.listrepresentante[i])
      if (!this.listrepresentante[i].p_acta_exists || !this.listrepresentante[i].p_curp_exists || !this.listrepresentante[i].p_ine_exists) {
        documentosFaltantes++;
      }

      /*if(this.listrepresentante[i].actaBase64 == undefined || this.listrepresentante[i].curpBase64 == undefined || this.listrepresentante[i].ineBase64 == undefined){
        documentosFaltantes++;
      }*/

    }

    if (documentosFaltantes > 0) {
      this.openMensajes("Favor de cargar la documentación de los representantes.", true);
      return;
    }

    for (let i = 0; i < this.listrepresentante.length; i++) {
      // console.log(this.listrepresentante[i])
      let ine: boolean = await this.fileService.cargarArchivo(this.listrepresentante[i].r_id, this.listrepresentante[i].ineBase64, 7);
      let acta: boolean = await this.fileService.cargarArchivo(this.listrepresentante[i].r_id, this.listrepresentante[i].actaBase64, 8);
      let curp: boolean = await this.fileService.cargarArchivo(this.listrepresentante[i].r_id, this.listrepresentante[i].curpBase64, 9);
    }

    //if (this.doctosCompletos == true) {
      if (documentosFaltantes == 0) {
        // this.openMensajes("La información se ha cargado de forma exitosa.", false);
        this.returnPage("La información se ha cargado de forma exitosa.", false, 6);
      } else {
        this.openMensajes("Favor de cargar la documentación de los representantes.", true);
      }
  }

  setSentArch(file: SentFile): void {
    switch (file.tipo) {
      case 7:
        // this.arch_ine_us = file.sent;
        this.listrepresentante[file.indice].p_ine_exists = file.sent ? true : null;
        this.listrepresentante[file.indice].ineBase64 = file.sent ? file.base64 : null;
        break;
      case 8:
        this.listrepresentante[file.indice].p_acta_exists = file.sent ? true : null;
        this.listrepresentante[file.indice].actaBase64 = file.sent ? file.base64 : null;
        break;
      case 9:
        this.listrepresentante[file.indice].p_curp_exists = file.sent ? true : null;
        this.listrepresentante[file.indice].curpBase64 = file.sent ? file.base64 : null;
        break;
    }
  }



}
