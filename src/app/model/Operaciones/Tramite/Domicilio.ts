export class InsertarDomicilioRequest {
  d_tipo_domicilio: string;
  d_numeroe: string;
  d_numeroi: string;
  d_colonia: number;
  d_ciudad: string;
  d_calle: string;
}

export class ActualizarDomicilioRequest {
  d_id_domicilio: number;
  d_tipo_domicilio: number;
  d_numeroe: string;
  d_numeroi: string;
  d_colonia: number;
  d_ciudad: string;
  d_calle: string;
  d_cpostal: string;

}
export class LecturaDomicilioRequest {
  d_id_domicilio: number;
  d_tipo_domicilio: number;
  d_numeroe: string;
  d_numeroi: string;
  d_colonia: number;
  d_ciudad: string;
  d_calle: string;
  d_cpostal: string;
}
