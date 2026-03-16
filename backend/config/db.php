<?php
require_once __DIR__ . '/config.inc.php';

/**
 * Clase Database
 * Maneja la conexión a la base de datos usando PDO.
 * Implementa el patrón Singleton para evitar múltiples conexiones.
 * 
 * @author XScriptor
 */
class Database {
    private $host = DB_HOST;
    private $db_name = DB_NAME;
    private $username = DB_USER;
    private $password = DB_PASS;
    public $conn;

    /**
     * Obtiene la conexión a la base de datos.
     * @return PDO|null Objeto de conexión o null si falla.
     */
    public function getConnection() {
        $this->conn = null;

        try {
            $dsn = "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];

            $this->conn = new PDO($dsn, $this->username, $this->password, $options);
        } catch(PDOException $exception) {
            // En producción, loguear el error en archivo y mostrar mensaje genérico
            error_log("Error de conexión: " . $exception->getMessage());
            echo "Error de conexión a la base de datos.";
        }

        return $this->conn;
    }
}
?>