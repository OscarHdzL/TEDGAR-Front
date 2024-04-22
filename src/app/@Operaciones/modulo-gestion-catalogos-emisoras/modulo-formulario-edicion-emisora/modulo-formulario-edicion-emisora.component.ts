import { formatDate } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ServiceGenerico } from '../../../services/service-generico.service';
import { CatalogoEstados } from '../../../model/Catalogos/CatalogoEstados';
import { EditarCatalogoEmisoraRequest } from '../../../model/Catalogos/CatalogosEmisora';
import { CatalogoDirectorInsertRequest } from '../../../model/Catalogos/CatalogosDirector';
import { ServiciosRutas } from '../../../model/Operaciones/generales/ServiciosRutas';

@Component({
    selector: 'app-modulo-formulario-edicion-emisora',
    templateUrl: './modulo-formulario-edicion-emisora.component.html',
    styleUrls: ['./modulo-formulario-edicion-emisora.component.css'],
    providers: [ServiceGenerico]
})
/** modulo-formulario-edicion-credo component*/
export class ModuloFormularioEdicionEmisoraComponent implements OnInit {
    /** modulo-formulario-edicion-credo ctor */
  @Output()
  ActualizarCatalogo: EventEmitter<EditarCatalogoEmisoraRequest[]> = new EventEmitter<EditarCatalogoEmisoraRequest[]>();
  @Input()
  catalogoEditar: EditarCatalogoEmisoraRequest;
  private modelo_configuracion: ServiciosRutas = new ServiciosRutas();
  public states:CatalogoEstados[] = [] as CatalogoEstados[];

  formGroup: FormGroup;
  constructor(public activeModal: NgbActiveModal, private fb: FormBuilder,private services: ServiceGenerico) { }

  ngOnInit(): void {

    
    this.formGroup = this.fb.group({
      id:[""],
      frecuencia_canal: ["", Validators.required],
      proveedor: [""],
      televisora_radiodifusora: ["", Validators.required],
      lugar_transmision: ["", Validators.required],
      televisora: ["", Validators.required],
    });

    this.services.HttpGet( this.modelo_configuracion.serviciosOperaciones + "/ConsultaEstados/Get" ).subscribe(tempdate => {
      
      this.states = [] = tempdate.response as CatalogoEstados[]
    
      this.catalogoEditar.televisora = this.catalogoEditar.televisora ? 1 : 0;
      
      if (this.catalogoEditar != undefined) 
        this.formGroup.patchValue(this.catalogoEditar);
    } );
      

    
   
  }

  OnSubmit = () => this.ActualizarCatalogo.emit(this.formGroup.value);
  
}
