<?php
// Incluir el middleware de seguridad para admins
require_once 'check_admin.php';
require_once __DIR__ . '/../../config/db.php';

$database = new Database();
$conn = $database->getConnection();

// Verificar método
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(["exito" => false, "mensaje" => "Método no permitido"]);
    exit;
}

// Obtener datos del cuerpo
$data = json_decode(file_get_contents("php://input"));

if (!isset($data->id)) {
    http_response_code(400);
    echo json_encode(["exito" => false, "mensaje" => "ID de publicación requerido"]);
    exit;
}

$postId = (int)$data->id;

try {
    // Eliminar publicación
    // Las restricciones de clave foránea (ON DELETE CASCADE) se encargarán de borrar comentarios y likes asociados.
    $stmt = $conn->prepare("DELETE FROM publicaciones WHERE id = :id");
    $stmt->bindParam(':id', $postId);
    
    if ($stmt->execute()) {
        if ($stmt->rowCount() > 0) {
            echo json_encode(["exito" => true, "mensaje" => "Publicación eliminada correctamente"]);
        } else {
            http_response_code(404);
            echo json_encode(["exito" => false, "mensaje" => "Publicación no encontrada"]);
        }
    } else {
        http_response_code(500);
        echo json_encode(["exito" => false, "mensaje" => "Error al eliminar publicación"]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["exito" => false, "mensaje" => "Error de base de datos: " . $e->getMessage()]);
}
?>
