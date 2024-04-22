export class CatalogoAvisoAperturaInsertRequest {
  nombre?: string;
  descripcion?: string;
  f_inic_vig?: string;
  f_fin_vig?: string;
}
export class CatalogoAvisoAperturaInsertResponse {
  id?: number;
  proceso_exitoso: boolean;
  mensaje: string;
}
export class ConsultaListaCatalogoAvisoAperturaResponse {
  c_id?: number;
  c_nombre_n: string;
  c_descripcion_n:string;
  c_f_inic_vig: String;
  c_f_fin_vig: String;
  c_activo: boolean;
}
export class BorraCatalagoAvisoAperturaRequest {
  c_id: number;
  c_activo: boolean;
}
export class BorraCatalogoAvisoAperturaResponse {
  id_catalogo: number;
  mensaje: string;
  proceso_exitoso: boolean;
}
export class EditarCatalogoAvisoAperturaRequest {
  c_id: number;
  c_nombre_n: string;
  c_descripcion_n: string;
  c_f_inic_vig?: string;
  c_f_fin_vig?: string;
}
export class EditarCatalogoAvisoAperturaResponse {
  id_catalogo: number;
  mensaje: string;
  proceso_exitoso: boolean;
}