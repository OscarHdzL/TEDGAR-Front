// const apiURL = 'https://localhost:44394/';
// const fileUrl = 'https://localhost:44394/';

//const apiURL = 'http://10.2.15.40:5005/';
//const fileUrl = 'http://10.2.15.40:5005/';

//const apiURL = 'https://apitramitesdgardev.segob.gob.mx/';
//const fileUrl = 'https://apitramitesdgardev.segob.gob.mx/';

const apiURL = 'https://apitramitesdgarqa.segob.gob.mx/';
const fileUrl = 'https://apitramitesdgarqa.segob.gob.mx/';

// const apiURL = 'https://apitramitesdgar.segob.gob.mx/';
// const fileUrl = 'https://apitramitesdgar.segob.gob.mx/';

export class ServiciosRutas {
  serviciosOperaciones = apiURL + 'TRAMITESDGAR/Operaciones';
  serviciosCatalogos =   apiURL + 'TRAMITESDGAR/Catalogos';
  fileUrl = fileUrl;
}
