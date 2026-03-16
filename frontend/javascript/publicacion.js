/**
 * PUBLICACION.JS — XDinero
 * Página de detalle de una publicación con comentarios
 */

var Publicacion = {
    estado: {
        publicacion: null,
        comentarios: [],
        idPublicacion: null
    }
};

/* 
   INICIALIZACIÓN
    */

Publicacion.inicializar = function () {
    // Obtener ID de la URL
    var params = new URLSearchParams(window.location.search);
    var id = parseInt(params.get('id'));

    if (!id || id <= 0) {
        Publicacion.mostrarError();
        return;
    }

    Publicacion.estado.idPublicacion = id;
    Publicacion.cargarDetalle();
    Publicacion.vincularEventos();

    // Cuando se confirme la autenticación, configurar la UI
    $(document).on('xd:autenticacion', function (e, usuario) {
        Publicacion.configurarSegunAutenticacion(usuario);
    });
};

/* 
   CARGA DE DATOS
    */

Publicacion.cargarDetalle = function () {
    var peticion = new PeticionAJAX('/publicaciones/detalle.php?id=' + Publicacion.estado.idPublicacion, 'GET');

    XD.peticion(peticion)
        .then(function (respuesta) {
            if (respuesta && respuesta.exito && respuesta.publicacion) {
                Publicacion.estado.publicacion = respuesta.publicacion;
                Publicacion.estado.comentarios = respuesta.comentarios || [];
                Publicacion.pintarPublicacion();
                Publicacion.pintarComentarios();

                $('#publicacion-cargando').addClass('xd-oculto');
                $('#publicacion-detalle').removeClass('xd-oculto');
            } else {
                Publicacion.mostrarError();
            }
        })
        .catch(function () {
            Publicacion.mostrarError();
        });
};

/* 
   RENDERIZADO DE LA PUBLICACIÓN
    */

Publicacion.pintarPublicacion = function () {
    var pub = Publicacion.estado.publicacion;
    if (!pub) return;

    // Título de la pestaña
    document.title = (pub.username || 'Publicación') + ' — XDinero';

    // Avatar y autor
    var avatarUrl = Aplicacion.obtenerAvatar({ avatar: pub.avatar });
    $('#publicacion-avatar').attr('src', avatarUrl);
    $('#publicacion-autor-nombre').text(pub.username || 'Usuario');
    $('#publicacion-autor-enlace').attr('href', 'perfil.html?id=' + pub.user_id);

    // Fecha
    $('#publicacion-fecha').text(Aplicacion.formatearFecha(pub.created_at));

    // Contenido
    $('#publicacion-texto').text(pub.content || '');

    // Imagen
    if (pub.image_url) {
        var urlImg = pub.image_url.startsWith('http')
            ? pub.image_url
            : XDConfig.urlBase + '/' + pub.image_url;
        $('#publicacion-imagen').attr('src', urlImg);
        $('#publicacion-imagen-contenedor').removeClass('xd-oculto');
    }

    // Contadores
    $('#contador-likes').text(pub.like_count || 0);
    $('#contador-comentarios').text(pub.comment_count || 0);
    $('#contador-reposts').text(pub.repost_count || 0);

    // Estado del like
    if (pub.is_liked && parseInt(pub.is_liked) > 0) {
        $('#btn-like').addClass('activo');
        $('#btn-like img').attr('src', 'img/me-gusta-relleno.svg');
    }
};

/* 
   RENDERIZADO DE COMENTARIOS
    */

Publicacion.pintarComentarios = function () {
    var comentarios = Publicacion.estado.comentarios;
    var $lista = $('#lista-comentarios');
    $lista.empty();

    $('#titulo-comentarios').text('Comentarios (' + comentarios.length + ')');
    $('#contador-comentarios').text(comentarios.length);

    if (comentarios.length === 0) {
        $('#sin-comentarios').removeClass('xd-oculto');
        return;
    }

    $('#sin-comentarios').addClass('xd-oculto');

    comentarios.forEach(function (com) {
        var avatarUrl = Aplicacion.obtenerAvatar({ avatar: com.avatar });
        var fechaTexto = Aplicacion.formatearFecha(com.created_at);

        var divComentario = document.createElement('div');
        divComentario.className = 'publicacion-comentario';

        divComentario.innerHTML =
            '<img src="' + avatarUrl + '" alt="' + (com.username || 'Usuario') + '" class="xd-avatar xd-avatar-pequeno">' +
            '<div class="publicacion-comentario-cuerpo">' +
            '<div class="publicacion-comentario-cabecera">' +
            '<span class="publicacion-comentario-autor">' + (com.username || 'Usuario') + '</span>' +
            '<span class="publicacion-comentario-fecha">' + fechaTexto + '</span>' +
            '</div>' +
            '<p class="publicacion-comentario-texto">' + Publicacion.escaparHtml(com.content || '') + '</p>' +
            '</div>';

        $lista.append(divComentario);
    });
};

/**
 * Escapa HTML para prevenir XSS
 */
Publicacion.escaparHtml = function (texto) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(texto));
    return div.innerHTML;
};

/* 
   CONFIGURACIÓN SEGÚN AUTENTICACIÓN
    */

Publicacion.configurarSegunAutenticacion = function (usuario) {
    if (usuario) {
        $('#caja-nuevo-comentario').removeClass('xd-oculto');
        var avatarUrl = Aplicacion.obtenerAvatar(usuario);
        $('#avatar-comentador').attr('src', avatarUrl);
    } else {
        $('#caja-nuevo-comentario').addClass('xd-oculto');
    }
};

/* 
   INTERACCIONES
    */

Publicacion.alternarLike = function () {
    if (!Aplicacion.usuario) {
        XD.mostrarToast('Debes iniciar sesión para dar me gusta', 'info');
        return;
    }

    var $btn = $('#btn-like');
    var esLike = !$btn.hasClass('activo');
    var $contador = $('#contador-likes');
    var cantidad = parseInt($contador.text()) || 0;

    // Optimistic UI
    if (esLike) {
        $btn.addClass('activo');
        $btn.find('img').attr('src', 'img/me-gusta-relleno.svg');
        $contador.text(cantidad + 1);
    } else {
        $btn.removeClass('activo');
        $btn.find('img').attr('src', 'img/me-gusta.svg');
        $contador.text(cantidad - 1);
    }

    // Llamar al backend (endpoint real: me_gusta.php con publicacion_id)
    var peticion = new PeticionAJAX('/publicaciones/me_gusta.php', 'POST')
        .setDatos({ publicacion_id: Publicacion.estado.idPublicacion });

    XD.peticion(peticion)
        .then(function (res) {
            if (res && res.exito) {
                // Actualizar con valor real del servidor
                $contador.text(res.cantidad);
                if (res.dado) {
                    $btn.addClass('activo');
                    $btn.find('img').attr('src', 'img/me-gusta-relleno.svg');
                } else {
                    $btn.removeClass('activo');
                    $btn.find('img').attr('src', 'img/me-gusta.svg');
                }
            }
        })
        .catch(function () {
            // Rollback
            if (esLike) {
                $btn.removeClass('activo');
                $btn.find('img').attr('src', 'img/me-gusta.svg');
                $contador.text(cantidad);
            } else {
                $btn.addClass('activo');
                $btn.find('img').attr('src', 'img/me-gusta-relleno.svg');
                $contador.text(cantidad);
            }
            XD.mostrarToast('Error de conexión', 'error');
        });
};

Publicacion.republicar = function () {
    if (!Aplicacion.usuario) {
        XD.mostrarToast('Debes iniciar sesión para republicar', 'info');
        return;
    }

    var $btn = $('#btn-repost');
    if ($btn.hasClass('activo')) {
        XD.mostrarToast('Ya has republicado esta publicación', 'info');
        return;
    }

    var $contador = $('#contador-reposts');
    var cantidad = parseInt($contador.text()) || 0;

    // Optimistic UI
    $btn.addClass('activo');
    $contador.text(cantidad + 1);

    var peticion = new PeticionAJAX('/publicaciones/republicar.php', 'POST')
        .setDatos({ publicacion_id: Publicacion.estado.idPublicacion });

    XD.peticion(peticion)
        .then(function (res) {
            if (res && res.exito) {
                XD.mostrarToast('¡Publicación republicada!', 'exito');
            } else {
                // Rollback
                $btn.removeClass('activo');
                $contador.text(cantidad);
                XD.mostrarToast(res && res.mensaje ? res.mensaje : 'No se pudo republicar', 'error');
            }
        })
        .catch(function () {
            $btn.removeClass('activo');
            $contador.text(cantidad);
            XD.mostrarToast('Error de conexión', 'error');
        });
};

Publicacion.compartir = function () {
    var url = window.location.href;
    if (navigator.share) {
        navigator.share({
            title: 'Mira esto en XDinero',
            url: url
        }).catch(function () {});
    } else {
        navigator.clipboard.writeText(url)
            .then(function () {
                XD.mostrarToast('Enlace copiado al portapapeles', 'exito');
            })
            .catch(function () {
                XD.mostrarToast('Error al copiar el enlace', 'error');
            });
    }
};

/* 
   NUEVO COMENTARIO
    */

Publicacion.enviarComentario = function () {
    var texto = $('#input-comentario').val().trim();
    if (!texto) return;

    if (!Aplicacion.usuario) {
        XD.mostrarToast('Debes iniciar sesión para comentar', 'info');
        return;
    }

    var $btn = $('#btn-enviar-comentario');
    $btn.prop('disabled', true).text('Enviando...');

    var peticion = new PeticionAJAX('/publicaciones/comentar.php', 'POST')
        .setDatos({
            publicacion_id: Publicacion.estado.idPublicacion,
            contenido: texto
        });

    XD.peticion(peticion)
        .then(function (res) {
            if (res && res.exito) {
                // Añadir comentario localmente para feedback instantáneo
                var nuevoComentario = {
                    id: Date.now(),
                    content: texto,
                    created_at: new Date().toISOString(),
                    username: Aplicacion.usuario.nombre_usuario,
                    avatar: Aplicacion.usuario.avatar
                };

                Publicacion.estado.comentarios.push(nuevoComentario);
                Publicacion.pintarComentarios();

                // Limpiar input
                $('#input-comentario').val('');
                $btn.prop('disabled', true);

                XD.mostrarToast('Comentario publicado', 'exito');
            } else {
                XD.mostrarToast(res && res.mensaje ? res.mensaje : 'Error al publicar comentario', 'error');
            }
        })
        .catch(function () {
            XD.mostrarToast('Error de conexión', 'error');
        })
        .finally(function () {
            $btn.prop('disabled', false).text('Enviar');
        });
};

/* 
   MOSTRAR ERROR
    */

Publicacion.mostrarError = function () {
    $('#publicacion-cargando').addClass('xd-oculto');
    $('#publicacion-detalle').addClass('xd-oculto');
    $('#publicacion-error').removeClass('xd-oculto');
};

/* 
   EVENTOS
    */

Publicacion.vincularEventos = function () {
    // Like
    $('#btn-like').on('click', function () {
        Publicacion.alternarLike();
    });

    // Comentar (se enfoca en el input)
    $('#btn-comentar').on('click', function () {
        $('#input-comentario').focus();
    });

    // Republicar
    $('#btn-repost').on('click', function () {
        Publicacion.republicar();
    });

    // Compartir
    $('#btn-compartir').on('click', function () {
        Publicacion.compartir();
    });

    // Formulario de comentario
    $('#formulario-comentario').on('submit', function (e) {
        e.preventDefault();
        Publicacion.enviarComentario();
    });

    // Habilitar/deshabilitar botón de enviar según contenido
    $('#input-comentario').on('input', function () {
        var tiene = $(this).val().trim().length > 0;
        $('#btn-enviar-comentario').prop('disabled', !tiene);
    });

    // Click en imagen para ampliar
    $('#publicacion-imagen').on('click', function () {
        window.open($(this).attr('src'), '_blank');
    });
};

/* 
   INICIALIZACIÓN AL CARGAR
    */
$(document).ready(function () {
    Publicacion.inicializar();
});
