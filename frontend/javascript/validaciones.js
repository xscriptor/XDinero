/**
 * VALIDACIONES.JS — XDinero
 * Validadores de formularios y mensajes de error
 */

var Validaciones = {};

// Expresiones regulares
Validaciones.REGEX_CORREO = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
Validaciones.REGEX_PASSWORD = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

// Mensajes de error predefinidos
Validaciones.MENSAJES = {
    CORREO_INVALIDO: 'El correo debe tener un formato válido (ej: usuario@dominio.com)',
    PASSWORD_DEBIL: 'La contraseña debe tener al menos 8 caracteres, incluyendo letras y números.',
    CAMPO_REQUERIDO: 'Este campo es obligatorio.',
    COINCIDENCIA_PASSWORD: 'Las contraseñas no coinciden.'
};

/**
 * Valida formato de correo electrónico
 * @param {string} correo
 * @returns {boolean}
 */
Validaciones.validarCorreo = function (correo) {
    return Validaciones.REGEX_CORREO.test(correo);
};

/**
 * Valida requisitos de contraseña
 * @param {string} password
 * @returns {boolean}
 */
Validaciones.validarPassword = function (password) {
    return Validaciones.REGEX_PASSWORD.test(password);
};

/**
 * Muestra un error de validación debajo de un campo
 * @param {jQuery} $campo - Elemento input/textarea
 * @param {string} mensaje - Mensaje de error
 */
Validaciones.mostrarError = function ($campo, mensaje) {
    // Quitar error anterior si existe
    Validaciones.limpiarError($campo);

    $campo.addClass('xd-entrada-error');

    var htmlAlerta =
        '<div class="xd-alerta xd-alerta-advertencia xd-alerta-campo">' +
        '<span>' + mensaje + '</span>' +
        '</div>';

    $campo.after(htmlAlerta);
};

/**
 * Limpia el error de validación de un campo
 * @param {jQuery} $campo - Elemento input/textarea
 */
Validaciones.limpiarError = function ($campo) {
    $campo.removeClass('xd-entrada-error');
    $campo.next('.xd-alerta-campo').remove();
};

/**
 * Limpia todos los errores de un formulario
 * @param {jQuery} $formulario - Elemento form
 */
Validaciones.limpiarTodo = function ($formulario) {
    $formulario.find('.xd-entrada-error').removeClass('xd-entrada-error');
    $formulario.find('.xd-alerta-campo').remove();
    $formulario.find('.xd-alerta-general').remove();
};

/**
 * Muestra un error general en la parte superior del formulario
 * @param {jQuery} $formulario - Elemento form
 * @param {string} mensaje - Mensaje de error
 */
Validaciones.mostrarErrorGeneral = function ($formulario, mensaje) {
    // Quitar error general anterior
    $formulario.find('.xd-alerta-general').remove();

    var htmlAlerta =
        '<div class="xd-alerta xd-alerta-error xd-alerta-general">' +
        '<img src="img/cerrar.svg" alt="Error" class="xd-icono-invertir">' +
        '<span>' + mensaje + '</span>' +
        '</div>';

    $formulario.prepend(htmlAlerta);
};
