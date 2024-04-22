import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient, HttpEvent, HttpHeaders } from "@angular/common/http";
import { Observable, Subject, throwError } from "rxjs";
import { map, catchError } from "rxjs/operators";

@Injectable()
export class ServiceGenerico {

  public updateObserver$: EventEmitter<string>;

  constructor(public http: HttpClient) {}

  HttpPost(modelo: any, servicio: string): Observable<any> {
    return this.http
      .post<any>(servicio, modelo, {
        headers: new HttpHeaders({
          "Content-Type": "application/json"
          ,'Cache-Control': 'no-cache'
          ,'Access-Control-Allow-Headers':'*'
          ,'Access-Control-Allow-Methods':'*'
          ,'Access-Control-Allow-Origin':'*'
          ,'Access-Control-Allow-Credentials':'true'
          ,'Authorization': 'Bearer ' + localStorage.getItem('jwt')
        }),
      })
      .pipe(
        map((resultado) => {
          return resultado;
        })
      );
  }

  HttpGet(servicio: string): Observable<any> {
    return this.http
      .get<any>(servicio, {
        headers: new HttpHeaders({
          "Content-Type": "application/json"
          ,'Cache-Control': 'no-cache'
          ,'Access-Control-Allow-Headers':'*'
          ,'Access-Control-Allow-Methods':'*'
          ,'Access-Control-Allow-Origin':'*'
          ,'Access-Control-Allow-Credentials':'true'
          ,'Authorization': 'Bearer ' + localStorage.getItem('jwt')
        }),
      })
      .pipe(
        map((resultado) => {
          return resultado;
        })
      );
  }

  HttpGetAsync(servicio: string): Observable<any> {
    return this.http.get(servicio, {
        headers: new HttpHeaders({
          "Content-Type": "application/json"
          ,'Cache-Control': 'no-cache'
          ,'Access-Control-Allow-Headers':'*'
          ,'Access-Control-Allow-Methods':'*'
          ,'Access-Control-Allow-Origin':'*'
          ,'Access-Control-Allow-Credentials':'true'
        }),
      });
  }

  HttpPut(modelo: any, servicio: string): Observable<any> {
    return this.http
      .put<any>(servicio, modelo, {
        headers: new HttpHeaders({
          "Content-Type": "application/json"
          ,'Cache-Control': 'no-cache'
          ,'Access-Control-Allow-Headers':'*'
          ,'Access-Control-Allow-Methods':'*'
          ,'Access-Control-Allow-Origin':'*'
          ,'Access-Control-Allow-Credentials':'true'
        }),
      })
      .pipe(
        map((resultado) => {
          return resultado;
        })
      );
  }

  HttpDelete(modelo: any, servicio: string): Observable<any> {
    return this.http
      .delete<any>(servicio, {
        headers: new HttpHeaders({
          "Content-Type": "application/json"
          ,'Cache-Control': 'no-cache'
          ,'Access-Control-Allow-Headers':'*'
          ,'Access-Control-Allow-Methods':'*'
          ,'Access-Control-Allow-Origin':'*'
          ,'Access-Control-Allow-Credentials':'true'
        }),
      })
      .pipe(
        map((resultado) => {
          return resultado;
        })
      );
  }

  HttpUploadFiles(servicio: string, formData: FormData): Observable<HttpEvent<any>> {
    return this.http.post(servicio, formData , {
      reportProgress: true,
      observe: 'events',
    });
  }

  HttpPostFile(modelo: any, servicio: string): Observable<any> {
    return this.http
      .post<any>(servicio, modelo, {
        headers: new HttpHeaders({
          'Access-Control-Allow-Headers':'*'
          ,'Access-Control-Allow-Methods':'*'
          ,'Access-Control-Allow-Origin':'*'
          ,'Access-Control-Allow-Credentials':'true'
          ,'Authorization': 'Bearer ' + localStorage.getItem('jwt')
        }),
      })
      .pipe(
        map((resultado) => {
          return resultado;
        })
      );

  }

  HttpGetFile(servicio: string): Observable<any> {
    return this.http.get(servicio, {
        headers: new HttpHeaders ({
          'Content-Type': 'application/json'
      , 'Access-Control-Allow-Headers': '*'
      , 'Access-Control-Allow-Methods': '*'
      , 'Access-Control-Allow-Origin': '*'
      , 'Access-Control-Allow-Credentials': 'true'
      , 'Authorization': 'Bearer ' + localStorage.getItem('jwt')
      }),
        responseType: 'blob'
      });
  }

  public getAsync(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.HttpGet(url).subscribe(
        response => {
          resolve(response);
        }, err => {
          reject(err);
        }
      );
    });
  }


  public postAsync(modelo: any, url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.HttpPost(modelo, url).subscribe(
        response => {
          resolve(response);
        }, err => {
          reject(err);
        }
      );
    });
  }

}
