<?php
require_once 'config/db.php';
$database = new Database();
$db = $database->getConnection();

$stmt = $db->query("SHOW TABLES");
$tables = $stmt->fetchAll(PDO::FETCH_COLUMN);

echo "Tablas en la base de datos:\n";
print_r($tables);

echo "\nEstructura de 'me_gusta' (si existe):\n";
if (in_array('me_gusta', $tables)) {
    $stmt = $db->query("DESCRIBE me_gusta");
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
} else {
    echo "La tabla 'me_gusta' NO existe.\n";
}

echo "\nEstructura de 'likes' (si existe):\n";
if (in_array('likes', $tables)) {
    $stmt = $db->query("DESCRIBE likes");
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
} else {
    echo "La tabla 'likes' NO existe.\n";
}
?>
