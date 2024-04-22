import { Injectable, Injector } from '@angular/core';

/*@Injectable({
  providedIn: 'root',
})*/
export class AppInjectorService {
  private static injector: Injector;

  static setInjector(injector: Injector): void {
    AppInjectorService.injector = injector;
  }

  static getInjector(): Injector {
    return AppInjectorService.injector;
  }
}