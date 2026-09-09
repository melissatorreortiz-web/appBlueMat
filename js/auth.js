// Blue Mat Academy - módulo separado

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
