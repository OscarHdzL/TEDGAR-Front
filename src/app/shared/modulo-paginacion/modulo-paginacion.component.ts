import { Component, Input, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { AuthIdentity } from "src/app/guards/AuthIdentity";
import { route } from "src/app/model/Utilities/route";
import { ModuloModalMensajeComponent } from "../modulo-modal-mensaje/modulo-modal-mensaje.component";

@Component({
  selector: "app-modulo-paginacion",
  templateUrl: "./modulo-paginacion.component.html",
  styleUrls: ["./modulo-paginacion.component.css"],
})
export class ModuloPaginacionComponent implements OnInit {
  constructor(private router: Router, public modalService: NgbModal) {}

  @Input()
  routes: route[];

  @Input()
  tramiteId: number;

  isDictaminador: boolean;

  modalrefMsg: NgbModalRef;

  ngOnInit(): void {}

  pageChange(adelante: boolean) {
    if (this.tramiteId != null) {
      this.openMensajes(
        `No se puede continuar con el paso siguiente,
      hay información incompleta o se ha guardado la información.`,
        'error'
      );
      return;
    }
    let active = this.routes.find((x) => x.active);
    if (adelante) {
      let next = this.routes.find((rr) => rr.id === active.id + 1);

      if (next.link != undefined)
        this.router.navigate([next.link + "/" + this.tramiteId]);
    } else {
      let next = this.routes.find((rr) => rr.id === active.id - 1);
      if (next.link != undefined)
        this.router.navigate([next.link + "/" + this.tramiteId]);
    }
  }
  returnSpecificPage(id: number) {
    let rutadesde = location.pathname.split('/')[2];
    let desde;
    switch (rutadesde) {
      case 'domiciliolegal':
        desde = 2
          break;
      case 'relacioninmueble':
        desde = 3
          break;
      case 'especificacionesterreno':
        desde = 4
          break;
      case 'representantes':
        desde = 5
          break;
      case 'constancianotario':
        desde = 6
          break;
      default:
      desde = 1
      break;
   }
   this.isDictaminador = AuthIdentity.IsDictaminador();
   let bndAcceso;
   if (this.isDictaminador == false) {

    if ((id - 1) == desde) {
      bndAcceso = true;
    } else {
      if (id <= desde) {
        bndAcceso = true;
      } else {
        bndAcceso = false;
      }
    }
  }else{
    bndAcceso = true;
  }

    if (bndAcceso == false) {
      this.openMensajes(
        `Para navegar entre los pasos, debe ser en orden consecutivo, para que el sistema aplique las validaciones en la información capturada.`,
        'advertencia'
      );
      return;
    }
    let route = this.routes.find((x) => (x.id === id));

    this.router.navigate([route.link + "/" + this.tramiteId]);
  }

  openMensajes(Mensaje: string, Tipo: "error" | "exito" | "advertencia" ) {
    this.modalrefMsg = this.modalService.open(ModuloModalMensajeComponent, {
      ariaLabelledBy: "modal-basic-title",
    });
    this.modalrefMsg.componentInstance.mensajesExito = [];
    this.modalrefMsg.componentInstance.mensajesError = [];
    this.modalrefMsg.componentInstance.mensajesAdvertencia = [];
    if (Tipo=="error") {
      this.modalrefMsg.componentInstance.showErrors = true;
      this.modalrefMsg.componentInstance.mensajesError.push(Mensaje);
    } else if(Tipo=="advertencia"){
      this.modalrefMsg.componentInstance.showAdvertencias = true;
      this.modalrefMsg.componentInstance.mensajesAdvertencia.push(Mensaje);
    } else {
      this.modalrefMsg.componentInstance.showExitos = true;
      this.modalrefMsg.componentInstance.mensajesExito.push(Mensaje);
    }
  }
}
