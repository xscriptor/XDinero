<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../includes/models/Usuario.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $datos = json_decode(file_get_contents("php://input"));

    $correo = $datos->correo ?? null;
    $contrasena = $datos->contrasena ?? null;

    if ($correo && $contrasena) {
        $usuario = new Usuario();
        $usuarioLogueado = $usuario->iniciarSesion($correo, $contrasena);

        if ($usuarioLogueado) {
            $_SESSION['user_id'] = $usuarioLogueado['id'];
            $_SESSION['username'] = $usuarioLogueado['nombre_usuario'];
            $_SESSION['role'] = $usuarioLogueado['rol'];
            $_SESSION['avatar'] = $usuarioLogueado['avatar'];

            echo json_encode([
                "exito" => true,
                "mensaje" => "Inicio de sesión exitoso",
                "usuario" => $usuarioLogueado
            ]);
        } else {
            http_response_code(401);
            echo json_encode(["exito" => false, "mensaje" => "Credenciales inválidas"]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["exito" => false, "mensaje" => "Datos incompletos"]);
    }
} else {
    http_response_code(405);
    echo json_encode(["exito" => false, "mensaje" => "Método no permitido"]);
}
?>
