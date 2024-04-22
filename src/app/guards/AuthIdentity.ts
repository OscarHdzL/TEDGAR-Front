import { JwtHelperService } from "@auth0/angular-jwt";

// Clase encarga de retornar el usuario actual en sesion
export class AuthIdentity {
  //#region Métodos publicos
  public static ObtenerUsuarioSesion(): any {
    const helper = new JwtHelperService();
    const informacionToken = helper.decodeToken(localStorage.getItem("jwt"));
    const usuario = informacionToken.UserData;
    if (usuario.length > 0) {
      return JSON.parse(usuario);
    } else {
      return null;
    }
  }

  public static ObtenerUsuarioRegistro(): any {
    const helper = new JwtHelperService();
    const informacionToken = helper.decodeToken(localStorage.getItem("jwt"));
    if (informacionToken != null && informacionToken != undefined) {
      var datosUsuarioJson = JSON.parse(informacionToken.UserData);

      return datosUsuarioJson.IdUsuario;
    } else {
      return null;
    }
  }



  public static IsDictaminador(): boolean {
    const helper = new JwtHelperService();
    const informacionToken = helper.decodeToken(localStorage.getItem("jwt"));
    if (informacionToken != null && informacionToken != undefined) {
      var datosUsuarioJson = JSON.parse(informacionToken.UserData);
      if (datosUsuarioJson.IdPerfil === 4 || datosUsuarioJson.IdPerfil === 9 || datosUsuarioJson.IdPerfil === 10) return true;
      else return false;
    } else {
      return false;
    }
  }

  public static IsAsignador(): boolean{
    const helper = new JwtHelperService();
    const informacionToken = helper.decodeToken(localStorage.getItem("jwt"));
    if (informacionToken != null && informacionToken != undefined) {
      var datosUsuarioJson = JSON.parse(informacionToken.UserData);
      if (datosUsuarioJson.IdPerfil === 5 || datosUsuarioJson.IdPerfil === 7 || datosUsuarioJson.IdPerfil === 8) return true;
      else return false;
    } else {
      return false;
    }
  }

  public static IsAsignadorTN(): boolean{
    const helper = new JwtHelperService();
    const informacionToken = helper.decodeToken(localStorage.getItem("jwt"));
    if (informacionToken != null && informacionToken != undefined) {
      var datosUsuarioJson = JSON.parse(informacionToken.UserData);
      if (datosUsuarioJson.IdPerfil === 8) return true;
      else return false;
    } else {
      return false;
    }
  }

  public static IsUsuarioPublico(): boolean {
    const helper = new JwtHelperService();
    const informacionToken = helper.decodeToken(localStorage.getItem("jwt"));
    if (informacionToken != null && informacionToken != undefined) {
      var datosUsuarioJson = JSON.parse(informacionToken.UserData);
      if (datosUsuarioJson.IdPerfil === 1) return true;
      else return false;
    } else {
      return false;
    }
  }
  public static GetBannerSession(): any {
    const helper = new JwtHelperService();
    const informacionToken = helper.decodeToken(localStorage.getItem("jwt"));
    if (informacionToken != null && informacionToken != undefined) {
      var datosUsuarioJson = JSON.parse(informacionToken.UserData);
      let banner =
        datosUsuarioJson.Nombre +
        " " +
        datosUsuarioJson.ApPaterno;
      if (datosUsuarioJson.IdPerfil) {
        switch (datosUsuarioJson.IdPerfil) {
          case 1:
            banner += " | " + "Público";
            break;
          case 4:
            banner += " | " + "Dictaminador";
            break;
          case 5:
            banner += " | " + "Asignador de transmisiones";
            break;
          case 6:
            banner += " | " + "Administrador";
            break;
          case 7:
            banner += " | " + "Asignador de registros";
            break;
          case 8:
            banner += " | " + "Asignador de toma de nota";
            break;
          case 9:
            banner += " | " + "Dictaminador de toma de nota";
            break;
          case 10:
            banner += " | " + "Dictaminador de transmisiones";
            break;
        }
      }
      return banner;
    } else {
      return null;
    }
  }

  public static ObtenerUsuarioContactoRegistro(): any {
    const helper = new JwtHelperService();
    const informacionToken = helper.decodeToken(localStorage.getItem("jwt"));
    const usuario = informacionToken.UserData;
    if (usuario.length > 0) {
      var usuarioJson = JSON.parse(usuario);
      return usuarioJson.IdContacto;
    } else {
      return null;
    }
  }

  public static ObtenerPerfilUsuarioSesion(): any {
    const helper = new JwtHelperService();
    const informacionToken = helper.decodeToken(localStorage.getItem("jwt"));
    const usuario = informacionToken.UserData;
    if (usuario.length > 0) {
      var datosUsuarioJson = JSON.parse(usuario);
      return JSON.parse(datosUsuarioJson.IdPerfil);
    } else {
      return null;
    }
  }
  //#endregion
}
