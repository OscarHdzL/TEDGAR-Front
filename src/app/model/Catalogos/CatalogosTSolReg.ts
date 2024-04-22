export class CatalogoTSolRegInsertRequest {
  nombre?: string;
  descripcion?: string;
  f_inic_vig?: string;
  f_fin_vig?: string;
}
export class CatalogoTSolRegInsertResponse {
  id?: number;
  proceso_exitoso: boolean;
  mensaje: string;
}
export class ConsultaListaCatalogoTSolRegResponse {
  c_id?: number;
  c_nombre_n: string;
  c_descripcion_n:string;
  c_f_inic_vig: String;
  c_f_fin_vig: String;
  c_activo: boolean;
}
export class BorraCatalagoTSolRegRequest {
  c_id: number;
  c_activo: boolean;
}
export class BorraCatalogoTSolRegResponse {
  id_catalogo: number;
  mensaje: string;
  proceso_exitoso: boolean;
}
export class EditarCatalogoTSolRegRequest {
  c_id: number;
  c_nombre_n: string;
  c_descripcion_n: string;
  c_f_inic_vig?: string;
  c_f_fin_vig?: string;
}
export class EditarCatalogoTSolRegResponse {
  id_catalogo: number;
  mensaje: string;
  proceso_exitoso: boolean;
}