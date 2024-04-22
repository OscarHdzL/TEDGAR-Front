export class ReporteTransmisionEstatusResponse{
    estatus_id: number;
    estatus_nombre: string;
    estatus_transmision: boolean;
}

export class ReporteTransmisionMedioResponse{
    medio_nombre: string;
}

export class ReporteTransmisionDatosResponse{
    transmision_id: number;
    transmision_domicilio: string;
    transmision_correo_electronico: string;
    transmision_numero_tel: string;
    transmision_fecha_solicitud: Date;
    acto_religioso_id: number;
    acto_religioso_nombre: string;
    medio_frecuencia_canal: string;
    medio_proveedor: string;
    medio_tel_radio: string;
    medio_b_televisora: boolean;
    acto_fecha_inicio: Date;
    acto_fecha_fin: Date;
    registro_nregistro: string;
    registro_denominacion: string;
    estatus_nombre: string;
    representante_nombre_completo: string;
    transmision_no_oficio: string;
    transmision_fecha_autorizacion: Date;
    no_transmisiones: number;
    no_dias: number;
    horarios_transmision: number;
    n_medios_transmision: number;
    total_transmisiones: number;
}
