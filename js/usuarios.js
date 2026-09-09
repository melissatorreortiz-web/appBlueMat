/* ======================================================
   GRUPOS (CATÁLOGO)
====================================================== */

async function cargarGrupos() {

    try {

        const snapshot =
            await getDocs(
                collection(db, "grupos")
            );

        grupos = [];

        snapshot.forEach(
            documento => {

                grupos.push({
                    id: documento.id,
                    ...documento.data()
                });

            }
        );

        grupos.sort(
            (a, b) =>
                String(
                    a.nombre || ""
                ).localeCompare(
                    String(
                        b.nombre || ""
                    ),
                    "es"
                )
        );

        renderizarGrupos();

        poblarSelectsGrupos();

    } catch (error) {

        console.error(
            "Error cargando grupos:",
            error
        );

    }

}


function renderizarGrupos() {

    listaGrupos.innerHTML = "";

    if (grupos.length === 0) {

        listaGrupos.innerHTML = `
            <tr>
                <td colspan="2">
                    No hay grupos registrados.
                </td>
            </tr>
        `;

        return;

    }

    grupos.forEach(
        grupo => {

            const fila =
                document.createElement(
                    "tr"
                );

            fila.innerHTML = `
                <td>
                    ${escaparHtml(
                        grupo.nombre
                    )}
                </td>

                <td>
                    <button
                        type="button"
                        class="
                            btn-principal
                            boton-fila
                            btn-editar-grupo
                        "
                        data-id="${grupo.id}"
                    >
                        ✏️ Editar
                    </button>
                </td>
            `;

            listaGrupos.appendChild(
                fila
            );

        }
    );


    listaGrupos
        .querySelectorAll(
            ".btn-editar-grupo"
        )
        .forEach(
            boton => {

                boton.addEventListener(
                    "click",
                    function() {

                        const grupo =
                            grupos.find(
                                g =>
                                    g.id ===
                                    this.dataset.id
                            );

                        if (grupo) {

                            iniciarEdicionGrupo(
                                grupo
                            );

                        }

                    }
                );

            }
        );

}


/*
 * Abre el panel de grupo ya con los
 * datos de un grupo existente, para
 * corregir su nombre.
 */

function obtenerDiasClaseSeleccionados() {

    return Array.from(
        document.querySelectorAll(
            'input[name="grupoDiaClase"]:checked'
        )
    ).map(
        checkbox => Number(checkbox.value)
    );

}


function nombreMesDesdePeriodo(mesTexto) {

    const [anio, mes] = mesTexto.split("-").map(Number);

    if (!anio || !mes) {
        return mesTexto;
    }

    return new Date(anio, mes - 1, 1).toLocaleDateString(
        "es-MX",
        {
            month: "long",
            year: "numeric"
        }
    );

}


function iniciarEdicionGrupo(
    grupo
) {

    grupoEditandoId =
        grupo.id;

    grupoEditandoNombreAnterior =
        grupo.nombre;

    document
        .getElementById(
            "grupoNombre"
        )
        .value =
        grupo.nombre;

    document
        .getElementById(
            "grupoDisciplina"
        )
        .value =
        grupo.disciplina || "";

    document
        .querySelectorAll(
            'input[name="grupoDiaClase"]'
        )
        .forEach(
            checkbox => {
                checkbox.checked =
                    Array.isArray(grupo.diasClase) &&
                    grupo.diasClase.includes(Number(checkbox.value));
            }
        );

    btnGuardarGrupo.textContent =
        "Guardar cambios";

    accionMasivaGrupo.innerHTML =
        "";

    limpiarMensaje(
        mensajeGrupo
    );

    panelAltaGrupo.classList.add(
        "abierto"
    );

    btnToggleGrupo.classList.add(
        "abierto"
    );

    panelAltaGrupo.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/*
 * Después de renombrar un grupo, si había
 * alumnos con el nombre anterior asignado,
 * ofrece actualizarlos también en un solo
 * paso (sin tocar nada si no se confirma).
 */

function ofrecerActualizacionMasivaGrupo(
    nombreAnterior,
    nombreNuevo
) {

    const afectados =
        alumnos.filter(
            a =>
                a.grupo === nombreAnterior
        );

    if (
        afectados.length === 0
    ) {

        accionMasivaGrupo.innerHTML =
            "";

        return;

    }

    accionMasivaGrupo.innerHTML = `
        <div class="mensaje ok" style="display:block;">
            ${afectados.length} alumno(s) tienen asignado
            "${escaparHtml(nombreAnterior)}".

            <button
                type="button"
                id="btnActualizarAlumnosGrupo"
                class="btn-principal boton-fila"
                style="margin-left:10px;"
            >
                Actualizarlos a "${escaparHtml(nombreNuevo)}"
            </button>
        </div>
    `;

    document
        .getElementById(
            "btnActualizarAlumnosGrupo"
        )
        .addEventListener(
            "click",
            async function() {

                this.disabled =
                    true;

                this.textContent =
                    "Actualizando...";

                try {

                    for (
                        const alumno
                        of afectados
                    ) {

                        await updateDoc(
                            doc(
                                db,
                                "alumnos",
                                alumno.id
                            ),
                            {
                                grupo: nombreNuevo
                            }
                        );

                    }

                    await cargarAlumnos();

                    await cargarCobranzaPeriodo();

                    accionMasivaGrupo.innerHTML = `
                        <div class="mensaje ok" style="display:block;">
                            Listo, ${afectados.length} alumno(s) actualizados.
                        </div>
                    `;

                } catch (error) {

                    console.error(
                        error
                    );

                    accionMasivaGrupo.innerHTML = `
                        <div class="mensaje error" style="display:block;">
                            No se pudo actualizar a todos los alumnos.
                        </div>
                    `;

                }

            }
        );

}


/*
 * A diferencia de las tarifas, el valor que
 * guardamos en el alumno sigue siendo el
 * NOMBRE del grupo (campo "grupo", como
 * siempre), no un id. El catálogo solo
 * evita que ese texto se escriba libre.
 */

function poblarSelectsGrupos() {

    const selects = [
        selectGrupoAlta,
        selectGrupoEdicion,
        asistenciaGrupoSelect
    ];

    selects.forEach(
        select => {

            if (!select) {
                return;
            }

            const valorActual =
                select.value;

            select.innerHTML = `
                <option value="">
                    Seleccionar grupo
                </option>
            `;

            grupos.forEach(
                grupo => {

                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        grupo.nombre;

                    option.textContent =
                        grupo.nombre;

                    select.appendChild(
                        option
                    );

                }
            );

            if (
                valorActual &&
                grupos.some(
                    g =>
                        g.nombre ===
                        valorActual
                )
            ) {

                select.value =
                    valorActual;

            }

        }
    );

}


/*
 * Fija el valor del select de grupo en el
 * formulario de edición. Si el alumno tiene
 * un valor de "grupo" que ya no existe en el
 * catálogo (texto viejo o grupo eliminado),
 * lo agregamos como opción temporal para no
 * perderlo ni sobrescribirlo sin querer.
 */

function fijarGrupoEdicion(
    alumno
) {

    const valor =
        alumno.grupo || "";


    const opcionVieja =
        selectGrupoEdicion
            .querySelector(
                'option[data-legacy="1"]'
            );

    if (opcionVieja) {

        opcionVieja.remove();

    }


    const existeEnCatalogo =
        Array.from(
            selectGrupoEdicion.options
        ).some(
            opcion =>
                opcion.value === valor
        );


    if (
        valor &&
        !existeEnCatalogo
    ) {

        const opcion =
            document.createElement(
                "option"
            );

        opcion.value =
            valor;

        opcion.textContent =
            `${valor} (no está en el catálogo)`;

        opcion.dataset.legacy =
            "1";

        selectGrupoEdicion.appendChild(
            opcion
        );

    }


    selectGrupoEdicion.value =
        valor;

}


function cerrarPanelGrupo() {

    panelAltaGrupo.classList.remove(
        "abierto"
    );

    btnToggleGrupo.classList.remove(
        "abierto"
    );

    formGrupo.reset();

    limpiarMensaje(
        mensajeGrupo
    );

    accionMasivaGrupo.innerHTML =
        "";

    grupoEditandoId =
        null;

    grupoEditandoNombreAnterior =
        "";

    btnGuardarGrupo.textContent =
        "Agregar grupo";

}


btnToggleGrupo.addEventListener(
    "click",
    function() {

        const abierto =
            panelAltaGrupo
                .classList
                .contains(
                    "abierto"
                );

        if (abierto) {

            cerrarPanelGrupo();

        } else {

            panelAltaGrupo
                .classList
                .add(
                    "abierto"
                );

            btnToggleGrupo
                .classList
                .add(
                    "abierto"
                );

        }

    }
);


btnCancelarGrupo.addEventListener(
    "click",
    cerrarPanelGrupo
);


formGrupo.addEventListener(
    "submit",
    async function(e) {

        e.preventDefault();

        limpiarMensaje(
            mensajeGrupo
        );

        const nombre =
            document
                .getElementById(
                    "grupoNombre"
                )
                .value
                .trim();

        const disciplina =
            document
                .getElementById(
                    "grupoDisciplina"
                )
                .value;

        const diasClase =
            obtenerDiasClaseSeleccionados();

        if (
            !nombre
        ) {

            mostrarMensaje(
                mensajeGrupo,
                "Escribe el nombre del grupo.",
                "error"
            );

            return;

        }

        if (!disciplina) {
            mostrarMensaje(
                mensajeGrupo,
                "Selecciona la disciplina del grupo.",
                "error"
            );
            return;
        }

        if (diasClase.length === 0) {
            mostrarMensaje(
                mensajeGrupo,
                "Selecciona al menos un día de clase.",
                "error"
            );
            return;
        }

        const yaExiste =
            grupos.some(
                grupo =>
                    String(
                        grupo.nombre || ""
                    ).toLowerCase() ===
                    nombre.toLowerCase() &&
                    grupo.id !==
                    grupoEditandoId
            );

        if (
            yaExiste
        ) {

            mostrarMensaje(
                mensajeGrupo,
                "Ya existe un grupo con ese nombre.",
                "error"
            );

            return;

        }


        /* =================================================
           MODO EDICIÓN
        ================================================= */

        if (
            grupoEditandoId
        ) {

            const nombreAnterior =
                grupoEditandoNombreAnterior;

            try {

                await updateDoc(
                    doc(
                        db,
                        "grupos",
                        grupoEditandoId
                    ),
                    {
                        nombre,
                        disciplina,
                        diasClase
                    }
                );

                mostrarMensaje(
                    mensajeGrupo,
                    "Grupo actualizado correctamente.",
                    "ok"
                );

                await cargarGrupos();

                if (
                    nombreAnterior !== nombre
                ) {

                    ofrecerActualizacionMasivaGrupo(
                        nombreAnterior,
                        nombre
                    );

                }

                grupoEditandoId =
                    null;

                grupoEditandoNombreAnterior =
                    "";

                btnGuardarGrupo.textContent =
                    "Agregar grupo";

            } catch (error) {

                console.error(
                    error
                );

                mostrarMensaje(
                    mensajeGrupo,
                    "No fue posible actualizar el grupo.",
                    "error"
                );

            }

            return;

        }


        /* =================================================
           MODO NUEVO REGISTRO
        ================================================= */

        try {

            await addDoc(
                collection(
                    db,
                    "grupos"
                ),
                {
                    nombre,
                    disciplina,
                    diasClase
                }
            );

            formGrupo.reset();

            mostrarMensaje(
                mensajeGrupo,
                "Grupo agregado correctamente.",
                "ok"
            );

            await cargarGrupos();

            setTimeout(
                cerrarPanelGrupo,
                800
            );

        } catch (error) {

            console.error(error);

            mostrarMensaje(
                mensajeGrupo,
                "No fue posible guardar el grupo.",
                "error"
            );

        }

    }
);




