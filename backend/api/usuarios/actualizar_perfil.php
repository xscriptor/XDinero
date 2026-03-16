<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../includes/models/Usuario.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["exito" => false, "mensaje" => "No autorizado"]);
        exit;
    }

    $idUsuario = $_SESSION['user_id'];
    $usuarioModelo = new Usuario();

    $nombreUsuario = isset($_POST['nombre_usuario']) ? $_POST['nombre_usuario'] : '';
    $correo = isset($_POST['correo']) ? $_POST['correo'] : '';
    $biografia = isset($_POST['biografia']) ? $_POST['biografia'] : '';
    $contrasenaActual = isset($_POST['contrasena_actual']) ? $_POST['contrasena_actual'] : '';
    $nuevaContrasena = isset($_POST['nueva_contrasena']) && !empty($_POST['nueva_contrasena']) ? $_POST['nueva_contrasena'] : null;

    if (empty($nombreUsuario) || empty($correo) || empty($contrasenaActual)) {
        http_response_code(400);
        echo json_encode(["exito" => false, "mensaje" => "Faltan datos obligatorios"]);
        exit;
    }

    $urlAvatar = null;
    $archivoAvatar = isset($_FILES['avatar']) ? $_FILES['avatar'] : null;

    if ($archivoAvatar && $archivoAvatar['error'] === UPLOAD_ERR_OK) {
        $directorioSubida = __DIR__ . '/../../uploads/avatars/';
        
        if (!file_exists($directorioSubida)) {
            @mkdir($directorioSubida, 0777, true);
        }

        $extension = pathinfo($archivoAvatar['name'], PATHINFO_EXTENSION);
        if (empty($extension)) $extension = 'jpg';
        
        $nombreArchivo = 'avatar_' . $idUsuario . '_' . time() . '.' . $extension;
        $rutaDestino = $directorioSubida . $nombreArchivo;

        if (@move_uploaded_file($archivoAvatar['tmp_name'], $rutaDestino)) {
            $urlAvatar = 'uploads/avatars/' . $nombreArchivo;
        } else {
            http_response_code(500);
            echo json_encode(["exito" => false, "mensaje" => "Error al subir la imagen de perfil"]);
            exit;
        }
    }

    $resultado = $usuarioModelo->actualizarPerfil($idUsuario, $nombreUsuario, $correo, $biografia, $contrasenaActual, $nuevaContrasena, $urlAvatar);

    if ($resultado === true) {
        $usuarioActualizado = $usuarioModelo->obtenerUsuarioPorId($idUsuario);
        
        echo json_encode([
            "exito" => true, 
            "mensaje" => "Perfil actualizado correctamente",
            "usuario" => $usuarioActualizado
        ]);
    } elseif ($resultado === "CONTRASENA_INVALIDA") {
        http_response_code(401);
        echo json_encode(["exito" => false, "mensaje" => "La contraseña actual es incorrecta"]);
    } elseif ($resultado === "DUPLICADO") {
        http_response_code(409);
        echo json_encode(["exito" => false, "mensaje" => "El nombre de usuario o correo ya está en uso"]);
    } else {
        http_response_code(500);
        echo json_encode(["exito" => false, "mensaje" => "Error interno al actualizar perfil"]);
    }

} else {
    http_response_code(405);
}
?>
