import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CatalogoPaisoInsertRequest } from '../../../model/Catalogos/CatalogosPaiso';

@Component({
    selector: 'app-modulo-formulario-creacion-paiso',
    templateUrl: './modulo-formulario-creacion-paiso.component.html',
    styleUrls: ['./modulo-formulario-creacion-paiso.component.css']
})
/** modulo-formulario-creacion-paiso component*/
export class ModuloFormularioCreacionPaisoComponent implements OnInit{
  /** modulo-formulario-creacion-paiso ctor */
  @Output()
  registrarCatalogo: EventEmitter<CatalogoPaisoInsertRequest[]> =
    new EventEmitter<CatalogoPaisoInsertRequest[]>();

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
    private fb: FormBuilder) {

  }
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
