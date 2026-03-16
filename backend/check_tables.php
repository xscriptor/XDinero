<?php
require_once __DIR__ . '/config/db.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    echo "Conexión exitosa.\n";
    
    echo "Tablas en la base de datos:\n";
    $stmt = $db->query("SHOW TABLES");
    while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
        echo "- " . $row[0] . "\n";
        
        // Si la tabla parece de likes, mostramos columnas
        if (strpos($row[0], 'like') !== false || strpos($row[0], 'gusta') !== false) {
            echo "  Columnas de " . $row[0] . ":\n";
            $cols = $db->query("DESCRIBE " . $row[0]);
            while ($col = $cols->fetch(PDO::FETCH_ASSOC)) {
                echo "    - " . $col['Field'] . " (" . $col['Type'] . ")\n";
            }
        }
    }
    
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
