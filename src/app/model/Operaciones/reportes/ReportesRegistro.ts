////export class DatosReporteResponse {
////  idUsuario?: number;
////  estatus?: boolean;
////  avisoPrivacidad?: boolean;
////  mensaje?: boolean;
////}

export class DatosReporteRequest {
  // i_id_tramite: number;
  c_denominacion: string;
  c_nRegistro: string;
  id_colonia: number;
  id_estado: number;
  id_municipio: number;
  id_estatus_tramite: number;
  estatus_tramite: string;
  domicilio_legal: string;
  representante_legal: string;
  i_id_credo?: number;
  credo: string;
  fecha_autorizacion: Date;
}


export class DatosReporteTramiteResponse {
  id_transmision?: number;
  domicilio: string;
  numero_sgar: string;
  denominacion: string;
  representante: string;
  id_estatus?: number;
  estatus: string;
  fecha_solicitud: Date;
  fecha_autorizacion: Date;
}

export class DatosReporteTnotaResponse {
  c_denominacion: string;
  c_nRegistro: string;
  estatus_tramite: number;
  fecha_registro: Date;
  movimientostnota: string;
}