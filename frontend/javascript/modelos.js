/**
 * MODELOS.JS — XDinero
 * Clases instanciables para el encapsulamiento de datos entre el Frontend y el Backend
 * Cumpliendo con el requerimiento de "hacer uso de objetos para almacenar los datos a partir de clases"
 */

/**
 * Clase base para todas las peticiones (Data Transfer Object)
 */
class PeticionAJAX {
    constructor(endpoint, metodo = 'POST') {
        this.endpoint = endpoint;
        this.metodo = metodo;
        this.datos = null;
        this.opcionesAdicionales = {};
    }

    setDatos(datos) {
        this.datos = datos;
        return this;
    }
    
    setOpciones(opciones) {
        this.opcionesAdicionales = opciones;
        return this;
    }
}

/**
 * Modelo para iniciar sesión
 */
class LoginDTO {
    constructor(correo, contrasena) {
        this.correo = correo;
        this.contrasena = contrasena;
    }
}

/**
 * Modelo para registrar un usuario
 */
class RegistroDTO {
    constructor(nombre_usuario, correo, contrasena) {
        this.nombre_usuario = nombre_usuario;
        this.correo = correo;
        this.contrasena = contrasena;
    }
}

/**
 * Modelo para crear una publicación
 */
class PublicacionDTO {
    constructor(texto) {
        this.texto = texto;
    }
}

/**
 * Modelo genérico para Respuesta AJAX exitosa
 */
class RespuestaExito {
    constructor(datos) {
        this.exito = true;
        this.datos = datos;
    }
}

/**
 * Modelo genérico para Respuesta AJAX fallida
 */
class RespuestaError {
    constructor(mensaje, estado = 500) {
        this.exito = false;
        this.error = mensaje;
        this.estadoHTTP = estado;
    }
}

// Hacer globales
window.PeticionAJAX = PeticionAJAX;
window.LoginDTO = LoginDTO;
window.RegistroDTO = RegistroDTO;
window.PublicacionDTO = PublicacionDTO;
window.RespuestaExito = RespuestaExito;
window.RespuestaError = RespuestaError;

/**
 * Modelo para crear una interacción (Like, Repost, etc)
 */
class InteraccionDTO {
    constructor(id_publicacion) {
        this.publicacion_id = id_publicacion;
    }
}

/**
 * Modelo para crear un comentario
 */
class ComentarioDTO {
    constructor(id_publicacion, contenido) {
        this.publicacion_id = id_publicacion;
        this.contenido = contenido;
    }
}

window.InteraccionDTO = InteraccionDTO;
window.ComentarioDTO = ComentarioDTO;

/**
 * Modelo para pedir Mercados a CoinGecko
 */
class CoinGeckoMercadosDTO {
    constructor(moneda = 'usd', porPagina = 100, pagina = 1, ids = null) {
        this.vs_currency = moneda;
        this.order = 'market_cap_desc';
        this.per_page = porPagina;
        this.page = pagina;
        this.sparkline = false;
        if(ids) this.ids = ids;
    }
}

/**
 * Modelo para pedir Busqueda a CoinGecko
 */
class CoinGeckoBusquedaDTO {
    constructor(consulta) {
        this.query = consulta;
    }
}

/**
 * Modelo para pedir Grafico a CoinGecko
 */
class CoinGeckoGraficoDTO {
    constructor(moneda = 'usd', dias = '1') {
        this.vs_currency = moneda;
        this.days = dias;
    }
}

window.CoinGeckoMercadosDTO = CoinGeckoMercadosDTO;
window.CoinGeckoBusquedaDTO = CoinGeckoBusquedaDTO;
window.CoinGeckoGraficoDTO = CoinGeckoGraficoDTO;

/**
 * Modelo para alternar una criptomoneda en la lista de seguimiento
 */
class ListaSeguimientoDTO {
    constructor(simbolo) {
        this.simbolo = simbolo;
    }
}

window.ListaSeguimientoDTO = ListaSeguimientoDTO;

/**
 * Modelo para las peticiones de lista paginadas (Admin)
 */
class PaginacionDTO {
    constructor(pagina = 1, limite = 10) {
        this.page = pagina;
        this.limit = limite;
    }
}

/**
 * Modelo para crear un usuario desde Admin
 */
class CrearUsuarioDTO {
    constructor(datos) {
        Object.assign(this, datos);
    }
}

/**
 * Modelo para editar un usuario desde Admin
 */
class EditarUsuarioDTO {
    constructor(datos) {
        Object.assign(this, datos);
    }
}

/**
 * Modelo para eliminar entidades desde Admin
 */
class EliminarEntidadDTO {
    constructor(id) {
        this.id = id;
    }
}

/**
 * Modelo para actualizar el rol de un usuario
 */
class ActualizarRolDTO {
    constructor(id, rol) {
        this.id = id;
        this.role = rol;
    }
}

window.PaginacionDTO = PaginacionDTO;
window.CrearUsuarioDTO = CrearUsuarioDTO;
window.EditarUsuarioDTO = EditarUsuarioDTO;
window.EliminarEntidadDTO = EliminarEntidadDTO;
window.ActualizarRolDTO = ActualizarRolDTO;
