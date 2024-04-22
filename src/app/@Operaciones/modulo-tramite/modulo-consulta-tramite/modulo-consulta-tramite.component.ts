import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthGuard } from "src/app/guards/AuthGuard";
import { AuthIdentity } from "src/app/guards/AuthIdentity";
import { CotejoDetallePublico } from "src/app/model/Operaciones/Cotejo/Cotejo";
import { RespuestaGenerica } from "src/app/model/Operaciones/generales/RespuestaGenerica";
import { ServiciosRutas } from "src/app/model/Operaciones/generales/ServiciosRutas";
import { ServiceGenerico } from "src/app/services/service-generico.service";

@Component({
  selector: "app-modulo-consulta-tramite",
  templateUrl: "./modulo-consulta-tramite.component.html",
  styleUrls: ["./modulo-consulta-tramite.component.css"],
  providers: [ServiceGenerico],
})
export class ModuloConsultaTramiteComponent implements OnInit {
  show1: boolean = false;
  show2: boolean = false;
  show3: boolean = false;
  show4: boolean = false;
  showmensaje: boolean = false;
  us_id: number;
  id_tramite: number;
  usuarioDictaminador: string;
  respuesta: CotejoDetallePublico;

  operacionRespuesta: RespuestaGenerica;
  modelo_configuracion: ServiciosRutas;

  constructor(
    private auth: AuthGuard,
    private services: ServiceGenerico,
    private router: Router,
    private activetedRoute: ActivatedRoute
  ) {
    this.operacionRespuesta = new RespuestaGenerica();
    this.modelo_configuracion = new ServiciosRutas();
  }

  ngOnInit(): void {
    this.us_id = AuthIdentity.ObtenerUsuarioRegistro();
    this.id_tramite = parseInt(this.activetedRoute.snapshot.paramMap.get("Id"));
    this.cargarCotejo();
    localStorage.setItem("solicitudregistroconsulta", "0");
  }


  private cargarCotejo(): void {

    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpGet(
        `${this.modelo_configuracion.serviciosOperaciones}/ConsultaDetalleCotejo/ConsultarSolicitudRegistro/Get?s_id_us=${this.us_id}&id_tramite=${this.id_tramite}`
      )
      .subscribe(
        (response: any) => {
          this.operacionRespuesta.EstaEjecutando = false;
          this.respuesta = response?.response[0] ?? null;
          if (this.respuesta != undefined || this.respuesta != null) {
            this.usuarioDictaminador = this.respuesta.usuario;
            if (this.respuesta.s_cotejo_c != null) {
              this.activeChange(4);
            } else if (this.respuesta.s_cotejo_r != null) {
              this.activeChange(3);
            } else if (this.respuesta.s_cotejo_f != null) {
              this.activeChange(2);
            } else if (this.respuesta.s_cotejo_v != null) {
              this.activeChange(1);
            } else {
              this.activeChange(0);
            }
          }else {
            this.activeChange(0);
          }
        },
        (error) => {
          this.operacionRespuesta.EstaEjecutando = false;
          this.operacionRespuesta.EsMsjError = false;
        }
      );
  }
  activeChange(paso: number) {
    if (paso == 1) {
      this.show1 = true;
      this.show2 = false;
      this.show3 = false;
      this.show4 = false;
      this.showmensaje = false;
    } else if (paso == 2) {
      this.show1 = false;
      this.show4 = false;
      this.show2 = true;
      this.show3 = false;
      this.showmensaje = false;
    } else if (paso == 3) {
      this.show1 = false;
      this.show2 = false;
      this.show4 = false;
      this.show3 = true;
      this.showmensaje = false;
    } else if (paso == 4) {
      this.show1 = false;
      this.show2 = false;
      this.show3 = false;
      this.show4 = true;
      this.showmensaje = false;
    } else {
      this.show1 = false;
      this.show2 = false;
      this.show3 = false;
      this.show4 = false;

      this.showmensaje = true;
    }
  }

  editarSolicitud(reporte: any) {
    localStorage.setItem("solicitudregistroconsulta", null)
    localStorage.setItem("id_tramite", String(reporte))
    localStorage.setItem("ultimoPasoLlenado", "6")
    this.router.navigate(['alta-solicitud-registro']);
    // this.router.navigate(['/solicitudregistro/' + id_tramite]);
  }
}
