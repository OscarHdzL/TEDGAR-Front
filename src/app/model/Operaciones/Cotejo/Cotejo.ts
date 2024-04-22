export class ActualizarCotejoRequest {
  s_us_id: number;
  s_id: number;
  cotejo_tipo: number;
  s_estatus: number;
  s_comentarios: number;
  s_fecha: string;
  s_direccion: string;
  s_horario: string;
  s_numero_registro: string;
  s_noficio_entrada: string;
  s_noficio_salida: string;
}

export class CotejoDetallePublico{
 s_id:number;
 s_tipo_cotejo:number;
 s_fecha:string;
 s_comentarios:string;
 s_cotejo_v:boolean;
 s_direccion:string;
 s_cotejo_f:boolean;
 s_comentario_f:string;
 s_cotejo_r:boolean;
 s_comentario_r:string;
 s_cotejo_c:boolean;
 s_comentario_c:string;
 s_doc1:boolean;
 s_doc2:boolean;
 usuario: string;
}


export class CotejoDetallePublicoTransmision{
  s_id_tramite:number;
  s_estatus:number;
  s_fecha:string;
  s_direccion:string;
  s_comentarios:string;
  usuario: string;
 }