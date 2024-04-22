export class ConsultaDetalleTomaNotaResponse {
  c_tramite: number;
  c_numero_sgar: string;
  c_denominacion: string;
  c_existe_escrito_solicitud: boolean;
  c_existe_certificado_reg_solicitud: boolean;
  c_escritura_publica: boolean;
  c_alta_apoderado_doc: boolean;
  c_baja_apoderado_doc: boolean;
  c_cambio_apoderado_doc: boolean;
  c_id_tsol_escrito: number;
  c_cotejo: number;
  c_toma_nota: number;
  c_coment_est: string;
  c_n_denom: string;
  c_coment_n_denom: string;
  c_us: number;
}

export class EditarDetalleTomaNotaRequest {
  c_tramite: number;
  c_numero_sgar: string;
  c_denominacion: string;
  comentario_tnota: string;
  c_existe_escrito_solicitud: boolean;
  c_existe_certificado_reg_solicitud: boolean;
  c_existe_ejemplar_est_solicitud: boolean;
  c_escritura_publica: boolean;
  c_alta_apoderado_doc: boolean;
  c_baja_apoderado_doc: boolean;
  c_cambio_apoderado_doc: boolean;
  c_id_tsol_escrito: number;
  c_cotejo: number;
  c_toma_nota: number;
  c_comentario: string;
  c_n_denom: string;
  c_comentario_n: string;
}

export class ActualizarDomicilioLRequest {
  d_id_domicilio: number;
  d_tipo_domicilio: number;
  d_numeroe: string;
  d_numeroi: string;
  d_colonia: number;
  d_ciudad: string;
  d_calle: string;
  d_cpostal: string;

}


export class InsertarDomicilioRequest {
  d_tipo_domicilio: string;
  d_numeroe: string;
  d_numeroi: string;
  d_colonia: number;
  d_ciudad: string;
  d_calle: string;
}


export class EditarMovEstatutosDenominacion {
  c_id: number;
  c_comentario: string;
  c_denominacion: string;
  c_comentario_n: string;
}

export class EditarComentario {
  c_id: number;
  comentario_tnota: string;
  c_numero_sgar: string;
  c_denominacion: string;
}
export class ActualizarRepresentateTNRequest {
  public s_id: number;
  public p_id: number;

  public p_nombre: string;
  public p_apaterno: string;
  public p_amaterno: string;
  public p_tipo_rep_id: number;
  public p_telefono: string;
  public p_correo: string;
  public p_cargo: string;
  public c_organo_g: string;
}


export class ActualizarRepresentateLegalTNRequest {
  public s_id: number;
  public p_id: number;

  public p_nombre: string;
  public p_apaterno: string;
  public p_amaterno: string;
  public p_tipo_rep_id: number;

  public c_id_tipo_movimiento: number;
  public c_id_poder: number;

}

export class ActualizarRepresentateLegalTN_Request {
  public s_id: number;
  public p_id: number;

  public p_nombre: string;
  public p_apaterno: string;
  public p_amaterno: string;
  public p_tipo_rep_id: number;

  public c_id_tipo_movimiento: number;
  public c_id_poder: number;

public t_rep_legal:boolean;
public t_rep_asociado:boolean;
public t_ministro_culto:boolean;
public t_organo_gob:boolean;
public p_cargo:string;
public c_organo_g:string;
}

export class ConsultaDetalleTomaNotaRepresentanteLegalResponse {
  public s_id: number;
  public p_id: number;

  public p_nombre: string;
  public p_apaterno: string;
  public p_amaterno: string;
  public p_tipo_rep_id: number;
  public p_telefono: string;
  public p_correo: string;
  public p_cargo: string;
  public c_organo_g: string;
}

export class ActualizarApoderadoLegalTNResponse {
  public s_id: number;
  public p_id: number;

  public p_nombre: string;
  public p_apaterno: string;
  public p_amaterno: string;

  public c_id_poder: number;
  public c_id_tipo_movimiento: number;

  public c_nacionalidad: string;
  public c_edad: number;


}

export class InsertarTomaNotaApoderadoLegalRequest {
  public s_id: number;
  public p_id: number;

  public p_nombre: string;
  public p_apaterno: string;
  public p_amaterno: string;

  public c_id_poder: number;
  public c_id_tipo_movimiento: number;

  public p_nacionalidad: string;
  public p_edad: number;


}


export class routeTN {
  id: number;
  text: string;
  /*link: string;*/
  active: boolean;
}

export class FinalizarTomaNota {
  i_id_trtn: number;
  s_id_us: number;

  b_estatutos: boolean;
  b_denominacion: boolean;
  b_miembros: boolean;
  b_representante: boolean;
  b_apoderado: boolean;
  b_dom_legal: boolean;
  b_dom_notificacion: boolean;
}


export class ConsultaListaMovimientosTNotaResponse{
  s_id: number;
  s_cat_mov: number;
  s_cat_tnota: number;
  s_movimiento: string;
}

export class archivosAnexo {
  id_asunto: number;
  nombre_anexo: string;
  anexo: File;
  extension: string;
  id_tramite: number;
}

export class listaMovimientos {
  estatutos: boolean;
  denominacion: boolean;
  listAsociados: boolean;
  repreLegal: boolean;
  apodLegal: boolean;
  domicilioLegal: boolean;
  domicilioNotificacion: boolean;
}

export class RequestParamMovimientos {
  p_id_tramite?: number;
  estatutos: boolean;
  denominacion:boolean;
  rep_legal: boolean;
  apoderado: boolean;
  dom_notificaciones: boolean;
  dom_legal: boolean;

  constructor(tramiteId?: number, elementos: any = null) {

    this.p_id_tramite = tramiteId;

    if(elementos === null) {
      this.estatutos = false;
      this.denominacion = false;
      this.rep_legal = false;
      this.apoderado = false;
      this.dom_notificaciones = false;
      this.dom_legal = false;
    } else {

    }

  }
  
}