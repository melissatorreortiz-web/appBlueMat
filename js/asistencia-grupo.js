/* ======================================================
   ALUMNOS
====================================================== */

async function cargarAlumnos() {

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "alumnos"
                )
            );

        alumnos = [];

        snapshot.forEach(
            documento => {

                alumnos.push({
                    id: documento.id,
                    ...documento.data()
                });

            }
        );

        alumnos.sort(
            (a, b) =>
                nombreCompleto(a)
                    .localeCompare(
                        nombreCompleto(b),
                        "es"
                    )
        );

        renderizarAlumnos();

    } catch (error) {

        console.error(
            "Error cargando alumnos:",
            error
        );

    }

}


function renderizarAlumnos() {

    const texto =
        buscador.value
            .trim()
            .toLowerCase();

    const estado =
        filtroEstado.value;


    const hayFiltroActivo =
        texto !== "" ||
        estado !== "todos";


    listaAlumnos.innerHTML =
        "";

    actualizarBotonEliminarSeleccionados();


    if (
        !hayFiltroActivo &&
        !mostrarTodosAlumnos
    ) {

        cabeceraListaAlumnos.innerHTML =
            "<th>Alumnos</th>";

        listaAlumnos.innerHTML = `
            <tr>
                <td>
                    Escribe algo en el buscador, usa el filtro de
                    estado, o pulsa "👁️ Mostrar todos los alumnos"
                    para ver la lista.
                </td>
            </tr>
        `;

        return;

    }


    const filtrados =
        alumnos.filter(
            alumno => {

                const nombre =
                    nombreCompleto(
                        alumno
                    ).toLowerCase();

                const correo =
                    String(
                        alumno.correo || ""
                    ).toLowerCase();

                const telefono =
                    String(
                        alumno.telefono || ""
                    ).toLowerCase();

                const coincideBusqueda =
                    !texto ||
                    nombre.includes(
                        texto
                    ) ||
                    correo.includes(
                        texto
                    ) ||
                    telefono.includes(
                        texto
                    );

                const coincideEstado =
                    estado === "todos" ||
                    (
                        estado === "activos" &&
                        alumno.activo === true
                    ) ||
                    (
                        estado === "inactivos" &&
                        alumno.activo !== true
                    );

                return (
                    coincideBusqueda &&
                    coincideEstado
                );

            }
        );


    const mostrarCheckbox =
        modoListaAlumnos === "completo" &&
        puedeEliminarAlumnos;


    if (
        modoListaAlumnos === "basico"
    ) {

        cabeceraListaAlumnos.innerHTML = `
            <th>Nombre</th>
            <th>Grupo</th>
            <th>Grado / cinta</th>
            <th>Cumpleaños</th>
        `;

    } else {

        cabeceraListaAlumnos.innerHTML = `
            ${
                mostrarCheckbox
                    ? `
                        <th>
                            <input
                                type="checkbox"
                                id="checkTodosAlumnos"
                            >
                        </th>
                      `
                    : ""
            }
            <th>Nombre</th>
            <th>Grupo</th>
            <th>Grado</th>
            <th>Estado</th>
            <th>Acción</th>
        `;

        if (
            mostrarCheckbox
        ) {

            document
                .getElementById(
                    "checkTodosAlumnos"
                )
                .addEventListener(
                    "change",
                    function() {

                        listaAlumnos
                            .querySelectorAll(
                                ".check-eliminar-alumno"
                            )
                            .forEach(
                                casilla => {

                                    casilla.checked =
                                        this.checked;

                                }
                            );

                        actualizarBotonEliminarSeleccionados();

                    }
                );

        }

    }


    if (
        filtrados.length === 0
    ) {

        listaAlumnos.innerHTML = `
            <tr>
                <td colspan="${
                    modoListaAlumnos === "basico"
                        ? 4
                        : (
                            mostrarCheckbox
                                ? 6
                                : 5
                        )
                }">
                    No se encontraron alumnos.
                </td>
            </tr>
        `;

        return;

    }


    if (
        modoListaAlumnos === "basico"
    ) {

        filtrados.forEach(
            alumno => {

                const fila =
                    document.createElement(
                        "tr"
                    );

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
                        ${escaparHtml(
                            textoSeguro(
                                alumno.grado
                            )
                        )}
                    </td>

                    <td>
                        ${escaparHtml(
                            formatearFechaSimple(
                                alumno.fechaNacimiento
                            )
                        )}
                    </td>

                `;

                listaAlumnos.appendChild(
                    fila
                );

            }
        );

        return;

    }


    filtrados.forEach(
        alumno => {

            const fila =
                document.createElement(
                    "tr"
                );

            fila.innerHTML = `

                ${
                    mostrarCheckbox
                        ? `
                            <td>
                                <input
                                    type="checkbox"
                                    class="check-eliminar-alumno"
                                    data-id="${alumno.id}"
                                >
                            </td>
                          `
                        : ""
                }

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
                    ${escaparHtml(
                        textoSeguro(
                            alumno.grado
                        )
                    )}
                </td>

                <td>

                    ${
                        alumno.activo === true

                        ? `
                            <span
                                class="estado-activo"
                            >
                                🟢 Activo
                            </span>
                          `

                        : `
                            <span
                                class="estado-inactivo"
                            >
                                🔴 Inactivo
                            </span>
                          `
                    }

                </td>

                <td>

                    <button
                        class="btn-principal boton-fila"
                        data-id="${alumno.id}"
                    >
                        Ver expediente
                    </button>

                </td>

            `;


            fila
                .querySelector(
                    "button"
                )
                .addEventListener(
                    "click",
                    () => {

                        const encontrado =
                            alumnos.find(
                                a =>
                                    a.id ===
                                    alumno.id
                            );

                        if (
                            encontrado
                        ) {

                            mostrarExpediente(
                                encontrado
                            );

                        }

                    }
                );


            listaAlumnos.appendChild(
                fila
            );

        }
    );


    if (
        mostrarCheckbox
    ) {

        listaAlumnos
            .querySelectorAll(
                ".check-eliminar-alumno"
            )
            .forEach(
                casilla => {

                    casilla.addEventListener(
                        "change",
                        actualizarBotonEliminarSeleccionados
                    );

                }
            );

    }

}


function actualizarBotonEliminarSeleccionados() {

    if (
        !puedeEliminarAlumnos
    ) {

        btnEliminarSeleccionados.style.display =
            "none";

        return;

    }

    const seleccionados =
        listaAlumnos.querySelectorAll(
            ".check-eliminar-alumno:checked"
        ).length;

    if (
        seleccionados === 0
    ) {

        btnEliminarSeleccionados.style.display =
            "none";

    } else {

        btnEliminarSeleccionados.style.display =
            "inline-block";

        btnEliminarSeleccionados.textContent =
            `🗑️ Eliminar ${seleccionados} alumno(s) seleccionado(s)`;

    }

}


btnMostrarTodosAlumnos.addEventListener(
    "click",
    function() {

        mostrarTodosAlumnos =
            !mostrarTodosAlumnos;

        btnMostrarTodosAlumnos.textContent =
            mostrarTodosAlumnos
                ? "🙈 Ocultar lista completa"
                : "👁️ Mostrar todos los alumnos";

        renderizarAlumnos();

    }
);


/*
 * Borra un alumno y, antes, todos sus
 * pagos (mensualidades y anualidades)
 * para no dejar registros huérfanos.
 */

async function eliminarAlumnoConPagos(
    alumnoId,
    nfcUid
) {

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

    const snapshotPagos =
        await getDocs(
            consulta
        );

    for (
        const documentoPago
        of snapshotPagos.docs
    ) {

        await deleteDoc(
            doc(
                db,
                "pagos",
                documentoPago.id
            )
        );

    }


    if (
        nfcUid
    ) {

        try {

            await deleteDoc(
                doc(
                    db,
                    "directorio_nfc",
                    nfcUid
                )
            );

        } catch (error) {

            console.error(
                "No fue posible limpiar el directorio_nfc:",
                error
            );

        }

    }


    await deleteDoc(
        doc(
            db,
            "alumnos",
            alumnoId
        )
    );

}


/*
 * Mantiene sincronizado el directorio público
 * mínimo que usa el kiosco de NFC (checkin.html):
 * solo alumnoId, nombre, foto y activo — nunca
 * teléfono, correo, cuota ni ningún otro dato
 * sensible.
 */

async function sincronizarDirectorioNfc(
    alumnoId,
    datosAlumno,
    nfcUidAnterior
) {

    if (
        nfcUidAnterior &&
        nfcUidAnterior !== datosAlumno.nfcUid
    ) {

        try {

            await deleteDoc(
                doc(
                    db,
                    "directorio_nfc",
                    nfcUidAnterior
                )
            );

        } catch (error) {

            console.error(
                "No fue posible limpiar el directorio_nfc anterior:",
                error
            );

        }

    }


    if (
        !datosAlumno.nfcUid
    ) {
        return;
    }


    try {

        await setDoc(
            doc(
                db,
                "directorio_nfc",
                datosAlumno.nfcUid
            ),
            {

                alumnoId,

                nombre:
                    [
                        datosAlumno.nombre,
                        datosAlumno.apellidoPaterno,
                        datosAlumno.apellidoMaterno
                    ]
                        .filter(Boolean)
                        .join(" "),

                foto:
                    datosAlumno.foto || "",

                activo:
                    datosAlumno.activo === true

            }
        );

    } catch (error) {

        console.error(
            "No fue posible actualizar el directorio_nfc:",
            error
        );

    }

}


btnEliminarSeleccionados.addEventListener(
    "click",
    async function() {

        const ids =
            Array.from(
                listaAlumnos.querySelectorAll(
                    ".check-eliminar-alumno:checked"
                )
            ).map(
                casilla =>
                    casilla.dataset.id
            );

        if (
            ids.length === 0
        ) {
            return;
        }

        const confirmado =
            confirm(
                `¿Seguro que quieres eliminar ${ids.length} alumno(s)? ` +
                `Esto también borra sus pagos registrados y no se puede deshacer.`
            );

        if (
            !confirmado
        ) {
            return;
        }

        btnEliminarSeleccionados.disabled =
            true;

        btnEliminarSeleccionados.textContent =
            "Eliminando...";

        let exitosos = 0;

        let fallidos = 0;

        for (
            const id
            of ids
        ) {

            try {

                const alumnoEncontrado =
                    alumnos.find(
                        a => a.id === id
                    );

                await eliminarAlumnoConPagos(
                    id,
                    alumnoEncontrado?.nfcUid
                );

                exitosos++;

            } catch (error) {

                console.error(
                    "Error eliminando alumno:",
                    error
                );

                fallidos++;

            }

        }

        await cargarAlumnos();

        await cargarCobranzaPeriodo();

        btnEliminarSeleccionados.disabled =
            false;

        mostrarMensaje(
            mensaje,
            `Eliminados: ${exitosos}.${
                fallidos
                    ? ` No se pudieron eliminar ${fallidos}.`
                    : ""
            }`,
            fallidos ? "error" : "ok"
        );

    }
);


buscador.addEventListener(
    "input",
    renderizarAlumnos
);

filtroEstado.addEventListener(
    "change",
    renderizarAlumnos
);



/* ======================================================
   AGREGAR ALUMNO
====================================================== */

formAlumno.addEventListener(
    "submit",
    async function(e) {

        e.preventDefault();

        limpiarMensaje(
            mensaje
        );


        const tarifaId =
            selectTarifaAlta.value;

        const tipoTarifa =
            document
                .getElementById(
                    "tipoTarifa"
                )
                .value;

        const tipoDescuentoBeca =
            tipoTarifa === "beca"
                ? document
                    .getElementById(
                        "tipoDescuentoBeca"
                    )
                    .value
                : "porcentaje";

        const porcentajeBeca =
            tipoTarifa === "beca" &&
            tipoDescuentoBeca === "porcentaje"
                ? Number(
                    document
                        .getElementById(
                            "porcentajeBeca"
                        )
                        .value || 0
                )
                : 0;

        const montoDescuentoBeca =
            tipoTarifa === "beca" &&
            tipoDescuentoBeca === "monto"
                ? Number(
                    document
                        .getElementById(
                            "montoDescuentoBeca"
                        )
                        .value || 0
                )
                : 0;


        const cuotaBase =
            obtenerCuotaBaseDeTarifa(
                tarifaId
            );


        const cuotaMensual =
            calcularCuota(
                cuotaBase,
                tipoTarifa,
                tipoDescuentoBeca,
                porcentajeBeca,
                montoDescuentoBeca
            );


        const datos = {

            nombre:
                document
                    .getElementById(
                        "nombre"
                    )
                    .value
                    .trim(),

            apellidoPaterno:
                document
                    .getElementById(
                        "apellidoPaterno"
                    )
                    .value
                    .trim(),

            apellidoMaterno:
                document
                    .getElementById(
                        "apellidoMaterno"
                    )
                    .value
                    .trim(),

            correo:
                document
                    .getElementById(
                        "correo"
                    )
                    .value
                    .trim(),

            telefono:
                document
                    .getElementById(
                        "telefono"
                    )
                    .value
                    .trim(),

            direccion:
                document
                    .getElementById(
                        "direccion"
                    )
                    .value
                    .trim(),

            estadoCivil:
                document
                    .getElementById(
                        "estadoCivil"
                    )
                    .value,

            fechaNacimiento:
                document
                    .getElementById(
                        "fechaNacimiento"
                    )
                    .value,

            fechaRegistro:
                Timestamp.now(),

            fechaIngreso:
                document
                    .getElementById(
                        "fechaIngreso"
                    )
                    .value,

            fechaBaja:
                document
                    .getElementById(
                        "fechaBaja"
                    )
                    .value,

            activo:
                document
                    .getElementById(
                        "activo"
                    )
                    .value === "true",

            grupo:
                document
                    .getElementById(
                        "grupo"
                    )
                    .value
                    .trim(),

            grado:
                document
                    .getElementById(
                        "grado"
                    )
                    .value
                    .trim(),

            nfcUid:
                document
                    .getElementById(
                        "nfcUid"
                    )
                    .value
                    .trim(),

            foto:
                fotoBase64Nueva || "",

            tarifaId,

            tipoTarifa,

            tipoDescuentoBeca,

            porcentajeBeca,

            montoDescuentoBeca,

            cuotaMensual

        };


        if (
            !datos.nombre ||
            !datos.apellidoPaterno ||
            !tarifaId
        ) {

            mostrarMensaje(
                mensaje,
                "Completa los campos obligatorios.",
                "error"
            );

            return;

        }


        try {

            const nuevoAlumnoRef =
                await addDoc(
                    collection(
                        db,
                        "alumnos"
                    ),
                    datos
                );


            await sincronizarDirectorioNfc(
                nuevoAlumnoRef.id,
                datos,
                null
            );


            mostrarMensaje(
                mensaje,
                "Alumno registrado correctamente.",
                "ok"
            );


            formAlumno.reset();

            fotoBase64Nueva =
                null;

            document
                .getElementById(
                    "previewFotoNueva"
                )
                .style.display =
                "none";

            document
                .getElementById(
                    "cuotaMensualVista"
                )
                .textContent =
                "$0.00";


            await cargarAlumnos();

            await cargarCobranzaPeriodo();


            setTimeout(
                cerrarPanelAlta,
                800
            );


        } catch (error) {

            console.error(error);

            mostrarMensaje(
                mensaje,
                "No fue posible guardar al alumno.",
                "error"
            );

        }

    }
);



/* ======================================================
   EXPEDIENTE
====================================================== */

function mostrarExpediente(
    alumno
) {

    alumnoActual =
        alumno;


    btnEliminarAlumno.style.display =
        puedeEliminarAlumnos
            ? "inline-block"
            : "none";


    document
        .getElementById(
            "tituloExpediente"
        )
        .textContent =
        nombreCompleto(
            alumno
        );


    document
        .getElementById(
            "expActivo"
        )
        .innerHTML =

        alumno.activo === true

        ? `
            <span class="estado-activo">
                🟢 Activo
            </span>
          `

        : `
            <span class="estado-inactivo">
                🔴 Inactivo
            </span>
          `;


    document
        .getElementById(
            "expGrupo"
        )
        .textContent =
        textoSeguro(
            alumno.grupo
        );


    document
        .getElementById(
            "expGrado"
        )
        .textContent =
        textoSeguro(
            alumno.grado
        );


    document
        .getElementById(
            "expRegistro"
        )
        .textContent =
        formatearFecha(
            alumno.fechaRegistro
        );


    document
        .getElementById(
            "expFechaIngreso"
        )
        .textContent =
        formatearFechaSimple(
            alumno.fechaIngreso
        );


    document
        .getElementById(
            "expFechaBaja"
        )
        .textContent =
        formatearFechaSimple(
            alumno.fechaBaja
        );


    document
        .getElementById(
            "expNfc"
        )
        .textContent =
        textoSeguro(
            alumno.nfcUid
        );


    const tarifa =
        tarifasMap[
            alumno.tarifaId
        ];


    document
        .getElementById(
            "expTarifa"
        )
        .textContent =
        tarifa
            ? tarifa.nombre
            : "—";


    document
        .getElementById(
            "expTipoTarifa"
        )
        .textContent =
        alumno.tipoTarifa === "beca"
            ? "Beca"
            : "Normal";


    document
        .getElementById(
            "expBeca"
        )
        .textContent =

        alumno.tipoTarifa === "beca"

        ? (
            alumno.tipoDescuentoBeca === "monto"

            ? formatearMoneda(
                alumno.montoDescuentoBeca || 0
            )

            : `${Number(
                alumno.porcentajeBeca || 0
            )}%`
        )

        : "—";


    document
        .getElementById(
            "expCuotaBase"
        )
        .textContent =
        formatearMoneda(
            tarifa
                ? tarifa.cuotaBase
                : 0
        );


    document
        .getElementById(
            "expCuotaMensual"
        )
        .textContent =
        formatearMoneda(
            alumno.cuotaMensual
        );


    /* DATOS PERSONALES */

    document
        .getElementById(
            "expNombre"
        )
        .textContent =
        nombreCompleto(
            alumno
        );


    document
        .getElementById(
            "expNacimiento"
        )
        .textContent =
        formatearFechaSimple(
            alumno.fechaNacimiento
        );


    document
        .getElementById(
            "expCorreo"
        )
        .textContent =
        textoSeguro(
            alumno.correo
        );


    document
        .getElementById(
            "expTelefono"
        )
        .textContent =
        textoSeguro(
            alumno.telefono
        );


    document
        .getElementById(
            "expEstadoCivil"
        )
        .textContent =
        textoSeguro(
            alumno.estadoCivil
        );


    document
        .getElementById(
            "expDireccion"
        )
        .textContent =
        textoSeguro(
            alumno.direccion
        );


    /* FOTO */

    const contenedorFoto =
        document.getElementById(
            "contenedorFotoExpediente"
        );


    if (alumno.foto) {

        contenedorFoto.innerHTML = `
            <img
                src="${alumno.foto}"
                class="foto-expediente"
                alt="Foto del alumno"
            >
        `;

    } else {

        contenedorFoto.innerHTML = `
            <div
                class="
                    foto-expediente
                    foto-placeholder
                "
            >
                👤
            </div>
        `;

    }


    cargarDatosEdicion(
        alumno
    );


    document
        .getElementById(
            "resumenCuotaMensual"
        )
        .textContent =
        formatearMoneda(
            alumno.cuotaMensual
        );


    /*
     * Cada vez que abrimos un expediente
     * comenzamos en modo "nuevo pago".
     */

    cancelarEdicionPago();


    prepararFormularioPago(
        alumno
    );


    cargarPagosAlumno(
        alumno.id
    );


    expedienteAsistenciaMes.value =
        obtenerPeriodoActual();

    cerrarPanelAsistenciaManual();

    cerrarPanelHistorialAsistencia();

    cargarAsistenciasAlumno(
      alumno.id
    );


    cancelarEdicionAnualidad();

    prepararFormularioAnualidad(
        alumno
    );

    cargarAnualidadesAlumno(
        alumno.id
    );


    expediente.style.display =
        "block";

    expedienteBackdrop.classList.add(
        "visible"
    );

}


cerrarExpediente.addEventListener(
    "click",
    function() {

        expediente.style.display =
            "none";

        expedienteBackdrop.classList.remove(
            "visible"
        );

        alumnoActual =
            null;

        cancelarEdicionPago();

        cancelarEdicionAnualidad();

    }
);


expedienteBackdrop.addEventListener(
    "click",
    function() {

        cerrarExpediente.click();

    }
);


btnEliminarAlumno.addEventListener(
    "click",
    async function() {

        if (
            !alumnoActual
        ) {
            return;
        }

        const confirmado =
            confirm(
                `¿Seguro que quieres eliminar a ${nombreCompleto(alumnoActual)}? ` +
                `Esto también borra sus pagos registrados y no se puede deshacer.`
            );

        if (
            !confirmado
        ) {
            return;
        }

        btnEliminarAlumno.disabled =
            true;

        btnEliminarAlumno.textContent =
            "Eliminando...";

        try {

            await eliminarAlumnoConPagos(
                alumnoActual.id,
                alumnoActual.nfcUid
            );

            expediente.style.display =
                "none";

            expedienteBackdrop.classList.remove(
                "visible"
            );

            alumnoActual =
                null;

            await cargarAlumnos();

            await cargarCobranzaPeriodo();

        } catch (error) {

            console.error(
                "Error eliminando alumno:",
                error
            );

            alert(
                "No fue posible eliminar al alumno."
            );

        }

        btnEliminarAlumno.disabled =
            false;

        btnEliminarAlumno.textContent =
            "🗑️ Eliminar alumno";

    }
);



/* ======================================================
   EDICIÓN ALUMNO
====================================================== */

function cargarDatosEdicion(
    alumno
) {

    document
        .getElementById(
            "editNombre"
        )
        .value =
        alumno.nombre || "";


    document
        .getElementById(
            "editApellidoPaterno"
        )
        .value =
        alumno.apellidoPaterno || "";


    document
        .getElementById(
            "editApellidoMaterno"
        )
        .value =
        alumno.apellidoMaterno || "";


    document
        .getElementById(
            "editFechaNacimiento"
        )
        .value =
        alumno.fechaNacimiento || "";


    document
        .getElementById(
            "editCorreo"
        )
        .value =
        alumno.correo || "";


    document
        .getElementById(
            "editTelefono"
        )
        .value =
        alumno.telefono || "";


    document
        .getElementById(
            "editDireccion"
        )
        .value =
        alumno.direccion || "";


    document
        .getElementById(
            "editEstadoCivil"
        )
        .value =
        alumno.estadoCivil || "";


    document
        .getElementById(
            "editFechaIngreso"
        )
        .value =
        alumno.fechaIngreso || "";


    document
        .getElementById(
            "editFechaBaja"
        )
        .value =
        alumno.fechaBaja || "";


    document
        .getElementById(
            "editActivo"
        )
        .value =
        alumno.activo === true
            ? "true"
            : "false";


    fijarGrupoEdicion(
        alumno
    );


    document
        .getElementById(
            "editGrado"
        )
        .value =
        alumno.grado || "";


    document
        .getElementById(
            "editNfcUid"
        )
        .value =
        alumno.nfcUid || "";


    selectTarifaEdicion.value =
        alumno.tarifaId || "";


    document
        .getElementById(
            "editTipoTarifa"
        )
        .value =
        alumno.tipoTarifa ||
        "normal";


    document
        .getElementById(
            "editTipoDescuentoBeca"
        )
        .value =
        alumno.tipoDescuentoBeca ||
        "porcentaje";


    document
        .getElementById(
            "editPorcentajeBeca"
        )
        .value =
        Number(
            alumno.porcentajeBeca || 0
        );


    document
        .getElementById(
            "editMontoDescuentoBeca"
        )
        .value =
        Number(
            alumno.montoDescuentoBeca || 0
        );


    fotoBase64Edicion =
        null;


    document
        .getElementById(
            "previewFotoEdicion"
        )
        .style.display =
        "none";


    actualizarEstadoBecaEdicion();

}


btnEditar.addEventListener(
    "click",
    function() {

        document
            .getElementById(
                "panelEdicion"
            )
            .style.display =
            "block";


        document
            .getElementById(
                "panelEdicion"
            )
            .scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

    }
);


cancelarEdicion.addEventListener(
    "click",
    function() {

        document
            .getElementById(
                "panelEdicion"
            )
            .style.display =
            "none";

    }
);


formEdicion.addEventListener(
    "submit",
    async function(e) {

        e.preventDefault();

        if (!alumnoActual) {
            return;
        }

        limpiarMensaje(
            mensajeEdicion
        );


        const tarifaId =
            selectTarifaEdicion.value;

        const tipoTarifa =
            document
                .getElementById(
                    "editTipoTarifa"
                )
                .value;

        const tipoDescuentoBeca =
            tipoTarifa === "beca"
                ? document
                    .getElementById(
                        "editTipoDescuentoBeca"
                    )
                    .value
                : "porcentaje";

        const porcentajeBeca =
            tipoTarifa === "beca" &&
            tipoDescuentoBeca === "porcentaje"
                ? Number(
                    document
                        .getElementById(
                            "editPorcentajeBeca"
                        )
                        .value || 0
                )
                : 0;

        const montoDescuentoBeca =
            tipoTarifa === "beca" &&
            tipoDescuentoBeca === "monto"
                ? Number(
                    document
                        .getElementById(
                            "editMontoDescuentoBeca"
                        )
                        .value || 0
                )
                : 0;


        const cuotaBase =
            obtenerCuotaBaseDeTarifa(
                tarifaId
            );


        const cuotaMensual =
            calcularCuota(
                cuotaBase,
                tipoTarifa,
                tipoDescuentoBeca,
                porcentajeBeca,
                montoDescuentoBeca
            );


        const cambios = {

            nombre:
                document
                    .getElementById(
                        "editNombre"
                    )
                    .value
                    .trim(),

            apellidoPaterno:
                document
                    .getElementById(
                        "editApellidoPaterno"
                    )
                    .value
                    .trim(),

            apellidoMaterno:
                document
                    .getElementById(
                        "editApellidoMaterno"
                    )
                    .value
                    .trim(),

            fechaNacimiento:
                document
                    .getElementById(
                        "editFechaNacimiento"
                    )
                    .value,

            correo:
                document
                    .getElementById(
                        "editCorreo"
                    )
                    .value
                    .trim(),

            telefono:
                document
                    .getElementById(
                        "editTelefono"
                    )
                    .value
                    .trim(),

            direccion:
                document
                    .getElementById(
                        "editDireccion"
                    )
                    .value
                    .trim(),

            estadoCivil:
                document
                    .getElementById(
                        "editEstadoCivil"
                    )
                    .value,

            fechaIngreso:
                document
                    .getElementById(
                        "editFechaIngreso"
                    )
                    .value,

            fechaBaja:
                document
                    .getElementById(
                        "editFechaBaja"
                    )
                    .value,

            activo:
                document
                    .getElementById(
                        "editActivo"
                    )
                    .value === "true",

            grupo:
                document
                    .getElementById(
                        "editGrupo"
                    )
                    .value
                    .trim(),

            grado:
                document
                    .getElementById(
                        "editGrado"
                    )
                    .value
                    .trim(),

            nfcUid:
                document
                    .getElementById(
                        "editNfcUid"
                    )
                    .value
                    .trim(),

            tarifaId,

            tipoTarifa,

            tipoDescuentoBeca,

            porcentajeBeca,

            montoDescuentoBeca,

            cuotaMensual

        };


        if (
            fotoBase64Edicion
        ) {

            cambios.foto =
                fotoBase64Edicion;

        }


        try {

            const nfcUidAnterior =
                alumnoActual.nfcUid ||
                "";

            await updateDoc(
                doc(
                    db,
                    "alumnos",
                    alumnoActual.id
                ),
                cambios
            );


            await sincronizarDirectorioNfc(
                alumnoActual.id,
                {
                    ...alumnoActual,
                    ...cambios
                },
                nfcUidAnterior
            );


            mostrarMensaje(
                mensajeEdicion,
                "Cambios guardados correctamente.",
                "ok"
            );


            await cargarAlumnos();

            await cargarCobranzaPeriodo();


            const alumnoActualizado =
                alumnos.find(
                    alumno =>
                        alumno.id ===
                        alumnoActual.id
                );


            if (
                alumnoActualizado
            ) {

                alumnoActual =
                    alumnoActualizado;

                mostrarExpediente(
                    alumnoActualizado
                );

            }


        } catch (error) {

            console.error(error);

            mostrarMensaje(
                mensajeEdicion,
                "No fue posible guardar los cambios.",
                "error"
            );

        }

    }
);



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




