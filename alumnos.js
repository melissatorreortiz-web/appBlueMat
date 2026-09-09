/* ======================================================
   USUARIOS
====================================================== */

async function cargarUsuarios() {

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "usuarios"
                )
            );

        usuarios = [];

        snapshot.forEach(
            documento => {

                usuarios.push({
                    id: documento.id,
                    ...documento.data()
                });

            }
        );

        usuarios.sort(
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

        renderizarUsuarios();

    } catch (error) {

        console.error(
            "Error cargando usuarios:",
            error
        );

        listaUsuarios.innerHTML = `
            <tr>
                <td colspan="5">
                    No fue posible cargar los usuarios.
                </td>
            </tr>
        `;

    }

}


function etiquetaRol(
    rol
) {

    if (rol === "admin") {
        return "Administrador";
    }

    if (rol === "recepcion") {
        return "Recepción";
    }

    if (rol === "instructor") {
        return "Instructor";
    }

    return textoSeguro(
        rol
    );

}


function renderizarUsuarios() {

    listaUsuarios.innerHTML = "";

    if (
        usuarios.length === 0
    ) {

        listaUsuarios.innerHTML = `
            <tr>
                <td colspan="5">
                    No hay usuarios registrados.
                </td>
            </tr>
        `;

        return;

    }

    usuarios.forEach(
        usuario => {

            const fila =
                document.createElement(
                    "tr"
                );

            const nombreApellidos =
                [
                    usuario.nombre,
                    usuario.Apellidos ||
                    usuario.apellidos
                ]
                    .filter(Boolean)
                    .join(" ");

            fila.innerHTML = `

                <td>
                    <strong>
                        ${escaparHtml(
                            textoSeguro(
                                nombreApellidos
                            )
                        )}
                    </strong>
                </td>

                <td>
                    ${escaparHtml(
                        textoSeguro(
                            usuario.correo
                        )
                    )}
                </td>

                <td>
                    ${escaparHtml(
                        etiquetaRol(
                            usuario.rol
                        )
                    )}
                </td>

                <td>
                    ${
                        usuario.activo === true

                        ? `
                            <span class="estado-activo">
                                🟢 Activo
                            </span>
                          `

                        : `
                            <span class="estado-inactivo">
                                🔴 Inactivo
                            </span>
                          `
                    }
                </td>

                <td>

                    <button
                        type="button"
                        class="
                            btn-principal
                            boton-fila
                            btn-editar-usuario
                        "
                        data-id="${usuario.id}"
                    >
                        ✏️ Editar
                    </button>

                    ${
                        usuario.correo

                        ? `
                            <button
                                type="button"
                                class="
                                    btn-secundario
                                    boton-fila
                                    btn-resetear-password
                                "
                                data-id="${usuario.id}"
                                style="margin-left:6px;"
                            >
                                🔑 Restablecer contraseña
                            </button>
                          `

                        : ""
                    }

                </td>

            `;

            listaUsuarios.appendChild(
                fila
            );

        }
    );


    listaUsuarios
        .querySelectorAll(
            ".btn-editar-usuario"
        )
        .forEach(
            boton => {

                boton.addEventListener(
                    "click",
                    function() {

                        const usuario =
                            usuarios.find(
                                u =>
                                    u.id ===
                                    this.dataset.id
                            );

                        if (usuario) {

                            iniciarEdicionUsuario(
                                usuario
                            );

                        }

                    }
                );

            }
        );


    listaUsuarios
        .querySelectorAll(
            ".btn-resetear-password"
        )
        .forEach(
            boton => {

                boton.addEventListener(
                    "click",
                    async function() {

                        const usuario =
                            usuarios.find(
                                u =>
                                    u.id ===
                                    this.dataset.id
                            );

                        if (
                            !usuario ||
                            !usuario.correo
                        ) {
                            return;
                        }

                        this.disabled =
                            true;

                        try {

                            await sendPasswordResetEmail(
                                auth,
                                usuario.correo
                            );

                            mostrarMensaje(
                                mensajeUsuario,
                                `Se envió un correo de restablecimiento a ${usuario.correo}.`,
                                "ok"
                            );

                        } catch (error) {

                            console.error(
                                error
                            );

                            mostrarMensaje(
                                mensajeUsuario,
                                "No fue posible enviar el correo de restablecimiento.",
                                "error"
                            );

                        }

                        this.disabled =
                            false;

                    }
                );

            }
        );

}


/*
 * Crea la cuenta de acceso (correo/contraseña)
 * sin cerrar la sesión del administrador actual:
 * usa una segunda instancia de Firebase, solo
 * para ese registro, y la destruye enseguida.
 */

async function crearCuentaSinCerrarSesion(
    correo,
    password
) {

    const configuracion =
        auth.app.options;

    const nombreAppTemporal =
        `usuario-temporal-${Date.now()}`;

    const appTemporal =
        initializeApp(
            configuracion,
            nombreAppTemporal
        );

    const authTemporal =
        getAuth(
            appTemporal
        );

    try {

        const credencial =
            await createUserWithEmailAndPassword(
                authTemporal,
                correo,
                password
            );

        const uid =
            credencial.user.uid;

        await signOut(
            authTemporal
        );

        return uid;

    } finally {

        await deleteApp(
            appTemporal
        );

    }

}


function cerrarPanelUsuario() {

    panelAltaUsuario.classList.remove(
        "abierto"
    );

    btnToggleUsuario.classList.remove(
        "abierto"
    );

    formUsuario.reset();

    limpiarMensaje(
        mensajeUsuario
    );

    usuarioEditandoId =
        null;

    btnGuardarUsuario.textContent =
        "Crear usuario";

    campoUsuarioPassword.style.display =
        "flex";

    usuarioCorreoInput.disabled =
        false;

}


btnToggleUsuario.addEventListener(
    "click",
    function() {

        const abierto =
            panelAltaUsuario
                .classList
                .contains(
                    "abierto"
                );

        if (abierto) {

            cerrarPanelUsuario();

        } else {

            panelAltaUsuario
                .classList
                .add(
                    "abierto"
                );

            btnToggleUsuario
                .classList
                .add(
                    "abierto"
                );

        }

    }
);


btnCancelarUsuario.addEventListener(
    "click",
    cerrarPanelUsuario
);


function iniciarEdicionUsuario(
    usuario
) {

    usuarioEditandoId =
        usuario.id;

    document
        .getElementById(
            "usuarioNombre"
        )
        .value =
        usuario.nombre || "";

    document
        .getElementById(
            "usuarioApellidos"
        )
        .value =
        usuario.Apellidos ||
        usuario.apellidos ||
        "";

    usuarioCorreoInput.value =
        usuario.correo || "";

    usuarioCorreoInput.disabled =
        true;

    document
        .getElementById(
            "usuarioRol"
        )
        .value =
        usuario.rol || "instructor";

    document
        .getElementById(
            "usuarioActivoSelect"
        )
        .value =
        usuario.activo === true
            ? "true"
            : "false";

    /*
     * Al editar no se puede tocar la
     * contraseña desde aquí (usa el botón
     * de restablecer contraseña).
     */

    campoUsuarioPassword.style.display =
        "none";

    usuarioPasswordInput.value =
        "";

    btnGuardarUsuario.textContent =
        "Guardar cambios";

    limpiarMensaje(
        mensajeUsuario
    );

    panelAltaUsuario.classList.add(
        "abierto"
    );

    btnToggleUsuario.classList.add(
        "abierto"
    );

    panelAltaUsuario.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


formUsuario.addEventListener(
    "submit",
    async function(e) {

        e.preventDefault();

        limpiarMensaje(
            mensajeUsuario
        );

        const nombre =
            document
                .getElementById(
                    "usuarioNombre"
                )
                .value
                .trim();

        const apellidos =
            document
                .getElementById(
                    "usuarioApellidos"
                )
                .value
                .trim();

        const correo =
            usuarioCorreoInput.value
                .trim();

        const rol =
            document
                .getElementById(
                    "usuarioRol"
                )
                .value;

        const activo =
            document
                .getElementById(
                    "usuarioActivoSelect"
                )
                .value === "true";

        if (
            !nombre ||
            !correo
        ) {

            mostrarMensaje(
                mensajeUsuario,
                "Completa nombre y correo.",
                "error"
            );

            return;

        }


        /* =================================================
           MODO EDICIÓN (no toca correo ni contraseña)
        ================================================= */

        if (
            usuarioEditandoId
        ) {

            try {

                await updateDoc(
                    doc(
                        db,
                        "usuarios",
                        usuarioEditandoId
                    ),
                    {
                        nombre,
                        Apellidos: apellidos,
                        rol,
                        activo
                    }
                );

                mostrarMensaje(
                    mensajeUsuario,
                    "Usuario actualizado correctamente.",
                    "ok"
                );

                await cargarUsuarios();

                setTimeout(
                    cerrarPanelUsuario,
                    800
                );

            } catch (error) {

                console.error(
                    error
                );

                mostrarMensaje(
                    mensajeUsuario,
                    "No fue posible actualizar el usuario.",
                    "error"
                );

            }

            return;

        }


        /* =================================================
           MODO NUEVO USUARIO
        ================================================= */

        const password =
            usuarioPasswordInput.value;

        if (
            !password ||
            password.length < 6
        ) {

            mostrarMensaje(
                mensajeUsuario,
                "La contraseña debe tener al menos 6 caracteres.",
                "error"
            );

            return;

        }

        btnGuardarUsuario.disabled =
            true;

        btnGuardarUsuario.textContent =
            "Creando...";

        try {

            const uid =
                await crearCuentaSinCerrarSesion(
                    correo,
                    password
                );

            await setDoc(
                doc(
                    db,
                    "usuarios",
                    uid
                ),
                {
                    nombre,
                    Apellidos: apellidos,
                    correo,
                    rol,
                    activo
                }
            );

            formUsuario.reset();

            mostrarMensaje(
                mensajeUsuario,
                "Usuario creado correctamente.",
                "ok"
            );

            await cargarUsuarios();

            setTimeout(
                cerrarPanelUsuario,
                900
            );

        } catch (error) {

            console.error(
                "Error creando usuario:",
                error
            );

            let texto =
                "No fue posible crear el usuario.";

            if (
                error.code === "auth/email-already-in-use"
            ) {

                texto =
                    "Ese correo ya tiene una cuenta.";

            } else if (
                error.code === "auth/invalid-email"
            ) {

                texto =
                    "El correo no es válido.";

            } else if (
                error.code === "auth/weak-password"
            ) {

                texto =
                    "La contraseña es demasiado débil.";

            }

            mostrarMensaje(
                mensajeUsuario,
                texto,
                "error"
            );

        }

        btnGuardarUsuario.disabled =
            false;

        if (
            !usuarioEditandoId
        ) {

            btnGuardarUsuario.textContent =
                "Crear usuario";

        }

    }
);



/* ======================================================
   CÁLCULO CUOTA
====================================================== */

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


selectTarifaAlta.addEventListener(
    "change",
    actualizarCuotaNueva
);

document
    .getElementById(
        "tipoTarifa"
    )
    .addEventListener(
        "change",
        actualizarEstadoBecaAlta
    );

document
    .getElementById(
        "tipoDescuentoBeca"
    )
    .addEventListener(
        "change",
        actualizarCamposTipoDescuentoAlta
    );

document
    .getElementById(
        "porcentajeBeca"
    )
    .addEventListener(
        "input",
        actualizarCuotaNueva
    );

document
    .getElementById(
        "montoDescuentoBeca"
    )
    .addEventListener(
        "input",
        actualizarCuotaNueva
    );


selectTarifaEdicion.addEventListener(
    "change",
    actualizarCuotaEdicion
);

document
    .getElementById(
        "editTipoTarifa"
    )
    .addEventListener(
        "change",
        actualizarEstadoBecaEdicion
    );

document
    .getElementById(
        "editTipoDescuentoBeca"
    )
    .addEventListener(
        "change",
        actualizarCamposTipoDescuentoEdicion
    );

document
    .getElementById(
        "editPorcentajeBeca"
    )
    .addEventListener(
        "input",
        actualizarCuotaEdicion
    );

document
    .getElementById(
        "editMontoDescuentoBeca"
    )
    .addEventListener(
        "input",
        actualizarCuotaEdicion
    );



/* ======================================================
   FORMULARIO PLEGABLE
====================================================== */

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


btnToggleAlta.addEventListener(
    "click",
    function() {

        const abierto =
            panelAltaAlumno
                .classList
                .contains(
                    "abierto"
                );

        if (abierto) {

            cerrarPanelAlta();

        } else {

            panelAltaAlumno
                .classList
                .add(
                    "abierto"
                );

            btnToggleAlta
                .classList
                .add(
                    "abierto"
                );

        }

    }
);


btnCancelarAlta.addEventListener(
    "click",
    cerrarPanelAlta
);




