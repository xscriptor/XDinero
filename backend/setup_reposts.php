<?php
require_once 'config/config.inc.php';
require_once 'config/db.php';

$db = new Database();
$conn = $db->getConnection();

try {
    // Check if column exists
    $stmt = $conn->query("SHOW COLUMNS FROM posts LIKE 'original_post_id'");
    $exists = $stmt->fetch();

    if (!$exists) {
        // Add original_post_id column
        $sql = "ALTER TABLE posts ADD COLUMN original_post_id INT DEFAULT NULL";
        $conn->exec($sql);
        echo "Columna 'original_post_id' agregada correctamente.<br>";
        
        // Add Foreign Key
        $sql = "ALTER TABLE posts ADD CONSTRAINT fk_original_post FOREIGN KEY (original_post_id) REFERENCES posts(id) ON DELETE SET NULL";
        $conn->exec($sql);
        echo "Clave foránea agregada.<br>";
    } else {
        echo "La columna 'original_post_id' ya existe.<br>";
    }
    
    echo "Base de datos actualizada. Puedes borrar este archivo.";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>