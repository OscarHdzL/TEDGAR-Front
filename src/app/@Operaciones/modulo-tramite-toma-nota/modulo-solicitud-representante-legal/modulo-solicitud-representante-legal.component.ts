import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { RespuestaGenerica } from '../../../model/Operaciones/generales/RespuestaGenerica';
import { ServiciosRutas } from '../../../model/Operaciones/generales/ServiciosRutas';
import { ServiceGenerico } from '../../../services/service-generico.service';

@Component({
  selector: 'app-modulo-solicitud-representante-legal',
  templateUrl: './modulo-solicitud-representante-legal.component.html',
  styleUrls: ['./modulo-solicitud-representante-legal.component.css'],
  providers: [ServiceGenerico]
})
/** modulo-solicitud-representante-legal component*/
export class ModuloSolicitudRepresentanteLegalComponent implements OnInit{
  /** modulo-solicitud-representante-legal ctor */
  public id_tramite: string;
  //formGroup: any;
  //fb: any;

  listaModalidad = [];
  operacionRespuesta: RespuestaGenerica;
  modelo_configuracion: ServiciosRutas;
  formGroup: FormGroup;
  constructor(private services: ServiceGenerico, private fb: FormBuilder) {
    this.operacionRespuesta = new RespuestaGenerica();
    this.modelo_configuracion = new ServiciosRutas();
  }

  OnSubmit() {
  }
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
