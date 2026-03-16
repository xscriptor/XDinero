<?php
// Incluir el middleware de seguridad para admins
require_once 'check_admin.php';
require_once __DIR__ . '/../../includes/models/Usuario.php';
require_once __DIR__ . '/../../config/db.php';

$database = new Database();
$conexion = $database->getConnection();

// Verificar método
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(["exito" => false, "mensaje" => "Método no permitido"]);
    exit;
}

// Obtener datos del cuerpo
$datos = json_decode(file_get_contents("php://input"));

if (!isset($datos->id)) {
    http_response_code(400);
    echo json_encode(["exito" => false, "mensaje" => "ID de usuario requerido"]);
    exit;
}

$idUsuarioEliminar = (int)$datos->id;

// Evitar que el admin se elimine a sí mismo
if ($idUsuarioEliminar == $_SESSION['user_id']) {
    http_response_code(400);
    echo json_encode(["exito" => false, "mensaje" => "No puedes eliminar tu propia cuenta desde aquí"]);
    exit;
}

try {
    // Verificar si el usuario existe
    $stmt = $conexion->prepare("SELECT id, rol FROM usuarios WHERE id = :id");
    $stmt->bindParam(':id', $idUsuarioEliminar);
    $stmt->execute();
    
    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(["exito" => false, "mensaje" => "Usuario no encontrado"]);
        exit;
    }

    // Eliminar usuario
    $deleteStmt = $conexion->prepare("DELETE FROM usuarios WHERE id = :id");
    $deleteStmt->bindParam(':id', $idUsuarioEliminar);
    
    if ($deleteStmt->execute()) {
        echo json_encode(["exito" => true, "mensaje" => "Usuario eliminado correctamente"]);
    } else {
        http_response_code(500);
        echo json_encode(["exito" => false, "mensaje" => "Error al eliminar usuario"]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["exito" => false, "mensaje" => "Error de base de datos: " . $e->getMessage()]);
}
?>
