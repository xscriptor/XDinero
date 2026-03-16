<?php
require_once __DIR__ . '/../../config/db.php';

class Usuario
{
    private $conn;
    private $tabla = 'usuarios';

    public function __construct()
    {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    /**
     * Registra un nuevo usuario
     */
    public function registrar($nombreUsuario, $correo, $contrasena)
    {
        // Verificar duplicados antes de insertar
        $checkQuery = "SELECT id FROM " . $this->tabla . " WHERE nombre_usuario = :nombre_usuario OR correo = :correo";
        $checkStmt = $this->conn->prepare($checkQuery);
        $checkStmt->bindParam(':nombre_usuario', $nombreUsuario);
        $checkStmt->bindParam(':correo', $correo);
        $checkStmt->execute();

        if ($checkStmt->rowCount() > 0) {
            return false;
        }

        $query = "INSERT INTO " . $this->tabla . " (nombre_usuario, correo, contrasena) VALUES (:nombre_usuario, :correo, :contrasena)";
        $stmt = $this->conn->prepare($query);

        $nombreUsuario = htmlspecialchars(strip_tags($nombreUsuario));
        $correo = htmlspecialchars(strip_tags($correo));
        $hashContrasena = password_hash($contrasena, PASSWORD_BCRYPT);

        $stmt->bindParam(':nombre_usuario', $nombreUsuario);
        $stmt->bindParam(':correo', $correo);
        $stmt->bindParam(':contrasena', $hashContrasena);

        try {
            if ($stmt->execute()) {
                return true;
            }
        } catch (PDOException $e) {
            return false;
        }
        return false;
    }

    /**
     * Iniciar sesión de usuario
     */
    public function iniciarSesion($correo, $contrasena)
    {
        $query = "SELECT id, nombre_usuario, contrasena, rol, avatar FROM " . $this->tabla . " WHERE correo = :correo LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':correo', $correo);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $fila = $stmt->fetch(PDO::FETCH_ASSOC);
            if (password_verify($contrasena, $fila['contrasena'])) {
                unset($fila['contrasena']);
                return $fila;
            }
        }
        return false;
    }

    /**
     * Obtener datos de un usuario por ID con estadísticas
     */
    public function obtenerUsuarioPorId($id, $idUsuarioActual = null)
    {
        $query = "SELECT 
                    u.id, 
                    u.nombre_usuario, 
                    u.correo, 
                    u.rol, 
                    u.avatar, 
                    u.biografia, 
                    u.fecha_creacion,
                    (SELECT COUNT(*) FROM publicaciones p WHERE p.usuario_id = u.id) as publicaciones_count,
                    (SELECT COUNT(*) FROM seguidores s WHERE s.seguido_id = u.id) as seguidores_count,
                    (SELECT COUNT(*) FROM seguidores s WHERE s.seguidor_id = u.id) as seguidos_count,
                    (SELECT COUNT(*) FROM lista_seguimiento ls WHERE ls.usuario_id = u.id) as watchlist_count";
        
        if ($idUsuarioActual) {
            $query .= ", (SELECT COUNT(*) FROM seguidores s WHERE s.seguidor_id = :idUsuarioActual AND s.seguido_id = u.id) as is_following";
        }

        $query .= " FROM " . $this->tabla . " u WHERE u.id = :id LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        if ($idUsuarioActual) {
            $stmt->bindParam(':idUsuarioActual', $idUsuarioActual);
        }
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Verificar si un usuario sigue a otro
     */
    public function estaSiguiendo($idSeguidor, $idSeguido) {
        $query = "SELECT 1 FROM seguidores WHERE seguidor_id = :idSeguidor AND seguido_id = :idSeguido";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':idSeguidor', $idSeguidor);
        $stmt->bindParam(':idSeguido', $idSeguido);
        $stmt->execute();
        return $stmt->rowCount() > 0;
    }

    /**
     * Seguir a un usuario
     */
    public function seguir($idSeguidor, $idSeguido) {
        if ($idSeguidor == $idSeguido) return false;
        
        // Verificar si ya lo sigue
        if ($this->estaSiguiendo($idSeguidor, $idSeguido)) return true;
        
        $query = "INSERT INTO seguidores (seguidor_id, seguido_id) VALUES (:idSeguidor, :idSeguido)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':idSeguidor', $idSeguidor);
        $stmt->bindParam(':idSeguido', $idSeguido);
        return $stmt->execute();
    }

    /**
     * Dejar de seguir a un usuario
     */
    public function dejarDeSeguir($idSeguidor, $idSeguido) {
        $query = "DELETE FROM seguidores WHERE seguidor_id = :idSeguidor AND seguido_id = :idSeguido";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':idSeguidor', $idSeguidor);
        $stmt->bindParam(':idSeguido', $idSeguido);
        return $stmt->execute();
    }

    /**
     * Obtener lista de seguidores
     */
    public function obtenerSeguidores($usuarioId) {
        $query = "SELECT u.id, u.nombre_usuario as username, u.avatar 
                  FROM seguidores s
                  JOIN usuarios u ON s.seguidor_id = u.id
                  WHERE s.seguido_id = :usuarioId";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':usuarioId', $usuarioId);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Obtener lista de seguidos
     */
    public function obtenerSeguidos($usuarioId) {
        $query = "SELECT u.id, u.nombre_usuario as username, u.avatar 
                  FROM seguidores s
                  JOIN usuarios u ON s.seguido_id = u.id
                  WHERE s.seguidor_id = :usuarioId";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':usuarioId', $usuarioId);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Actualizar perfil con seguridad y avatar
     */
    public function actualizarPerfil($id, $nombreUsuario, $correo, $biografia, $contrasenaActual, $nuevaContrasena = null, $urlAvatar = null)
    {
        // 1. Verificar contraseña actual
        $query = "SELECT contrasena, avatar FROM " . $this->tabla . " WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$usuario || !password_verify($contrasenaActual, $usuario['contrasena'])) {
            return "CONTRASENA_INVALIDA";
        }

        // 2. Verificar duplicados (username/email) en otros usuarios
        $checkQuery = "SELECT id FROM " . $this->tabla . " WHERE (nombre_usuario = :nombre_usuario OR correo = :correo) AND id != :id";
        $checkStmt = $this->conn->prepare($checkQuery);
        $checkStmt->bindParam(':nombre_usuario', $nombreUsuario);
        $checkStmt->bindParam(':correo', $correo);
        $checkStmt->bindParam(':id', $id);
        $checkStmt->execute();

        if ($checkStmt->rowCount() > 0) {
            return "DUPLICADO";
        }

        // 3. Manejo de Avatar (Eliminar anterior si hay uno nuevo)
        if ($urlAvatar && !empty($usuario['avatar']) && $usuario['avatar'] !== 'uploads/avatars/default.svg' && $usuario['avatar'] !== 'default.svg') {
            // Borrar avatar anterior si no es el default y es un archivo local
            $rutaAvatarAnterior = __DIR__ . '/../../' . $usuario['avatar'];
            if (file_exists($rutaAvatarAnterior)) {
                @unlink($rutaAvatarAnterior);
            }
        }

        // 4. Actualizar datos
        $query = "UPDATE " . $this->tabla . " SET nombre_usuario = :nombre_usuario, correo = :correo, biografia = :biografia";

        if ($nuevaContrasena) {
            $query .= ", contrasena = :nueva_contrasena";
        }
        if ($urlAvatar) {
            $query .= ", avatar = :avatar";
        }

        $query .= " WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        $nombreUsuario = htmlspecialchars(strip_tags($nombreUsuario));
        $correo = htmlspecialchars(strip_tags($correo));
        $biografia = htmlspecialchars(strip_tags($biografia));

        $stmt->bindParam(':nombre_usuario', $nombreUsuario);
        $stmt->bindParam(':correo', $correo);
        $stmt->bindParam(':biografia', $biografia);
        $stmt->bindParam(':id', $id);

        if ($nuevaContrasena) {
            $hashNuevaContrasena = password_hash($nuevaContrasena, PASSWORD_BCRYPT);
            $stmt->bindParam(':nueva_contrasena', $hashNuevaContrasena);
        }
        if ($urlAvatar) {
            $stmt->bindParam(':avatar', $urlAvatar);
        }

        return $stmt->execute();
    }

    // 
    // LISTA DE SEGUIMIENTO (Watchlist)
    // 

    /**
     * Verificar si un símbolo ya está en la lista de seguimiento del usuario
     */
    public function estaEnListaSeguimiento($usuarioId, $simbolo) {
        $query = "SELECT id FROM lista_seguimiento WHERE usuario_id = :usuario_id AND simbolo = :simbolo";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':usuario_id', $usuarioId, PDO::PARAM_INT);
        $stmt->bindParam(':simbolo', $simbolo);
        $stmt->execute();
        return $stmt->rowCount() > 0;
    }

    /**
     * Alternar símbolo en la lista de seguimiento (añadir/quitar)
     * Retorna array con estado 'en_lista' (bool) y 'cantidad' (int)
     */
    public function alternarListaSeguimiento($usuarioId, $simbolo) {
        $simbolo = htmlspecialchars(strip_tags(trim($simbolo)));

        if ($this->estaEnListaSeguimiento($usuarioId, $simbolo)) {
            // Quitar de la lista
            $query = "DELETE FROM lista_seguimiento WHERE usuario_id = :usuario_id AND simbolo = :simbolo";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':usuario_id', $usuarioId, PDO::PARAM_INT);
            $stmt->bindParam(':simbolo', $simbolo);
            $stmt->execute();
            $enLista = false;
        } else {
            // Añadir a la lista
            $query = "INSERT INTO lista_seguimiento (usuario_id, simbolo) VALUES (:usuario_id, :simbolo)";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':usuario_id', $usuarioId, PDO::PARAM_INT);
            $stmt->bindParam(':simbolo', $simbolo);
            $stmt->execute();
            $enLista = true;
        }

        // Obtener cantidad actualizada
        $countQuery = "SELECT COUNT(*) as cantidad FROM lista_seguimiento WHERE usuario_id = :usuario_id";
        $countStmt = $this->conn->prepare($countQuery);
        $countStmt->bindParam(':usuario_id', $usuarioId, PDO::PARAM_INT);
        $countStmt->execute();
        $cantidad = $countStmt->fetch(PDO::FETCH_ASSOC)['cantidad'];

        return ['en_lista' => $enLista, 'cantidad' => (int)$cantidad];
    }

    /**
     * Obtener lista de seguimiento de un usuario (símbolos)
     */
    public function obtenerListaSeguimiento($usuarioId) {
        $query = "SELECT id, simbolo FROM lista_seguimiento WHERE usuario_id = :usuario_id ORDER BY id DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':usuario_id', $usuarioId, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>
