<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../includes/models/Publicacion.php';

$publicacionModelo = new Publicacion();
$idUsuarioActual = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $limite = isset($_GET['limite']) ? (int)$_GET['limite'] : 10;
    $desplazamiento = isset($_GET['desplazamiento']) ? (int)$_GET['desplazamiento'] : 0;
    $usuarioId = isset($_GET['usuario_id']) ? (int)$_GET['usuario_id'] : null;

    if ($usuarioId) {
        $stmt = $publicacionModelo->obtenerPorUsuario($usuarioId, $idUsuarioActual, $limite, $desplazamiento);
    } else {
        $stmt = $publicacionModelo->obtenerTodas($idUsuarioActual, $limite, $desplazamiento);
    }

    $publicaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        "exito" => true,
        "publicaciones" => $publicaciones,
        "tieneMas" => count($publicaciones) === $limite
    ]);

} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!$idUsuarioActual) {
        http_response_code(401);
        echo json_encode(["exito" => false, "mensaje" => "No autorizado"]);
        exit;
    }

    $contenido = isset($_POST['contenido']) ? $_POST['contenido'] : '';
    $urlImagen = null;

    // Manejo de subida de imagen
    $archivoImagen = isset($_FILES['imagen']) ? $_FILES['imagen'] : null;

    if ($archivoImagen && $archivoImagen['error'] === UPLOAD_ERR_OK) {
        $uploadDir = __DIR__ . '/../../uploads/';
        if (!file_exists($uploadDir)) mkdir($uploadDir, 0777, true);
        
        $nombreArchivo = uniqid() . '_' . basename($archivoImagen['name']);
        $rutaDestino = $uploadDir . $nombreArchivo;
        
        if (move_uploaded_file($archivoImagen['tmp_name'], $rutaDestino)) {
            $urlImagen = 'uploads/' . $nombreArchivo;
        }
    }

    if (empty($contenido) && empty($urlImagen)) {
        http_response_code(400);
        echo json_encode(["exito" => false, "mensaje" => "Contenido vacío"]);
        exit;
    }

    if ($publicacionModelo->crear($idUsuarioActual, $contenido, $urlImagen)) {
        echo json_encode(["exito" => true, "mensaje" => "Publicación creada"]);
    } else {
        http_response_code(500);
        echo json_encode(["exito" => false, "mensaje" => "Error al crear publicación"]);
    }
} else {
    http_response_code(405);
}
?>
