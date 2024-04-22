import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient, HttpEvent, HttpHeaders } from "@angular/common/http";
import { Observable, Subject, throwError } from "rxjs";
import { map, catchError } from "rxjs/operators";
import { TabService } from './tab.service';

@Injectable()

export class WebRestService {

  constructor(public http: HttpClient,
    public tabService: TabService) { }

  HttpGet(servicio: string): Observable<any> {
    return this.http.get<any>(servicio, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
        , 'Cache-Control': 'no-cache'
        , 'Access-Control-Allow-Headers': '*'
        , 'Access-Control-Allow-Methods': '*'
        , 'Access-Control-Allow-Origin': '*'
        , 'Access-Control-Allow-Credentials': 'true'
        ,'Authorization': 'Bearer ' + localStorage.getItem('jwt')
      }),
    })
      .pipe(
        map((resultado) => {
          return resultado;
        })
      );
  }

  HttpPost(modelo: any, servicio: string): Observable<any> {
    return this.http
      .post<any>(servicio, modelo, {
        headers: new HttpHeaders({
          "Content-Type": "application/json"
          , 'Cache-Control': 'no-cache'
          , 'Access-Control-Allow-Headers': '*'
          , 'Access-Control-Allow-Methods': '*'
          , 'Access-Control-Allow-Origin': '*'
          , 'Access-Control-Allow-Credentials': 'true'
          ,'Authorization': 'Bearer ' + localStorage.getItem('jwt')
        }),
      })
      .pipe(
        map((resultado) => {
          return resultado;
        })
      );
  }

  public getAsync(url: string): Promise<any> {
    this.tabService.cambiarCargando(true);
    return new Promise((resolve, reject) => {
      this.HttpGet(url).subscribe(
        response => {
          this.tabService.cambiarCargando(false);
          resolve(response);
        }, err => {
          this.tabService.cambiarCargando(false);
          resolve(null);
        }
      );
    });
  }

  public postAsync(modelo: any, url: string): Promise<any> {
    this.tabService.cambiarCargando(true);
    return new Promise((resolve, reject) => {
      this.HttpPost(modelo, url).subscribe(
        response => {
          this.tabService.cambiarCargando(false);
          resolve(response);
        }, err => {
          this.tabService.cambiarCargando(false);
          resolve(null);
        }
      );
    });
  }
}