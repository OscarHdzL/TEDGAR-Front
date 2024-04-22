import { CatalogoMediosTrasmision } from "../../Catalogos/CatalogoMediosTransmision";

export class ActosReligiosos {   
    i_id_tbl_transmision?: number;
    i_id_acto?: number;
    c_nombre?: string;
    b_activo?: boolean;
    ruta?: string;
}

export class ActosReligiososRequest {
    i_id_tbl_transmision: number;
    i_id_acto: number;
    c_nombre: number;
    cat_Emisoras: Array<CatalogoMediosTrasmision>;
    cat_FechasHorario: Array<ActosFechasHorariosRequest>;
}

export class ActosFechasHorariosRequest {
    i_id_tbl_acto_religioso?: number; 
    c_fecha_inicio?: string;
    c_fecha_fin?: string;
    c_hora_inicio?: string;
    c_hora_fin?: string;
    i_id_cat_periodo?: number;
    cat_dia?: any;
    cat_mes?: any;
    cat_anio?: any;
}

export class EliminarFechasEmisorasRequest {
    id_tipo : number; 
    i_id_entidad : number;
}