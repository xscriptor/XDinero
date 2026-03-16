<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../includes/models/Usuario.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['exito' => false, 'mensaje' => 'No autorizado']);
    exit;
}

$entrada = file_get_contents("php://input");
$datos = json_decode($entrada);

$idObjetivo = isset($datos->id_usuario) ? intval($datos->id_usuario) : 0;
$accion = isset($datos->accion) ? $datos->accion : 'seguir';

if ($idObjetivo > 0) {
    $usuarioModelo = new Usuario();
    $idUsuarioActual = $_SESSION['user_id'];
    
    if ($idUsuarioActual == $idObjetivo) {
        echo json_encode(['exito' => false, 'mensaje' => 'No puedes seguirte a ti mismo']);
        exit;
    }

    $resultado = false;
    $mensaje = "";

    if ($accion === 'seguir') {
        $resultado = $usuarioModelo->seguir($idUsuarioActual, $idObjetivo);
        $mensaje = "Usuario seguido";
    } else {
        $resultado = $usuarioModelo->dejarDeSeguir($idUsuarioActual, $idObjetivo);
        $mensaje = "Dejaste de seguir al usuario";
    }

    if ($resultado) {
        // Obtener estadísticas actualizadas del usuario objetivo
        $perfil = $usuarioModelo->obtenerUsuarioPorId($idObjetivo, $idUsuarioActual);
        
        echo json_encode([
            'exito' => true, 
            'mensaje' => $mensaje,
            'seguidores_count' => $perfil['seguidores_count'],
            'esta_siguiendo' => ($accion === 'seguir')
        ]);
    } else {
        echo json_encode(['exito' => false, 'mensaje' => 'Error al procesar la solicitud']);
    }
} else {
    echo json_encode(['exito' => false, 'mensaje' => 'ID inválido']);
}
?>
