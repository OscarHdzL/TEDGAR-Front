import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { RespuestaGenerica } from '../../../model/Operaciones/generales/RespuestaGenerica';
import { ServiciosRutas } from '../../../model/Operaciones/generales/ServiciosRutas';
import { ServiceGenerico } from '../../../services/service-generico.service';

@Component({
  selector: 'app-modulo-solicitud-domicilio-notificacion',
  templateUrl: './modulo-solicitud-domicilio-notificacion.component.html',
  styleUrls: ['./modulo-solicitud-domicilio-notificacion.component.css'],
  providers: [ServiceGenerico]
})
/** modulo-solicitud-domicilio-notificacion component*/
export class ModuloSolicitudDomicilioNotificacionComponent implements OnInit{
  public formLogin: FormGroup;
  //formGroup: any;
  //fb: any;
  listaModalidad = [];
  operacionRespuesta: RespuestaGenerica;
  modelo_configuracion: ServiciosRutas;
  formGroup: FormGroup;
  /** modulo-solicitud-domicilio-notificacion ctor */
  constructor(private services: ServiceGenerico, private fb: FormBuilder) {
    this.operacionRespuesta = new RespuestaGenerica();
    this.modelo_configuracion = new ServiciosRutas();
  }
  OnSubmit() { }

  ngOnInit(): void {
    this.cargarModalidades();
    this.formGroup = this.fb.group({
    });
  }

  private cargarModalidades(): void {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services.HttpGet(`${this.modelo_configuracion.serviciosCatalogos}/ConsultaListaCatalogosCotejo/Get?Activos=${true}`).subscribe(
      (response: any) => {
        this.operacionRespuesta.EstaEjecutando = false;
        this.listaModalidad = response.response;
      },
      (error) => {
        this.operacionRespuesta.EstaEjecutando = false;
        this.operacionRespuesta.EsMsjError = false;
      });
  }

}
