/**
 * APLICACION.JS — XDinero
 * Inicialización global: tema, autenticación, navbar
 * Se carga en TODAS las páginas
 */

var Aplicacion = {};

// Estado global del usuario (null si no autenticado)
Aplicacion.usuario = null;

/**
 * Inicializa la aplicación
 * Se llama en document.ready de cada página
 */
Aplicacion.inicializar = function () {
    Aplicacion.inicializarTema();
    Aplicacion.verificarAutenticacion();
    Aplicacion.inicializarMenuMovil();
};

/* 
   GESTIÓN DE TEMA CLARO/OSCURO
    */

Aplicacion.inicializarTema = function () {
    // Leer tema guardado o usar preferencia del sistema
    var temaGuardado = localStorage.getItem('xd-tema');

    if (temaGuardado) {
        document.documentElement.setAttribute('data-theme', temaGuardado);
    } else {
        // Detectar preferencia del sistema
        var prefiereDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', prefiereDark ? 'dark' : 'light');
    }

    // Actualizar icono del botón
    Aplicacion.actualizarIconoTema();

    // Listener para los botones de tema (desktop y mobile)
    $(document).on('click', '#boton-tema, #boton-tema-movil', function () {
        Aplicacion.alternarTema();
    });
};

Aplicacion.alternarTema = function () {
    var temaActual = document.documentElement.getAttribute('data-theme');
    var nuevoTema = temaActual === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', nuevoTema);
    localStorage.setItem('xd-tema', nuevoTema);
    Aplicacion.actualizarIconoTema();
};

Aplicacion.actualizarIconoTema = function () {
    var esDark = document.documentElement.getAttribute('data-theme') === 'dark';
    var titulo = esDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';

    $('#boton-tema, #boton-tema-movil').attr('title', titulo);
};

/* 
   VERIFICACIÓN DE AUTENTICACIÓN
    */

Aplicacion.verificarAutenticacion = function () {
    // Intentar obtener usuario de sessionStorage como caché rápida
    var usuarioCache = sessionStorage.getItem('xd-usuario');
    if (usuarioCache) {
        try {
            Aplicacion.usuario = JSON.parse(usuarioCache);
            Aplicacion.actualizarNavbar();
        } catch (e) {
            sessionStorage.removeItem('xd-usuario');
        }
    }

    // Verificar con el backend (siempre, por si la sesión expiró)
    XD.peticion('/autenticacion/perfil.php', 'GET')
        .then(function (respuesta) {
            if (respuesta.exito && respuesta.usuario) {
                Aplicacion.usuario = respuesta.usuario;
                sessionStorage.setItem('xd-usuario', JSON.stringify(respuesta.usuario));
            } else {
                Aplicacion.usuario = null;
                sessionStorage.removeItem('xd-usuario');
            }
            Aplicacion.actualizarNavbar();

            // Disparar evento para que las páginas reaccionen
            $(document).trigger('xd:autenticacion', [Aplicacion.usuario]);
        })
        .catch(function () {
            Aplicacion.usuario = null;
            sessionStorage.removeItem('xd-usuario');
            Aplicacion.actualizarNavbar();
            $(document).trigger('xd:autenticacion', [null]);
        });
};

/**
 * Cierra la sesión del usuario
 */
Aplicacion.cerrarSesion = function () {
    XD.peticion('/autenticacion/cerrar_sesion.php', 'POST')
        .finally(function () {
            Aplicacion.usuario = null;
            sessionStorage.removeItem('xd-usuario');
            XD.mostrarToast('Sesión cerrada correctamente', 'success');
            window.location.href = 'iniciar-sesion.html';
        });
};

/**
 * Guarda la sesión del usuario después de login
 * @param {Object} usuario - Datos del usuario
 */
Aplicacion.guardarSesion = function (usuario) {
    Aplicacion.usuario = usuario;
    sessionStorage.setItem('xd-usuario', JSON.stringify(usuario));
    Aplicacion.actualizarNavbar();
};

/**
 * Protege una página — redirige si no está autenticado
 * @param {boolean} soloAdmin - Si true, requiere rol admin
 */
Aplicacion.protegerPagina = function (soloAdmin) {
    $(document).on('xd:autenticacion', function (e, usuario) {
        if (!usuario) {
            window.location.href = 'iniciar-sesion.html';
            return;
        }
        if (soloAdmin && usuario.rol !== 'admin') {
            window.location.href = 'index.html';
            return;
        }
    });
};

/* 
   NAVBAR DINÁMICA
    */

Aplicacion.actualizarNavbar = function () {
    var usuario = Aplicacion.usuario;
    var $accionesNav = $('#nav-acciones');
    var $accionesMovil = $('#menu-movil-acciones');

    if (!$accionesNav.length) return;

    if (usuario) {
        // Construir URL del avatar
        var avatarUrl = 'img/default-avatar.svg';
        if (usuario.avatar) {
            if (usuario.avatar.startsWith('http')) {
                avatarUrl = usuario.avatar;
            } else {
                avatarUrl = XDConfig.urlBase + '/' + usuario.avatar;
            }
        }

        // Desktop: info usuario + cerrar sesión
        $accionesNav.html(
            '<a href="perfil.html?id=' + usuario.id + '" class="xd-nav-usuario" title="Mi perfil">' +
            '<img src="' + avatarUrl + '" alt="' + usuario.nombre_usuario + '" class="xd-avatar xd-avatar-pequeno">' +
            '<span class="xd-nav-usuario-nombre">Perfil</span>' +
            '</a>' +
            '<button class="xd-boton xd-boton-fantasma xd-texto-pequeno" id="boton-cerrar-sesion" title="Cerrar sesión">' +
                '<img src="img/salir.svg" alt="Salir" style="width:18px;height:18px;">' +
            '</button>'
        );

        // Mobile: enlaces adicionales de usuario
        if ($accionesMovil.length) {
            var enPaginaAdmin = window.location.pathname.indexOf('admin.html') !== -1;
            $accionesMovil.html(
                '<div class="xd-separador-menu"></div>' +
                '<a href="perfil.html?id=' + usuario.id + '" class="xd-nav-enlace">' +
                '<img src="img/usuario.svg" alt="Perfil">' +
                '<span>Mi Perfil</span>' +
                '</a>' +
                (usuario.rol === 'admin' && !enPaginaAdmin ?
                    '<a href="admin.html" class="xd-nav-enlace">' +
                    '<img src="img/ajustes.svg" alt="Admin">' +
                    '<span>Admin</span>' +
                    '</a>' : '') +
                '<button class="xd-nav-enlace" id="boton-cerrar-sesion-movil">' +
                '<img src="img/salir.svg" alt="Salir">' +
                '<span>Cerrar Sesión</span>' +
                '</button>'
            );
        }

        // Mostrar enlace admin en desktop si es admin
        if (usuario.rol === 'admin') {
            $('#enlace-admin').removeClass('xd-oculto');
        }
    } else {
        // No autenticado: botones de login/registro
        $accionesNav.html(
            '<a href="iniciar-sesion.html" class="xd-boton xd-boton-fantasma xd-texto-pequeno">Iniciar Sesión</a>' +
            '<a href="registro.html" class="xd-boton xd-boton-primario xd-texto-pequeno">Registrarse</a>'
        );

        if ($accionesMovil.length) {
            $accionesMovil.html(
                '<div class="xd-separador-menu"></div>' +
                '<a href="iniciar-sesion.html" class="xd-nav-enlace">' +
                '<img src="img/usuario.svg" alt="Login">' +
                '<span>Iniciar Sesión</span>' +
                '</a>' +
                '<a href="registro.html" class="xd-nav-enlace">' +
                '<img src="img/usuario.svg" alt="Registro">' +
                '<span>Registrarse</span>' +
                '</a>'
            );
        }
    }

    // Marcar enlace activo
    Aplicacion.marcarEnlaceActivo();
};

/**
 * Marca el enlace de navegación activo según la URL actual
 */
Aplicacion.marcarEnlaceActivo = function () {
    var rutaActual = window.location.pathname.split('/').pop() || 'index.html';

    $('.xd-nav-enlace').removeClass('activo');

    $('.xd-nav-enlace').each(function () {
        var href = $(this).attr('href');
        if (href && href.split('?')[0] === rutaActual) {
            $(this).addClass('activo');
        }
        // Caso especial: index.html también es la raíz
        if (rutaActual === '' && href === 'index.html') {
            $(this).addClass('activo');
        }
    });
};

/* 
   MENÚ MOBILE
    */

Aplicacion.inicializarMenuMovil = function () {
    $(document).on('click', '#boton-menu', function () {
        $('#menu-movil').toggleClass('abierto');
    });

    // Cerrar menú al hacer click en un enlace
    $(document).on('click', '.xd-menu-movil .xd-nav-enlace', function () {
        $('#menu-movil').removeClass('abierto');
    });

    // Cerrar con Escape
    $(document).on('keydown', function (e) {
        if (e.key === 'Escape') {
            $('#menu-movil').removeClass('abierto');
        }
    });

    // Botones de cerrar sesión
    $(document).on('click', '#boton-cerrar-sesion, #boton-cerrar-sesion-movil', function () {
        Aplicacion.cerrarSesion();
    });
};

/**
 * Formatea una fecha para mostrar
 * @param {string} fechaString - Fecha en formato ISO o MySQL
 * @returns {string} Fecha formateada
 */
Aplicacion.formatearFecha = function (fechaString) {
    var fecha = new Date(fechaString);
    var ahora = new Date();
    var diferencia = ahora - fecha;

    var segundos = Math.floor(diferencia / 1000);
    var minutos = Math.floor(segundos / 60);
    var horas = Math.floor(minutos / 60);
    var dias = Math.floor(horas / 24);

    if (segundos < 60) return 'Ahora mismo';
    if (minutos < 60) return minutos + ' min';
    if (horas < 24) return horas + 'h';
    if (dias < 7) return dias + 'd';

    return fecha.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: fecha.getFullYear() !== ahora.getFullYear() ? 'numeric' : undefined
    });
};

/**
 * Genera la URL del avatar de un usuario
 * @param {Object} usuario - Objeto con propiedad avatar
 * @returns {string} URL del avatar
 */
Aplicacion.obtenerAvatar = function (usuario) {
    if (!usuario || !usuario.avatar) {
        return 'img/default-avatar.svg';
    }
    if (usuario.avatar.startsWith('http')) {
        return usuario.avatar;
    }
    return XDConfig.urlBase + '/' + usuario.avatar;
};

/* 
   INICIALIZACIÓN AL CARGAR
    */
$(document).ready(function () {
    Aplicacion.inicializar();
});
