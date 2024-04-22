export interface CatalogoDirectorInsertRequest {
    director_nombre: string;
    director_apaterno: string;
    director_amaterno: string;
    director_titulo: string;
    director_cargo: string
  }
  
  export interface CatalogoDirectorInsertResponse {
    id?: number;
    proceso_exitoso: boolean;
    mensaje: string;
  }

  export interface ConsultaListaCatalogoDirectorResponse {
    director_id: number;
    director_nombre: string;
    director_apaterno: string;
    director_amaterno: string;
    director_titulo: string;
    director_cargo: string;
    director_activo: boolean
  }

  export interface BorraCatalagoDirectorRequest {
    director_id: number;
    director_activo: boolean;
  }

  export interface BorraCatalogoDirectorResponse {
    id_catalogo: number;
    mensaje: string;
    proceso_exitoso: boolean;
  }
  
  export interface EditarCatalogoDirectorRequest {
    director_id: number;
    director_nombre: string;
    director_apaterno: string;
    director_amaterno: string;
    director_titulo: string;
    director_cargo: string
  }
  
  export interface EditarCatalogoDirectorResponse {
    id_catalogo: number;
    mensaje: string;
    proceso_exitoso: boolean;
  }