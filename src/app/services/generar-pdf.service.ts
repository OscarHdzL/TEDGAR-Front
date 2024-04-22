import { header } from '../../assets/plantilla/header.const';
import { footer } from '../../assets/plantilla/footer.const';

export class GenerarOficio {

    public create(infoOficio, infoTransmision, lstActos, lstActosMedios, lstActosFechasRangos, lstActosFechasFrecuencia, num_transmisiones): any {

        const dataPrincipal = () => {
            const actosArray = [];
            lstActos.map(acto => {
                actosArray.push([
                    " ",
                    this.createEncabezadoText("Acto religioso"),
                    acto.c_nombre,
                    " ",
                    this.createColumnasEncabezado()
                ]);
                lstActosFechasRangos.map(fecha => {
                    if (acto.i_id_acto === fecha.i_id_acto) {
                        actosArray.push([
                            this.createColumnas(
                                fecha.c_fecha_inicio + (fecha.c_fecha_fin !== null ? ' - ' + fecha.c_fecha_fin : ''),
                                fecha.c_hora_inicio + (fecha.c_hora_fin !== null ? ' a ' + fecha.c_hora_fin : '')
                            )
                        ]);
                    }

                });

                lstActosFechasFrecuencia.map(frec => {
                    let _dia = '';
                    let _mes = '';
                    let _anio = '';
                    if (acto.i_id_acto === frec.i_id_acto) {

                        frec.cat_dia.map(dia => {
                            _dia = _dia + dia.c_nombre + ' '
                        });
                        frec.cat_mes.map(mes => {
                            _mes = _mes + mes.c_nombre + ' '
                        });
                        frec.cat_anio.map(anio => {
                            _anio = _anio + anio.c_nombre + ' '
                        });

                        actosArray.push([
                            this.createColumnas(
                                (frec.c_periodo !== null ? frec.c_periodo + ' ' : '') +
                                (_dia !== null ? _dia + ' ' : '') +
                                (_mes !== null ? _mes + ' ' : '') +
                                (_anio !== null ? _anio + ' ' : '') ,
                                (frec.c_hora_inicio !== null ? frec.c_hora_inicio + ' ' : '') +
                                (frec.c_hora_fin !== null ? 'a ' + frec.c_hora_fin : '')
                            )
                        ])
                    }

                });

                var headers = {
                    fila_0: {
                        col_1: { text: '#', style: 'tableHeader', alignment: 'center', margin: [0, 8, 0, 0], bold: true },
                        col_2: { text: 'Frecuencia/Canal', style: 'tableHeader', alignment: 'center', margin: [0, 8, 0, 0], bold: true },
                        col_3: { text: 'Proveedor de Servicio', style: 'tableHeader', alignment: 'center', margin: [0, 8, 0, 0], bold: true },
                        col_4: { text: 'Televisora/Radiodifusora', style: 'tableHeader', alignment: 'center', margin: [0, 8, 0, 0], bold: true },
                        col_5: { text: 'Lugar de Transmisión', style: 'tableHeader', alignment: 'center', margin: [0, 8, 0, 0], bold: true }
                    },
                };

                var body = [];

                for (var key in headers) {
                    if (headers.hasOwnProperty(key)) {
                        var header = headers[key];
                        var row = new Array();
                        row.push(header.col_1);
                        row.push(header.col_2);
                        row.push(header.col_3);
                        row.push(header.col_4);
                        row.push(header.col_5);
                        body.push(row);
                    }
                }

                var i = 1;
                lstActosMedios.map((emisora) => {
                    var row = new Array();
                    if (acto.i_id_acto === emisora.i_id_acto) {
                        row.push(i);
                        row.push(emisora.frecuencia_canal);
                        row.push(emisora.proveedor);
                        row.push(emisora.televisora_radiodifusora);
                        row.push(emisora.lugar_transmision);
                        body.push(row);
                        i++;
                    }

                });

                actosArray.push([
                    " ",
                    this.createEncabezadoText("Medios de Transmisión"),
                    this.createTablaEmisoras(body),
                    " ",
                ]);

            });
            return actosArray;
        };

        const dataActos = dataPrincipal();

        var date = new Date(), locale = 'es-mx', month = date.toLocaleString(locale, { month: 'long' });

        let asignador = infoOficio.nombre_asignador.split(' ');
        let dictaminador = infoOficio.nombre_dictaminador.split(' ');
        let iniciales = '';
        asignador.map(asig => {
            iniciales = iniciales + asig.substring(0, 1);
        });
        iniciales = iniciales + '/'
        dictaminador.map(dic => {
            iniciales = iniciales + dic.substring(0, 1);
        });

        let documento: any = {
            defaultStyle: {
                fontSize: 10,
                font: 'Montserrat'
            },
            pageMargins: [50, 85, 50, 85],
            header: [{
                image: 'data:image/png;base64,' + header,
                width: 520,
                height: 80,
                alignment: 'center'
            }],
            footer: [{
                image: 'data:image/png;base64,' + footer,
                width: 500,
                height: 80,
                alignment: 'center'
            },
            function (currentPage, pageCount) {
                return [
                    { text: currentPage.toString() + ' de ' + pageCount, alignment: 'right' }
                ]
            }
            ],
            content: [
                { text: 'Secretaría de Gobernación', alignment: 'right', bold: true, fontSize: 9 },
                { text: 'Subsecretaría de Desarrollo Democrático, Participación Social y Asuntos Religiosos', alignment: 'right', bold: true, fontSize: 9 },
                { text: 'Unidad de Asuntos Religiosos, Prevensión y la Reconstrucción del tejido Social', alignment: 'right', bold: true, fontSize: 9 },
                { text: 'Dirección General de Asuntos Religiosos', alignment: 'right', bold: true, fontSize: 9 },
                { text: 'Dirección General Adjunta de Registro, Certificación y Normatividad de las Asociaciones Religiosas \n\n\n', alignment: 'right', bold: true, fontSize: 9 },
                { 
                    text: [
                        { text: 'REFERENCIA: ', bold: true, alignment: 'right'},
                        { text: infoOficio.referencia,  alignment: 'right'},
                    ]
                },
                { 
                    text: [
                        { text: 'EXPEDIENTE: ', bold: true, alignment: 'right'},
                        { text: infoOficio.expediente,  alignment: 'right'},
                    ]
                },
                { 
                    text: [
                        { text: 'OFICIO: ', bold: true, alignment: 'right'},
                        { text: infoOficio.oficio,  alignment: 'right'},
                    ]
                },
                { text: '\nCiudad de México a ' + date.getDate() + ' de ' + month + ' de ' + date.getFullYear() + '\n\n\n', alignment: 'right' },
                { text: 'C. ' + infoTransmision.rep_nombre_completo.toUpperCase(), alignment: 'left', bold: true },
                { text: 'Representante legal de ' + infoTransmision.denominacion, alignment: 'left', bold: true },
                { text: infoTransmision.numero_sgar, alignment: 'left', bold: true },
                {
                    columns: [
                        {
                            text: infoTransmision.domicilio + '\n\n',
                            width: '50%',
                            alignment: 'left',
                        },
                        {
                            text: '',
                            width: '50%',
                            alignment: 'left',
                        }
                    ]
                },
                'Me refiero a su escrito presentando a esta Dirección General, mediante el cual solicita autorización para transmitir los actos de culto religioso que a continuación se indican: \n',
                [dataActos],
                {
                    text: [
                        { text: '\nEn esta tesitura y toda vez que como asociación religiosa debidamente registrada, tiene derecho a transmitir o difundir actos de culto religioso a través de medios masivos de comunicación no impresos, en tanto cumplan con las normas aplicables a la materia; con fundamento en los artículos 9, fracción III, 21, párrafo segundo, de la Ley de Asociaciones Religiosas y Culto Público; 30 y 31 del Reglamento de dicha Ley; 86, fracción IX, del Reglamento Interior de la Secretaría de Gobernación, esta Dirección General de Asuntos Religiosos, a través de la Dirección de Normatividad, atendiendo las medidas de prevención emitidas por las autoridades del sector salud, derivado de la contingencia provocada por COVID-19 (coronavirus), y con la intención de evitar la aglomeración de personas en cualquier tipo de espacio, ', alignment: 'justify' },
                        { text: 'determina autorizar las transmisiones que han sido enunciadas.\n\n' , bold : true}
                    ]
                },
                { text: 'Ahora bien, resulta indispensable puntualizar que de conformidad con los artículos 21, párrafo segundo, de la Ley de Asociaciones Religiosas y Culto Público y su diverso 30, párrafo segundo de su Reglamente; la transmisión o difusión de actos de culto religioso en ningún caso podrán difundirse en los tiempos de radio y televisión destinados al Estado.\n\n', alignment: 'justify' },
                { text: 'Lo anterior con fundamento en los artículos 2, apartado B, fracción XI, 9 y 86, fracción IX, todos del Reglamento Interior de la Secretaría de Gobernación; y en el Acuerdo por el que se da a conocer al público en general el medio de difusión de los trámites y servicios que se reactivan en la Secretaría de Gobernación a través de medios electrónicos, con motivo de la emergencia sanitaria generada por el coronavirus SARS-CoV2 (COVID-19), publicado en el Diario Oficial de la Federación el día 26 de agosto de 2020.\n\n', alignment: 'justify' },
                { text: 'Hago propia la ocasión para reiterarle la más distinguida de mis consideraciones.\n\n\n', alignment: 'justify' },
                { text: 'A t e n t a m e n t e', alignment: 'left', bold: true },
                { text: infoOficio.puesto_firmante + '\n\n\n\n\n\n\n\n', alignment: 'left', bold: true },
                { text: infoOficio.titulo_firmante + ' ' + infoOficio.nombre_firmante + '\n\n\n\n\n\n\n\n', alignment: 'left', bold: true },
                { text: 'C.c.p. ' + infoOficio.titulo_ccp + ' ' + infoOficio.nombre_ccp + '\n\n\n', alignment: 'left' },
                { text: iniciales + ' (' + num_transmisiones + ')', alignment: 'left' }
            ]
        }
        return documento
    }


    public createEncabezadoText(encabezadoText: string) {
        return { text: encabezadoText, bold: true };
    }

    public createColumnasEncabezado() {
        return {
            columns: [
                {
                    text: 'Fechas',
                    width: '*',
                    bold: true
                },
                {
                    text: 'Horario',
                    width: '*',
                    bold: true
                },
            ]
        };
    }

    public createColumnas(fecha: string, horario: string) {
        return {
            columns: [
                {
                    text: fecha,
                    width: '*',
                },
                {
                    text: horario,
                    width: '*'
                }
            ]
        };
    }

    public createTablaEmisoras(bodyTable: any) {
        return {
            style: 'tableExample',
            table: {
                widths: ['*', '*', '*', '*', '*'],
                headerRows: 2,
                body: bodyTable
            }
        };
    }

}