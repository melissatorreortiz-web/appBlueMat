// Blue Mat Academy - módulo separado

/* ======================================================
   TARIFAS
====================================================== */

async function cargarTarifas() {

    try {

        const snapshot =
            await getDocs(
                collection(db, "tarifas")
            );

        tarifas = [];

        tarifasMap = {};

        snapshot.forEach(
            documento => {

                const tarifa = {
                    id: documento.id,
                    ...documento.data()
                };

                tarifas.push(
                    tarifa
                );

                tarifasMap[
                    tarifa.id
                ] = tarifa;

            }
        );

        tarifas.sort(
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

        renderizarTarifas();

        poblarSelectsTarifas();

    } catch (error) {

        console.error(
            "Error cargando tarifas:",
            error
        );

    }

}


function renderizarTarifas() {

    listaTarifas.innerHTML = "";

    if (tarifas.length === 0) {

        listaTarifas.innerHTML = `
            <tr>
                <td colspan="2">
                    No hay tarifas registradas.
                </td>
            </tr>
        `;

        return;

    }

    tarifas.forEach(
        tarifa => {

            const fila =
                document.createElement(
                    "tr"
                );

            fila.innerHTML = `
                <td>
                    ${escaparHtml(
                        tarifa.nombre
                    )}
                </td>

                <td class="tarifa-cuota">
                    ${formatearMoneda(
                        tarifa.cuotaBase
                    )}
                </td>
            `;

            listaTarifas.appendChild(
                fila
            );

        }
    );

}


function poblarSelectsTarifas() {

    const selects = [
        selectTarifaAlta,
        selectTarifaEdicion
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
                    Seleccionar tarifa
                </option>
            `;

            tarifas.forEach(
                tarifa => {

                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        tarifa.id;

                    option.textContent =
                        `${tarifa.nombre} — ${formatearMoneda(
                            tarifa.cuotaBase
                        )}`;

                    select.appendChild(
                        option
                    );

                }
            );

            if (
                valorActual &&
                tarifasMap[
                    valorActual
                ]
            ) {

                select.value =
                    valorActual;

            }

        }
    );

}


function cerrarPanelTarifa() {

    panelAltaTarifa.classList.remove(
        "abierto"
    );

    btnToggleTarifa.classList.remove(
        "abierto"
    );

    formTarifa.reset();

    limpiarMensaje(
        mensajeTarifa
    );

}


btnToggleTarifa.addEventListener(
    "click",
    function() {

        const abierto =
            panelAltaTarifa
                .classList
                .contains(
                    "abierto"
                );

        if (abierto) {

            cerrarPanelTarifa();

        } else {

            panelAltaTarifa
                .classList
                .add(
                    "abierto"
                );

            btnToggleTarifa
                .classList
                .add(
                    "abierto"
                );

        }

    }
);


btnCancelarTarifa.addEventListener(
    "click",
    cerrarPanelTarifa
);


formTarifa.addEventListener(
    "submit",
    async function(e) {

        e.preventDefault();

        limpiarMensaje(
            mensajeTarifa
        );

        const nombre =
            document
                .getElementById(
                    "tarifaNombre"
                )
                .value
                .trim();

        const cuotaBase =
            Number(
                document
                    .getElementById(
                        "tarifaCuotaBase"
                    )
                    .value
            );

        if (
            !nombre ||
            isNaN(cuotaBase) ||
            cuotaBase < 0
        ) {

            mostrarMensaje(
                mensajeTarifa,
                "Verifica los datos de la tarifa.",
                "error"
            );

            return;

        }

        try {

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

            formTarifa.reset();

            mostrarMensaje(
                mensajeTarifa,
                "Tarifa agregada correctamente.",
                "ok"
            );

            await cargarTarifas();

            setTimeout(
                cerrarPanelTarifa,
                800
            );

        } catch (error) {

            console.error(error);

            mostrarMensaje(
                mensajeTarifa,
                "No fue posible guardar la tarifa.",
                "error"
            );

        }

    }
);
