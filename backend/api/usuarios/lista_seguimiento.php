<?php
/**
 * LISTA_SEGUIMIENTO.PHP — API XDinero
 * Endpoint para gestionar la lista de seguimiento (watchlist) de criptomonedas
 * 
 * GET  ?id=X          → Obtener lista de seguimiento de un usuario
 * POST {simbolo: "x"} → Alternar (añadir/quitar) un símbolo en la lista
 */

require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../includes/models/Usuario.php';

$usuarioModelo = new Usuario();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Obtener lista de seguimiento de un usuario
    $idUsuario = isset($_GET['id']) ? intval($_GET['id']) : 0;

    if ($idUsuario <= 0) {
        http_response_code(400);
        echo json_encode(['exito' => false, 'mensaje' => 'ID de usuario inválido']);
        exit;
    }

    $lista = $usuarioModelo->obtenerListaSeguimiento($idUsuario);

    echo json_encode([
        'exito' => true,
        'lista' => $lista
    ]);

} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Alternar símbolo en la lista (requiere autenticación)
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['exito' => false, 'mensaje' => 'No autorizado']);
        exit;
    }

    $entrada = file_get_contents("php://input");
    $datos = json_decode($entrada);
    $simbolo = isset($datos->simbolo) ? trim($datos->simbolo) : '';

    if (empty($simbolo)) {
        http_response_code(400);
        echo json_encode(['exito' => false, 'mensaje' => 'Símbolo requerido']);
        exit;
    }

    $idUsuarioActual = $_SESSION['user_id'];
    $resultado = $usuarioModelo->alternarListaSeguimiento($idUsuarioActual, $simbolo);

    if ($resultado !== false) {
        $mensaje = $resultado['en_lista'] ? 'Añadido a la lista de seguimiento' : 'Eliminado de la lista de seguimiento';
        echo json_encode([
            'exito' => true,
            'mensaje' => $mensaje,
            'en_lista' => $resultado['en_lista'],
            'cantidad' => $resultado['cantidad']
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['exito' => false, 'mensaje' => 'Error al actualizar la lista de seguimiento']);
    }

} else {
    http_response_code(405);
    echo json_encode(['exito' => false, 'mensaje' => 'Método no permitido']);
}
?>
