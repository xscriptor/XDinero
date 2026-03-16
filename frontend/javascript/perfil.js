/**
 * PERFIL.JS
 * Lógica para la página de Perfil de Usuario
 */
const Perfil = {
    estado: {
        usuarioId: null,
        esMiPerfil: false,
        usuarioDatos: null,
        siguiendo: false,
        contadorSeguidores: 0,
        archivoAvatar: null,
        // Variables para el feed
        publicaciones: [],
        desplazamiento: 0,
        limite: 10,
        tieneMas: true,
        cargandoPosts: false
    },

    elementos: {
        // UI de estado global
        cargando: document.getElementById('perfil-cargando'),
        error: document.getElementById('perfil-error'),
        contenido: document.getElementById('perfil-contenido'),

        // Info de perfil
        avatar: document.getElementById('perfil-avatar-img'),
        nombre: document.getElementById('perfil-nombre-texto'),
        username: document.getElementById('perfil-username-texto'),
        bio: document.getElementById('perfil-bio-texto'),
        
        // Stats
        statPublicaciones: document.getElementById('stat-publicaciones'),
        statSeguidores: document.getElementById('stat-seguidores'),
        statSeguidos: document.getElementById('stat-seguidos'),
        statListaSeguimiento: document.getElementById('stat-lista-seguimiento'),
        
        // Acción (Seguir / Editar)
        btnAccion: document.getElementById('btn-accion-perfil'),
        
        // Modales
        modalUsuarios: document.getElementById('modal-usuarios'),
        modalUsuariosTitulo: document.getElementById('modal-usuarios-titulo'),
        listaUsuarios: document.getElementById('lista-usuarios'),
        loaderUsuarios: document.getElementById('loader-modal-usuarios'),
        emptyUsuarios: document.getElementById('empty-modal-usuarios'),
        
        modalEditar: document.getElementById('modal-editar-perfil'),

        // Modal Lista de Seguimiento
        modalSeguimiento: document.getElementById('modal-lista-seguimiento'),
        listaSeguimientoContenido: document.getElementById('lista-seguimiento-contenido'),
        loaderSeguimiento: document.getElementById('loader-modal-seguimiento'),
        emptySeguimiento: document.getElementById('empty-modal-seguimiento'),

        formEditar: document.getElementById('form-editar'),
        previewAvatarEdit: document.getElementById('preview-avatar-editar'),
        inputAvatarEdit: document.getElementById('input-avatar-editar'),
        inputNombreUsuarioEdit: document.getElementById('edit-nombre-usuario'),
        inputCorreoEdit: document.getElementById('edit-correo'),
        inputBioEdit: document.getElementById('edit-bio'),
        bioCount: document.getElementById('edit-bio-count'),
        inputNuevaContrasena: document.getElementById('edit-nueva-contrasena'),
        inputContrasenaActual: document.getElementById('edit-contrasena-actual'),
        indicadorCompresion: document.getElementById('indicador-compresion-avatar'),
        btnGuardarPerfil: document.getElementById('btn-guardar-perfil'),
        
        // Feed
        feed: document.getElementById('feed-publicaciones'),
        loaderPosts: document.getElementById('loader-posts'),
        contenedorCargarMas: document.getElementById('contenedor-cargar-mas'),
        btnCargarMasPosts: document.getElementById('btn-cargar-mas-posts'),
        templatePost: document.getElementById('template-publicacion'),
        templateUsuario: document.getElementById('template-usuario-lista')
    },

    inicializar: function() {
        const urlParams = new URLSearchParams(window.location.search);
        this.estado.usuarioId = urlParams.get('id');

        // Escuchar cuando la auth esté lista para resolver si es mi perfil o redirigir
        $(document).on('xd:autenticacion', (e, usr) => {
            if (!this.estado.usuarioId && usr) {
                // Si no hay ID en URL y estoy logueado, ver mi perfil
                this.estado.usuarioId = usr.id;
            } else if (!this.estado.usuarioId && !usr) {
                // Si no hay ID en URL y no logueado
                window.location.href = 'iniciar-sesion.html';
                return;
            }
            
            this.estado.esMiPerfil = usr && usr.id == this.estado.usuarioId;
            
            // Si ya hay ID (ya sea por URL o porque me logueé), cargamos.
            if (this.estado.usuarioId) {
                this.cargarDatosYPosts();
            }
        });

        this.vincularEventos();
    },

    vincularEventos: function() {
        // Botón acción global (Seguir / Editar Perfil)
        this.elementos.btnAccion.addEventListener('click', () => {
            if (this.estado.esMiPerfil) {
                this.abrirModalEditar();
            } else {
                this.manejarSeguir();
            }
        });

        // Modales Listas
        document.getElementById('btn-ver-seguidores').addEventListener('click', () => this.abrirModalLista('followers'));
        document.getElementById('btn-ver-seguidos').addEventListener('click', () => this.abrirModalLista('following'));
        document.getElementById('btn-cerrar-modal-usuarios').addEventListener('click', () => this.cerrarModalLista());
        
        // Modal Lista de Seguimiento
        document.getElementById('btn-ver-lista-seguimiento').addEventListener('click', () => this.abrirModalSeguimiento());
        document.getElementById('btn-cerrar-modal-seguimiento').addEventListener('click', () => this.cerrarModalSeguimiento());
        
        // Modal Edición
        document.getElementById('btn-cerrar-modal-editar').addEventListener('click', () => this.cerrarModalEditar());
        document.getElementById('btn-cancelar-editar').addEventListener('click', () => this.cerrarModalEditar());
        
        // Contador Bio
        this.elementos.inputBioEdit.addEventListener('input', (e) => {
            const texto = e.target.value;
            this.elementos.bioCount.textContent = `${texto.length}/160`;
            if(texto.length > 160) {
                this.elementos.bioCount.classList.add('xd-texto-error');
            } else {
                this.elementos.bioCount.classList.remove('xd-texto-error');
            }
        });

        // Cambio de Avatar
        this.elementos.inputAvatarEdit.addEventListener('change', async (e) => {
            const archivo = e.target.files[0];
            if (!archivo) return;

            this.elementos.indicadorCompresion.classList.remove('xd-oculto');
            this.elementos.btnGuardarPerfil.disabled = true;

            try {
                const archivoComprimido = await ProcesadorImagen.comprimir(archivo);
                this.estado.archivoAvatar = archivoComprimido;
                this.elementos.previewAvatarEdit.src = URL.createObjectURL(archivoComprimido);
            } catch (error) {
                console.error("Error al procesar imagen:", error);
                XD.mostrarToast('Error al procesar la imagen', 'error');
                this.estado.archivoAvatar = null;
                this.elementos.inputAvatarEdit.value = '';
            } finally {
                this.elementos.indicadorCompresion.classList.add('xd-oculto');
                this.elementos.btnGuardarPerfil.disabled = false;
            }
        });

        // Guardar Perfil
        this.elementos.formEditar.addEventListener('submit', (e) => {
            e.preventDefault();
            this.guardarPerfil();
        });

        // Cargar más posts
        this.elementos.btnCargarMasPosts.addEventListener('click', () => {
            this.cargarPublicaciones(false);
        });

        // Delegación de posts (como en inicio.js)
        this.elementos.feed.addEventListener('click', (e) => {
            const articulo = e.target.closest('.post-tarjeta');
            if (!articulo) return;
            const postId = articulo.dataset.id;
            
            const elementoClickeado = e.target;
            const esBotonOEnlace = elementoClickeado.closest('button') || elementoClickeado.closest('a') || elementoClickeado.tagName.toLowerCase() === 'img';
            
            if (!esBotonOEnlace) {
                window.location.href = `publicacion.html?id=${postId}`;
                return;
            }

            const btnOpciones = e.target.closest('.post-btn-opciones');
            if (btnOpciones) {
                e.stopPropagation();
                const menu = articulo.querySelector('.post-menu');
                document.querySelectorAll('.post-menu.abierto').forEach(m => {
                    if (m !== menu) m.classList.remove('abierto');
                });
                menu.classList.toggle('abierto');
                return;
            }

            const btnEliminar = e.target.closest('.btn-eliminar-post');
            if (btnEliminar) {
                this.eliminarPublicacion(postId, articulo);
                return;
            }

            const btnLike = e.target.closest('.btn-like');
            if (btnLike) this.alternarLike(postId, btnLike);
            
            const btnRepost = e.target.closest('.btn-repost');
            if (btnRepost) this.republicar(postId, btnRepost);
            
            const btnCompartir = e.target.closest('.btn-compartir');
            if (btnCompartir) ServicioInteraccion.compartir(postId);
            
            const btnComentar = e.target.closest('.btn-comentar');
            if (btnComentar) window.location.href = `publicacion.html?id=${postId}`;
            
            const imgPost = e.target.closest('.post-imagen img');
            if (imgPost && !e.target.closest('.post-autor')) {
                window.open(imgPost.src, '_blank');
            }
        });

        // Cerrar modales (exterior)
        document.querySelectorAll('.xd-capa-modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.add('xd-oculto');
                }
            });
        });
        
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.post-opciones')) {
                document.querySelectorAll('.post-menu.abierto').forEach(m => m.classList.remove('abierto'));
            }
        });
    },

    cargarDatosYPosts: async function() {
        try {
            const res = await ServicioPerfil.obtenerPorId(this.estado.usuarioId);
            
            this.elementos.cargando.classList.add('xd-oculto');
            
            if (res && res.exito && res.usuario) {
                this.estado.usuarioDatos = res.usuario;
                this.estado.siguiendo = !!res.usuario.is_following;
                this.estado.contadorSeguidores = res.usuario.seguidores_count || 0;
                
                this.pintarCabeceraPerfil();
                this.elementos.contenido.classList.remove('xd-oculto');
                
                // Luego cargar los posts
                this.cargarPublicaciones(true);
            } else {
                this.elementos.error.classList.remove('xd-oculto');
            }
        } catch (error) {
            console.error(error);
            this.elementos.cargando.classList.add('xd-oculto');
            this.elementos.error.classList.remove('xd-oculto');
        }
    },

    pintarCabeceraPerfil: function() {
        const usr = this.estado.usuarioDatos;
        
        this.elementos.avatar.src = Aplicacion.obtenerAvatar(usr);
        this.elementos.nombre.textContent = usr.nombre_usuario;
        this.elementos.username.textContent = `@${usr.nombre_usuario}`;
        
        if (usr.biografia) {
            this.elementos.bio.textContent = usr.biografia;
            this.elementos.bio.classList.remove('xd-oculto');
        } else {
            this.elementos.bio.classList.add('xd-oculto');
        }

        this.elementos.statPublicaciones.textContent = usr.publicaciones_count || 0;
        this.elementos.statSeguidores.textContent = this.estado.contadorSeguidores;
        this.elementos.statSeguidos.textContent = usr.seguidos_count || 0;
        this.elementos.statListaSeguimiento.textContent = usr.watchlist_count || 0;

        // Configurar botón
        this.elementos.btnAccion.classList.remove('xd-oculto');
        if (this.estado.esMiPerfil) {
            this.elementos.btnAccion.textContent = 'Editar Perfil';
            this.elementos.btnAccion.className = 'xd-boton xd-boton-secundario btn-seguir';
        } else if (Aplicacion.usuario) {
            // Es perfil ajeno y estoy logueado
            this.actualizarBotonSeguirUi();
        } else {
            // Usuario anónimo viendo perfil ajeno
            this.elementos.btnAccion.classList.add('xd-oculto');
        }
    },

    actualizarBotonSeguirUi: function() {
        if (this.estado.siguiendo) {
            this.elementos.btnAccion.innerHTML = '<span>Siguiendo</span>';
            this.elementos.btnAccion.className = 'xd-boton btn-seguir btn-seguir-siguiendo';
        } else {
            this.elementos.btnAccion.innerHTML = 'Seguir';
            this.elementos.btnAccion.className = 'xd-boton xd-boton-primario btn-seguir';
        }
    },

    manejarSeguir: async function() {
        const btnOriginal = this.elementos.btnAccion.innerHTML;
        this.elementos.btnAccion.disabled = true;
        this.elementos.btnAccion.innerHTML = '...';
        
        const accion = this.estado.siguiendo ? 'dejar_de_seguir' : 'seguir';
        
        try {
            const res = await ServicioPerfil.seguir(this.estado.usuarioId, accion);
            if (res && res.exito) {
                this.estado.siguiendo = res.esta_siguiendo;
                this.estado.contadorSeguidores = res.seguidores_count;
                this.elementos.statSeguidores.textContent = this.estado.contadorSeguidores;
                this.actualizarBotonSeguirUi();
                XD.mostrarToast(res.mensaje, 'exito');
            } else {
                XD.mostrarToast(res?.mensaje || 'Error', 'error');
                this.actualizarBotonSeguirUi();
            }
        } catch(e) {
            this.actualizarBotonSeguirUi();
            XD.mostrarToast('Error de conexión', 'error');
        } finally {
            this.elementos.btnAccion.disabled = false;
        }
    },

    abrirModalEditar: function() {
        const usr = this.estado.usuarioDatos;
        this.elementos.inputNombreUsuarioEdit.value = usr.nombre_usuario || '';
        this.elementos.inputCorreoEdit.value = usr.correo || '';
        this.elementos.inputBioEdit.value = usr.biografia || '';
        this.elementos.bioCount.textContent = `${this.elementos.inputBioEdit.value.length}/160`;
        this.elementos.inputNuevaContrasena.value = '';
        this.elementos.inputContrasenaActual.value = '';
        this.elementos.previewAvatarEdit.src = Aplicacion.obtenerAvatar(usr);
        this.estado.archivoAvatar = null;
        this.elementos.inputAvatarEdit.value = '';
        this.elementos.modalEditar.classList.remove('xd-oculto');
    },

    cerrarModalEditar: function() {
        this.elementos.modalEditar.classList.add('xd-oculto');
    },

    guardarPerfil: async function() {
        const nombreUsuario = this.elementos.inputNombreUsuarioEdit.value.trim();
        const correo = this.elementos.inputCorreoEdit.value.trim();
        const bio = this.elementos.inputBioEdit.value.trim();
        const nuevaContrasena = this.elementos.inputNuevaContrasena.value;
        const contrasenaActual = this.elementos.inputContrasenaActual.value;

        if (!nombreUsuario || !correo) {
            XD.mostrarToast('El nombre de usuario y correo son obligatorios', 'error');
            return;
        }
        if (bio.length > 160) {
            XD.mostrarToast('La biografía es muy larga', 'error');
            return;
        }
        if (!contrasenaActual) {
            XD.mostrarToast('Debes confirmar tu contraseña actual para guardar cambios', 'error');
            return;
        }

        const btnTxt = this.elementos.btnGuardarPerfil.textContent;
        this.elementos.btnGuardarPerfil.textContent = 'Guardando...';
        this.elementos.btnGuardarPerfil.disabled = true;

        const formData = new FormData();
        formData.append('nombre_usuario', nombreUsuario);
        formData.append('correo', correo);
        formData.append('biografia', bio);
        formData.append('contrasena_actual', contrasenaActual);
        if (nuevaContrasena) {
            formData.append('nueva_contrasena', nuevaContrasena);
        }
        if (this.estado.archivoAvatar) {
            formData.append('avatar', this.estado.archivoAvatar, 'avatar.jpg');
        }

        try {
            const res = await ServicioPerfil.actualizar(formData);
            if (res && res.exito) {
                XD.mostrarToast('Perfil actualizado correctamente', 'exito');
                // Actualizar UI sin recargar si es posible, o reload. Para limpieza: reload.
                window.location.reload();
            } else {
                XD.mostrarToast(res?.mensaje || 'Error al actualizar', 'error');
            }
        } catch (e) {
            XD.mostrarToast('Error de conexión', 'error');
        } finally {
            this.elementos.btnGuardarPerfil.textContent = btnTxt;
            this.elementos.btnGuardarPerfil.disabled = false;
        }
    },

    abrirModalLista: async function(tipo) {
        this.elementos.modalUsuariosTitulo.textContent = tipo === 'followers' ? 'Seguidores' : 'Seguidos';
        this.elementos.modalUsuarios.classList.remove('xd-oculto');
        
        this.elementos.listaUsuarios.innerHTML = '';
        this.elementos.loaderUsuarios.classList.remove('xd-oculto');
        this.elementos.emptyUsuarios.classList.add('xd-oculto');

        const tipoParam = tipo === 'followers' ? 'seguidores' : 'seguidos';

        try {
            const res = await ServicioPerfil.obtenerSeguidores(this.estado.usuarioId, tipoParam);
            this.elementos.loaderUsuarios.classList.add('xd-oculto');
            
            if (res && res.exito && res.usuarios) {
                if (res.usuarios.length === 0) {
                    this.elementos.emptyUsuarios.classList.remove('xd-oculto');
                } else {
                    res.usuarios.forEach(u => {
                        const tpl = this.elementos.templateUsuario.content.cloneNode(true);
                        const link = tpl.querySelector('.usuario-item-lista');
                        link.href = `perfil.html?id=${u.id}`;
                        tpl.querySelector('.avatar-lista').src = Aplicacion.obtenerAvatar(u);
                        tpl.querySelector('.nombre-lista').textContent = u.username || u.nombre_usuario;
                        tpl.querySelector('.username-lista').textContent = `@${u.username || u.nombre_usuario}`;
                        this.elementos.listaUsuarios.appendChild(tpl);
                    });
                }
            }
        } catch(e) {
            this.elementos.loaderUsuarios.classList.add('xd-oculto');
            XD.mostrarToast('Error al cargar la lista', 'error');
        }
    },

    cerrarModalLista: function() {
        this.elementos.modalUsuarios.classList.add('xd-oculto');
    },

     
    // MODAL LISTA DE SEGUIMIENTO (Watchlist)
    

    /**
     * Abrir el modal con la lista de seguimiento del usuario
     */
    abrirModalSeguimiento: async function() {
        this.elementos.modalSeguimiento.classList.remove('xd-oculto');
        
        this.elementos.listaSeguimientoContenido.innerHTML = '';
        this.elementos.loaderSeguimiento.classList.remove('xd-oculto');
        this.elementos.emptySeguimiento.classList.add('xd-oculto');

        try {
            const res = await ServicioPerfil.obtenerListaSeguimiento(this.estado.usuarioId);
            this.elementos.loaderSeguimiento.classList.add('xd-oculto');

            if (res && res.exito && res.lista) {
                if (res.lista.length === 0) {
                    this.elementos.emptySeguimiento.classList.remove('xd-oculto');
                } else {
                    res.lista.forEach(item => {
                        // Crear elemento para cada criptomoneda (sin logo ni gráfico)
                        const enlace = document.createElement('a');
                        enlace.href = `mercado.html`;
                        enlace.className = 'usuario-item-lista seguimiento-item';
                        enlace.setAttribute('role', 'listitem');
                        enlace.setAttribute('aria-label', 'Ver ' + item.simbolo + ' en el mercado');

                        // Icono de estrella para la lista de seguimiento
                        const icono = document.createElement('span');
                        icono.className = 'seguimiento-item-icono';
                        icono.setAttribute('aria-hidden', 'true');
                        const iconoImg = document.createElement('img');
                        iconoImg.src = 'img/estrella-rellena.svg';
                        iconoImg.alt = '';
                        iconoImg.className = 'seguimiento-icono-img';
                        icono.appendChild(iconoImg);

                        const info = document.createElement('div');
                        info.className = 'usuario-item-info';

                        const nombre = document.createElement('div');
                        nombre.className = 'usuario-item-nombre';
                        // Capitalizar el símbolo para mostrarlo
                        nombre.textContent = item.simbolo.charAt(0).toUpperCase() + item.simbolo.slice(1);

                        const subtexto = document.createElement('div');
                        subtexto.className = 'usuario-item-username';
                        subtexto.textContent = 'Criptomoneda';

                        info.appendChild(nombre);
                        info.appendChild(subtexto);
                        enlace.appendChild(icono);
                        enlace.appendChild(info);
                        this.elementos.listaSeguimientoContenido.appendChild(enlace);
                    });
                }
            }
        } catch(e) {
            this.elementos.loaderSeguimiento.classList.add('xd-oculto');
            XD.mostrarToast('Error al cargar la lista de seguimiento', 'error');
        }
    },

    /**
     * Cerrar el modal de lista de seguimiento
     */
    cerrarModalSeguimiento: function() {
        this.elementos.modalSeguimiento.classList.add('xd-oculto');
    },

    //* 
    //* FEED DE PUBLICACIONES DEL PERFIL
    //* 

    cargarPublicaciones: async function(reiniciar = false) {
        if (this.estado.cargandoPosts && !reiniciar) return;
        
        this.estado.cargandoPosts = true;
        const offset = reiniciar ? 0 : this.estado.desplazamiento;
        
        if (reiniciar) {
            this.elementos.feed.innerHTML = ''; 
            this.elementos.feed.appendChild(this.elementos.loaderPosts);
            this.elementos.loaderPosts.classList.remove('xd-oculto');
            this.elementos.contenedorCargarMas.classList.add('xd-oculto');
            this.estado.publicaciones = [];
        } else {
            this.elementos.btnCargarMasPosts.textContent = 'Cargando...';
            this.elementos.btnCargarMasPosts.disabled = true;
        }

        try {
            // Petición al endpoint index.php limitando por usuario_id
            const url = `/publicaciones/index.php?usuario_id=${this.estado.usuarioId}&limite=${this.estado.limite}&desplazamiento=${offset}`;
            const res = await XD.peticion(url, 'GET');
            
            if (reiniciar) {
                this.elementos.loaderPosts.classList.add('xd-oculto');
            }
            
            if (res && res.exito) {
                const nuevasPubs = res.publicaciones || [];
                
                if (reiniciar && nuevasPubs.length === 0) {
                    this.renderizarEstadoVacioFeed();
                } else {
                    this.estado.publicaciones = [...this.estado.publicaciones, ...nuevasPubs];
                    this.estado.desplazamiento += this.estado.limite;
                    
                    nuevasPubs.forEach(pub => {
                        const htmlPub = this.crearElementoPublicacion(pub);
                        this.elementos.feed.appendChild(htmlPub);
                    });
                }
                
                this.estado.tieneMas = res.tieneMas;
                
                if (this.estado.tieneMas) {
                    this.elementos.contenedorCargarMas.classList.remove('xd-oculto');
                } else {
                    this.elementos.contenedorCargarMas.classList.add('xd-oculto');
                }
            }
        } catch (error) {
            console.error("Error posts perfil:", error);
            if (reiniciar) this.elementos.loaderPosts.classList.add('xd-oculto');
        } finally {
            this.estado.cargandoPosts = false;
            this.elementos.btnCargarMasPosts.textContent = 'Cargar más publicaciones';
            this.elementos.btnCargarMasPosts.disabled = false;
        }
    },

    renderizarEstadoVacioFeed: function() {
        const div = document.createElement('div');
        div.className = 'perfil-vacio xd-animar-deslizar';
        div.innerHTML = `No hay publicaciones todavía.`;
        this.elementos.feed.appendChild(div);
    },

    crearElementoPublicacion: function(pub) {
        const tpl = this.elementos.templatePost.content.cloneNode(true);
        const articulo = tpl.querySelector('.post-tarjeta');
        
        articulo.dataset.id = pub.id;
        
        // Determinar si es repost
        const esRepost = !!pub.publicacion_original_id;
        
        if (esRepost) {
            const badgeRep = articulo.querySelector('.post-republicado');
            badgeRep.classList.remove('xd-oculto');
            badgeRep.querySelector('.nombre-republicador').textContent = 
                `${pub.username} republicó`;
        }
        
        const autorNombre = esRepost ? (pub.original_username || 'Usuario') : (pub.username || 'Usuario');
        const autorAvatar = esRepost
            ? Aplicacion.obtenerAvatar({avatar: pub.original_avatar})
            : Aplicacion.obtenerAvatar({avatar: pub.avatar});
        const autorId = esRepost ? pub.original_user_id : pub.user_id;
            
        const divAutor = articulo.querySelector('.post-autor');
        divAutor.href = `perfil.html?id=${autorId}`;
        articulo.querySelector('.post-avatar').src = autorAvatar;
        articulo.querySelector('.post-autor-nombre').textContent = autorNombre;
        articulo.querySelector('.post-fecha').textContent = Aplicacion.formatearFecha(pub.created_at);
        
        const contenido = esRepost ? (pub.original_content || '') : (pub.content || '');
        articulo.querySelector('.post-contenido').textContent = contenido; 
        
        const imagen = esRepost ? pub.original_image : pub.image_url;
        if (imagen) {
            const divImg = articulo.querySelector('.post-imagen');
            divImg.classList.remove('xd-oculto');
            divImg.querySelector('img').src = XDConfig.urlBase + '/' + imagen;
        }
        
        articulo.querySelector('.btn-comentar .contador').textContent = pub.comment_count || 0;
        articulo.querySelector('.btn-repost .contador').textContent = pub.repost_count || 0;
        articulo.querySelector('.btn-like .contador').textContent = pub.like_count || 0;
        
        if (pub.is_liked && parseInt(pub.is_liked) > 0) {
            const btnLike = articulo.querySelector('.btn-like');
            btnLike.classList.add('activo');
            btnLike.querySelector('img').src = 'img/me-gusta-relleno.svg';
        }
        
        const puedeEliminar = Aplicacion.usuario && 
            (Aplicacion.usuario.id == pub.user_id || Aplicacion.usuario.rol === 'admin');
            
        if (puedeEliminar) {
            articulo.querySelector('.post-opciones').classList.remove('xd-oculto');
        }
        
        return articulo;
    },

    alternarLike: async function(postId, btn) {
        if (!Aplicacion.usuario) return XD.mostrarToast('Debes iniciar sesión para dar me gusta', 'info');
        
        const esLike = !btn.classList.contains('activo');
        const countSpan = btn.querySelector('.contador');
        let count = parseInt(countSpan.textContent) || 0;
        
        if (esLike) { btn.classList.add('activo'); btn.querySelector('img').src = 'img/me-gusta-relleno.svg'; count++; }
        else { btn.classList.remove('activo'); btn.querySelector('img').src = 'img/me-gusta.svg'; count--; }
        countSpan.textContent = count;
        
        try {
            let res = esLike ? await ServicioInteraccion.darLike(postId) : await ServicioInteraccion.quitarLike(postId);
            if (!res || !res.exito) throw new Error("Fallo API");
        } catch (e) {
            // Rollback
            if (esLike) { btn.classList.remove('activo'); btn.querySelector('img').src = 'img/me-gusta.svg'; count--; }
            else { btn.classList.add('activo'); btn.querySelector('img').src = 'img/me-gusta-relleno.svg'; count++; }
            countSpan.textContent = count;
            XD.mostrarToast('Error en conexión', 'error');
        }
    },
    
    republicar: async function(postId, btn) {
        if (!Aplicacion.usuario) return XD.mostrarToast('Debes iniciar sesión para republicar', 'info');
        if (btn.classList.contains('activo')) return XD.mostrarToast('Ya republicado', 'info');
        
        const countSpan = btn.querySelector('.contador');
        let count = parseInt(countSpan.textContent) || 0;
        
        btn.classList.add('activo');
        countSpan.textContent = count + 1;
        
        const res = await ServicioInteraccion.republicar(postId);
        if (res && res.exito) XD.mostrarToast('Republicado', 'exito');
        else {
            btn.classList.remove('activo');
            countSpan.textContent = count;
            XD.mostrarToast(res?.error || 'Error', 'error');
        }
    },
    
    eliminarPublicacion: async function(postId, tarjetaElement) {
        const conf = await XD.confirmar("¿Eliminar publicación?", "Acción irrecuperable.");
        if (!conf) return;
        
        tarjetaElement.querySelector('.post-menu').classList.remove('abierto');
        tarjetaElement.style.opacity = '0.5';
        
        const res = await ServicioInteraccion.eliminarPublicacion(postId);
        if (res && res.exito) {
            XD.mostrarToast('Eliminada', 'info');
            tarjetaElement.remove();
            
            // Si es mi perfil, restar 1 contador
            if(this.estado.esMiPerfil) {
                let p = parseInt(this.elementos.statPublicaciones.textContent);
                if(p>0) this.elementos.statPublicaciones.textContent = p - 1;
            }
        } else {
            tarjetaElement.style.opacity = '1';
            XD.mostrarToast(res?.error || 'Error', 'error');
        }
    }
};

document.addEventListener('DOMContentLoaded', () => Perfil.inicializar());
