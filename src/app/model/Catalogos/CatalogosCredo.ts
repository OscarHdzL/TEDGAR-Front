export class CatalogoCredoInsertRequest {
  nombre?: string;
  descripcion?: string;
  f_inic_vig?: string;
  f_fin_vig?: string;
}
export class CatalogoCredoInsertResponse {
  id?: number;
  proceso_exitoso: boolean;
  mensaje: string;
}
export class ConsultaListaCatalogoCredoResponse {
  c_id?: number;
  c_nombre_n: string;
  c_descripcion_n:string;
  c_f_inic_vig: String;
  c_f_fin_vig: String;
  c_activo: boolean;
}
export class BorraCatalagoCredoRequest {
  c_id: number;
  c_activo: boolean;
}
export class BorraCatalogoCredoResponse {
  id_catalogo: number;
  mensaje: string;
  proceso_exitoso: boolean;
}
export class EditarCatalogoCredoRequest {
  c_id: number;
  c_nombre_n: string;
  c_descripcion_n: string;
  c_f_inic_vig?: string;
  c_f_fin_vig?: string;
}
export class EditarCatalogoCredoResponse {
  id_catalogo: number;
  mensaje: string;
  proceso_exitoso: boolean;
}