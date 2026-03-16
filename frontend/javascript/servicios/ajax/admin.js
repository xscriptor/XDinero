/**
 * ADMIN.JS — Servicio AJAX
 * Funciones para el panel de administración
 */

var ServicioAdmin = {};

/**
 * Obtener estadísticas del dashboard
 * @returns {Promise<RespuestaExito|RespuestaError>}
 */
ServicioAdmin.obtenerEstadisticas = function () {
    var peticion = new window.PeticionAJAX('/admin/estadisticas.php', 'GET');
    return XD.peticion(peticion);
};

/**
 * Obtener lista de usuarios (paginado)
 * @param {number} pagina
 * @param {number} limite
 * @param {string} busqueda
 * @returns {Promise<RespuestaExito|RespuestaError>}
 */
ServicioAdmin.obtenerUsuarios = function (pagina, limite, busqueda) {
    var dto = new window.PaginacionDTO(pagina, limite);
    var termino = (busqueda || '').trim();
    var query = '/admin/usuarios.php?page=' + dto.page + '&limit=' + dto.limit;
    if (termino) {
        query += '&search=' + encodeURIComponent(termino);
    }
    var peticion = new window.PeticionAJAX(query, 'GET');
    return XD.peticion(peticion);
};

/**
 * Obtener publicaciones (paginado)
 * @param {number} pagina
 * @param {number} limite
 * @param {string} busqueda
 * @returns {Promise<RespuestaExito|RespuestaError>}
 */
ServicioAdmin.obtenerPublicaciones = function (pagina, limite, busqueda) {
    var dto = new window.PaginacionDTO(pagina, limite);
    var termino = (busqueda || '').trim();
    var query = '/admin/publicaciones.php?page=' + dto.page + '&limit=' + dto.limit;
    if (termino) {
        query += '&search=' + encodeURIComponent(termino);
    }
    var peticion = new window.PeticionAJAX(query, 'GET');
    return XD.peticion(peticion);
};

/**
 * Crear un usuario
 * @param {Object} datos
 * @returns {Promise<RespuestaExito|RespuestaError>}
 */
ServicioAdmin.crearUsuario = function (datos) {
    var dto = new window.CrearUsuarioDTO(datos);
    var peticion = new window.PeticionAJAX('/admin/crear_usuario.php', 'POST').setDatos(dto);
    return XD.peticion(peticion);
};

/**
 * Editar un usuario
 * @param {Object} datos
 * @returns {Promise<RespuestaExito|RespuestaError>}
 */
ServicioAdmin.editarUsuario = function (datos) {
    var dto = new window.EditarUsuarioDTO(datos);
    var peticion = new window.PeticionAJAX('/admin/editar_usuario.php', 'POST').setDatos(dto);
    return XD.peticion(peticion);
};

/**
 * Eliminar un usuario
 * @param {number} id
 * @returns {Promise<RespuestaExito|RespuestaError>}
 */
ServicioAdmin.eliminarUsuario = function (id) {
    var dto = new window.EliminarEntidadDTO(id);
    var peticion = new window.PeticionAJAX('/admin/eliminar_usuario.php', 'DELETE').setDatos(dto);
    return XD.peticion(peticion);
};

/**
 * Eliminar publicación desde admin
 * @param {number} id
 * @returns {Promise<RespuestaExito|RespuestaError>}
 */
ServicioAdmin.eliminarPublicacion = function (id) {
    var dto = new window.EliminarEntidadDTO(id);
    var peticion = new window.PeticionAJAX('/admin/eliminar_publicacion.php', 'DELETE').setDatos(dto);
    return XD.peticion(peticion);
};

/**
 * Actualizar rol de un usuario
 * @param {number} id
 * @param {string} rol
 * @returns {Promise<RespuestaExito|RespuestaError>}
 */
ServicioAdmin.actualizarRol = function (id, rol) {
    var dto = new window.ActualizarRolDTO(id, rol);
    var peticion = new window.PeticionAJAX('/admin/actualizar_rol.php', 'POST').setDatos(dto);
    return XD.peticion(peticion);
};
