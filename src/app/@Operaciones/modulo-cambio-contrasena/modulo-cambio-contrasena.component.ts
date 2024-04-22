import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
} from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { AuthIdentity } from "src/app/guards/AuthIdentity";
import { RespuestaGenerica } from "src/app/model/Operaciones/generales/RespuestaGenerica";
import { ServiciosRutas } from "src/app/model/Operaciones/generales/ServiciosRutas";
import { ServiceGenerico } from "src/app/services/service-generico.service";

@Component({
  selector: "app-modulo-cambio-contrasena",
  templateUrl: "./modulo-cambio-contrasena.component.html",
  styleUrls: ["./modulo-cambio-contrasena.component.css"],
  providers: [ServiceGenerico],
})
export class ModuloCambioContrasenaComponent implements OnInit {
  public formVeriCorreo: FormGroup;
  public operacionRespuesta: RespuestaGenerica;
  public solisitudExito: boolean;
  private servicios: ServiciosRutas;
  public btnVisible: boolean;
  public mesCorrecto: boolean;
  public contraValida: boolean;
  public editableContra: boolean;
  public idUsuario: number;
  public tokenContra: string;

  controltype ="password";

  showpass=false;

  constructor(
    private _route: ActivatedRoute,
    private services: ServiceGenerico,
    private form: FormBuilder
  ) {
    this.tokenContra = this._route.snapshot.paramMap.get("token");
    this.operacionRespuesta = new RespuestaGenerica();
    this.servicios = new ServiciosRutas();
    this.initControlForm();
  }

  ngOnInit(): void {
    if (this.tokenContra == null) {
      var usuarioActual = AuthIdentity.ObtenerUsuarioSesion();
      this.idUsuario = usuarioActual.IdUsuario;
    }
  }

  //#region Métodos publicos
  public EnviarCorreoContrasena(): void {
    this.operacionRespuesta.EsMsjError = false;

    if (this.esValidoElFormulario()) {
      this.operacionRespuesta.EstaEjecutando = true;
      const params = {
        contraUsuario: this.formVeriCorreo.get("Contrasena").value,
        tokenContrasena: this.tokenContra,
        idUsuario: this.idUsuario,
        url: location.origin + "/iniciar-sesion",
      };
      this.services
        .HttpPost(
          params,
          `${this.servicios.serviciosOperaciones}/RecuperarContrasena/CambiarContrasena`
        )
        .subscribe(
          (response: any) => {
            this.operacionRespuesta.EstaEjecutando = false;

            if (response.response.length > 0) {
              this.solisitudExito = true;
            }
            if (response.mensaje != null) {
              this.operacionRespuesta.EsMsjError = true;
              this.operacionRespuesta.Msj = response.mensaje;
            }
          },
          (error) => {
            this.operacionRespuesta.EstaEjecutando = false;
            this.operacionRespuesta.EsMsjError = true;
            this.operacionRespuesta.Msj = error.error;
          }
        );
    } else {
    }
  }
  //#endregion

  //#region Métodos privados
  private initControlForm(): void {
    this.formVeriCorreo = this.form.group({
      //Contrasena: ['',  Validators.compose([Validators.required, Validators.email])]
      Contrasena: [
        "",
        Validators.compose([
          Validators.required,
          Validators.pattern(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[{};:=<>_+^#$@!¡%*?&/(),.|°¬¨´¿'-])[A-Za-z\d[\]{};:=<>_+^#$@!¡%*?&/(),.|°¬¨´¿'-]{8,30}/),
          Validators.maxLength(16),
        ]),
      ],
      contraseniaConfirma: [
        "",
        Validators.compose([
          Validators.required,
          Validators.pattern(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[{};:=<>_+^#$@!¡%*?&/(),.|°¬¨´¿'-])[A-Za-z\d[\]{};:=<>_+^#$@!¡%*?&/(),.|°¬¨´¿'-]{8,30}/),
          Validators.minLength(8),
        ]),
      ],
    });
  }

  private validacionContrasenias(
    Contrasena: string,
    contraseniaConfirma: string
  ): any {
    return (formGroup: FormGroup) => {
      const contraseniaControl = formGroup.controls[Contrasena];
      const confirmaControl = formGroup.controls[contraseniaConfirma];

      if (!contraseniaControl || !confirmaControl) {
        return null;
      }

      if (!contraseniaControl.errors && !confirmaControl.errors.noEsIgual) {
        return null;
      }

      if (contraseniaControl.value !== confirmaControl.value) {
        confirmaControl.setErrors({ noEsIgual: true });
      } else {
        confirmaControl.setErrors(null);
      }
    };
  }

  private esValidoElFormulario(): boolean {
    if (!this.formVeriCorreo.get("Contrasena").valid) {
      this.operacionRespuesta.EsMsjError = true;

      if (!this.formVeriCorreo.get("Contrasena").valid) {
        this.operacionRespuesta.Msj = "La contraseña es incorrecta";
        return false;
      }
    }
    return true;
  }

  public ocultarAlerta(event): void {
    this.operacionRespuesta.EsMsjError = false;

    if (event.key === "Enter") {
      this.EnviarCorreoContrasena();
    }
  }

  public formatocorreoValido(): void {
    this.btnVisible = false;

    if (!this.formVeriCorreo.get("Contrasena").valid) {
      this.contraValida = true;
      this.editableContra = false;
      this.formVeriCorreo.setValue({
        Contrasena: [this.formVeriCorreo.get("Contrasena").value],
        contraseniaConfirma: [""],
      });
      this.mesCorrecto = false;
    }
    if (this.formVeriCorreo.get("Contrasena").valid) {
      if (this.formVeriCorreo.get("contraseniaConfirma").value != "") {
        this.confirmarContrasena();
      }
      this.contraValida = false;
      this.editableContra = true;
    }
  }
  public confirmarContrasena(): void {
    if (
      this.formVeriCorreo.get("Contrasena").value ==
      this.formVeriCorreo.get("contraseniaConfirma").value
    ) {
      this.mesCorrecto = false;
      this.btnVisible = true;
    }
    if (
      this.formVeriCorreo.get("Contrasena").value !=
      this.formVeriCorreo.get("contraseniaConfirma").value
    ) {
      this.mesCorrecto = true;
      this.btnVisible = false;
    }
  }

  public showPass() {
    if (this.controltype === "password") {
      this.controltype="text";
      this.showpass=true;
    } else {
     this.controltype= "password";
     this.showpass=false;
    }
  }

  //#endregion
}
