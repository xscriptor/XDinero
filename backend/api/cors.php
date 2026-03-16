<?php
// Permitir solicitudes desde cualquier origen (o especificar el de Next.js: http://localhost:3000)
// Nota: Cuando se usa Credentials: true, Access-Control-Allow-Origin NO puede ser '*'

// Obtener el origen de la solicitud
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

// Lista de orígenes permitidos (Ajustar para producción)
$allowed_origins = [
    'http://localhost:3000',
    'http://localhost',
    'http://127.0.0.1:3000',
    'http://127.0.0.1'
];

// En desarrollo, permitimos el origen que viene en la petición si no está vacío
// En producción, deberías validar contra $allowed_origins
if (!empty($origin)) {
   header("Access-Control-Allow-Origin: $origin");
} else {
   // Fallback para herramientas como Postman o si no hay origen
   header("Access-Control-Allow-Origin: http://localhost:3000");
}

header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Configuración segura de sesión para cookies entre dominios
// Importante: Para que funcione en localhost entre puertos distintos, a veces se requiere ajuste de cookies.
// Pero por defecto PHPSESSID funciona si no se fuerza samesite strict.
session_set_cookie_params([
    'samesite' => 'Lax', 
    'path' => '/',
    // 'domain' => 'localhost', // Opcional, a veces ayuda en dev
    'secure' => false, // False para HTTP local
    'httponly' => true
]);

// Iniciar sesión si no está iniciada
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}
?>
