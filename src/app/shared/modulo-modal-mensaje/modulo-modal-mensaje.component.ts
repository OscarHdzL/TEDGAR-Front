import { Component, OnInit } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-modulo-modal-mensaje",
  templateUrl: "./modulo-modal-mensaje.component.html",
  styleUrls: ["./modulo-modal-mensaje.component.css"],
})
export class ModuloModalMensajeComponent implements OnInit {
  mensajesExito: string[];
  mensajesError: string[];
  mensajesAdvertencia: string[];
  showErrors = false;
  showExitos = false;
  showAdvertencias = false;
  mensajeTitulo:string="Mensaje";

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {}
}
