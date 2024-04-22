import { AuthIdentity } from "src/app/guards/AuthIdentity";
import { route } from "./route";

// Clase encarga de retornar el usuario actual en sesion
export class TramiteRoutes {
  //#region Métodos publicos
  public static GetRoutesByRol(page: number): route[] {
    let routes: route[] = [];
    let publico: boolean = AuthIdentity.IsUsuarioPublico();
    let asignador: boolean = AuthIdentity.IsAsignador();
    let dictaminador: boolean = AuthIdentity.IsDictaminador();

    if (publico) {
      routes = [
        {
          id: 1,
          text: "Paso 1",
          active: false,
          link: "/solicitudregistro"
        },
        {
          id: 2,
          text: "Paso 2",
          active: false,
          link: "/solicitudescrito/domiciliolegal",
        },
        {
          id: 3,
          text: "Paso 3",
          active: false,
          link: "/solicitudescrito/relacioninmueble",
        },
        {
          id: 4,
          text: "Paso 4",
          active: false,
          link: "/solicitudescrito/especificacionesterreno",
        },
        {
          id: 5,
          text: "Paso 5",
          active: false,
          link: "/solicitudescrito/representantes",
        },
        {
          id: 6,
          text: "Paso 6",
          active: false,
          link: "/solicitudescrito/constancianotario",
        },
      ];
      try {
        routes.find((c) => c.id === page).active = true;
      } catch (error) { }
    } else if (dictaminador) {
      if (asignador) {
        routes = [
          { id: 1, text: "1", active: false, link: "/solicitudregistro" },
          {
            id: 2,
            text: "2",
            active: false,
            link: "/solicitudescrito/domiciliolegal",
          },
          {
            id: 3,
            text: "3",
            active: false,
            link: "/solicitudescrito/relacioninmueble",
          },
          {
            id: 4,
            text: "4",
            active: false,
            link: "/solicitudescrito/especificacionesterreno",
          },
          {
            id: 5,
            text: "5",
            active: false,
            link: "/solicitudescrito/representantes",
          },
          {
            id: 6,
            text: "6",
            active: false,
            link: "/solicitudescrito/constancianotario",
          }
        ];

      } else {

        routes = [
          { id: 1, text: "1", active: false, link: "/solicitudregistro" },
          {
            id: 2,
            text: "2",
            active: false,
            link: "/solicitudescrito/domiciliolegal",
          },
          {
            id: 3,
            text: "3",
            active: false,
            link: "/solicitudescrito/relacioninmueble",
          },
          {
            id: 4,
            text: "4",
            active: false,
            link: "/solicitudescrito/especificacionesterreno",
          },
          {
            id: 5,
            text: "5",
            active: false,
            link: "/solicitudescrito/representantes",
          },
          {
            id: 6,
            text: "6",
            active: false,
            link: "/solicitudescrito/constancianotario",
          }, {
            id: 7,
            text: "7",
            active: false,
            link: "/atencion/validardocumentacion",
          }, {
            id: 8,
            text: "8",
            active: false,
            link: "atencion/validardocumentacionfisica",
          }, {
            id: 9,
            text: "9",
            active: false,
            link: "atencion/finalizacion-cotejo",
          }, {
            id: 10,
            text: "10",
            active: false,
            link: "atencion/registro-concluido",
          },
        ];
      }
      try {
        routes.find((c) => c.id === page).active = true;
      } catch (error) { }

    }

    return routes;
  }
}
