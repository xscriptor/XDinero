/**
 * PERFIL.JS — Servicio AJAX
 * Funciones para perfil de usuario, seguir/dejar de seguir
 */

var ServicioPerfil = {};

/**
 * Obtener perfil por ID
 * @param {number} id
 * @returns {Promise<RespuestaExito|RespuestaError>}
 */
ServicioPerfil.obtenerPorId = function (id) {
    var peticion = new window.PeticionAJAX('/usuarios/perfil.php?id=' + id, 'GET');
    return XD.peticion(peticion);
};

/**
 * Actualizar perfil (con FormData para imágenes)
 * @param {FormData} formData
 * @returns {Promise<RespuestaExito|RespuestaError>}
 */
ServicioPerfil.actualizar = function (formData) {
    var peticion = new window.PeticionAJAX('/usuarios/actualizar_perfil.php', 'POST')
        .setDatos(formData)
        .setOpciones({
            processData: false,
            contentType: false
        });
        
    return XD.peticion(peticion);
};

/**
 * Seguir o dejar de seguir a un usuario
 * @param {number} idUsuario
 * @param {string} accion - 'seguir' o 'dejar'
 * @returns {Promise<RespuestaExito|RespuestaError>}
 */
ServicioPerfil.seguir = function (idUsuario, accion) {
    var peticion = new window.PeticionAJAX('/usuarios/seguir.php', 'POST')
        .setDatos({ id_usuario: idUsuario, accion: accion });
        
    return XD.peticion(peticion);
};

/**
 * Obtener seguidores o seguidos de un usuario
 * @param {number} idUsuario
 * @param {string} tipo - 'seguidores' o 'seguidos'
 * @returns {Promise<RespuestaExito|RespuestaError>}
 */
ServicioPerfil.obtenerSeguidores = function (idUsuario, tipo) {
    var peticion = new window.PeticionAJAX('/usuarios/seguidores.php?id=' + idUsuario + '&tipo=' + tipo, 'GET');
    return XD.peticion(peticion);
};

// 
// Lista de Seguimiento (Watchlist)
// 

/**
 * Obtener la lista de seguimiento de un usuario
 * @param {number} idUsuario
 * @returns {Promise<RespuestaExito|RespuestaError>}
 */
ServicioPerfil.obtenerListaSeguimiento = function (idUsuario) {
    var peticion = new window.PeticionAJAX('/usuarios/lista_seguimiento.php?id=' + idUsuario, 'GET');
    return XD.peticion(peticion);
};

/**
 * Alternar (añadir/quitar) un símbolo en la lista de seguimiento
 * @param {string} simbolo - ID de la criptomoneda (ej: 'bitcoin')
 * @returns {Promise<RespuestaExito|RespuestaError>}
 */
ServicioPerfil.alternarListaSeguimiento = function (simbolo) {
    var dto = new window.ListaSeguimientoDTO(simbolo);
    var peticion = new window.PeticionAJAX('/usuarios/lista_seguimiento.php', 'POST').setDatos(dto);
    return XD.peticion(peticion);
};
