/**
 * AUTENTICACION.JS — Servicio AJAX
 * Funciones para login, registro y cerrar sesión
 */

var ServicioAutenticacion = {};

/**
 * Iniciar sesión
 * @param {string} correo
 * @param {string} contrasena
 * @returns {Promise<RespuestaExito|RespuestaError>}
 */
ServicioAutenticacion.login = function (correo, contrasena) {
    var loginDatos = new window.LoginDTO(correo, contrasena);
    var peticion = new window.PeticionAJAX('/autenticacion/iniciar_sesion.php', 'POST').setDatos(loginDatos);
    
    return XD.peticion(peticion);
};

/**
 * Registrar nuevo usuario
 * @param {string} nombreUsuario
 * @param {string} correo
 * @param {string} contrasena
 * @returns {Promise<RespuestaExito|RespuestaError>}
 */
ServicioAutenticacion.registro = function (nombreUsuario, correo, contrasena) {
    var registroDatos = new window.RegistroDTO(nombreUsuario, correo, contrasena);
    var peticion = new window.PeticionAJAX('/autenticacion/registro.php', 'POST').setDatos(registroDatos);
    
    return XD.peticion(peticion);
};

/**
 * Cerrar sesión
 * @returns {Promise<RespuestaExito|RespuestaError>}
 */
ServicioAutenticacion.cerrarSesion = function () {
    var peticion = new window.PeticionAJAX('/autenticacion/cerrar_sesion.php', 'POST');
    return XD.peticion(peticion);
};
