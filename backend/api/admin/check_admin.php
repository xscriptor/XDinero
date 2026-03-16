<?php
// Middleware para proteger rutas de administración
require_once __DIR__ . '/../cors.php';

// Verificar si la sesión ya está iniciada
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

// Verificar si el usuario está logueado
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["exito" => false, "mensaje" => "No autorizado. Inicia sesión."]);
    exit;
}

// Verificar si el usuario tiene rol de administrador
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["exito" => false, "mensaje" => "Acceso denegado. Se requieren privilegios de administrador."]);
    exit;
}
?>
