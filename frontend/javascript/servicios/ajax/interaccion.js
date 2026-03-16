// SERVICIOS/AJAX/INTERACCION.JS

const ServicioInteraccion = {
    // Likes (backend usa toggle con POST)
    darLike: function(id_publicacion) {
        var dto = new window.InteraccionDTO(id_publicacion);
        var peticion = new window.PeticionAJAX('/publicaciones/me_gusta.php', 'POST').setDatos(dto);
        return XD.peticion(peticion);
    },
    
    quitarLike: function(id_publicacion) {
        var dto = new window.InteraccionDTO(id_publicacion);
        var peticion = new window.PeticionAJAX('/publicaciones/me_gusta.php', 'POST').setDatos(dto);
        return XD.peticion(peticion);
    },

    // Comentarios
    obtenerComentarios: function(id_publicacion) {
        var peticion = new window.PeticionAJAX(`/publicaciones/comentarios.php?publicacion_id=${id_publicacion}`, 'GET');
        return XD.peticion(peticion);
    },

    crearComentario: function(id_publicacion, texto) {
        var dto = new window.ComentarioDTO(id_publicacion, texto);
        var peticion = new window.PeticionAJAX('/publicaciones/comentar.php', 'POST').setDatos(dto);
        return XD.peticion(peticion);
    },

    eliminarComentario: function(id_comentario) {
        var peticion = new window.PeticionAJAX(`/publicaciones/comentarios.php?id=${id_comentario}`, 'DELETE');
        return XD.peticion(peticion);
    },

    // Publicaciones 
    eliminarPublicacion: function(id_publicacion) {
        var peticion = new window.PeticionAJAX('/publicaciones/eliminar.php', 'DELETE').setDatos({ id: id_publicacion });
        return XD.peticion(peticion);
    },

    republicar: function(id_publicacion) {
        var dto = new window.InteraccionDTO(id_publicacion);
        var peticion = new window.PeticionAJAX('/publicaciones/republicar.php', 'POST').setDatos(dto);
        return XD.peticion(peticion);
    },

    compartir: function(id_publicacion) {
        const urlToShare = `${window.location.origin}/publicacion.html?id=${id_publicacion}`;
        // Dependiendo del navegador usar API nativa o copiar portapapeles
        if (navigator.share) {
            navigator.share({
                title: 'Mira esto en XDinero',
                url: urlToShare
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(urlToShare)
                .then(() => XD.mostrarToast('Enlace copiado al portapapeles', 'exito'))
                .catch(() => XD.mostrarToast('Error al copiar el enlace', 'error'));
        }
    }
};
