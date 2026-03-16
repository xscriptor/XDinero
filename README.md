<h1 align="center">XDinero</h1>
<p align="center">
  XD una red social orientada al ámbito financiero
</p>

Este repositorio está destinado a exponer el código fuente de la aplicación desarrollada para DAW.

## Pasos para la ejecución:

```bash

git clone https://www.github.com/xscriptor/XDinero
cd XDinero
docker-compose up -d --build

```

## Estructura del proyecto

```bash
/Xdinero
        /->backend #(todos los archivos del back php)
                  /-> scripts #(base de datos y seeed para pruebas más extensas)
        /->frontend #(todos los archivos del front: css js html etc)
                  /->css, img, javascript, archivos*.html
        /->nginx #(configuración de despliegue de servidor)
        ->.env #archivo de pruebas para las variables de entorno
        ->LICENSE # en continuación con el proyecto he añadido la que más se aproxima pero puede cambiar eventualmente.
        ->docker-compose.yml # archivo de configuración para el docker
        ->README.md #archivo de presentación del repositorio
```

## Limpieza y cierre del proyecto:

```bash

## para limpiar por completo:
docker-compose down -v --rmi all --remove-orphans

## Para cerrar únicamente:
docker-compose down

```


## **Notas**:

- He añadido un .env de prueba en el repositorio que puede ser descargado en lugar de ser creado para agilizar el despliegue.

- Puede que algunas rutas varíen según se requiera en el desarrollo del proyecto, algunos archivos pueden estar en diferentes carpetas e incluso puede que no todos los archivos se suban por cuestiones de seguridad y que sólo se expongan en la defensa del proyecto.

- Algunos archivos estarán en inglés siguiendo los estándares para la arquetectura de aplicaciones web.

<div align="center">
Documentación definitiva:
</div>
<div align="center">
<a href="https://github.com/xscriptor/XDinero/releases/download/Proyecto-XDinero-Documentaci%C3%B3n/Funcionalidad_detallada.pdf">
Funcionalidad detallada
</a>
</div>

<div align="center">
<a href="https://github.com/xscriptor/XDinero/releases/download/Proyecto-XDinero-Documentaci%C3%B3n/Guia.de.estilos.XDinero.pdf"> Guía de estilos - accesibilidad y usabilidad
</a>
</div>

<div align="center">
<a href="https://github.com/xscriptor/XDinero/releases/download/Proyecto-XDinero-Documentaci%C3%B3n/Proyecto.pdf">
Proyecto - manual de usuario y sustentación
</a>
</div>

<div align="center">

Enlaces de descarga de documentaciones boceto

<a href="https://github.com/xscriptor/XDinero/releases/download/anteproyecto/Guia.de.estilos.XDinero.pdf">Boceto sobre la guía de estilos</a> | <a href="https://github.com/xscriptor/XDinero/releases/download/anteproyecto/entidad-relacion.png">E.R.</a> | <a href="https://github.com/xscriptor/XDinero/releases/download/anteproyecto/modelo-relacional.png">M.R.</a>
</div>

<div align="center">
<a href="./LICENSE">Licencia</a>|<a href="https://github.com/xscriptor">Autor</a>
</div>