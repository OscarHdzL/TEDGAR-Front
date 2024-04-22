import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModalRef, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthGuard } from 'src/app/guards/AuthGuard';
import { AuthIdentity } from 'src/app/guards/AuthIdentity';
import { ActualizarCotejoRequest } from 'src/app/model/Operaciones/Cotejo/Cotejo';
import { RespuestaGenerica } from 'src/app/model/Operaciones/generales/RespuestaGenerica';
import { ServiciosRutas } from 'src/app/model/Operaciones/generales/ServiciosRutas';
import { route } from 'src/app/model/Utilities/route';
import { TramiteRoutes } from 'src/app/model/Utilities/tramiteRoutes';
import { ServiceGenerico } from 'src/app/services/service-generico.service';
import { ModuloModalMensajeComponent } from 'src/app/shared/modulo-modal-mensaje/modulo-modal-mensaje.component';
import { ModuloPaginacionComponent } from 'src/app/shared/modulo-paginacion/modulo-paginacion.component';

@Component({
  selector: 'app-modulo-cotejo-concluido',
  templateUrl: './modulo-cotejo-concluido.component.html',
  styleUrls: ['./modulo-cotejo-concluido.component.css'],
  providers: [ServiceGenerico]
})
export class ModuloCotejoConcluidoComponent implements OnInit {
  routes: route[];
  request: any;
  response: any;
  listaEstatus = [];

  showControls: boolean = false;
  isDictaminador: boolean = false;
  Valido: boolean = false;
  cumple: boolean = false;
  Presencial: boolean = false;
  id_tramite: number;
  us_id: number;
  titulo: string;

  bloqueoDictminador: boolean;

  operacionRespuesta: RespuestaGenerica;
  modelo_configuracion: ServiciosRutas;

  formGroup: FormGroup;

  modalrefMsg: NgbModalRef;

  @ViewChild(ModuloPaginacionComponent, { static: true })
  routescmp: ModuloPaginacionComponent;

  constructor(
    public modalService: NgbModal,
    private fb: FormBuilder,
    private auth: AuthGuard,
    private services: ServiceGenerico,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.operacionRespuesta = new RespuestaGenerica();
    this.modelo_configuracion = new ServiciosRutas();
    this.titulo="Atención de solicitudes de registro";
  }

  ngOnInit(): void {
    this.cumple = true;
    this.us_id = AuthIdentity.ObtenerUsuarioRegistro();
    this.isDictaminador = AuthIdentity.IsDictaminador();
    this.id_tramite =  Number(localStorage.getItem("id_tramite")!)
    this.formGroup = this.fb.group({
      s_id: [
        this.id_tramite,
        {
          validators: [Validators.required],
        },
      ],
      s_estatus: [
        0,
        {
          validators: [Validators.min(1)],
        },
      ],
      s_comentarios: [],
    });
    this.cargarModalidades();
    this.obtenerCotejo();
    this.routes = TramiteRoutes.GetRoutesByRol(10);
  }

  returnPage(message: string, error: boolean = true, page: number = 1) {
    this.openMensajes(message, error);

    let instance = this;
    setTimeout(function () {
      instance.routescmp.returnSpecificPage(page);
    }, 3500);
  }

  OnSubmit() {
    this.ActualizarCotejo();
  }
  private cargarModalidades(): void {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services.HttpGet(`${this.modelo_configuracion.serviciosCatalogos}/ConsultaListaCatalogosEstatus/Get?TipoLista=10`).subscribe(
      (response: any) => {
        this.operacionRespuesta.EstaEjecutando = false;
        this.listaEstatus = response.response;
        
      },
      (error) => {
        this.operacionRespuesta.EstaEjecutando = false;
        this.operacionRespuesta.EsMsjError = false;
      });
  }
  obtenerCotejo() {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpGet(
        this.modelo_configuracion.serviciosOperaciones +
          "/ConsultaDetalleCotejo/Get?cotejo_tipo=10&&c_id=" +
          this.id_tramite +
          "&&s_id_us=" +
          this.us_id 
      )
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.response = tempdate.response[0];

            if (this.response) {
              this.id_tramite = this.response.s_id;
              
              this.bloqueoDictminador = this.response.s_estatus == 19 || this.response.s_estatus == 20 ? true : false;
              if (this.response.s_estatus == 39) {
                this.response.s_estatus=0;
                this.cumple = false;
              } else if(this.response.s_estatus == 14){
                this.routescmp.returnSpecificPage(8);
              }  else if(this.response.s_estatus == 16){
                this.routescmp.returnSpecificPage(9);
              } else if(this.response.s_estatus == 17){
                this.routescmp.returnSpecificPage(9);
              } else if(this.response.s_estatus == 18){
                this.response.s_estatus=0;
              } else if(this.response.s_estatus < 19){
                this.response.s_estatus=0;
                this.routescmp.returnSpecificPage(8);
              }
              this.formGroup.patchValue(this.response);
              
            }
          } else {
            this.routescmp.returnSpecificPage(9);
          }
          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.operacionRespuesta.EstaEjecutando = false;
          this.returnPage("Hubo un error al obtener la información", true, 0);
        }
      );
  }
  obtenerErroresEstatus() {
    var campo = this.formGroup.get("s_estatus");
    if (campo.hasError("min")) return "El campo es requerido";
  }
  obtenerErroresComentarios() {
    var campo = this.formGroup.get("s_comentarios");
    if (campo.hasError("required")) return "El campo es requerido";
  }
 
  ActualizarCotejo() {
    let cotejoUpdate = new ActualizarCotejoRequest();
    cotejoUpdate = this.formGroup.value;
    cotejoUpdate.s_us_id=this.us_id;
    cotejoUpdate.cotejo_tipo=10;

    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpPost(
        cotejoUpdate,
        this.modelo_configuracion.serviciosOperaciones +
          "/ActualizarCotejo/Post"
      )
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.response = tempdate.response[0];
            this.openMensajes(
              this.response.mensaje,
              !this.response.proceso_existoso
            );
            if(this.response.proceso_existoso){
              let instance = this;

              setTimeout(function () {
            //    instance.router.navigate(['/atencion/registro']);
                instance.router.navigate(['/registros-tramite-dictaminador']);

              }, 2000);
            }
          } else {
            let instance = this;

            setTimeout(function () {
             // instance.router.navigate(['/atencion/registro']);
              instance.router.navigate(['/registros-tramite-dictaminador']);

            }, 2000);
          }

          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.openMensajes("No se pudo realizar la acción", true);
          this.operacionRespuesta.EstaEjecutando = false;
        }
      );
  }

  setIsLoadingArchivo(is_loading: boolean): void {
    this.operacionRespuesta.EstaEjecutando = is_loading;
  }
  // Validaciones
  obtenerErroresNotarioArr() {
    var campo = this.formGroup.get("s_cat_notarioarr");
    if (campo.hasError("required")) return "El campo es requerido";
    if (campo.hasError("min")) return "El campo es requerido";
    return "";
  }

  obtenerErroresModalidad() {
    var campo = this.formGroup.get("s_cat_modalidad");
    if (campo.hasError("min")) return "El campo es requerido";
    return "";
  }

  //#region Mensajes
  openMensajes(
    Mensaje: string,
    Error: boolean,
    titulo: string = "Carga de Información"
  ) {
    this.modalrefMsg = this.modalService.open(ModuloModalMensajeComponent, {
      ariaLabelledBy: "modal-basic-title",
    });
    this.modalrefMsg.componentInstance.mensajesExito = [];
    this.modalrefMsg.componentInstance.mensajesError = [];
    this.modalrefMsg.componentInstance.mensajesTitulo = titulo;
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
