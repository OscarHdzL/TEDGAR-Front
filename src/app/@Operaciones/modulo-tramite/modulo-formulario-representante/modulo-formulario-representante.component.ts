import { formatDate } from "@angular/common";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { ActualizarRepresentateRequest } from "src/app/model/Operaciones/Representante/Representante";

@Component({
  selector: "app-modulo-formulario-representante",
  templateUrl: "./modulo-formulario-representante.component.html",
  styleUrls: ["./modulo-formulario-representante.component.css"],
})
export class ModuloFormularioRepresentanteComponent implements OnInit {
  @Output()
  ActualizarRepresentante: EventEmitter<ActualizarRepresentateRequest> = new EventEmitter<ActualizarRepresentateRequest>();
  @Input()
  representanteEditar: ActualizarRepresentateRequest;
  @Input()
  listaTipoR = [];
  formGroup: FormGroup;
  hideparam: boolean = true;
  invalidrol: boolean = true;
  get p_cargo() {
    return this.formGroup.get("p_cargo");
  }
  get c_organo_g() {
    return this.formGroup.get("c_organo_g");
  }

  constructor(public activeModal: NgbActiveModal, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      s_id: ["", { validators: [Validators.required] }],
      p_id: [0, { validators: [Validators.required] }],
      p_nombre: [
        "",
        {
          validators: [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(50),
          ],
        },
      ],
      p_apaterno: [
        "",
        {
          validators: [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(50),
          ],
        },
      ],
      p_amaterno: [""],
      p_telefono: [""],
      p_correo: [
        "",
        {
          validators: [
            Validators.required,
            Validators.minLength(9),
            Validators.maxLength(150),
          ],
        },
      ],
      p_cargo: [
        "",
        {
          validators: [],
        },
      ],
      c_organo_g: [
        "",
        {
          validators: [],
        },
      ],
      t_rep_legal: [
        false,
        {
          validators: [],
        },
      ],
      t_rep_asociado: [
        false,
        {
          validators: [],
        },
      ],
      t_ministro_culto: [
        false,
        {
          validators: [],
        },
      ],
      t_organo_gob: [
        false,
        {
          validators: [],
        },
      ],
    });
    if (this.representanteEditar != undefined) {
      this.formGroup.patchValue(this.representanteEditar);
      this.enableValidations();
    }
  }

  obtenerErroresNombre() {
    var campo = this.formGroup.get("p_nombre");
    if (campo.hasError("required")) return "El campo es requerido";
    if (campo.hasError("min")) return "El texto es muy corto";
    if (campo.hasError("maxlength")) return "El texto es demasiado largo";
  }
  obtenerErroresPaterno() {
    var campo = this.formGroup.get("p_apaterno");

    if (campo.hasError("required")) return "El campo es requerido";
    if (campo.hasError("min")) return "El texto es muy corto";
    if (campo.hasError("maxlength")) return "El texto es demasiado largo";
  }
  obtenerErroresMaterno() {
    var campo = this.formGroup.get("p_amaterno");
    if (campo.hasError("required")) return "El campo es requerido";
    if (campo.hasError("min")) return "El texto es muy corto";
    if (campo.hasError("maxlength")) return "El texto es demasiado largo";
  }
  // obtenerErroresTel() {
  //   var campo = this.formGroup.get("p_telefono");
  //   if (campo.hasError("required")) return "El campo es requerido";
  //   if (campo.hasError("minlength")) return "El valor no es válido";
  //   if (campo.hasError("maxlength")) return "El valor no es válido";
  // }
  obtenerErroresCorreo() {
    var campo = this.formGroup.get("p_correo");
    if (campo.hasError("required")) return "El campo es requerido";
    if (campo.hasError("email")) return "El valor no es un correo válido";
  }
  obtenerErroresCargo() {
    var campo = this.formGroup.get("p_cargo");
    if (campo.hasError("required")) return "El campo es requerido";
    if (campo.hasError("minlength")) return "El texto es muy corto";
    if (campo.hasError("maxlength")) return "El texto es demasiado largo";
  }
  obtenerErroresCargoG() {
    var campo = this.formGroup.get("c_organo_g");
    if (campo.hasError("required")) return "El campo es requerido";
    if (campo.hasError("minlength")) return "El texto es muy corto";
    if (campo.hasError("maxlength")) return "El texto es demasiado largo";
  }
  OnSubmit() {
    this.ActualizarRepresentante.emit(this.formGroup.value);
  }
  enableValidations() {
    if (
      this.formGroup.get("t_rep_legal").value ||
      this.formGroup.get("t_ministro_culto").value ||
      this.formGroup.get("t_rep_asociado").value ||
      this.formGroup.get("t_organo_gob").value
    )
      this.invalidrol = false;
    else this.invalidrol = true;

    if (this.formGroup.get("t_organo_gob").value) {
      this.p_cargo.setValidators([
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(60),
      ]);
      this.c_organo_g.setValidators([
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(60),
      ]);
      this.hideparam = false;
      this.formGroup.get("c_organo_g").updateValueAndValidity();
      this.formGroup.get("p_cargo").updateValueAndValidity();
    } else {
      this.hideparam = true;
      this.p_cargo.clearValidators();
      this.c_organo_g.clearValidators();
      this.formGroup.get("c_organo_g").updateValueAndValidity();
      this.formGroup.get("c_organo_g").reset();
      this.formGroup.get("p_cargo").updateValueAndValidity();
      this.formGroup.get("p_cargo").reset();
    }
  }
  getRequired(tipo: number) :boolean{
    if (tipo===1)
      return this.formGroup.get("p_cargo").hasValidator(Validators.required);
    else return this.formGroup.get("c_organo_g").hasValidator(Validators.required);
  }
}
