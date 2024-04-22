export class AsignacionRegistroRequest{
    s_id:number;
    us_dictaminador_id:number;
    us_asigna_id:number;
}

export class ModeloWordToPdf {
    tipo?: number;
    data: string;

    //#region Constructor
    constructor(tipoArchivo: number, datos: string) {
        this.tipo = tipoArchivo;
        this.data = datos;
    }
    //#endregion
}