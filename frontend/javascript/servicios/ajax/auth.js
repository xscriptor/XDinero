import XD from "@/componentes/ajax";

const Auth = {};

// Iniciar sesión
Auth.login = function(correo, contrasena) {
    return XD.request('/autenticacion/iniciar_sesion.php', 'POST', { correo, contrasena });
};

// Registro
Auth.register = function(nombre_usuario, correo, contrasena) {
    return XD.request('/autenticacion/registro.php', 'POST', { nombre_usuario, correo, contrasena });
};

// Cerrar sesión
Auth.logout = function() {
    return XD.request('/autenticacion/cerrar_sesion.php', 'POST');
};

export default Auth;
