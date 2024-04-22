export class CatalogoConstanciaNotarioArraigoInsertRequest {
  nombre?: string;
  descripcion?: string;
  f_inic_vig?: string;
  f_fin_vig?: string;
  i_tipo_escrito: string;
}
export class CatalogoConstanciaNotarioArraigoInsertResponse {
  id?: number;
  proceso_exitoso: boolean;
  mensaje: string;
}
export class ConsultaListaCatalogoConstanciaNotarioArraigoResponse {
  c_id?: number;
  c_nombre_n: string;
  c_descripcion_n: string;
  c_f_inic_vig: String;
  c_f_fin_vig: String;
  c_activo: boolean;
  tipo_escrito?: String; 
}
export class BorraCatalagoConstanciaNotarioArraigoRequest {
  c_id: number;
  c_activo: boolean;
}
export class BorraCatalogoConstanciaNotarioArraigoResponse {
  id_catalogo: number;
  mensaje: string;
  proceso_exitoso: boolean;
}
export class EditarCatalogoConstanciaNotarioArraigoRequest {
  c_id: number;
  c_nombre_n?: string;
  c_descripcion_n?: string;
  c_f_inic_vig?: string;
  c_f_fin_vig?: string;
  tipo_escrito: string;
}
export class EditarCatalogoConstanciaNotarioArraigoResponse {
  id_catalogo: number;
  mensaje: string;
  proceso_exitoso: boolean;
}
