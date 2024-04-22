import { Component, OnInit, ViewChild } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { NgbModalRef, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { AuthGuard } from "src/app/guards/AuthGuard";
import { AuthIdentity } from "src/app/guards/AuthIdentity";
import { RespuestaGenerica } from "src/app/model/Operaciones/generales/RespuestaGenerica";
import { ServiciosRutas } from "src/app/model/Operaciones/generales/ServiciosRutas";
import {
  ActualizarDomicilioRequest,
  InsertarDomicilioRequest,
  LecturaDomicilioRequest,
} from "src/app/model/Operaciones/Tramite/Domicilio";
import { route } from "src/app/model/Utilities/route";
import { TramiteRoutes } from "src/app/model/Utilities/tramiteRoutes";
import { ServiceGenerico } from "src/app/services/service-generico.service";
import { ModuloModalMensajeComponent } from "src/app/shared/modulo-modal-mensaje/modulo-modal-mensaje.component";
import { ModuloPaginacionComponent } from "src/app/shared/modulo-paginacion/modulo-paginacion.component";
import { LocalStorageService } from "../../../services/local-storage.service";
import { TabService } from "../../modulo-declaratoria-procedencia/services/tab.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-modulo-solicitud-segundo-paso",
  templateUrl: "./modulo-solicitud-segundo-paso.component.html",
  styleUrls: ["./modulo-solicitud-segundo-paso.component.css"],
  providers: [ServiceGenerico],
})
export class ModuloSolicitudSegundoPasoComponent implements OnInit {
  routes: route[];

  request: any;
  response: any;
  ModelDTO: LecturaDomicilioRequest = new LecturaDomicilioRequest();
  operacionRespuesta: RespuestaGenerica;
  modelo_configuracion: ServiciosRutas;
  id_tramite: number;
  id_bloqueo: number;
  bloqueo:any = false;
  us_id: number;
  titulo: string;
  isDictaminador: boolean = false;

  formGroup: FormGroup;
  modalrefCreacion: NgbModalRef;
  modalrefMsg: NgbModalRef;

  @ViewChild(ModuloPaginacionComponent, { static: true })
  routescmp: ModuloPaginacionComponent;


  ultimoPasoAlQueTenemosAcceso = Number(localStorage.getItem("ultimoPasoAlQueTenemosAcceso"));
  
  constructor(
    public modalService: NgbModal,
    private fb: FormBuilder,
    private auth: AuthGuard,
    private services: ServiceGenerico,
    private router: Router,
    private activetedRoute: ActivatedRoute,
    private localStorageService: LocalStorageService,
    public tabService: TabService
  ) {
    this.operacionRespuesta = new RespuestaGenerica();
    this.modelo_configuracion = new ServiciosRutas();
    this.validarAcceso();
  }

  async ngOnInit() {



    this.formGroup = this.fb.group({
      d_id_domicilio: [0],
      d_tipo_domicilio: [0],
      d_cpostal: [
        "",
        {
          validators: [
            Validators.required,
            Validators.maxLength(5),
            Validators.maxLength(6),
          ],
        },
      ],
      d_endidad: [""],
      d_colonia: [
        "",
        {
          validators: [Validators.required],
        },
      ],
      d_ciudad: [""],
      d_calle: [
        "",
        {
          validators: [
            Validators.required,
            Validators.minLength(1),
            Validators.maxLength(250),
          ],
        },
      ],
      d_numeroi: [
        "",
        {
          validators: [
            Validators.minLength(1),
            Validators.maxLength(6),
          ],
        },
      ],
      d_numeroe: [""],
    });
    this.us_id = AuthIdentity.ObtenerUsuarioRegistro();
    this.isDictaminador = AuthIdentity.IsDictaminador();
    if (this.isDictaminador)
      this.titulo = "Atención de solicitudes de registro";
    else
      this.titulo = "Solicitud de Registro Asociación religiosa";

    this.id_tramite = Number(localStorage.getItem("id_tramite")!)
    await this.obtenerPasoDos();
    this.routes = TramiteRoutes.GetRoutesByRol(2);
  }

  returnPage(message: string, error: boolean = true, page: number = 1) {
    this.openMensajes(message, error);
    if (!error) {
      this.tabService.cambiarTabSolicitudRegistro(3)
      this.tabService.cambiarValoresTabs(2, this.ultimoPasoAlQueTenemosAcceso)
    }

  }

  patchDomicilio(model: InsertarDomicilioRequest) {
    this.formGroup.patchValue(model);
  }

  OnSubmit() {
    this.editarPasoDos(this.formGroup.value);
  }

  validarAcceso(): void {
    let params = this.localStorageService.getJsonValue('solicitudregistroconsulta');
    if (params != null && localStorage.getItem("solicitudregistroconsulta") === "1") {
      this.bloqueo = params.idbloqueo
    }else {
      let perfil = AuthIdentity.IsAsignador();
      this.bloqueo = perfil ? true : false
    }
  }

  async obtenerPasoDos() {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpGet(
        this.modelo_configuracion.serviciosOperaciones +
        "/ConsultaDetalleTramitePasoDos/Get?i_id_c=" +
        this.id_tramite + '&&s_id_us=' + this.us_id + '&&dictaminador=' + this.isDictaminador
      )
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.response = tempdate.response[0];
            if (this.response) {
              let modelRequest = new LecturaDomicilioRequest();
              modelRequest.d_id_domicilio = this.response.d_id_domicilio;
              modelRequest.d_numeroe = this.response.d_numeroe;
              modelRequest.d_numeroi = this.response.d_numeroi;
              modelRequest.d_colonia = this.response.d_colonia;
              modelRequest.d_calle = this.response.d_calle;
              modelRequest.d_cpostal = this.response.c_cpostal_n;
              this.ModelDTO = modelRequest;
              this.formGroup.patchValue(modelRequest);
            }
          }
          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.router.navigate(["tramites"]);
        }
      );
  }

  editarPasoDos(domicilioUpdate: ActualizarDomicilioRequest) {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpPost(
        domicilioUpdate,
        this.modelo_configuracion.serviciosOperaciones +
        "/ActualizarTramitePasoDos/Post"
      )
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.response = tempdate.response[0];
            if (this.response.proceso_existoso)
              this.returnPage(this.response.mensaje, false, 3);
            else
              this.openMensajes(
                this.response.mensaje,
                this.response.proceso_existoso
              );
          } else {
            this.openMensajes("No se pudo realizar la acción", true);
          }

          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.openMensajes("No se pudo realizar la acción", true);
          this.operacionRespuesta.EstaEjecutando = false;
        }
      );
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
  //#endregion
}
