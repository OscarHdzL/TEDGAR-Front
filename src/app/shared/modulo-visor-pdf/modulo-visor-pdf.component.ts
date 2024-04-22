import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { PdfViewerModule } from "ng2-pdf-viewer";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: "app-modulo-visor-pdf",
  templateUrl: "./modulo-visor-pdf.component.html",
  styleUrls: ["./modulo-visor-pdf.component.css"]
})
export class ModuloVisorPdfComponent implements OnInit {

  @Input() src: string;
  @Input() esWord: boolean = false;


  public base64src: SafeResourceUrl;

  constructor(public modalService: NgbActiveModal, private sanitizer: DomSanitizer) {

  }

  async ngOnInit() {
    if (!this.esWord) {
      this.base64src = this._base64ToArrayBuffer(this.src);
    } 

  }

  downloadFile(base64: any, fileName: any) {
    const src = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${base64}`;
    const link = document.createElement("a")
    link.href = src
    link.download = fileName
    link.click()

    link.remove()
  }

  _base64ToArrayBuffer(base64) {
    var binary_string = base64.replace(/\\n/g, '');
    binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  }

  downloadPDF() {
    if(this.esWord){
      this.downloadFile(this.src, "documento")
      return;
    }
    
    const linkSource = `data:application/pdf;base64,${this.src}`;
    const downloadLink = document.createElement("a");
    const fileName = "documento.pdf";

    downloadLink.href = linkSource;
    downloadLink.download = fileName;
    downloadLink.click();
  }
}
