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

if (!isset($datos->id) || !isset($datos->role)) {
    http_response_code(400);
    echo json_encode(["exito" => false, "mensaje" => "ID de usuario y rol requeridos"]);
    exit;
}

$idUsuarioActualizar = (int)$datos->id;
$nuevoRol = $datos->role;

// Validar roles permitidos
if (!in_array($nuevoRol, ['usuario', 'admin'])) {
    http_response_code(400);
    echo json_encode(["exito" => false, "mensaje" => "Rol inválido"]);
    exit;
}

// Evitar cambiar el propio rol para no perder acceso
if ($idUsuarioActualizar == $_SESSION['user_id']) {
    http_response_code(400);
    echo json_encode(["exito" => false, "mensaje" => "No puedes cambiar tu propio rol"]);
    exit;
}

try {
    // Verificar si el usuario existe
    $stmt = $conexion->prepare("SELECT id FROM usuarios WHERE id = :id");
    $stmt->bindParam(':id', $idUsuarioActualizar);
    $stmt->execute();
    
    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(["exito" => false, "mensaje" => "Usuario no encontrado"]);
        exit;
    }

    // Actualizar rol
    $updateStmt = $conexion->prepare("UPDATE usuarios SET rol = :rol WHERE id = :id");
    $updateStmt->bindParam(':rol', $nuevoRol);
    $updateStmt->bindParam(':id', $idUsuarioActualizar);
    
    if ($updateStmt->execute()) {
        echo json_encode(["exito" => true, "mensaje" => "Rol actualizado correctamente"]);
    } else {
        http_response_code(500);
        echo json_encode(["exito" => false, "mensaje" => "Error al actualizar rol"]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["exito" => false, "mensaje" => "Error de base de datos: " . $e->getMessage()]);
}
?>
