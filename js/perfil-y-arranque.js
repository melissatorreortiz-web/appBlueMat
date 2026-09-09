/* ======================================================
   IMPORTAR ALUMNOS DESDE SHEETS
====================================================== */

const CAMPOS_DESTINO_IMPORTACION = [
    { value: "ignorar", label: "(Ignorar esta columna)" },
    { value: "nombre", label: "Nombre" },
    { value: "apellidoPaterno", label: "Apellido paterno" },
    { value: "apellidoMaterno", label: "Apellido materno" },
    { value: "fechaNacimiento", label: "Fecha de nacimiento" },
    { value: "correo", label: "Correo" },
    { value: "telefono", label: "Teléfono" },
    { value: "direccion", label: "Dirección" },
    { value: "estadoCivil", label: "Estado civil" },
    { value: "fechaIngreso", label: "Fecha de ingreso" },
    { value: "nfcUid", label: "NFC UID" },
    { value: "grupo", label: "Grupo (catálogo)" },
    { value: "tarifa", label: "Tarifa / cuota" },
    { value: "pagoEstado", label: "Pago: estado" },
    { value: "pagoMonto", label: "Pago: monto" },
    { value: "pagoFecha", label: "Pago: fecha de pago" },
    { value: "pagoMetodo", label: "Pago: método" },
    { value: "pagoNota", label: "Pago: nota" }
];


function parseFechaFlexible(texto) {

    const valor =
        String(texto || "").trim();

    if (!valor) {
        return "";
    }

    let coincide =
        valor.match(
            /^(\d{4})-(\d{1,2})-(\d{1,2})$/
        );

    if (coincide) {

        return `${coincide[1]}-${coincide[2].padStart(2, "0")}-${coincide[3].padStart(2, "0")}`;

    }

    coincide =
        valor.match(
            /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/
        );

    if (coincide) {

        return `${coincide[3]}-${coincide[2].padStart(2, "0")}-${coincide[1].padStart(2, "0")}`;

    }

    return "";

}


function parseMontoFlexible(texto) {

    const limpio =
        String(texto || "")
            .replace(/[^0-9.\-]/g, "");

    const numero =
        Number(limpio);

    return isNaN(numero) ? 0 : numero;

}


function parseFilasPegadas(texto) {

    const lineas =
        texto
            .split(/\r?\n/)
            .filter(
                linea =>
                    linea.trim() !== ""
            );

    return lineas.map(
        linea =>
            linea.includes("\t")
                ? linea.split("\t")
                : linea.split(",")
    );

}


function obtenerValorColumna(
    fila,
    campoDestino
) {

    for (
        const [indiceStr, destino]
        of Object.entries(
            importMapeoColumnas
        )
    ) {

        if (
            destino === campoDestino
        ) {

            return (
                fila[Number(indiceStr)] ||
                ""
            ).trim();

        }

    }

    return "";

}



/* PANEL PLEGABLE */

function cerrarPanelImportar() {

    panelImportar.classList.remove(
        "abierto"
    );

    btnToggleImportar.classList.remove(
        "abierto"
    );

}


btnToggleImportar.addEventListener(
    "click",
    function() {

        const abierto =
            panelImportar
                .classList
                .contains("abierto");

        if (abierto) {

            cerrarPanelImportar();

        } else {

            panelImportar
                .classList
                .add("abierto");

            btnToggleImportar
                .classList
                .add("abierto");

        }

    }
);



/* PASO 1 -> PASO 2 */

btnAnalizarImportacion.addEventListener(
    "click",
    function() {

        limpiarMensaje(
            mensajeImportPaso1
        );

        const texto =
            importTexto.value.trim();

        if (!texto) {

            mostrarMensaje(
                mensajeImportPaso1,
                "Pega primero los datos copiados de tu hoja.",
                "error"
            );

            return;

        }

        const filas =
            parseFilasPegadas(
                texto
            );

        if (
            filas.length < 2
        ) {

            mostrarMensaje(
                mensajeImportPaso1,
                "Necesito al menos el encabezado y una fila de datos.",
                "error"
            );

            return;

        }

        importEncabezados =
            filas[0];

        importFilasCrudas =
            filas.slice(1);

        importConteoFilas.textContent =
            importFilasCrudas.length;

        renderizarMapeoColumnas();

        importPeriodoPago.value =
            obtenerPeriodoActual();

        importPaso2.style.display =
            "block";

        importPaso3.style.display =
            "none";

        importPaso4.style.display =
            "none";

        importPaso2.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }
);


function renderizarMapeoColumnas() {

    mapeoColumnas.innerHTML = "";

    importEncabezados.forEach(
        (encabezado, indice) => {

            const contenedor =
                document.createElement(
                    "div"
                );

            contenedor.className =
                "campo";

            const opciones =
                CAMPOS_DESTINO_IMPORTACION
                    .map(
                        campo =>
                            `<option value="${campo.value}">${campo.label}</option>`
                    )
                    .join("");

            contenedor.innerHTML = `
                <label>
                    ${escaparHtml(
                        encabezado ||
                        `Columna ${indice + 1}`
                    )}
                </label>
                <select
                    data-indice="${indice}"
                    class="select-mapeo-columna"
                >
                    ${opciones}
                </select>
            `;

            mapeoColumnas.appendChild(
                contenedor
            );

        }
    );


    /*
     * Autodetección simple por nombre
     * de encabezado. El orden importa:
     * los patrones más específicos van
     * antes que los genéricos.
     */

    const coincidencias = [
        [/nombre/, "nombre"],
        [/paterno/, "apellidoPaterno"],
        [/materno/, "apellidoMaterno"],
        [/nacimiento/, "fechaNacimiento"],
        [/correo|email/, "correo"],
        [/tel[eé]fono|celular/, "telefono"],
        [/direcci[oó]n/, "direccion"],
        [/civil/, "estadoCivil"],
        [/ingreso/, "fechaIngreso"],
        [/nfc/, "nfcUid"],
        [/grupo/, "grupo"],
        [/tarifa|cuota/, "tarifa"],
        [/fecha.*pago/, "pagoFecha"],
        [/monto/, "pagoMonto"],
        [/m[eé]todo/, "pagoMetodo"],
        [/nota/, "pagoNota"],
        [/pag/, "pagoEstado"]
    ];

    mapeoColumnas
        .querySelectorAll(
            ".select-mapeo-columna"
        )
        .forEach(
            select => {

                const indice =
                    Number(
                        select.dataset.indice
                    );

                const texto =
                    String(
                        importEncabezados[
                            indice
                        ] || ""
                    ).toLowerCase();

                for (
                    const [regex, valor]
                    of coincidencias
                ) {

                    if (
                        regex.test(texto)
                    ) {

                        select.value =
                            valor;

                        break;

                    }

                }

            }
        );

}



/* PASO 2 -> PASO 3 */

btnContinuarMapeo.addEventListener(
    "click",
    function() {

        limpiarMensaje(
            mensajeImportPaso2
        );

        importMapeoColumnas = {};

        mapeoColumnas
            .querySelectorAll(
                ".select-mapeo-columna"
            )
            .forEach(
                select => {

                    importMapeoColumnas[
                        Number(
                            select.dataset.indice
                        )
                    ] = select.value;

                }
            );

        const destinos =
            Object.values(
                importMapeoColumnas
            );

        if (
            !destinos.includes("nombre") ||
            !destinos.includes(
                "apellidoPaterno"
            )
        ) {

            mostrarMensaje(
                mensajeImportPaso2,
                "Necesitas mapear al menos Nombre y Apellido paterno.",
                "error"
            );

            return;

        }

        if (
            !destinos.includes("tarifa")
        ) {

            mostrarMensaje(
                mensajeImportPaso2,
                "Necesitas mapear una columna de Tarifa/cuota.",
                "error"
            );

            return;

        }

        const hayColumnasPago =
            destinos.some(
                d => d.startsWith("pago")
            );

        if (
            !importPeriodoPago.value
        ) {

            importPeriodoPago.value =
                obtenerPeriodoActual();

        }

        importPeriodoSeleccionado =
            hayColumnasPago
                ? importPeriodoPago.value
                : "";

        renderizarResolucionGrupos(
            destinos.includes("grupo")
        );

        renderizarResolucionTarifas();

        renderizarResolucionEstadosPago(
            hayColumnasPago
        );

        importPaso3.style.display =
            "block";

        importPaso4.style.display =
            "none";

        importPaso3.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }
);


function renderizarResolucionGrupos(
    hayColumnaGrupo
) {

    resolverGrupos.innerHTML =
        "";

    if (
        !hayColumnaGrupo
    ) {
        return;
    }

    const valoresDistintos =
        new Set();

    importFilasCrudas.forEach(
        fila => {

            const valor =
                obtenerValorColumna(
                    fila,
                    "grupo"
                );

            if (valor) {

                valoresDistintos.add(
                    valor
                );

            }

        }
    );

    if (
        valoresDistintos.size === 0
    ) {
        return;
    }

    let html =
        "<h4>Grupos encontrados</h4>";

    Array.from(
        valoresDistintos
    ).forEach(
        valor => {

            const coincidenciaExacta =
                grupos.find(
                    g =>
                        String(
                            g.nombre || ""
                        ).toLowerCase() ===
                        valor.toLowerCase()
                );

            const opciones =
                grupos
                    .map(
                        g =>
                            `<option value="${escaparHtml(
                                g.nombre
                            )}" ${
                                coincidenciaExacta &&
                                coincidenciaExacta.nombre === g.nombre
                                    ? "selected"
                                    : ""
                            }>${escaparHtml(
                                g.nombre
                            )}</option>`
                    )
                    .join("");

            html += `

                <div
                    class="campo"
                    style="margin-bottom:10px;"
                >

                    <label>
                        Valor en tu hoja: "${escaparHtml(
                            valor
                        )}"
                    </label>

                    <select
                        class="select-resolver-grupo"
                        data-valor="${escaparHtml(
                            valor
                        )}"
                    >
                        <option value="">
                            Dejar sin grupo por ahora
                        </option>

                        ${opciones}

                        <option value="__nuevo__">
                            + Crear grupo "${escaparHtml(
                                valor
                            )}" en el catálogo
                        </option>
                    </select>

                </div>

            `;

        }
    );

    resolverGrupos.innerHTML =
        html;

}


function renderizarResolucionTarifas() {

    const valoresDistintos =
        new Set();

    importFilasCrudas.forEach(
        fila => {

            const valor =
                obtenerValorColumna(
                    fila,
                    "tarifa"
                );

            if (valor) {

                valoresDistintos.add(
                    valor
                );

            }

        }
    );

    resolverTarifas.innerHTML =
        "<h4>Tarifas encontradas</h4>";

    Array.from(
        valoresDistintos
    ).forEach(
        valor => {

            const yaResuelto =
                importTarifasResueltas[
                    valor
                ];

            const opcionesExistentes =
                tarifas
                    .map(
                        t =>
                            `<option value="${t.id}" ${
                                yaResuelto &&
                                yaResuelto.id === t.id
                                    ? "selected"
                                    : ""
                            }>${escaparHtml(
                                t.nombre
                            )} — ${formatearMoneda(
                                t.cuotaBase
                            )}</option>`
                    )
                    .join("");

            const cuotaSugerida =
                parseMontoFlexible(
                    valor
                );

            const bloque =
                document.createElement(
                    "div"
                );

            bloque.style.background =
                "#f9fafb";

            bloque.style.padding =
                "12px";

            bloque.style.borderRadius =
                "8px";

            bloque.style.marginBottom =
                "10px";

            bloque.innerHTML = `

                <div class="campo">

                    <label>
                        Valor en tu hoja: "${escaparHtml(
                            valor
                        )}"
                    </label>

                    <select
                        class="select-resolver-tarifa"
                        data-valor="${escaparHtml(
                            valor
                        )}"
                    >
                        <option value="">
                            Seleccionar tarifa existente...
                        </option>

                        ${opcionesExistentes}

                        <option value="__nueva__">
                            + Crear nueva tarifa
                        </option>
                    </select>

                </div>

                <div
                    class="grid-3 campo-nueva-tarifa"
                    data-valor="${escaparHtml(
                        valor
                    )}"
                    style="display:none;margin-top:8px;"
                >

                    <input
                        type="text"
                        class="nueva-tarifa-nombre"
                        placeholder="Nombre de la tarifa"
                        value="Tarifa ${escaparHtml(
                            valor
                        )}"
                    >

                    <input
                        type="number"
                        class="nueva-tarifa-cuota"
                        placeholder="Cuota base"
                        value="${
                            cuotaSugerida || ""
                        }"
                        step="0.01"
                        min="0"
                    >

                </div>

            `;

            resolverTarifas.appendChild(
                bloque
            );

        }
    );


    resolverTarifas
        .querySelectorAll(
            ".select-resolver-tarifa"
        )
        .forEach(
            select => {

                select.addEventListener(
                    "change",
                    function() {

                        const valor =
                            this.dataset.valor;

                        const campoNueva =
                            resolverTarifas.querySelector(
                                `.campo-nueva-tarifa[data-valor="${CSS.escape(
                                    valor
                                )}"]`
                            );

                        campoNueva.style.display =
                            this.value === "__nueva__"
                                ? "grid"
                                : "none";

                    }
                );

            }
        );

}


function renderizarResolucionEstadosPago(
    hayColumnasPago
) {

    resolverEstadosPago.innerHTML =
        "";

    if (!hayColumnasPago) {
        return;
    }

    const tieneColumnaEstado =
        Object.values(
            importMapeoColumnas
        ).includes("pagoEstado");

    if (!tieneColumnaEstado) {

        resolverEstadosPago.innerHTML = `
            <p style="color:#6b7280;font-size:13px;">
                No mapeaste una columna de "Pago: estado", así que
                marcaremos como <strong>pagado</strong> a quien tenga
                un monto mayor a 0, y como <strong>no pagado</strong>
                al resto.
            </p>
        `;

        return;

    }

    const valoresDistintos =
        new Set();

    importFilasCrudas.forEach(
        fila => {

            const valor =
                obtenerValorColumna(
                    fila,
                    "pagoEstado"
                );

            if (valor) {

                valoresDistintos.add(
                    valor
                );

            }

        }
    );

    let html =
        "<h4>Estados de pago encontrados</h4>";

    Array.from(
        valoresDistintos
    ).forEach(
        valor => {

            html += `

                <div
                    class="campo"
                    style="margin-bottom:10px;"
                >

                    <label>
                        "${escaparHtml(
                            valor
                        )}" significa:
                    </label>

                    <select
                        class="select-resolver-estado"
                        data-valor="${escaparHtml(
                            valor
                        )}"
                    >
                        <option value="pagado">
                            🟢 Pagado
                        </option>

                        <option value="no_pagado">
                            🔴 No pagado
                        </option>

                        <option value="ignorar">
                            No crear registro de pago
                        </option>
                    </select>

                </div>

            `;

        }
    );

    resolverEstadosPago.innerHTML =
        html;

    resolverEstadosPago
        .querySelectorAll(
            ".select-resolver-estado"
        )
        .forEach(
            select => {

                const texto =
                    select.dataset.valor.toLowerCase();

                if (
                    /no|pendiente|debe/.test(
                        texto
                    )
                ) {

                    select.value =
                        "no_pagado";

                } else if (
                    /s[ií]|pag|ok|listo/.test(
                        texto
                    )
                ) {

                    select.value =
                        "pagado";

                }

            }
        );

}



/* PASO 3 -> PASO 4 */

btnContinuarResolucion.addEventListener(
    "click",
    async function() {

        limpiarMensaje(
            mensajeImportPaso3
        );

        importGruposResueltos = {};

        const selectsGrupo =
            resolverGrupos.querySelectorAll(
                ".select-resolver-grupo"
            );

        for (
            const select
            of selectsGrupo
        ) {

            const valorOriginal =
                select.dataset.valor;

            let valorFinal =
                select.value;

            if (
                valorFinal === "__nuevo__"
            ) {

                const yaExisteEnCatalogo =
                    grupos.some(
                        g =>
                            String(
                                g.nombre || ""
                            ).toLowerCase() ===
                            valorOriginal.toLowerCase()
                    );

                if (
                    !yaExisteEnCatalogo
                ) {

                    try {

                        const nuevoGrupoRef =
                            await addDoc(
                                collection(
                                    db,
                                    "grupos"
                                ),
                                {
                                    nombre: valorOriginal
                                }
                            );

                        grupos.push({
                            id: nuevoGrupoRef.id,
                            nombre: valorOriginal
                        });

                    } catch (error) {

                        console.error(
                            error
                        );

                        mostrarMensaje(
                            mensajeImportPaso3,
                            `No fue posible crear el grupo "${valorOriginal}".`,
                            "error"
                        );

                        return;

                    }

                }

                valorFinal =
                    valorOriginal;

            }

            importGruposResueltos[
                valorOriginal
            ] = valorFinal;

        }

        renderizarGrupos();

        poblarSelectsGrupos();


        importTarifasResueltas = {};

        const selectsTarifa =
            resolverTarifas.querySelectorAll(
                ".select-resolver-tarifa"
            );

        for (
            const select
            of selectsTarifa
        ) {

            const valorOriginal =
                select.dataset.valor;

            let tarifaId =
                select.value;

            if (!tarifaId) {

                mostrarMensaje(
                    mensajeImportPaso3,
                    `Falta resolver la tarifa "${valorOriginal}".`,
                    "error"
                );

                return;

            }

            if (
                tarifaId === "__nueva__"
            ) {

                const contenedor =
                    resolverTarifas.querySelector(
                        `.campo-nueva-tarifa[data-valor="${CSS.escape(
                            valorOriginal
                        )}"]`
                    );

                const nombre =
                    contenedor
                        .querySelector(
                            ".nueva-tarifa-nombre"
                        )
                        .value
                        .trim();

                const cuotaBase =
                    Number(
                        contenedor
                            .querySelector(
                                ".nueva-tarifa-cuota"
                            )
                            .value || 0
                    );

                if (
                    !nombre ||
                    !cuotaBase
                ) {

                    mostrarMensaje(
                        mensajeImportPaso3,
                        `Completa nombre y cuota para la nueva tarifa de "${valorOriginal}".`,
                        "error"
                    );

                    return;

                }

                try {

                    const nuevaRef =
                        await addDoc(
                            collection(
                                db,
                                "tarifas"
                            ),
                            {
                                nombre,
                                cuotaBase
                            }
                        );

                    tarifaId =
                        nuevaRef.id;

                    tarifasMap[
                        tarifaId
                    ] = {
                        id: tarifaId,
                        nombre,
                        cuotaBase
                    };

                    tarifas.push(
                        tarifasMap[
                            tarifaId
                        ]
                    );

                } catch (error) {

                    console.error(
                        error
                    );

                    mostrarMensaje(
                        mensajeImportPaso3,
                        "No fue posible crear una de las tarifas nuevas.",
                        "error"
                    );

                    return;

                }

            }

            importTarifasResueltas[
                valorOriginal
            ] = tarifasMap[
                tarifaId
            ];

        }


        renderizarTarifas();

        poblarSelectsTarifas();


        importEstadosResueltos = {};

        resolverEstadosPago
            .querySelectorAll(
                ".select-resolver-estado"
            )
            .forEach(
                select => {

                    importEstadosResueltos[
                        select.dataset.valor
                    ] = select.value;

                }
            );


        construirVistaPrevia();

        importPaso4.style.display =
            "block";

        importPaso4.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }
);


function construirVistaPrevia() {

    const destinos =
        Object.values(
            importMapeoColumnas
        );

    const hayColumnasPago =
        destinos.includes(
            "pagoMonto"
        ) ||
        destinos.includes(
            "pagoEstado"
        ) ||
        destinos.includes(
            "pagoFecha"
        );

    importPreviewFilas =
        importFilasCrudas.map(
            fila => {

                const nombre =
                    obtenerValorColumna(
                        fila,
                        "nombre"
                    );

                const apellidoPaterno =
                    obtenerValorColumna(
                        fila,
                        "apellidoPaterno"
                    );

                const apellidoMaterno =
                    obtenerValorColumna(
                        fila,
                        "apellidoMaterno"
                    );

                const nombreCompletoFila =
                    [
                        nombre,
                        apellidoPaterno,
                        apellidoMaterno
                    ]
                        .filter(Boolean)
                        .join(" ");

                const valorTarifaOriginal =
                    obtenerValorColumna(
                        fila,
                        "tarifa"
                    );

                const tarifaResuelta =
                    importTarifasResueltas[
                        valorTarifaOriginal
                    ];

                const valorGrupoOriginal =
                    obtenerValorColumna(
                        fila,
                        "grupo"
                    );

                const grupoResuelto =
                    valorGrupoOriginal
                        ? (
                            importGruposResueltos[
                                valorGrupoOriginal
                            ] || ""
                        )
                        : "";

                let pagoInfo =
                    null;

                if (
                    hayColumnasPago
                ) {

                    const montoTexto =
                        obtenerValorColumna(
                            fila,
                            "pagoMonto"
                        );

                    const monto =
                        parseMontoFlexible(
                            montoTexto
                        );

                    const valorEstadoOriginal =
                        obtenerValorColumna(
                            fila,
                            "pagoEstado"
                        );

                    let estado;

                    if (
                        valorEstadoOriginal
                    ) {

                        estado =
                            importEstadosResueltos[
                                valorEstadoOriginal
                            ] || "no_pagado";

                    } else {

                        estado =
                            monto > 0
                                ? "pagado"
                                : "no_pagado";

                    }

                    if (
                        estado !== "ignorar"
                    ) {

                        pagoInfo = {

                            estado,

                            monto:
                                estado === "pagado"
                                    ? monto
                                    : 0,

                            fecha:
                                parseFechaFlexible(
                                    obtenerValorColumna(
                                        fila,
                                        "pagoFecha"
                                    )
                                ),

                            metodo:
                                obtenerValorColumna(
                                    fila,
                                    "pagoMetodo"
                                ),

                            nota:
                                obtenerValorColumna(
                                    fila,
                                    "pagoNota"
                                )

                        };

                    }

                }

                const duplicado =
                    alumnos.some(
                        a =>
                            nombreCompleto(
                                a
                            ).toLowerCase() ===
                            nombreCompletoFila.toLowerCase()
                    );

                return {

                    datosAlumno: {

                        nombre,

                        apellidoPaterno,

                        apellidoMaterno,

                        fechaNacimiento:
                            parseFechaFlexible(
                                obtenerValorColumna(
                                    fila,
                                    "fechaNacimiento"
                                )
                            ),

                        correo:
                            obtenerValorColumna(
                                fila,
                                "correo"
                            ),

                        telefono:
                            obtenerValorColumna(
                                fila,
                                "telefono"
                            ),

                        direccion:
                            obtenerValorColumna(
                                fila,
                                "direccion"
                            ),

                        estadoCivil:
                            obtenerValorColumna(
                                fila,
                                "estadoCivil"
                            ),

                        fechaIngreso:
                            parseFechaFlexible(
                                obtenerValorColumna(
                                    fila,
                                    "fechaIngreso"
                                )
                            ),

                        nfcUid:
                            obtenerValorColumna(
                                fila,
                                "nfcUid"
                            ),

                        grupo:
                            grupoResuelto

                    },

                    nombreCompletoFila,

                    tarifaResuelta,

                    grupoResuelto,

                    pagoInfo,

                    duplicado,

                    incluir: !duplicado

                };

            }
        );

    renderizarPreviewImportacion();

}


function renderizarPreviewImportacion() {

    listaPreviewImportacion.innerHTML =
        "";

    importPreviewFilas.forEach(
        (item, indice) => {

            const fila =
                document.createElement(
                    "tr"
                );

            fila.innerHTML = `

                <td>
                    <input
                        type="checkbox"
                        class="check-incluir-importacion"
                        data-indice="${indice}"
                        ${
                            item.incluir
                                ? "checked"
                                : ""
                        }
                    >
                </td>

                <td>
                    ${escaparHtml(
                        item.nombreCompletoFila ||
                        "—"
                    )}
                </td>

                <td>
                    ${
                        item.grupoResuelto
                            ? escaparHtml(
                                item.grupoResuelto
                            )
                            : "—"
                    }
                </td>

                <td>
                    ${
                        item.tarifaResuelta
                            ? escaparHtml(
                                item.tarifaResuelta.nombre
                            ) +
                              " — " +
                              formatearMoneda(
                                  item.tarifaResuelta.cuotaBase
                              )
                            : "—"
                    }
                </td>

                <td>
                    ${
                        item.pagoInfo
                            ? (
                                item.pagoInfo.estado === "pagado"
                                    ? "🟢 " +
                                      formatearMoneda(
                                          item.pagoInfo.monto
                                      )
                                    : "🔴 No pagó"
                            )
                            : "—"
                    }
                </td>

                <td>
                    ${
                        item.duplicado
                            ? '<span class="estado-inactivo">Posible duplicado</span>'
                            : '<span class="estado-activo">Nuevo</span>'
                    }
                </td>

            `;

            listaPreviewImportacion.appendChild(
                fila
            );

        }
    );

    listaPreviewImportacion
        .querySelectorAll(
            ".check-incluir-importacion"
        )
        .forEach(
            casilla => {

                casilla.addEventListener(
                    "change",
                    function() {

                        importPreviewFilas[
                            Number(
                                this.dataset.indice
                            )
                        ].incluir =
                            this.checked;

                        actualizarTextoBotonImportar();

                    }
                );

            }
        );

    actualizarTextoBotonImportar();

}


function actualizarTextoBotonImportar() {

    const total =
        importPreviewFilas.filter(
            f => f.incluir
        ).length;

    btnImportarAhora.textContent =
        `💾 Importar ${total} alumno(s)`;

}


importSeleccionarTodos.addEventListener(
    "change",
    function() {

        const marcar =
            this.checked;

        importPreviewFilas.forEach(
            f => {
                f.incluir = marcar;
            }
        );

        renderizarPreviewImportacion();

    }
);



/* IMPORTAR AHORA */

btnImportarAhora.addEventListener(
    "click",
    async function() {

        limpiarMensaje(
            mensajeImportPaso4
        );

        const filasAIncluir =
            importPreviewFilas.filter(
                f => f.incluir
            );

        if (
            filasAIncluir.length === 0
        ) {

            mostrarMensaje(
                mensajeImportPaso4,
                "No hay alumnos seleccionados para importar.",
                "error"
            );

            return;

        }

        btnImportarAhora.disabled =
            true;

        btnImportarAhora.textContent =
            "Importando...";

        let exitosos = 0;

        let fallidos = 0;

        for (
            const item
            of filasAIncluir
        ) {

            try {

                const tarifa =
                    item.tarifaResuelta;

                const datosAlumno = {

                    ...item.datosAlumno,

                    fechaRegistro:
                        Timestamp.now(),

                    fechaBaja: "",

                    activo: true,

                    grado: "",

                    foto: "",

                    tarifaId:
                        tarifa.id,

                    tipoTarifa:
                        "normal",

                    tipoDescuentoBeca:
                        "porcentaje",

                    porcentajeBeca: 0,

                    montoDescuentoBeca: 0,

                    cuotaMensual:
                        Number(
                            tarifa.cuotaBase ||
                            0
                        )

                };

                const nuevoAlumnoRef =
                    await addDoc(
                        collection(
                            db,
                            "alumnos"
                        ),
                        datosAlumno
                    );

                if (
                    item.pagoInfo
                ) {

                    let fechaPagoTimestamp =
                        null;

                    if (
                        item.pagoInfo.estado === "pagado" &&
                        item.pagoInfo.fecha
                    ) {

                        fechaPagoTimestamp =
                            Timestamp.fromDate(
                                new Date(
                                    `${item.pagoInfo.fecha}T12:00:00`
                                )
                            );

                    }

                    await addDoc(
                        collection(
                            db,
                            "pagos"
                        ),
                        {

                            alumnoId:
                                nuevoAlumnoRef.id,

                            alumnoNombre:
                                item.nombreCompletoFila,

                            tipo:
                                "mensualidad",

                            periodo:
                                importPeriodoSeleccionado ||
                                obtenerPeriodoActual(),

                            estado:
                                item.pagoInfo.estado,

                            monto:
                                item.pagoInfo.monto,

                            fechaPago:
                                fechaPagoTimestamp,

                            metodoPago:
                                item.pagoInfo.metodo || "",

                            nota:
                                item.pagoInfo.nota ||
                                "Importado desde Google Sheets",

                            cuotaReferencia:
                                Number(
                                    tarifa.cuotaBase ||
                                    0
                                ),

                            tarifaId:
                                tarifa.id,

                            tipoTarifa:
                                "normal",

                            porcentajeBeca: 0,

                            registradoPorUid:
                                usuarioActual?.uid ||
                                "",

                            registradoPorCorreo:
                                usuarioActual?.email ||
                                "",

                            fechaRegistro:
                                Timestamp.now()

                        }
                    );

                }

                exitosos++;

            } catch (error) {

                console.error(
                    "Error importando alumno:",
                    error
                );

                fallidos++;

            }

        }

        await cargarAlumnos();

        await cargarCobranzaPeriodo();

        mostrarMensaje(
            mensajeImportPaso4,
            `Importación terminada: ${exitosos} alumno(s) agregado(s)${
                fallidos
                    ? `, ${fallidos} con error`
                    : ""
            }.`,
            fallidos ? "error" : "ok"
        );

        btnImportarAhora.disabled =
            false;

        actualizarTextoBotonImportar();

    }
);


btnReiniciarImportacion.addEventListener(
    "click",
    function() {

        importTexto.value = "";

        importEncabezados = [];

        importFilasCrudas = [];

        importMapeoColumnas = {};

        importTarifasResueltas = {};

        importEstadosResueltos = {};

        importPreviewFilas = [];

        limpiarMensaje(
            mensajeImportPaso1
        );

        limpiarMensaje(
            mensajeImportPaso2
        );

        limpiarMensaje(
            mensajeImportPaso3
        );

        limpiarMensaje(
            mensajeImportPaso4
        );

        importPaso2.style.display =
            "none";

        importPaso3.style.display =
            "none";

        importPaso4.style.display =
            "none";

        importPaso1.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }
);



/* ======================================================
   AUTENTICACIÓN
====================================================== */

formLogin.addEventListener(
    "submit",
    async function(e) {

        e.preventDefault();

        limpiarMensaje(
            mensajeLogin
        );


        const correo =
            document
                .getElementById(
                    "correoLogin"
                )
                .value
                .trim();


        const password =
            document
                .getElementById(
                    "passwordLogin"
                )
                .value;


        try {

            await signInWithEmailAndPassword(
                auth,
                correo,
                password
            );

        } catch (error) {

            console.error(error);

            mostrarMensaje(
                mensajeLogin,
                "Correo o contraseña incorrectos.",
                "error"
            );

        }

    }
);


linkOlvidoPassword.addEventListener(
    "click",
    async function() {

        const correo =
            document
                .getElementById(
                    "correoLogin"
                )
                .value
                .trim();


        if (
            !correo
        ) {

            mostrarMensaje(
                mensajeLogin,
                "Escribe primero tu correo.",
                "error"
            );

            return;

        }


        try {

            await sendPasswordResetEmail(
                auth,
                correo
            );


            mostrarMensaje(
                mensajeLogin,
                "Se envió un correo para restablecer la contraseña.",
                "ok"
            );


        } catch (error) {

            console.error(error);

            mostrarMensaje(
                mensajeLogin,
                "No fue posible enviar el correo.",
                "error"
            );

        }

    }
);


btnCerrarSesion.addEventListener(
    "click",
    async function() {

        try {

            await signOut(
                auth
            );

        } catch (error) {

            console.error(
                error
            );

        }

    }
);


/*
 * Controla qué "vista" (Alumnos / Cobranza /
 * Administración) se muestra a la vez, como en
 * una app con menú lateral, en vez de una sola
 * página larga con todo junto.
 */

let vistaActual =
    "alumnos";


function mostrarVista(
    nombre
) {

    if (
        nombre === "administracion" &&
        btnToggleAdministracion.style.display === "none"
    ) {

        // Un rol sin acceso a Administración no
        // puede entrar a esa vista aunque lo intente.
        nombre = "alumnos";

    }

    vistaActual =
        nombre;

    vistaAlumnos.style.display =
        nombre === "alumnos"
            ? "block"
            : "none";

    vistaCobranza.style.display =
        nombre === "cobranza"
            ? "block"
            : "none";

    vistaAsistencia.style.display =
        nombre === "asistencia"
            ? "block"
            : "none";

    seccionAdministracion.style.display =
        nombre === "administracion"
            ? "block"
            : "none";


    [
        navBtnAlumnos,
        navBtnCobranza,
        navBtnAsistencia,
        btnToggleAdministracion
    ].forEach(
        boton => {
            boton.classList.remove(
                "activo"
            );
        }
    );

    const botonActivo =

        nombre === "alumnos"
            ? navBtnAlumnos

        : nombre === "cobranza"
            ? navBtnCobranza

        : nombre === "asistencia"
            ? navBtnAsistencia

        : btnToggleAdministracion;

    botonActivo.classList.add(
        "activo"
    );


    window.scrollTo(
        {
            top: 0,
            behavior: "auto"
        }
    );

}


navBtnAlumnos.addEventListener(
    "click",
    function() {
        mostrarVista(
            "alumnos"
        );
    }
);

navBtnCobranza.addEventListener(
    "click",
    function() {
        mostrarVista(
            "cobranza"
        );
    }
);

navBtnAsistencia.addEventListener(
    "click",
    function() {

        mostrarVista(
            "asistencia"
        );

    }
);

btnToggleAdministracion.addEventListener(
    "click",
    function() {
        mostrarVista(
            "administracion"
        );
    }
);



/* ======================================================
   INICIAR
====================================================== */

async function cargarPerfilUsuarioActual(
    uid
) {

    try {

        const referencia =
            doc(
                db,
                "usuarios",
                uid
            );

        const snap =
            await getDoc(
                referencia
            );

        if (
            !snap.exists()
        ) {
            return null;
        }

        return {
            id: snap.id,
            ...snap.data()
        };

    } catch (error) {

        console.error(
            "Error cargando perfil de usuario:",
            error
        );

        return null;

    }

}


function aplicarPermisosPorRol(
    rol
) {

    const esAdmin =
        rol === "admin";

    const esRecepcion =
        rol === "recepcion";

    const gestionaAlumnosYPagos =
        esAdmin ||
        esRecepcion;


    btnToggleAdministracion.style.display =
        esAdmin
            ? ""
            : "none";

    if (
        !esAdmin
    ) {

        seccionAdministracion.style.display =
            "none";

    }


    seccionCobranzaMensual.style.display =
        gestionaAlumnosYPagos
            ? ""
            : "none";


    btnToggleAlta.style.display =
        gestionaAlumnosYPagos
            ? "inline-flex"
            : "none";


    modoListaAlumnos =
        gestionaAlumnosYPagos
            ? "completo"
            : "basico";


    puedeEliminarAlumnos =
        esAdmin;


    /*
     * El monto de la mensualidad ya no es
     * libre: viene fijo de la cuota asignada
     * al alumno. Solo admin puede sobrescribirlo
     * manualmente si de verdad hace falta.
     */

    puedeEditarMontoPago =
        esAdmin;

    pagoMonto.disabled =
        !puedeEditarMontoPago;

    pagoMonto.style.background =
        puedeEditarMontoPago
            ? ""
            : "#f3f4f6";

    notaMontoPago.textContent =
        puedeEditarMontoPago
            ? "Se propone la cuota mensual actual, pero puedes modificarla."
            : "Este monto lo define la cuota asignada al alumno. Solo un administrador puede cambiarlo.";


    /*
     * Solo admin puede editar o eliminar un
     * pago ya registrado.
     */

    puedeEditarPagos =
        esAdmin;

}


async function iniciar() {

    if (
        appIniciada
    ) {
        return;
    }

    appIniciada =
        true;


    try {

        await cargarTarifas();

        await cargarGrupos();

        await cargarAlumnos();

        if (
            !cobranzaPeriodoInput.value
        ) {

            cobranzaPeriodoInput.value =
                obtenerPeriodoActual();

        }

        if (
            perfilUsuarioActual &&
            perfilUsuarioActual.rol === "admin"
        ) {

            await cargarUsuarios();

        }

    } catch (error) {

        console.error(
            "Error iniciando aplicación:",
            error
        );

    }

}


onAuthStateChanged(
    auth,
    async function(user) {

        if (user) {

            usuarioActual =
                user;


            const perfil =
                await cargarPerfilUsuarioActual(
                    user.uid
                );


            if (
                !perfil ||
                perfil.activo !== true
            ) {

                mostrarMensaje(
                    mensajeLogin,
                    "Tu cuenta no tiene acceso activo a esta app. Contacta a un administrador.",
                    "error"
                );

                await signOut(
                    auth
                );

                return;

            }


            /*
             * Autocompleta el correo en el perfil
             * si no lo tenía (por ejemplo el usuario
             * admin original, creado antes de esto).
             */

            if (
                !perfil.correo &&
                user.email
            ) {

                perfil.correo =
                    user.email;

                try {

                    await updateDoc(
                        doc(
                            db,
                            "usuarios",
                            user.uid
                        ),
                        {
                            correo: user.email
                        }
                    );

                } catch (error) {

                    console.error(
                        "No fue posible guardar el correo en el perfil:",
                        error
                    );

                }

            }


            perfilUsuarioActual =
                perfil;


            const nombreCompletoUsuario =
                [
                    perfil.nombre,
                    perfil.Apellidos ||
                    perfil.apellidos
                ]
                    .filter(Boolean)
                    .join(" ");


            correoUsuarioSpan
                .textContent =
                nombreCompletoUsuario ||
                user.email ||
                "";


            rolUsuarioTexto
                .textContent =
                etiquetaRol(
                    perfil.rol
                );


            aplicarPermisosPorRol(
                perfil.rol
            );

            mostrarVista(
                "alumnos"
            );


            loginSection
                .style.display =
                "none";

            appPrincipal
                .style.display =
                "block";

            await iniciar();

        } else {

            usuarioActual =
                null;

            perfilUsuarioActual =
                null;

            appIniciada =
                false;

            appPrincipal
                .style.display =
                "none";

            loginSection
                .style.display =
                "block";

        }

    }
);


