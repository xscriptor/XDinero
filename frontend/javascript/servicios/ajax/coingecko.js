/**
 * COINGECKO.JS — Servicio AJAX
 * Interacción con la API pública de CoinGecko
 * Con sistema de caché para evitar errores 429
 */

var ServicioCoinGecko = {};

// Caché simple
var cacheCG = {
    mercados: {},
    busqueda: {},
    graficos: {}
};

var CACHE_TTL = 60000; // 1 minuto

/**
 * Obtener datos de caché si son recientes
 */
function obtenerDeCache(tipo, clave) {
    var item = cacheCG[tipo][clave];
    if (item && Date.now() - item.marcaTiempo < CACHE_TTL) {
        return item.datos;
    }
    return null;
}

/**
 * Guardar datos en caché
 */
function guardarEnCache(tipo, clave, datos) {
    cacheCG[tipo][clave] = {
        datos: datos,
        marcaTiempo: Date.now()
    };
}

/**
 * Obtener datos del mercado de criptomonedas
 * @param {string} moneda - Moneda base (ej: 'usd', 'eur')
 * @param {number} porPagina - Cantidad de resultados
 * @param {number} pagina - Número de página
 * @param {string|null} ids - IDs específicos separados por coma
 * @returns {jqXHR}
 */
ServicioCoinGecko.obtenerMercados = function (moneda, porPagina, pagina, ids) {
    moneda = moneda || 'usd';
    porPagina = porPagina || 100;
    pagina = pagina || 1;

    var claveCache = moneda + '_' + porPagina + '_' + pagina + '_' + (ids || 'todos');
    var datosCache = obtenerDeCache('mercados', claveCache);

    if (datosCache) {
        return $.Deferred().resolve(datosCache).promise();
    }

    // Instanciar DTO
    var dto = new window.CoinGeckoMercadosDTO(moneda, porPagina, pagina, ids);

    // Preparar objeto Petición
    var peticion = new window.PeticionAJAX('https://api.coingecko.com/api/v3/coins/markets', 'GET').setDatos(dto);

    return XD.peticion(peticion).then(function (respuesta) {
        guardarEnCache('mercados', claveCache, respuesta);
        return respuesta;
    });
};

/**
 * Buscar criptomonedas por nombre o símbolo
 * @param {string} consulta - Término de búsqueda
 * @returns {jqXHR}
 */
ServicioCoinGecko.buscar = function (consulta) {
    var claveCache = consulta.toLowerCase();
    var datosCache = obtenerDeCache('busqueda', claveCache);

    if (datosCache) {
        return $.Deferred().resolve(datosCache).promise();
    }

    var dto = new window.CoinGeckoBusquedaDTO(consulta);
    var peticion = new window.PeticionAJAX('https://api.coingecko.com/api/v3/search', 'GET').setDatos(dto);

    return XD.peticion(peticion).then(function (respuesta) {
        guardarEnCache('busqueda', claveCache, respuesta);
        return respuesta;
    });
};

/**
 * Obtener histórico de precios para gráficos
 * @param {string} idMoneda - ID de la moneda (ej: 'bitcoin')
 * @param {string} moneda - Moneda base (ej: 'usd')
 * @param {string} dias - Rango de días (ej: '1', '7', '30')
 * @returns {jqXHR}
 */
ServicioCoinGecko.obtenerGrafico = function (idMoneda, moneda, dias) {
    moneda = moneda || 'usd';
    dias = dias || '1';

    var claveCache = idMoneda + '_' + moneda + '_' + dias;
    var datosCache = obtenerDeCache('graficos', claveCache);

    if (datosCache) {
        return $.Deferred().resolve(datosCache).promise();
    }

    var dto = new window.CoinGeckoGraficoDTO(moneda, dias);
    var peticion = new window.PeticionAJAX('https://api.coingecko.com/api/v3/coins/' + idMoneda + '/market_chart', 'GET').setDatos(dto);

    return XD.peticion(peticion).then(function (respuesta) {
        guardarEnCache('graficos', claveCache, respuesta);
        return respuesta;
    });
};