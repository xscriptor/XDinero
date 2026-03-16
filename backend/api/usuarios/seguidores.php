<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../includes/models/Usuario.php';

$usuarioModelo = new Usuario();
$idUsuario = isset($_GET['id']) ? intval($_GET['id']) : 0;
$tipo = isset($_GET['tipo']) ? $_GET['tipo'] : 'seguidores';

if ($idUsuario > 0) {
    $lista = [];
    
    if ($tipo === 'seguidos') {
        $lista = $usuarioModelo->obtenerSeguidos($idUsuario);
    } else {
        $lista = $usuarioModelo->obtenerSeguidores($idUsuario);
    }
    
    echo json_encode(['exito' => true, 'usuarios' => $lista]);
} else {
    http_response_code(400);
    echo json_encode(['exito' => false, 'mensaje' => 'ID de usuario inválido']);
}
?>
