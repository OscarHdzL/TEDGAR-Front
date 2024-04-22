import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
// import { ServiciosRutas } from '../../../app/model/Operaciones/generales/ServiciosRutas';
// import { RespuestaGenerica } from '../../../app/model/Operaciones/generales/RespuestaGenerica';
import { ServiceGenerico } from '../../../app/services/service-generico.service';
import { AuthIdentity } from '../../../app/guards/AuthIdentity';
// import { CuentaAvisoPrivacidadResponse } from '../../../app/model/Operaciones/cuenta/AvisoPrivacidad';

@Component({
  selector: 'app-modulo-aviso-privacidad',
  templateUrl: './modulo-aviso-privacidad.component.html',
  styleUrls: ['./modulo-aviso-privacidad.component.css'],
  providers: [ServiceGenerico],
})
export class ModuloAvisoPrivacidadComponent implements OnInit {

  public siAcepto: boolean;
  // public operacionRespuesta: RespuestaGenerica;
  
  // private servicios: ServiciosRutas;

  constructor( private services: ServiceGenerico,
               private router: Router) {
    // this.operacionRespuesta = new RespuestaGenerica();
    // this.servicios = new ServiciosRutas();
  }

  ngOnInit(): void {
    this.siAcepto = false;
  }

  //#region Métodos publicos
  public aceptoAvisoPrivacidad(aceptoTerminos: boolean): void {
   
    if(aceptoTerminos) 
    {
      this.siAcepto = true;
    }
    else {
      this.siAcepto = false;
    }

  }

  public enviarSolicitud(): void {
    // this.operacionRespuesta.EstaEjecutando = true;
    // this.services.HttpPost(this.obtenerValoresSesion(),  `${this.servicios.serviciosOperaciones}/Cuenta/Post`).subscribe(
    //   (response: any) => {

    //     this.operacionRespuesta.EstaEjecutando = false;        
    //     var respuesta =  response.response as CuentaAvisoPrivacidadResponse[];
        
    //     if(respuesta.length > 0)
    //     {
    //       if(respuesta[0].avisoPrivacidad === true &&  respuesta[0].estatus === true )
    //       {
    //         this.router.navigate(['/cambio-contrasena']);
    //       }
    //     }
    //   },
    //   (error) => {
    //     this.operacionRespuesta.EstaEjecutando = false;
    //     this.operacionRespuesta.EsMsjError = false;
    //     this.operacionRespuesta.Msj = error.response[0];
    //   }
    // );
  }
  //#endregion

  //#region  
  private obtenerValoresSesion(): any {
    var usuarioActual = AuthIdentity.ObtenerUsuarioSesion();
    if(usuarioActual != null)
    {
      return JSON.stringify( {usuarioId: usuarioActual.IdUsuario});  
    }else {
      return JSON.stringify( {usuarioId: null });
    }
  }
  //#endregion

}
