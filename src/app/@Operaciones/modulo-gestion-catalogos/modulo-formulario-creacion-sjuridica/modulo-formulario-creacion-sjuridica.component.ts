import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CatalogoSJuridicaInsertRequest } from 'src/app/model/Catalogos/CatalogosSJuridica';

@Component({
  selector: 'app-modulo-formulario-creacion-sjuridica',
  templateUrl: './modulo-formulario-creacion-sjuridica.component.html',
  styleUrls: ['./modulo-formulario-creacion-sjuridica.component.css']
})
export class ModuloFormularioCreacionSjuridicaComponent implements OnInit {

  @Output()
  registrarCatalogo: EventEmitter<CatalogoSJuridicaInsertRequest[]> =
    new EventEmitter<CatalogoSJuridicaInsertRequest[]>();

    form=this.fb.group({
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
  constructor( public activeModal: NgbActiveModal,
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
