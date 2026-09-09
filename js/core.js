// Blue Mat Academy - módulo separado

/* ======================================================
   VARIABLES
====================================================== */

let alumnos = [];
let alumnoActual = null;

let tarifas = [];
let tarifasMap = {};

let grupos = [];

let grupoEditandoId = null;
let grupoEditandoNombreAnterior = "";

let fotoBase64Nueva = null;
let fotoBase64Edicion = null;

/*
 * ======================================================
 * EMAILJS — Recibo de pago por correo
 * ======================================================
 *
 * Rellena estos 3 valores con los que te da tu cuenta
 * de EmailJS (emailjs.com → Account → General para la
 * Public Key; Email Services y Email Templates para los
 * otros dos IDs). Sin esto, el botón de "Enviar recibo"
 * va a fallar.
 */

const EMAILJS_PUBLIC_KEY =
    "b_lGAZTSSUDA_JIPt";

const EMAILJS_SERVICE_ID =
    "service_icrpss7";

const EMAILJS_TEMPLATE_ID =
    "template_7pv40n9";


if (
    window.emailjs &&
    EMAILJS_PUBLIC_KEY !== "TU_PUBLIC_KEY"
) {

    window.emailjs.init(
        EMAILJS_PUBLIC_KEY
    );

}


let usuarioActual = null;
let appIniciada = false;

/*
 * Perfil del usuario logueado, leído de
 * /usuarios/{uid}. Trae nombre, apellidos,
 * correo, rol y activo.
 */
let perfilUsuarioActual = null;

/*
 * "completo" = admin o recepción (ven todo
 * de alumnos y pagos). "basico" = instructor
 * (solo lectura, sin datos personales).
 */
let modoListaAlumnos = "completo";

let usuarios = [];
let usuarioEditandoId = null;

/*
 * Controla si la tabla de alumnos muestra
 * todo el listado o solo el resultado de
 * una búsqueda/filtro activo.
 */
let mostrarTodosAlumnos = false;

/*
 * Solo admin puede seleccionar y eliminar
 * alumnos (con sus pagos asociados).
 */
let puedeEliminarAlumnos = false;

/*
 * Solo admin puede editar el monto de una
 * mensualidad manualmente; para los demás
 * el campo queda bloqueado con el valor de
 * la cuota asignada al alumno.
 */
let puedeEditarMontoPago = false;

/*
 * La cobranza del mes ya no se carga sola
 * al entrar; hay que pedirla con el botón
 * "Cargar cobranza" al menos una vez.
 */
let cobranzaCargadaAlMenosUnaVez = false;

/*
 * ID del pago que estamos editando.
 *
 * null = estamos registrando uno nuevo.
 */
let pagoEditandoId = null;

/*
 * Copia del pago tal como estaba justo antes
 * de empezar a editarlo, para poder guardar
 * "antes/después" en pagos_historial.
 */
let pagoAntesDeEditar = null;

/*
 * Solo admin puede editar o eliminar un pago
 * ya registrado (recepción sí puede crear uno
 * nuevo, eso no cambia).
 */
let puedeEditarPagos = false;

/*
 * Historiales de pago ya consultados, para no
 * volver a pedirlos a Firestore si se abren y
 * cierran varias veces en la misma sesión.
 */
let historialesPagoCache = {};

/*
 * ID de la anualidad que estamos editando.
 *
 * null = estamos registrando una nueva.
 */
let anualidadEditandoId = null;

/*
 * Mapa alumnoId -> pago, para el periodo
 * seleccionado en el panel de cobranza mensual.
 */
let pagosCobranzaMap = {};


/* IMPORTACIÓN DESDE SHEETS */

let importEncabezados = [];
let importFilasCrudas = [];
let importMapeoColumnas = {};
let importPeriodoSeleccionado = "";
let importTarifasResueltas = {};
let importGruposResueltos = {};
let importEstadosResueltos = {};
let importPreviewFilas = [];



/* ======================================================
   DOM
====================================================== */

const formAlumno =
    document.getElementById("formAlumno");

const listaAlumnos =
    document.getElementById("listaAlumnos");

const cabeceraListaAlumnos =
    document.getElementById(
        "cabeceraListaAlumnos"
    );

const btnMostrarTodosAlumnos =
    document.getElementById(
        "btnMostrarTodosAlumnos"
    );

const btnEliminarSeleccionados =
    document.getElementById(
        "btnEliminarSeleccionados"
    );

const btnEliminarAlumno =
    document.getElementById(
        "btnEliminarAlumno"
    );

const btnCargarCobranza =
    document.getElementById(
        "btnCargarCobranza"
    );

const mensaje =
    document.getElementById("mensaje");

const buscador =
    document.getElementById("buscador");

const filtroEstado =
    document.getElementById("filtroEstado");


const expediente =
    document.getElementById("expediente");

const cerrarExpediente =
    document.getElementById("cerrarExpediente");


/* ASISTENCIA DEL ALUMNO (dentro del expediente) */

const expedienteAsistenciaMes =
    document.getElementById(
        "expedienteAsistenciaMes"
    );

const resumenAsistenciaAlumno =
    document.getElementById(
        "resumenAsistenciaAlumno"
    );

const btnToggleAsistenciaManual =
    document.getElementById(
        "btnToggleAsistenciaManual"
    );

const panelAsistenciaManual =
    document.getElementById(
        "panelAsistenciaManual"
    );

const btnToggleHistorialAsistencia =
    document.getElementById(
        "btnToggleHistorialAsistencia"
    );

const panelHistorialAsistencia =
    document.getElementById(
        "panelHistorialAsistencia"
    );


const btnEditar =
    document.getElementById("btnEditar");

const formEdicion =
    document.getElementById("formEdicion");

const guardarEdicion =
    document.getElementById("guardarEdicion");

const cancelarEdicion =
    document.getElementById("cancelarEdicion");

const mensajeEdicion =
    document.getElementById("mensajeEdicion");


const formTarifa =
    document.getElementById("formTarifa");

const listaTarifas =
    document.getElementById("listaTarifas");

const mensajeTarifa =
    document.getElementById("mensajeTarifa");

const btnToggleTarifa =
    document.getElementById(
        "btnToggleTarifa"
    );

const panelAltaTarifa =
    document.getElementById(
        "panelAltaTarifa"
    );

const btnCancelarTarifa =
    document.getElementById(
        "btnCancelarTarifa"
    );


const selectTarifaAlta =
    document.getElementById("tarifaId");

const selectTarifaEdicion =
    document.getElementById("editTarifaId");


/* GRUPOS (CATÁLOGO) */

const formGrupo =
    document.getElementById("formGrupo");

const listaGrupos =
    document.getElementById("listaGrupos");

const mensajeGrupo =
    document.getElementById("mensajeGrupo");

const btnGuardarGrupo =
    document.getElementById(
        "btnGuardarGrupo"
    );

const accionMasivaGrupo =
    document.getElementById(
        "accionMasivaGrupo"
    );

const btnToggleGrupo =
    document.getElementById(
        "btnToggleGrupo"
    );

const panelAltaGrupo =
    document.getElementById(
        "panelAltaGrupo"
    );

const btnCancelarGrupo =
    document.getElementById(
        "btnCancelarGrupo"
    );

const selectGrupoAlta =
    document.getElementById("grupo");

const selectGrupoEdicion =
    document.getElementById("editGrupo");


/* IMPORTAR ALUMNOS DESDE SHEETS */

const btnToggleImportar =
    document.getElementById("btnToggleImportar");

const panelImportar =
    document.getElementById("panelImportar");

const importPaso1 =
    document.getElementById("importPaso1");

const importTexto =
    document.getElementById("importTexto");

const btnAnalizarImportacion =
    document.getElementById("btnAnalizarImportacion");

const mensajeImportPaso1 =
    document.getElementById("mensajeImportPaso1");

const importPaso2 =
    document.getElementById("importPaso2");

const importConteoFilas =
    document.getElementById("importConteoFilas");

const mapeoColumnas =
    document.getElementById("mapeoColumnas");

const importPeriodoPago =
    document.getElementById("importPeriodoPago");

const btnContinuarMapeo =
    document.getElementById("btnContinuarMapeo");

const mensajeImportPaso2 =
    document.getElementById("mensajeImportPaso2");

const importPaso3 =
    document.getElementById("importPaso3");

const resolverGrupos =
    document.getElementById("resolverGrupos");

const resolverTarifas =
    document.getElementById("resolverTarifas");

const resolverEstadosPago =
    document.getElementById("resolverEstadosPago");

const btnContinuarResolucion =
    document.getElementById("btnContinuarResolucion");

const mensajeImportPaso3 =
    document.getElementById("mensajeImportPaso3");

const importPaso4 =
    document.getElementById("importPaso4");

const importSeleccionarTodos =
    document.getElementById("importSeleccionarTodos");

const listaPreviewImportacion =
    document.getElementById("listaPreviewImportacion");

const btnImportarAhora =
    document.getElementById("btnImportarAhora");

const btnReiniciarImportacion =
    document.getElementById("btnReiniciarImportacion");

const mensajeImportPaso4 =
    document.getElementById("mensajeImportPaso4");


const loginSection =
    document.getElementById("loginSection");

const appPrincipal =
    document.getElementById("appPrincipal");

const formLogin =
    document.getElementById("formLogin");

const mensajeLogin =
    document.getElementById("mensajeLogin");

const linkOlvidoPassword =
    document.getElementById("linkOlvidoPassword");

const correoUsuarioSpan =
    document.getElementById("correoUsuario");

const btnCerrarSesion =
    document.getElementById("btnCerrarSesion");

const btnToggleAdministracion =
    document.getElementById(
        "btnToggleAdministracion"
    );

const seccionAdministracion =
    document.getElementById(
        "seccionAdministracion"
    );


/* NAVEGACIÓN LATERAL */

const rolUsuarioTexto =
    document.getElementById(
        "rolUsuarioTexto"
    );

const navBtnAlumnos =
    document.getElementById(
        "navBtnAlumnos"
    );

const navBtnCobranza =
    document.getElementById(
        "navBtnCobranza"
    );

const navBtnAsistencia =
    document.getElementById(
        "navBtnAsistencia"
    );

const vistaAlumnos =
    document.getElementById(
        "vistaAlumnos"
    );

const vistaCobranza =
    document.getElementById(
        "vistaCobranza"
    );

const vistaAsistencia =
    document.getElementById(
        "vistaAsistencia"
    );

const expedienteBackdrop =
    document.getElementById(
        "expedienteBackdrop"
    );


/* ASISTENCIA POR GRUPO */

const asistenciaGrupoSelect =
    document.getElementById(
        "asistenciaGrupo"
    );

const asistenciaFecha =
    document.getElementById(
        "asistenciaFecha"
    );

const btnCargarAsistenciaGrupo =
    document.getElementById(
        "btnCargarAsistenciaGrupo"
    );

const btnMarcarTodosPresentes =
    document.getElementById(
        "btnMarcarTodosPresentes"
    );

const btnGuardarAsistenciaGrupo =
    document.getElementById(
        "btnGuardarAsistenciaGrupo"
    );

const listaAsistenciaGrupo =
    document.getElementById(
        "listaAsistenciaGrupo"
    );

const mensajeAsistenciaGrupo =
    document.getElementById(
        "mensajeAsistenciaGrupo"
    );


/* USUARIOS */

const btnToggleUsuario =
    document.getElementById(
        "btnToggleUsuario"
    );

const panelAltaUsuario =
    document.getElementById(
        "panelAltaUsuario"
    );

const formUsuario =
    document.getElementById(
        "formUsuario"
    );

const mensajeUsuario =
    document.getElementById(
        "mensajeUsuario"
    );

const btnCancelarUsuario =
    document.getElementById(
        "btnCancelarUsuario"
    );

const btnGuardarUsuario =
    document.getElementById(
        "btnGuardarUsuario"
    );

const listaUsuarios =
    document.getElementById(
        "listaUsuarios"
    );

const campoUsuarioPassword =
    document.getElementById(
        "campoUsuarioPassword"
    );

const usuarioCorreoInput =
    document.getElementById(
        "usuarioCorreo"
    );

const usuarioPasswordInput =
    document.getElementById(
        "usuarioPassword"
    );


const btnToggleAlta =
    document.getElementById("btnToggleAlta");

const panelAltaAlumno =
    document.getElementById("panelAltaAlumno");

const btnCancelarAlta =
    document.getElementById("btnCancelarAlta");


/* PAGOS */

const formPago =
    document.getElementById("formPago");

const mensajePago =
    document.getElementById("mensajePago");

const pagoPeriodo =
    document.getElementById("pagoPeriodo");

const pagoEstado =
    document.getElementById("pagoEstado");

const pagoMonto =
    document.getElementById("pagoMonto");

const notaMontoPago =
    document.getElementById(
        "notaMontoPago"
    );

const pagoFecha =
    document.getElementById("pagoFecha");

const pagoMetodo =
    document.getElementById("pagoMetodo");

const pagoNota =
    document.getElementById("pagoNota");

const historialPagos =
    document.getElementById("historialPagos");

const tituloFormularioPago =
    document.getElementById(
        "tituloFormularioPago"
    );

const btnGuardarPago =
    document.getElementById(
        "btnGuardarPago"
    );

const btnCancelarEdicionPago =
    document.getElementById(
        "btnCancelarEdicionPago"
    );


/* ANUALIDAD */

const resumenAnioAnualidad =
    document.getElementById(
        "resumenAnioAnualidad"
    );

const resumenEstadoAnualidad =
    document.getElementById(
        "resumenEstadoAnualidad"
    );

const formAnualidad =
    document.getElementById(
        "formAnualidad"
    );

const mensajeAnualidad =
    document.getElementById(
        "mensajeAnualidad"
    );

const anualidadAnio =
    document.getElementById(
        "anualidadAnio"
    );

const anualidadEstado =
    document.getElementById(
        "anualidadEstado"
    );

const anualidadMonto =
    document.getElementById(
        "anualidadMonto"
    );

const anualidadFecha =
    document.getElementById(
        "anualidadFecha"
    );

const anualidadMetodo =
    document.getElementById(
        "anualidadMetodo"
    );

const anualidadNota =
    document.getElementById(
        "anualidadNota"
    );

const historialAnualidades =
    document.getElementById(
        "historialAnualidades"
    );

const tituloFormularioAnualidad =
    document.getElementById(
        "tituloFormularioAnualidad"
    );

const btnGuardarAnualidad =
    document.getElementById(
        "btnGuardarAnualidad"
    );

const btnCancelarEdicionAnualidad =
    document.getElementById(
        "btnCancelarEdicionAnualidad"
    );


/* COBRANZA MENSUAL */

const seccionCobranzaMensual =
    document.getElementById(
        "seccionCobranzaMensual"
    );

const cobranzaPeriodoInput =
    document.getElementById(
        "cobranzaPeriodo"
    );

const cobranzaFiltroEstadoAlumno =
    document.getElementById(
        "cobranzaFiltroEstadoAlumno"
    );

const cobranzaFiltroPago =
    document.getElementById(
        "cobranzaFiltroPago"
    );

const listaCobranza =
    document.getElementById(
        "listaCobranza"
    );

const cobranzaTotalConsiderados =
    document.getElementById(
        "cobranzaTotalConsiderados"
    );

const cobranzaTotalPagaron =
    document.getElementById(
        "cobranzaTotalPagaron"
    );

const cobranzaTotalNoPagaron =
    document.getElementById(
        "cobranzaTotalNoPagaron"
    );

const cobranzaTotalSinRegistro =
    document.getElementById(
        "cobranzaTotalSinRegistro"
    );



/* ======================================================
   FUNCIONES GENERALES
====================================================== */

function textoSeguro(valor) {

    if (
        valor === undefined ||
        valor === null ||
        valor === ""
    ) {
        return "—";
    }

    return String(valor);

}


function escaparHtml(valor) {

    return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function nombreCompleto(alumno) {

    return [
        alumno.nombre,
        alumno.apellidoPaterno,
        alumno.apellidoMaterno
    ]
        .filter(Boolean)
        .join(" ");

}


function formatearFecha(fecha) {

    if (!fecha) {
        return "—";
    }

    if (
        typeof fecha === "object" &&
        fecha.toDate
    ) {

        return fecha
            .toDate()
            .toLocaleDateString("es-MX");

    }

    if (
        typeof fecha === "object" &&
        fecha.seconds !== undefined
    ) {

        const date =
            new Date(
                fecha.seconds * 1000
            );

        return date.toLocaleDateString(
            "es-MX"
        );

    }

    return "—";

}


function formatearFechaSimple(fecha) {

    if (!fecha) {
        return "—";
    }

    const partes =
        String(fecha).split("-");

    if (partes.length !== 3) {
        return fecha;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}


function formatearMoneda(valor) {

    const numero =
        Number(valor || 0);

    return numero.toLocaleString(
        "es-MX",
        {
            style: "currency",
            currency: "MXN"
        }
    );

}


/*
 * Convierte un teléfono guardado (a 10 dígitos,
 * como se acostumbra en México) al formato que
 * necesita wa.me. Si ya trae código de país lo
 * deja igual.
 */

function formatearTelefonoWhatsApp(
    telefono
) {

    let limpio =
        String(telefono || "")
            .replace(/\D/g, "");

    if (!limpio) {
        return "";
    }

    if (
        limpio.length === 10
    ) {

        limpio =
            "52" + limpio;

    }

    return limpio;

}


const NOMBRES_MESES = [
    "enero", "febrero", "marzo", "abril",
    "mayo", "junio", "julio", "agosto",
    "septiembre", "octubre", "noviembre", "diciembre"
];


function nombreMesDesdePeriodo(
    periodo
) {

    const partes =
        String(periodo || "").split("-");

    if (
        partes.length !== 2
    ) {
        return periodo || "";
    }

    const indice =
        Number(partes[1]) - 1;

    const nombreMes =
        NOMBRES_MESES[indice] ||
        partes[1];

    return `${nombreMes} ${partes[0]}`;

}


/*
 * Arma el link de "click to chat" de WhatsApp
 * con un recordatorio de pago ya redactado.
 * No envía nada automáticamente: solo abre
 * WhatsApp con el mensaje listo para revisar
 * y dar "Enviar".
 */

function generarLinkWhatsAppRecordatorio(
    alumno,
    periodo
) {

    const telefono =
        formatearTelefonoWhatsApp(
            alumno.telefono
        );

    if (!telefono) {
        return null;
    }

    const mesTexto =
        nombreMesDesdePeriodo(
            periodo
        );

    const mensaje =
        `Hola ${alumno.nombre || ""}, te saluda Blue Mat Academy 🥋. ` +
        `Te recordamos que tu mensualidad de ${mesTexto} ` +
        `(${formatearMoneda(alumno.cuotaMensual)}) sigue pendiente de pago. ` +
        `Cualquier duda con gusto te ayudamos. ¡Gracias!`;

    return `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;

}


/*
 * Genera la URL de una imagen QR (servicio público
 * api.qrserver.com, sin necesidad de librerías) con
 * el texto que le pasemos ya codificado dentro.
 */

function generarUrlQR(
    texto
) {

    return (
        "https://api.qrserver.com/v1/create-qr-code/" +
        `?size=220x220&data=${encodeURIComponent(texto)}`
    );

}


/*
 * Envía el recibo de un pago (con QR) al correo del
 * alumno usando EmailJS. Lanza un error con un código
 * legible si algo falta (sin correo, sin configurar
 * EmailJS, etc.) para que quien llame decida el mensaje.
 */

async function enviarReciboPorCorreo(
    alumno,
    pago
) {

    if (
        !window.emailjs ||
        EMAILJS_PUBLIC_KEY === "TU_PUBLIC_KEY"
    ) {

        throw new Error(
            "EMAILJS_NO_CONFIGURADO"
        );

    }

    if (
        !alumno.correo
    ) {

        throw new Error(
            "SIN_CORREO"
        );

    }

    const mesTexto =
        nombreMesDesdePeriodo(
            pago.periodo
        );

    const fechaTexto =
        pago.fechaPago
            ? formatearFecha(
                pago.fechaPago
            )
            : "—";

    const textoQR =
        "Blue Mat Academy\n" +
        `Alumno: ${nombreCompleto(alumno)}\n` +
        `Periodo: ${mesTexto}\n` +
        `Monto: ${formatearMoneda(pago.monto)}\n` +
        `Fecha de pago: ${fechaTexto}\n` +
        `Folio: ${pago.id}`;

    const parametros = {

        to_email:
            alumno.correo,

        alumno_nombre:
            nombreCompleto(alumno),

        periodo:
            mesTexto,

        monto:
            formatearMoneda(pago.monto),

        fecha_pago:
            fechaTexto,

        metodo_pago:
            pago.metodoPago || "—",

        folio:
            pago.id,

        qr_url:
            generarUrlQR(textoQR)

    };

    await window.emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        parametros
    );

}


function obtenerFechaHoy() {

    const ahora =
        new Date();

    const year =
        ahora.getFullYear();

    const month =
        String(
            ahora.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            ahora.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


function obtenerPeriodoActual() {

    return obtenerFechaHoy()
        .substring(0, 7);

}


function mostrarMensaje(
    elemento,
    texto,
    tipo
) {

    elemento.textContent =
        texto;

    elemento.className =
        `mensaje ${tipo}`;

}


function limpiarMensaje(elemento) {

    elemento.textContent = "";

    elemento.className =
        "mensaje";

}



/* ======================================================
   IMÁGENES
====================================================== */

function comprimirImagen(file) {

    return new Promise(
        (resolve, reject) => {

            const lector =
                new FileReader();

            lector.onload =
                function(e) {

                    const imagen =
                        new Image();

                    imagen.onload =
                        function() {

                            const maximo =
                                500;

                            let ancho =
                                imagen.width;

                            let alto =
                                imagen.height;

                            if (
                                ancho >
                                maximo
                            ) {

                                alto =
                                    alto *
                                    maximo /
                                    ancho;

                                ancho =
                                    maximo;

                            }

                            if (
                                alto >
                                maximo
                            ) {

                                ancho =
                                    ancho *
                                    maximo /
                                    alto;

                                alto =
                                    maximo;

                            }

                            const canvas =
                                document.createElement(
                                    "canvas"
                                );

                            canvas.width =
                                ancho;

                            canvas.height =
                                alto;

                            const contexto =
                                canvas.getContext(
                                    "2d"
                                );

                            contexto.drawImage(
                                imagen,
                                0,
                                0,
                                ancho,
                                alto
                            );

                            resolve(
                                canvas.toDataURL(
                                    "image/jpeg",
                                    0.75
                                )
                            );

                        };

                    imagen.onerror =
                        reject;

                    imagen.src =
                        e.target.result;

                };

            lector.onerror =
                reject;

            lector.readAsDataURL(file);

        }
    );

}


document
    .getElementById("foto")
    .addEventListener(
        "change",
        async function() {

            const archivo =
                this.files[0];

            if (!archivo) {
                return;
            }

            try {

                fotoBase64Nueva =
                    await comprimirImagen(
                        archivo
                    );

                const preview =
                    document.getElementById(
                        "previewFotoNueva"
                    );

                preview.src =
                    fotoBase64Nueva;

                preview.style.display =
                    "block";

            } catch (error) {

                console.error(error);

            }

        }
    );


document
    .getElementById("editFoto")
    .addEventListener(
        "change",
        async function() {

            const archivo =
                this.files[0];

            if (!archivo) {
                return;
            }

            try {

                fotoBase64Edicion =
                    await comprimirImagen(
                        archivo
                    );

                const preview =
                    document.getElementById(
                        "previewFotoEdicion"
                    );

                preview.src =
                    fotoBase64Edicion;

                preview.style.display =
                    "block";

            } catch (error) {

                console.error(error);

            }

        }
    );
