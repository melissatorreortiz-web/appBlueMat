// Blue Mat Academy - módulo separado

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


/* Recuperado del módulo original */
function calcularCuota(
    cuotaBase,
    tipoTarifa,
    tipoDescuentoBeca,
    porcentajeBeca,
    montoDescuentoBeca
) {

    const base =
        Number(cuotaBase || 0);

    if (
        tipoTarifa !== "beca"
    ) {
        return base;
    }

    if (
        tipoDescuentoBeca === "monto"
    ) {

        const descuento =
            Number(
                montoDescuentoBeca || 0
            );

        const resultado =
            base - descuento;

        return resultado > 0
            ? resultado
            : 0;

    }

    const porcentaje =
        Number(
            porcentajeBeca || 0
        );

    return base *
        (
            1 -
            porcentaje / 100
        );

}


/* Recuperado del módulo original */
function obtenerCuotaBaseDeTarifa(
    tarifaId
) {

    if (
        !tarifaId ||
        !tarifasMap[tarifaId]
    ) {

        return 0;

    }

    return Number(
        tarifasMap[
            tarifaId
        ].cuotaBase || 0
    );

}


/* Recuperado del módulo original */
function actualizarCuotaNueva() {

    const tarifaId =
        selectTarifaAlta.value;

    const tipo =
        document
            .getElementById(
                "tipoTarifa"
            )
            .value;

    const tipoDescuento =
        document
            .getElementById(
                "tipoDescuentoBeca"
            )
            .value;

    const porcentaje =
        Number(
            document
                .getElementById(
                    "porcentajeBeca"
                )
                .value || 0
        );

    const monto =
        Number(
            document
                .getElementById(
                    "montoDescuentoBeca"
                )
                .value || 0
        );

    const cuotaBase =
        obtenerCuotaBaseDeTarifa(
            tarifaId
        );

    const cuota =
        calcularCuota(
            cuotaBase,
            tipo,
            tipoDescuento,
            porcentaje,
            monto
        );

    document
        .getElementById(
            "cuotaMensualVista"
        )
        .textContent =
        formatearMoneda(
            cuota
        );

}


/* Recuperado del módulo original */
function actualizarCuotaEdicion() {

    const tarifaId =
        selectTarifaEdicion.value;

    const tipo =
        document
            .getElementById(
                "editTipoTarifa"
            )
            .value;

    const tipoDescuento =
        document
            .getElementById(
                "editTipoDescuentoBeca"
            )
            .value;

    const porcentaje =
        Number(
            document
                .getElementById(
                    "editPorcentajeBeca"
                )
                .value || 0
        );

    const monto =
        Number(
            document
                .getElementById(
                    "editMontoDescuentoBeca"
                )
                .value || 0
        );

    const cuotaBase =
        obtenerCuotaBaseDeTarifa(
            tarifaId
        );

    const cuota =
        calcularCuota(
            cuotaBase,
            tipo,
            tipoDescuento,
            porcentaje,
            monto
        );

    document
        .getElementById(
            "editCuotaMensualVista"
        )
        .textContent =
        formatearMoneda(
            cuota
        );

}


/* Recuperado del módulo original */
function actualizarCamposTipoDescuentoAlta() {

    const tipoDescuento =
        document
            .getElementById(
                "tipoDescuentoBeca"
            )
            .value;

    document
        .getElementById(
            "campoPorcentajeBeca"
        )
        .style.display =
        tipoDescuento === "porcentaje"
            ? "flex"
            : "none";

    document
        .getElementById(
            "campoMontoDescuentoBeca"
        )
        .style.display =
        tipoDescuento === "monto"
            ? "flex"
            : "none";

    actualizarCuotaNueva();

}


/* Recuperado del módulo original */
function actualizarEstadoBecaAlta() {

    const tipo =
        document
            .getElementById(
                "tipoTarifa"
            )
            .value;

    const campoTipoDescuento =
        document.getElementById(
            "campoTipoDescuentoBeca"
        );

    campoTipoDescuento.style.display =
        tipo === "beca"
            ? "flex"
            : "none";

    if (
        tipo !== "beca"
    ) {

        document
            .getElementById(
                "porcentajeBeca"
            )
            .value = 0;

        document
            .getElementById(
                "montoDescuentoBeca"
            )
            .value = 0;

        document
            .getElementById(
                "campoPorcentajeBeca"
            )
            .style.display =
            "none";

        document
            .getElementById(
                "campoMontoDescuentoBeca"
            )
            .style.display =
            "none";

        actualizarCuotaNueva();

    } else {

        actualizarCamposTipoDescuentoAlta();

    }

}


/* Recuperado del módulo original */
function actualizarCamposTipoDescuentoEdicion() {

    const tipoDescuento =
        document
            .getElementById(
                "editTipoDescuentoBeca"
            )
            .value;

    document
        .getElementById(
            "campoEditPorcentajeBeca"
        )
        .style.display =
        tipoDescuento === "porcentaje"
            ? "flex"
            : "none";

    document
        .getElementById(
            "campoEditMontoDescuentoBeca"
        )
        .style.display =
        tipoDescuento === "monto"
            ? "flex"
            : "none";

    actualizarCuotaEdicion();

}


/* Recuperado del módulo original */
function actualizarEstadoBecaEdicion() {

    const tipo =
        document
            .getElementById(
                "editTipoTarifa"
            )
            .value;

    const campoTipoDescuento =
        document.getElementById(
            "campoEditTipoDescuentoBeca"
        );

    campoTipoDescuento.style.display =
        tipo === "beca"
            ? "flex"
            : "none";

    if (
        tipo !== "beca"
    ) {

        document
            .getElementById(
                "editPorcentajeBeca"
            )
            .value = 0;

        document
            .getElementById(
                "editMontoDescuentoBeca"
            )
            .value = 0;

        document
            .getElementById(
                "campoEditPorcentajeBeca"
            )
            .style.display =
            "none";

        document
            .getElementById(
                "campoEditMontoDescuentoBeca"
            )
            .style.display =
            "none";

        actualizarCuotaEdicion();

    } else {

        actualizarCamposTipoDescuentoEdicion();

    }

}


/* Recuperado del módulo original */
function cerrarPanelAlta() {

    panelAltaAlumno.classList.remove(
        "abierto"
    );

    btnToggleAlta.classList.remove(
        "abierto"
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

}
