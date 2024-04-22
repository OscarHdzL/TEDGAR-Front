import { Component, OnInit, ViewChild } from "@angular/core";
import { FormArray, FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { DataTableDirective } from "angular-datatables";
import { Subject } from "rxjs";
import { ThemeConstants } from "src/app/@espire/shared/config/theme-constant";
import { AuthGuard } from "src/app/guards/AuthGuard";
import { AuthIdentity } from "src/app/guards/AuthIdentity";
import { AsignacionRegistroRequest } from "src/app/model/Operaciones/AsignacionRegistro/AsignacionRegistro";
import { RespuestaGenerica } from "src/app/model/Operaciones/generales/RespuestaGenerica";
import { ServiciosRutas } from "src/app/model/Operaciones/generales/ServiciosRutas";
import { ServiceGenerico } from "src/app/services/service-generico.service";
import { ModuloModalMensajeComponent } from "src/app/shared/modulo-modal-mensaje/modulo-modal-mensaje.component";
import { LocalStorageService } from '../../services/local-storage.service';
import { transformDateForSorting } from "src/app/model/Operaciones/generales/SortDateDataTable";

@Component({
  selector: "app-modulo-asignacion-registro",
  templateUrl: "./modulo-asignacion-registro.component.html",
  styleUrls: ["./modulo-asignacion-registro.component.scss"],
  providers: [ServiceGenerico],
})
export class ModuloAsignacionRegistroComponent implements OnInit {
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  recordsTotal: number;

  isDtInitialized: boolean = false;
  modalrefMsg: NgbModalRef;
  listRegistros = [];
  listDicataminador = [];
  dictaminadores: AsignacionRegistroRequest[] = [];
  closeResult = "";
  us_id: number;
  respuestaArr = [];
  mensajesExito = [];
  mensajesError = [];

  private modelo_configuracion: ServiciosRutas;
  public operacionRespuesta: RespuestaGenerica;

  constructor(
    private themeConstants: ThemeConstants,
    public modalService: NgbModal,
    private auth: AuthGuard,
    private services: ServiceGenerico,
    private fb: FormBuilder,
    private router: Router,
    private localStorageService: LocalStorageService
  ) {
    this.operacionRespuesta = new RespuestaGenerica();
    this.modelo_configuracion = new ServiciosRutas();
  }

  ngOnInit(): void {
    this.inicializaTabla();
    this.llenarTablaTramites();
    this.obtenerDictaminadores();
    this.us_id = AuthIdentity.ObtenerUsuarioRegistro();
  }

  inicializaTabla() {
    this.dtOptions = {
      ...this.themeConstants.dtOptions,
      columnDefs: [
        {
          targets: [3], // Esto apunta a las columnas de fecha
          render: (data: any, type: any, row: any, meta: any) =>
            transformDateForSorting(data, type),
        },
      ],
    };
    this.dtTrigger = new Subject();
  }
  obtenerDictaminadores() {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpGet(
        this.modelo_configuracion.serviciosCatalogos +
        "/ConsultaListaUsuariosDicataminador/Get"
      )
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.listDicataminador = [] = tempdate.response;
          } else {
            this.listDicataminador = [];
          }
          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.operacionRespuesta.EstaEjecutando = false;
        }
      );
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
  public async llenarTablaTramites() {
    this.operacionRespuesta.EstaEjecutando = true;

    this.services
      .HttpGet(
        this.modelo_configuracion.serviciosOperaciones +
        "/ConsultaListaTramites/ListaTramites?Activos=true"
      )
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.listRegistros = [] = tempdate.response;
            this.renderTabla();

          } else {
            this.listRegistros = [];
            this.renderTabla();
          }
          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.operacionRespuesta.EstaEjecutando = false;
        }
      );
  }

  onChange(us_id: number, id: number) {
    let asingnacionRegistro = {
      s_id: id,
      us_dictaminador_id: us_id,
      us_asigna_id: this.us_id,
    };
    let asignaExiste = this.dictaminadores
      .filter((c) => c.s_id === asingnacionRegistro.s_id)
      .shift();
    if (asignaExiste != undefined) {
      asignaExiste.s_id = asingnacionRegistro.s_id;
      asignaExiste.us_asigna_id = asingnacionRegistro.us_asigna_id;
      asignaExiste.us_asigna_id = asingnacionRegistro.us_asigna_id;
      asignaExiste.us_dictaminador_id = asingnacionRegistro.us_dictaminador_id;
    } else {
      this.dictaminadores.push(asingnacionRegistro);
    }
    try {
      this.dictaminadores = this.dictaminadores.filter(
        (c) => c.us_dictaminador_id != null || c.us_dictaminador_id != undefined
      );
    } catch (error) { }
  }
  openMensajes(Errores: string[], Mensajes: string[]) {
    this.modalrefMsg = this.modalService.open(ModuloModalMensajeComponent, {
      ariaLabelledBy: "modal-basic-title",
    });
    this.modalrefMsg.componentInstance.mensajesError = [];
    this.modalrefMsg.componentInstance.mensajesExito = [];
    this.modalrefMsg.componentInstance.mensajesTitulo = "Asignación";
    if (Errores?.length > 0) {
      this.modalrefMsg.componentInstance.showErrors = true;
      this.modalrefMsg.componentInstance.mensajesError.push(Errores);
    }
    if (Mensajes?.length > 0) {
      this.modalrefMsg.componentInstance.showExitos = true;
      this.modalrefMsg.componentInstance.mensajesExito.push(Mensajes);
    }
  }
  OnSubmit() {
    this.asignarResgistro();
  }
  resetMsg() {
    this.mensajesError = [];
    this.mensajesExito = [];
  }
  asignarResgistro() {
    this.resetMsg();
    if (this.dictaminadores?.length === 0) return;
    this.services
      .HttpPost(
        this.dictaminadores,
        this.modelo_configuracion.serviciosOperaciones +
        "/AsignarDictaminadorRegistro/Post"
      )
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.respuestaArr = tempdate.response;
            this.respuestaArr.forEach((c) => {
              if (c.proceso_exitoso) this.mensajesExito.push(c.mensaje);
              else this.mensajesError.push(c.mensaje);
            });
            this.openMensajes(this.mensajesError, this.mensajesExito);
          } else {
            this.openMensajes(["Por favor asigne un dictaminador"], []);
          }
          this.operacionRespuesta.EstaEjecutando = false;
          this.llenarTablaTramites();
        },
        async (err) => {
          this.openMensajes(
            ["Hubo un error al intentar asignar el dictaminador."],
            []
          );
          this.operacionRespuesta.EstaEjecutando = false;
        }
      );

    this.dictaminadores = [];
  }

  verDetalle(tramite: any) {
    // this.router.navigate(['/solicitudregistro/' + tramite.id_tramite]);
    localStorage.setItem("id_tramite", String(tramite.reg_id))
    localStorage.setItem("ultimoPasoLlenado", "6")
    this.router.navigate(['alta-solicitud-registro']);
  }

}
