FROM php:8.2-apache

# Instalar extensiones necesarias para PDO MySQL
RUN docker-php-ext-install pdo pdo_mysql

# Habilitar mod_rewrite para URLs amigables si fuese necesario (opcional pero recomendado)
RUN a2enmod rewrite

# Copiar el código fuente al contenedor (opcional, si no usamos volúmenes en desarrollo)
# COPY . /var/www/html/

# Establecer permisos (opcional)
# RUN chown -R www-data:www-data /var/www/html
