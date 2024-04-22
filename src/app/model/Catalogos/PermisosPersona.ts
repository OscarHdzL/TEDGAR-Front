export class PermisoPersonaRequest {
  idUsuario?: number;
}
export class PermisoPersonaResponse {
  idTramite?: number;
  idEstatusTramite?: number;
  bndRegistro: boolean;
  bndConsultaR: boolean;
  bndTomaNota: boolean;
  bndConsultaTN: boolean;
}

