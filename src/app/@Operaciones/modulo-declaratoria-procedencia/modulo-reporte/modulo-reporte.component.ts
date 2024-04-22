import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { ServiceGenerico } from "src/app/services/service-generico.service";
import { ActivatedRoute, Router } from "@angular/router";
import { FormBuilder, FormGroup } from "@angular/forms";
import { RespuestaGenerica } from "src/app/model/Operaciones/generales/RespuestaGenerica";
import { ServiciosRutas } from "src/app/model/Operaciones/generales/ServiciosRutas";
import { Subject, Subscription } from "rxjs";
import { DataTableDirective } from "angular-datatables";
import { ThemeConstants } from "src/app/@espire/shared/config/theme-constant";
import { AuthIdentity } from "src/app/guards/AuthIdentity";
import { GeneralComponent } from "../components/general/general.component";
import { WebRestService } from "../services/crud.rest.service";
import { TabService } from "../services/tab.service";

@Component({
    selector: "app-modulo-reporte",
    templateUrl: "./modulo-reporte.component.html",
    styleUrls: ["./modulo-reporte.component.css"]
})
export class ModuloNuevoReporteComponent extends GeneralComponent implements OnInit {

    estaCargando: boolean = false;
    restWebSubscription: Subscription | undefined;
    formGroup: FormGroup;
    listaEstatus: any[] = [];
    public lista: any[] = [];
    public copiaLista: any[] = [];
    clients = Array<any>();
    dtTrigger: Subject<any> = new Subject();
    dtOptions: DataTables.Settings = {};
    @ViewChild(DataTableDirective) datatableElement: DataTableDirective;
    public listaTramite = [
        {
            id: 1,
            nombre: "Registro de Asociación Religiosa"
        },
        {
            id: 2,
            nombre: "Toma de Nota"
        },
        {
            id: 3,
            nombre: "Transmisiones"
        },
        {
            id: 4,
            nombre: "Declaratoria de Procedencia"
        }
    ]

    constructor(
        private activetedRoute: ActivatedRoute,
        private fb: FormBuilder,
        public webRestService: WebRestService,
        private themeConstants: ThemeConstants,
        private router: Router,
        public tabsService: TabService
    ) {
        super()
        this.modelo_configuracion = new ServiciosRutas();
    }

    async ngOnInit() {
        this.restWebSubscription = this.tabsService.estaCargando$.subscribe(async (valor) => {
            this.estaCargando = valor;
        })
        this.formGroup = this.fb.group({
            fechaI: [null],
            fechaF: [null],
            tramite: [null],
            estatus: [null],
        });
        this.dtOptions = this.themeConstants.dtOptions;
        this.dtOptions.search = false;
        this.dtOptions.searching = false;
        await this.obtenerReportes(true)
        this.rerender();
        // await this.obtenerEstatus()

    }

    public salir() {
        this.router.navigate(['/vista-principal-declaratoria']);
    }

    public irDetalle() {
        let id = localStorage.getItem("idDeclaratoria");
        this.router.navigate(['/alta-declaratoria/' + id]);
    }

    async obtenerEstatus() {
      this.formGroup.controls.estatus.setValue(0);
      let idTramite = this.formGroup.controls.tramite.value;
        let respuesta = await this.webRestService.getAsync(this.modelo_configuracion.serviciosCatalogos + "/CatalogosTramiteDeclaratoria/GetEstatusReporte?p_tipo_tramite=" + idTramite)
        if (respuesta != null && respuesta!.response!.length > 0) {
            this.listaEstatus = [] = respuesta.response;
        } else {
            this.listaEstatus = [];
        }
    }

    async obtenerReportes(inicial?) {
        let valorReporte: any = this.formGroup.controls.tramite.value == null || this.formGroup.controls.tramite.value == "" ? null : this.formGroup.controls.tramite.value;
        let valorFehaI: any = this.formGroup.controls.fechaI.value == null || this.formGroup.controls.fechaI.value == "" ? null : this.formGroup.controls.fechaI.value;
        let valorFechaF: any = this.formGroup.controls.fechaF.value == null || this.formGroup.controls.fechaF.value == "" ? null : this.formGroup.controls.fechaF.value;
        let valorEstatus: any = this.formGroup.controls.estatus.value == null || this.formGroup.controls.estatus.value == "" ? null : this.formGroup.controls.estatus.value;


        let urlFechaInicio = valorFehaI != null ? "p_fecha_inicio=" + valorFehaI + "&" : "";
        let urlFechaFin = valorFechaF != null ? "p_fecha_fin=" + valorFechaF : valorFehaI ? "p_fecha_fin=" + valorFehaI : "";
        let urlEstus = valorEstatus != null ? "&p_id_estatus=" + valorEstatus : "";
        let url = urlFechaInicio + urlFechaFin + urlEstus;

        if (inicial) {
            this.copiaLista = []
            this.lista = [];
            let url: string = "/ReporteTramites/General"
            let respuesta = await this.webRestService.getAsync(this.modelo_configuracion.serviciosOperaciones + url)
            if (respuesta != null && respuesta!.response!.length > 0) {
                this.lista = respuesta.response;
                this.copiaLista = this.lista;
            } else {
                this.lista = [];
                this.copiaLista = [];
            }
        } else {

            if (!valorReporte) {
                let urlCompleta = url.length > 0 ? "/ReporteTramites/General?" + url : "/ReporteTramites/General";
                this.copiaLista = []
                this.lista = [];
                this.rerender();
                let respuesta = await this.webRestService.getAsync(this.modelo_configuracion.serviciosOperaciones + urlCompleta)
                if (respuesta != null && respuesta!.response!.length > 0) {
                    this.lista = respuesta.response;
                    this.copiaLista = this.lista;
                    this.rerender();
                } else {
                    this.lista = [];
                    this.copiaLista = [];
                }
            }

          if (valorReporte == 1) {
            let urlCompleta = url.length > 0 ? "/ReporteTramites/GetRegistro?" + url : "/ReporteTramites/GetRegistro";
            this.copiaLista = []
            this.lista = [];
            this.rerender();
            let respuesta = await this.webRestService.getAsync(this.modelo_configuracion.serviciosOperaciones + urlCompleta)
            if (respuesta != null && respuesta!.response!.length > 0) {
              this.lista = respuesta.response;
              this.copiaLista = this.lista;
              this.rerender();
            } else {
              this.lista = [];
              this.copiaLista = [];
            }
          }

          if (valorReporte == 2) {
            let urlCompleta = url.length > 0 ? "/ReporteTramites/GetNota?" + url : "/ReporteTramites/GetNota";
            this.copiaLista = []
            this.lista = [];
            this.rerender();
            let respuesta = await this.webRestService.getAsync(this.modelo_configuracion.serviciosOperaciones + urlCompleta)
            if (respuesta != null && respuesta!.response!.length > 0) {
              this.lista = respuesta.response;
              this.copiaLista = this.lista;
              this.rerender();
            } else {
              this.lista = [];
              this.copiaLista = [];
            }
          }

            if (valorReporte == 3) {
                let urlCompleta = url.length > 0 ? "/ReporteTramites/GetTransmisiones?" + url : "/ReporteTramites/GetTransmisiones";
                this.copiaLista = []
                this.lista = [];
                this.rerender();
                let respuesta = await this.webRestService.getAsync(this.modelo_configuracion.serviciosOperaciones + urlCompleta)
                if (respuesta != null && respuesta!.response!.length > 0) {
                    this.lista = respuesta.response;
                    this.copiaLista = this.lista;
                    this.rerender();
                } else {
                    this.lista = [];
                    this.copiaLista = [];
                }
            }

            if (valorReporte == 4) {
                let urlCompleta = url.length > 0 ? "/ReporteTramites/GetDeclaratorias?" + url : "/ReporteTramites/GetDeclaratorias";
                this.copiaLista = []
                this.lista = [];
                this.rerender();
                let respuesta = await this.webRestService.getAsync(this.modelo_configuracion.serviciosOperaciones + urlCompleta)
                if (respuesta != null && respuesta!.response!.length > 0) {
                    this.lista = respuesta.response;
                    this.copiaLista = this.lista;
                    this.rerender();
                } else {
                    this.lista = [];
                    this.copiaLista = [];
                }
            }
        }

    }

    rerender(): void {
        this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.destroy();
            this.dtTrigger.next();
        });
    }

    ngAfterViewInit(): void {
        this.dtTrigger.next();
        this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
        });
    }

    ngOnDestroy(): void {
        this.dtTrigger.unsubscribe();
    }

    async exportarExcel() {
      const lstExcel = this.lista.map(objeto => {
        const { id_tramite, id_estatus, ...eliminar } = objeto;
        return eliminar;
      });
      this.lista = lstExcel;
      this.exportAsXLSX(this.lista, "reporte_tramites")
    }

    async buscar() {


    }

}
