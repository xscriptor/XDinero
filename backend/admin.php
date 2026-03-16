<?php
require_once 'includes/header.php';
requireLogin();

// Seguridad: Solo admin
if ($_SESSION['role'] !== 'admin') {
    header('Location: home.php');
    exit;
}

$db = new Database();
$conn = $db->getConnection();

// Obtener todos los usuarios
// Tabla: usuarios, Campos: id, nombre_usuario, rol, fecha_creacion
$users = $conn->query("SELECT id, nombre_usuario as username, rol as role FROM usuarios ORDER BY fecha_creacion DESC")->fetchAll();

// Obtener últimos posts
// Tabla: publicaciones, usuarios
// Campos: p.id, p.contenido, p.fecha_creacion, u.nombre_usuario
$posts = $conn->query("SELECT p.id, p.contenido as content, p.fecha_creacion as created_at, u.nombre_usuario as username FROM publicaciones p JOIN usuarios u ON p.usuario_id = u.id ORDER BY p.fecha_creacion DESC LIMIT 20")->fetchAll();
?>

<div class="max-w-6xl mx-auto">
    <h1 class="text-3xl font-bold mb-8">Panel de Administración</h1>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Gestión de Usuarios -->
        <div class="xd-card">
            <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
                <img src="assets/img/user.svg" class="w-6 h-6"> Usuarios Registrados
            </h2>
            <div class="overflow-x-auto">
                <table class="w-full text-sm text-left">
                    <thead class="border-b border-border-color">
                        <tr>
                            <th class="py-2">ID</th>
                            <th class="py-2">Usuario</th>
                            <th class="py-2">Rol</th>
                            <th class="py-2">Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($users as $u): ?>
                        <tr class="border-b border-border-color last:border-0">
                            <td class="py-3">#<?php echo $u['id']; ?></td>
                            <td class="py-3"><?php echo htmlspecialchars($u['username']); ?></td>
                            <td class="py-3">
                                <span class="<?php echo $u['role'] === 'admin' ? 'text-red-500 font-bold' : ''; ?>">
                                    <?php echo $u['role']; ?>
                                </span>
                            </td>
                            <td class="py-3">
                                <?php if ($u['id'] != $_SESSION['user_id']): // No borrarse a sí mismo ?>
                                    <a href="#" class="text-red-500 hover:underline" onclick="return XD.openDeleteModal('api/publicaciones/eliminar.php?id=<?php echo $u['id']; ?>', '¿Borrar usuario y sus posts?')">Eliminar</a>
                                <?php endif; ?>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Gestión de Posts -->
        <div class="xd-card">
            <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
                <img src="assets/img/chart.svg" class="w-6 h-6"> Últimos Posts
            </h2>
            <div class="space-y-4">
                <?php foreach ($posts as $p): ?>
                <div class="border-b border-border-color pb-4 last:border-0">
                    <div class="flex justify-between items-start mb-1">
                        <span class="font-bold text-sm">@<?php echo htmlspecialchars($p['username']); ?></span>
                        <span class="text-xs text-gray-500"><?php echo date('d/m H:i', strtotime($p['created_at'])); ?></span>
                    </div>
                    <p class="text-sm truncate"><?php echo htmlspecialchars($p['content']); ?></p>
                    <a href="#" class="text-red-500 text-xs hover:underline block mt-1" onclick="return XD.openDeleteModal('api/publicaciones/eliminar.php?id=<?php echo $p['id']; ?>', '¿Borrar post?')">Eliminar Post</a>
                </div>
                <?php endforeach; ?>
            </div>
        </div>
    </div>
</div>

<?php require_once 'includes/footer.php'; ?>