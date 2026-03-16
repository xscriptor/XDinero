FROM php:8.2-apache

# Instalar extensiones necesarias para PDO MySQL
RUN docker-php-ext-install pdo pdo_mysql

# Habilitar mod_rewrite para URLs amigables si fuese necesario (opcional pero recomendado)
RUN a2enmod rewrite

# Ajustar permisos de uploads en cada arranque para evitar fallos en subidas
RUN set -eux; \
	cat > /usr/local/bin/backend-entrypoint << 'EOF'
#!/bin/sh
set -e

UPLOADS_DIR="/var/www/html/backend/uploads"
AVATARS_DIR="$UPLOADS_DIR/avatars"

mkdir -p "$AVATARS_DIR"
chown -R www-data:www-data "$UPLOADS_DIR"

# Directorios con escritura para el proceso web, ficheros sin bit de ejecución.
find "$UPLOADS_DIR" -type d -exec chmod 775 {} \;
find "$UPLOADS_DIR" -type f -exec chmod 664 {} \;

exec apache2-foreground
EOF

RUN chmod +x /usr/local/bin/backend-entrypoint

CMD ["/usr/local/bin/backend-entrypoint"]
