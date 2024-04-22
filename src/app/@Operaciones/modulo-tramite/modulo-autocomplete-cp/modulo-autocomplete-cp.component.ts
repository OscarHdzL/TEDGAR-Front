import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ConsultaListCatalogoCPResponse } from 'src/app/model/Catalogos/CatalogoCP';
import { RespuestaGenerica } from 'src/app/model/Operaciones/generales/RespuestaGenerica';
import { ServiciosRutas } from 'src/app/model/Operaciones/generales/ServiciosRutas';
import { ServiceGenerico } from 'src/app/services/service-generico.service';

@Component({
  selector: 'app-modulo-autocomplete-cp',
  templateUrl: './modulo-autocomplete-cp.component.html',
  styleUrls: ['./modulo-autocomplete-cp.component.css'],
  providers:[ServiceGenerico]
})
export class ModuloAutocompleteCPComponent implements OnInit {
  @Input() entries: Array<any>[];
  @Input() entryProperty: string='c_cpostal_n';
  @Input() inputPlaceholder: string = "Buscar..."
  @Input() inputId: string | number = 0;
  @Output() onEntrySelected: EventEmitter<string> =
  new EventEmitter<string>();
  showResults: boolean = false;
  filteredEntities: any;
  @Input()
  filter: string;
  @Input()
  readOnly: boolean;
  operacionRespuesta: RespuestaGenerica;
  modelo_configuracion: ServiciosRutas;


  constructor(private services: ServiceGenerico,) {
    this.operacionRespuesta = new RespuestaGenerica();
    this.modelo_configuracion = new ServiciosRutas();
  }

  ngOnInit() {
    this.filteredEntities = this.entries;
  }

  filterEntries(filter: string) {
    if(filter.length <4) return;
    this.obtenerCP(filter)
  }
  obtenerCP( keyword:string) {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpGet(
        this.modelo_configuracion.serviciosCatalogos +
          "/ConsultaListaCatalogosCP/Get?keyword="+keyword
      )
      .subscribe(
        (tempdate) => {
          if (tempdate) {
          
            this.filteredEntities = [] =
              tempdate.response as Array<ConsultaListCatalogoCPResponse>[];
          } else {
            this.filteredEntities = [];
          }
          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.operacionRespuesta.EstaEjecutando = false;
        }
      );
  }


  inputFieldFocused() {
    let inputId = 'inputField' + this.inputId;
    let menuId = '#menu' + this.inputId + ' ' + 'a';
  
    document.getElementById(inputId).addEventListener('keydown', function (e) {
      if (e.key == "ArrowDown") {
        (document.querySelectorAll(menuId)[0] as any).focus();
      }
    });
  }

  selectEntry(entry) {
    if (typeof this.entryProperty != 'undefined') {
      this.filter = entry[this.entryProperty];
    } else {
      this.filter = entry;
    }
    this.showResults = false;
    this.onEntrySelected.emit(this.filter);
  }

}