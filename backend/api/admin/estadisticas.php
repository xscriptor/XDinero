<?php
// Incluir el middleware de seguridad para admins
require_once 'check_admin.php';
require_once __DIR__ . '/../../includes/models/Usuario.php';
require_once __DIR__ . '/../../config/db.php';

// Conexión directa para consultas de estadísticas globales
$database = new Database();
$conexion = $database->getConnection();

try {
    // 1. Métricas Globales
    $stmt = $conexion->query("SELECT COUNT(*) as total FROM usuarios");
    $totalUsuarios = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

    $stmt = $conexion->query("SELECT COUNT(*) as total FROM usuarios WHERE DATE(fecha_creacion) = CURDATE()");
    $nuevosUsuariosHoy = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

    $stmt = $conexion->query("SELECT COUNT(*) as total FROM publicaciones");
    $totalPublicaciones = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

    $stmt = $conexion->query("SELECT COUNT(*) as total FROM comentarios");
    $totalComentarios = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

    $stmt = $conexion->query("SELECT COUNT(*) as total FROM me_gusta");
    $totalMeGusta = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

    // 2. Gráfico: Actividad últimos 7 días (Usuarios y Publicaciones)
    $graficoActividad = [];
    for ($i = 6; $i >= 0; $i--) {
        $fecha = date('Y-m-d', strtotime("-$i days"));
        
        // Usuarios registrados ese día
        $stmtUsuario = $conexion->prepare("SELECT COUNT(*) as total FROM usuarios WHERE DATE(fecha_creacion) = :fecha");
        $stmtUsuario->bindParam(':fecha', $fecha);
        $stmtUsuario->execute();
        $conteoUsuarios = $stmtUsuario->fetch(PDO::FETCH_ASSOC)['total'];

        // Publicaciones creadas ese día
        $stmtPublicacion = $conexion->prepare("SELECT COUNT(*) as total FROM publicaciones WHERE DATE(fecha_creacion) = :fecha");
        $stmtPublicacion->bindParam(':fecha', $fecha);
        $stmtPublicacion->execute();
        $conteoPublicaciones = $stmtPublicacion->fetch(PDO::FETCH_ASSOC)['total'];

        $graficoActividad[] = [
            'dia' => date('d/m', strtotime($fecha)),
            'usuarios' => (int)$conteoUsuarios,
            'publicaciones' => (int)$conteoPublicaciones
        ];
    }

    // 3. Top 5 Usuarios más activos (por cantidad de publicaciones)
    $stmtTopUsuarios = $conexion->query("
        SELECT u.id, u.nombre_usuario, u.avatar, COUNT(p.id) as total_publicaciones 
        FROM usuarios u 
        JOIN publicaciones p ON u.id = p.usuario_id 
        GROUP BY u.id 
        ORDER BY total_publicaciones DESC 
        LIMIT 5
    ");
    $topUsuarios = $stmtTopUsuarios->fetchAll(PDO::FETCH_ASSOC);

    // 4. Top 5 Publicaciones con más me gusta
    $stmtTopPublicaciones = $conexion->query("
        SELECT p.id, p.contenido, p.url_imagen, u.nombre_usuario, COUNT(l.usuario_id) as total_likes
        FROM publicaciones p
        JOIN usuarios u ON p.usuario_id = u.id
        LEFT JOIN me_gusta l ON p.id = l.publicacion_id
        GROUP BY p.id
        ORDER BY total_likes DESC
        LIMIT 5
    ");
    $topPublicaciones = $stmtTopPublicaciones->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "exito" => true,
        "total_usuarios" => (int)$totalUsuarios,
        "total_publicaciones" => (int)$totalPublicaciones,
        "total_comentarios" => (int)$totalComentarios,
        "total_likes" => (int)$totalMeGusta,
        "nuevos_hoy" => (int)$nuevosUsuariosHoy,
        "actividad_semanal" => $graficoActividad,
        "top_usuarios" => $topUsuarios,
        "top_publicaciones" => $topPublicaciones
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["exito" => false, "mensaje" => "Error al obtener estadísticas: " . $e->getMessage()]);
}
?>
