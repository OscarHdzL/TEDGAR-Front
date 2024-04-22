import { Component, Input, OnInit, Output } from "@angular/core";

@Component({
  selector: "app-modulo-mensajes",
  templateUrl: "./modulo-mensajes.component.html",
  styleUrls: ["./modulo-mensajes.component.css"],
})
export class ModuloMensajesComponent implements OnInit {
  @Input()
  mensajesExito: string[];
  @Input()
  mensajesError: string[];
  @Input()
  mensajesAdvertencia: string[];
  @Input()
  showErrors = false;
  @Input()
  showExitos = false;
  @Input()
  showAdvertencias = false;
  constructor() {}

  ngOnInit(): void {}
}
