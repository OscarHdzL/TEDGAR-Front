export class RespuestaGenerica {

    EstaEjecutando: boolean;
    EsMsjError: boolean;
    Msj: string;
    EsMsExitoso: boolean;
    /**
     *Constructor base de la respuesta generica
     */
    constructor() {
        this.EstaEjecutando = false;
        this.EsMsjError = false;
        this.Msj = "";
        this.EsMsExitoso = false;
    }
}