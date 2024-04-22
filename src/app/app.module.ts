import { Injector, NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HttpClientModule, HttpClient } from "@angular/common/http";
import { ReactiveFormsModule } from "@angular/forms";
import { AppRoutingModule } from "./app.routing";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { CommonModule } from "@angular/common";

import { JwtModule } from "@auth0/angular-jwt";
import { AuthGuard } from "../app/guards/AuthGuard";

import { DataTablesModule } from "angular-datatables";
import { AppComponent } from "./app.component";
import { NavMenuComponent } from "./shared/nav-menu/nav-menu.component";
import { HomeComponent } from "./home/home.component";

import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";

/* Pipe */
import { PipesModule } from './Pipe/pipe.module';

//import { NgbModal,NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { UserIdleModule } from "angular-user-idle";

import { ModuloAutenticacionComponent } from "./@Operaciones/modulo-autenticacion/modulo-autenticacion.component";
import { ModuloUsuarioSistemaRegistroComponent } from "./@Operaciones/modulo-usuario-registro/modulo-usuario-registro.component";
import { ModuloConsultaCorreoComponent } from "./@Operaciones/modulo-consulta-correo/modulo-consulta-correo.component";
import { ModuloCorreoConfirmacionComponent } from "./@Operaciones/modulo-correo-confirmacion/modulo-correo-confirmacion.component";
import { ModuloCambioContrasenaComponent } from "./@Operaciones/modulo-cambio-contrasena/modulo-cambio-contrasena.component";
// import { ModuloAvisoPrivacidadComponent } from './@Operaciones/modulo-aviso-privacidad/modulo-aviso-privacidad.component';
import { CounterComponent } from "./counter/counter.component";
import { FetchDataComponent } from "./fetch-data/fetch-data.component";
import { ThemeConstants } from "./@espire/shared/config/theme-constant";
import { PdfViewerModule } from "ng2-pdf-viewer";
import { AuthService } from "./services/auth.service";
import { ModuloListCatalogosJuridicaComponent } from "./@Operaciones/modulo-gestion-catalogos/modulo-list-catalogos-sjuridica/modulo-list-catalogos-sjuridica.component";
import { ModuloFormularioCreacionSjuridicaComponent } from "./@Operaciones/modulo-gestion-catalogos/modulo-formulario-creacion-sjuridica/modulo-formulario-creacion-sjuridica.component";
import { ModuloFormularioEdicionSjuridicaComponent } from "./@Operaciones/modulo-gestion-catalogos/modulo-formulario-edicion-sjuridica/modulo-formulario-edicion-sjuridica.component";
import { ModuloFormularioCreacionAvisoAperturaComponent } from "./@Operaciones/modulo-gestion-catalogos-aviso-apertura/modulo-formulario-creacion-aviso-apertura/modulo-formulario-creacion-aviso-apertura.component";
import { ModuloFormularioEdicionAvisoAperturaComponent } from "./@Operaciones/modulo-gestion-catalogos-aviso-apertura/modulo-formulario-edicion-aviso-apertura/modulo-formulario-edicion-aviso-apertura.component";
import { ModuloListCatalogosAvisoAperturaComponent } from "./@Operaciones/modulo-gestion-catalogos-aviso-apertura/modulo-list-catalogos-aviso-apertura/modulo-list-catalogos-aviso-apertura.component";
import { ModuloFormularioCreacionConstanciaNotarioComponent } from "./@Operaciones/modulo-gestion-catalogos-const-not/modulo-formulario-creacion-const-not/modulo-form-creacion-const-not.component";
import { ModuloFormularioEdicionConstanciaNotarioComponent } from "./@Operaciones/modulo-gestion-catalogos-const-not/modulo-formulario-edicion-const-not/modulo-form-edicion-const-not.component";
import { ModuloListConstanciaNotarioComponent } from "./@Operaciones/modulo-gestion-catalogos-const-not/modulo-list-const-not/modulo-list-constancia-notario.component";
import { ModuloUsuarioSistemaComponent } from "./@Operaciones/modulo-usuario-sistema/modulo-usuario-sistema.component";
import { ModuloSpinerLoginComponent } from "./shared/modulo-spiner-login/modulo-spiner-login.component";
import { ModuloMensajesComponent } from "./shared/modulo-mensajes/modulo-mensajes.component";
import { ModuloFormularioCreacionColoniaComponent } from "./@Operaciones/modulo-gestion-catalgos-colonia/modulo-formulario-creacion-colonia/modulo-formulario-creacion-colonia.component";
import { ModuloFormularioEdicionColoniaComponent } from "./@Operaciones/modulo-gestion-catalgos-colonia/modulo-formulario-edicion-colonia/modulo-formulario-edicion-colonia.component";
import { ModuloListColoniaComponent } from "./@Operaciones/modulo-gestion-catalgos-colonia/modulo-list-colonia/modulo-list-colonia.component";
import { ModuloTramiteComponent } from "./@Operaciones/modulo-tramite/modulo-tramite.component";
import { ModuloSolicitudPrimerPasoComponent } from "./@Operaciones/modulo-tramite/modulo-solicitud-primer-paso/modulo-solicitud-primer-paso.component";
import { ModuloSolicitudCuartoPasoComponent } from "./@Operaciones/modulo-tramite/modulo-solicitud-cuarto-paso/modulo-solicitud-cuarto-paso.component";
import { ModuloSolicitudSegundoPasoComponent } from "./@Operaciones/modulo-tramite/modulo-solicitud-segundo-paso/modulo-solicitud-segundo-paso.component";
import { ModuloSolicitudTercerPasoComponent } from "./@Operaciones/modulo-tramite/modulo-solicitud-tercer-paso/modulo-solicitud-tercer-paso.component";
import { ModuloSolicitudQuintoPasoComponent } from "./@Operaciones/modulo-tramite/modulo-solicitud-quinto-paso/modulo-solicitud-quinto-paso.component";
import { ModuloPaginacionComponent } from "./shared/modulo-paginacion/modulo-paginacion.component";
import { ModuloAutocompleteCPComponent } from "./@Operaciones/modulo-tramite/modulo-autocomplete-cp/modulo-autocomplete-cp.component";
import { ModuloFormularioDomicilioComponent } from "./@Operaciones/modulo-tramite/modulo-formulario-domicilio/modulo-formulario-domicilio.component";
import { ModuloReporteRegistroComponent } from './@Operaciones/modulo-reporte-registro/modulo-reporte-registro.component';
import { ModuloListCatalogoCredoComponent } from './@Operaciones/modulo-gestion-catalogos-credo/modulo-list-catalogo-credo/modulo-list-catalogo-credo.component';
import { ModuloFormularioCreacionCredoComponent } from "./@Operaciones/modulo-gestion-catalogos-credo/modulo-formulario-creacion-credo/modulo-formulario-creacion-credo.component";
import { ModuloFormularioEdicionCredoComponent } from './@Operaciones/modulo-gestion-catalogos-credo/modulo-formulario-edicion-credo/modulo-formulario-edicion-credo.component';
import { ModuloSolicitudSextoPasoComponent } from "./@Operaciones/modulo-tramite/modulo-solicitud-sexto-paso/modulo-solicitud-sexto-paso.component";
import { ModuloCargaArchivoComponent } from "./shared/modulo-carga-archivo/modulo-carga-archivo.component";
import { ModuloVisorPdfComponent } from "./shared/modulo-visor-pdf/modulo-visor-pdf.component";
import { ModuloFormularioRepresentanteComponent } from "./@Operaciones/modulo-tramite/modulo-formulario-representante/modulo-formulario-representante.component";
import { ModuloTramiteTomaNotaComponent } from './@Operaciones/modulo-tramite-toma-nota/modulo-tramite-toma-nota.component';
import { ModuloSolicitudTomaNotaComponent } from './@Operaciones/modulo-tramite-toma-nota/modulo-solicitud-toma-nota/modulo-solicitud-toma-nota.component';
import { ModuloSolicitudMovimientosEstatutosComponent } from './@Operaciones/modulo-tramite-toma-nota/modulo-solicitud-movimientos-estatutos/modulo-solicitud-movimientos-estatutos.component';
import { ModuloSolicitudMovimientosDenominacionComponent } from './@Operaciones/modulo-tramite-toma-nota/modulo-solicitud-movimientos-denominacion/modulo-solicitud-movimientos-denominacion.component';
import { ModuloSolicitudMovimientosRelacionMiembrosComponent } from './@Operaciones/modulo-tramite-toma-nota/modulo-solicitud-movimientos-relacion-miembros/modulo-solicitud-movimientos-relacion-miembros.component';
import { ModuloSolicitudRepresentanteLegalComponent } from './@Operaciones/modulo-tramite-toma-nota/modulo-solicitud-representante-legal/modulo-solicitud-representante-legal.component';
import { ModuloSolicitudApoderadoLegalComponent } from './@Operaciones/modulo-tramite-toma-nota/modulo-solicitud-apoderado-legal/modulo-solicitud-apoderado-legal.component';
import { ModuloSolicitudDomicilioLegalComponent } from './@Operaciones/modulo-tramite-toma-nota/modulo-solicitud-domicilio-legal/modulo-solicitud-domicilio-legal.component';
import { ModuloSolicitudDomicilioNotificacionComponent } from './@Operaciones/modulo-tramite-toma-nota/modulo-solicitud-domicilio-notificacion/modulo-solicitud-domicilio-notificacion.component';
import { ModuloUsuarioSistemaPerfilRegistroComponent } from './@Operaciones/modulo-usuario-sistema/modulo-usuario-sistema-perfil-registro/modulo-usuario-sistema-perfil-registro.component';
import { ModuloUsuarioSistemaPerfilActualizaComponent } from './@Operaciones/modulo-usuario-sistema/modulo-usuario-sistema-perfil-actualiza/modulo-usuario-sistema-perfil-actualiza.component';
import { ModuloAsignacionRegistroComponent } from "./@Operaciones/modulo-asignacion-registro/modulo-asignacion-registro.component";
import { ModuloModalMensajeComponent } from "./shared/modulo-modal-mensaje/modulo-modal-mensaje.component";
import { ModuloListCatalogoPaisoComponent } from './@Operaciones/modulo-gestion-catalogos-paiso/modulo-list-catalogo-paiso/modulo-list-catalogo-paiso.component';
import { ModuloFormularioCreacionPaisoComponent } from './@Operaciones/modulo-gestion-catalogos-paiso/modulo-formulario-creacion-paiso/modulo-formulario-creacion-paiso.component';
import { ModuloFormularioEdicionPaisoComponent } from './@Operaciones/modulo-gestion-catalogos-paiso/modulo-formulario-edicion-paiso/modulo-formulario-edicion-paiso.component';
import { ModuloAtenderRegistrosComponent } from "./@Operaciones/modulo-atender-registros/modulo-atender-registros.component";
import { ModuloCotejoDocumentacionComponent } from "./@Operaciones/modulo-tramite/modulo-cotejo-documentacion/modulo-cotejo-documentacion.component";
import { ModuloCotejoDocumentacionFisicaComponent } from "./@Operaciones/modulo-tramite/modulo-cotejo-documentacion-fisica/modulo-cotejo-documentacion-fisica.component";
import { ModuloFinalizacionCotejoComponent } from "./@Operaciones/modulo-tramite/modulo-finalizacion-cotejo/modulo-finalizacion-cotejo.component";
import { ModuloCotejoConcluidoComponent } from "./@Operaciones/modulo-tramite/modulo-cotejo-concluido/modulo-cotejo-concluido.component";
import { ModuloConsultaTramiteComponent } from "./@Operaciones/modulo-tramite/modulo-consulta-tramite/modulo-consulta-tramite.component";
import { ModuloAsignacionTomaNotaComponent } from './@Operaciones/modulo-asignacion-toma-nota/modulo-asignacion-toma-nota.component';
import { ModuloAtenderTomaNotaComponent } from './@Operaciones/modulo-atender-toma-nota/modulo-atender-toma-nota.component';
import { ModuloInicioComponent } from "./@Operaciones/modulo-inicio/modulo-inicio.component";
import { ModuloAtencionTomaNotaComponent } from "./@Operaciones/modulo-tramite-toma-nota/modulo-atencion-toma-nota/modulo-atencion-toma-nota.component";
import { ModuloConsultaTomaNotaComponent } from "./@Operaciones/modulo-tramite-toma-nota/modulo-consulta-toma-nota/modulo-consulta-toma-nota.component";
import { ModuloTransmisionesComponent } from "./@Operaciones/modulo-transmisiones/modulo-transmisiones.component";
import { ModuloSolicitudTransmisionComponent } from "./@Operaciones/modulo-transmisiones/modulo-solicitud-transmision/modulo-solicitud-transmision.component";
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ModuloCargaArchivoMultipleComponent } from "./shared/modulo-carga-archivo-multiple/modulo-carga-archivo-multiple.component";
import { ModuloAnexosComponent } from "./@Operaciones/modulo-anexos/modulo-anexos.component";
import { ModuloAsignacionTransmisionesComponent } from "./@Operaciones/modulo-transmisiones/modulo-asignacion-transmisiones/modulo-asignacion-transmisiones.component";
import { ModuloAtencionTransmisionesComponent } from "./@Operaciones/modulo-transmisiones/modulo-atencion-transmisiones/modulo-atencion-transmisiones.component";
import { ModuloListCatalogoDirectorComponent } from './@Operaciones/modulo-gestion-catalogos-director/modulo-list-catalogo-director/modulo-list-catalogo-director.component';
import { ModuloFormularioCreacionDirectorComponent } from './@Operaciones/modulo-gestion-catalogos-director/modulo-formulario-creacion-director/modulo-formulario-creacion-director.component';
import { ModuloFormularioEdicionDirectorComponent } from './@Operaciones/modulo-gestion-catalogos-director/modulo-formulario-edicion-director/modulo-formulario-edicion-director.component';
import { ModuloFormularioCreacionEmisoraComponent } from './@Operaciones/modulo-gestion-catalogos-emisoras/modulo-formulario-creacion-emisora/modulo-formulario-creacion-emisora.component';
import { ModuloFormularioEdicionEmisoraComponent } from './@Operaciones/modulo-gestion-catalogos-emisoras/modulo-formulario-edicion-emisora/modulo-formulario-edicion-emisora.component';
import { ModuloListCatalogoEmisoraComponent } from './@Operaciones/modulo-gestion-catalogos-emisoras/modulo-list-catalogo-emisora/modulo-list-catalogo-emisora.component';
import { ModuloReporteTransmisionesComponent } from './@Operaciones/modulo-reporte-transmisiones/modulo-reporte-transmisiones.component';
import { ModuloConsultaTransmisionPublicoComponent } from "./@Operaciones/modulo-transmisiones/modulo-consulta-transmision/modulo-consulta-transmision-publico.component";
import { ModuloConsultaTransmisionComponent } from "./@Operaciones/modulo-transmisiones/modulo-consulta-transmisiones/modulo-consulta-transmision.component";
import { ModuloRegistrosTramiteComponent } from "./@Operaciones/modulo-registros-tramite/modulo-registros-tramite.component";
import { ModuloRegistrosTomaNotaComponent } from "./@Operaciones/modulo-registros-toma-nota/modulo-registros-toma-nota.component";
import { ModuloRegistrosTransmisionComponent } from "./@Operaciones/modulo-registros-transmision/modulo-registros-transmision.component";
import { ModuloGestionCatalogoPlantillaTransmisionComponent } from "./@Operaciones/modulo-gestion-catalogo-plantilla-transmision/modulo-gestion-catalogo-plantilla-transmision.component";
import { ModuloRegistrosTramiteDictaminadorComponent } from "./@Operaciones/modulo-registros-tramite-dictaminador/modulo-registros-tramite-dictaminador.component";
import { ModuloRegistrosTomaNotaDictaminadorComponent } from "./@Operaciones/modulo-registros-toma-nota-dictaminador/modulo-registros-toma-nota-dictaminador.component";
import { ModuloRegistrosTransmisionDictaminadorComponent } from "./@Operaciones/modulo-registros-transmision-dictaminador/modulo-registros-transmision-dictaminador.component";
import { ModuloFormularioRegistroComponent } from "./@Operaciones/modulo-declaratoria-procedencia/solicitud-declaratoria-procedencia/modulo-formulario-registro/modulo-formulario-registro.component";
import { ModuloFormularioRegistroPasoUnoComponent } from "./@Operaciones/modulo-declaratoria-procedencia/solicitud-declaratoria-procedencia/modulo-formulario-registro-paso-uno/modulo-formulario-registro-paso-uno.component";
import { ModuloFormularioRegistroPasoDosComponent } from "./@Operaciones/modulo-declaratoria-procedencia/solicitud-declaratoria-procedencia/modulo-formulario-registro-paso-dos/modulo-formulario-registro-paso-dos.component";
import { TabService } from "./@Operaciones/modulo-declaratoria-procedencia/services/tab.service";
import { WebRestService } from "./@Operaciones/modulo-declaratoria-procedencia/services/crud.rest.service";
import { DirectivesModule } from "./@Operaciones/modulo-declaratoria-procedencia/directives/directive.module";
import { ModuloFormularioRegistroPasoTresComponent } from "./@Operaciones/modulo-declaratoria-procedencia/solicitud-declaratoria-procedencia/modulo-formulario-registro-paso-tres/modulo-formulario-registro-paso-tres.component";
import { ModuloDeclaratoriaProcedenciaComponent } from "./@Operaciones/modulo-declaratoria-procedencia/solicitud-declaratoria-procedencia/modulo-declaratoria-procedencia.component";
import { ModuloSpinerDeclaratoriaComponent } from "./@Operaciones/modulo-declaratoria-procedencia/components/modulo-spiner-declaratoria/modulo-spiner-declaratoria.component";
import { ModuloFormularioRegistroPasoCuatroComponent } from "./@Operaciones/modulo-declaratoria-procedencia/solicitud-declaratoria-procedencia/modulo-formulario-registro-paso-cuatro/modulo-formulario-registro-paso-cuatro.component";
import { AppInjectorService } from "./@Operaciones/modulo-declaratoria-procedencia/services/app-injector.service";
import { ModuloVistaPrincipalComponent } from "./@Operaciones/modulo-declaratoria-procedencia/modulo-vista-principal/modulo-vista-principal.component";
import { ModuloFormularioRegistroPasoCincoComponent } from "./@Operaciones/modulo-declaratoria-procedencia/solicitud-declaratoria-procedencia/modulo-formulario-registro-paso-cinco/modulo-formulario-registro-paso-cinco.component";
import { ModuloComentariosComponent } from "./@Operaciones/modulo-declaratoria-procedencia/components/modulo-comentarios/modulo-comentarios.component";
import { ModuloNuevoReporteComponent } from "./@Operaciones/modulo-declaratoria-procedencia/modulo-reporte/modulo-reporte.component";
import { ModuloAdminPlantillasComponent } from "./@Operaciones/modulo-declaratoria-procedencia/modulo-administracion-plantillas/modulo-administracion-plantillas.component";
import {ServiceGenerico} from './services/service-generico.service';
import {ServiciosRutas} from './model/Operaciones/generales/ServiciosRutas';
import { RefactorModuloTramitesComponent } from './@Operaciones/refactor-modulo-tramites/refactor-modulo-tramites.component';
import { FileService } from "./services/file.service";
import { ModuloVisorWordPdfComponent } from "./shared/modulo-visor-word-pdf/modulo-visor-word-pdf.component";

export function newTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}

/* jwt getToken */
export function obtenerToken(): string {
  return localStorage.getItem("jwt");
}

@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    HomeComponent,
    CounterComponent,
    FetchDataComponent,
    ModuloAutenticacionComponent,
    ModuloUsuarioSistemaRegistroComponent,
    ModuloConsultaCorreoComponent,
    ModuloCorreoConfirmacionComponent,
    ModuloCambioContrasenaComponent,
    ModuloListCatalogosJuridicaComponent,
    ModuloListCatalogosAvisoAperturaComponent,
    ModuloFormularioCreacionSjuridicaComponent,
    ModuloFormularioEdicionSjuridicaComponent,
    ModuloFormularioCreacionAvisoAperturaComponent,
    ModuloFormularioEdicionAvisoAperturaComponent,
    ModuloListConstanciaNotarioComponent,
    ModuloListConstanciaNotarioComponent,
    ModuloFormularioCreacionConstanciaNotarioComponent,
    ModuloFormularioEdicionConstanciaNotarioComponent,
    ModuloUsuarioSistemaComponent,
    ModuloSpinerLoginComponent,
    ModuloMensajesComponent,
    ModuloFormularioCreacionColoniaComponent,
    ModuloFormularioEdicionColoniaComponent,
    ModuloListColoniaComponent,
    ModuloTramiteComponent,
    ModuloSolicitudPrimerPasoComponent,
    ModuloSolicitudSegundoPasoComponent,
    ModuloSolicitudTercerPasoComponent,
    ModuloSolicitudCuartoPasoComponent,
    ModuloSolicitudQuintoPasoComponent,
    ModuloSolicitudSextoPasoComponent,
    ModuloPaginacionComponent,
    ModuloAutocompleteCPComponent,
    ModuloFormularioDomicilioComponent,
    ModuloReporteRegistroComponent,
    ModuloListCatalogoCredoComponent,
    ModuloFormularioCreacionCredoComponent,
    ModuloFormularioEdicionCredoComponent,
    ModuloListCatalogoDirectorComponent,
    ModuloFormularioCreacionDirectorComponent,
    ModuloFormularioEdicionDirectorComponent,
    ModuloListCatalogoEmisoraComponent,
    ModuloFormularioCreacionEmisoraComponent,
    ModuloFormularioEdicionEmisoraComponent,
    ModuloCargaArchivoComponent,
    ModuloCargaArchivoMultipleComponent,
    ModuloVisorPdfComponent,
    ModuloFormularioRepresentanteComponent,
    ModuloTramiteTomaNotaComponent,
    ModuloSolicitudTomaNotaComponent,
    ModuloSolicitudMovimientosEstatutosComponent,
    ModuloSolicitudMovimientosDenominacionComponent,
    ModuloSolicitudMovimientosRelacionMiembrosComponent,
    ModuloSolicitudRepresentanteLegalComponent,
    ModuloSolicitudApoderadoLegalComponent,
    ModuloSolicitudDomicilioLegalComponent,
    ModuloSolicitudDomicilioNotificacionComponent,
    ModuloMensajesComponent,
    ModuloAsignacionRegistroComponent,
    ModuloModalMensajeComponent,
    ModuloUsuarioSistemaPerfilRegistroComponent,
    ModuloUsuarioSistemaPerfilActualizaComponent,
    ModuloListCatalogoPaisoComponent,
    ModuloFormularioCreacionPaisoComponent,
    ModuloFormularioEdicionPaisoComponent,
    ModuloAtenderRegistrosComponent,
    ModuloCotejoDocumentacionComponent,
    ModuloCotejoDocumentacionFisicaComponent,
    ModuloFinalizacionCotejoComponent,
    ModuloCotejoConcluidoComponent,
    ModuloConsultaTramiteComponent,
    ModuloAsignacionTomaNotaComponent,
    ModuloInicioComponent,
    ModuloAtenderTomaNotaComponent,
    ModuloAtencionTomaNotaComponent,
    ModuloConsultaTomaNotaComponent,
    ModuloTransmisionesComponent,
    ModuloAnexosComponent,
    ModuloSolicitudTransmisionComponent,
    ModuloAsignacionTransmisionesComponent,
    ModuloReporteTransmisionesComponent,
    ModuloAtencionTransmisionesComponent,
    ModuloConsultaTransmisionPublicoComponent,
    ModuloConsultaTransmisionComponent,
    ModuloRegistrosTramiteComponent,
    ModuloRegistrosTomaNotaComponent,
    ModuloRegistrosTransmisionComponent,
    ModuloRegistrosTomaNotaComponent,
    ModuloRegistrosTramiteDictaminadorComponent,
    ModuloRegistrosTomaNotaDictaminadorComponent,
    ModuloRegistrosTransmisionDictaminadorComponent,
    ModuloGestionCatalogoPlantillaTransmisionComponent,
    ModuloDeclaratoriaProcedenciaComponent,
    ModuloFormularioRegistroComponent,
    ModuloFormularioRegistroPasoUnoComponent,
    ModuloFormularioRegistroPasoDosComponent,
    ModuloFormularioRegistroPasoTresComponent,
    ModuloFormularioRegistroPasoCuatroComponent,
    ModuloFormularioRegistroPasoCincoComponent,
    ModuloComentariosComponent,
    ModuloNuevoReporteComponent,
    ModuloAdminPlantillasComponent,
    ModuloVistaPrincipalComponent,
    ModuloSpinerDeclaratoriaComponent,
    RefactorModuloTramitesComponent,
    ModuloVisorWordPdfComponent ],
  imports: [
    DirectivesModule,
    BrowserModule.withServerTransition({appId: 'ng-cli-universal'}),
    CommonModule,
    HttpClientModule,
    BrowserAnimationsModule,
    DataTablesModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    PdfViewerModule,
    UserIdleModule.forRoot({idle: 1800, timeout: 1}),
    AppRoutingModule,
    PipesModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: obtenerToken,
        //allowedDomains: ["localhost:5005"],
        //disallowedRoutes: ["localhost:5005"],
        //allowedDomains: ["10.2.15.40:5005"],
        //disallowedRoutes: ["10.2.15.40:5005"],
        //allowedDomains: ["apitramitesdgardev.segob.gob.mx"],
        //disallowedRoutes: ["https://apitramitesdgardev.segob.gob.mx/"],
        allowedDomains: ['apitramitesdgarqa.segob.gob.mx'],
        disallowedRoutes: ['https://apitramitesdgarqa.segob.gob.mx/']
        //allowedDomains: ["apitramitesdgar.segob.gob.mx"],
        // disallowedRoutes: ["https://apitramitesdgar.segob.gob.mx/"]
      },
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: newTranslateLoader,
        deps: [HttpClient],
      },
    }),
    NgMultiSelectDropDownModule.forRoot()
  ],
  entryComponents: [
    ModuloFormularioCreacionSjuridicaComponent,
    ModuloFormularioEdicionSjuridicaComponent,
    ModuloFormularioCreacionAvisoAperturaComponent,
    ModuloFormularioEdicionAvisoAperturaComponent,
    ModuloFormularioCreacionConstanciaNotarioComponent,
    ModuloFormularioEdicionConstanciaNotarioComponent,
    ModuloFormularioCreacionColoniaComponent,
    ModuloFormularioEdicionColoniaComponent,
    ModuloFormularioCreacionCredoComponent,
    ModuloFormularioEdicionCredoComponent,
    ModuloFormularioCreacionDirectorComponent,
    ModuloFormularioEdicionDirectorComponent,
    ModuloFormularioCreacionEmisoraComponent,
    ModuloFormularioEdicionEmisoraComponent,
    ModuloFormularioRepresentanteComponent,
    ModuloModalMensajeComponent,
    ModuloFormularioCreacionPaisoComponent,
    ModuloFormularioEdicionPaisoComponent,
    ModuloCargaArchivoComponent,
    ModuloCargaArchivoMultipleComponent,
    ModuloAnexosComponent
  ],
  providers: [AuthGuard, ThemeConstants, AuthService, TabService, WebRestService, ServiceGenerico, ServiciosRutas, FileService],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(private injector: Injector) {
    AppInjectorService.setInjector(this.injector);
  }
}
