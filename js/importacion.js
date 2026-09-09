/* ======================================================
   ASISTENCIAS
====================================================== */
/* ======================================================
   REGISTRAR ASISTENCIA MANUAL
====================================================== */

async function registrarAsistenciaManual() {

    if (!alumnoActual) {

        alert(
            "No hay un alumno seleccionado."
        );

        return;

    }


    const inputFecha =
        document.getElementById(
            "fechaAsistenciaManual"
        );


    const inputHora =
        document.getElementById(
            "horaAsistenciaManual"
        );


    const fecha =
        inputFecha.value;


    const hora =
        inputHora.value;


    if (
        !fecha ||
        !hora
    ) {

        alert(
            "Selecciona la fecha y la hora."
        );

        return;

    }


    try {

        const fechaHora =
            new Date(
                `${fecha}T${hora}`
            );


        if (
            isNaN(
                fechaHora.getTime()
            )
        ) {

            alert(
                "La fecha o la hora no son válidas."
            );

            return;

        }


        await addDoc(
            collection(
                db,
                "asistencias"
            ),
            {
                alumnoId:
                    alumnoActual.id,

                nombre:
                    nombreCompleto(
                        alumnoActual
                    ),

                fecha:
                    Timestamp.fromDate(
                        fechaHora
                    ),

                origen:
                    "manual"
            }
        );


        alert(
            "Asistencia registrada correctamente."
        );


        await cargarAsistenciasAlumno(
            alumnoActual.id
        );


        establecerFechaHoraAsistencia();


    } catch (error) {

        console.error(
            "Error registrando asistencia:",
            error
        );


        alert(
            "No fue posible registrar la asistencia."
        );

    }

}


/* ======================================================
   ESTABLECER FECHA Y HORA ACTUALES
====================================================== */

function establecerFechaHoraAsistencia() {

    const inputFecha =
        document.getElementById(
            "fechaAsistenciaManual"
        );


    const inputHora =
        document.getElementById(
            "horaAsistenciaManual"
        );


    if (
        !inputFecha ||
        !inputHora
    ) {

        return;

    }


    const ahora =
        new Date();


    const anio =
        ahora.getFullYear();


    const mes =
        String(
            ahora.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const dia =
        String(
            ahora.getDate()
        ).padStart(
            2,
            "0"
        );


    const hora =
        String(
            ahora.getHours()
        ).padStart(
            2,
            "0"
        );


    const minutos =
        String(
            ahora.getMinutes()
        ).padStart(
            2,
            "0"
        );


    inputFecha.value =
        `${anio}-${mes}-${dia}`;


    inputHora.value =
        `${hora}:${minutos}`;

}

async function cargarAsistenciasAlumno(
    alumnoId
) {

    const contenedor =
        document.getElementById(
            "listaAsistenciasAlumno"
        );

    const contadorAnio =
        document.getElementById(
            "expAsistenciasAnio"
        );

    const ultimaAsistencia =
        document.getElementById(
            "expUltimaAsistencia"
        );


    if (!contenedor) {
        return;
    }


    contenedor.innerHTML = `
        <div class="cargando-asistencia">
            Cargando asistencias...
        </div>
    `;


    try {

        const consulta =
            query(
                collection(
                    db,
                    "asistencias"
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


        const asistencias =
            snapshot.docs.map(
                documento => {

                    return {
                        id: documento.id,
                        ...documento.data()
                    };

                }
            );


        /*
         * Ordenar de la más reciente
         * a la más antigua.
         */

        asistencias.sort(
            function(a, b) {

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


        /*
         * Si no hay asistencias.
         */

        if (
            asistencias.length === 0
        ) {

            asistenciasAlumnoActualCache =
                [];

            contadorAnio.textContent =
                "0";

            ultimaAsistencia.textContent =
                "—";


            contenedor.innerHTML = `
                <div class="sin-asistencias">
                    📋 No hay asistencias registradas.
                </div>
            `;

            await actualizarResumenAsistenciaAlumnoPorMes(
                alumnoId
            );

            return;

        }


        /*
         * Contadores.
         */

        const ahora =
            new Date();

        const mesActual =
            ahora.getMonth();

        const anioActual =
            ahora.getFullYear();


        let asistenciasMes =
            0;

        let asistenciasAnio =
            0;


        asistencias.forEach(
            function(asistencia) {

                if (
                    !asistencia.fecha?.toDate
                ) {

                    return;

                }


                const fecha =
                    asistencia.fecha.toDate();


                if (
                    fecha.getFullYear()
                    ===
                    anioActual
                ) {

                    asistenciasAnio++;


                    if (
                        fecha.getMonth()
                        ===
                        mesActual
                    ) {

                        asistenciasMes++;

                    }

                }

            }
        );


        contadorAnio.textContent =
            asistenciasAnio;


        asistenciasAlumnoActualCache =
            asistencias;

        await actualizarResumenAsistenciaAlumnoPorMes(
            alumnoId
        );


        /*
         * Última asistencia.
         */

        const ultima =
            asistencias[0];


        if (
            ultima.fecha?.toDate
        ) {

            ultimaAsistencia.textContent =
                formatearFechaHoraAsistencia(
                    ultima.fecha.toDate()
                );

        } else {

            ultimaAsistencia.textContent =
                "—";

        }


        /*
         * Construir historial.
         */

        contenedor.innerHTML =
            asistencias
                .map(
                    function(asistencia) {

                        const fecha =
                            asistencia.fecha?.toDate
                                ? asistencia.fecha.toDate()
                                : null;


                        if (!fecha) {

                            return "";

                        }


                        const fechaTexto =
                            fecha.toLocaleDateString(
                                "es-MX",
                                {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric"
                                }
                            );


                        const horaTexto =
                            fecha.toLocaleTimeString(
                                "es-MX",
                                {
                                    hour: "2-digit",
                                    minute: "2-digit"
                                }
                            );


                        const origen =
                            asistencia.origen === "kiosco"
                                ? "🪪 Kiosco"
                                : asistencia.origen === "manual"
                                    ? "✍️ Manual"
                                    : asistencia.origen || "—";


                        return `

                            <div class="fila-asistencia-alumno">

                                <span>
                                    ${fechaTexto}
                                </span>


                                <span>
                                    ${horaTexto}
                                </span>


                                <span>
                                    ${origen}
                                </span>


                                <span>

                                    <button
                                        type="button"
                                        onclick="editarAsistencia('${asistencia.id}')"
                                        title="Editar asistencia"
                                    >
                                        ✏️
                                    </button>


                                    <button
                                        type="button"
                                        onclick="eliminarAsistencia('${asistencia.id}')"
                                        title="Eliminar asistencia"
                                    >
                                        🗑️
                                    </button>

                                </span>

                            </div>

                        `;

                    }
                )
                .join("");


    } catch (error) {

        console.error(
            "Error cargando asistencias:",
            error
        );


        contadorAnio.textContent =
            "—";

        ultimaAsistencia.textContent =
            "—";


        contenedor.innerHTML = `
            <div class="error-asistencia">
                ⚠️ No fue posible cargar
                el historial de asistencias.
            </div>
        `;

        asistenciasAlumnoActualCache =
            [];

        resumenAsistenciaAlumno.innerHTML = `
            <div class="cargando-asistencia">
                No fue posible calcular el resumen.
            </div>
        `;

    }

}


/* ======================================================
   FORMATEAR FECHA Y HORA
====================================================== */

function formatearFechaHoraAsistencia(
    fecha
) {

    return fecha.toLocaleDateString(
        "es-MX",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    )
    +
    " "
    +
    fecha.toLocaleTimeString(
        "es-MX",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/* ======================================================
   EDITAR ASISTENCIA
====================================================== */

async function editarAsistencia(
    asistenciaId
) {

    try {

        const asistenciaRef =
            doc(
                db,
                "asistencias",
                asistenciaId
            );


        const asistenciaSnap =
            await getDoc(
                asistenciaRef
            );


        if (
            !asistenciaSnap.exists()
        ) {

            alert(
                "La asistencia ya no existe."
            );

            return;

        }


        const asistencia =
            asistenciaSnap.data();


        if (
            !asistencia.fecha?.toDate
        ) {

            alert(
                "Esta asistencia no tiene una fecha válida."
            );

            return;

        }


        const fecha =
            asistencia.fecha.toDate();


        const anio =
            fecha.getFullYear();


        const mes =
            String(
                fecha.getMonth() + 1
            ).padStart(
                2,
                "0"
            );


        const dia =
            String(
                fecha.getDate()
            ).padStart(
                2,
                "0"
            );


        const hora =
            String(
                fecha.getHours()
            ).padStart(
                2,
                "0"
            );


        const minutos =
            String(
                fecha.getMinutes()
            ).padStart(
                2,
                "0"
            );


        /*
         * Pedir nueva fecha.
         */

        const nuevaFecha =
            prompt(
                "Nueva fecha (AAAA-MM-DD):",
                `${anio}-${mes}-${dia}`
            );


        if (
            nuevaFecha === null
        ) {

            return;

        }


        /*
         * Pedir nueva hora.
         */

        const nuevaHora =
            prompt(
                "Nueva hora (HH:MM):",
                `${hora}:${minutos}`
            );


        if (
            nuevaHora === null
        ) {

            return;

        }


        /*
         * Crear nueva fecha.
         */

        const nuevaFechaHora =
            new Date(
                `${nuevaFecha}T${nuevaHora}`
            );


        if (
            isNaN(
                nuevaFechaHora.getTime()
            )
        ) {

            alert(
                "La fecha o la hora no son válidas."
            );

            return;

        }


        /*
         * Guardar cambios.
         */

        await updateDoc(
            asistenciaRef,
            {
                fecha:
                    Timestamp.fromDate(
                        nuevaFechaHora
                    ),

                origen:
                    "manual"
            }
        );


        alert(
            "Asistencia actualizada correctamente."
        );


        /*
         * Recargar historial.
         */

        await cargarAsistenciasAlumno(
            alumnoActual.id
        );


    } catch (error) {

        console.error(
            "Error editando asistencia:",
            error
        );


        alert(
            "No fue posible editar la asistencia."
        );

    }

}


/* ======================================================
   ELIMINAR ASISTENCIA
====================================================== */

async function eliminarAsistencia(
    asistenciaId
) {

    const confirmar =
        confirm(
            "¿Seguro que quieres eliminar esta asistencia?\n\nEsta acción no se puede deshacer."
        );


    if (
        !confirmar
    ) {

        return;

    }


    try {

        await deleteDoc(
            doc(
                db,
                "asistencias",
                asistenciaId
            )
        );


        alert(
            "Asistencia eliminada correctamente."
        );


        /*
         * Recargar historial.
         */

        await cargarAsistenciasAlumno(
            alumnoActual.id
        );


    } catch (error) {

        console.error(
            "Error eliminando asistencia:",
            error
        );


        alert(
            "No fue posible eliminar la asistencia."
        );

    }

}


/* ======================================================
   HACER LAS FUNCIONES DISPONIBLES
   PARA LOS BOTONES HTML
====================================================== */

window.editarAsistencia =
    editarAsistencia;

window.eliminarAsistencia =
    eliminarAsistencia;



document
    .getElementById(
        "btnRegistrarAsistenciaManual"
    )
    ?.addEventListener(
        "click",
        registrarAsistenciaManual
    );


/* ======================================================
   COBRANZA MENSUAL
====================================================== */

btnCargarCobranza.addEventListener(
    "click",
    async function() {

        cobranzaCargadaAlMenosUnaVez =
            true;

        await cargarCobranzaPeriodo();

    }
);


cobranzaPeriodoInput.addEventListener(
    "change",
    function() {

        if (
            !cobranzaCargadaAlMenosUnaVez
        ) {
            return;
        }

        cargarCobranzaPeriodo();

    }
);

cobranzaFiltroEstadoAlumno.addEventListener(
    "change",
    function() {

        if (
            !cobranzaCargadaAlMenosUnaVez
        ) {
            return;
        }

        renderizarCobranza();

    }
);

cobranzaFiltroPago.addEventListener(
    "change",
    function() {

        if (
            !cobranzaCargadaAlMenosUnaVez
        ) {
            return;
        }

        renderizarCobranza();

    }
);




