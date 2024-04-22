import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { ServiceGenerico } from "src/app/services/service-generico.service";
import { ActivatedRoute, Router } from "@angular/router";
import { FormBuilder, FormGroup } from "@angular/forms";
import { RespuestaGenerica } from "src/app/model/Operaciones/generales/RespuestaGenerica";
import { ServiciosRutas } from "src/app/model/Operaciones/generales/ServiciosRutas";
import { Subject, Subscription } from "rxjs";
import { GeneralComponent } from "../components/general/general.component";
import { WebRestService } from "../services/crud.rest.service";
import { TabService } from "../services/tab.service";
import { DataTableDirective } from "angular-datatables";
import { ThemeConstants } from "src/app/@espire/shared/config/theme-constant";
import { AuthIdentity } from "src/app/guards/AuthIdentity";
import { transformDateForSorting } from "src/app/model/Operaciones/generales/SortDateDataTable";

@Component({
    selector: "app-vista-principal",
    templateUrl: "./modulo-vista-principal.component.html",
    styleUrls: ["./modulo-vista-principal.component.css"]
})
export class ModuloVistaPrincipalComponent extends GeneralComponent implements OnInit {

    operacionRespuesta: RespuestaGenerica;
    modelo_configuracion: ServiciosRutas;


    dtOptions: DataTables.Settings = {};
    dtTrigger: Subject<any> = new Subject();
    @ViewChild(DataTableDirective, { static: false })
    dtElement: DataTableDirective;
    isDtInitialized: boolean = false;

    us_id: number;
    public lista: Array<any> = [];

    listaEstatus: any[] = [];
    listaDictaminadores: any[] = [];
    listaDictaminadoresPost: any[] = [];

    @ViewChild("contentReporte", { static: false }) ModalLimpiarReporte: TemplateRef<any>;
    @ViewChild("contentEliminar", { static: false }) ModalEliminar: TemplateRef<any>;
    estaCargando: boolean = false;
    restWebSubscription: Subscription | undefined;
    idDeclaratoriaEliminar: any = null;
    formGroup: FormGroup = this.fb.group({
        denominacion: [null],
        folio: [null],
        estatus: [null]
    });
    constructor(
        private activetedRoute: ActivatedRoute,
        private fb: FormBuilder,
        public webRestService: WebRestService,
        public tabsService: TabService,
        private themeConstants: ThemeConstants,
        private router: Router
    ) {
        super()
        this.operacionRespuesta = new RespuestaGenerica();
        this.modelo_configuracion = new ServiciosRutas();
    }

    async ngOnInit() {

        this.restWebSubscription = this.tabsService.estaCargando$.subscribe(async (valor) => {
            this.estaCargando = valor;
        })

        this.us_id = AuthIdentity.ObtenerUsuarioRegistro();

        this.inicializatabla();
        await this.obtenerCatalogos();

        //this.rerender();
        await this.obtenerEstatus();
        if (this.deshabilitar && this.idPerfil == 11)
            await this.obtenerDictaminadores()
    }

    inicializatabla() {
        this.dtOptions = {
            ...this.themeConstants.dtOptions,
            columnDefs: [
              {
                targets: [2,4], // Esto apunta a las columnas de fecha
                render: (data: any, type: any, row: any, meta: any) =>
                  transformDateForSorting(data, type),
              },
            ],
          };
        if(this.idPerfil==11) {
            this.dtOptions = {
                ...this.themeConstants.dtOptions,
                columnDefs: [
                  {
                    targets: [2,4], // Esto apunta a las columnas de fecha
                    render: (data: any, type: any, row: any, meta: any) =>
                      transformDateForSorting(data, type),
                  },
                  { targets: 6,width:'5%' },
                ],
              };
            console.log(this.dtOptions);
        }
        this.dtTrigger = new Subject();
        if (AuthIdentity.ObtenerPerfilUsuarioSesion() != 11) {
            this.dtOptions.search = false;
            this.dtOptions.searching = false;
        }
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

    // ngAfterViewInit(): void {
    //     this.dtTrigger.next();
    //     this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
    //     });
    // }

    ngOnDestroy(): void {
        this.dtTrigger.unsubscribe();
    }

    // rerender(): void {
    //     console.log('rerender');
    //     console.log(this.datatableElement);
    //     this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
    //         dtInstance.destroy();
    //         this.dtTrigger.next();
    //     });
    // }

    //obtener lista para la tabla
    async obtenerCatalogos() {
        //this.lista = [];
        let perfil = AuthIdentity.ObtenerUsuarioSesion().IdPerfil;
        let filtros = this.formGroup.value;
        let requestBusqueda = { id_rol:0,id_usuario:0,denominacion:null,folio:null,estatus:null }
        if(perfil==11||perfil==12) {
            requestBusqueda.id_rol = perfil;
        } else {
            requestBusqueda.id_usuario = this.us_id;
        }
        if (filtros.denominacion != null && filtros.denominacion != "") {
            requestBusqueda.denominacion = filtros.denominacion;
        }
        if (filtros.folio != null && filtros.folio != "") {
            requestBusqueda.folio = filtros.folio;
        }
        if (filtros.estatus != null && filtros.estatus != ""&&filtros.estatus!=0) {
            requestBusqueda.estatus = filtros.estatus;
        }
            // let url = perfil == 11 || perfil == 12 ? "/ConsultaTramiteDeclaratoria/ConsultaLista?id_rol=" + perfil : "/ConsultaTramiteDeclaratoria/ConsultaLista?id_usuario=" + this.us_id;
        let url = "/ConsultaTramiteDeclaratoria/ConsultaListaFiltros";
        let respuesta = await this.webRestService.postAsync(requestBusqueda,this.modelo_configuracion.serviciosOperaciones + url)
        if (respuesta != null && respuesta!.response!.length > 0) {
            this.lista = respuesta.response;
            this.renderTabla();

        } else {
            this.lista = [];
            this.renderTabla();
        }
    }

    openlimpiarReporte() {
        const modalref = this.modalService.open(this.ModalLimpiarReporte, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
    }

    async limpiarReporte() {
        this.formGroup.reset();
        this.modalService.dismissAll();
        await this.obtenerCatalogos();
        //this.rerender();
    }

    async buscar() {
        await this.obtenerCatalogos();
        //this.rerender();
    }

    mandarNuevoRegistro() {
        this.router.navigate(['/alta-declaratoria']);
    }

    mandarModificacion(declaratoria: any) {
        this.router.navigate(['/alta-declaratoria/' + declaratoria.id_declaratoria]);
    }

    mandarVisualizacion(declaratoria) {
        localStorage.setItem("modoLectura", "1");
        this.router.navigate(['/alta-declaratoria/' + declaratoria.id_declaratoria]);
    }

    mandarComentarios(item: any) {
        localStorage.setItem("comentarios", item.comentarios);
        localStorage.setItem("idDeclaratoria", item.id_declaratoria);
        this.router.navigate(['/comentarios']);
    }

    openEliminar(idDeclaratoriaEliminar: any) {
        const modalref = this.modalService.open(this.ModalEliminar, { ariaLabelledBy: 'modal-basic-title' });
        this.idDeclaratoriaEliminar = idDeclaratoriaEliminar
    }

  async eliminarDeclaratoria() {
    let objeto = {
      "p_id_declaratoria": this.idDeclaratoriaEliminar,
      "p_activo": false
    }
    let respuesta = await this.webRestService.postAsync(objeto, this.modelo_configuracion.serviciosOperaciones + "/OperacionesTramiteDeclaratoria/Activar")
    this.modalService.dismissAll();
    if (respuesta != null && respuesta.response != null) {
      this.formGroup.reset();
      //this.copiaLista = [];
      this.lista = [];
      this.renderTabla();
      await this.obtenerCatalogos();
      this.renderTabla();
      this.openMensajes("Se elimino de forma correcta.", false, "Declaratoria de procedencia");
    } else {
      this.openMensajes("La información no se ha guardado de forma exitosa.", true, "Declaratoria de procedencia");
    }
  }

    async obtenerEstatus() {
        let respuesta = await this.webRestService.getAsync(this.modelo_configuracion.serviciosCatalogos + "/CatalogosTramiteDeclaratoria/GetEstatus")
        if (respuesta != null && respuesta!.response!.length > 0) {
            this.listaEstatus = [] = respuesta.response;

        } else {
            this.listaEstatus = [];
        }
    }

    async obtenerDictaminadores() {
        let respuesta = await this.webRestService.getAsync(this.modelo_configuracion.serviciosCatalogos + "/CatalogosTramiteDeclaratoria/GetDictaminadores")
        if (respuesta != null && respuesta!.response!.length > 0) {
            this.listaDictaminadores = [] = respuesta.response;

        } else {
            this.listaDictaminadores = [];
        }
    }

    async asignarDeclaratoria(dictaminar: any, index, declaratoria) {
        let dictaminador = dictaminar.target.value;
        let idDeclaratoria = declaratoria.id_declaratoria

        if (dictaminador == "na") {
            for (let i = 0; i < this.listaDictaminadoresPost.length; i++) {
                if (idDeclaratoria == this.listaDictaminadoresPost[i].p_id_declaratoria) {
                    this.listaDictaminadoresPost.splice(i, 1)
                }
            }

        } else {
            let objeto = {
                "p_id_declaratoria": idDeclaratoria,
                "p_id_dictaminador": Number(dictaminador),
                "p_id_asignador": this.us_id
            }
            this.listaDictaminadoresPost.push(objeto)
        }

    }

    async asignar() {
        let huboError: number = 0;
        for (let i = 0; i < this.listaDictaminadoresPost.length; i++) {
            let respuesta = await this.webRestService.postAsync(this.listaDictaminadoresPost[i], this.modelo_configuracion.serviciosOperaciones + "/OperacionesTramiteDeclaratoria/Asignar")
            if (respuesta == null && respuesta.response != null) {
                huboError++
            }
        }
        if (huboError == 0) {
            this.listaDictaminadoresPost = [];
            //this.rerender();
            await this.obtenerCatalogos();
            //this.rerender();
            this.openMensajes("La información se ha guardado de forma exitosa.", false, "Declaratoria de procedencia");
        } else {
            this.openMensajes("La información no se ha guardado de forma exitosa.", true, "Declaratoria de procedencia");
        }

    }

}
