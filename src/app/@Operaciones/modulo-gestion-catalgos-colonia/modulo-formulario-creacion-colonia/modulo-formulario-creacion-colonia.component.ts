import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { CatalogoColoniaInsertRequest } from "src/app/model/Catalogos/CatalogoColonia";
import { ConsultaListaCatalogoMunicipioResponse } from "src/app/model/Catalogos/CatalogoMunicipio";
import { RespuestaGenerica } from "src/app/model/Operaciones/generales/RespuestaGenerica";

@Component({
  selector: "app-modulo-formulario-creacion-colonia",
  templateUrl: "./modulo-formulario-creacion-colonia.component.html",
  styleUrls: ["./modulo-formulario-creacion-colonia.component.css"],
})
export class ModuloFormularioCreacionColoniaComponent implements OnInit {
  @Output()
  registrarCatalogo: EventEmitter<CatalogoColoniaInsertRequest> =
    new EventEmitter<CatalogoColoniaInsertRequest>();
  @Input()
  catalogoEditar: CatalogoColoniaInsertRequest;

  formGroup: FormGroup;
  listMunicipios: ConsultaListaCatalogoMunicipioResponse[];
  public operacionRespuesta: RespuestaGenerica;

  constructor(public activeModal: NgbActiveModal, private fb: FormBuilder) {
  }
  ngOnInit(): void {
    this.formGroup = this.fb.group({
      c_nombre_n: [
        "",
        {
          validators: [
            Validators.required,
            Validators.minLength(5),
            Validators.maxLength(60),
          ],
          // asyncValidators: [courseTitleValidator(this.catalogos)],
        },
      ],
      // c_descripcion_n: [
      //   "",
      //   { Validators: [Validators.required, Validators.maxLength(250)] },
      // ],
      id_municipio: ["", { validators: [Validators.required] }],
      c_cpostal_n: [
        "",
        {
          validators: [
            Validators.required,
            Validators.minLength(5),
            Validators.maxLength(6)
          ]
          // asyncValidators: [courseTitleValidator(this.catalogos)],
        },
      ],
      // c_f_inic_vig: ["", { validators: [Validators.required] }],
      // c_f_fin_vig: ["", { validators: [Validators.required] }],
    });
  }

  obtenerErroresNombre() {
    var campo = this.formGroup.get("c_nombre_n");
    if (campo.hasError("required")) return "El campo es requerido";
    if (campo.hasError("minlength")) return "El texto es muy corto";
    if (campo.hasError("maxlength")) return "El texto es muy largo";
  }
  // obtenerErroresDescripcion() {
  //   var campo = this.formGroup.get("c_descripcion_n");
  //   if (campo.hasError("required")) return "El campo es requerido";
  // }
  // obtenerErroresFechaInicio() {
  //   var campo = this.formGroup.get("c_f_inic_vig");
  //   if (campo.hasError("required")) return "El campo es requerido";
  // }
  // obtenerErroresFechaFin() {
  //   var campo = this.formGroup.get("c_f_fin_vig");
  //   if (campo.hasError("required")) return "El campo es requerido";
  // }

  obtenerErroresCpostal() {
    var campo = this.formGroup.get("c_cpostal_n");
    if (campo.hasError("required")) return "El campo es requerido";
    if (campo.hasError("maxlength") || campo.hasError("minlength"))
      return "El valor no es válido";
  }
  obtenerErroresMunicipio() {
    var campo = this.formGroup.get("id_municipio");
    if (campo.hasError("required")) return "El campo es requerido";
  }
  OnSubmit() {
    this.registrarCatalogo.emit(this.formGroup.value);
  }
}
