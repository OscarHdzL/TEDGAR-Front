import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { ServiceGenerico } from 'src/app/services/service-generico.service';
import { ThemeConstants } from '../../@espire/shared/config/theme-constant';
import { RespuestaGenerica } from '../../model/Operaciones/generales/RespuestaGenerica';
import { ServiciosRutas } from '../../model/Operaciones/generales/ServiciosRutas';
import { BorraUsuarioSistemaResponse, ConsultaListaUsuariosSistemaResponse } from '../../model/UsuarioSistema';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TemplateRef } from '@angular/core';

@Component({
  selector: 'app-modulo-usuario-sistema',
  templateUrl: './modulo-usuario-sistema.component.html',
  styleUrls: ['./modulo-usuario-sistema.component.css'],
  providers: [ServiceGenerico]
})
/** modulo-usuario-sistema component*/
export class ModuloUsuarioSistemaComponent {
  @ViewChild("contentActivar", { static: false }) ModalActivar: TemplateRef<any>;
  @ViewChild("contentDesactivar", { static: false }) ModalDesactivar: TemplateRef<any>;
  @ViewChild("contentEliminar", { static: false }) ModalEliminar: TemplateRef<any>;
  @ViewChild("contentEXito", { static: false }) ModalExito: TemplateRef<any>;

  /** modulo-usuario-sistema ctor */

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  isDtInitialized: boolean = false;
  public operacionRespuesta: RespuestaGenerica;
  private modelo_configuracion: ServiciosRutas;

  public listaUsuariosSistema: Array<ConsultaListaUsuariosSistemaResponse> = [];
  public RespuestaBorradoUsuarioSistema: BorraUsuarioSistemaResponse;
  public DivListaUsuarios: boolean;

  public usuarioId = "";
  public mensajeRespuesta: string;
  public proceso_exitoso: boolean;

  constructor(private services: ServiceGenerico, private themeConstants: ThemeConstants, private router: Router, private modalService: NgbModal) {
    this.operacionRespuesta = new RespuestaGenerica();
    this.modelo_configuracion = new ServiciosRutas();
  }



  ngOnInit(): void {
    this.DivListaUsuarios = true;
    this.inicializaTabla();
    this.getUsuariosSistema();
  }

  inicializaTabla() {
    this.dtOptions = this.themeConstants.dtOptions;
    this.dtTrigger = new Subject();
  }

  public getUsuariosSistema() {
    this.services.HttpGet(this.modelo_configuracion.serviciosOperaciones + "/ConsultaListaUsuariosSistema/Get?id_ca_perfiles=1")
      .subscribe((tempdate) => {
        if (tempdate) {
          this.listaUsuariosSistema = tempdate.response as ConsultaListaUsuariosSistemaResponse[];
          this.renderTabla();
          this.operacionRespuesta.EstaEjecutando = false;
        } else {
          this.listaUsuariosSistema = [];
          this.renderTabla();
          this.operacionRespuesta.EstaEjecutando = false;
        }
      });
  }

  renderTabla() {
    if ("dtInstance" in this.dtElement) {
      this.dtElement.dtInstance.then((instancia: DataTables.Api) => {
        instancia.destroy();
        this.dtTrigger.next();
      });
    } else {
      this.dtTrigger.next();
    }

  }

  /*public desctivarUsuario(id_usuario: number) {*/
  public desctivarUsuario(item) {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services.HttpGet(this.modelo_configuracion.serviciosOperaciones + "/BorraUsuarioSistema/Get?estatus=0&id_usuario=" + item.usuarioId)
      .subscribe(async (tempdate) => {
        if (tempdate) {
          this.RespuestaBorradoUsuarioSistema = tempdate.response as BorraUsuarioSistemaResponse;
          this.getUsuariosSistema();
          this.modalService.dismissAll();
          this.operacionRespuesta.EstaEjecutando = false;
        } else {
          this.getUsuariosSistema();
          this.operacionRespuesta.EstaEjecutando = false;
        }
      });
  }

  /*public activarUsuario(id_usuario: number) {*/
  public activarUsuario(item) {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services.HttpGet(this.modelo_configuracion.serviciosOperaciones + "/BorraUsuarioSistema/Get?estatus=1&id_usuario=" + item.usuarioId)
      .subscribe(async (tempdate) => {
        if (tempdate) {
          this.RespuestaBorradoUsuarioSistema = tempdate.response as BorraUsuarioSistemaResponse;
          this.getUsuariosSistema();
          this.modalService.dismissAll();
          this.operacionRespuesta.EstaEjecutando = false;
        } else {
          this.getUsuariosSistema();
          this.operacionRespuesta.EstaEjecutando = false;
        }
      });
  }

  public  eliminarUsuario(item) {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services.HttpGet(this.modelo_configuracion.serviciosOperaciones + "/BorraUsuarioSistema/Get?estatus=2&id_usuario=" + item.usuarioId)
      .subscribe(async (tempdate) => {
        if (tempdate) {
          this.RespuestaBorradoUsuarioSistema = tempdate.response as BorraUsuarioSistemaResponse;
          this.getUsuariosSistema();
          this.modalService.dismissAll();
          this.operacionRespuesta.EstaEjecutando = false;
          this.mensajeRespuesta = this.RespuestaBorradoUsuarioSistema[0].mensaje;
          this.proceso_exitoso = this.RespuestaBorradoUsuarioSistema[0].proceso_exitoso;
            const modalref = this.modalService.open(this.ModalExito, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' });
        } else {
          this.getUsuariosSistema();
          this.operacionRespuesta.EstaEjecutando = false;
        }
      });
  }

  nuevoUsuario() {
    this.router.navigate(['/usuario-sistema/nuevo-usuario/']);
  }

  editarUsuario(id_usuario: number) {
    this.router.navigate(['/usuario-sistema/editar-usuario-sistema/' + id_usuario]);
  }



  openActivar(content, us) {
    this.usuarioId = us;
    const modalref = this.modalService.open(this.ModalActivar, { ariaLabelledBy: 'modal-basic-title' });
  }

  openDesactivar(content, us) {
    this.usuarioId = us;
    const modalref = this.modalService.open(this.ModalDesactivar, { ariaLabelledBy: 'modal-basic-title' });
  }

  openEliminar(content, us) {
    this.usuarioId = us;
    const modalref = this.modalService.open(this.ModalEliminar, { ariaLabelledBy: 'modal-basic-title' });
  }

}
