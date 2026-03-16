/**
 * INICIO.JS
 * Lógica para la página principal (Feed de publicaciones)
 */

const Inicio = {
    estado: {
        publicaciones: [],
        desplazamiento: 0,
        limite: 10,
        tieneMas: true,
        cargando: false,
        archivoImagen: null
    },

    elementos: {
        cajaCrearPost: document.getElementById('caja-crear-post'),
        formulario: document.getElementById('formulario-crear-post'),
        textarea: document.getElementById('texto-post'),
        contadorTexto: document.getElementById('contador-texto'),
        btnPublicar: document.getElementById('btn-publicar'),
        inputImagen: document.getElementById('input-imagen'),
        previaImgContenedor: document.getElementById('contenedor-previa-img'),
        previaImg: document.getElementById('previa-img'),
        btnQuitarImg: document.getElementById('btn-quitar-img'),
        indicadorCompresion: document.getElementById('indicador-compresion'),
        avatarCreador: document.getElementById('avatar-creador'),
        
        bannerInvitado: document.getElementById('banner-invitado'),
        
        feed: document.getElementById('feed-publicaciones'),
        loaderInicial: document.getElementById('loader-inicial'),
        contenedorCargarMas: document.getElementById('contenedor-cargar-mas'),
        btnCargarMas: document.getElementById('btn-cargar-mas'),
        
        template: document.getElementById('template-publicacion')
    },

    inicializar: function() {
        this.configurarSegunAutenticacion();
        this.vincularEventosFormulario();
        this.vincularEventosFeed();
        
        // Cargar primera página
        this.cargarPublicaciones(true);
        
        // Escuchar cambios de autenticación (jQuery custom event desde aplicacion.js)
        $(document).on('xd:autenticacion', () => {
            this.configurarSegunAutenticacion();
        });
    },

    configurarSegunAutenticacion: function() {
        if (Aplicacion.usuario) {
            // Usuario logueado
            this.elementos.cajaCrearPost.classList.remove('xd-oculto');
            this.elementos.bannerInvitado.classList.add('xd-oculto');
            
            // Poner avatar del usuario en el formulario
            this.elementos.avatarCreador.src = Aplicacion.obtenerAvatar(Aplicacion.usuario);
        } else {
            // Invitado
            this.elementos.cajaCrearPost.classList.add('xd-oculto');
            this.elementos.bannerInvitado.classList.remove('xd-oculto');
        }
    },

    vincularEventosFormulario: function() {
        if (!this.elementos.formulario) return;

        // Auto-rezise textarea
        this.elementos.textarea.addEventListener('input', (e) => {
            const temp = e.target;
            temp.style.height = 'auto';
            temp.style.height = (temp.scrollHeight) + 'px';
            
            this.actualizarEstadoBotonPublicar();
        });

        // Input de imagen
        this.elementos.inputImagen.addEventListener('change', async (e) => {
            const archivo = e.target.files[0];
            if (!archivo) return;
            
            // Mostrar UI de compresión
            this.elementos.indicadorCompresion.classList.remove('xd-oculto');
            this.elementos.btnPublicar.disabled = true;

            try {
                // Comprimir imagen
                const archivoComprimido = await ProcesadorImagen.comprimir(archivo);
                this.estado.archivoImagen = archivoComprimido;
                
                // Mostrar preview
                this.elementos.previaImg.src = URL.createObjectURL(archivoComprimido);
                this.elementos.previaImgContenedor.style.display = 'block';
                
            } catch (error) {
                XD.mostrarToast('Error al procesar la imagen', 'error');
                console.error("Error al comprimir:", error);
                this.estado.archivoImagen = null;
                this.elementos.inputImagen.value = '';
            } finally {
                this.elementos.indicadorCompresion.classList.add('xd-oculto');
                this.actualizarEstadoBotonPublicar();
            }
        });

        // Quitar imagen
        this.elementos.btnQuitarImg.addEventListener('click', () => {
            this.estado.archivoImagen = null;
            this.elementos.inputImagen.value = '';
            this.elementos.previaImgContenedor.style.display = 'none';
            this.elementos.previaImg.src = '';
            this.actualizarEstadoBotonPublicar();
        });

        // Envío de formulario
        this.elementos.formulario.addEventListener('submit', async (e) => {
            e.preventDefault();
            this.crearPublicacion();
        });
    },
    
    actualizarEstadoBotonPublicar: function() {
        const texto = this.elementos.textarea.value.trim();
        const tieneTexto = texto.length > 0;
        const tieneImagen = this.estado.archivoImagen !== null;
        
        // Actualizar contador
        this.elementos.contadorTexto.textContent = `${texto.length} / 280`;
        
        if (texto.length > 280) {
            this.elementos.contadorTexto.classList.add('xd-texto-error');
        } else {
            this.elementos.contadorTexto.classList.remove('xd-texto-error');
        }
        
        this.elementos.btnPublicar.disabled = (!tieneTexto && !tieneImagen) || texto.length > 280;
    },

    crearPublicacion: async function() {
        const texto = this.elementos.textarea.value.trim();
        if ((!texto && !this.estado.archivoImagen) || texto.length > 280) return;

        // Estado cargando
        const btnOriginal = this.elementos.btnPublicar.innerHTML;
        this.elementos.btnPublicar.innerHTML = 'Publicando...';
        this.elementos.btnPublicar.classList.add('btn-cargando');
        this.elementos.btnPublicar.disabled = true;
        this.elementos.textarea.disabled = true;
        
        try {
            const formData = new FormData();
            formData.append('contenido', texto);
            if (this.estado.archivoImagen) {
                formData.append('imagen', this.estado.archivoImagen, 'imagen.jpg');
            }

            // Usamos XD.peticion directamente para enviar multipart/form-data
            const respuesta = await XD.peticion('/publicaciones/index.php', 'POST', formData, { contentType: false });
            
            if (respuesta && respuesta.exito) {
                // Limpiar formulario
                this.elementos.textarea.value = '';
                this.elementos.textarea.style.height = 'auto';
                this.estado.archivoImagen = null;
                this.elementos.inputImagen.value = '';
                this.elementos.previaImgContenedor.style.display = 'none';
                this.actualizarEstadoBotonPublicar();
                
                XD.mostrarToast('Publicación creada correctamente', 'exito');
                
                // Recargar feed para ver el nuevo post
                this.cargarPublicaciones(true);
            } else {
                XD.mostrarToast(respuesta?.error || 'Error al crear la publicación', 'error');
            }
        } catch (error) {
            console.error(error);
            XD.mostrarToast('Error de conexión al servidor', 'error');
        } finally {
            this.elementos.btnPublicar.innerHTML = btnOriginal;
            this.elementos.btnPublicar.classList.remove('btn-cargando');
            this.elementos.textarea.disabled = false;
        }
    },

    vincularEventosFeed: function() {
        this.elementos.btnCargarMas.addEventListener('click', () => {
            this.cargarPublicaciones(false);
        });
        
        // Delegación de eventos para las publicaciones dinámica
        this.elementos.feed.addEventListener('click', (e) => {
            const articulo = e.target.closest('.post-tarjeta');
            if (!articulo) return;
            
            const postId = articulo.dataset.id;
            
            // Evitar clics en la tarjeta si se hace clic en botones, enlaces o imágenes adjuntas
            const elementoClickeado = e.target;
            const esBotonOEnlace = elementoClickeado.closest('button') || elementoClickeado.closest('a') || elementoClickeado.tagName.toLowerCase() === 'img';
            
            if (!esBotonOEnlace) {
                window.location.href = `publicacion.html?id=${postId}`;
                return;
            }

            // Manejar click botón de opciones (tres puntos)
            const btnOpciones = e.target.closest('.post-btn-opciones');
            if (btnOpciones) {
                e.stopPropagation();
                const menu = articulo.querySelector('.post-menu');
                // Cerrar todos los demás menús antes
                document.querySelectorAll('.post-menu.abierto').forEach(m => {
                    if (m !== menu) m.classList.remove('abierto');
                });
                menu.classList.toggle('abierto');
                return;
            }

            // Manejar click en "Eliminar post"
            const btnEliminar = e.target.closest('.btn-eliminar-post');
            if (btnEliminar) {
                this.eliminarPublicacion(postId, articulo);
                return;
            }

            // Acciones de interacción usando ServicioInteraccion
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
                // Abrir imagen en grande
                window.open(imgPost.src, '_blank');
            }
        });

        // Cerrar menú modal si se hace clic fuera
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.post-opciones')) {
                document.querySelectorAll('.post-menu.abierto').forEach(m => {
                    m.classList.remove('abierto');
                });
            }
        });
    },

    cargarPublicaciones: async function(reiniciar = false) {
        if (this.estado.cargando && !reiniciar) return;
        
        this.estado.cargando = true;
        const desplazamientoActual = reiniciar ? 0 : this.estado.desplazamiento;
        
        if (reiniciar) {
            this.elementos.feed.innerHTML = ''; // Limpiar
            this.elementos.feed.appendChild(this.elementos.loaderInicial);
            this.elementos.loaderInicial.classList.remove('xd-oculto');
            this.elementos.contenedorCargarMas.classList.add('xd-oculto');
        } else {
            const originalText = this.elementos.btnCargarMas.textContent;
            this.elementos.btnCargarMas.textContent = 'Cargando...';
            this.elementos.btnCargarMas.disabled = true;
        }

        try {
            const res = await XD.peticion(`/publicaciones/index.php?limite=${this.estado.limite}&desplazamiento=${desplazamientoActual}`, 'GET');
            
            if (reiniciar) {
                this.elementos.loaderInicial.classList.add('xd-oculto');
                this.estado.publicaciones = [];
            }
            
            if (res && res.exito) {
                const nuevasPubs = res.publicaciones || [];
                
                if (reiniciar && nuevasPubs.length === 0) {
                    this.renderizarEstadoVacio();
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
            console.error("Error al cargar publicaciones:", error);
            if (reiniciar) {
                this.elementos.loaderInicial.classList.add('xd-oculto');
                XD.mostrarToast('Error al cargar publicaciones', 'error');
            }
        } finally {
            this.estado.cargando = false;
            this.elementos.btnCargarMas.textContent = 'Cargar más publicaciones';
            this.elementos.btnCargarMas.disabled = false;
        }
    },
    
    renderizarEstadoVacio: function() {
        const div = document.createElement('div');
        div.className = 'feed-vacio xd-animar-deslizar';
        div.innerHTML = `
            <img src="img/ayuda.svg" alt="Vacio" style="width:48px; height:48px; filter:invert(0.5); margin: 0 auto 1rem;">
            <h3>No hay publicaciones aún</h3>
            <p>Sé el primero en publicar algo interesante.</p>
        `;
        this.elementos.feed.appendChild(div);
    },

    crearElementoPublicacion: function(pub) {
        const tpl = this.elementos.template.content.cloneNode(true);
        const articulo = tpl.querySelector('.post-tarjeta');
        
        articulo.dataset.id = pub.id;
        
        // Determinar si es repost
        const esRepost = !!pub.publicacion_original_id;
        
        // --- Badge Republicado ---
        if (esRepost) {
            const badgeRep = articulo.querySelector('.post-republicado');
            badgeRep.classList.remove('xd-oculto');
            badgeRep.querySelector('.nombre-republicador').textContent = 
                `${pub.username} republicó`;
        }
        
        // --- Datos Autor ---
        // Si es repost, mostrar el autor original; si no, mostrar el autor del post
        const autorNombre = esRepost ? (pub.original_username || 'Usuario Desconocido') : (pub.username || 'Usuario Desconocido');
        const autorAvatar = esRepost 
            ? Aplicacion.obtenerAvatar({avatar: pub.original_avatar})
            : Aplicacion.obtenerAvatar({avatar: pub.avatar});
        const autorId = esRepost ? pub.original_user_id : pub.user_id;
            
        const divAutor = articulo.querySelector('.post-autor');
        divAutor.href = `perfil.html?id=${autorId}`;
        articulo.querySelector('.post-avatar').src = autorAvatar;
        articulo.querySelector('.post-autor-nombre').textContent = autorNombre;
        articulo.querySelector('.post-fecha').textContent = Aplicacion.formatearFecha(pub.created_at);
        
        // --- Contenido ---
        const contenido = esRepost ? (pub.original_content || '') : (pub.content || '');
        articulo.querySelector('.post-contenido').textContent = contenido;
        
        // --- Imagen ---
        const imagen = esRepost ? pub.original_image : pub.image_url;
        if (imagen) {
            const divImg = articulo.querySelector('.post-imagen');
            divImg.classList.remove('xd-oculto');
            divImg.querySelector('img').src = XDConfig.urlBase + '/' + imagen;
        }
        
        // --- Acciones (Counts) ---
        articulo.querySelector('.btn-comentar .contador').textContent = pub.comment_count || 0;
        articulo.querySelector('.btn-repost .contador').textContent = pub.repost_count || 0;
        articulo.querySelector('.btn-like .contador').textContent = pub.like_count || 0;
        
        // Estados activos si yo lo hice
        if (pub.is_liked && parseInt(pub.is_liked) > 0) {
            const btnLike = articulo.querySelector('.btn-like');
            btnLike.classList.add('activo');
            btnLike.querySelector('img').src = 'img/me-gusta-relleno.svg';
        }
        
        // --- Menú Tres Puntos (Solo si soy dueño o admin) ---
        const puedeEliminar = Aplicacion.usuario && 
            (Aplicacion.usuario.id == pub.user_id || Aplicacion.usuario.rol === 'admin');
            
        if (puedeEliminar) {
            articulo.querySelector('.post-opciones').classList.remove('xd-oculto');
        }
        
        return articulo;
    },
    
    alternarLike: async function(postId, btn) {
        if (!Aplicacion.usuario) {
            XD.mostrarToast('Debes iniciar sesión para dar me gusta', 'info');
            return;
        }
        
        const esLike = !btn.classList.contains('activo');
        const countSpan = btn.querySelector('.contador');
        let likesCount = parseInt(countSpan.textContent) || 0;
        
        // Optimistic UI
        if (esLike) {
            btn.classList.add('activo');
            btn.querySelector('img').src = 'img/me-gusta-relleno.svg';
            likesCount++;
        } else {
            btn.classList.remove('activo');
            btn.querySelector('img').src = 'img/me-gusta.svg';
            likesCount--;
        }
        countSpan.textContent = likesCount;
        
        try {
            let res;
            if (esLike) {
                res = await ServicioInteraccion.darLike(postId);
            } else {
                res = await ServicioInteraccion.quitarLike(postId);
            }
            if (!res || !res.exito) throw new Error("Fallo API");
        } catch (e) {
            // Rollback on error
            if (esLike) {
                btn.classList.remove('activo');
                btn.querySelector('img').src = 'img/me-gusta.svg';
                likesCount--;
            } else {
                btn.classList.add('activo');
                btn.querySelector('img').src = 'img/me-gusta-relleno.svg';
                likesCount++;
            }
            countSpan.textContent = likesCount;
            XD.mostrarToast('Error en la conexión', 'error');
        }
    },
    
    republicar: async function(postId, btn) {
        if (!Aplicacion.usuario) {
            XD.mostrarToast('Debes iniciar sesión para republicar', 'info');
            return;
        }
        
        const yaRepublicado = btn.classList.contains('activo');
        if (yaRepublicado) {
            XD.mostrarToast('Ya has republicado esto (Usa eliminar para deshacer, pronto)', 'info'); // TODO: Mejorar endpoint backend
            return;
        }
        
        const countSpan = btn.querySelector('.contador');
        let count = parseInt(countSpan.textContent) || 0;
        
        // Optimistic
        btn.classList.add('activo');
        countSpan.textContent = count + 1;
        
        const res = await ServicioInteraccion.republicar(postId);
        if (res && res.exito) {
            XD.mostrarToast('¡Publicación compartida!', 'exito');
            // Idealmente recargar pero por ahora está bien
        } else {
            // Rollback
            btn.classList.remove('activo');
            countSpan.textContent = count;
            XD.mostrarToast(res?.error || 'No se pudo republicar', 'error');
        }
    },
    
    eliminarPublicacion: async function(postId, tarjetaElement) {
        const confirmar = await XD.confirmar(
            "¿Eliminar publicación?",
            "Esta acción no se puede deshacer. La publicación desaparecerá para siempre."
        );
        
        if (!confirmar) return;
        
        // Ocultar menú
        tarjetaElement.querySelector('.post-menu').classList.remove('abierto');
        
        // Estado visual
        tarjetaElement.style.opacity = '0.5';
        
        const res = await ServicioInteraccion.eliminarPublicacion(postId);
        if (res && res.exito) {
            XD.mostrarToast('Publicación eliminada', 'info');
            // Eliminar con pequeña animación
            tarjetaElement.style.transform = 'scale(0.9)';
            setTimeout(() => {
                tarjetaElement.remove();
                if (this.elementos.feed.querySelectorAll('.post-tarjeta').length === 0) {
                    this.renderizarEstadoVacio();
                }
            }, 300);
        } else {
            tarjetaElement.style.opacity = '1';
            XD.mostrarToast(res?.error || 'Error al eliminar', 'error');
        }
    }
};

// Iniciar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    Inicio.inicializar();
});
