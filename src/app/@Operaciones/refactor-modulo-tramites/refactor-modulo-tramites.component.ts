import { Component, OnInit } from '@angular/core';
import { AuthIdentity } from 'src/app/guards/AuthIdentity';
import { TabService } from '../modulo-declaratoria-procedencia/services/tab.service';
import { Subscription } from 'rxjs';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModuloModalMensajeComponent } from 'src/app/shared/modulo-modal-mensaje/modulo-modal-mensaje.component';

@Component({
  selector: 'app-refactor-modulo-tramites',
  templateUrl: './refactor-modulo-tramites.component.html',
  styleUrls: ['./refactor-modulo-tramites.component.css']
})
export class RefactorModuloTramitesComponent implements OnInit {
  public routes: any[];
  public pasoSeleccionado: any = null;
  isDictaminador: boolean = false;
  isAsignador: boolean = false;
  pasoSeleccionadoObs: Subscription | undefined;
  ultimoPasoAlQueTenemosAcceso: number = 0;
  ultimoPasoAlQueTenemosAccesoObs: Subscription | undefined;
  modalrefMsg: NgbModalRef;
  estatus = Number(localStorage.getItem("estatus")!)
  constructor(public tabService: TabService, public modalService: NgbModal) { }

  public async ngOnInit() {
    this.isDictaminador = AuthIdentity.IsDictaminador();
    this.isAsignador = AuthIdentity.IsAsignador()
    let ultimo = Number(localStorage.getItem("ultimoPasoLlenado")!)
    // console.log(ultimo)
    this.routes = this.isDictaminador ?
      [
        {
          id: 1,
          nombre: "1",
          activo: true
        },
        {
          id: 2,
          nombre: "2",
          activo: false
        },
        {
          id: 3,
          nombre: "3",
          activo: false
        },
        {
          id: 4,
          nombre: "4",
          activo: false
        },
        {
          id: 5,
          nombre: "5",
          activo: false
        },
        {
          id: 6,
          nombre: "6",
          activo: false
        },
        {
          id: 7,
          nombre: "7",
          activo: false
        },
        {
          id: 8,
          nombre: "8",
          activo: false
        },
        {
          id: 9,
          nombre: "9",
          activo: false
        },
        {
          id: 10,
          nombre: "10",
          activo: false
        }
      ] :
      [
        {
          id: 1,
          nombre: "Paso 1",
          activo: true
        },
        {
          id: 2,
          nombre: "Paso 2",
          activo: false
        },
        {
          id: 3,
          nombre: "Paso 3",
          activo: false
        },
        {
          id: 4,
          nombre: "Paso 4",
          activo: false
        },
        {
          id: 5,
          nombre: "Paso 5",
          activo: false
        },
        {
          id: 6,
          nombre: "Paso 6",
          activo: false
        }
      ]
    this.pasoSeleccionadoObs = this.tabService.ultimoPasoRegistrado$.subscribe(async (valor) => {
      this.pasoSeleccionado = valor;
      // console.log("cambio el id", valor)
      for (let i = 0; i < this.routes.length; i++) {
        if (this.routes[i].id == this.pasoSeleccionado) this.routes[i].activo = true
        else this.routes[i].activo = false
      }
    })
    this.pasoSeleccionado = ultimo == null || ultimo == 0 ?
      this.pasoSeleccionado = 1 : ultimo == 6 ? this.pasoSeleccionado = 6 : this.pasoSeleccionado = ultimo + 1;
    this.tabService.cambiarTabSolicitudRegistro(this.pasoSeleccionado)

    for (let i = 0; i < this.routes.length; i++) {
      if (this.routes[i].id == this.pasoSeleccionado) this.routes[i].activo = true
      else this.routes[i].activo = false
    }


    this.ultimoPasoAlQueTenemosAccesoObs = this.tabService.valoresTabs$.subscribe(async (valor) => {
      this.ultimoPasoAlQueTenemosAcceso = valor;
      localStorage.setItem("ultimoPasoAlQueTenemosAcceso", String(this.ultimoPasoAlQueTenemosAcceso))
    })
    this.ultimoPasoAlQueTenemosAcceso = this.pasoSeleccionado;
    this.tabService.cambiarValoresTabs(ultimo, this.ultimoPasoAlQueTenemosAcceso)
    localStorage.setItem("ultimoPasoAlQueTenemosAcceso", String(this.ultimoPasoAlQueTenemosAcceso))
    // console.log(this.pasoSeleccionado, this.ultimoPasoAlQueTenemosAcceso)

    if (this.isAsignador) {
      this.pasoSeleccionado = 1;
      this.tabService.cambiarTabSolicitudRegistro(this.pasoSeleccionado)
    }
    if (this.isDictaminador) {
      if (this.estatus == 19 || this.estatus == 20) {
        this.pasoSeleccionado = 1;
        this.tabService.cambiarTabSolicitudRegistro(this.pasoSeleccionado)
        this.ultimoPasoAlQueTenemosAcceso = 6;
      }else {
        this.pasoSeleccionado = 1;
        this.tabService.cambiarTabSolicitudRegistro(this.pasoSeleccionado)
        this.ultimoPasoAlQueTenemosAcceso = 10;
      }
    }
  }

  async ngOnDestroy() {
    this.pasoSeleccionadoObs.unsubscribe()
  }


  async cambiarComponente(route: any) {

    /*if (this.isDictaminador) {
      if (route.id > 6) return;
      this.pasoSeleccionado = route.id;
      for (let i = 0; i < this.routes.length; i++) {
        if (this.routes[i].id == this.pasoSeleccionado) this.routes[i].activo = true
        else this.routes[i].activo = false
      }
      return;
    }*/

    if (route.id <= this.ultimoPasoAlQueTenemosAcceso) {
      this.pasoSeleccionado = route.id;
      for (let i = 0; i < this.routes.length; i++) {
        if (this.routes[i].id == this.pasoSeleccionado) this.routes[i].activo = true
        else this.routes[i].activo = false
      }
    } else {

      if (this.isDictaminador) {
        if (this.estatus == 19 || this.estatus == 20) {

        } else {
          this.openMensajes("Antes de continuar complete el paso " + this.ultimoPasoAlQueTenemosAcceso, true);
        }
      }

    }
  }

  openMensajes(Mensaje: string, Error: boolean) {
    this.modalrefMsg = this.modalService.open(ModuloModalMensajeComponent, {
      ariaLabelledBy: "modal-basic-title",
    });
    this.modalrefMsg.componentInstance.mensajesExito = [];
    this.modalrefMsg.componentInstance.mensajesError = [];
    this.modalrefMsg.componentInstance.mensajesTitulo = "Carga de Información";
    if (Error) {
      this.modalrefMsg.componentInstance.showErrors = true;
      this.modalrefMsg.componentInstance.mensajesError.push(Mensaje);
    } else {
      this.modalrefMsg.componentInstance.showExitos = true;
      this.modalrefMsg.componentInstance.mensajesExito.push(Mensaje);
    }
  }


}
