<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../includes/models/Usuario.php';

$usuarioModelo = new Usuario();
$idObjetivo = isset($_GET['id']) ? intval($_GET['id']) : 0;
$idUsuarioActual = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;

if ($idObjetivo > 0) {
    $perfil = $usuarioModelo->obtenerUsuarioPorId($idObjetivo, $idUsuarioActual);
    
    if ($perfil) {
        unset($perfil['password']); // Limpieza extra
        
        echo json_encode(['exito' => true, 'usuario' => $perfil]);
    } else {
        http_response_code(404);
        echo json_encode(['exito' => false, 'mensaje' => 'Usuario no encontrado']);
    }
} else {
    http_response_code(400);
    echo json_encode(['exito' => false, 'mensaje' => 'ID de usuario inválido']);
}
?>
