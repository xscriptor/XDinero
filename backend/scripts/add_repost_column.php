<?php
require_once '../config/config.inc.php';
require_once '../config/db.php';

$db = new Database();
$conn = $db->getConnection();

try {
    // Add original_post_id column
    $sql = "ALTER TABLE posts ADD COLUMN original_post_id INT DEFAULT NULL";
    $conn->exec($sql);
    echo "Column original_post_id added successfully.\n";
    
    // Add Foreign Key for integrity (optional but good)
    $sql = "ALTER TABLE posts ADD CONSTRAINT fk_original_post FOREIGN KEY (original_post_id) REFERENCES posts(id) ON DELETE SET NULL";
    $conn->exec($sql);
    echo "Foreign key added.\n";

} catch (PDOException $e) {
    echo "Error (might already exist): " . $e->getMessage() . "\n";
}
?>