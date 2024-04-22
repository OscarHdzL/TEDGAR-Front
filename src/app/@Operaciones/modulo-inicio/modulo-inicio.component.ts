import { Component, OnInit} from "@angular/core";
import { ServiceGenerico } from "../../services/service-generico.service";
import { RouterModule } from '@angular/router';
import { AuthIdentity } from "src/app/guards/AuthIdentity";
import { ServiciosRutas } from "src/app/model/Operaciones/generales/ServiciosRutas";
import { PermisoPersonaResponse } from "src/app/model/Catalogos/PermisosPersona";

@Component({
  selector: "app-modulo-inicio",
  templateUrl: "./modulo-inicio.component.html",
  styleUrls: ["./modulo-inicio.component.css"],
  providers: [ServiceGenerico],
})
export class ModuloInicioComponent implements OnInit {
  idUsuario: number;
  private modelo_configuracion: ServiciosRutas;
  public permisoPersona: PermisoPersonaResponse[];

        constructor(private services: ServiceGenerico){
    this.modelo_configuracion = new ServiciosRutas();
  }

  ngOnInit(): void {
  // this.idUsuario = AuthIdentity.ObtenerUsuarioRegistro();
  //  this.getPermisoPersona(); 
  }
  //#endregion


  

  // getPermisoPersona() {
  //   // this.operacionRespuesta.EstaEjecutando = true;
  //   this.services.HttpGet(this.modelo_configuracion.serviciosOperaciones + "/ConsultaPermisoPersona/Get?id_usuario=" + this.idUsuario)
  //     .subscribe((tempdate) => {
  //         if (tempdate) {
  //           this.permisoPersona = tempdate.response as PermisoPersonaResponse[];
  //         } 
  //       },
  //       async (err) => {
  //         // this.operacionRespuesta.EstaEjecutando = false;
  //       }
  //     );
  // }
}
