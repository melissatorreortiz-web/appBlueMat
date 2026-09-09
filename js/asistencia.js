// Blue Mat Academy - módulo separado

/* ======================================================
   ASISTENCIA POR GRUPO
====================================================== */

/*
 * item de asistenciaAlumnosGrupo:
 * {
 *   alumno,
 *   presente: bool,
 *   origenExistente: "kiosco" | "manual" | null,
 *   idExistente: string | null (id del doc en "asistencias" si ya existía)
 * }
 */

let asistenciaAlumnosGrupo = [];

let asistenciaFiltroActual =
    "todos";

/*
 * Todas las asistencias (todo el tiempo) del
 * alumno que está abierto en el expediente,
 * para no volver a consultarlas cada vez que
 * cambia el mes seleccionado en el resumen.
 */
let asistenciasAlumnoActualCache = [];


function obtenerRangoDelDia(
    fechaTexto
) {

    return {

        inicio:
            new Date(
                `${fechaTexto}T00:00:00`
            ),

        fin:
            new Date(
                `${fechaTexto}T23:59:59.999`
            )

    };

}


navBtnAsistencia.addEventListener(
    "click",
    function() {

        if (
            !asistenciaFecha.value
        ) {

            asistenciaFecha.value =
                obtenerFechaHoy();

        }

    }
);


btnCargarAsistenciaGrupo.addEventListener(
    "click",
    async function() {

        limpiarMensaje(
            mensajeAsistenciaGrupo
        );

        const grupo =
            asistenciaGrupoSelect.value;

        const fechaTexto =
            asistenciaFecha.value;

        if (
            !grupo ||
            !fechaTexto
        ) {

            mostrarMensaje(
                mensajeAsistenciaGrupo,
                "Selecciona un grupo y una fecha.",
                "error"
            );

            return;

        }

        listaAsistenciaGrupo.innerHTML = `
            <div style="padding:20px;text-align:center;color:#6b7280;">
                Cargando...
            </div>
        `;

        const alumnosDelGrupo =
            alumnos.filter(
                a =>
                    a.grupo === grupo &&
                    a.activo === true
            );

        if (
            alumnosDelGrupo.length === 0
        ) {

            asistenciaAlumnosGrupo = [];

            listaAsistenciaGrupo.innerHTML = `
                <div style="padding:20px;text-align:center;color:#6b7280;">
                    No hay alumnos activos en este grupo.
                </div>
            `;

            actualizarResumenAsistencia();

            return;

        }

        try {

            const {
                inicio,
                fin
            } = obtenerRangoDelDia(
                fechaTexto
            );

            const consulta =
                query(
                    collection(
                        db,
                        "asistencias"
                    ),
                    where(
                        "fecha",
                        ">=",
                        Timestamp.fromDate(
                            inicio
                        )
                    ),
                    where(
                        "fecha",
                        "<=",
                        Timestamp.fromDate(
                            fin
                        )
                    )
                );

            const snapshot =
                await getDocs(
                    consulta
                );

            const registrosPorAlumno = {};

            snapshot.forEach(
                documento => {

                    const registro = {
                        id: documento.id,
                        ...documento.data()
                    };

                    registrosPorAlumno[
                        registro.alumnoId
                    ] = registro;

                }
            );

            asistenciaAlumnosGrupo =
                alumnosDelGrupo
                    .map(
                        alumno => {

                            const registro =
                                registrosPorAlumno[
                                    alumno.id
                                ];

                            return {

                                alumno,

                                presente:
                                    !!registro,

                                origenExistente:
                                    registro
                                        ? (registro.origen || "manual")
                                        : null,

                                idExistente:
                                    registro
                                        ? registro.id
                                        : null

                            };

                        }
                    )
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
                    );

            renderizarListaAsistenciaGrupo();

        } catch (error) {

            console.error(
                "Error cargando asistencia del grupo:",
                error
            );

            listaAsistenciaGrupo.innerHTML = `
                <div style="padding:20px;text-align:center;color:#6b7280;">
                    No fue posible cargar la asistencia.
                </div>
            `;

        }

    }
);


function renderizarListaAsistenciaGrupo() {

    const filtrados =
        asistenciaAlumnosGrupo.filter(
            item => {

                if (
                    asistenciaFiltroActual === "presentes"
                ) {
                    return item.presente;
                }

                if (
                    asistenciaFiltroActual === "ausentes"
                ) {
                    return !item.presente;
                }

                return true;

            }
        );


    if (
        filtrados.length === 0
    ) {

        listaAsistenciaGrupo.innerHTML = `
            <div style="padding:20px;text-align:center;color:#6b7280;">
                Nadie coincide con este filtro.
            </div>
        `;

    } else {

        listaAsistenciaGrupo.innerHTML =
            filtrados
                .map(
                    item => `
                        <div
                            class="fila-asistencia"
                        >
                            <label>
                                <input
                                    type="checkbox"
                                    class="check-asistencia-alumno"
                                    data-id="${item.alumno.id}"
                                    ${
                                        item.presente
                                            ? "checked"
                                            : ""
                                    }
                                >
                                <span>
                                    ${escaparHtml(
                                        nombreCompleto(
                                            item.alumno
                                        )
                                    )}
                                </span>
                            </label>

                            <span>
                                ${
                                    item.presente

                                    ? (
                                        item.origenExistente === "kiosco"

                                        ? '<span class="badge-cobranza pagado">🟢 Presente (NFC)</span>'

                                        : '<span class="badge-cobranza pagado">🟢 Presente</span>'
                                    )

                                    : '<span class="badge-cobranza no_pagado">🔴 Ausente</span>'
                                }
                            </span>
                        </div>
                    `
                )
                .join("");


        listaAsistenciaGrupo
            .querySelectorAll(
                ".check-asistencia-alumno"
            )
            .forEach(
                casilla => {

                    casilla.addEventListener(
                        "change",
                        function() {

                            const item =
                                asistenciaAlumnosGrupo.find(
                                    i =>
                                        i.alumno.id ===
                                        this.dataset.id
                                );

                            if (item) {

                                item.presente =
                                    this.checked;

                            }

                            renderizarListaAsistenciaGrupo();

                        }
                    );

                }
            );

    }

    actualizarResumenAsistencia();

}


function actualizarResumenAsistencia() {

    const total =
        asistenciaAlumnosGrupo.length;

    const presentes =
        asistenciaAlumnosGrupo.filter(
            i => i.presente
        ).length;

    document.getElementById(
        "asistenciaTotalAlumnos"
    ).textContent =
        total;

    document.getElementById(
        "asistenciaTotalPresentes"
    ).textContent =
        presentes;

    document.getElementById(
        "asistenciaTotalAusentes"
    ).textContent =
        total - presentes;

}


btnMarcarTodosPresentes.addEventListener(
    "click",
    function() {

        asistenciaAlumnosGrupo.forEach(
            item => {

                item.presente =
                    true;

            }
        );

        renderizarListaAsistenciaGrupo();

    }
);


document
    .querySelectorAll(
        ".filtro-asistencia-grupo"
    )
    .forEach(
        boton => {

            boton.addEventListener(
                "click",
                function() {

                    document
                        .querySelectorAll(
                            ".filtro-asistencia-grupo"
                        )
                        .forEach(
                            b => {
                                b.classList.remove(
                                    "activo"
                                );
                            }
                        );

                    this.classList.add(
                        "activo"
                    );

                    asistenciaFiltroActual =
                        this.dataset.filtro;

                    renderizarListaAsistenciaGrupo();

                }
            );

        }
    );


btnGuardarAsistenciaGrupo.addEventListener(
    "click",
    async function() {

        limpiarMensaje(
            mensajeAsistenciaGrupo
        );

        if (
            asistenciaAlumnosGrupo.length === 0
        ) {

            mostrarMensaje(
                mensajeAsistenciaGrupo,
                "Primero carga un grupo.",
                "error"
            );

            return;

        }

        const fechaTexto =
            asistenciaFecha.value;

        const porGuardar =
            asistenciaAlumnosGrupo.filter(
                item =>
                    item.presente &&
                    !item.idExistente
            );

        if (
            porGuardar.length === 0
        ) {

            mostrarMensaje(
                mensajeAsistenciaGrupo,
                "No hay nada nuevo que guardar (ya estaba registrado, o nadie está marcado presente).",
                "ok"
            );

            return;

        }

        btnGuardarAsistenciaGrupo.disabled =
            true;

        btnGuardarAsistenciaGrupo.textContent =
            "Guardando...";

        /*
         * Usamos el mediodía de la fecha elegida
         * (no serverTimestamp) para poder registrar
         * también clases de días anteriores, no
         * solo la de hoy.
         */

        const fechaTimestamp =
            Timestamp.fromDate(
                new Date(
                    `${fechaTexto}T12:00:00`
                )
            );

        let exitosos = 0;

        let fallidos = 0;

        for (
            const item
            of porGuardar
        ) {

            try {

                await addDoc(
                    collection(
                        db,
                        "asistencias"
                    ),
                    {

                        alumnoId:
                            item.alumno.id,

                        nombre:
                            nombreCompleto(
                                item.alumno
                            ),

                        fecha:
                            fechaTimestamp,

                        origen:
                            "manual"

                    }
                );

                exitosos++;

            } catch (error) {

                console.error(
                    "Error guardando asistencia:",
                    error
                );

                fallidos++;

            }

        }

        btnGuardarAsistenciaGrupo.disabled =
            false;

        btnGuardarAsistenciaGrupo.textContent =
            "💾 Guardar asistencia";

        mostrarMensaje(
            mensajeAsistenciaGrupo,
            `Asistencia guardada: ${exitosos} alumno(s).${
                fallidos
                    ? ` ${fallidos} no se pudieron guardar.`
                    : ""
            }`,
            fallidos ? "error" : "ok"
        );

        btnCargarAsistenciaGrupo.click();

    }
);



/* ======================================================
   RESUMEN DE ASISTENCIA POR ALUMNO (expediente)
====================================================== */

async function actualizarResumenAsistenciaAlumnoPorMes(
    alumnoId
) {

    const mesTexto =
        expedienteAsistenciaMes.value ||
        obtenerPeriodoActual();

    const alumno =
        alumnos.find(
            a => a.id === alumnoId
        );

    if (!alumno) {
        return;
    }

    if (!alumno.grupo) {
        resumenAsistenciaAlumno.innerHTML = `
            <div class="cargando-asistencia">
                Este alumno no tiene grupo asignado.
            </div>
        `;
        return;
    }

    const grupo =
        grupos.find(
            g => g.nombre === alumno.grupo
        );

    if (!grupo) {
        resumenAsistenciaAlumno.innerHTML = `
            <div class="cargando-asistencia">
                El grupo de este alumno no existe en el catálogo.
            </div>
        `;
        return;
    }

    const disciplina =
        grupo.disciplina || "";

    /* COMBATIVES: solamente contamos clases asistidas. */
    if (disciplina === "combatives") {

        const diasAsistidos = new Set();

        asistenciasAlumnoActualCache.forEach(
            registro => {
                if (!registro.fecha?.toDate) {
                    return;
                }

                const fecha = registro.fecha.toDate();
                const mesRegistro =
                    `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;

                if (mesRegistro !== mesTexto) {
                    return;
                }

                diasAsistidos.add(
                    `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`
                );
            }
        );

        resumenAsistenciaAlumno.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px;">
                <strong style="font-size:20px;">
                    ${diasAsistidos.size} clase(s) asistida(s)
                </strong>
                <span style="color:#6b7280;font-size:13px;text-transform:capitalize;">
                    ${nombreMesDesdePeriodo(mesTexto)}
                </span>
            </div>
        `;

        return;
    }

    if (disciplina !== "taekwondo") {
        resumenAsistenciaAlumno.innerHTML = `
            <div class="cargando-asistencia">
                Configura la disciplina del grupo para calcular la asistencia.
            </div>
        `;
        return;
    }

    const diasClase =
        Array.isArray(grupo.diasClase)
            ? grupo.diasClase.map(Number)
            : [];

    if (diasClase.length === 0) {
        resumenAsistenciaAlumno.innerHTML = `
            <div class="cargando-asistencia">
                Este grupo todavía no tiene días de clase configurados.
            </div>
        `;
        return;
    }

    resumenAsistenciaAlumno.innerHTML = `
        <div class="cargando-asistencia">
            Calculando...
        </div>
    `;

    const [anio, mes] = mesTexto.split("-").map(Number);

    const hoy = new Date();
    const esMesActual =
        hoy.getFullYear() === anio &&
        hoy.getMonth() + 1 === mes;

    const ultimoDia =
        esMesActual
            ? hoy.getDate()
            : new Date(anio, mes, 0).getDate();

    const fechasClase = new Set();

    for (let dia = 1; dia <= ultimoDia; dia++) {
        const fecha = new Date(anio, mes - 1, dia);

        if (diasClase.includes(fecha.getDay())) {
            fechasClase.add(
                `${anio}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`
            );
        }
    }

    const diasAsistidosPorAlumno = new Set();

    asistenciasAlumnoActualCache.forEach(
        registro => {
            if (!registro.fecha?.toDate) {
                return;
            }

            const fecha = registro.fecha.toDate();
            const mesRegistro =
                `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;

            if (mesRegistro !== mesTexto) {
                return;
            }

            const fechaTexto =
                `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;

            if (fechasClase.has(fechaTexto)) {
                diasAsistidosPorAlumno.add(fechaTexto);
            }
        }
    );

    renderizarBarraAsistenciaAlumno(
        diasAsistidosPorAlumno.size,
        fechasClase.size
    );

}


function renderizarBarraAsistenciaAlumno(
    asistidos,
    totalDiasClase
) {

    if (
        totalDiasClase === 0
    ) {

        resumenAsistenciaAlumno.innerHTML = `
            <div class="cargando-asistencia">
                Sin clases registradas de este grupo en el mes seleccionado.
            </div>
        `;

        return;

    }

    const porcentaje =
        Math.round(
            (asistidos / totalDiasClase) * 100
        );

    resumenAsistenciaAlumno.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px;">
            <strong style="font-size:20px;">
                ${porcentaje}% de asistencia
            </strong>
            <span style="color:#6b7280;font-size:13px;">
                ${asistidos} de ${totalDiasClase} día(s) de clase
            </span>
        </div>
        <div class="barra-asistencia">
            <div
                class="barra-asistencia-relleno"
                style="width:${porcentaje}%;"
            ></div>
        </div>
    `;

}


expedienteAsistenciaMes.addEventListener(
    "change",
    function() {

        if (
            alumnoActual
        ) {

            actualizarResumenAsistenciaAlumnoPorMes(
                alumnoActual.id
            );

        }

    }
);


function cerrarPanelAsistenciaManual() {

    panelAsistenciaManual.classList.remove(
        "abierto"
    );

    btnToggleAsistenciaManual.classList.remove(
        "abierto"
    );

}


btnToggleAsistenciaManual.addEventListener(
    "click",
    function() {

        const abierto =
            panelAsistenciaManual.classList.contains(
                "abierto"
            );

        if (abierto) {

            cerrarPanelAsistenciaManual();

        } else {

            panelAsistenciaManual.classList.add(
                "abierto"
            );

            btnToggleAsistenciaManual.classList.add(
                "abierto"
            );

        }

    }
);


function cerrarPanelHistorialAsistencia() {

    panelHistorialAsistencia.classList.remove(
        "abierto"
    );

    btnToggleHistorialAsistencia.classList.remove(
        "abierto"
    );

}


btnToggleHistorialAsistencia.addEventListener(
    "click",
    function() {

        const abierto =
            panelHistorialAsistencia.classList.contains(
                "abierto"
            );

        if (abierto) {

            cerrarPanelHistorialAsistencia();

        } else {

            panelHistorialAsistencia.classList.add(
                "abierto"
            );

            btnToggleHistorialAsistencia.classList.add(
                "abierto"
            );

        }

    }
);



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
