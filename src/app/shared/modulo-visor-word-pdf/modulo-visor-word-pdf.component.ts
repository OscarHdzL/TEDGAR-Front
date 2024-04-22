import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, AfterViewInit, ViewEncapsulation } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: "app-modulo-visor-pdf",
  templateUrl: "./modulo-visor-word-pdf.component.html",
  styleUrls: ["./modulo-visor-word-pdf.component.css"],
  encapsulation: ViewEncapsulation.None
})
export class ModuloVisorWordPdfComponent implements OnInit {

    @Input() public datosDocumento: string = '';
  
    //#region Varibales Generales
    public htmlVistaPrevia: string = '';
    //#endregion

    constructor(public modalService: NgbActiveModal) {

    }

    public ngOnInit(): void {
        this.htmlVistaPrevia = this.datosDocumento;
    }

}
