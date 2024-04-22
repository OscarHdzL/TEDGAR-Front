import * as Mammoth from 'mammoth';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root',
})
export class ConversionService {

  convertWordToPdf(file: File): void {
    const reader = new FileReader();

    reader.onload = (event) => {
      const arrayBuffer = event.target?.result as ArrayBuffer;

      Mammoth.extractRawText({ arrayBuffer })
        .then((result) => {
          const pdfContent = this.convertToPdf(result.value);
          this.downloadPdf(pdfContent);
        })
        .catch((error) => {
          console.error('Error converting to PDF', error);
        });
    };

    reader.readAsArrayBuffer(file);
  }


  /*public async convertWordToPdfAsync(file: File): Promise<string> {

    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          Mammoth.convertToHtml({ arrayBuffer })
                .then((resultObject) => {
                var resultado = resultObject.value;
                resolve(resultado);
          });
      };

      reader.onerror = function(e: any) {
        reject(e);
      };

      reader.readAsArrayBuffer(file);
    });

  }*/

  public async convertWordToPdfAsync(file: File): Promise<string> {
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          Mammoth.convertToHtml({ arrayBuffer })
            .then((resultObject) => {
              var resultado = resultObject.value;
              resolve(resultado);
            })
            .catch((error) => {
              reject(error);
            });
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = function (e: any) {
        reject(e);
      };

      reader.onloadend = function () {
        // Release resources, if necessary
      };

      reader.readAsArrayBuffer(file);
    });
  }

  public  convertBase64ToFile(base64String: string): File {
    let documentTypeAvailable = new Map();
    documentTypeAvailable.set('word','application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    let bytes = this.base64ToArrayBuffer(base64String)
    let blob = new Blob([bytes], { type: documentTypeAvailable.get('word')});
    return new File([blob],"Temporal.docx",);
  }

  private base64ToArrayBuffer(base64: string) {
    var binaryString = atob(base64);
    var bytes = new Uint8Array(binaryString.length);
    for (var i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  private convertToPdf(rawText: string): any {
    // Implement logic to convert raw text to PDF using pdfMake
    // Example:
    const content = [{ text: rawText }];
    return pdfMake.createPdf({ content });
  }

  private downloadPdf(pdfContent: any): void {
    pdfContent.download();
  }
}
