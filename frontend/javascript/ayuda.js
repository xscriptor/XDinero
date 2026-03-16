/**
 * AYUDA.JS — XDinero
 * Preguntas frecuentes (acordeón) + Formulario de contacto con validación regex
 */

var Ayuda = {};

/* 
   DATOS DE PREGUNTAS FRECUENTES
    */

Ayuda.preguntas = [
    {
        id: 1,
        pregunta: "¿Cómo puedo restablecer mi contraseña?",
        respuesta: "Puedes restablecer tu contraseña yendo a la página de inicio de sesión y haciendo clic en '¿Olvidaste tu contraseña?'. Recibirás un correo electrónico con las instrucciones para crear una nueva clave de acceso segura."
    },
    {
        id: 2,
        pregunta: "¿Cómo cambio mi foto de perfil?",
        respuesta: "Ve a tu perfil haciendo clic en tu avatar en la barra de navegación, luego busca el botón de editar perfil (generalmente un ícono de lápiz o engranaje) y selecciona una nueva imagen desde tu dispositivo. Asegúrate de que la imagen sea cuadrada para obtener los mejores resultados."
    },
    {
        id: 3,
        pregunta: "¿Es XDinero gratuito?",
        respuesta: "Sí, el registro y uso básico de la plataforma es completamente gratuito. Puedes publicar, comentar y seguir a otros usuarios sin costo alguno. Algunas funciones avanzadas para comercios o verificados podrían requerir una suscripción en el futuro."
    },
    {
        id: 4,
        pregunta: "¿Cómo funcionan las notificaciones?",
        respuesta: "Recibirás notificaciones cuando alguien interactúe con tus publicaciones (me gusta, comentarios) o cuando comiencen a seguirte. Puedes ver tus notificaciones haciendo clic en el ícono de campana en la barra de navegación."
    },
    {
        id: 5,
        pregunta: "¿Puedo cambiar mi nombre de usuario?",
        respuesta: "Actualmente, el nombre de usuario se establece durante el registro y es único para cada cuenta. Si necesitas cambiarlo por razones de seguridad o marca, por favor contacta con soporte técnico utilizando el formulario al final de esta página."
    },
    {
        id: 6,
        pregunta: "¿Qué contenido está permitido en XDinero?",
        respuesta: "En XDinero fomentamos la libertad de expresión, pero no toleramos el discurso de odio, acoso, contenido ilegal o spam. Te recomendamos revisar nuestras Normas de la Comunidad para obtener una lista detallada de lo que está y no está permitido."
    },
    {
        id: 7,
        pregunta: "¿Cómo reportar un comportamiento abusivo?",
        respuesta: "Si encuentras una publicación o usuario que viola nuestras normas, puedes utilizar la opción 'Reportar' disponible en el menú de opciones (tres puntos) de cada publicación o perfil. Nuestro equipo de moderación revisará el reporte a la brevedad."
    },
    {
        id: 8,
        pregunta: "¿Cómo puedo contactar con soporte?",
        respuesta: "Si no encuentras la solución a tu problema en estas preguntas frecuentes, puedes utilizar el formulario de contacto que se encuentra al final de esta página para enviar un mensaje directo a nuestro equipo de administración."
    },
    {
        id: 9,
        pregunta: "¿Cómo elimino mi cuenta?",
        respuesta: "Para eliminar tu cuenta permanentemente, accede a la configuración de tu perfil y busca la opción 'Eliminar cuenta' en la sección de seguridad. Ten en cuenta que esta acción es irreversible y perderás todo tu contenido y seguidores."
    }
];

/* 
   INICIALIZACIÓN
    */

Ayuda.inicializar = function () {
    Ayuda.pintarPreguntas();
    Ayuda.vincularEventos();
};

/* 
   ACORDEÓN DE PREGUNTAS
    */

/**
 * Genera dinámicamente el acordeón de FAQ
 */
Ayuda.pintarPreguntas = function () {
    var $lista = $('#lista-preguntas');
    $lista.empty();

    Ayuda.preguntas.forEach(function (faq) {
        var item = document.createElement('div');
        item.className = 'ayuda-item-pregunta';

        item.innerHTML =
            '<button class="ayuda-boton-pregunta" aria-expanded="false" aria-controls="faq-respuesta-' + faq.id + '">' +
            '<span>' + faq.pregunta + '</span>' +
            '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="ayuda-icono-flecha" width="20" height="20">' +
            '<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />' +
            '</svg>' +
            '</button>' +
            '<div id="faq-respuesta-' + faq.id + '" class="ayuda-contenido-respuesta">' +
            '<div class="ayuda-respuesta">' + faq.respuesta + '</div>' +
            '</div>';

        $lista.append(item);
    });
};

/**
 * Alterna la visibilidad de una respuesta
 */
Ayuda.alternarPregunta = function ($boton) {
    var estaAbierta = $boton.attr('aria-expanded') === 'true';
    var $contenido = $boton.next('.ayuda-contenido-respuesta');
    var $flecha = $boton.find('.ayuda-icono-flecha');

    // Cerrar todas las demás
    $('.ayuda-boton-pregunta').not($boton).attr('aria-expanded', 'false');
    $('.ayuda-contenido-respuesta').not($contenido).removeClass('activo');
    $('.ayuda-icono-flecha').not($flecha).removeClass('rotado');

    // Alternar la actual
    if (estaAbierta) {
        $boton.attr('aria-expanded', 'false');
        $contenido.removeClass('activo');
        $flecha.removeClass('rotado');
    } else {
        $boton.attr('aria-expanded', 'true');
        $contenido.addClass('activo');
        $flecha.addClass('rotado');
    }
};

/* 
   FORMULARIO DE CONTACTO
    */

/**
 * Valida el formulario de contacto con expresiones regulares
 * @returns {boolean}
 */
Ayuda.validarFormulario = function () {
    var $form = $('#formulario-contacto');
    Validaciones.limpiarTodo($form);

    var valido = true;

    // Nombre: obligatorio, al menos 2 caracteres
    var nombre = $('#contacto-nombre').val().trim();
    if (!nombre) {
        Validaciones.mostrarError($('#contacto-nombre'), Validaciones.MENSAJES.CAMPO_REQUERIDO);
        valido = false;
    } else if (nombre.length < 2) {
        Validaciones.mostrarError($('#contacto-nombre'), 'El nombre debe tener al menos 2 caracteres.');
        valido = false;
    }

    // Email: obligatorio, validado con regex
    var email = $('#contacto-email').val().trim();
    if (!email) {
        Validaciones.mostrarError($('#contacto-email'), Validaciones.MENSAJES.CAMPO_REQUERIDO);
        valido = false;
    } else if (!Validaciones.validarCorreo(email)) {
        Validaciones.mostrarError($('#contacto-email'), Validaciones.MENSAJES.CORREO_INVALIDO);
        valido = false;
    }

    // Asunto: obligatorio
    var asunto = $('#contacto-asunto').val().trim();
    if (!asunto) {
        Validaciones.mostrarError($('#contacto-asunto'), Validaciones.MENSAJES.CAMPO_REQUERIDO);
        valido = false;
    }

    // Mensaje: obligatorio, al menos 10 caracteres
    var mensaje = $('#contacto-mensaje').val().trim();
    if (!mensaje) {
        Validaciones.mostrarError($('#contacto-mensaje'), Validaciones.MENSAJES.CAMPO_REQUERIDO);
        valido = false;
    } else if (mensaje.length < 10) {
        Validaciones.mostrarError($('#contacto-mensaje'), 'El mensaje debe tener al menos 10 caracteres.');
        valido = false;
    }

    return valido;
};

/**
 * Envía el formulario de contacto (simulado)
 */
Ayuda.enviarFormulario = function () {
    if (!Ayuda.validarFormulario()) return;

    var $boton = $('#btn-enviar-contacto');
    $boton.prop('disabled', true).text('Enviando...');

    // Simular envío con retardo
    setTimeout(function () {
        // Limpiar formulario
        $('#formulario-contacto')[0].reset();
        Validaciones.limpiarTodo($('#formulario-contacto'));

        // Mostrar mensaje de éxito
        $('#formulario-contacto').addClass('xd-oculto');
        $('#contacto-exito').removeClass('xd-oculto');

        $boton.prop('disabled', false).text('Enviar Mensaje');

        XD.mostrarToast('Mensaje enviado correctamente', 'exito');
    }, 1500);
};

/* 
   EVENTOS
    */

Ayuda.vincularEventos = function () {
    // Acordeón: click en pregunta
    $(document).on('click', '.ayuda-boton-pregunta', function () {
        Ayuda.alternarPregunta($(this));
    });

    // Formulario: enviar
    $('#formulario-contacto').on('submit', function (e) {
        e.preventDefault();
        Ayuda.enviarFormulario();
    });

    // Botón "Enviar otro mensaje"
    $('#btn-otro-mensaje').on('click', function () {
        $('#contacto-exito').addClass('xd-oculto');
        $('#formulario-contacto').removeClass('xd-oculto');
    });

    // Limpiar error al escribir en un campo
    $('#formulario-contacto').on('input', '.xd-input', function () {
        Validaciones.limpiarError($(this));
    });
};

/* 
   INICIALIZACIÓN AL CARGAR
    */
$(document).ready(function () {
    Ayuda.inicializar();
});
