<?php
require_once __DIR__ . '/../../config/db.php';

class Publicacion {
    private $conn;
    private $tabla = 'publicaciones';

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    /**
     * Crea un nuevo post
     */
    public function crear($usuarioId, $contenido, $urlImagen = null) {
        $query = "INSERT INTO " . $this->tabla . " (usuario_id, contenido, url_imagen) VALUES (:usuario_id, :contenido, :url_imagen)";
        $stmt = $this->conn->prepare($query);

        $contenido = htmlspecialchars(strip_tags($contenido));
        if($urlImagen) $urlImagen = htmlspecialchars(strip_tags($urlImagen));

        $stmt->bindParam(':usuario_id', $usuarioId);
        $stmt->bindParam(':contenido', $contenido);
        $stmt->bindParam(':url_imagen', $urlImagen);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    /**
     * Obtiene un post por su ID
     */
    public function obtenerPublicacionPorId($id, $idUsuarioActual = null) {
        $query = "SELECT p.id, p.usuario_id as user_id, p.contenido as content, p.url_imagen as image_url, p.fecha_creacion as created_at,
                  u.nombre_usuario as username, u.avatar,
                  (SELECT COUNT(*) FROM me_gusta WHERE publicacion_id = p.id) as like_count,
                  (SELECT COUNT(*) FROM comentarios WHERE publicacion_id = p.id) as comment_count,
                  (SELECT COUNT(*) FROM publicaciones WHERE publicacion_original_id = p.id) as repost_count";

        if ($idUsuarioActual) {
            $query .= ", (SELECT COUNT(*) FROM me_gusta WHERE publicacion_id = p.id AND usuario_id = :id_usuario_actual) as is_liked";
        }

        $query .= " FROM " . $this->tabla . " p
                  JOIN usuarios u ON p.usuario_id = u.id
                  WHERE p.id = :id
                  LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        if ($idUsuarioActual) {
            $stmt->bindParam(':id_usuario_actual', $idUsuarioActual);
        }
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Obtiene todos los posts con datos del usuario y likes, con paginación
     */
    public function obtenerTodas($idUsuarioActual = null, $limite = 10, $desplazamiento = 0) {
        $query = "SELECT p.id, p.usuario_id as user_id, p.contenido as content, p.url_imagen as image_url, p.fecha_creacion as created_at,
                  p.publicacion_original_id,
                  u.nombre_usuario as username, u.avatar,
                  (SELECT COUNT(*) FROM me_gusta WHERE publicacion_id = p.id) as like_count,
                  (SELECT COUNT(*) FROM comentarios WHERE publicacion_id = p.id) as comment_count,
                  (SELECT COUNT(*) FROM publicaciones WHERE publicacion_original_id = p.id) as repost_count,
                  
                  -- Datos de la publicación original (si es repost)
                  orig.contenido as original_content,
                  orig.url_imagen as original_image,
                  orig.fecha_creacion as original_created_at,
                  u_orig.id as original_user_id,
                  u_orig.nombre_usuario as original_username,
                  u_orig.avatar as original_avatar";

        if ($idUsuarioActual) {
            $query .= ", (SELECT COUNT(*) FROM me_gusta WHERE publicacion_id = p.id AND usuario_id = :id_usuario_actual) as is_liked";
        }

        $query .= " FROM " . $this->tabla . " p
                  JOIN usuarios u ON p.usuario_id = u.id
                  LEFT JOIN publicaciones orig ON p.publicacion_original_id = orig.id
                  LEFT JOIN usuarios u_orig ON orig.usuario_id = u_orig.id
                  ORDER BY p.fecha_creacion DESC
                  LIMIT :limite OFFSET :desplazamiento";
        
        $stmt = $this->conn->prepare($query);
        if ($idUsuarioActual) {
            $stmt->bindParam(':id_usuario_actual', $idUsuarioActual);
        }
        $stmt->bindValue(':limite', (int)$limite, PDO::PARAM_INT);
        $stmt->bindValue(':desplazamiento', (int)$desplazamiento, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt;
    }

    /**
     * Obtiene los posts de un usuario específico
     */
    public function obtenerPorUsuario($usuarioId, $idUsuarioActual = null, $limite = 10, $desplazamiento = 0) {
        $query = "SELECT p.id, p.usuario_id as user_id, p.contenido as content, p.url_imagen as image_url, p.fecha_creacion as created_at,
                  p.publicacion_original_id,
                  u.nombre_usuario as username, u.avatar,
                  (SELECT COUNT(*) FROM me_gusta WHERE publicacion_id = p.id) as like_count,
                  (SELECT COUNT(*) FROM comentarios WHERE publicacion_id = p.id) as comment_count,
                  (SELECT COUNT(*) FROM publicaciones WHERE publicacion_original_id = p.id) as repost_count,
                  
                  -- Datos de la publicación original (si es repost)
                  orig.contenido as original_content,
                  orig.url_imagen as original_image,
                  orig.fecha_creacion as original_created_at,
                  u_orig.id as original_user_id,
                  u_orig.nombre_usuario as original_username,
                  u_orig.avatar as original_avatar";

        if ($idUsuarioActual) {
            $query .= ", (SELECT COUNT(*) FROM me_gusta WHERE publicacion_id = p.id AND usuario_id = :id_usuario_actual) as is_liked";
        }

        $query .= " FROM " . $this->tabla . " p
                  JOIN usuarios u ON p.usuario_id = u.id
                  LEFT JOIN publicaciones orig ON p.publicacion_original_id = orig.id
                  LEFT JOIN usuarios u_orig ON orig.usuario_id = u_orig.id
                  WHERE p.usuario_id = :usuario_id
                  ORDER BY p.fecha_creacion DESC
                  LIMIT :limite OFFSET :desplazamiento";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':usuario_id', $usuarioId, PDO::PARAM_INT);
        if ($idUsuarioActual) {
            $stmt->bindParam(':id_usuario_actual', $idUsuarioActual, PDO::PARAM_INT);
        }
        $stmt->bindValue(':limite', (int)$limite, PDO::PARAM_INT);
        $stmt->bindValue(':desplazamiento', (int)$desplazamiento, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt;
    }

    /**
     * Obtiene los últimos N comentarios de un post para previsualización
     */
    public function obtenerComentariosVistaPrevia($idPublicacion, $limite = 2) {
        $query = "SELECT c.id, c.contenido as content, c.fecha_creacion as created_at,
                  u.nombre_usuario as username, u.avatar 
                  FROM comentarios c
                  JOIN usuarios u ON c.usuario_id = u.id
                  WHERE c.publicacion_id = :publicacion_id
                  ORDER BY c.fecha_creacion DESC
                  LIMIT :limite";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':publicacion_id', $idPublicacion);
        $stmt->bindValue(':limite', $limite, PDO::PARAM_INT);
        $stmt->execute();
        // Invertimos para mostrar cronológicamente (el más viejo primero de los 2 últimos)
        return array_reverse($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    /**
     * Obtiene los comentarios de un post
     */
    public function obtenerComentarios($idPublicacion) {
        $query = "SELECT c.id, c.contenido as content, c.fecha_creacion as created_at,
                  u.nombre_usuario as username, u.avatar 
                  FROM comentarios c
                  JOIN usuarios u ON c.usuario_id = u.id
                  WHERE c.publicacion_id = :publicacion_id
                  ORDER BY c.fecha_creacion ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':publicacion_id', $idPublicacion);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Borra un post y su imagen asociada
     */
    public function eliminar($id, $usuarioId, $esAdmin = false) {
        // Verificar existencia y propiedad, y obtener URL de imagen
        $checkQuery = "SELECT usuario_id, url_imagen FROM " . $this->tabla . " WHERE id = :id";
        $checkStmt = $this->conn->prepare($checkQuery);
        $checkStmt->bindParam(':id', $id);
        $checkStmt->execute();
        $fila = $checkStmt->fetch(PDO::FETCH_ASSOC);

        if (!$fila) {
            return false; // Post no existe
        }
            
        // Validar permisos: si no es admin, debe ser el dueño
        if (!$esAdmin && $fila['usuario_id'] != $usuarioId) {
            return false;
        }

        // Borrar el archivo de imagen físico si existe
        if (!empty($fila['url_imagen'])) {
            // Construir ruta absoluta al archivo
            $rutaArchivo = __DIR__ . '/../../' . $fila['url_imagen'];
            
            if (file_exists($rutaArchivo)) {
                @unlink($rutaArchivo);
            }
        }

        // Borrar registro de la base de datos
        $query = "DELETE FROM " . $this->tabla . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    /**
     * Alternar Me Gusta (Dar/Quitar)
     * Retorna array con estado 'dado' (bool) y 'cantidad' (int) actualizada
     */
    public function alternarMeGusta($usuarioId, $publicacionId) {
        // Verificar si ya dio me gusta
        // Tabla: me_gusta (segun querys anteriores en readAll usaba 'me_gusta' pero en like.php original usaba 'likes'?)
        // Reviso detail.php: `FROM me_gusta WHERE publicacion_id`
        // Reviso like.php: `FROM likes WHERE user_id`
        // ¡INCONSISTENCIA! El código original tenía inconsistencias.
        // Voy a estandarizar a 'me_gusta' como tabla.
        
        // Primero verifico si 'me_gusta' es la tabla correcta. En Post.php (original y nuevo) usé 'me_gusta'.
        // Así que usaré 'me_gusta'.
        
        $checkQuery = "SELECT usuario_id FROM me_gusta WHERE usuario_id = :usuario_id AND publicacion_id = :publicacion_id";
        $stmt = $this->conn->prepare($checkQuery);
        $stmt->bindParam(':usuario_id', $usuarioId);
        $stmt->bindParam(':publicacion_id', $publicacionId);
        $stmt->execute();
        
        $dado = false;

        if ($stmt->rowCount() > 0) {
            // Quitar like
            $query = "DELETE FROM me_gusta WHERE usuario_id = :usuario_id AND publicacion_id = :publicacion_id";
            $dado = false;
        } else {
            // Dar like
            $query = "INSERT INTO me_gusta (usuario_id, publicacion_id) VALUES (:usuario_id, :publicacion_id)";
            $dado = true;
        }
        
        $updateStmt = $this->conn->prepare($query);
        $updateStmt->bindParam(':usuario_id', $usuarioId);
        $updateStmt->bindParam(':publicacion_id', $publicacionId);
        
        if ($updateStmt->execute()) {
            // Obtener nueva cuenta
            $countQuery = "SELECT COUNT(*) as cantidad FROM me_gusta WHERE publicacion_id = :publicacion_id";
            $countStmt = $this->conn->prepare($countQuery);
            $countStmt->bindParam(':publicacion_id', $publicacionId);
            $countStmt->execute();
            $cantidad = $countStmt->fetch(PDO::FETCH_ASSOC)['cantidad'];
            
            return ['dado' => $dado, 'cantidad' => $cantidad];
        }
        
        return false;
    }

    /**
     * Crear un comentario
     */
    public function comentar($usuarioId, $publicacionId, $contenido) {
        $query = "INSERT INTO comentarios (usuario_id, publicacion_id, contenido) VALUES (:usuario_id, :publicacion_id, :contenido)";
        $stmt = $this->conn->prepare($query);
        
        $contenido = htmlspecialchars(strip_tags($contenido));
        
        $stmt->bindParam(':usuario_id', $usuarioId);
        $stmt->bindParam(':publicacion_id', $publicacionId);
        $stmt->bindParam(':contenido', $contenido);
        
        return $stmt->execute();
    }

    /**
     * Republicar (Repost)
     */
    public function republicar($usuarioId, $publicacionOriginalId) {
        // Verificar existencia original
        $checkQuery = "SELECT id FROM " . $this->tabla . " WHERE id = :id";
        $stmt = $this->conn->prepare($checkQuery);
        $stmt->bindParam(':id', $publicacionOriginalId);
        $stmt->execute();
        
        if ($stmt->rowCount() == 0) return false;

        $query = "INSERT INTO " . $this->tabla . " (usuario_id, contenido, url_imagen, publicacion_original_id) VALUES (:usuario_id, '', NULL, :publicacion_original_id)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':usuario_id', $usuarioId);
        $stmt->bindParam(':publicacion_original_id', $publicacionOriginalId);
        
        return $stmt->execute();
    }
}
?>
