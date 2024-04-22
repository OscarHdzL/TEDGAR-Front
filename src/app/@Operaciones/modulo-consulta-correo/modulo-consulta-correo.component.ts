import { Component, OnInit } from "@angular/core";
import {
  FormGroup,
  FormControl,
  FormBuilder,
  Validators,
} from "@angular/forms";
import { RespuestaGenerica } from "src/app/model/Operaciones/generales/RespuestaGenerica";
import { ServiciosRutas } from "src/app/model/Operaciones/generales/ServiciosRutas";
import { ServiceGenerico } from "src/app/services/service-generico.service";

@Component({
  selector: "app-modulo-consulta-correo",
  templateUrl: "./modulo-consulta-correo.component.html",
  styleUrls: ["./modulo-consulta-correo.component.css"],
  providers: [ServiceGenerico],
})
export class ModuloConsultaCorreoComponent implements OnInit {
  public formVeriCorreo: FormGroup;
  public operacionRespuesta: RespuestaGenerica;
  public solisitudExito: boolean;
  private servicios: ServiciosRutas;

  constructor(private services: ServiceGenerico, private form: FormBuilder) {
    this.operacionRespuesta = new RespuestaGenerica();
    this.servicios = new ServiciosRutas();
    this.initControlForm();
  }

  ngOnInit(): void {}

  //#region Métodos publicos
  public EnviarCorreoContrasena(): void {
    this.operacionRespuesta.EsMsjError = false;
    if (this.esValidoElFormulario()) {
      this.operacionRespuesta.EstaEjecutando = true;
      const params = {
        Correo: this.formVeriCorreo.get("Correo").value,
        Url: location.origin + "/recuperar-contrasena",
      };
      this.services
        .HttpPost(
          params,
          `${this.servicios.serviciosOperaciones}/RecuperarContrasena/ComprobarCorreo`
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
            this.operacionRespuesta.EsMsjError = false;
            this.operacionRespuesta.Msj = error.response[0];
          }
        );
    } else {
    }
  }
  //#endregion

  //#region Métodos privados
  private initControlForm(): void {
    this.formVeriCorreo = this.form.group({
      Correo: ["", Validators.compose([Validators.required, Validators.email])],
    });
  }

  private esValidoElFormulario(): boolean {
    if (!this.formVeriCorreo.get("Correo").valid) {
      this.operacionRespuesta.EsMsjError = true;

      if (!this.formVeriCorreo.get("Correo").valid) {
        this.operacionRespuesta.Msj = "El formato de correo es invalido";
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
  //#endregion
}
