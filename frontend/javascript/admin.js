/**
 * ADMIN.JS — XDinero
 * Lógica del panel de administración
 * Requiere rol 'admin'. Dashboard + CRUD usuarios + gestión publicaciones
 */

var Admin = {
    estado: {
        paginaUsuarios: 1,
        paginaPublicaciones: 1,
        limite: 10,
        editandoId: null,
        filtroUsuarios: '',
        filtroPublicaciones: '',
        timerFiltroUsuarios: null,
        timerFiltroPublicaciones: null
    }
};

/**
 * Inicializar panel admin
 */
Admin.inicializar = function () {
    // Proteger página: solo admin
    Aplicacion.protegerPagina(true);

    $(document).on('xd:autenticacion', function (e, usuario) {
        if (usuario && usuario.rol === 'admin') {
            Admin.cargarDashboard();
        }
    });

    // Fallback: si el evento ya se disparó antes de cargar este script
    if (Aplicacion.usuario && Aplicacion.usuario.rol === 'admin') {
        Admin.cargarDashboard();
    }

    Admin.vincularEventos();
};

/**
 * Cargar el dashboard completo
 */
Admin.cargarDashboard = function () {
    ServicioAdmin.obtenerEstadisticas()
        .then(function (res) {
            $('#admin-cargando').addClass('xd-oculto');
            $('#admin-dashboard').removeClass('xd-oculto');

            if (res && res.exito) {
                Admin.pintarEstadisticas(res);
                Admin.pintarGrafico(res.actividad_semanal || []);
                Admin.pintarRankingUsuarios(res.top_usuarios || []);
                Admin.pintarRankingPublicaciones(res.top_publicaciones || []);
            }
        })
        .catch(function () {
            $('#admin-cargando').addClass('xd-oculto');
            XD.mostrarToast('Error al cargar estadísticas', 'error');
        });

    Admin.cargarUsuarios();
    Admin.cargarPublicaciones();
};

/**
 * Pintar tarjetas de estadísticas
 */
Admin.pintarEstadisticas = function (datos) {
    $('#stat-total-usuarios').text(datos.total_usuarios || 0);
    $('#stat-total-publicaciones').text(datos.total_publicaciones || 0);
    $('#stat-total-comentarios').text(datos.total_comentarios || 0);
    $('#stat-total-likes').text(datos.total_likes || 0);
    $('#stat-nuevos-hoy').text(datos.nuevos_hoy || 0);
};

/**
 * Pintar gráfico SVG de actividad semanal
 */
Admin.pintarGrafico = function (datos) {
    var svg = document.getElementById('grafico-actividad');
    if (!svg || !datos.length) return;

    svg.innerHTML = '';

    var ancho = 700;
    var alto = 250;
    var margen = { arriba: 20, derecha: 20, abajo: 40, izquierda: 10 };
    var anchoUtil = ancho - margen.izquierda - margen.derecha;
    var altoUtil = alto - margen.arriba - margen.abajo;

    var maxValor = 1;
    datos.forEach(function (d) {
        var m = Math.max(d.usuarios || 0, d.publicaciones || 0);
        if (m > maxValor) maxValor = m;
    });

    var anchoBarra = anchoUtil / datos.length / 3;
    var espacio = anchoUtil / datos.length;

    datos.forEach(function (d, i) {
        var x = margen.izquierda + i * espacio + espacio / 2;
        var alturaUsuarios = ((d.usuarios || 0) / maxValor) * altoUtil;
        var alturaPublicaciones = ((d.publicaciones || 0) / maxValor) * altoUtil;

        // Barra usuarios
        var rectU = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rectU.setAttribute('x', x - anchoBarra - 2);
        rectU.setAttribute('y', margen.arriba + altoUtil - alturaUsuarios);
        rectU.setAttribute('width', anchoBarra);
        rectU.setAttribute('height', alturaUsuarios);
        rectU.setAttribute('fill', 'var(--color-primario)');
        rectU.setAttribute('rx', '3');
        svg.appendChild(rectU);

        // Barra publicaciones
        var rectP = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rectP.setAttribute('x', x + 2);
        rectP.setAttribute('y', margen.arriba + altoUtil - alturaPublicaciones);
        rectP.setAttribute('width', anchoBarra);
        rectP.setAttribute('height', alturaPublicaciones);
        rectP.setAttribute('fill', 'var(--color-acento)');
        rectP.setAttribute('rx', '3');
        svg.appendChild(rectP);

        // Etiqueta del día
        var texto = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        texto.setAttribute('x', x);
        texto.setAttribute('y', alto - 10);
        texto.setAttribute('text-anchor', 'middle');
        texto.setAttribute('fill', 'var(--color-texto)');
        texto.setAttribute('font-size', '12');
        texto.setAttribute('opacity', '0.6');
        texto.textContent = d.dia || '';
        svg.appendChild(texto);
    });
};

/**
 * Pintar ranking de usuarios más activos
 */
Admin.pintarRankingUsuarios = function (usuarios) {
    var $contenedor = $('#ranking-usuarios');
    $contenedor.empty();

    if (!usuarios.length) {
        $contenedor.html('<p class="xd-texto-secundario">Sin datos</p>');
        return;
    }

    usuarios.forEach(function (u, i) {
        var avatarUrl = u.avatar ? Aplicacion.obtenerAvatar(u) : 'img/usuario.svg';
        var html =
            '<div class="admin-ranking-item">' +
            '<span class="admin-ranking-posicion">#' + (i + 1) + '</span>' +
            '<img src="' + avatarUrl + '" alt="" aria-hidden="true" class="xd-avatar xd-avatar-pequeno">' +
            '<span class="admin-ranking-nombre">' + (u.nombre_usuario || 'Usuario') + '</span>' +
            '<span class="admin-ranking-valor">' + (u.total_publicaciones || 0) + ' posts</span>' +
            '</div>';
        $contenedor.append(html);
    });
};

/**
 * Pintar ranking de publicaciones más populares
 */
Admin.pintarRankingPublicaciones = function (publicaciones) {
    var $contenedor = $('#ranking-publicaciones');
    $contenedor.empty();

    if (!publicaciones.length) {
        $contenedor.html('<p class="xd-texto-secundario">Sin datos</p>');
        return;
    }

    publicaciones.forEach(function (p, i) {
        var textoCorto = (p.contenido || '').substring(0, 60);
        if ((p.contenido || '').length > 60) textoCorto += '…';
        var html =
            '<div class="admin-ranking-item">' +
            '<span class="admin-ranking-posicion">#' + (i + 1) + '</span>' +
            '<span class="admin-ranking-nombre">' + textoCorto + '</span>' +
            '<span class="admin-ranking-valor">' + (p.total_likes || 0) + ' ❤</span>' +
            '</div>';
        $contenedor.append(html);
    });
};

/* 
   CRUD USUARIOS
    */

Admin.cargarUsuarios = function () {
    ServicioAdmin.obtenerUsuarios(Admin.estado.paginaUsuarios, Admin.estado.limite, Admin.estado.filtroUsuarios)
        .then(function (res) {
            if (res && res.exito) {
                Admin.estado.paginaUsuarios = res.pagina_actual || Admin.estado.paginaUsuarios;
                Admin.pintarTablaUsuarios(res.usuarios || []);
                Admin.pintarPaginacion('#paginacion-usuarios', res.total_paginas || 1, Admin.estado.paginaUsuarios, 'usuarios');
            }
        })
        .catch(function () {
            XD.mostrarToast('Error al cargar usuarios', 'error');
        });
};

Admin.pintarTablaUsuarios = function (usuarios) {
    var $body = $('#tabla-usuarios-body');
    $body.empty();

    if (!usuarios.length) {
        $body.html('<tr><td colspan="5" class="xd-texto-centro xd-texto-secundario">No hay usuarios</td></tr>');
        return;
    }

    usuarios.forEach(function (u) {
        var fila =
            '<tr>' +
            '<td>' + u.id + '</td>' +
            '<td>' + (u.nombre_usuario || u.username || '') + '</td>' +
            '<td>' + (u.correo || u.email || '') + '</td>' +
            '<td>' +
            '<select class="xd-entrada admin-select-rol" data-id="' + u.id + '" aria-label="Cambiar rol">' +
            '<option value="usuario"' + ((u.rol || u.role) === 'usuario' ? ' selected' : '') + '>Usuario</option>' +
            '<option value="admin"' + ((u.rol || u.role) === 'admin' ? ' selected' : '') + '>Admin</option>' +
            '</select>' +
            '</td>' +
            '<td class="admin-acciones-celda">' +
            '<button class="xd-boton xd-boton-secundario xd-texto-pequeno btn-editar-usuario" data-id="' + u.id + '" data-nombre="' + (u.nombre_usuario || u.username || '') + '" data-correo="' + (u.correo || u.email || '') + '" data-rol="' + (u.rol || u.role || 'usuario') + '">Editar</button>' +
            '<button class="xd-boton xd-boton-peligro xd-texto-pequeno btn-eliminar-usuario" data-id="' + u.id + '">Eliminar</button>' +
            '</td>' +
            '</tr>';
        $body.append(fila);
    });
};

/* 
   CRUD PUBLICACIONES
    */

Admin.cargarPublicaciones = function () {
    ServicioAdmin.obtenerPublicaciones(Admin.estado.paginaPublicaciones, Admin.estado.limite, Admin.estado.filtroPublicaciones)
        .then(function (res) {
            if (res && res.exito) {
                Admin.estado.paginaPublicaciones = res.pagina_actual || Admin.estado.paginaPublicaciones;
                Admin.pintarTablaPublicaciones(res.publicaciones || []);
                Admin.pintarPaginacion('#paginacion-publicaciones', res.total_paginas || 1, Admin.estado.paginaPublicaciones, 'publicaciones');
            }
        })
        .catch(function () {
            XD.mostrarToast('Error al cargar publicaciones', 'error');
        });
};

Admin.pintarTablaPublicaciones = function (publicaciones) {
    var $body = $('#tabla-publicaciones-body');
    $body.empty();

    if (!publicaciones.length) {
        $body.html('<tr><td colspan="5" class="xd-texto-centro xd-texto-secundario">No hay publicaciones</td></tr>');
        return;
    }

    publicaciones.forEach(function (p) {
        var textoCorto = (p.contenido || p.content || '').substring(0, 80);
        if ((p.contenido || p.content || '').length > 80) textoCorto += '…';
        var fecha = p.fecha_creacion || p.created_at || '';
        var fila =
            '<tr>' +
            '<td>' + p.id + '</td>' +
            '<td>' + (p.nombre_usuario || p.username || 'Anónimo') + '</td>' +
            '<td class="admin-contenido-celda">' + textoCorto + '</td>' +
            '<td>' + fecha + '</td>' +
            '<td>' +
            '<button class="xd-boton xd-boton-peligro xd-texto-pequeno btn-eliminar-publicacion" data-id="' + p.id + '">Eliminar</button>' +
            '</td>' +
            '</tr>';
        $body.append(fila);
    });
};

/**
 * Pintar paginación
 */
Admin.pintarPaginacion = function (selector, totalPaginas, paginaActual, tipo) {
    var $contenedor = $(selector);
    $contenedor.empty();

    if (totalPaginas <= 1) return;

    var ventana = 5;
    var inicio = Math.max(1, paginaActual - Math.floor(ventana / 2));
    var fin = Math.min(totalPaginas, inicio + ventana - 1);
    inicio = Math.max(1, fin - ventana + 1);

    var etiquetaTipo = tipo === 'usuarios' ? 'usuarios' : 'publicaciones';
    $contenedor.attr('role', 'navigation');
    $contenedor.attr('aria-label', 'Paginacion de ' + etiquetaTipo);

    var anteriorDeshabilitado = paginaActual <= 1 ? ' disabled aria-disabled="true"' : '';
    var siguienteDeshabilitado = paginaActual >= totalPaginas ? ' disabled aria-disabled="true"' : '';

    $contenedor.append(
        '<button class="xd-boton xd-boton-fantasma xd-texto-pequeno btn-pagina admin-paginacion-nav" data-pagina="' + (paginaActual - 1) + '" data-tipo="' + tipo + '" aria-label="Pagina anterior"' + anteriorDeshabilitado + '>' +
        '<img src="img/flecha-izquierda-admin.svg" alt="" aria-hidden="true" class="admin-paginacion-icono">' +
        '<span class="xd-solo-lectores">Pagina anterior</span>' +
        '</button>'
    );

    for (var i = inicio; i <= fin; i++) {
        var clase = i === paginaActual ? 'xd-boton xd-boton-primario xd-texto-pequeno' : 'xd-boton xd-boton-fantasma xd-texto-pequeno';
        var actualA11y = i === paginaActual ? ' aria-current="page"' : '';
        $contenedor.append('<button class="' + clase + ' btn-pagina" data-pagina="' + i + '" data-tipo="' + tipo + '" aria-label="Ir a pagina ' + i + '"' + actualA11y + '>' + i + '</button>');
    }

    $contenedor.append(
        '<button class="xd-boton xd-boton-fantasma xd-texto-pequeno btn-pagina admin-paginacion-nav" data-pagina="' + (paginaActual + 1) + '" data-tipo="' + tipo + '" aria-label="Pagina siguiente"' + siguienteDeshabilitado + '>' +
        '<img src="img/flecha-derecha-admin.svg" alt="" aria-hidden="true" class="admin-paginacion-icono">' +
        '<span class="xd-solo-lectores">Pagina siguiente</span>' +
        '</button>'
    );

    $contenedor.append(
        '<span class="admin-paginacion-info" aria-live="polite">Pagina ' + paginaActual + ' de ' + totalPaginas + '</span>'
    );
};

/* 
   EVENTOS
    */

Admin.vincularEventos = function () {
    // Crear usuario
    $('#btn-crear-usuario').on('click', function () {
        Admin.estado.editandoId = null;
        $('#modal-usuario-titulo').text('Crear Usuario');
        $('#formulario-usuario')[0].reset();
        $('#campo-contrasena-modal').show();
        $('#modal-contrasena').attr('required', true);
        $('#modal-usuario').removeClass('xd-oculto');
    });

    // Cancelar modal
    $('#btn-cancelar-modal-usuario').on('click', function () {
        $('#modal-usuario').addClass('xd-oculto');
    });

    // Cerrar modal al hacer click fuera
    $('#modal-usuario').on('click', function (e) {
        if (e.target === this) {
            $(this).addClass('xd-oculto');
        }
    });

    // Guardar usuario (crear o editar)
    $('#formulario-usuario').on('submit', function (e) {
        e.preventDefault();
        Validaciones.limpiarTodo($(this));

        var nombre = $('#modal-nombre').val().trim();
        var correo = $('#modal-correo').val().trim();
        var contrasena = $('#modal-contrasena').val();
        var rol = $('#modal-rol').val();
        var esValido = true;

        if (!nombre) {
            Validaciones.mostrarError($('#modal-nombre'), Validaciones.MENSAJES.CAMPO_REQUERIDO);
            esValido = false;
        }
        if (!correo || !Validaciones.validarCorreo(correo)) {
            Validaciones.mostrarError($('#modal-correo'), Validaciones.MENSAJES.CORREO_INVALIDO);
            esValido = false;
        }
        if (!Admin.estado.editandoId && !contrasena) {
            Validaciones.mostrarError($('#modal-contrasena'), Validaciones.MENSAJES.CAMPO_REQUERIDO);
            esValido = false;
        }

        if (!esValido) return;

        var $btn = $('#btn-guardar-usuario');
        $btn.prop('disabled', true).text('Guardando...');

        var datos = { nombre_usuario: nombre, correo: correo, rol: rol };
        if (contrasena) datos.contrasena = contrasena;

        var promesa;
        if (Admin.estado.editandoId) {
            datos.id = Admin.estado.editandoId;
            promesa = ServicioAdmin.editarUsuario(datos);
        } else {
            promesa = ServicioAdmin.crearUsuario(datos);
        }

        promesa
            .then(function (res) {
                if (res && res.exito) {
                    $('#modal-usuario').addClass('xd-oculto');
                    XD.mostrarToast(Admin.estado.editandoId ? 'Usuario editado' : 'Usuario creado', 'user-add');
                    Admin.cargarUsuarios();
                } else {
                    XD.mostrarToast(res.mensaje || res.error || 'Error', 'error');
                }
            })
            .catch(function (err) {
                XD.mostrarToast(err.error || 'Error de conexión', 'error');
            })
            .finally(function () {
                $btn.prop('disabled', false).text('Guardar');
            });
    });

    // Editar usuario (delegación)
    $(document).on('click', '.btn-editar-usuario', function () {
        var id = $(this).data('id');
        var nombre = $(this).data('nombre');
        var correo = $(this).data('correo');
        var rol = $(this).data('rol');

        Admin.estado.editandoId = id;
        $('#modal-usuario-titulo').text('Editar Usuario');
        $('#modal-nombre').val(nombre);
        $('#modal-correo').val(correo);
        $('#modal-contrasena').val('').removeAttr('required');
        $('#campo-contrasena-modal label').text('Nueva contraseña (dejar vacío para no cambiar)');
        $('#modal-rol').val(rol);
        $('#modal-usuario').removeClass('xd-oculto');
    });

    // Eliminar usuario (delegación)
    $(document).on('click', '.btn-eliminar-usuario', function () {
        var id = $(this).data('id');
        XD.confirmar('¿Eliminar usuario?', 'Esta acción no se puede deshacer.', 'Eliminar', 'xd-boton-peligro')
            .then(function (confirma) {
                if (!confirma) return;
                ServicioAdmin.eliminarUsuario(id)
                    .then(function (res) {
                        if (res && res.exito) {
                            XD.mostrarToast('Usuario eliminado', 'user-delete');
                            Admin.cargarUsuarios();
                        } else {
                            XD.mostrarToast(res.mensaje || 'Error', 'error');
                        }
                    })
                    .catch(function () { XD.mostrarToast('Error de conexión', 'error'); });
            });
    });

    // Cambiar rol
    $(document).on('change', '.admin-select-rol', function () {
        var id = $(this).data('id');
        var nuevoRol = $(this).val();
        ServicioAdmin.actualizarRol(id, nuevoRol)
            .then(function (res) {
                if (res && res.exito) {
                    XD.mostrarToast('Rol actualizado', 'role-change');
                } else {
                    XD.mostrarToast(res.mensaje || 'Error', 'error');
                }
            })
            .catch(function () { XD.mostrarToast('Error de conexión', 'error'); });
    });

    // Eliminar publicación (delegación)
    $(document).on('click', '.btn-eliminar-publicacion', function () {
        var id = $(this).data('id');
        XD.confirmar('¿Eliminar publicación?', 'La publicación será eliminada permanentemente.', 'Eliminar', 'xd-boton-peligro')
            .then(function (confirma) {
                if (!confirma) return;
                ServicioAdmin.eliminarPublicacion(id)
                    .then(function (res) {
                        if (res && res.exito) {
                            XD.mostrarToast('Publicación eliminada', 'info');
                            Admin.cargarPublicaciones();
                        } else {
                            XD.mostrarToast(res.mensaje || 'Error', 'error');
                        }
                    })
                    .catch(function () { XD.mostrarToast('Error de conexión', 'error'); });
            });
    });

    // Paginación (delegación)
    $(document).on('click', '.btn-pagina', function () {
        if ($(this).is(':disabled')) return;

        var pagina = parseInt($(this).data('pagina'));
        var tipo = $(this).data('tipo');
        if (isNaN(pagina) || pagina < 1) return;

        if (tipo === 'usuarios') {
            Admin.estado.paginaUsuarios = pagina;
            Admin.cargarUsuarios();
        } else {
            Admin.estado.paginaPublicaciones = pagina;
            Admin.cargarPublicaciones();
        }
    });

    // Filtro de usuarios (debounce)
    $('#filtro-usuarios').on('input', function () {
        var valor = $(this).val().trim();
        Admin.estado.filtroUsuarios = valor;
        Admin.estado.paginaUsuarios = 1;

        if (Admin.estado.timerFiltroUsuarios) {
            clearTimeout(Admin.estado.timerFiltroUsuarios);
        }

        Admin.estado.timerFiltroUsuarios = setTimeout(function () {
            Admin.cargarUsuarios();
        }, 250);
    });

    // Filtro de publicaciones (debounce)
    $('#filtro-publicaciones').on('input', function () {
        var valor = $(this).val().trim();
        Admin.estado.filtroPublicaciones = valor;
        Admin.estado.paginaPublicaciones = 1;

        if (Admin.estado.timerFiltroPublicaciones) {
            clearTimeout(Admin.estado.timerFiltroPublicaciones);
        }

        Admin.estado.timerFiltroPublicaciones = setTimeout(function () {
            Admin.cargarPublicaciones();
        }, 250);
    });
};

/* 
   INICIALIZACIÓN
    */
$(document).ready(function () {
    Admin.inicializar();
});
