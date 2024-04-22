import {Injectable} from '@angular/core';
import { DataTablesModule } from 'angular-datatables';
import {TranslateService} from '@ngx-translate/core';
@Injectable()
export class ThemeConstants {

  private colorConfig: any;
  public idioma_seleccionado = localStorage.getItem("idioma");
  dtOptions: DataTables.Settings = {};

  constructor(private translate: TranslateService) {
    this.colorConfig = {
      colors: {
        primary: '#7774e7',
        info: '#0f9aee',
        success: '#37c936',
        warning: '#ffcc00',
        danger: '#ff3c7e',
        primaryInverse: 'rgba(119, 116, 231, 0.1)',
        infoInverse: 'rgba(15, 154, 238, 0.1)',
        successInverse: 'rgba(55, 201, 54, 0.1)',
        warningInverse: 'rgba(255, 204, 0, 0.1)',
        dangerInverse: 'rgba(255, 60, 126, 0.1)',
        gray: '#ebeef6',
        white: '#ffffff',
        dark: '#515365',
      }
    };

    if(this.idioma_seleccionado == "es"){
      this.dtOptions = {
        pagingType: 'full_numbers',
        autoWidth: false,
        language: {
          processing: 'Procesando...',
          lengthMenu: 'Mostrar _MENU_ registros',
          zeroRecords: 'No se encontraron resultados',
          emptyTable: 'Ningún dato disponible',
          info: 'Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros',
          infoEmpty: 'Mostrando registros del 0 al 0 de un total de 0 registros',
          infoFiltered: '(filtrado de un total de _MAX_ registros)',
          infoPostFix: '',
          search: 'Buscar:',
          url: '',
          thousands: ',',
          loadingRecords: 'Cargando...',
          paginate: {
            first: 'Primero',
            last: 'Último',
            next: 'Siguiente',
            previous: 'Anterior'
          },
          aria: {
            sortAscending: ': Activar para ordenar la columna de manera ascendente',
            sortDescending: ': Activar para ordenar la columna de manera descendente'
          }
        }
      };
    }else if(this.idioma_seleccionado == "en"){
      this.dtOptions = {
        pagingType: 'full_numbers',
        autoWidth: false,
        language: {
          lengthMenu:     "Show _MENU_ entries",
          loadingRecords: "Loading...",
          processing:     "Processing...",
          search:         "Search:",
          zeroRecords:    "No matching records found",
          emptyTable:     "No data available in table",
          info: 'Showing records from _START_ to the _END_ out of a total of _TOTAL_ records',
          infoEmpty: 'Showing records from 0 to the 0 out of a total of 0 records',
          infoFiltered: '(filtered from a total of _MAX_ records)',
          paginate: {
              first:      "First",
              last:       "Last",
              next:       "Next",
              previous:   "Previous"
          },
          aria: {
              sortAscending:  ": activate to sort column ascending",
              sortDescending: ": activate to sort column descending"
          }
        }
      };    
    }else{
      this.dtOptions = {
        pagingType: 'full_numbers',
        autoWidth: false,
        language: {
          processing: 'Procesando...',
          lengthMenu: 'Mostrar _MENU_ registros',
          zeroRecords: 'No se encontraron resultados',
          emptyTable: 'Ningún dato disponible',
          info: 'Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros',
          infoEmpty: 'Mostrando registros del 0 al 0 de un total de 0 registros',
          infoFiltered: '(filtrado de un total de _MAX_ registros)',
          infoPostFix: '',
          search: 'Buscar:',
          url: '',
          thousands: ',',
          loadingRecords: 'Cargando...',
          paginate: {
            first: 'Primero',
            last: 'Último',
            next: 'Siguiente',
            previous: 'Anterior'
          },
          aria: {
            sortAscending: ': Activar para ordenar la columna de manera ascendente',
            sortDescending: ': Activar para ordenar la columna de manera descendente'
          }
        }
      };     
    }

  }

  get() {
    return this.colorConfig;
  }
}
