/**
 * AJAX.JS — XDinero
 * Wrapper principal para peticiones AJAX con jQuery
 * Objeto global: window.XD
 */

var XD = {};

/**
 * Muestra una notificación toast
 * @param {string} mensaje - Texto a mostrar
 * @param {string} tipo - Tipo: 'info', 'success', 'error', 'like', 'repost', 'comment', 'user-add', 'user-delete', 'role-change'
 */
XD.mostrarToast = function (mensaje, tipo) {
    tipo = tipo || 'info';

    var $contenedor = $('#contenedor-toast');
    if (!$contenedor.length) {
        $('body').append('<div id="contenedor-toast"></div>');
        $contenedor = $('#contenedor-toast');
    }

    var icono = '';
    var rutaImg = 'img/';

    switch (tipo) {
        case 'success':
            icono = '<img src="' + rutaImg + 'hecho.svg" alt="Éxito" class="xd-icono-invertir">';
            break;
        case 'error':
            icono = '<img src="' + rutaImg + 'cerrar.svg" alt="Error" class="xd-icono-invertir">';
            break;
        case 'like':
            icono = '<img src="' + rutaImg + 'me-gusta-relleno.svg" alt="Me gusta" class="xd-icono-invertir">';
            break;
        case 'repost':
            icono = '<img src="' + rutaImg + 'republicar.svg" alt="Republicar" class="xd-icono-invertir">';
            break;
        case 'comment':
            icono = '<img src="' + rutaImg + 'comentario.svg" alt="Comentario" class="xd-icono-invertir">';
            break;
        case 'user-add':
            icono = '<img src="' + rutaImg + 'usuario.svg" alt="Usuario" class="xd-icono-invertir">';
            break;
        case 'user-delete':
            icono = '<img src="' + rutaImg + 'cerrar.svg" alt="Eliminar" class="xd-icono-invertir">';
            break;
        case 'role-change':
            icono = '<img src="' + rutaImg + 'ajustes.svg" alt="Rol" class="xd-icono-invertir">';
            break;
        default:
            icono = '<img src="' + rutaImg + 'info.svg" alt="Info" class="xd-icono-invertir">';
    }

    var htmlToast =
        '<div class="xd-toast">' +
        icono +
        '<span>' + mensaje + '</span>' +
        '</div>';

    var $toast = $(htmlToast);
    $contenedor.append($toast);

    // Auto eliminar después de 3 segundos
    setTimeout(function () {
        $toast.fadeOut(300, function () {
            $(this).remove();
        });
    }, 3000);
};

/**
 * Wrapper principal para peticiones AJAX que usa clases de envio y retorno
 * Admite pasar una string (retrocompatibilidad) o una instancia de PeticionAJAX
 * Internamente devuelve objetos instancia RespuestaExito o RespuestaError
 * @param {string|PeticionAJAX} endpoint - Ruta o Instancia
 * @param {string} metodo - Método HTTP (si endpoint es string)
 * @param {Object|FormData} datos - Datos (si endpoint es string)
 * @param {Object} opciones - Opciones (si endpoint es string)
 * @returns {Promise<RespuestaExito|RespuestaError>} Promesa
 */
XD.peticion = function (endpoint, metodo, datos, opciones) {
    let peticionObj;
    
    // Validar si el programador nos pasó una clase directamente
    if (endpoint instanceof window.PeticionAJAX || (typeof endpoint === 'object' && endpoint.endpoint)) {
        peticionObj = endpoint;
    } else {
        peticionObj = new window.PeticionAJAX(endpoint, metodo);
        peticionObj.setDatos(datos).setOpciones(opciones || {});
    }

    var url = peticionObj.endpoint;
    if (!peticionObj.endpoint.startsWith('http')) {
        var endpointLimpio = peticionObj.endpoint.replace(/^\//, '');
        url = XDConfig.urlApi + '/' + endpointLimpio;
    }

    var configAjax = {
        url: url,
        method: peticionObj.metodo,
        dataType: 'json'
    };

    // Solo enviar credenciales para peticiones a nuestro propio backend
    if (!url.startsWith('http') || url.startsWith(window.location.origin)) {
        configAjax.xhrFields = { withCredentials: true };
    }

    $.extend(configAjax, peticionObj.opcionesAdicionales);

    if (peticionObj.datos) {
        if (peticionObj.opcionesAdicionales.contentType === false) {
            configAjax.data = peticionObj.datos;
            configAjax.processData = false;
        } else if (peticionObj.metodo.toUpperCase() === 'GET') {
            configAjax.data = peticionObj.datos;
        } else {
            configAjax.data = JSON.stringify(peticionObj.datos);
            configAjax.contentType = 'application/json';
        }
    }

    return new Promise((resolve, reject) => {
        $.ajax(configAjax)
            .done((res) => {
                // Mantener retrocompatibilidad pero se alienta a revisar if(res.exito)
                resolve(res);
            })
            .fail((jqXHR, textStatus, errorThrown) => {
                let msjError = "Error de comunicación con el servidor";
                if(jqXHR.responseJSON && jqXHR.responseJSON.error) {
                    msjError = jqXHR.responseJSON.error;
                }
                
                // Rechazar devolviendo el DTO genérico de error a partir de clase
                // Imprimiendo control de errores pedido en el requerimiento
                console.error("[AJAX Error]", textStatus, errorThrown, url);
                reject(new window.RespuestaError(msjError, jqXHR.status));
            });
    });
};

/**
 * Muestra un modal de confirmación
 * @param {string} titulo - Título del modal
 * @param {string} texto - Texto descriptivo
 * @param {string} textoConfirmar - Texto del botón de confirmar
 * @param {string} claseBtnConfirmar - Clase CSS del botón ('xd-boton-peligro' o 'xd-boton-primario')
 * @returns {Promise<boolean>} Promesa que resuelve a true si confirma, false si cancela
 */
XD.confirmar = function (titulo, texto, textoConfirmar, claseBtnConfirmar) {
    textoConfirmar = textoConfirmar || 'Confirmar';
    claseBtnConfirmar = claseBtnConfirmar || 'xd-boton-primario';

    return new Promise(function (resolver) {
        var htmlModal =
            '<div class="xd-modal-overlay" id="modal-confirmar">' +
            '<div class="xd-modal">' +
            '<h3 class="xd-modal-titulo">' + titulo + '</h3>' +
            '<p class="xd-modal-texto">' + texto + '</p>' +
            '<div class="xd-modal-acciones">' +
            '<button class="xd-boton xd-boton-fantasma" id="modal-cancelar">Cancelar</button>' +
            '<button class="xd-boton ' + claseBtnConfirmar + '" id="modal-aceptar">' + textoConfirmar + '</button>' +
            '</div>' +
            '</div>' +
            '</div>';

        $('body').append(htmlModal);

        $('#modal-aceptar').on('click', function () {
            $('#modal-confirmar').remove();
            resolver(true);
        });

        $('#modal-cancelar, #modal-confirmar').on('click', function (e) {
            if (e.target === this) {
                $('#modal-confirmar').remove();
                resolver(false);
            }
        });

        // Cerrar con Escape
        $(document).on('keydown.modal', function (e) {
            if (e.key === 'Escape') {
                $('#modal-confirmar').remove();
                $(document).off('keydown.modal');
                resolver(false);
            }
        });
    });
};
