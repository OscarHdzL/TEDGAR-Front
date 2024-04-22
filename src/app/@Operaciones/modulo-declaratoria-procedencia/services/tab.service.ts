import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject } from 'rxjs';
import { ModuloModalAdvertenciaComponent } from 'src/app/shared/modulo-modal-advertencia/modulo-modal-advertencia.component';


@Injectable({
  providedIn: 'root'
})

export class TabService {

  public numeroTab$ = new BehaviorSubject<number>(1);
  numeroTabObs$ = this.numeroTab$.asObservable();
  modalrefAdvertencia: NgbModalRef;

  public estaCargando$ = new BehaviorSubject<boolean>(false);
  estaCargandoObs$ = this.estaCargando$.asObservable();

  public idDeclaratoria$ = new BehaviorSubject<boolean>(false);
  idDeclaratoriaObs$ = this.idDeclaratoria$.asObservable();

  public paso1$ = new BehaviorSubject<boolean>(false);
  paso1Obs$ = this.paso1$.asObservable();

  public paso2$ = new BehaviorSubject<boolean>(false);
  paso2Obs$ = this.paso2$.asObservable();

  public paso3$ = new BehaviorSubject<boolean>(false);
  paso3Obs$ = this.paso3$.asObservable();

  public paso4$ = new BehaviorSubject<boolean>(false);
  paso4Obs$ = this.paso4$.asObservable();

  public paso5$ = new BehaviorSubject<boolean>(false);
  paso5Obs$ = this.paso5$.asObservable();

  public pasoContinuacion$ = new BehaviorSubject<number>(1);
  pasoContinuacionObs$ = this.pasoContinuacion$.asObservable();

  public ultimoPasoRegistrado$ = new BehaviorSubject<number>(1);
  ultimoPasoRegistradoObs$ = this.ultimoPasoRegistrado$.asObservable();

  public valoresTabs$ = new BehaviorSubject<number>(1);
  valoresTabsObs$ = this.valoresTabs$.asObservable();


  constructor(private modalService: NgbModal,
    private router: Router) { }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public ngOnInit() { }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public cerrarTab() {
    this.numeroTab$.next(6)
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public cambiarTab(valor: number) {
    this.numeroTab$.next(valor)
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public async salirModal(ruta: string) {
    let instance = this;
    this.modalrefAdvertencia = this.modalService.open(ModuloModalAdvertenciaComponent,
      {
        ariaLabelledBy: "modal-basic-title",
      }
    );
    this.modalrefAdvertencia.componentInstance.mensajeTitulo = "Salir de solicitud de declariatoria";
    this.modalrefAdvertencia.componentInstance.mensaje = "¿Está seguro de que desea salir del trámite solicitud de declariatoria?";
    this.modalrefAdvertencia.result.then((result) => {
      if (result) instance.router.navigate([ruta]);
    });
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public cambiarCargando(valor: boolean) {
    this.estaCargando$.next(valor)
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public cambiarIdDeclaratoria(valor: any) {
    this.idDeclaratoria$.next(valor)
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public cambiarPasoContinuacion(valor: number) {
    this.pasoContinuacion$.next(valor)
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public cambiarValorPaso(paso: number, valor) {
    if (paso == 1)
      this.paso1$.next(valor)
    if (paso == 2)
      this.paso2$.next(valor)
    if (paso == 3)
      this.paso3$.next(valor)
    if (paso == 4)
      this.paso4$.next(valor)
    if (paso == 5)
      this.paso5$.next(valor)
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public cambiarTabSolicitudRegistro(valor) {
    this.ultimoPasoRegistrado$.next(valor)
  }

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  public cambiarValoresTabs(numeroTab, ultimoPasoAlQueTenemosAcceso) {

    if (numeroTab == 1 && ultimoPasoAlQueTenemosAcceso == 1) {
      this.valoresTabs$.next(2);
      return;
    }

    if (numeroTab == 2 && ultimoPasoAlQueTenemosAcceso == 2) {
      this.valoresTabs$.next(3);
      return;
    }

    if (numeroTab == 3 && ultimoPasoAlQueTenemosAcceso == 3) {
      this.valoresTabs$.next(4);
      return;
    }

    if (numeroTab == 4 && ultimoPasoAlQueTenemosAcceso == 4) {
      this.valoresTabs$.next(5);
      return;
    }

    if (numeroTab == 5 && ultimoPasoAlQueTenemosAcceso == 5) {
      this.valoresTabs$.next(6);
      return;
    }


    if (numeroTab > ultimoPasoAlQueTenemosAcceso) {
      this.valoresTabs$.next(numeroTab < 6 ? numeroTab + 1 : 6);
    }
  }


}


