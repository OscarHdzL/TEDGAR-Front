import { ActivatedRoute, Router } from "@angular/router";
import { Component, OnInit } from '@angular/core';
import { ServiceGenerico } from "src/app/services/service-generico.service";
import { RespuestaGenerica } from "src/app/model/Operaciones/generales/RespuestaGenerica";
import { ServiciosRutas } from "../../model/Operaciones/generales/ServiciosRutas";
import { ConfirmarCorreoRequest, ConfirmarCorreoResponse } from "../../model/Operaciones/ConfirmarCorreo/ConfirmarCorreo";
@Component({
  selector: 'app-modulo-correo-confirmacion',
  templateUrl: './modulo-correo-confirmacion.component.html',
  styleUrls: ['./modulo-correo-confirmacion.component.css'],
  providers: [ServiceGenerico]
})
export class ModuloCorreoConfirmacionComponent implements OnInit {

  private modelo_configuracion: ServiciosRutas;
  public operacionRespuesta: RespuestaGenerica;

  public id_hash: string;
  public visible: boolean;
  public confirmed:boolean;
  public respuesta: ConfirmarCorreoResponse;
  public confirmarCorreoRequest: ConfirmarCorreoRequest = new ConfirmarCorreoRequest();
  public txtMsg: string;
  constructor(
    private services: ServiceGenerico,
     private _route: ActivatedRoute,
    private router: Router
    ) {
      this.modelo_configuracion = new ServiciosRutas();
     }

 
  ngOnInit(): void {
    // this.operacionRespuesta = new RespuestaGenerica();
    // this.modelo_configuracion = new ServiciosRutas();
    this.id_hash = this._route.snapshot.paramMap.get('iduser');

    if(this.id_hash != null) {
      this.guardarUsuarioSistema();
    } else {
      this.router.navigate([""]);
    }
  }
  
  public guardarUsuarioSistema() {
    this.confirmarCorreoRequest = new ConfirmarCorreoRequest();
    this.confirmarCorreoRequest.id_user = this.id_hash;
    this.services.HttpPost(this.confirmarCorreoRequest, this.modelo_configuracion.serviciosOperaciones + "/ConfirmarCorreo/Post")
      .subscribe((tempdate) => {
        if (tempdate) {
          this.respuesta = tempdate[0] as ConfirmarCorreoResponse;
          if (this.respuesta.confirmed === 1 && this.respuesta.codigoerror == 0) {
            this.txtMsg = "Su cuenta ha sido confirmada de manera exitosa."
          } else {
            this.txtMsg = "Su cuenta ha sido verificada previamente."
          }
        }
        });
  }

  regresar() {
    this.router.navigate(['/iniciar-sesion/']);
  }

}


