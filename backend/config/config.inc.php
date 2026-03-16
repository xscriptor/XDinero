<?php
/**
 * Configuración global del proyecto XDinero.
 * Define constantes de conexión a la base de datos y rutas.
 * 
 * @author XScriptor
 */

// URL base del proyecto (ajustar según el dominio o localhost)
// Se obtiene de variable de entorno o usa valor por defecto para desarrollo local
define('BASE_URL', getenv('BASE_URL') ?: 'http://localhost:8000/backend');

// Credenciales de Base de Datos
// Se obtienen de variables de entorno inyectadas por Docker Compose
// Si no están definidas, usa valores por defecto (útil para desarrollo local sin docker si fuera necesario, aunque inseguro)
define('DB_HOST', getenv('DB_HOST') ?: 'db');
define('DB_NAME', getenv('DB_NAME') ?: 'xdinero_db');
define('DB_USER', getenv('DB_USER') ?: 'xdinero_user');
define('DB_PASS', getenv('DB_PASS') ?: 'xdinero_password');

// Configuración de zona horaria
date_default_timezone_set('Europe/Madrid');
?>
