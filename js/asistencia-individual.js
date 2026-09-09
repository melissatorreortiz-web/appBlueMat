/* ======================================================
   COBRANZA MENSUAL
====================================================== */

/*
 * Trae de Firestore todos los pagos del periodo
 * seleccionado (una sola consulta, sin importar
 * el alumno) y arma un mapa alumnoId -> pago
 * para poder cruzarlo con la lista de alumnos.
 */

async function cargarCobranzaPeriodo() {

    /*
     * No cargamos nada hasta que el usuario
     * lo haya pedido al menos una vez con el
     * botón "Cargar cobranza de este mes".
     */

    if (
        !cobranzaCargadaAlMenosUnaVez
    ) {
        return;
    }


    const periodo =
        cobranzaPeriodoInput.value ||
        obtenerPeriodoActual();

    if (
        !cobranzaPeriodoInput.value
    ) {

        cobranzaPeriodoInput.value =
            periodo;

    }


    listaCobranza.innerHTML = `
        <tr>
            <td colspan="8">
                Cargando cobranza...
            </td>
        </tr>
    `;


    try {

        const consulta =
            query(
                collection(
                    db,
                    "pagos"
                ),
                where(
                    "periodo",
                    "==",
                    periodo
                )
            );


        const snapshot =
            await getDocs(
                consulta
            );


        pagosCobranzaMap = {};


        snapshot.forEach(
            documento => {

                const pago = {
                    id: documento.id,
                    ...documento.data()
                };

                pagosCobranzaMap[
                    pago.alumnoId
                ] = pago;

            }
        );


        renderizarCobranza();


    } catch (error) {

        console.error(
            "Error cargando cobranza:",
            error
        );


        listaCobranza.innerHTML = `
            <tr>
                <td colspan="8">
                    No fue posible cargar la cobranza de este mes.
                </td>
            </tr>
        `;

    }

}


/*
 * Cruza los alumnos (filtrados por estado)
 * con el mapa de pagos del periodo seleccionado
 * y dibuja la tabla + el resumen.
 */

function renderizarCobranza() {

    const filtroEstadoAlumno =
        cobranzaFiltroEstadoAlumno.value;

    const filtroPago =
        cobranzaFiltroPago.value;


    const alumnosConsiderados =
        alumnos.filter(
            alumno => {

                if (
                    filtroEstadoAlumno === "activos"
                ) {

                    return (
                        alumno.activo === true
                    );

                }

                if (
                    filtroEstadoAlumno === "inactivos"
                ) {

                    return (
                        alumno.activo !== true
                    );

                }

                return true;

            }
        );


    let totalPagaron = 0;

    let totalNoPagaron = 0;

    let totalSinRegistro = 0;


    const filas =
        alumnosConsiderados
            .map(
                alumno => {

                    const pago =
                        pagosCobranzaMap[
                            alumno.id
                        ];

                    const estadoPago =
                        pago
                            ? pago.estado
                            : "sin_registro";

                    if (
                        estadoPago === "pagado"
                    ) {

                        totalPagaron++;

                    } else if (
                        estadoPago === "no_pagado"
                    ) {

                        totalNoPagaron++;

                    } else {

                        totalSinRegistro++;

                    }

                    return {
                        alumno,
                        pago,
                        estadoPago
                    };

                }
            )
            .filter(
                item => {

                    if (
                        filtroPago === "todos"
                    ) {

                        return true;

                    }

                    return (
                        item.estadoPago ===
                        filtroPago
                    );

                }
            );


    cobranzaTotalConsiderados
        .textContent =
        alumnosConsiderados.length;

    cobranzaTotalPagaron
        .textContent =
        totalPagaron;

    cobranzaTotalNoPagaron
        .textContent =
        totalNoPagaron;

    cobranzaTotalSinRegistro
        .textContent =
        totalSinRegistro;


    listaCobranza.innerHTML =
        "";


    if (
        filas.length === 0
    ) {

        listaCobranza.innerHTML = `
            <tr>
                <td colspan="8">
                    No hay alumnos que coincidan con estos filtros.
                </td>
            </tr>
        `;

        return;

    }


    filas
        .sort(
            (a, b) =>
                nombreCompleto(
                    a.alumno
                ).localeCompare(
                    nombreCompleto(
                        b.alumno
                    ),
                    "es"
                )
        )
        .forEach(
            item => {

                const {
                    alumno,
                    pago,
                    estadoPago
                } = item;


                const fila =
                    document.createElement(
                        "tr"
                    );


                if (
                    estadoPago === "no_pagado"
                ) {

                    fila.classList.add(
                        "fila-no-pagado"
                    );

                } else if (
                    estadoPago === "sin_registro"
                ) {

                    fila.classList.add(
                        "fila-sin-registro"
                    );

                }


                const etiquetaEstado =

                    estadoPago === "pagado"

                    ? `
                        <span
                            class="badge-cobranza pagado"
                        >
                            🟢 Pagó
                        </span>
                      `

                    : estadoPago === "no_pagado"

                    ? `
                        <span
                            class="badge-cobranza no_pagado"
                        >
                            🔴 No pagó
                        </span>
                      `

                    : `
                        <span
                            class="badge-cobranza sin_registro"
                        >
                            ⚪ Sin registro
                        </span>
                      `;


                const fechaPagoTexto =
                    pago && pago.fechaPago
                        ? formatearFecha(
                            pago.fechaPago
                        )
                        : "—";


                const boton =
                    pago
                        ? `
                            <button
                                type="button"
                                class="
                                    btn-principal
                                    boton-fila
                                    btn-cobranza-accion
                                "
                                data-id="${alumno.id}"
                            >
                                ✏️ Editar pago
                            </button>
                          `
                        : `
                            <button
                                type="button"
                                class="
                                    btn-verde
                                    boton-fila
                                    btn-cobranza-accion
                                "
                                data-id="${alumno.id}"
                            >
                                💰 Registrar
                            </button>
                          `;


                const botonWhatsApp =

                    estadoPago !== "pagado" &&
                    formatearTelefonoWhatsApp(
                        alumno.telefono
                    )

                    ? `
                        <button
                            type="button"
                            class="
                                btn-verde
                                boton-fila
                                btn-whatsapp-cobranza
                            "
                            data-id="${alumno.id}"
                            style="margin-left:6px;"
                        >
                            📱 WhatsApp
                        </button>
                      `

                    : "";


                fila.innerHTML = `

                    <td>
                        <strong>
                            ${escaparHtml(
                                nombreCompleto(
                                    alumno
                                )
                            )}
                        </strong>
                    </td>

                    <td>
                        ${escaparHtml(
                            textoSeguro(
                                alumno.grupo
                            )
                        )}
                    </td>

                    <td>
                        ${formatearMoneda(
                            alumno.cuotaMensual
                        )}
                    </td>

                    <td>
                        ${etiquetaEstado}
                    </td>

                    <td>
                        ${
                            pago
                                ? formatearMoneda(
                                    pago.monto
                                )
                                : "—"
                        }
                    </td>

                    <td>
                        ${fechaPagoTexto}
                    </td>

                    <td>
                        ${escaparHtml(
                            textoSeguro(
                                pago
                                    ? pago.metodoPago
                                    : ""
                            )
                        )}
                    </td>

                    <td>
                        ${boton}${botonWhatsApp}
                    </td>

                `;


                listaCobranza.appendChild(
                    fila
                );

            }
        );


    listaCobranza
        .querySelectorAll(
            ".btn-cobranza-accion"
        )
        .forEach(
            boton => {

                boton.addEventListener(
                    "click",
                    function() {

                        irACobrarDesdePanel(
                            this.dataset.id
                        );

                    }
                );

            }
        );


    listaCobranza
        .querySelectorAll(
            ".btn-whatsapp-cobranza"
        )
        .forEach(
            boton => {

                boton.addEventListener(
                    "click",
                    function() {

                        const alumno =
                            alumnos.find(
                                a =>
                                    a.id ===
                                    this.dataset.id
                            );

                        if (!alumno) {
                            return;
                        }

                        const periodo =
                            cobranzaPeriodoInput.value ||
                            obtenerPeriodoActual();

                        const link =
                            generarLinkWhatsAppRecordatorio(
                                alumno,
                                periodo
                            );

                        if (link) {

                            window.open(
                                link,
                                "_blank"
                            );

                        }

                    }
                );

            }
        );

}


/*
 * Abre el expediente del alumno directamente
 * en el formulario de pago del mes que se está
 * cobrando: si ya existe un registro para ese
 * periodo lo deja en modo edición, si no, lo
 * deja listo para registrar uno nuevo.
 */

function irACobrarDesdePanel(
    alumnoId
) {

    const alumno =
        alumnos.find(
            a => a.id === alumnoId
        );

    if (!alumno) {
        return;
    }


    const periodo =
        cobranzaPeriodoInput.value ||
        obtenerPeriodoActual();


    mostrarExpediente(
        alumno
    );


    const pagoExistente =
        pagosCobranzaMap[
            alumno.id
        ];


    if (
        pagoExistente &&
        pagoExistente.periodo ===
        periodo
    ) {

        iniciarEdicionPago(
            pagoExistente
        );

    } else {

        pagoPeriodo.value =
            periodo;

        actualizarCamposEstadoPago();

    }

}



