/**
 * AUTENTICACION.JS — Lógica de las páginas de login y registro
 * Se carga en iniciar-sesion.html y registro.html
 */

$(document).ready(function () {

    /* 
       LOGIN
        */
    $('#formulario-login').on('submit', function (e) {
        e.preventDefault();
        Validaciones.limpiarTodo($(this));

        var $correo = $('#correo');
        var $contrasena = $('#contrasena');
        var correo = $correo.val().trim();
        var contrasena = $contrasena.val();
        var esValido = true;

        // Validar correo
        if (!correo) {
            Validaciones.mostrarError($correo, Validaciones.MENSAJES.CAMPO_REQUERIDO);
            esValido = false;
        } else if (!Validaciones.validarCorreo(correo)) {
            Validaciones.mostrarError($correo, Validaciones.MENSAJES.CORREO_INVALIDO);
            esValido = false;
        }

        // Validar contraseña
        if (!contrasena) {
            Validaciones.mostrarError($contrasena, Validaciones.MENSAJES.CAMPO_REQUERIDO);
            esValido = false;
        }

        if (!esValido) return;

        var $boton = $('#boton-login');
        $boton.prop('disabled', true).text('Entrando...');

        ServicioAutenticacion.login(correo, contrasena)
            .then(function (respuesta) {
                if (respuesta.exito) {
                    Aplicacion.guardarSesion(respuesta.usuario);
                    XD.mostrarToast('Inicio de sesión exitoso', 'success');

                    // Redirigir según rol
                    if (respuesta.usuario.rol === 'admin') {
                        window.location.href = 'admin.html';
                    } else {
                        window.location.href = 'inicio.html';
                    }
                } else {
                    var msg = respuesta.mensaje || 'Error al iniciar sesión';
                    Validaciones.mostrarErrorGeneral($('#formulario-login'), msg);
                    XD.mostrarToast(msg, 'error');
                }
            })
            .catch(function (error) {
                var msg = error.error || 'Error de conexión con el servidor';
                Validaciones.mostrarErrorGeneral($('#formulario-login'), msg);
                XD.mostrarToast(msg, 'error');
            })
            .finally(function () {
                $boton.prop('disabled', false).text('Entrar');
            });
    });

    // Validación en tiempo real del correo (login)
    $('#formulario-login #correo').on('blur', function () {
        var valor = $(this).val().trim();
        if (valor && !Validaciones.validarCorreo(valor)) {
            Validaciones.mostrarError($(this), Validaciones.MENSAJES.CORREO_INVALIDO);
        } else {
            Validaciones.limpiarError($(this));
        }
    });

    /* 
       REGISTRO
        */
    $('#formulario-registro').on('submit', function (e) {
        e.preventDefault();
        Validaciones.limpiarTodo($(this));

        var $nombre = $('#nombre-usuario');
        var $correo = $('#correo');
        var $contrasena = $('#contrasena');
        var nombre = $nombre.val().trim();
        var correo = $correo.val().trim();
        var contrasena = $contrasena.val();
        var esValido = true;

        // Validar nombre
        if (!nombre) {
            Validaciones.mostrarError($nombre, Validaciones.MENSAJES.CAMPO_REQUERIDO);
            esValido = false;
        }

        // Validar correo
        if (!correo) {
            Validaciones.mostrarError($correo, Validaciones.MENSAJES.CAMPO_REQUERIDO);
            esValido = false;
        } else if (!Validaciones.validarCorreo(correo)) {
            Validaciones.mostrarError($correo, Validaciones.MENSAJES.CORREO_INVALIDO);
            esValido = false;
        }

        // Validar contraseña
        if (!contrasena) {
            Validaciones.mostrarError($contrasena, Validaciones.MENSAJES.CAMPO_REQUERIDO);
            esValido = false;
        } else if (!Validaciones.validarPassword(contrasena)) {
            Validaciones.mostrarError($contrasena, Validaciones.MENSAJES.PASSWORD_DEBIL);
            esValido = false;
        }

        if (!esValido) return;

        var $boton = $('#boton-registro');
        $boton.prop('disabled', true).text('Registrando...');

        ServicioAutenticacion.registro(nombre, correo, contrasena)
            .then(function (respuesta) {
                if (respuesta.exito) {
                    XD.mostrarToast('Registro exitoso. Inicia sesión.', 'success');
                    window.location.href = 'iniciar-sesion.html';
                } else {
                    var msg = respuesta.mensaje || 'Error al registrarse';
                    Validaciones.mostrarErrorGeneral($('#formulario-registro'), msg);
                    XD.mostrarToast(msg, 'error');
                }
            })
            .catch(function (error) {
                var msg = error.error || 'Error al registrarse';
                Validaciones.mostrarErrorGeneral($('#formulario-registro'), msg);
                XD.mostrarToast(msg, 'error');
            })
            .finally(function () {
                $boton.prop('disabled', false).text('Registrarse');
            });
    });

    // Validaciones en tiempo real (registro)
    $('#formulario-registro #correo').on('blur', function () {
        var valor = $(this).val().trim();
        if (valor && !Validaciones.validarCorreo(valor)) {
            Validaciones.mostrarError($(this), Validaciones.MENSAJES.CORREO_INVALIDO);
        } else {
            Validaciones.limpiarError($(this));
        }
    });

    $('#formulario-registro #contrasena').on('blur', function () {
        var valor = $(this).val();
        if (valor && !Validaciones.validarPassword(valor)) {
            Validaciones.mostrarError($(this), Validaciones.MENSAJES.PASSWORD_DEBIL);
        } else {
            Validaciones.limpiarError($(this));
        }
    });
});
