<?php
// Incluir el middleware de seguridad para admins
require_once 'check_admin.php';
require_once __DIR__ . '/../../includes/models/Usuario.php';
require_once __DIR__ . '/../../config/db.php';

$database = new Database();
$conexion = $database->getConnection();

// Paginación
$pagina = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limite = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
$pagina = max(1, $pagina);
$limite = max(1, $limite);
$desplazamiento = ($pagina - 1) * $limite;

// Búsqueda (opcional)
$busqueda = isset($_GET['search']) ? trim($_GET['search']) : '';

try {
    // 1. Obtener total de usuarios para paginación
    $countQuery = "SELECT COUNT(*) as total FROM usuarios";
    if ($busqueda !== '') {
        $countQuery .= " WHERE nombre_usuario LIKE :busquedaNombre OR correo LIKE :busquedaCorreo";
    }

    $stmt = $conexion->prepare($countQuery);
    if ($busqueda !== '') {
        $terminoBusqueda = "%$busqueda%";
        $stmt->bindParam(':busquedaNombre', $terminoBusqueda, PDO::PARAM_STR);
        $stmt->bindParam(':busquedaCorreo', $terminoBusqueda, PDO::PARAM_STR);
    }
    $stmt->execute();

    $totalUsuarios = (int) $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    $totalPaginas = max(1, (int) ceil($totalUsuarios / $limite));

    if ($pagina > $totalPaginas) {
        $pagina = $totalPaginas;
        $desplazamiento = ($pagina - 1) * $limite;
    }

    // 2. Obtener lista de usuarios
    $consulta = "SELECT id, nombre_usuario, correo, rol, fecha_creacion, avatar FROM usuarios";
    if ($busqueda !== '') {
        $consulta .= " WHERE nombre_usuario LIKE :busquedaNombre OR correo LIKE :busquedaCorreo";
    }
    $consulta .= " ORDER BY fecha_creacion DESC LIMIT :limite OFFSET :desplazamiento";

    $stmt = $conexion->prepare($consulta);
    if ($busqueda !== '') {
        $stmt->bindParam(':busquedaNombre', $terminoBusqueda, PDO::PARAM_STR);
        $stmt->bindParam(':busquedaCorreo', $terminoBusqueda, PDO::PARAM_STR);
    }
    $stmt->bindParam(':limite', $limite, PDO::PARAM_INT);
    $stmt->bindParam(':desplazamiento', $desplazamiento, PDO::PARAM_INT);
    $stmt->execute();
    
    $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "exito" => true,
        "usuarios" => $usuarios,
        "total_paginas" => $totalPaginas,
        "pagina_actual" => $pagina,
        "total_usuarios" => $totalUsuarios,
        "busqueda" => $busqueda
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["exito" => false, "mensaje" => "Error al obtener usuarios: " . $e->getMessage()]);
}
?>
