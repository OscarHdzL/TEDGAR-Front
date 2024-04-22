export class CatalogoColoniaInsertRequest {
  c_nombre_n: string;
  id_municipio:number;
  c_descripcion_n:string;
  c_cpostal_n:string;
  c_f_inic_vig: string;
  c_f_fin_vig: string;
  c_activo: boolean;
}
export class CatalogoColoniaInsertResponse {
  id?: number;
  proceso_exitoso: boolean;
  mensaje: string;
}
export class ConsultaListaCatalogoColoniaResponse {
  c_id?: number;
  c_nombre_n: string;
  c_descripcion_n:string;
  c_f_inic_vig: string;
  c_f_fin_vig: string;
  c_cpostal_n: string;
  id_municipio?: number;
  id_estado?: number;

  estado: string;
  municipio: string;
  c_activo: boolean;
}
export class BorraCatalagoColoniaRequest {
  c_id: number;
  c_activo: boolean;
}
export class BorraCatalogoColoniaResponse {
  id_catalogo: number;
  mensaje: string;
  proceso_exitoso: boolean;
}
export class EditarCatalogoColoniaRequest {
  c_id?: number;
  id_municipio:number;
  c_nombre_n: string;
  c_descripcion_n:string;
  c_cpostal_n:string;
  c_f_inic_vig: string;
  c_f_fin_vig: string;
}
export class EditarCatalogoColoniaResponse {
  id_catalogo: number;
  mensaje: string;
  proceso_exitoso: boolean;
}