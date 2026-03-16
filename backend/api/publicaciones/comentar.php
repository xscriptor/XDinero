<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../includes/models/Publicacion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["exito" => false, "mensaje" => "No autorizado"]);
        exit;
    }

    $datos = json_decode(file_get_contents("php://input"));
    $idPublicacion = isset($datos->publicacion_id) ? (int)$datos->publicacion_id : 0;
    $contenido = isset($datos->contenido) ? trim($datos->contenido) : '';

    if ($idPublicacion <= 0 || empty($contenido)) {
        http_response_code(400);
        echo json_encode(["exito" => false, "mensaje" => "Datos inválidos"]);
        exit;
    }

    $publicacionModelo = new Publicacion();
    
    if ($publicacionModelo->comentar($_SESSION['user_id'], $idPublicacion, $contenido)) {
        echo json_encode([
            "exito" => true,
            "mensaje" => "Comentario publicado"
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["exito" => false, "mensaje" => "Error al publicar comentario"]);
    }
} else {
    http_response_code(405);
}
?>
