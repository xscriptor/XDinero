<?php
/**
 * Funciones de utilidad general para XDinero.
 * Incluye helpers para sesiones, redirecciones y seguridad.
 * 
 * @author XScriptor
 */

// Iniciar sesión de forma segura si no está iniciada
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/**
 * Verifica si el usuario está logueado.
 * Si no lo está, redirige al login.
 */
function requerirInicioSesion() {
    if (!isset($_SESSION['user_id'])) {
        header('Location: ' . BASE_URL . '/iniciar-sesion');
        exit;
    }
}

/**
 * Verifica si el usuario ya está logueado.
 * Si lo está, redirige al home (para no ver login/register de nuevo).
 */
function requerirInvitado() {
    if (isset($_SESSION['user_id'])) {
        header('Location: ' . BASE_URL . '/');
        exit;
    }
}

/**
 * Retorna true si el usuario está logueado
 */
function estaLogueado() {
    return isset($_SESSION['user_id']);
}

/**
 * Sanitiza datos de entrada para prevenir XSS básico.
 * @param string $datos Datos a limpiar.
 * @return string Datos limpios.
 */
function limpiarEntrada($datos) {
    $datos = trim($datos);
    $datos = stripslashes($datos);
    $datos = htmlspecialchars($datos);
    return $datos;
}

/**
 * Obtiene la URL del avatar del usuario o el default.
 * @param string|null $nombreArchivoAvatar Nombre del archivo.
 * @return string URL completa.
 */
function obtenerUrlAvatar($nombreArchivoAvatar) {
    if (empty($nombreArchivoAvatar) || $nombreArchivoAvatar === 'default.svg') {
        return BASE_URL . '/img/usuario.svg'; // Fallback SVG
    }
    // Si contiene "uploads/avatars"
    if (strpos($nombreArchivoAvatar, 'uploads/avatars') !== false) {
        return BASE_URL . '/' . $nombreArchivoAvatar;
    }
    // Si es un archivo subido (avatar_ID_TIMESTAMP.jpg)
    return BASE_URL . '/uploads/avatars/' . $nombreArchivoAvatar;
}
?>
