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
        echo json_encode(["exito" => false, "mensaje" => "ID de publicación inválido"]);
        exit;
    }

    $publicacionModelo = new Publicacion();
    $resultado = $publicacionModelo->alternarMeGusta($_SESSION['user_id'], $idPublicacion);

    if ($resultado !== false) {
        echo json_encode([
            "exito" => true,
            "dado" => $resultado['dado'],
            "cantidad" => $resultado['cantidad']
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["exito" => false, "mensaje" => "Error al procesar me gusta"]);
    }
} else {
    http_response_code(405);
}
?>
