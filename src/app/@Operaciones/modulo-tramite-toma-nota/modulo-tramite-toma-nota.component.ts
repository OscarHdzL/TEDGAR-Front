import {Component, OnInit} from '@angular/core';
import * as FileSaver from 'file-saver';
import { AuthIdentity } from 'src/app/guards/AuthIdentity';
import { PermisoPersonaResponse } from 'src/app/model/Catalogos/PermisosPersona';
import { ServiciosRutas } from 'src/app/model/Operaciones/generales/ServiciosRutas';
import { ServiceGenerico } from 'src/app/services/service-generico.service';
import {DescargarPlantillaComponent} from '../../shared/descargar-plantilla/descargar-plantilla';

@Component({
    selector: 'app-modulo-tramite-toma-nota',
    templateUrl: './modulo-tramite-toma-nota.component.html',
    styleUrls: ['./modulo-tramite-toma-nota.component.css'],
    providers: [ServiceGenerico],
  })
/** modulo-tramite-toma-nota component*/
export class ModuloTramiteTomaNotaComponent extends DescargarPlantillaComponent implements OnInit {
    /** modulo-tramite-toma-nota ctor */
    idUsuario: number;
    private modelo_configuracion: ServiciosRutas;
    public permisoPersona: PermisoPersonaResponse = new PermisoPersonaResponse();
    public tomaNota: boolean;
    public consultaTM: boolean;

    constructor(private services: ServiceGenerico) {
      super();
      this.modelo_configuracion = new ServiciosRutas();
    }

    ngOnInit(): void {
      this.idUsuario = AuthIdentity.ObtenerUsuarioRegistro();
      this.getPermisoPersona();
    }

    /*public downloadPdf() {
        var url = location.origin+'/assets/doc/triptico9.pdf'
        FileSaver.saveAs(url, "triptico9.pdf");
      }
      public downloadPdf1() {
          var url = location.origin+'/assets/doc/escritodeapoyoparasolicitudderegistro.pdf'
        FileSaver.saveAs(url, "escritodeapoyoparasolicitudderegistro.pdf");
      }*/

      getPermisoPersona() {
        this.services.HttpGet(this.modelo_configuracion.serviciosOperaciones + "/ConsultaPermisoPersona/Get?id_usuario=" + this.idUsuario + "&id_tramite=1")
          .subscribe((tempdate) => {
              if (tempdate) {
                this.permisoPersona = tempdate.response as PermisoPersonaResponse;

                this.tomaNota = this.permisoPersona[0].bndTomaNota;
                this.consultaTM = this.permisoPersona[0].bndConsultaTN;
              } else {
                this.tomaNota = true;
                this.consultaTM = false;
              }
            });
      }

}
