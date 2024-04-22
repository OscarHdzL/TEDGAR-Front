import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { AuthGuard } from "src/app/guards/AuthGuard";
import { AuthIdentity } from "src/app/guards/AuthIdentity";
import { ConsultaListaCatalogoColoniaResponse } from "src/app/model/Catalogos/CatalogoColonia";
import { ConsultaListaCatalogoCredoResponse } from "src/app/model/Catalogos/CatalogosCredo";
import { RespuestaGenerica } from "src/app/model/Operaciones/generales/RespuestaGenerica";
import { ServiciosRutas } from "src/app/model/Operaciones/generales/ServiciosRutas";
import {
  InsertarDomicilioRequest,
  LecturaDomicilioRequest,
} from "src/app/model/Operaciones/Tramite/Domicilio";
import { route } from "src/app/model/Utilities/route";
import { ServiceGenerico } from "src/app/services/service-generico.service";
import { LocalStorageService } from "../../../services/local-storage.service";

@Component({
  selector: "app-modulo-formulario-domicilio",
  templateUrl: "./modulo-formulario-domicilio.component.html",
  styleUrls: ["./modulo-formulario-domicilio.component.css"],
  providers: [ServiceGenerico],
})
export class ModuloFormularioDomicilioComponent implements OnInit {
  routes: route[];

  request: any;
  response: any;

  listaColonia: ConsultaListaCatalogoColoniaResponse[] = [];
  listaCredo: ConsultaListaCatalogoCredoResponse[] = [];
  Entidad: string = "";
  Municipio: string = "";

  id_bloqueo: number = 0;
  bloqueoTN: boolean;
  bloqueo: boolean;
  isDictaminador: boolean;

  operacionRespuesta: RespuestaGenerica;
  modelo_configuracion: ServiciosRutas;
  formGroup: FormGroup;

  mensajesExito: string[];
  mensajesError: string[];
  showErrors = false;
  showExitos = false;

  titulo: string;

  @Input()
  TipoDomicilio: number;
  @Input()
  Enabled: boolean = true;

  @Input() tomaNota: boolean = false;

  cpostal: string;
  cuantasVecesSeHaEntrado: number = 0;

  @Input() set ModelDTO(value: LecturaDomicilioRequest) {
    if(this.tomaNota){
      if (value !== undefined && this.formGroup != undefined && value.d_cpostal) {
        this.formGroup.patchValue(value);
        this.obtenerColonias(value.d_cpostal, 1);
        this.cpostal = value.d_cpostal;
      }
    }else{
      if (value !== undefined && this.formGroup != undefined) {
        this.formGroup.patchValue(value);
        this.obtenerColonias(value.d_cpostal);
        this.cpostal = value.d_cpostal;
      }
    }
  }

  @Output()
  registroDomicilio: EventEmitter<InsertarDomicilioRequest> = new EventEmitter<InsertarDomicilioRequest>();

  constructor(
    private fb: FormBuilder,
    private auth: AuthGuard,
    private services: ServiceGenerico,
    private router: Router,
    private _route: ActivatedRoute,
    private localStorageService: LocalStorageService,
  ) {
    this.operacionRespuesta = new RespuestaGenerica();
    this.modelo_configuracion = new ServiciosRutas();
    this.validarAcceso();
    this.iniciarFormulario();
  }



  ngOnInit(): void {
    this.isDictaminador = AuthIdentity.IsDictaminador();
    this.setTitulo(this.TipoDomicilio);
    this.formGroup.controls["d_tipo_domicilio"].setValue(this.TipoDomicilio);

    if ((this._route.snapshot.routeConfig.path).includes("solicitudtomanotaconsulta")) {
      this.id_bloqueo = 1;
    }
    this.bloqueoTN = this.id_bloqueo == 1 ? true : false;
  }

  ngAfterViewInit(): void {
    this.formGroup.controls["d_tipo_domicilio"].setValue(this.TipoDomicilio);
  }

  private iniciarFormulario(): void {
    this.formGroup = this.fb.group({
      d_id_domicilio: [0],
      d_tipo_domicilio: [this.TipoDomicilio],
      d_cpostal: ["", {
        validators: [Validators.required,
        Validators.maxLength(5),
        Validators.maxLength(6)]
      },],
      d_endidad: [""],
      d_colonia: ["", { validators: [Validators.required] },],
      d_ciudad: [""],
      d_calle: ["", {
        validators: [Validators.required,
        Validators.minLength(1),
        Validators.maxLength(250)]
      }],
      d_numeroi: [""],
      d_numeroe: [""],
    });
  }

  validarAcceso(): void {

    let params = this.localStorageService.getJsonValue('solicitudregistroconsulta');
    if (params != null && localStorage.getItem("solicitudregistroconsulta") === "1") {
      this.id_bloqueo = 1;
    }

    let perfil = AuthIdentity.IsAsignador();
    this.bloqueo = this.id_bloqueo == 1 ? true : perfil ? true : false;
  }

  setTitulo(TipoDomicilio: number) {
    switch (TipoDomicilio) {
      case 1:
        this.titulo = "Legal";
        break;
      case 2:
        this.titulo = "para Notificaciones";

        break;
      case 3:
        this.titulo = "Relación del Inmueble";

        break;
    }
  }

  public onEntrySelected(keyword: string) {
    if (keyword.includes(" ")) {
      return;
    }

    this.Entidad = null;
    this.Municipio = null;
    this.formGroup.get("d_colonia").patchValue(null);
    this.formGroup.get("d_cpostal").patchValue(null);

    if (keyword != "") {
      this.obtenerColonias(keyword);
    }
  }

  obtenerColonias(keyword: string, esPrimeraVez?: number) {

    if (esPrimeraVez) {
      this.cuantasVecesSeHaEntrado = this.cuantasVecesSeHaEntrado + 1
      if (this.cuantasVecesSeHaEntrado > 1) {
        return;
      }
    }

    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpGet(
        this.modelo_configuracion.serviciosCatalogos +
        "/ConsultaListaCatalogosColonia/Get?keyword=" +
        keyword
      )
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.listaColonia = [] =
              tempdate.response as ConsultaListaCatalogoColoniaResponse[];
            this.formGroup.get("d_cpostal").patchValue(keyword);
            this.Entidad = this.listaColonia[0].estado;
            this.Municipio = this.listaColonia[0].municipio;
            this.registroDomicilio.emit(this.formGroup.value);
          } else {
            this.listaColonia = [];
          }
          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.operacionRespuesta.EstaEjecutando = false;
        }
      );
  }

  obtenerErroresCPostal() {
    var campo = this.formGroup.get("d_cpostal");
    if (campo.hasError("required")) return "El campo es requerido";
    if (campo.hasError("minlength")) return "El texto es muy corto";
    if (campo.hasError("maxlength")) return "El texto es demasiado largo";
  }
  obtenerErroresColonia() {
    var campo = this.formGroup.get("d_colonia");
    if (campo.hasError("required")) return "El campo es requerido";
    if (campo.hasError("minlength")) return "El texto es muy corto";
    if (campo.hasError("maxlength")) return "El texto es demasiado largo";
  }

  obtenerErroresCalle() {
    var campo = this.formGroup.get("d_calle");
    if (campo.hasError("required")) return "El campo es requerido";
    if (campo.hasError("minlength")) return "El texto es muy corto";
    if (campo.hasError("maxlength")) return "El texto es demasiado largo";
  }

  obtenerErroresTipoDom() {
    var campo = this.formGroup.get("d_tipo_domicilio");
    if (campo.hasError("required")) return "El campo es requerido";
    if (campo.hasError("min")) return "El texto es muy corto";
  }

  // obtenerErroresNumeroi() {
  //   var campo = this.formGroup.get("d_numeroi");
  //   if (campo.hasError("required")) return "El campo es requerido";
  //   if (campo.hasError("minlength")) return "El texto es muy corto";
  //   if (campo.hasError("maxlength")) return "El texto es demasiado largo";
  // }
}
