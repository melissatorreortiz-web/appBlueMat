// Blue Mat Academy - módulo separado

/* ======================================================
   PAGOS
====================================================== */

function prepararFormularioPago(
    alumno
) {

    pagoEditandoId =
        null;

    tituloFormularioPago
        .textContent =
        "Registrar mensualidad";

    btnGuardarPago
        .textContent =
        "💾 Registrar";

    btnCancelarEdicionPago
        .style.display =
        "none";

    document
        .getElementById(
            "contenedorFormularioPago"
        )
        .classList
        .remove(
            "modo-edicion-pago"
        );


    pagoPeriodo.value =
        obtenerPeriodoActual();

    pagoEstado.value =
        "pagado";

    pagoMonto.value =
        Number(
            alumno.cuotaMensual || 0
        );

    pagoFecha.value =
        obtenerFechaHoy();

    pagoMetodo.value =
        "";

    pagoNota.value =
        "";

    actualizarCamposEstadoPago();

    limpiarMensaje(
        mensajePago
    );

}


function actualizarCamposEstadoPago() {

    const pagado =
        pagoEstado.value ===
        "pagado";


    document
        .getElementById(
            "campoFechaPago"
        )
        .style.display =
        pagado
            ? "flex"
            : "none";


    document
        .getElementById(
            "campoMetodoPago"
        )
        .style.display =
        pagado
            ? "flex"
            : "none";


    if (!pagado) {

        pagoMonto.value =
            "0";

        pagoFecha.value =
            "";

        pagoMetodo.value =
            "";

    } else {

        if (
            Number(
                pagoMonto.value
            ) === 0
        ) {

            pagoMonto.value =
                Number(
                    alumnoActual?.cuotaMensual ||
                    0
                );

        }

        if (
            !pagoFecha.value
        ) {

            pagoFecha.value =
                obtenerFechaHoy();

        }

    }

}


pagoEstado.addEventListener(
    "change",
    actualizarCamposEstadoPago
);



/* ======================================================
   CARGAR PAGOS
====================================================== */

async function cargarPagosAlumno(
    alumnoId
) {

    historialPagos.innerHTML = `
        <div class="historial-vacio">
            Cargando historial...
        </div>
    `;


    try {

        const consulta =
            query(
                collection(
                    db,
                    "pagos"
                ),
                where(
                    "alumnoId",
                    "==",
                    alumnoId
                )
            );


        const snapshot =
            await getDocs(
                consulta
            );


        const pagos = [];


        snapshot.forEach(
            documento => {

                const pago = {
                    id: documento.id,
                    ...documento.data()
                };

                /*
                 * Las anualidades viven en la misma
                 * colección "pagos" pero tienen su
                 * propio historial en el bloque de
                 * Anualidad, así que no entran aquí.
                 */

                if (
                    pago.tipo === "anualidad"
                ) {
                    return;
                }

                pagos.push(
                    pago
                );

            }
        );


        pagos.sort(
            (a, b) =>
                String(
                    b.periodo || ""
                ).localeCompare(
                    String(
                        a.periodo || ""
                    )
                )
        );


        renderizarHistorialPagos(
            pagos
        );


    } catch (error) {

        console.error(
            "Error cargando pagos:",
            error
        );


        historialPagos.innerHTML = `
            <div class="historial-vacio">
                No fue posible cargar el historial de pagos.
            </div>
        `;

    }

}



/* ======================================================
   RENDER HISTORIAL
====================================================== */

function renderizarHistorialPagos(
    pagos
) {

    if (
        pagos.length === 0
    ) {

        historialPagos.innerHTML = `
            <div class="historial-vacio">
                Este alumno todavía no tiene pagos registrados.
            </div>
        `;


        document
            .getElementById(
                "resumenUltimoPeriodo"
            )
            .textContent =
            "Sin registros";


        document
            .getElementById(
                "resumenUltimoEstado"
            )
            .textContent =
            "Sin registros";


        return;

    }


    const ultimo =
        pagos[0];


    document
        .getElementById(
            "resumenUltimoPeriodo"
        )
        .textContent =
        ultimo.periodo ||
        "—";


    document
        .getElementById(
            "resumenUltimoEstado"
        )
        .innerHTML =

        ultimo.estado === "pagado"

        ? `
            <span
                class="estado-pago pagado"
            >
                Pagado
            </span>
          `

        : `
            <span
                class="estado-pago no-pagado"
            >
                No pagado
            </span>
          `;


    let html = `

        <div class="tabla-contenedor">

            <table>

                <thead>

                    <tr>

                        <th>
                            Periodo
                        </th>

                        <th>
                            Estado
                        </th>

                        <th>
                            Monto
                        </th>

                        <th>
                            Fecha de pago
                        </th>

                        <th>
                            Método
                        </th>

                        <th>
                            Nota
                        </th>

                        <th>
                            Registró
                        </th>

                        <th>
                            Acción
                        </th>

                    </tr>

                </thead>

                <tbody>
    `;


    pagos.forEach(
        pago => {

            const estado =
                pago.estado ===
                "pagado";


            const fechaPago =
                pago.fechaPago
                    ? formatearFecha(
                        pago.fechaPago
                    )
                    : "—";


            html += `

                <tr>

                    <td>
                        <strong>
                            ${escaparHtml(
                                pago.periodo
                            )}
                        </strong>
                    </td>


                    <td>

                        ${
                            estado

                            ? `
                                <span
                                    class="estado-pago pagado"
                                >
                                    Pagado
                                </span>
                              `

                            : `
                                <span
                                    class="estado-pago no-pagado"
                                >
                                    No pagado
                                </span>
                              `
                        }

                    </td>


                    <td>
                        ${formatearMoneda(
                            pago.monto
                        )}
                    </td>


                    <td>
                        ${fechaPago}
                    </td>


                    <td>
                        ${escaparHtml(
                            textoSeguro(
                                pago.metodoPago
                            )
                        )}
                    </td>


                    <td>
                        ${escaparHtml(
                            textoSeguro(
                                pago.nota
                            )
                        )}
                    </td>


                    <td>
                        ${escaparHtml(
                            textoSeguro(
                                pago.registradoPorCorreo
                            )
                        )}
                    </td>


                    <td>

                        ${
                            puedeEditarPagos

                            ? `
                                <button
                                    type="button"
                                    class="
                                        btn-principal
                                        boton-fila
                                        btn-editar-pago
                                    "
                                    data-id="${pago.id}"
                                >
                                    ✏️ Editar
                                </button>
                              `

                            : ""
                        }

                        <button
                            type="button"
                            class="
                                btn-secundario
                                boton-fila
                                btn-historial-pago
                            "
                            data-id="${pago.id}"
                            style="margin-left:6px;"
                        >
                            🕒 Historial
                        </button>

                        ${
                            pago.estado === "pagado"

                            ? `
                                <button
                                    type="button"
                                    class="
                                        btn-verde
                                        boton-fila
                                        btn-enviar-recibo
                                    "
                                    data-id="${pago.id}"
                                    style="margin-left:6px;"
                                >
                                    📧 Enviar recibo
                                </button>
                              `

                            : ""
                        }

                        ${
                            puedeEditarPagos

                            ? `
                                <button
                                    type="button"
                                    class="
                                        btn-peligro
                                        boton-fila
                                        btn-eliminar-pago
                                    "
                                    data-id="${pago.id}"
                                    style="margin-left:6px;"
                                >
                                    🗑️ Eliminar
                                </button>
                              `

                            : ""
                        }

                    </td>

                </tr>

                <tr
                    class="fila-historial-pago"
                    data-historial-de="${pago.id}"
                    style="display:none;"
                >

                    <td colspan="8">

                        <div
                            class="contenedor-historial-pago"
                            id="historialPago-${pago.id}"
                        >

                            <div class="cargando-asistencia">
                                Cargando...
                            </div>

                        </div>

                    </td>

                </tr>

            `;

        }
    );


    html += `

                </tbody>

            </table>

        </div>

    `;


    historialPagos.innerHTML =
        html;


    /*
     * Ahora que el historial está dibujado,
     * conectamos los botones de edición.
     */

    historialPagos
        .querySelectorAll(
            ".btn-editar-pago"
        )
        .forEach(
            boton => {

                boton.addEventListener(
                    "click",
                    function() {

                        const pagoId =
                            this.dataset.id;

                        const pago =
                            pagos.find(
                                p =>
                                    p.id ===
                                    pagoId
                            );

                        if (
                            pago
                        ) {

                            iniciarEdicionPago(
                                pago
                            );

                        }

                    }
                );

            }
        );


    historialPagos
        .querySelectorAll(
            ".btn-enviar-recibo"
        )
        .forEach(
            boton => {

                boton.addEventListener(
                    "click",
                    async function() {

                        const pagoId =
                            this.dataset.id;

                        const pago =
                            pagos.find(
                                p =>
                                    p.id ===
                                    pagoId
                            );

                        if (
                            !pago ||
                            !alumnoActual
                        ) {
                            return;
                        }

                        const textoOriginal =
                            this.textContent;

                        this.disabled =
                            true;

                        this.textContent =
                            "Enviando...";

                        try {

                            await enviarReciboPorCorreo(
                                alumnoActual,
                                pago
                            );

                            mostrarMensaje(
                                mensajePago,
                                `Recibo enviado a ${alumnoActual.correo}.`,
                                "ok"
                            );

                        } catch (error) {

                            console.error(
                                "Error enviando recibo:",
                                error
                            );

                            let texto =
                                "No fue posible enviar el recibo.";

                            if (
                                error.message === "SIN_CORREO"
                            ) {

                                texto =
                                    "Este alumno no tiene correo guardado.";

                            } else if (
                                error.message === "EMAILJS_NO_CONFIGURADO"
                            ) {

                                texto =
                                    "Falta configurar EmailJS (revisa las constantes EMAILJS_* al inicio del código).";

                            }

                            mostrarMensaje(
                                mensajePago,
                                texto,
                                "error"
                            );

                        }

                        this.disabled =
                            false;

                        this.textContent =
                            textoOriginal;

                    }
                );

            }
        );


    historialPagos
        .querySelectorAll(
            ".btn-historial-pago"
        )
        .forEach(
            boton => {

                boton.addEventListener(
                    "click",
                    function() {

                        alternarHistorialPago(
                            this.dataset.id
                        );

                    }
                );

            }
        );


    historialPagos
        .querySelectorAll(
            ".btn-eliminar-pago"
        )
        .forEach(
            boton => {

                boton.addEventListener(
                    "click",
                    async function() {

                        const pagoId =
                            this.dataset.id;

                        const pago =
                            pagos.find(
                                p =>
                                    p.id ===
                                    pagoId
                            );

                        if (
                            !pago ||
                            !alumnoActual
                        ) {
                            return;
                        }

                        const confirmado =
                            confirm(
                                `¿Seguro que quieres eliminar el pago de ${pago.periodo}? ` +
                                `Esto no se puede deshacer.`
                            );

                        if (
                            !confirmado
                        ) {
                            return;
                        }

                        this.disabled =
                            true;

                        try {

                            await deleteDoc(
                                doc(
                                    db,
                                    "pagos",
                                    pagoId
                                )
                            );

                            try {

                                await addDoc(
                                    collection(
                                        db,
                                        "pagos_historial"
                                    ),
                                    {

                                        pagoId,

                                        alumnoId:
                                            alumnoActual.id,

                                        periodo:
                                            pago.periodo,

                                        accion:
                                            "eliminado",

                                        antes: {
                                            estado:
                                                pago.estado ||
                                                "",
                                            monto:
                                                Number(
                                                    pago.monto || 0
                                                ),
                                            metodoPago:
                                                pago.metodoPago ||
                                                "",
                                            nota:
                                                pago.nota ||
                                                ""
                                        },

                                        despues:
                                            null,

                                        modificadoPorUid:
                                            usuarioActual?.uid ||
                                            "",

                                        modificadoPorCorreo:
                                            usuarioActual?.email ||
                                            "",

                                        fecha:
                                            Timestamp.now()

                                    }
                                );

                            } catch (errorHistorial) {

                                console.error(
                                    "No fue posible guardar el historial de la eliminación:",
                                    errorHistorial
                                );

                            }

                            mostrarMensaje(
                                mensajePago,
                                "Pago eliminado correctamente.",
                                "ok"
                            );

                            await cargarPagosAlumno(
                                alumnoActual.id
                            );

                            await cargarCobranzaPeriodo();

                        } catch (error) {

                            console.error(
                                "Error eliminando pago:",
                                error
                            );

                            mostrarMensaje(
                                mensajePago,
                                "No fue posible eliminar el pago.",
                                "error"
                            );

                            this.disabled =
                                false;

                        }

                    }
                );

            }
        );

}


/*
 * Muestra u oculta la fila con el historial
 * de cambios de un pago específico. La primera
 * vez que se abre, lo trae de Firestore; las
 * siguientes usa la caché en memoria.
 */

async function alternarHistorialPago(
    pagoId
) {

    const fila =
        historialPagos.querySelector(
            `.fila-historial-pago[data-historial-de="${pagoId}"]`
        );

    if (!fila) {
        return;
    }

    const yaVisible =
        fila.style.display !== "none";

    if (
        yaVisible
    ) {

        fila.style.display =
            "none";

        return;

    }

    fila.style.display =
        "table-row";

    const contenedor =
        document.getElementById(
            `historialPago-${pagoId}`
        );

    if (
        historialesPagoCache[pagoId]
    ) {

        renderizarHistorialDeUnPago(
            contenedor,
            historialesPagoCache[pagoId]
        );

        return;

    }

    contenedor.innerHTML = `
        <div class="cargando-asistencia">
            Cargando...
        </div>
    `;

    try {

        const consulta =
            query(
                collection(
                    db,
                    "pagos_historial"
                ),
                where(
                    "pagoId",
                    "==",
                    pagoId
                )
            );

        const snapshot =
            await getDocs(
                consulta
            );

        const registros =
            snapshot.docs
                .map(
                    documento => ({
                        id: documento.id,
                        ...documento.data()
                    })
                )
                .sort(
                    (a, b) => {

                        const fechaA =
                            a.fecha?.toDate
                                ? a.fecha.toDate()
                                : new Date(0);

                        const fechaB =
                            b.fecha?.toDate
                                ? b.fecha.toDate()
                                : new Date(0);

                        return fechaB - fechaA;

                    }
                );

        historialesPagoCache[pagoId] =
            registros;

        renderizarHistorialDeUnPago(
            contenedor,
            registros
        );

    } catch (error) {

        console.error(
            "Error cargando historial del pago:",
            error
        );

        contenedor.innerHTML = `
            <div class="error-asistencia">
                No fue posible cargar el historial.
            </div>
        `;

    }

}


function renderizarHistorialDeUnPago(
    contenedor,
    registros
) {

    if (
        registros.length === 0
    ) {

        contenedor.innerHTML = `
            <div class="cargando-asistencia">
                Este pago no tiene ajustes registrados desde que se creó.
            </div>
        `;

        return;

    }

    contenedor.innerHTML =
        registros
            .map(
                registro => {

                    const fecha =
                        registro.fecha?.toDate
                            ? formatearFecha(
                                registro.fecha
                            )
                            : "—";

                    const quien =
                        registro.modificadoPorCorreo ||
                        "—";

                    if (
                        registro.accion === "eliminado"
                    ) {

                        return `
                            <div class="linea-historial-pago">
                                🗑️ <strong>Eliminado</strong>
                                el ${fecha} por ${escaparHtml(quien)}
                                — estaba: ${escaparHtml(textoSeguro(registro.antes?.estado))},
                                ${formatearMoneda(registro.antes?.monto)}
                            </div>
                        `;

                    }

                    return `
                        <div class="linea-historial-pago">
                            ✏️ <strong>Editado</strong>
                            el ${fecha} por ${escaparHtml(quien)}
                            — de ${escaparHtml(textoSeguro(registro.antes?.estado))}
                            (${formatearMoneda(registro.antes?.monto)})
                            a ${escaparHtml(textoSeguro(registro.despues?.estado))}
                            (${formatearMoneda(registro.despues?.monto)})
                        </div>
                    `;

                }
            )
            .join("");

}



/* ======================================================
   INICIAR EDICIÓN DE PAGO
====================================================== */

function iniciarEdicionPago(
    pago
) {

    pagoEditandoId =
        pago.id;

    pagoAntesDeEditar =
        { ...pago };


    tituloFormularioPago
        .textContent =
        `✏️ Editando mensualidad de ${pago.periodo}`;


    btnGuardarPago
        .textContent =
        "💾 Guardar cambios";


    btnCancelarEdicionPago
        .style.display =
        "inline-block";


    document
        .getElementById(
            "contenedorFormularioPago"
        )
        .classList
        .add(
            "modo-edicion-pago"
        );


    pagoPeriodo.value =
        pago.periodo || "";


    pagoEstado.value =
        pago.estado ||
        "pagado";


    pagoMonto.value =
        Number(
            pago.monto || 0
        );


    if (
        pago.fechaPago
    ) {

        let fecha;

        if (
            pago.fechaPago.toDate
        ) {

            fecha =
                pago.fechaPago.toDate();

        } else if (
            pago.fechaPago.seconds
            !== undefined
        ) {

            fecha =
                new Date(
                    pago.fechaPago.seconds *
                    1000
                );

        }


        if (fecha) {

            const year =
                fecha.getFullYear();

            const month =
                String(
                    fecha.getMonth() + 1
                ).padStart(
                    2,
                    "0"
                );

            const day =
                String(
                    fecha.getDate()
                ).padStart(
                    2,
                    "0"
                );

            pagoFecha.value =
                `${year}-${month}-${day}`;

        }

    } else {

        pagoFecha.value =
            "";

    }


    pagoMetodo.value =
        pago.metodoPago ||
        "";


    pagoNota.value =
        pago.nota ||
        "";


    actualizarCamposEstadoPago();


    limpiarMensaje(
        mensajePago
    );


    document
        .getElementById(
            "contenedorFormularioPago"
        )
        .scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

}



/* ======================================================
   CANCELAR EDICIÓN DE PAGO
====================================================== */

function cancelarEdicionPago() {

    pagoEditandoId =
        null;


    tituloFormularioPago
        .textContent =
        "Registrar mensualidad";


    btnGuardarPago
        .textContent =
        "💾 Registrar";


    btnCancelarEdicionPago
        .style.display =
        "none";


    document
        .getElementById(
            "contenedorFormularioPago"
        )
        .classList
        .remove(
            "modo-edicion-pago"
        );


    limpiarMensaje(
        mensajePago
    );


    if (
        alumnoActual
    ) {

        prepararFormularioPago(
            alumnoActual
        );

    }

}


btnCancelarEdicionPago.addEventListener(
    "click",
    cancelarEdicionPago
);



/* ======================================================
   GUARDAR / EDITAR PAGO
====================================================== */

formPago.addEventListener(
    "submit",
    async function(e) {

        e.preventDefault();


        if (
            !alumnoActual
        ) {

            mostrarMensaje(
                mensajePago,
                "No hay un alumno seleccionado.",
                "error"
            );

            return;

        }


        limpiarMensaje(
            mensajePago
        );


        const periodo =
            pagoPeriodo.value;


        const estado =
            pagoEstado.value;


        const monto =
            Number(
                pagoMonto.value || 0
            );


        const nota =
            pagoNota.value.trim();


        if (
            !periodo
        ) {

            mostrarMensaje(
                mensajePago,
                "Selecciona el periodo.",
                "error"
            );

            return;

        }


        if (
            estado === "pagado" &&
            monto < 0
        ) {

            mostrarMensaje(
                mensajePago,
                "El monto no puede ser negativo.",
                "error"
            );

            return;

        }


        if (
            estado === "no_pagado" &&
            !nota
        ) {

            mostrarMensaje(
                mensajePago,
                "Para registrar un mes como no pagado, agrega una nota explicando el motivo.",
                "error"
            );

            return;

        }



        /* =================================================
           MODO EDICIÓN
        ================================================= */

        if (
            pagoEditandoId
        ) {

            try {

                let fechaPagoTimestamp =
                    null;


                if (
                    estado === "pagado" &&
                    pagoFecha.value
                ) {

                    fechaPagoTimestamp =
                        Timestamp.fromDate(
                            new Date(
                                `${pagoFecha.value}T12:00:00`
                            )
                        );

                }


                const cambiosPago = {

                    tipo:
                        "mensualidad",

                    periodo,

                    estado,

                    monto:
                        estado === "pagado"
                            ? monto
                            : 0,

                    fechaPago:
                        fechaPagoTimestamp,

                    metodoPago:
                        estado === "pagado"
                            ? pagoMetodo.value
                            : "",

                    nota,

                    /*
                     * La cuota de referencia NO se
                     * modifica al editar el pago.
                     *
                     * Esto conserva la historia económica.
                     */

                    fechaModificacion:
                        Timestamp.now(),

                    modificadoPorUid:
                        usuarioActual?.uid ||
                        "",

                    modificadoPorCorreo:
                        usuarioActual?.email ||
                        ""

                };


                await updateDoc(
                    doc(
                        db,
                        "pagos",
                        pagoEditandoId
                    ),
                    cambiosPago
                );


                try {

                    await addDoc(
                        collection(
                            db,
                            "pagos_historial"
                        ),
                        {

                            pagoId:
                                pagoEditandoId,

                            alumnoId:
                                alumnoActual.id,

                            periodo,

                            accion:
                                "editado",

                            antes: {
                                estado:
                                    pagoAntesDeEditar?.estado ||
                                    "",
                                monto:
                                    Number(
                                        pagoAntesDeEditar?.monto || 0
                                    ),
                                metodoPago:
                                    pagoAntesDeEditar?.metodoPago ||
                                    "",
                                nota:
                                    pagoAntesDeEditar?.nota ||
                                    ""
                            },

                            despues: {
                                estado:
                                    cambiosPago.estado,
                                monto:
                                    Number(
                                        cambiosPago.monto || 0
                                    ),
                                metodoPago:
                                    cambiosPago.metodoPago ||
                                    "",
                                nota:
                                    cambiosPago.nota ||
                                    ""
                            },

                            modificadoPorUid:
                                usuarioActual?.uid ||
                                "",

                            modificadoPorCorreo:
                                usuarioActual?.email ||
                                "",

                            fecha:
                                Timestamp.now()

                        }
                    );

                } catch (errorHistorial) {

                    console.error(
                        "No fue posible guardar el historial del ajuste:",
                        errorHistorial
                    );

                }

                pagoAntesDeEditar =
                    null;


                mostrarMensaje(
                    mensajePago,
                    "Pago actualizado correctamente.",
                    "ok"
                );


                await cargarPagosAlumno(
                    alumnoActual.id
                );

                await cargarCobranzaPeriodo();


                setTimeout(
                    function() {

                        prepararFormularioPago(
                            alumnoActual
                        );

                    },
                    700
                );


                return;


            } catch (error) {

                console.error(
                    "Error actualizando pago:",
                    error
                );


                mostrarMensaje(
                    mensajePago,
                    "No fue posible actualizar el pago.",
                    "error"
                );


                return;

            }

        }



        /* =================================================
           MODO NUEVO REGISTRO
        ================================================= */


        try {

            /*
             * Verificamos que no exista ya
             * un registro para ese alumno y mes.
             */

            const consulta =
                query(
                    collection(
                        db,
                        "pagos"
                    ),
                    where(
                        "alumnoId",
                        "==",
                        alumnoActual.id
                    ),
                    where(
                        "periodo",
                        "==",
                        periodo
                    )
                );


            const existentes =
                await getDocs(
                    consulta
                );


            if (
                !existentes.empty
            ) {

                mostrarMensaje(
                    mensajePago,
                    `Ya existe un registro para ${periodo}. Puedes editarlo desde el historial.`,
                    "error"
                );

                return;

            }


            let fechaPagoTimestamp =
                null;


            if (
                estado === "pagado" &&
                pagoFecha.value
            ) {

                fechaPagoTimestamp =
                    Timestamp.fromDate(
                        new Date(
                            `${pagoFecha.value}T12:00:00`
                        )
                    );

            }


            const datosPago = {

                alumnoId:
                    alumnoActual.id,

                alumnoNombre:
                    nombreCompleto(
                        alumnoActual
                    ),

                tipo:
                    "mensualidad",

                periodo,

                estado,

                monto:
                    estado === "pagado"
                        ? monto
                        : 0,

                fechaPago:
                    fechaPagoTimestamp,

                metodoPago:
                    estado === "pagado"
                        ? pagoMetodo.value
                        : "",

                nota,

                /*
                 * Esta cuota queda congelada
                 * en el historial.
                 */

                cuotaReferencia:
                    Number(
                        alumnoActual.cuotaMensual ||
                        0
                    ),

                tarifaId:
                    alumnoActual.tarifaId ||
                    "",

                tipoTarifa:
                    alumnoActual.tipoTarifa ||
                    "normal",

                porcentajeBeca:
                    Number(
                        alumnoActual.porcentajeBeca ||
                        0
                    ),

                registradoPorUid:
                    usuarioActual?.uid ||
                    "",

                registradoPorCorreo:
                    usuarioActual?.email ||
                    "",

                fechaRegistro:
                    Timestamp.now()

            };


            await addDoc(
                collection(
                    db,
                    "pagos"
                ),
                datosPago
            );


            mostrarMensaje(
                mensajePago,
                "Registro guardado correctamente.",
                "ok"
            );


            await cargarPagosAlumno(
                alumnoActual.id
            );

            await cargarCobranzaPeriodo();


            prepararFormularioPago(
                alumnoActual
            );


        } catch (error) {

            console.error(
                "Error registrando pago:",
                error
            );


            mostrarMensaje(
                mensajePago,
                "No fue posible registrar el pago.",
                "error"
            );

        }

    }
);



/* ======================================================
   ANUALIDAD
====================================================== */

function obtenerAnioActual() {

    return new Date().getFullYear();

}


function prepararFormularioAnualidad(
    alumno
) {

    anualidadEditandoId =
        null;

    tituloFormularioAnualidad
        .textContent =
        "Registrar anualidad";

    btnGuardarAnualidad
        .textContent =
        "💾 Registrar";

    btnCancelarEdicionAnualidad
        .style.display =
        "none";

    document
        .getElementById(
            "contenedorFormularioAnualidad"
        )
        .classList
        .remove(
            "modo-edicion-pago"
        );


    anualidadAnio.value =
        obtenerAnioActual();

    anualidadEstado.value =
        "pagado";

    anualidadMonto.value =
        0;

    anualidadFecha.value =
        obtenerFechaHoy();

    anualidadMetodo.value =
        "";

    anualidadNota.value =
        "";

    actualizarCamposEstadoAnualidad();

    limpiarMensaje(
        mensajeAnualidad
    );

}


function actualizarCamposEstadoAnualidad() {

    const pagado =
        anualidadEstado.value ===
        "pagado";


    document
        .getElementById(
            "campoFechaAnualidad"
        )
        .style.display =
        pagado
            ? "flex"
            : "none";


    document
        .getElementById(
            "campoMetodoAnualidad"
        )
        .style.display =
        pagado
            ? "flex"
            : "none";


    if (!pagado) {

        anualidadMonto.value =
            "0";

        anualidadFecha.value =
            "";

        anualidadMetodo.value =
            "";

    } else if (
        !anualidadFecha.value
    ) {

        anualidadFecha.value =
            obtenerFechaHoy();

    }

}


anualidadEstado.addEventListener(
    "change",
    actualizarCamposEstadoAnualidad
);



async function cargarAnualidadesAlumno(
    alumnoId
) {

    historialAnualidades.innerHTML = `
        <div class="historial-vacio">
            Cargando historial...
        </div>
    `;

    resumenAnioAnualidad.textContent =
        obtenerAnioActual();


    try {

        const consulta =
            query(
                collection(
                    db,
                    "pagos"
                ),
                where(
                    "alumnoId",
                    "==",
                    alumnoId
                ),
                where(
                    "tipo",
                    "==",
                    "anualidad"
                )
            );


        const snapshot =
            await getDocs(
                consulta
            );


        const anualidades = [];


        snapshot.forEach(
            documento => {

                anualidades.push({
                    id: documento.id,
                    ...documento.data()
                });

            }
        );


        anualidades.sort(
            (a, b) =>
                String(
                    b.periodo || ""
                ).localeCompare(
                    String(
                        a.periodo || ""
                    )
                )
        );


        renderizarHistorialAnualidades(
            anualidades
        );


    } catch (error) {

        console.error(
            "Error cargando anualidades:",
            error
        );


        historialAnualidades.innerHTML = `
            <div class="historial-vacio">
                No fue posible cargar el historial de anualidades.
            </div>
        `;

    }

}


function renderizarHistorialAnualidades(
    anualidades
) {

    const anioActual =
        String(
            obtenerAnioActual()
        );

    const registroAnioActual =
        anualidades.find(
            a =>
                String(
                    a.periodo || ""
                ) === anioActual
        );

    resumenEstadoAnualidad.innerHTML =

        registroAnioActual

        ? (
            registroAnioActual.estado === "pagado"

            ? `
                <span class="estado-pago pagado">
                    Pagado
                </span>
              `

            : `
                <span class="estado-pago no-pagado">
                    No pagado
                </span>
              `
        )

        : `
            <span class="badge-cobranza sin_registro">
                ⚪ Sin registro
            </span>
          `;


    if (
        anualidades.length === 0
    ) {

        historialAnualidades.innerHTML = `
            <div class="historial-vacio">
                Este alumno todavía no tiene anualidades registradas.
            </div>
        `;

        return;

    }


    let html = `

        <div class="tabla-contenedor">

            <table>

                <thead>

                    <tr>

                        <th>
                            Año
                        </th>

                        <th>
                            Estado
                        </th>

                        <th>
                            Monto
                        </th>

                        <th>
                            Fecha de pago
                        </th>

                        <th>
                            Método
                        </th>

                        <th>
                            Nota
                        </th>

                        <th>
                            Acción
                        </th>

                    </tr>

                </thead>

                <tbody>
    `;


    anualidades.forEach(
        registro => {

            const estado =
                registro.estado ===
                "pagado";

            const fechaPago =
                registro.fechaPago
                    ? formatearFecha(
                        registro.fechaPago
                    )
                    : "—";

            html += `

                <tr>

                    <td>
                        <strong>
                            ${escaparHtml(
                                registro.periodo
                            )}
                        </strong>
                    </td>

                    <td>
                        ${
                            estado

                            ? `
                                <span class="estado-pago pagado">
                                    Pagado
                                </span>
                              `

                            : `
                                <span class="estado-pago no-pagado">
                                    No pagado
                                </span>
                              `
                        }
                    </td>

                    <td>
                        ${formatearMoneda(
                            registro.monto
                        )}
                    </td>

                    <td>
                        ${fechaPago}
                    </td>

                    <td>
                        ${escaparHtml(
                            textoSeguro(
                                registro.metodoPago
                            )
                        )}
                    </td>

                    <td>
                        ${escaparHtml(
                            textoSeguro(
                                registro.nota
                            )
                        )}
                    </td>

                    <td>
                        ${
                            puedeEditarPagos

                            ? `
                                <button
                                    type="button"
                                    class="
                                        btn-principal
                                        boton-fila
                                        btn-editar-anualidad
                                    "
                                    data-id="${registro.id}"
                                >
                                    ✏️ Editar
                                </button>
                              `

                            : ""
                        }
                    </td>

                </tr>

            `;

        }
    );


    html += `
                </tbody>
            </table>
        </div>
    `;


    historialAnualidades.innerHTML =
        html;


    historialAnualidades
        .querySelectorAll(
            ".btn-editar-anualidad"
        )
        .forEach(
            boton => {

                boton.addEventListener(
                    "click",
                    function() {

                        const registro =
                            anualidades.find(
                                a =>
                                    a.id ===
                                    this.dataset.id
                            );

                        if (registro) {

                            iniciarEdicionAnualidad(
                                registro
                            );

                        }

                    }
                );

            }
        );

}


function iniciarEdicionAnualidad(
    registro
) {

    anualidadEditandoId =
        registro.id;

    tituloFormularioAnualidad
        .textContent =
        `✏️ Editando anualidad ${registro.periodo}`;

    btnGuardarAnualidad
        .textContent =
        "💾 Guardar cambios";

    btnCancelarEdicionAnualidad
        .style.display =
        "inline-block";

    document
        .getElementById(
            "contenedorFormularioAnualidad"
        )
        .classList
        .add(
            "modo-edicion-pago"
        );


    anualidadAnio.value =
        registro.periodo || "";

    anualidadEstado.value =
        registro.estado ||
        "pagado";

    anualidadMonto.value =
        Number(
            registro.monto || 0
        );


    if (
        registro.fechaPago
    ) {

        let fecha;

        if (
            registro.fechaPago.toDate
        ) {

            fecha =
                registro.fechaPago.toDate();

        } else if (
            registro.fechaPago.seconds
            !== undefined
        ) {

            fecha =
                new Date(
                    registro.fechaPago.seconds *
                    1000
                );

        }


        if (fecha) {

            const year =
                fecha.getFullYear();

            const month =
                String(
                    fecha.getMonth() + 1
                ).padStart(
                    2,
                    "0"
                );

            const day =
                String(
                    fecha.getDate()
                ).padStart(
                    2,
                    "0"
                );

            anualidadFecha.value =
                `${year}-${month}-${day}`;

        }

    } else {

        anualidadFecha.value =
            "";

    }


    anualidadMetodo.value =
        registro.metodoPago ||
        "";

    anualidadNota.value =
        registro.nota ||
        "";


    actualizarCamposEstadoAnualidad();

    limpiarMensaje(
        mensajeAnualidad
    );

    document
        .getElementById(
            "contenedorFormularioAnualidad"
        )
        .scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

}


function cancelarEdicionAnualidad() {

    anualidadEditandoId =
        null;

    tituloFormularioAnualidad
        .textContent =
        "Registrar anualidad";

    btnGuardarAnualidad
        .textContent =
        "💾 Registrar";

    btnCancelarEdicionAnualidad
        .style.display =
        "none";

    document
        .getElementById(
            "contenedorFormularioAnualidad"
        )
        .classList
        .remove(
            "modo-edicion-pago"
        );

    limpiarMensaje(
        mensajeAnualidad
    );

    if (
        alumnoActual
    ) {

        prepararFormularioAnualidad(
            alumnoActual
        );

    }

}


btnCancelarEdicionAnualidad.addEventListener(
    "click",
    cancelarEdicionAnualidad
);


formAnualidad.addEventListener(
    "submit",
    async function(e) {

        e.preventDefault();


        if (
            !alumnoActual
        ) {

            mostrarMensaje(
                mensajeAnualidad,
                "No hay un alumno seleccionado.",
                "error"
            );

            return;

        }


        limpiarMensaje(
            mensajeAnualidad
        );


        const anioTexto =
            String(
                anualidadAnio.value || ""
            ).trim();

        const estado =
            anualidadEstado.value;

        const monto =
            Number(
                anualidadMonto.value || 0
            );

        const nota =
            anualidadNota.value.trim();


        if (
            !anioTexto
        ) {

            mostrarMensaje(
                mensajeAnualidad,
                "Escribe el año.",
                "error"
            );

            return;

        }

        if (
            estado === "pagado" &&
            monto < 0
        ) {

            mostrarMensaje(
                mensajeAnualidad,
                "El monto no puede ser negativo.",
                "error"
            );

            return;

        }

        if (
            estado === "no_pagado" &&
            !nota
        ) {

            mostrarMensaje(
                mensajeAnualidad,
                "Para registrar un año como no pagado, agrega una nota explicando el motivo.",
                "error"
            );

            return;

        }



        /* =================================================
           MODO EDICIÓN
        ================================================= */

        if (
            anualidadEditandoId
        ) {

            try {

                let fechaPagoTimestamp =
                    null;


                if (
                    estado === "pagado" &&
                    anualidadFecha.value
                ) {

                    fechaPagoTimestamp =
                        Timestamp.fromDate(
                            new Date(
                                `${anualidadFecha.value}T12:00:00`
                            )
                        );

                }


                const cambios = {

                    periodo:
                        anioTexto,

                    estado,

                    monto:
                        estado === "pagado"
                            ? monto
                            : 0,

                    fechaPago:
                        fechaPagoTimestamp,

                    metodoPago:
                        estado === "pagado"
                            ? anualidadMetodo.value
                            : "",

                    nota,

                    fechaModificacion:
                        Timestamp.now(),

                    modificadoPorUid:
                        usuarioActual?.uid ||
                        "",

                    modificadoPorCorreo:
                        usuarioActual?.email ||
                        ""

                };


                await updateDoc(
                    doc(
                        db,
                        "pagos",
                        anualidadEditandoId
                    ),
                    cambios
                );


                mostrarMensaje(
                    mensajeAnualidad,
                    "Anualidad actualizada correctamente.",
                    "ok"
                );


                await cargarAnualidadesAlumno(
                    alumnoActual.id
                );


                setTimeout(
                    function() {

                        prepararFormularioAnualidad(
                            alumnoActual
                        );

                    },
                    700
                );


                return;


            } catch (error) {

                console.error(
                    "Error actualizando anualidad:",
                    error
                );


                mostrarMensaje(
                    mensajeAnualidad,
                    "No fue posible actualizar la anualidad.",
                    "error"
                );


                return;

            }

        }



        /* =================================================
           MODO NUEVO REGISTRO
        ================================================= */

        try {

            const consulta =
                query(
                    collection(
                        db,
                        "pagos"
                    ),
                    where(
                        "alumnoId",
                        "==",
                        alumnoActual.id
                    ),
                    where(
                        "periodo",
                        "==",
                        anioTexto
                    ),
                    where(
                        "tipo",
                        "==",
                        "anualidad"
                    )
                );


            const existentes =
                await getDocs(
                    consulta
                );


            if (
                !existentes.empty
            ) {

                mostrarMensaje(
                    mensajeAnualidad,
                    `Ya existe un registro de anualidad para ${anioTexto}. Puedes editarlo desde el historial.`,
                    "error"
                );

                return;

            }


            let fechaPagoTimestamp =
                null;


            if (
                estado === "pagado" &&
                anualidadFecha.value
            ) {

                fechaPagoTimestamp =
                    Timestamp.fromDate(
                        new Date(
                            `${anualidadFecha.value}T12:00:00`
                        )
                    );

            }


            const datosAnualidad = {

                alumnoId:
                    alumnoActual.id,

                alumnoNombre:
                    nombreCompleto(
                        alumnoActual
                    ),

                tipo:
                    "anualidad",

                periodo:
                    anioTexto,

                estado,

                monto:
                    estado === "pagado"
                        ? monto
                        : 0,

                fechaPago:
                    fechaPagoTimestamp,

                metodoPago:
                    estado === "pagado"
                        ? anualidadMetodo.value
                        : "",

                nota,

                registradoPorUid:
                    usuarioActual?.uid ||
                    "",

                registradoPorCorreo:
                    usuarioActual?.email ||
                    "",

                fechaRegistro:
                    Timestamp.now()

            };


            await addDoc(
                collection(
                    db,
                    "pagos"
                ),
                datosAnualidad
            );


            mostrarMensaje(
                mensajeAnualidad,
                "Anualidad registrada correctamente.",
                "ok"
            );


            await cargarAnualidadesAlumno(
                alumnoActual.id
            );


            prepararFormularioAnualidad(
                alumnoActual
            );


        } catch (error) {

            console.error(
                "Error registrando anualidad:",
                error
            );


            mostrarMensaje(
                mensajeAnualidad,
                "No fue posible registrar la anualidad.",
                "error"
            );

        }

    }
);


/* Recuperado del módulo original */
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


/* Recuperado del módulo original */
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


/* Recuperado del módulo original */
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
