export class CatalogoMunicipio {
    idMunicipio?: number;
    clave?: number;
    descripcion?: string;
    codigodeError?: number;
}
export class ConsultaListaCatalogoMunicipioResponse {
    c_id?: number;
    c_i_id_tbl_estado?: number;
    c_nombre_n: string;
    c_descripcion_n:string;
    c_f_inic_vig: String;
    c_f_fin_vig: String;
    c_activo: boolean;
  }