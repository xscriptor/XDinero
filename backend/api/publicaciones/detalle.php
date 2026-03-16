<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../includes/models/Publicacion.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    $idUsuarioActual = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;

    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(["exito" => false, "mensaje" => "ID inválido"]);
        exit;
    }

    $publicacionModelo = new Publicacion();
    $publicacion = $publicacionModelo->obtenerPublicacionPorId($id, $idUsuarioActual);

    if ($publicacion) {
        $comentarios = $publicacionModelo->obtenerComentarios($id);
        
        echo json_encode([
            "exito" => true,
            "publicacion" => $publicacion,
            "comentarios" => $comentarios
        ]);
    } else {
        http_response_code(404);
        echo json_encode(["exito" => false, "mensaje" => "Publicación no encontrada"]);
    }
} else {
    http_response_code(405);
}
?>
