// Blue Mat Academy - módulo separado

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
