import {Component, OnDestroy, OnInit} from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import {AppInjectorService} from '../../@Operaciones/modulo-declaratoria-procedencia/services/app-injector.service';
import {ServiceGenerico} from '../../services/service-generico.service';
import {ServiciosRutas} from '../../model/Operaciones/generales/ServiciosRutas';

@Component({
  selector: 'app-descargar-plantilla',
  template: ''
})

export class DescargarPlantillaComponent implements OnDestroy {

  protected servicioGenerico: ServiceGenerico;
  protected servicioRutas: ServiciosRutas;
  public nombrePlantilla: string = '';
  constructor() {
    const injector = AppInjectorService.getInjector();
    this.servicioGenerico = injector.get(ServiceGenerico);
    this.servicioRutas = injector.get(ServiciosRutas);
  }

  async downloadPdf(id_archivo: number) {
    this.obteneNombrePlantilla(id_archivo);
    await this.servicioGenerico.getAsync(this.servicioRutas.serviciosOperaciones + '/ConsultaArchivo/GetPlantilla?p_id_archivo=' + id_archivo)
      .then((tempdate) => {
        if (tempdate.response != null) {
          this.saveBase64AsFile(tempdate.response[0].base64, tempdate.response[0].extension);
        } else {
          // console.log('Ocurrió un error');
        }
      });
  }
  saveBase64AsFile(base64Data: string, ext: string) {
    const blob = this.base64ToBlob(base64Data, 'application/pdf'); // Cambia 'application/pdf' según el tipo de archivo
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download =  this.nombrePlantilla + ext; // Nombre del archivo
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
  base64ToBlob(base64Data: string, contentType: string): Blob {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  }

  obteneNombrePlantilla(id_archivo) {
    switch (id_archivo) {
      case 1:
        this.nombrePlantilla = 'Imprima esta informacion Registro.';
        break;
      case 2:
        this.nombrePlantilla = 'Escrito Libre Registro.';
        break;
      case 3:
        this.nombrePlantilla = 'Imprima esta informacion Toma de Nota.';
        break;
      case 4:
        this.nombrePlantilla = 'Escrito Libre Toma de Nota.';
        break;
      case 5:
        this.nombrePlantilla = 'Imprima esta informacion Transmisiones.';
        break;
      case 6:
        this.nombrePlantilla = 'Escrito Libre Transmisiones.';
        break;
      case 7:
        this.nombrePlantilla = 'Imprima esta informacion Declaratoria de Procedencia.';
        break;
      case 8:
        this.nombrePlantilla = 'Escrito Libre Declaratoria de Procedencia.';
        break;
      case 9:
        this.nombrePlantilla = 'Oficio Transmisiones.';
        break;
      case 10:
        this.nombrePlantilla = 'Escrito Libre Declaratoria de Procedencia.';
        break;
    }
  }


  ngOnDestroy(): void {
  }


}
