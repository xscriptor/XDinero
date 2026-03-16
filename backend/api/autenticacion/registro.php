<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../includes/models/Usuario.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $datos = json_decode(file_get_contents("php://input"));

    $nombreUsuario = $datos->nombre_usuario ?? null;
    $correo = $datos->correo ?? null;
    $contrasena = $datos->contrasena ?? null;

    if ($nombreUsuario && $correo && $contrasena) {
        $usuario = new Usuario();
        
        // Validación simple
        if (strlen($contrasena) < 6) {
             http_response_code(400);
             echo json_encode(["exito" => false, "mensaje" => "La contraseña debe tener al menos 6 caracteres"]);
             exit;
        }

        if ($usuario->registrar($nombreUsuario, $correo, $contrasena)) {
            echo json_encode([
                "exito" => true,
                "mensaje" => "Registro exitoso. Por favor inicia sesión."
            ]);
        } else {
            http_response_code(400);
            echo json_encode(["exito" => false, "mensaje" => "Error al registrar. El correo o usuario ya existe."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["exito" => false, "mensaje" => "Datos incompletos"]);
    }
} else {
    http_response_code(405);
}
?>
