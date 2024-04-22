import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modulo-modal-advertencia',
  templateUrl: './modulo-modal-advertencia.component.html',
  styleUrls: ['./modulo-modal-advertencia.component.css']
})
export class ModuloModalAdvertenciaComponent implements OnInit {

  mensajeTitulo:string="Mensaje";
  mensaje: string;
  btnAceptarTxt: string = "Aceptar";
  btnCancelarTxt: string = "Cancelar";
  
  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {}
}
