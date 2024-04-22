import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { ServiceGenerico } from "src/app/services/service-generico.service";
import { ActivatedRoute, Router } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
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
    selector: "app-modulo-administracion-plantillas",
    templateUrl: "./modulo-administracion-plantillas.component.html",
    styleUrls: ["./modulo-administracion-plantillas.component.css"]
})
export class ModuloAdminPlantillasComponent extends GeneralComponent implements OnInit {

    estaCargando: boolean = false;
    restWebSubscription: Subscription | undefined;
    public lista: any[] = [];
    clients = Array<any>();
    dtTrigger: Subject<any> = new Subject();
    dtOptions: DataTables.Settings = {};
    @ViewChild(DataTableDirective) datatableElement: DataTableDirective;
    @ViewChild("contentEditar", { static: false }) modalEditar: TemplateRef<any>;
    formGroup: FormGroup;

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
            nombre: [null, { validators: [Validators.required] }]
        });

        this.dtOptions = this.themeConstants.dtOptions;
        await this.obtenerCatalogos()
        this.rerender();

    }

    public salir() {
        this.router.navigate(['/vista-principal-declaratoria']);
    }

    public irDetalle() {
        let id = localStorage.getItem("idDeclaratoria");
        this.router.navigate(['/alta-declaratoria/' + id]);
    }


    async obtenerCatalogos() {
        this.lista = [];
        let perfil = AuthIdentity.ObtenerUsuarioSesion().IdPerfil;
        let url = perfil == 11 || perfil == 12 ? "/ConsultaTramiteDeclaratoria/ConsultaLista?id_rol=" + perfil : "/ConsultaTramiteDeclaratoria/ConsultaLista?id_usuario=" + this.us_id
        let respuesta = await this.webRestService.getAsync(this.modelo_configuracion.serviciosOperaciones + url)
        if (respuesta != null && respuesta!.response!.length > 0) {
            this.lista = respuesta.response;
        } else {
            this.lista = [];
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

    async abrirModificacion(){
        const modalref = this.modalService.open(this.modalEditar, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
    }

}
