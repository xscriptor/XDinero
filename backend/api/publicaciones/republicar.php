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

    if ($idPublicacion <= 0) {
        http_response_code(400);
        echo json_encode(["exito" => false, "mensaje" => "ID inválido"]);
        exit;
    }

    $publicacionModelo = new Publicacion();

    if ($publicacionModelo->republicar($_SESSION['user_id'], $idPublicacion)) {
        echo json_encode([
            "exito" => true,
            "mensaje" => "Republicado con éxito"
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["exito" => false, "mensaje" => "Error al republicar"]);
    }
} else {
    http_response_code(405);
}
?>
