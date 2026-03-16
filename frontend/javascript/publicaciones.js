/**
 * PUBLICACIONES.JS — XDinero
 * Página "Mis Publicaciones" — Grid con todas las publicaciones del usuario autenticado
 */

var Publicaciones = {
    estado: {
        publicaciones: [],
        desplazamiento: 0,
        limite: 12,
        tieneMas: false,
        cargando: false,
        idEliminar: null
    }
};

/* 
   INICIALIZACIÓN
    */

Publicaciones.inicializar = function () {
    Publicaciones.vincularEventos();

    $(document).on('xd:autenticacion', function (e, usuario) {
        if (usuario) {
            Publicaciones.cargar(true);
        } else {
            $('#publicaciones-cargando').addClass('xd-oculto');
            $('#banner-no-autenticado').removeClass('xd-oculto');
        }
    });
};

/* 
   CARGA DE DATOS
    */

Publicaciones.cargar = function (reiniciar) {
    if (Publicaciones.estado.cargando) return;
    Publicaciones.estado.cargando = true;

    if (reiniciar) {
        Publicaciones.estado.publicaciones = [];
        Publicaciones.estado.desplazamiento = 0;
        $('#publicaciones-grid').empty();
    }

    var parametros = '?usuario_id=' + Aplicacion.usuario.id +
        '&limite=' + Publicaciones.estado.limite +
        '&desplazamiento=' + Publicaciones.estado.desplazamiento;

    var peticion = new PeticionAJAX('/publicaciones/index.php' + parametros, 'GET');

    XD.peticion(peticion)
        .then(function (res) {
            if (res && res.exito) {
                var nuevas = res.publicaciones || [];
                Publicaciones.estado.publicaciones = Publicaciones.estado.publicaciones.concat(nuevas);
                Publicaciones.estado.tieneMas = res.tieneMas;
                Publicaciones.estado.desplazamiento += nuevas.length;

                Publicaciones.pintar(nuevas, reiniciar);
            } else {
                XD.mostrarToast('Error al cargar publicaciones', 'error');
            }
        })
        .catch(function () {
            XD.mostrarToast('Error de conexión', 'error');
        })
        .finally(function () {
            Publicaciones.estado.cargando = false;
            $('#publicaciones-cargando').addClass('xd-oculto');
        });
};

/* 
   RENDERIZADO EN GRID
    */

Publicaciones.pintar = function (nuevas, reiniciar) {
    var $grid = $('#publicaciones-grid');

    if (reiniciar) {
        $grid.empty();
    }

    var total = Publicaciones.estado.publicaciones.length;

    // Subtítulo con conteo
    $('#publicaciones-subtitulo').text(
        total === 0 ? '' : total + (total === 1 ? ' publicación' : ' publicaciones')
    );

    if (total === 0) {
        $grid.addClass('xd-oculto');
        $('#publicaciones-vacio').removeClass('xd-oculto');
        $('#contenedor-cargar-mas').addClass('xd-oculto');
        return;
    }

    $('#publicaciones-vacio').addClass('xd-oculto');
    $grid.removeClass('xd-oculto');

    nuevas.forEach(function (pub) {
        var tarjeta = Publicaciones.crearTarjeta(pub);
        $grid.append(tarjeta);
    });

    // Botón cargar más
    if (Publicaciones.estado.tieneMas) {
        $('#contenedor-cargar-mas').removeClass('xd-oculto');
    } else {
        $('#contenedor-cargar-mas').addClass('xd-oculto');
    }
};

/**
 * Crear una tarjeta de publicación para el grid
 */
Publicaciones.crearTarjeta = function (pub) {
    var tarjeta = document.createElement('article');
    tarjeta.className = 'xd-tarjeta publicaciones-tarjeta';
    tarjeta.dataset.id = pub.id;

    // Determinar si es repost
    var esRepost = pub.publicacion_original_id && parseInt(pub.publicacion_original_id) > 0;
    var contenido = esRepost ? (pub.original_content || '') : (pub.content || '');
    var imagen = esRepost ? pub.original_image : pub.image_url;

    // Fecha
    var fecha = Aplicacion.formatearFecha(pub.created_at);

    // Imagen
    var htmlImagen = '';
    if (imagen) {
        var urlImg = imagen.startsWith('http') ? imagen : XDConfig.urlBase + '/' + imagen;
        htmlImagen = '<div class="publicaciones-tarjeta-imagen">' +
            '<img src="' + urlImg + '" alt="Imagen de la publicación" loading="lazy">' +
            '</div>';
    }

    // Texto recortado
    var textoRecortado = contenido.length > 120 ? contenido.substring(0, 120) + '…' : contenido;

    // Badge de repost
    var htmlRepost = '';
    if (esRepost) {
        htmlRepost = '<div class="publicaciones-tarjeta-badge">' +
            '<img src="img/republicar.svg" alt="">' +
            '<span>Republicación</span>' +
            '</div>';
    }

    tarjeta.innerHTML =
        htmlRepost +
        htmlImagen +
        '<div class="publicaciones-tarjeta-cuerpo">' +
            '<p class="publicaciones-tarjeta-texto">' + Publicaciones.escaparHtml(textoRecortado) + '</p>' +
            '<span class="publicaciones-tarjeta-fecha">' + fecha + '</span>' +
        '</div>' +
        '<div class="publicaciones-tarjeta-pie">' +
            '<div class="publicaciones-tarjeta-stats">' +
                '<span title="Me gusta"><img src="img/me-gusta.svg" alt=""> ' + (pub.like_count || 0) + '</span>' +
                '<span title="Comentarios"><img src="img/comentario.svg" alt=""> ' + (pub.comment_count || 0) + '</span>' +
                '<span title="Republicaciones"><img src="img/republicar.svg" alt=""> ' + (pub.repost_count || 0) + '</span>' +
            '</div>' +
            '<button class="publicaciones-tarjeta-eliminar btn-eliminar" title="Eliminar publicación" aria-label="Eliminar publicación">' +
                '<img src="img/borrar.svg" alt="">' +
            '</button>' +
        '</div>';

    return tarjeta;
};

/**
 * Escapa HTML para prevenir XSS
 */
Publicaciones.escaparHtml = function (texto) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(texto));
    return div.innerHTML;
};

/* 
   ELIMINACIÓN
    */

Publicaciones.pedirEliminar = function (idPublicacion) {
    Publicaciones.estado.idEliminar = idPublicacion;
    $('#modal-eliminar').removeClass('xd-oculto');
};

Publicaciones.confirmarEliminar = function () {
    var id = Publicaciones.estado.idEliminar;
    if (!id) return;

    var peticion = new PeticionAJAX('/publicaciones/eliminar.php', 'POST')
        .setDatos({ publicacion_id: id });

    XD.peticion(peticion)
        .then(function (res) {
            if (res && res.exito) {
                // Quitar del DOM y del estado
                $('[data-id="' + id + '"]').remove();
                Publicaciones.estado.publicaciones = Publicaciones.estado.publicaciones.filter(function (p) {
                    return parseInt(p.id) !== parseInt(id);
                });

                var total = Publicaciones.estado.publicaciones.length;
                $('#publicaciones-subtitulo').text(
                    total === 0 ? '' : total + (total === 1 ? ' publicación' : ' publicaciones')
                );

                if (total === 0) {
                    $('#publicaciones-grid').addClass('xd-oculto');
                    $('#publicaciones-vacio').removeClass('xd-oculto');
                }

                XD.mostrarToast('Publicación eliminada', 'exito');
            } else {
                XD.mostrarToast(res && res.mensaje ? res.mensaje : 'Error al eliminar', 'error');
            }
        })
        .catch(function () {
            XD.mostrarToast('Error de conexión', 'error');
        })
        .finally(function () {
            Publicaciones.cerrarModal();
        });
};

Publicaciones.cerrarModal = function () {
    Publicaciones.estado.idEliminar = null;
    $('#modal-eliminar').addClass('xd-oculto');
};

/* 
   EVENTOS
    */

Publicaciones.vincularEventos = function () {
    // Cargar más
    $('#btn-cargar-mas').on('click', function () {
        Publicaciones.cargar(false);
    });

    // Click en tarjeta → ir al detalle
    $('#publicaciones-grid').on('click', '.publicaciones-tarjeta', function (e) {
        // No navegar si se hizo click en el botón eliminar
        if ($(e.target).closest('.btn-eliminar').length) return;
        var id = $(this).data('id');
        window.location.href = 'publicacion.html?id=' + id;
    });

    // Eliminar publicación
    $('#publicaciones-grid').on('click', '.btn-eliminar', function (e) {
        e.stopPropagation();
        var id = $(this).closest('.publicaciones-tarjeta').data('id');
        Publicaciones.pedirEliminar(id);
    });

    // Modal: confirmar eliminar
    $('#btn-confirmar-eliminar').on('click', function () {
        Publicaciones.confirmarEliminar();
    });

    // Modal: cancelar
    $('#btn-cancelar-eliminar, #modal-eliminar').on('click', function (e) {
        if (e.target === this) {
            Publicaciones.cerrarModal();
        }
    });

    // Cerrar modal con Escape
    $(document).on('keydown', function (e) {
        if (e.key === 'Escape' && !$('#modal-eliminar').hasClass('xd-oculto')) {
            Publicaciones.cerrarModal();
        }
    });
};

/* 
   INICIALIZACIÓN AL CARGAR
    */

$(document).ready(function () {
    Publicaciones.inicializar();
});
