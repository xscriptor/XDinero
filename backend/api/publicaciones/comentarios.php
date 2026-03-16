<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../includes/models/Publicacion.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $idPublicacion = isset($_GET['publicacion_id']) ? (int)$_GET['publicacion_id'] : 0;

    if ($idPublicacion <= 0) {
        http_response_code(400);
        echo json_encode(["exito" => false, "mensaje" => "ID de publicación inválido"]);
        exit;
    }

    try {
        $publicacionModelo = new Publicacion();
        $comentarios = $publicacionModelo->obtenerComentarios($idPublicacion);

        echo json_encode([
            "exito" => true,
            "comentarios" => $comentarios
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["exito" => false, "mensaje" => "Error al obtener comentarios"]);
    }
} else {
    http_response_code(405);
}
?>
