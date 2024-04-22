import { Component, OnInit } from '@angular/core';
import { ServiciosRutas } from 'src/app/model/Operaciones/generales/ServiciosRutas';
import { ServiceGenerico } from 'src/app/services/service-generico.service';
import {DescargarPlantillaComponent} from '../../../shared/descargar-plantilla/descargar-plantilla';

@Component({
  selector: 'app-declaratoria-procedencia',
  templateUrl: './modulo-declaratoria-procedencia.component.html',
  styleUrls: ['./modulo-declaratoria-procedencia.component.css']
})
export class ModuloDeclaratoriaProcedenciaComponent extends DescargarPlantillaComponent implements OnInit {
  constructor() {
    super();
  }

  async ngOnInit() {
  }

  /*public downloadPdf() {
    var url = location.origin + '/assets/doc/triptico7.pdf';
    //FileSaver.saveAs(url, "triptico7.pdf");
  }
  public downloadPdf1() {
    var url = location.origin + '/assets/doc/escritodeapoyoparasolicitudderegistro.pdf'
    FileSaver.saveAs(url, "escritodeapoyoparasolicitudderegistro.pdf");
  }


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
  }*/

}
