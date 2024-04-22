import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as FileSaver from 'file-saver';
import { AuthIdentity } from 'src/app/guards/AuthIdentity';
import { PermisoPersonaResponse } from 'src/app/model/Catalogos/PermisosPersona';
import { ServiciosRutas } from 'src/app/model/Operaciones/generales/ServiciosRutas';
import { ServiceGenerico } from 'src/app/services/service-generico.service';
import { DescargarPlantillaComponent } from '../../shared/descargar-plantilla/descargar-plantilla';
import { Subscription } from 'rxjs';
import { TabService } from '../modulo-declaratoria-procedencia/services/tab.service';

@Component({
  selector: 'app-modulo-tramite',
  templateUrl: './modulo-tramite.component.html',
  styleUrls: ['./modulo-tramite.component.css'],
  providers: [ServiceGenerico],
})
export class ModuloTramiteComponent extends DescargarPlantillaComponent implements OnInit {
  idUsuario: number;
  private modelo_configuracion: ServiciosRutas;
  public permisoPersona: PermisoPersonaResponse = new PermisoPersonaResponse();
  public registro: boolean;
  public consultaR: boolean;


  constructor(
    private services: ServiceGenerico,
    private router: Router) {
    super();
    this.modelo_configuracion = new ServiciosRutas();
  }

  async ngOnInit() {
    this.idUsuario = AuthIdentity.ObtenerUsuarioRegistro();
    await this.getPermisoPersona();
    localStorage.setItem("solicitudregistroconsulta", "0");
    localStorage.setItem("ultimoPasoLlenado", "0");
  }

  /*public downloadPdf() {
    var url = location.origin+'/assets/doc/triptico7.pdf'
    FileSaver.saveAs(url, "triptico7.pdf");
  }
  public downloadPdf1() {
      var url = location.origin+'/assets/doc/escritodeapoyoparasolicitudderegistro.pdf'
    FileSaver.saveAs(url, "escritodeapoyoparasolicitudderegistro.pdf");
  }*/


  async getPermisoPersona() {
    await this.services.getAsync(this.modelo_configuracion.serviciosOperaciones + "/ConsultaPermisoPersona/Get?id_usuario=" + this.idUsuario + "&id_tramite=0")
      .then((tempdate) => {
        if (tempdate) {
          this.permisoPersona = tempdate.response as PermisoPersonaResponse;
          this.registro = this.permisoPersona[0].bndRegistro;
          this.consultaR = this.permisoPersona[0].bndConsultaR;
        } else {
          this.registro = true;
          this.consultaR = false;
        }
      });
  }

  public async irA(ruta: string, ultimoPasoLlenado: any) {
    localStorage.setItem("ultimoPasoLlenado", String(ultimoPasoLlenado))
    localStorage.setItem("id_tramite", String(0))
    this.router.navigate([ruta]);
  }


}
