export interface CatalogoEmisoraInsertRequest {
    frecuencia_canal: string;
    proveedor: string;
    televisora_radiodifusora: string;
    lugar_transmision: number;
    televisora: boolean;
}
  
  export interface CatalogoEmisoraInsertResponse {
    id?: number;
    proceso_exitoso: boolean;
    mensaje: string;
  }

  export interface ConsultaListaCatalogoEmisoraResponse {
      id: number;
      frecuencia_canal: number;
      proveedor: string;
      televisora_radiodifusora: string;
      lugar_transmision: number;
      lb_lugar_transmision: string;
      televisora: boolean;
      tipo_operacion: number;
      activo: number;
  }

  export interface BorraCatalagoEmisoraRequest {
    id: number;
    activo: number;
  }

  export interface BorraCatalogoEmisoraResponse {
    id_catalogo: number;
    mensaje: string;
    proceso_exitoso: boolean;
  }
  
  export interface EditarCatalogoEmisoraRequest {
    id: number;
    frecuencia_canal: string;
    proveedor: string;
    televisora_radiodifusora: string;
    lugar_transmision: number;
    televisora: number;
  }
  
  export interface EditarCatalogoEmisoraResponse {
    id_catalogo: number;
    mensaje: string;
    proceso_exitoso: boolean;
  }