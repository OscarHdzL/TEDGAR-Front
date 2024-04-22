import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'mesTransmicion'
})
export class MesTransmicionPipe implements PipeTransform {

    transform(mes: any, anio: string): string {

        let anioActual = new Date().getFullYear();

        if (anio === anioActual.toString())  {

            let mesActual = new Date().getMonth() + 1 
            
            if (  Number( mes.i_id) >= mesActual ) {
                return `${mes?.c_nombre} `;
            } else {
                return null;
            }
        }
        else {
            return `${mes?.c_nombre} `;
        }
    }

}
