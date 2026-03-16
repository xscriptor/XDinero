<?php
// Incluir el middleware de seguridad para admins
require_once 'check_admin.php';
require_once __DIR__ . '/../../config/db.php';

$database = new Database();
$conn = $database->getConnection();

// Paginación
$pagina = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limite = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
$offset = ($pagina - 1) * $limite;

// Búsqueda (opcional)
$busqueda = isset($_GET['search']) ? trim($_GET['search']) : '';

try {
    // 1. Obtener total de publicaciones para paginación
    $countQuery = "SELECT COUNT(*) as total FROM publicaciones p JOIN usuarios u ON p.usuario_id = u.id";
    if (!empty($busqueda)) {
        $countQuery .= " WHERE p.contenido LIKE :busqueda1 OR u.nombre_usuario LIKE :busqueda2";
    }
    
    $stmtCount = $conn->prepare($countQuery);
    if (!empty($busqueda)) {
        $terminoBusqueda = "%$busqueda%";
        $stmtCount->bindParam(':busqueda1', $terminoBusqueda);
        $stmtCount->bindParam(':busqueda2', $terminoBusqueda);
    }
    $stmtCount->execute();
    $totalPublicaciones = $stmtCount->fetch(PDO::FETCH_ASSOC)['total'];
    $totalPaginas = ceil($totalPublicaciones / $limite);

    // 2. Obtener lista de publicaciones
    // Incluimos datos del autor, contadores y si es repost (con datos del autor original)
    $query = "
        SELECT 
            p.id, 
            p.contenido, 
            p.url_imagen as imagen, -- Renombrado para consistencia frontend
            p.fecha_creacion,
            p.publicacion_original_id,
            u.id as usuario_id,
            u.nombre_usuario, 
            u.avatar,
            orig_u.nombre_usuario as autor_original,
            (SELECT COUNT(*) FROM me_gusta l WHERE l.publicacion_id = p.id) as likes,
            (SELECT COUNT(*) FROM comentarios c WHERE c.publicacion_id = p.id) as comentarios
        FROM publicaciones p
        JOIN usuarios u ON p.usuario_id = u.id
        LEFT JOIN publicaciones orig_p ON p.publicacion_original_id = orig_p.id
        LEFT JOIN usuarios orig_u ON orig_p.usuario_id = orig_u.id
    ";

    if (!empty($busqueda)) {
        $query .= " WHERE p.contenido LIKE :busqueda1 OR u.nombre_usuario LIKE :busqueda2";
    }

    $query .= " ORDER BY p.fecha_creacion DESC LIMIT :limite OFFSET :offset";

    $stmt = $conn->prepare($query);
    if (!empty($busqueda)) {
        $stmt->bindParam(':busqueda1', $terminoBusqueda);
        $stmt->bindParam(':busqueda2', $terminoBusqueda);
    }
    $stmt->bindParam(':limite', $limite, PDO::PARAM_INT);
    $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    
    $publicaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "exito" => true,
        "publicaciones" => $publicaciones,
        "total_paginas" => $totalPaginas,
        "pagina_actual" => $pagina,
        "total_publicaciones" => $totalPublicaciones
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["exito" => false, "mensaje" => "Error al obtener publicaciones: " . $e->getMessage()]);
}
?>
