export class CatalogoPaisoInsertRequest {
  nombre?: string;
  descripcion?: string;
  f_inic_vig?: string;
  f_fin_vig?: string;
}
export class CatalogoPaisoInsertResponse {
  id?: number;
  proceso_exitoso: boolean;
  mensaje: string;
}
export class ConsultaListaCatalogoPaisoResponse {
  c_id?: number;
  c_nombre_n: string;
  c_descripcion_n:string;
  c_f_inic_vig: String;
  c_f_fin_vig: String;
  c_activo: boolean;
}
export class BorraCatalagoPaisoRequest {
  c_id: number;
  c_activo: boolean;
}
export class BorraCatalogoPaisoResponse {
  id_catalogo: number;
  mensaje: string;
  proceso_exitoso: boolean;
}
export class EditarCatalogoPaisoRequest {
  c_id: number;
  c_nombre_n: string;
  c_descripcion_n: string;
  c_f_inic_vig?: string;
  c_f_fin_vig?: string;
}
export class EditarCatalogoPaisoResponse {
  id_catalogo: number;
  mensaje: string;
  proceso_exitoso: boolean;
}