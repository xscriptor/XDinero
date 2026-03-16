<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../includes/models/Publicacion.php';

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $datos = json_decode(file_get_contents("php://input"));
    $id = isset($datos->id) ? (int)$datos->id : 0;
    $idUsuarioActual = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;
    $esAdmin = isset($_SESSION['role']) && $_SESSION['role'] === 'admin';

    if (!$idUsuarioActual) {
        http_response_code(401);
        echo json_encode(["exito" => false, "mensaje" => "No autorizado"]);
        exit;
    }

    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(["exito" => false, "mensaje" => "ID inválido"]);
        exit;
    }

    $publicacionModelo = new Publicacion();
    if ($publicacionModelo->eliminar($id, $idUsuarioActual, $esAdmin)) {
        echo json_encode(["exito" => true, "mensaje" => "Publicación eliminada"]);
    } else {
        http_response_code(403); 
        echo json_encode(["exito" => false, "mensaje" => "No se pudo eliminar la publicación"]);
    }
} else {
    http_response_code(405);
}
?>
