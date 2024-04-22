import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

/* Pipetas (Converter)*/
import { MesTransmicionPipe } from './Transmision/frecuencia.mes.pipe';
/* Pipetas (Converter)*/

@NgModule({
    declarations: [
        MesTransmicionPipe
    ],
    exports: [
        MesTransmicionPipe
    ],
    imports: [
      CommonModule
    ]
  })
export class PipesModule { }