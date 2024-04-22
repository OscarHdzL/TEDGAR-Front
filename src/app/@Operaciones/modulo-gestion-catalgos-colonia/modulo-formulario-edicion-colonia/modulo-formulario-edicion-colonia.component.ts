import { formatDate } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CatalogoColoniaInsertRequest, EditarCatalogoColoniaRequest } from 'src/app/model/Catalogos/CatalogoColonia';
import { ConsultaListaCatalogoMunicipioResponse } from 'src/app/model/Catalogos/CatalogoMunicipio';
import { RespuestaGenerica } from 'src/app/model/Operaciones/generales/RespuestaGenerica';
import { ServiciosRutas } from 'src/app/model/Operaciones/generales/ServiciosRutas';
import { ServiceGenerico } from 'src/app/services/service-generico.service';

@Component({
  selector: 'app-modulo-formulario-edicion-colonia',
  templateUrl: './modulo-formulario-edicion-colonia.component.html',
  styleUrls: ['./modulo-formulario-edicion-colonia.component.css'],
})
export class ModuloFormularioEdicionColoniaComponent implements OnInit {
  @Output()
  ActualizarCatalogo: EventEmitter<EditarCatalogoColoniaRequest> =
    new EventEmitter<EditarCatalogoColoniaRequest>();
  @Input()
  catalogoEditar: EditarCatalogoColoniaRequest;

  formGroup: FormGroup;
  listMunicipios: ConsultaListaCatalogoMunicipioResponse[];
  
  constructor(public activeModal: NgbActiveModal, private fb: FormBuilder) {
  }
  ngOnInit(): void {
    this.formGroup = this.fb.group({
      c_id: [
        "",
        {
          validators: [
            Validators.required,
          ],
          // asyncValidators: [courseTitleValidator(this.catalogos)],
        }
      ],
      
      c_nombre_n: [
        "",
        {
          validators: [
            Validators.required,
            Validators.minLength(5),
            Validators.maxLength(60)
          ]
          // asyncValidators: [courseTitleValidator(this.catalogos)],
        },
      ],
     
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
      // c_f_fin_vig: ["", { validators: [Validators.required] }]
    });
    if (this.catalogoEditar != undefined){
      this.formGroup.patchValue(this.catalogoEditar);
    }
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
    if (campo.hasError("maxlength")||campo.hasError("minlength")) return "El valor no es válido";
  }
  obtenerErroresMunicipio() {
    var campo = this.formGroup.get("id_municipio");
    if (campo.hasError("required")) return "El campo es requerido";
  }
  OnSubmit() {
    this.ActualizarCatalogo.emit(this.formGroup.value);
  }
}
