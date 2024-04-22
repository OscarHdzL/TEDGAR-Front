import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ModuloUsuarioSistemaComponent } from './modulo-usuario-sistema.component';
import { FormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { NgbModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeConstants } from '../../@espire/shared/config/theme-constant';
import { ServiceGenerico } from '../../services/service-generico.service';
import { ModuloUsuarioSistemaPerfilRegistroComponent } from './modulo-usuario-sistema-perfil-registro/modulo-usuario-sistema-perfil-registro.component';
import { ModuloUsuarioSistemaPerfilActualizaComponent } from './modulo-usuario-sistema-perfil-actualiza/modulo-usuario-sistema-perfil-actualiza.component';



const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: ModuloUsuarioSistemaComponent,
        // canActivate: [DoNotShowSecondaryOnRefreshGuard]
      }
    ]
  }
];

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    DataTablesModule,
    NgbPopoverModule,
    NgbModule,
    TranslateModule
  ],
  providers: [
    ThemeConstants,
    ServiceGenerico,
    // DoNotShowSecondaryOnRefreshGuard
  ]
})
export class AdminModuloUsuariosSistemaModule {
}
