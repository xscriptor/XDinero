/**
 * MERCADO.JS — XDinero
 * Página de mercado de criptomonedas con CoinGecko API
 * Grid de monedas con búsqueda + modal con gráfico Chart.js
 */

var Mercado = {
    estado: {
        todasLasMonedas: [],
        monedasFiltradas: [],
        intervaloRecarga: null,
        instanciaGrafico: null,
        monedaSeleccionada: null,
        // Lista de seguimiento (watchlist)
        simbolosSeguidos: [] // Array de strings con los IDs de monedas seguidas
    }
};

/**
 * Inicializar la página de mercado
 */
Mercado.inicializar = function () {
    // Cargar lista de seguimiento antes de pintar datos (si está logueado)
    Mercado.cargarListaSeguimiento().then(function () {
        Mercado.cargarDatos();
    });
    Mercado.vincularEventos();

    // Auto-recarga cada 60 segundos
    Mercado.estado.intervaloRecarga = setInterval(function () {
        Mercado.cargarDatos();
    }, 60000);
};

/**
 * Cargar la lista de seguimiento del usuario actual desde el backend
 */
Mercado.cargarListaSeguimiento = function () {
    // Si no hay usuario logueado, retornar promesa resuelta vacía
    if (!Aplicacion.usuario) {
        Mercado.estado.simbolosSeguidos = [];
        return $.Deferred().resolve().promise();
    }

    return ServicioPerfil.obtenerListaSeguimiento(Aplicacion.usuario.id)
        .then(function (res) {
            if (res && res.exito && res.lista) {
                // Extraer solo los símbolos (IDs de moneda) en un array
                Mercado.estado.simbolosSeguidos = res.lista.map(function (item) {
                    return item.simbolo;
                });
            } else {
                Mercado.estado.simbolosSeguidos = [];
            }
        })
        .catch(function () {
            Mercado.estado.simbolosSeguidos = [];
        });
};

/**
 * Cargar datos del mercado desde CoinGecko
 */
Mercado.cargarDatos = function () {
    ServicioCoinGecko.obtenerMercados('usd', 100, 1)
        .then(function (datos) {
            Mercado.estado.todasLasMonedas = datos || [];
            Mercado.filtrar();

            $('#mercado-cargando').addClass('xd-oculto');
            $('#mercado-grid').removeClass('xd-oculto');
        })
        .catch(function () {
            $('#mercado-cargando').addClass('xd-oculto');
            XD.mostrarToast('Error al cargar datos del mercado', 'error');
        });
};

/**
 * Filtrar monedas según el término de búsqueda
 * Las monedas en la lista de seguimiento se muestran primero
 */
Mercado.filtrar = function () {
    var termino = $('#busqueda-moneda').val().trim().toLowerCase();
    var resultado;

    if (!termino) {
        resultado = Mercado.estado.todasLasMonedas.slice(); // Clonar
    } else {
        resultado = Mercado.estado.todasLasMonedas.filter(function (moneda) {
            return moneda.name.toLowerCase().indexOf(termino) !== -1 ||
                   moneda.symbol.toLowerCase().indexOf(termino) !== -1;
        });
    }

    // Ordenar: monedas de la lista de seguimiento primero
    var simbolosSeguidos = Mercado.estado.simbolosSeguidos;
    if (simbolosSeguidos.length > 0) {
        resultado.sort(function (a, b) {
            var aEnLista = simbolosSeguidos.indexOf(a.id) !== -1 ? 1 : 0;
            var bEnLista = simbolosSeguidos.indexOf(b.id) !== -1 ? 1 : 0;
            return bEnLista - aEnLista; // Los seguidos primero
        });
    }

    Mercado.estado.monedasFiltradas = resultado;
    Mercado.pintarGrid();
};

/**
 * Pintar el grid de monedas dinámicamente (creación DOM)
 */
Mercado.pintarGrid = function () {
    var $grid = $('#mercado-grid');
    $grid.empty();

    if (!Mercado.estado.monedasFiltradas.length) {
        $('#mercado-vacio').removeClass('xd-oculto');
        return;
    }

    $('#mercado-vacio').addClass('xd-oculto');

    // Colores de borde lateral para variedad visual
    var coloresBorde = [
        'var(--color-primario)',
        'var(--color-acento)',
        '#8B5CF6',
        '#F59E0B',
        '#EC4899',
        '#6366F1',
        '#EF4444',
        '#14B8A6'
    ];

    Mercado.estado.monedasFiltradas.forEach(function (moneda, indice) {
        var cambio = moneda.price_change_percentage_24h || 0;
        var esPositivo = cambio >= 0;
        var colorBorde = coloresBorde[indice % coloresBorde.length];
        var estaSeguida = Mercado.estado.simbolosSeguidos.indexOf(moneda.id) !== -1;

        // Crear elemento con DOM
        var tarjeta = document.createElement('div');
        tarjeta.className = 'xd-tarjeta mercado-moneda-tarjeta' + (estaSeguida ? ' mercado-tarjeta-seguida' : '');
        tarjeta.style.borderLeft = '4px solid ' + colorBorde;
        tarjeta.setAttribute('role', 'button');
        tarjeta.setAttribute('tabindex', '0');
        tarjeta.setAttribute('aria-label', 'Ver detalles de ' + moneda.name);
        tarjeta.dataset.id = moneda.id;

        // Indicador de seguimiento en la esquina superior
        var indicadorSeguimiento = estaSeguida
            ? '<span class="mercado-indicador-seguida" title="En tu lista de seguimiento" aria-label="En tu lista de seguimiento"><img src="img/estrella-rellena.svg" alt="" class="mercado-icono-estrella"></span>'
            : '';

        tarjeta.innerHTML =
            indicadorSeguimiento +
            '<div class="mercado-moneda-cabecera">' +
            '<img src="' + moneda.image + '" alt="" class="mercado-moneda-icono" loading="lazy">' +
            '<div class="mercado-moneda-info">' +
            '<span class="mercado-moneda-nombre">' + moneda.name + '</span>' +
            '<span class="mercado-moneda-simbolo">' + moneda.symbol.toUpperCase() + '</span>' +
            '</div>' +
            '</div>' +
            '<div class="mercado-moneda-precio">$' + Mercado.formatearPrecio(moneda.current_price) + '</div>' +
            '<div class="mercado-moneda-cambio ' + (esPositivo ? 'positivo' : 'negativo') + '">' +
            (esPositivo ? '▲' : '▼') + ' ' + Math.abs(cambio).toFixed(2) + '%' +
            '</div>';

        $grid.append(tarjeta);
    });
};

/**
 * Formatear precio con separadores
 */
Mercado.formatearPrecio = function (precio) {
    if (!precio && precio !== 0) return '0';
    if (precio < 0.01) return precio.toFixed(6);
    if (precio < 1) return precio.toFixed(4);
    return precio.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

/**
 * Formatear números grandes (cap. mercado, volumen)
 */
Mercado.formatearNumeroGrande = function (num) {
    if (!num) return '$0';
    if (num >= 1e12) return '$' + (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return '$' + (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return '$' + (num / 1e6).toFixed(2) + 'M';
    return '$' + num.toLocaleString('en-US');
};

/**
 * Abrir el modal de detalle de una moneda
 */
Mercado.abrirModal = function (idMoneda) {
    var moneda = Mercado.estado.todasLasMonedas.find(function (m) { return m.id === idMoneda; });
    if (!moneda) return;

    Mercado.estado.monedaSeleccionada = moneda;

    // Rellenar datos del modal
    $('#modal-moneda-img').attr('src', moneda.image).attr('alt', moneda.name);
    $('#modal-moneda-nombre').text(moneda.name);
    $('#modal-moneda-simbolo').text(moneda.symbol.toUpperCase());
    $('#modal-precio').text('$' + Mercado.formatearPrecio(moneda.current_price));

    var cambio = moneda.price_change_percentage_24h || 0;
    var esPositivo = cambio >= 0;
    $('#modal-cambio24h')
        .text((esPositivo ? '+' : '') + cambio.toFixed(2) + '%')
        .css('color', esPositivo ? 'var(--color-exito)' : 'var(--color-error)');

    $('#modal-cap-mercado').text(Mercado.formatearNumeroGrande(moneda.market_cap));
    $('#modal-volumen').text(Mercado.formatearNumeroGrande(moneda.total_volume));
    $('#modal-max24h').text('$' + Mercado.formatearPrecio(moneda.high_24h));
    $('#modal-min24h').text('$' + Mercado.formatearPrecio(moneda.low_24h));
    $('#modal-ath').text('$' + Mercado.formatearPrecio(moneda.ath));

    // Actualizar botón de lista de seguimiento en el modal
    Mercado.actualizarBotonSeguimiento(moneda.id);

    // Mostrar modal
    $('#modal-moneda').removeClass('xd-oculto');

    // Cargar gráfico
    Mercado.cargarGrafico(moneda.id, cambio >= 0);
};

/**
 * Cargar gráfico con Chart.js usando datos de CoinGecko
 */
Mercado.cargarGrafico = function (idMoneda, esAlcista) {
    // Destruir gráfico anterior si existe
    if (Mercado.estado.instanciaGrafico) {
        Mercado.estado.instanciaGrafico.destroy();
        Mercado.estado.instanciaGrafico = null;
    }

    ServicioCoinGecko.obtenerGrafico(idMoneda, 'usd', '1')
        .then(function (datos) {
            if (!datos || !datos.prices) return;

            var precios = datos.prices;
            var etiquetas = precios.map(function (p) {
                var fecha = new Date(p[0]);
                return fecha.getHours() + ':' + (fecha.getMinutes() < 10 ? '0' : '') + fecha.getMinutes();
            });
            var valores = precios.map(function (p) { return p[1]; });

            var canvas = document.getElementById('grafico-moneda');
            var ctx = canvas.getContext('2d');

            var colorLinea = esAlcista ? '#10B981' : '#EF4444';
            var gradiente = ctx.createLinearGradient(0, 0, 0, 200);
            gradiente.addColorStop(0, esAlcista ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)');
            gradiente.addColorStop(1, esAlcista ? 'rgba(16, 185, 129, 0)' : 'rgba(239, 68, 68, 0)');

            Mercado.estado.instanciaGrafico = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: etiquetas,
                    datasets: [{
                        label: 'Precio (USD)',
                        data: valores,
                        borderColor: colorLinea,
                        backgroundColor: gradiente,
                        borderWidth: 2,
                        pointRadius: 0,
                        pointHoverRadius: 4,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                            callbacks: {
                                label: function (contexto) {
                                    return '$' + Mercado.formatearPrecio(contexto.parsed.y);
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            display: true,
                            ticks: { maxTicksLimit: 8, font: { size: 10 } },
                            grid: { display: false }
                        },
                        y: {
                            display: true,
                            ticks: {
                                font: { size: 10 },
                                callback: function (valor) { return '$' + Mercado.formatearPrecio(valor); }
                            },
                            grid: { color: 'rgba(128,128,128,0.1)' }
                        }
                    },
                    interaction: { mode: 'nearest', axis: 'x', intersect: false }
                }
            });
        })
        .catch(function () {
            XD.mostrarToast('Error al cargar el gráfico', 'error');
        });
};

/**
 * Cerrar modal
 */
Mercado.cerrarModal = function () {
    $('#modal-moneda').addClass('xd-oculto');
    if (Mercado.estado.instanciaGrafico) {
        Mercado.estado.instanciaGrafico.destroy();
        Mercado.estado.instanciaGrafico = null;
    }
};

/**
 * Vincular eventos
 */
Mercado.vincularEventos = function () {
    // Búsqueda en tiempo real
    var temporizadorBusqueda;
    $('#busqueda-moneda').on('input', function () {
        clearTimeout(temporizadorBusqueda);
        temporizadorBusqueda = setTimeout(function () {
            Mercado.filtrar();
        }, 300);
    });

    // Click en tarjeta de moneda (delegación)
    $(document).on('click', '.mercado-moneda-tarjeta', function () {
        var id = $(this).data('id');
        Mercado.abrirModal(id);
    });

    // Accesibilidad: abrir con Enter
    $(document).on('keydown', '.mercado-moneda-tarjeta', function (e) {
        if (e.key === 'Enter') {
            var id = $(this).data('id');
            Mercado.abrirModal(id);
        }
    });

    // Botón de lista de seguimiento en el modal
    $('#btn-seguimiento-moneda').on('click', function (e) {
        e.stopPropagation();
        if (!Mercado.estado.monedaSeleccionada) return;
        Mercado.alternarSeguimiento(Mercado.estado.monedaSeleccionada.id);
    });

    // Cerrar modal
    $('#btn-cerrar-modal-moneda').on('click', function () {
        Mercado.cerrarModal();
    });

    $('#modal-moneda').on('click', function (e) {
        if (e.target === this) {
            Mercado.cerrarModal();
        }
    });

    $(document).on('keydown', function (e) {
        if (e.key === 'Escape' && !$('#modal-moneda').hasClass('xd-oculto')) {
            Mercado.cerrarModal();
        }
    });
};

/**
 * Actualizar el estado visual del botón de seguimiento en el modal
 */
Mercado.actualizarBotonSeguimiento = function (idMoneda) {
    var $btn = $('#btn-seguimiento-moneda');

    // Ocultar si no hay usuario logueado
    if (!Aplicacion.usuario) {
        $btn.addClass('xd-oculto');
        return;
    }

    $btn.removeClass('xd-oculto');
    var estaSeguida = Mercado.estado.simbolosSeguidos.indexOf(idMoneda) !== -1;

    if (estaSeguida) {
        $btn.html('<img src="img/estrella-rellena.svg" alt="" class="mercado-icono-estrella-btn"> En seguimiento');
        $btn.attr('aria-label', 'Quitar de la lista de seguimiento');
        $btn.attr('title', 'Quitar de la lista de seguimiento');
        $btn.removeClass('xd-boton-primario').addClass('xd-boton-seguimiento-activo');
    } else {
        $btn.html('<img src="img/estrella.svg" alt="" class="mercado-icono-estrella-btn"> Seguir');
        $btn.attr('aria-label', 'Añadir a la lista de seguimiento');
        $btn.attr('title', 'Añadir a la lista de seguimiento');
        $btn.removeClass('xd-boton-seguimiento-activo').addClass('xd-boton-primario');
    }
};

/**
 * Alternar (añadir/quitar) una moneda en la lista de seguimiento
 */
Mercado.alternarSeguimiento = function (idMoneda) {
    if (!Aplicacion.usuario) {
        XD.mostrarToast('Debes iniciar sesión para usar la lista de seguimiento', 'info');
        return;
    }

    var $btn = $('#btn-seguimiento-moneda');
    var textoOriginal = $btn.html();
    $btn.prop('disabled', true).html('...');

    ServicioPerfil.alternarListaSeguimiento(idMoneda)
        .then(function (res) {
            if (res && res.exito) {
                // Actualizar array local de símbolos seguidos
                if (res.en_lista) {
                    if (Mercado.estado.simbolosSeguidos.indexOf(idMoneda) === -1) {
                        Mercado.estado.simbolosSeguidos.push(idMoneda);
                    }
                } else {
                    Mercado.estado.simbolosSeguidos = Mercado.estado.simbolosSeguidos.filter(function (s) {
                        return s !== idMoneda;
                    });
                }

                // Actualizar UI del modal y repintar el grid
                Mercado.actualizarBotonSeguimiento(idMoneda);
                Mercado.filtrar();
                XD.mostrarToast(res.mensaje, 'exito');
            } else {
                XD.mostrarToast(res && res.mensaje ? res.mensaje : 'Error al actualizar', 'error');
            }
        })
        .catch(function () {
            XD.mostrarToast('Error de conexión', 'error');
        })
        .finally(function () {
            $btn.prop('disabled', false);
        });
};

/* 
   INICIALIZACIÓN
    */
$(document).ready(function () {
    // Esperar a que la autenticación esté resuelta antes de inicializar
    // Se usa .one() para evitar inicialización duplicada
    $(document).one('xd:autenticacion', function () {
        Mercado.inicializar();
    });
});
