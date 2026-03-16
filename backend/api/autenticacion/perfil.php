<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../includes/models/Usuario.php';

if (isset($_SESSION['user_id'])) {
    $usuarioModelo = new Usuario();
    $datosUsuario = $usuarioModelo->obtenerUsuarioPorId($_SESSION['user_id']);
    
    if ($datosUsuario) {
        echo json_encode([
            "exito" => true,
            "usuario" => $datosUsuario
        ]);
    } else {
        session_destroy();
        http_response_code(401);
        echo json_encode(["exito" => false, "mensaje" => "Usuario no encontrado"]);
    }
} else {
    echo json_encode(["exito" => false, "usuario" => null]);
}
?>
