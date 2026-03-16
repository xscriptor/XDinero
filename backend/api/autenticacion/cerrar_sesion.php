<?php
require_once __DIR__ . '/../cors.php';

session_unset();
session_destroy();

echo json_encode(["exito" => true, "mensaje" => "Sesión cerrada"]);
?>
