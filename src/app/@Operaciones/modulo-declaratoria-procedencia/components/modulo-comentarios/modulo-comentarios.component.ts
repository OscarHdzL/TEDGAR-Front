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
import { GeneralComponent } from "../general/general.component";
import { WebRestService } from "../../services/crud.rest.service";
import { TabService } from "../../services/tab.service";

@Component({
    selector: "app-modulo-comentarios",
    templateUrl: "./modulo-comentarios.component.html",
    styleUrls: ["./modulo-comentarios.component.css"]
})
export class ModuloComentariosComponent extends GeneralComponent implements OnInit {

    estaCargando: boolean = false;
    restWebSubscription: Subscription | undefined;
    public comentarios: any = localStorage.getItem("comentarios")

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
    }

    public salir() {
        this.router.navigate(['/vista-principal-declaratoria']);
    }

    public irDetalle() {
        let id = localStorage.getItem("idDeclaratoria");
        this.router.navigate(['/alta-declaratoria/' + id]);
    }

}