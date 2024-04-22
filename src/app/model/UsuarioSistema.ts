export class InsertarUsuarioSistemaRequest {
    nombre : string;
    apellido_p : string;
    apellido_m : string;
    correo_electronico : string;
    usuario : string;
    telefono_movil : string;
    contrasena : string;
    b_privacidad : boolean;
    id_ca_perfiles?: number;
    url: string;
}

export class InsertarUsuarioSistemaResponse {
    id_usuario: number;
    contrasena: string;
    mensaje: string;
    proceso_exitoso?: boolean;
}

export class ConsultaListaUsuariosSistemaRequest {
    id_ca_perfiles?: number;
}

export class ConsultaListaUsuariosSistemaResponse {
    id_usuario?: number;
    usuario : string;
    nombre : string;
    apellido_paterno : string;
    apellido_materno : string;
    nombre_perfil : string;
    estatus : number;
}

export class ConsultaDetalleUsuarioSistemaRequest {
    id_usuario?: number;
}

export class ConsultaDetalleUsuarioSistemaResponse {
    id_usuario?: number;
    id_contacto?: number;
    id_perfil?: number;
    usuario : string;
    correo_electronico : string;
    nombre : string;
    apellido_paterno : string;
    apellido_materno : string;
    telefono_movil : string;
    nombre_perfil : string;
}
// export class BorraUsuarioSistemaRequest {
//     id_usuario?: number;
//     estatus?: boolean;
// }

 export class BorraUsuarioSistemaResponse {
     id_usuario?: number;
     mensaje : string;
     proceso_exitoso? : boolean;
}


export class ActualizarUsuarioSistemaRequest {
  id: string;
  nombre: string;
  apellido_p: string;
  apellido_m: string;
  correo_electronico: string;
  telefono_movil: string;
  contrasena: string;
  b_privacidad: boolean;
  id_ca_perfiles?: number;
  url: string;
}

export class ActualizarUsuarioSistemaResponse {
  id_usuario: number;
  contrasena: string;
  mensaje: string;
  proceso_exitoso?: boolean;
}
