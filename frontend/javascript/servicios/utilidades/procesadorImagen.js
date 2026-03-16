/**
 * PROCESADOR_IMAGEN.JS — Utilidad
 * Compresión de imágenes antes de subir usando Canvas nativo
 */

var ProcesadorImagen = {};

/**
 * Comprime una imagen antes de subirla
 * @param {File} archivo - Archivo de imagen original
 * @param {number} anchoMaximo - Ancho máximo permitido (default 800px)
 * @param {number} calidad - Calidad JPEG (0 a 1, default 0.7)
 * @returns {Promise<Blob>} Promesa con el Blob comprimido
 */
ProcesadorImagen.comprimir = function (archivo, anchoMaximo, calidad) {
    anchoMaximo = anchoMaximo || 800;
    calidad = calidad || 0.7;

    return new Promise(function (resolver, rechazar) {
        if (!archivo.type.match(/image.*/)) {
            rechazar(new Error('El archivo no es una imagen'));
            return;
        }

        var lector = new FileReader();
        lector.readAsDataURL(archivo);

        lector.onload = function (evento) {
            var img = new Image();
            img.src = evento.target.result;

            img.onload = function () {
                var canvas = document.createElement('canvas');
                var ancho = img.width;
                var alto = img.height;

                // Calcular nuevas dimensiones manteniendo aspecto
                if (ancho > anchoMaximo) {
                    alto *= anchoMaximo / ancho;
                    ancho = anchoMaximo;
                }

                canvas.width = ancho;
                canvas.height = alto;

                var contexto = canvas.getContext('2d');
                contexto.drawImage(img, 0, 0, ancho, alto);

                canvas.toBlob(function (blob) {
                    if (blob) {
                        resolver(blob);
                    } else {
                        rechazar(new Error('Error al comprimir imagen'));
                    }
                }, 'image/jpeg', calidad);
            };

            img.onerror = function (err) {
                rechazar(err);
            };
        };

        lector.onerror = function (err) {
            rechazar(err);
        };
    });
};
