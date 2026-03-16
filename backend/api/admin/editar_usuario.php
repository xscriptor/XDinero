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

if (empty($datos->id) || empty($datos->nombre_usuario) || empty($datos->correo)) {
    http_response_code(400);
    echo json_encode(["exito" => false, "mensaje" => "ID, usuario y correo son obligatorios"]);
    exit;
}

$idUsuario = (int)$datos->id;
$nombreUsuario = trim($datos->nombre_usuario);
$correo = trim($datos->correo);
$contrasena = isset($datos->contrasena) && $datos->contrasena !== '' ? trim($datos->contrasena) : null;

try {
    // Verificar si el usuario existe
    $stmt = $conexion->prepare("SELECT id FROM usuarios WHERE id = :id");
    $stmt->bindParam(':id', $idUsuario);
    $stmt->execute();

    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(["exito" => false, "mensaje" => "Usuario no encontrado"]);
        exit;
    }

    // Verificar si el nuevo username o email ya existen en otro usuario
    $checkStmt = $conexion->prepare("SELECT id FROM usuarios WHERE (nombre_usuario = :nombre_usuario OR correo = :correo) AND id != :id");
    $checkStmt->bindParam(':nombre_usuario', $nombreUsuario);
    $checkStmt->bindParam(':correo', $correo);
    $checkStmt->bindParam(':id', $idUsuario);
    $checkStmt->execute();

    if ($checkStmt->rowCount() > 0) {
        http_response_code(409);
        echo json_encode(["exito" => false, "mensaje" => "El nombre de usuario o correo ya están en uso por otro usuario"]);
        exit;
    }

    // Construir consulta de actualización dinámica
    $sql = "UPDATE usuarios SET nombre_usuario = :nombre_usuario, correo = :correo";
    
    // Si se envió contraseña, añadirla a la actualización
    if (!empty($contrasena)) {
        $sql .= ", contrasena = :contrasena";
    }
    
    $sql .= " WHERE id = :id";

    $updateStmt = $conexion->prepare($sql);
    $updateStmt->bindParam(':nombre_usuario', $nombreUsuario);
    $updateStmt->bindParam(':correo', $correo);
    $updateStmt->bindParam(':id', $idUsuario);

    if (!empty($contrasena)) {
        // Hashear contraseña
        $hashContrasena = password_hash($contrasena, PASSWORD_BCRYPT);
        $updateStmt->bindParam(':contrasena', $hashContrasena);
    }

    if ($updateStmt->execute()) {
        echo json_encode(["exito" => true, "mensaje" => "Usuario actualizado correctamente"]);
    } else {
        http_response_code(500);
        echo json_encode(["exito" => false, "mensaje" => "Error al actualizar usuario"]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["exito" => false, "mensaje" => "Error de base de datos: " . $e->getMessage()]);
}
?>
