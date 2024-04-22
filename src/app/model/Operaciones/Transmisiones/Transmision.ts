export class RangoFrecuenciaHorario {
    i_id?: number;
    c_fecha_inicio?: string;
    c_fecha_fin?: string;
    c_hora_inicio?: string;
    c_hora_fin?: string;
    i_id_cat_periodo?: number;
    c_periodo?: string;
    cat_dia?: Array<CatalogoFecha>;
    cat_mes?: Array<CatalogoFecha>;
    cat_anio?: Array<CatalogoFecha>;
}

export class CatalogoFecha{
    i_id: number;
    c_nombre: string;
}

export class DetalleTramiteTransmisionRequest {
    s_id_us?: number;
    i_id_tbl_transmision?: number
}

export class TramiteTransmisionResponse {
    c_us: number;
    i_id_tbl_transmision: number;
    numero_sgar: string;
    denominacion: string;
    numero_tel: string;
    correo_electronico: string;
    domicilio: string;
    rep_nombre_completo: string;
    b_identificacion: number;
    b_solicitudTrans: number;
    estatus: number;
}

export class TramiteTransmisionRequest {
    id_transmision: number;
    id_usuario: number;
    denominacion: string;
    numero_sgar: string;
    domicilio: string;
    numero_tel: string;
    correo_electronico: string;
    rep_nombre_completo: string;
}

export class ActualizarEstatusTransmisionRequest {
    i_id_transmision: number;
    i_id_estatus: number;
}

export class GenerarOficioTransmisionRequest {
    i_id_transmision: number;
}
