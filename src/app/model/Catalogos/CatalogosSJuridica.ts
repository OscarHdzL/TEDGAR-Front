export class CatalogoSJuridicaInsertRequest {
  nombre?: string;
  descripcion?: string;
  f_inic_vig?: string;
  f_fin_vig?: string;
}
export class CatalogoSJuridicaInsertResponse {
  id?: number;
  proceso_exitoso: boolean;
  mensaje: string;
}
export class ConsultaListaCatalogoSJuridicaResponse {
  c_id: number;
  c_nombre: string;
  c_descripcion: string;
  c_f_inic_vig: string;
  c_f_fin_vig: string;
  c_activo: boolean;
}
export class BorraCatalagoSJuridicaRequest {
  c_id: number;
  c_activo: boolean;
}
export class BorraCatalogoSJuridicaResponse {
  id_catalogo: number;
  mensaje: string;
  proceso_exitoso: boolean;
}
export class ActualizarCatalogoSJuridicaRequest {
  c_id: number;
  c_nombre: string;
  c_descripcion: string;
  c_f_inic_vig: string;
  c_f_fin_vig: string;
}
export class EditarCatalogoSJuridicaResponse {
  id_catalogo: number;
  mensaje: string;
  proceso_exitoso: boolean;
}