import { Component, OnInit, ViewChild, EventEmitter, TemplateRef, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';;
import { CatalogoMediosTrasmision } from 'src/app/model/Catalogos/CatalogoMediosTransmision';
import { ThemeConstants } from '../../../@espire/shared/config/theme-constant';
import { AuthIdentity } from 'src/app/guards/AuthIdentity';
import { RespuestaGenerica } from '../../../model/Operaciones/generales/RespuestaGenerica';
import { ServiciosRutas } from '../../../model/Operaciones/generales/ServiciosRutas';
import { ServiceGenerico } from '../../../services/service-generico.service';
import { ModuloModalMensajeComponent } from '../../../shared/modulo-modal-mensaje/modulo-modal-mensaje.component';
import { CatalogoFecha, GenerarOficioTransmisionRequest, RangoFrecuenciaHorario, TramiteTransmisionRequest, TramiteTransmisionResponse } from 'src/app/model/Operaciones/Transmisiones/Transmision';
import { ActosReligiosos} from 'src/app/model/Operaciones/Transmisiones/ActosReligiosos';
import { ConsultaListaCatalogoDirectorResponse } from 'src/app/model/Catalogos/CatalogosDirector';
import { GenerarOficio } from 'src/app/services/generar-pdf.service';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { ModuloVisorPdfComponent } from 'src/app/shared/modulo-visor-pdf/modulo-visor-pdf.component';
import {ModuloVisorWordPdfComponent} from '../../../shared/modulo-visor-word-pdf/modulo-visor-word-pdf.component';
import {ModeloWordToPdf} from '../../../model/Operaciones/AsignacionRegistro/AsignacionRegistro';
import {SentFile} from '../../../model/Utilities/File';
import {FileService} from '../../../services/file.service';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-modulo-consulta-transmision',
  templateUrl: './modulo-consulta-transmision.component.html',
  styleUrls: ['./modulo-consulta-transmision.component.css'],
  providers: [ServiceGenerico]
})

export class ModuloConsultaTransmisionComponent implements OnInit {

  @ViewChild("modalAutorizar", { static: false }) modalAutorizar: TemplateRef<any>;
  @ViewChild("modalObservaciones", { static: false }) modalObservaciones: TemplateRef<any>;
  @ViewChild("modalConcluir", { static: false }) modalConcluir: TemplateRef<any>;
  @ViewChild("modalSustituir", { static: false }) modalSustituir: TemplateRef<any>;

  modalrefMsg: NgbModalRef;

  formGroupAtenderTransmision: FormGroup;
  formGroupAutorizarTransmision: FormGroup;
  formGroupObservarTransmision: FormGroup;
  formGroupConcluirTramite: FormGroup;

  lstDirectores: ConsultaListaCatalogoDirectorResponse[] = [];
  lstHorarios;
  puestoFirmante: ConsultaListaCatalogoDirectorResponse[] = [];
  id_firmante_seleccionado: number = 0;
  id_ccp_seleccionado: number = 0;

  lstActosReligiosos: ActosReligiosos[];
  lstActosMedios: CatalogoMediosTrasmision[];
  lstEmisoras: CatalogoMediosTrasmision[];
  lstActosFechasRangos: RangoFrecuenciaHorario[] = [];
  lstActosFechasFrecuencia: RangoFrecuenciaHorario[] = [];
  b_concluirSolicitud: boolean = false;
  id_estatusSeleccionado: Number = 0;

  identificacion:  boolean = false;
  solicitudTrans: boolean = false;

  id_estatus : number;
  bloqueoDictaminador: boolean;

  autorizacionTransmision: boolean = false;
  b_observar: boolean = false;
  b_autorizar: boolean = false;
  b_concluir: boolean = false;
  b_oficio: boolean = false;
  b_procesoTerminado: boolean = false;

  modeloTramite: TramiteTransmisionResponse;
  modeloOficio;
  us_id: number;
  i_id_transmision: number = 0;
  i_id_tramite: number = 0;
  nombre_acto: string;
  num_transmisiones: number = 0;

  isDictaminador:Boolean = false;
  isAsignador:Boolean = false;

  operacionRespuesta: RespuestaGenerica;
  modelo_configuracion: ServiciosRutas;

  archivoOficioBase = null;

  constructor(private services: ServiceGenerico,
              private _route: ActivatedRoute,
              private fb: FormBuilder,
              private modalService: NgbModal,
              private themeConstants: ThemeConstants,
              private router: Router,
              public fileService: FileService) {
              this.operacionRespuesta = new RespuestaGenerica();
              this.modelo_configuracion = new ServiciosRutas();
              this.i_id_transmision = Number(this._route.snapshot.paramMap.get('transmision'));
  }

  ngOnInit(): void {
    this.us_id = AuthIdentity.ObtenerUsuarioRegistro();

    this.isDictaminador = AuthIdentity.IsDictaminador();
    this.isAsignador = AuthIdentity.IsAsignador();
    this.obtenerTramiteTransmision();
    this.inicializarFormAtencion();
    this.inicializarFormAutorizacion();
    this.inicializarFormObservarTransmision();
    this.inicializarFormConcluirTramite();
    this.obtenerCatalogoDirectores();
    this.obtenerHorarios();
  }

  inicializarFormAtencion() {
    this.formGroupAtenderTransmision = this.fb.group({
      referencia: [""],
      expediente: [""],
      oficio: [""],
      id_firmante: [""],
      puesto_firmante: [""],
      id_ccp: [""],
    });
  }

  inicializarFormAutorizacion() {
    this.formGroupAutorizarTransmision = this.fb.group({
      fecha: [""],
      horario: [""],
      direccion: [""]
    });
  }

  inicializarFormObservarTransmision(){
    this.formGroupObservarTransmision = this.fb.group({
      observacion: [""]
    });
  }

  inicializarFormConcluirTramite(){
    this.formGroupConcluirTramite = this.fb.group({
      id_estatus: [""],
      observacion: [""]
    });
  }

  obtenerHorarios(){
    this.lstHorarios = [
      { i_id: 1, c_horario: '9:00 am - 10:00 am' },
      { i_id: 2, c_horario: '10:00 am - 11:00 am' },
      { i_id: 3, c_horario: '11:00 am - 12:00 am' },
      { i_id: 4, c_horario: '12:00 am - 13:00 pm' },
      { i_id: 5, c_horario: '13:00 pm - 14:00 pm' }
    ];
  }

  guardarAtenderTransmision(){
    this.operacionRespuesta.EstaEjecutando = true;
    let model = this.formGroupAtenderTransmision.value;
    model.id_transmision = Number(this.i_id_transmision);
    model.id_firmante = Number(this.id_firmante_seleccionado);
    model.id_ccp = Number(this.id_ccp_seleccionado);
    this.services
      .HttpPost(
        model,
        this.modelo_configuracion.serviciosOperaciones +
        "/ActualizarAtenderTransmision/Post")
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.openMensajes([], tempdate.response[0].mensaje);
            this.obtenerInformacionOficio();
          } else {
            this.openMensajes(["No se pudo realizar la acción"], []);
          }
          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.openMensajes(["No se pudo realizar la acción"], []);
          this.operacionRespuesta.EstaEjecutando = false;
        }
      );
  }

  guardarAtenderTransmisionSinMensaje(){
    this.operacionRespuesta.EstaEjecutando = true;
    let model = this.formGroupAtenderTransmision.value;
    model.id_transmision = Number(this.i_id_transmision);
    model.id_firmante = Number(this.id_firmante_seleccionado);
    model.id_ccp = Number(this.id_ccp_seleccionado);
    this.services
      .HttpPost(
        model,
        this.modelo_configuracion.serviciosOperaciones +
        "/ActualizarAtenderTransmision/Post")
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            // this.openMensajes([], tempdate.response[0].mensaje);
            this.obtenerInformacionOficio();
          } else {
            this.openMensajes(["No se pudo realizar la acción"], []);
          }
          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.openMensajes(["No se pudo realizar la acción"], []);
          this.operacionRespuesta.EstaEjecutando = false;
        }
      );
  }

  guardarObservacion(){
    this.operacionRespuesta.EstaEjecutando = true;
    let model = this.formGroupObservarTransmision.value;
    model.id_transmision = Number(this.i_id_transmision);
    model.id_estatus = Number(0);
    model.id_usuario = this.modeloTramite.c_us;
    this.services
      .HttpPost(
        model,
        this.modelo_configuracion.serviciosOperaciones +
        "/InsertarObservacionTransmision/Post")
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            const modalref = this.modalService.dismissAll(this.modalObservaciones);
            this.openMensajes([], tempdate.response[0].mensaje);
            setTimeout(() => {

             // this.router.navigate(['/atencion-transmision']);
              this.router.navigate(['/registros-transmision-dictaminador']);

            }, 1000);
          } else {
            this.openMensajes(["No se pudo realizar la acción"], []);
          }

          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.openMensajes(["No se pudo realizar la acción"], []);
          this.operacionRespuesta.EstaEjecutando = false;
        }
      );
  }

  autorizarTransmision(){
    this.operacionRespuesta.EstaEjecutando = true;
    let model = this.formGroupAutorizarTransmision.value;
    model.id_transmision = Number(this.i_id_transmision);
    model.id_usuario = this.modeloTramite.c_us;
    this.services
      .HttpPost(
        model,
        this.modelo_configuracion.serviciosOperaciones +
        "/AutorizarTransmision/Post")
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            const modalref = this.modalService.dismissAll(this.modalAutorizar);
            this.openMensajes([], tempdate.response[0].mensaje);
            setTimeout(() => {
             // this.router.navigate(['/atencion-transmision']);
              this.router.navigate(['/registros-transmision-dictaminador']);

            }, 1000);
          } else {
            this.openMensajes(["No se pudo realizar la acción"], []);
          }

          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.openMensajes(["No se pudo realizar la acción"], []);
          this.operacionRespuesta.EstaEjecutando = false;
        }
      );
  }

  concluirTramite() {
    this.operacionRespuesta.EstaEjecutando = true;
    let model = this.formGroupConcluirTramite.value;
    model.id_transmision = Number(this.i_id_transmision);
    model.id_estatus = this.id_estatusSeleccionado;
    model.id_usuario = this.modeloTramite.c_us;

    if (this.archivoOficioBase !== null) {
      this.fileService.cargarArchivo(this.i_id_transmision, this.archivoOficioBase, 29);
    } else {
      this.operacionRespuesta.EstaEjecutando = false;
      this.openMensajes(["Es necesario cargar el oficio"], []);
      return;
    }

    this.services
      .HttpPost(
        model,
        this.modelo_configuracion.serviciosOperaciones +
        "/InsertarObservacionTransmision/Post")
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            const modalref = this.modalService.dismissAll(this.modalObservaciones);
            this.openMensajes([], tempdate.response[0].mensaje);
            setTimeout(() => {
              //this.router.navigate(['/atencion-transmision']);
              this.router.navigate(['/registros-transmision-dictaminador']);
            }, 1000);
          } else {
            this.openMensajes(["No se pudo realizar la acción"], []);
          }

          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.openMensajes(["No se pudo realizar la acción"], []);
          this.operacionRespuesta.EstaEjecutando = false;
        }
      );
  }

  obtenerCatalogoDirectores(){
    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpGet(
        this.modelo_configuracion.serviciosCatalogos +
        "/Director/Get")
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.lstDirectores = tempdate.response;
          } else {
            this.openMensajes(["No se pudo realizar la acción"], []);
          }
          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.operacionRespuesta.EstaEjecutando = false;
        }
      );
  }

  obtenerTramiteTransmision() {

    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpGet(
        this.modelo_configuracion.serviciosOperaciones +
        "/ConsultaDetalleTramiteTransmision/Get?s_id_us=0&i_id_transmision=" + this.i_id_transmision)
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.modeloTramite = tempdate.response[0];
            this.i_id_transmision = this.modeloTramite.i_id_tbl_transmision;
            this.identificacion = ((this.modeloTramite.b_identificacion != 0 && this.modeloTramite.b_identificacion != null) ? true : false);
            this.solicitudTrans = ((this.modeloTramite.b_solicitudTrans != 0 && this.modeloTramite.b_solicitudTrans != null) ? true : false);
            this.id_estatus = this.modeloTramite.estatus;
            if (this.i_id_transmision !== 0) {
              this.obtenerActosReligiosos();
              this.obtenerInformacionOficio();
            }
          } else {
            this.openMensajes(["No se pudo realizar la acción"], []);
          }
          this.operacionRespuesta.EstaEjecutando = false;
          this.bloqueoDictaminador = this.id_estatus == 33 || this.id_estatus == 34 ? true : false;
        },
        async (err) => {
          this.operacionRespuesta.EstaEjecutando = false;
        }
      );
  }

  obtenerActosReligiosos() {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpGet(this.modelo_configuracion.serviciosOperaciones +
        "/ConsultaActosReligiosos/GetActosReligiosos?i_id_transmision=" + this.i_id_transmision)
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.lstActosReligiosos = tempdate.response;

            this.lstActosReligiosos.forEach(element => {
              element.ruta = '#panel-' + element.i_id_acto;
            });
          } else {
            this.openMensajes(["No se pudo realizar la acción"], []);
          }
          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.operacionRespuesta.EstaEjecutando = false;
        }
      );
  }

  obtenerActosMediosTransmision(idActo: number, nombreActo: string) {
    this.operacionRespuesta.EstaEjecutando = true;

    this.lstActosMedios = [];
    this.lstActosFechasRangos = [];
    this.lstActosFechasFrecuencia = [];

    this.nombre_acto = nombreActo;

    this.services
      .HttpGet(this.modelo_configuracion.serviciosOperaciones +
        "/ConsultaActosReligiosos/GetActosMediosTransmision?i_id_acto_religioso=" + idActo)
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.lstActosMedios = tempdate.response;
            this.obtenerActosFechas(idActo);
          } else {
            this.openMensajes(["No se pudo realizar la acción"], []);
          }
          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.operacionRespuesta.EstaEjecutando = false;
        }
      );
  }

  obtenerActosFechas(idActo: number) {
    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpGet(this.modelo_configuracion.serviciosOperaciones +
        "/ConsultaActosReligiosos/GetActosFechas?i_id_acto_religioso=" + idActo)
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            var lstActosFechas = tempdate.response;

            for (let i = 0; i < lstActosFechas.length; i++) {
              lstActosFechas[i].cat_dia = this.convertirStringObjet(lstActosFechas[i].cat_dia)
              lstActosFechas[i].cat_mes = this.convertirStringObjet(lstActosFechas[i].cat_mes)
              lstActosFechas[i].cat_anio = this.convertirStringObjet(lstActosFechas[i].cat_anio)
            }

            this.lstActosFechasRangos = lstActosFechas.filter(function (item) {
              return (item.i_id_cat_periodo == null || item.i_id_cat_periodo == 0);
            });

            this.lstActosFechasFrecuencia = lstActosFechas.filter(function (item) {
              return (item.i_id_cat_periodo != null && item.i_id_cat_periodo != 0);
            });

          } else {
            this.openMensajes(["No se pudo realizar la acción"], []);
          }
          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.operacionRespuesta.EstaEjecutando = false;
        }
      );
  }

  obtenerInformacionOficio(){
    this.operacionRespuesta.EstaEjecutando = true;
    this.services
      .HttpGet(
        this.modelo_configuracion.serviciosOperaciones +
        "/ConsultaOficioTransmision/Get?i_id_transmision=" + this.i_id_transmision)
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            this.modeloOficio = tempdate.response[0];
            this.id_firmante_seleccionado = this.modeloOficio.id_firmante;
            this.id_ccp_seleccionado = this.modeloOficio.id_ccp;
            this.formGroupAtenderTransmision.patchValue(this.modeloOficio);
            this.validarBotones();
          } else {
            //this.openMensajes(["No se pudo realizar la acción"], []);
            this.validarBotones();
          }
          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.operacionRespuesta.EstaEjecutando = false;
        }
      );
  }

   generarOficio(){
    //  this.guardarAtenderTransmisionSinMensaje();
    this.operacionRespuesta.EstaEjecutando = true;
    let modelOficio = {
      i_id_transmision : this.i_id_transmision,
      i_id_tramite : this.i_id_tramite
    };
     this.services
      .HttpPost(
        modelOficio as GenerarOficioTransmisionRequest,
        this.modelo_configuracion.serviciosOperaciones +
        "/GenerarOficio/GenerarOficio")
      .subscribe(
        (tempdate) => {
          if (tempdate) {
            const urlFile = tempdate.response[0].path_archivo;
            const nombreFile= tempdate.response[0].path_archivo.split('.');
            this.obtenerArchivo(urlFile, nombreFile);
          } else {
            this.openMensajes(["No se pudo realizar la acción"], []);
          }

          this.operacionRespuesta.EstaEjecutando = false;
        },
        async (err) => {
          this.openMensajes(["No se pudo realizar la acción"], []);
          this.operacionRespuesta.EstaEjecutando = false;
        }
      );

    //this.openMensajes(["No se pudo realizar la acción"], []);
  }

  private validarBotones(): void {

    this.b_observar = (this.modeloOficio != undefined  && (this.modeloTramite.estatus != 31 && this.modeloTramite.estatus != 32) ? true : false);
    this.b_autorizar = (this.modeloOficio != undefined && (this.modeloTramite.estatus != 31 && this.modeloTramite.estatus != 32 ) ? true : false);
    this.b_oficio = (this.modeloOficio != undefined &&  (this.modeloTramite.estatus == 32) ? true : false);
    this.b_concluir = (this.modeloOficio != undefined && (this.modeloTramite.estatus == 31 || this.modeloTramite.estatus == 32) ? true : false);

    if (this.modeloTramite.estatus === 34 && this.isDictaminador) {
        this.b_procesoTerminado = true;
    }

  }

  abrirFormObservar(){
    this.inicializarFormObservarTransmision();
    const modalref = this.modalService.open(this.modalObservaciones, { ariaLabelledBy: 'modal-basic-title' });
  }

  abrirFormAutorizar(){
    this.inicializarFormAutorizacion();
    this.formGroupAutorizarTransmision.get('direccion').setValue('Londres No. 102, Piso 4, Colonia Juárez, Alcaldía Cuauhtémoc, Ciudad de México. C.P. 06600.');
    const modalref = this.modalService.open(this.modalAutorizar, { ariaLabelledBy: 'modal-basic-title' });
  }

  abrirFormConcluir(){
    const modalref = this.modalService.open(this.modalConcluir, { ariaLabelledBy: 'modal-basic-title' });
  }

  onChangeFirmante(valor) {
    this.id_firmante_seleccionado = valor.value;
    this.puestoFirmante = this.lstDirectores.filter(function (item) {
      return item.director_id == valor.value;
    });
    this.formGroupAtenderTransmision.get('puesto_firmante').setValue(this.puestoFirmante[0].director_cargo);
  }

  onChangeCcp(valor) {
    this.id_ccp_seleccionado = valor.value;
  }

  onChangeEstatusSolicitud(valor){
    this.b_concluirSolicitud = (Number(valor.value) == 34 ? true : false );
    this.id_estatusSeleccionado = Number(valor.value);
  }

  convertirStringObjet(item: string) {
    var arrayJson: Array<CatalogoFecha> = [];
    arrayJson = JSON.parse(item);
    return arrayJson;
  }

  setIsLoadingArchivo(is_loading: boolean): void {
    this.operacionRespuesta.EstaEjecutando = is_loading;
  }

  setSentArch(file: SentFile): void {
    this.archivoOficioBase = file.sent ? file.base64 : null;
  }

  public obtenerArchivo(rutaArchivo: string, nombreArchivo: string): void {
    const reader = new FileReader();
    this.services.HttpGetFile(
      this.modelo_configuracion.serviciosOperaciones +
        "/GenerarOficio/ObtenerArchivo?ruta=" + rutaArchivo)
          .subscribe((response : Blob) => {

      this.downloadFile(response);
    });
  }

  downloadFile(data){
    var blob = new Blob([data], { type: "application/pdf" });
    const linkDescarga = document.createElement('a');
    linkDescarga.href = window.URL.createObjectURL(blob);
    linkDescarga.download = "Oficio.pdf";
    linkDescarga.click();
  }

  createPDF(){
    const prueba = new ServiciosRutas();
    const url = `${`${prueba.serviciosOperaciones}/ConsultaActosReligiosos/ObtenerDocumento?i_id_transmision=${this.i_id_transmision}&i_id_acto_religioso=0&s_id_us=0&i_id_tramite=${this.i_id_tramite}`}`;
    this.services.HttpGetFile(url)
    .subscribe((response: Blob) => {
      const file = URL.createObjectURL(response);
      window.open(file);
    });


    //this.guardarAtenderTransmision();
    this.obtenerActosMediosTransmision(0, null);
    this.consultaNoTransmisiones();

    pdfMake.fonts = {
      Montserrat: {
        normal: 'Montserrat-Light.ttf',
        bold: 'Montserrat-Bold.ttf',
        italics: 'Montserrat-Italic.ttf',
        bolditalics: 'Montserrat-BoldItalic.ttf'
      },
      Roboto: {
        normal: 'Roboto-Regular.ttf',
        bold: 'Roboto-Medium.ttf',
        italics: 'Roboto-Italic.ttf',
        bolditalics: 'Roboto-MediumItalic.ttf'
      }
    };

    // setTimeout(() => {
    //   const oficioPdf = new GenerarOficio();
    //   const doc = oficioPdf.create(
    //   this.modeloOficio,
    //   this.modeloTramite,
    //   this.lstActosReligiosos,
    //   this.lstActosMedios,
    //   this.lstActosFechasRangos,
    //   this.lstActosFechasFrecuencia,
    //   this.num_transmisiones
    // );
    // const pdf = pdfMake.createPdf(doc);
    // pdf.download('Oficio.pdf');

    // }, 2500);
  }

  public consultaNoTransmisiones(){
    this.operacionRespuesta.EstaEjecutando = true;
    const params = {
      medio_comunicacion: null,
      estatus_transmision: null,
      denominacion: null,
      acto_religioso: null,
      fecha_inicio: null,
      fecha_fin: null,
    }
    this.services.HttpPost(params, `${this.modelo_configuracion.serviciosOperaciones}/ReporteTransmision/ConsultarReporteTransmision`)
      .subscribe((response: any) => {
        var lstRegistros = response.response;
        lstRegistros.filter(item => {
          if(item.transmision_id === this.i_id_transmision){
            this.num_transmisiones = item.total_transmisiones
          }
        })
        this.operacionRespuesta.EstaEjecutando = false;
      }, (error) => {
        this.operacionRespuesta.EstaEjecutando = false;
        this.openMensajes([error.response[0]], []);
      });

  }

  openMensajes(Errores: string[], Mensajes: string[]) {
    this.modalrefMsg = this.modalService.open(ModuloModalMensajeComponent, {
      ariaLabelledBy: "modal-basic-title",
    });
    this.modalrefMsg.componentInstance.mensajesError = [];
    this.modalrefMsg.componentInstance.mensajesExito = [];
    this.modalrefMsg.componentInstance.mensajesTitulo = "Solicitud Enviada";
    if (Errores?.length > 0) {
      this.modalrefMsg.componentInstance.showErrors = true;
      this.modalrefMsg.componentInstance.mensajesError.push(Errores);
    }
    if (Mensajes?.length > 0) {
      this.modalrefMsg.componentInstance.showExitos = true;
      this.modalrefMsg.componentInstance.mensajesExito.push(Mensajes);
    }
  }

  public EjecutaSalir(): void {
    if (this.isDictaminador) {
      this.router.navigate(['/registros-transmision-dictaminador']);
    } else if (this.isAsignador) {
      this.router.navigate(['/asignacion-transmision']);
    } else {
      this.router.navigate(['/registros-transmision']);
    }
  }

  public async consultarOficioConcluido() {
    this.services
      .HttpGet(this.modelo_configuracion.serviciosOperaciones + "/ConsultaArchivo/Get?id=" + this.modeloTramite.i_id_tbl_transmision + "&idArchivoTramite=29")
      .subscribe(async (response: any) => {
          if (response) {
            if (response.response[0].proceso_exitoso == true) {
              const modalRef = this.modalService.open(ModuloVisorPdfComponent, { size: "lg" });
              modalRef.componentInstance.src = response.response[0].ruta;
              return;
              /*const src = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${response.response[0].ruta}`;
              const link = document.createElement("a");
              link.href = src;
              link.download = "Oficio";
              link.click();*/
            }
          }
        },
        (error) => {
          this.openMensajes(["No se encontró el documento."], []);
        }
      );
  }

  public async preCargarArchivo(archivo: File) {

    if (archivo === null || archivo === undefined) {
      return;
    }

    const esValido = this.ejecutaProcesoValidacion(archivo);
    if ( esValido === true) {
        this.operacionRespuesta.EstaEjecutando = true;
        await this.ConvertirArchivoBase64(archivo[0])
        .then( async (base64: any) => {
              this.operacionRespuesta.EstaEjecutando = false;
              const params = {
                id: this.modeloTramite.i_id_tbl_transmision,
                archivo: base64,
                idArchivoTramite: "29",
              };
              await this.cargarArchivoDependiente(params);

        }).catch(async error => {
              this.operacionRespuesta.EstaEjecutando = false;
      });
    } else {
      this.openMensajes(["El máximo tamaño permitido es."+  (20971520 / 1000) + "Mb."], []);
    }
  }

  private async cargarArchivoDependiente(params: any) {
    this.services.HttpPost(
      params,
      this.modelo_configuracion.serviciosOperaciones + "/InsertarArchivo/Post")
      .subscribe( (response: any) => {
        if (response) {
          if (response[0].proceso_exitoso == true) {
            this.openMensajes([],["El documento se ha cargado de forma exitosa."]);
            return;
          }
        }
        this.openMensajes(["El documento no se ha cargado de forma exitosa, por favor intente de nuevo."],[]);
      },
      (error) => {
        this.openMensajes(["El documento no se ha cargado de forma exitosa, por favor intente de nuevo."],[]);
      }
    );
  }

  async ConvertirArchivoBase64(archivoActual: File) {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();
      reader.onloadend  = () => {
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(archivoActual as Blob);
    });
  }

  private ejecutaProcesoValidacion(archivo: File): boolean {
    let sonValidos = true;
    const esValidoTamanio = this.esValidoElTamanoArchivo(archivo[0].size);
    if (archivo[0].type === 'application/pdf' && esValidoTamanio) {
      return sonValidos;
    } else {
      sonValidos = false;
    }

    return sonValidos;
  }

  private esValidoElTamanoArchivo(tamanio: number): boolean {
    if (Math.round(tamanio / 1024) < Math.round(3000000 / 1024)  ) {
      return true;
    } else {
      return false;
    }
  }

  blobToData = (blob: Blob): any => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.readAsDataURL(blob)
    });
  }

}
