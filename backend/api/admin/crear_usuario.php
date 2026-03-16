<?php
// Incluir el middleware de seguridad para admins
require_once 'check_admin.php';
require_once __DIR__ . '/../../includes/models/Usuario.php';
require_once __DIR__ . '/../../config/db.php';

$database = new Database();
$conexion = $database->getConnection();

// Verificar método
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["exito" => false, "mensaje" => "Método no permitido"]);
    exit;
}

// Obtener datos del cuerpo
$datos = json_decode(file_get_contents("php://input"));

if (empty($datos->nombre_usuario) || empty($datos->correo) || empty($datos->contrasena)) {
    http_response_code(400);
    echo json_encode(["exito" => false, "mensaje" => "Todos los campos son obligatorios"]);
    exit;
}

$usuarioModelo = new Usuario();

// Usar el método registrar del modelo Usuario
if ($usuarioModelo->registrar($datos->nombre_usuario, $datos->correo, $datos->contrasena)) {
    // Si se creó, podemos actualizar el rol si se envió
    if (isset($datos->rol) && $datos->rol === 'admin') {
        // Buscar el usuario recién creado por email para actualizar su rol
        $stmt = $conexion->prepare("UPDATE usuarios SET rol = 'admin' WHERE correo = :correo");
        $stmt->bindParam(':correo', $datos->correo);
        $stmt->execute();
    }

    echo json_encode(["exito" => true, "mensaje" => "Usuario creado exitosamente"]);
} else {
    http_response_code(400);
    echo json_encode(["exito" => false, "mensaje" => "Error al crear usuario. Verifica que el correo o usuario no existan."]);
}
?>
