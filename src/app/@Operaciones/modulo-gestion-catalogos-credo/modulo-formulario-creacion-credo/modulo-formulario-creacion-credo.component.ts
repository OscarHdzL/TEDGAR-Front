import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CatalogoCredoInsertRequest } from '../../../model/Catalogos/CatalogosCredo';

@Component({
    selector: 'app-modulo-formulario-creacion-credo',
    templateUrl: './modulo-formulario-creacion-credo.component.html',
    styleUrls: ['./modulo-formulario-creacion-credo.component.css']
})
/** modulo-formulario-creacion-credo component*/
export class ModuloFormularioCreacionCredoComponent implements OnInit {
    /** modulo-formulario-creacion-credo ctor */
  @Output()
  registrarCatalogo: EventEmitter<CatalogoCredoInsertRequest[]> =
    new EventEmitter<CatalogoCredoInsertRequest[]>();

  form = this.fb.group({
    nombre: [
      "",
      {
        validators: [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(60),
        ],
        // asyncValidators: [courseTitleValidator(this.catalogos)],
        updateOn: "blur",
      },
    ],
    // descripcion: ["", Validators.required],
    catalogos: this.fb.array([]),
  });
  constructor(public activeModal: NgbActiveModal,
    private fb: FormBuilder,) { }

  ngOnInit(): void {
    this.agregar();
  }


  get catalogos() {
    return this.form.controls["catalogos"] as FormArray;
  }

  public remover(index: number): void {
    this.catalogos.removeAt(index);
  }

  public agregar(): void {
    const catalogo = this.fb.group({
      nombre: ["", Validators.required],
      // descripcion: ["", Validators.required],
    });

    this.catalogos.push(catalogo);
  }


  OnSubmit() {

    this.registrarCatalogo.emit(this.catalogos.value);
  }
}
