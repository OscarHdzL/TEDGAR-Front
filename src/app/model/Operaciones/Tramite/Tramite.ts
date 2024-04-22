import { ActualizarDomicilioRequest, InsertarDomicilioRequest, LecturaDomicilioRequest } from "./Domicilio";

export class InsertarTramitePasoUnoRequest {
  s_id_us: number;
  s_cat_credo: number;
  s_cat_solicitud_escrito: number;
  s_cat_denominacion: number;
  s_numero_registro: number;
  s_pais_origen: number;
  s_domicilio: InsertarDomicilioRequest;
}
export class InsertarTramitePasoTresRequest {
  s_cat_sjuridica: string;
  s_f_apertura: string;
  s_domicilio: InsertarDomicilioRequest;
}
export class InsertarTramitePasoCuatroRequest {
  s_superficie:string;
	s_medidas:string;
	s_colindancia_text_1:string;
	s_colindancia_text_2:string;
	s_colindancia_text_3:string;
	s_colindancia_text_4:string;
  s_colindancia_num_1:number;
	s_colindancia_num_2:number;
	s_colindancia_num_3:number;
	s_colindancia_num_4:number;
  s_colindancia_usos: string;
	s_aviso_apertura:number;
}
export class ActualizarTramitePasoCuatroRequest {
  s_id:number;
  s_superficie:string;
	s_medidas:string;
	s_colindancia_text_1:string;
	s_colindancia_text_2:string;
	s_colindancia_text_3:string;
	s_colindancia_text_4:string;
	s_colindancia_num_1:number;
	s_colindancia_num_2:number;
	s_colindancia_num_3:number;
	s_colindancia_num_4:number;
  s_colindancia_usos: string;
	s_aviso_apertura:number;
}

export class ActualizarTramitePasoSextoRequest {
  s_id:number;
  s_cat_notarioarr:number;
  s_cat_modalidad:number;
}
export class EditarTramitePasoUnoRequest {
  s_id_us: number;
  s_id: number;
  s_cat_credo: number;
  s_cat_solicitud_escrito: number;
  s_cat_denominacion: number;
  s_numero_registro: number;
  s_pais_origen: number;
  s_domicilio: ActualizarDomicilioRequest;
  c_matriz: string;
}
export class ActualizarTramitePasoTresRequest {
  s_id_tramite: number;
  s_cat_sjuridica: number;
  s_f_apertura_id: number;
  s_f_apertura: string;
  s_domicilio: LecturaDomicilioRequest;
}
export class InsertarTramitePasoUnoResponse {
  mensaje: string;
  proceso_existoso: boolean;
  s_id: number;
  s_cat_credo: number;
  s_cat_solicitud_escrito: number;
  s_cat_denominacion: number;
  s_numero_registro: number;
  s_pais_origen: number;
}
export class ConsultaDetalleTramitePasoUnoResponse {
  s_id: number;
  s_cat_credo: number;
  s_cat_solicitud_escrito: number;
  s_cat_denominacion: string;
  s_numero_registro: string;
  s_pais_origen: number;
  d_id_domicilio: number;
  d_tipo_domicilio: number;
  d_numeroe: string;
  d_numeroi: string;
  d_colonia: number;
  d_calle: string;
  c_cpostal_n: string;
  c_matriz: string;
}
export class ConsultaDetalleTramitePasoTresResponse {
  s_id_tramite: number;
  s_cat_sjuridica: string;
  s_f_apertura_id: number;
  s_f_apertura: string;
  d_id_domicilio: number;
  d_tipo_domicilio: number;
  d_numeroe: string;
  d_numeroi: string;
  d_colonia: number;
  d_calle: string;
  c_cpostal_n: string;
}
export class FinalizarTramite {
  s_id_us:number;
  s_id:number;
}
