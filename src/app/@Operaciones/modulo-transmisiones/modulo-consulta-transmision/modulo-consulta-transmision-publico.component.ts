import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthIdentity } from '../../../guards/AuthIdentity';
import { CotejoDetallePublicoTransmision } from '../../../model/Operaciones/Cotejo/Cotejo';
import { RespuestaGenerica } from '../../../model/Operaciones/generales/RespuestaGenerica';
import { ServiciosRutas } from '../../../model/Operaciones/generales/ServiciosRutas';
import { ServiceGenerico } from '../../../services/service-generico.service';

@Component({
  selector: 'app-modulo-consulta-transmision-publico',
  templateUrl: './modulo-consulta-transmision-publico.component.html',
  styleUrls: ['./modulo-consulta-transmision-publico.component.css'],
  providers: [ServiceGenerico],
})
export class ModuloConsultaTransmisionPublicoComponent implements OnInit {
  pantallaAprobado: boolean = false;
  pantallaObservaciones: boolean = false;
  pantallaCancelacion: boolean = false;
  pantallaAutorizada: boolean = false;
  pantallaSinDatos: boolean = false;
  us_id: number;
  usuarioDictaminador: string;
  respuesta: CotejoDetallePublicoTransmision;
  id_transmision: number;
  id_trans:number;

  operacionRespuesta: RespuestaGenerica;
  modelo_configuracion: ServiciosRutas;

  fecha: string;
  direccion: string;
  comentario:string;

  constructor(
    private services: ServiceGenerico, 
    private activetedRoute: ActivatedRoute) {
    this.operacionRespuesta = new RespuestaGenerica();
    this.modelo_configuracion = new ServiciosRutas();
    
  }

  ngOnInit(): void {
    this.us_id = AuthIdentity.ObtenerUsuarioRegistro();
    
    this.id_trans = parseInt(this.activetedRoute.snapshot.paramMap.get("Id"));
    this.cargarCotejo();
  }

  private cargarCotejo(): void {
    this.operacionRespuesta.EstaEjecutando = true;

    this.services
      .HttpGet(
        `${this.modelo_configuracion.serviciosOperaciones}/ConsultaDetalleTramiteTransmision/ConsultarSolicitudTransmision/GetTransmision?s_id_us=${this.us_id}&id_trans=${this.id_trans}`
      )
      .subscribe(
        (response: any) => {
          this.operacionRespuesta.EstaEjecutando = false;
          
          this.respuesta = response?.response[0] ?? null;
          if (this.respuesta != undefined || this.respuesta != null) {
            this.usuarioDictaminador = this.respuesta.usuario;
            this.fecha = this.respuesta.s_fecha;
            this.direccion = this.respuesta.s_direccion;
            this.comentario = this.respuesta.s_comentarios;
            this.id_transmision = this.respuesta.s_id_tramite;
            if (this.respuesta.s_estatus == 32) {
              this.pantallaAprobado = true;
            } else if (this.respuesta.s_estatus == 31) {
              this.pantallaObservaciones = true;
            } else if (this.respuesta.s_estatus == 33) {
              this.pantallaCancelacion = true;
            } else if (this.respuesta.s_estatus == 34) {
              this.pantallaAutorizada = true;
            } else {
              this.pantallaSinDatos = true;
            }
          } else {
            this.pantallaSinDatos = true;
          }
        },
        () => {
          this.operacionRespuesta.EstaEjecutando = false;
          this.operacionRespuesta.EsMsjError = false;
        }
      );
  }
  
}
