#!/bin/bash

# 
# Script de Configuración de Permisos - XDinero
# 
# Es opcional pero lo escribí para asegurar que el servidor web (PHP/Apache dentro de Docker) pueda escribir
# imágenes en la carpeta 'uploads' SIN usar permisos inseguros 777.

# Obtener el directorio base del script para permitir ejecución desde cualquier ruta
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Calcular rutas
BACKEND_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"
UPLOADS_DIR="$BACKEND_DIR/uploads"
AVATARS_DIR="$UPLOADS_DIR/avatars"

echo "Configurando seguridad de XDinero Backend..."
echo "   Ruta detectada: $BACKEND_DIR"

# 1. Crear estructura de directorios y archivos
echo "Creando estructura de archivos..."

if [ ! -d "$UPLOADS_DIR" ]; then
    mkdir -p "$UPLOADS_DIR"
    echo " - Directorio 'uploads' creado."
fi

if [ ! -d "$AVATARS_DIR" ]; then
    mkdir -p "$AVATARS_DIR"
    echo " - Directorio 'uploads/avatars' creado."
fi

if [ ! -f "$UPLOADS_DIR/.gitkeep" ]; then
    touch "$UPLOADS_DIR/.gitkeep"
    echo " - Archivo .gitkeep creado."
fi

# 2. Configurar permisos seguros (Chown 33:33 + Chmod 755) RECURSIVAMENTE
# - UID 33: Usuario 'www-data' en contenedores Linux.
# - 755: Dueño (33) lee/escribe/ejecuta. Otros solo leen/ejecutan.

echo "Aplicando permisos de seguridad recursivos..."

if [ "$EUID" -ne 0 ]; then
    echo "   Requerido sudo para asignar UID 33..."
    sudo chown -R 33:33 "$UPLOADS_DIR"
    sudo chmod -R 755 "$UPLOADS_DIR"
else
    chown -R 33:33 "$UPLOADS_DIR"
    chmod -R 755 "$UPLOADS_DIR"
fi

if [ $? -eq 0 ]; then
    echo "Seguridad aplicada correctamente."
else
    echo "Error: No se pudieron cambiar los permisos."
    exit 1
fi

echo "Entorno configurado y seguro."
