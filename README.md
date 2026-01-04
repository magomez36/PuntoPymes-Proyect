# TalentTrack

TalentTrack es un sistema web orientado a la gestión del talento humano y a la administración de procesos internos dentro de una organización. El proyecto fue desarrollado como un trabajo académico de la carrera de Ciencias Computacionales de la Universidad Técnica Particular de Loja (UTPL).

## Descripción General

La correcta gestión del talento humano es un aspecto clave para el funcionamiento eficiente de cualquier organización. Sin embargo, en muchos casos estos procesos se realizan de manera manual o mediante herramientas poco integradas, lo que genera desorden, errores y dificultades en el acceso a la información.

TalentTrack surge como una solución web que permite centralizar la información del personal, gestionar usuarios, roles y permisos, y controlar el acceso a los datos de forma segura. El sistema está diseñado bajo una arquitectura moderna que separa claramente el frontend, el backend y la base de datos, facilitando su mantenimiento y futura escalabilidad.

## Objetivo del Proyecto

Desarrollar un sistema web que permita gestionar de manera eficiente la información y los procesos relacionados con el talento humano, optimizando la administración del personal, el control de accesos y la seguridad de los datos dentro de una organización.

## Alcance

- Plataforma web accesible desde navegadores.
- Gestión de usuarios internos (administradores, responsables de área y empleados).
- Asignación de roles y permisos.
- Control de accesos y seguridad de la información.
- Administración centralizada de datos del personal.

En esta fase del proyecto no se contempla el desarrollo de una aplicación móvil.

## Arquitectura del Sistema

TalentTrack utiliza una arquitectura web de tipo cliente–servidor, organizada en tres capas principales:

### Frontend
- Capa de presentación del sistema.
- Interfaz web intuitiva para la interacción con los usuarios.
- Envío de solicitudes al backend mediante HTTP.
- No tiene acceso directo a la base de datos.

### Backend
- Desarrollado con Django y Django REST Framework.
- Implementa la lógica de negocio del sistema.
- Gestiona autenticación y autorización mediante JWT.
- Controla roles, permisos y accesos.
- Único componente con acceso a la base de datos.

### Base de Datos
- PostgreSQL.
- Almacena usuarios, roles, permisos e información administrativa.
- Gestionada mediante el ORM de Django para garantizar integridad y seguridad.

## Tecnologías Utilizadas

### Backend
- Django
- Django REST Framework
- JWT (JSON Web Tokens)
- PostgreSQL

### Dependencias Principales
- Django==6.0
- djangorestframework==3.16.1
- djangorestframework_simplejwt==5.5.1
- django-cors-headers==4.9.0
- psycopg2-binary==2.9.11

## Funcionalidades Implementadas

- Gestión de usuarios.
- Asignación de roles y permisos.
- Control de accesos al sistema.
- Administración centralizada de información del talento humano.
- Seguridad en el manejo de datos.

## Conclusiones

TalentTrack demuestra la importancia de contar con sistemas centralizados y arquitecturas bien definidas para la gestión del talento humano. La solución desarrollada mejora la organización de los procesos internos, fortalece la seguridad de la información y permite una evolución futura del sistema.

Desde el punto de vista académico, el proyecto permitió aplicar conocimientos de análisis, diseño y desarrollo de software, consolidando competencias técnicas y profesionales mediante una solución real y funcional.

## Autores

- Manuel Gómez  
- Juan Villamagua  
- Víctor Mendoza  
- David León  

## Universidad

Universidad Técnica Particular de Loja (UTPL)  
Facultad de Ingeniería y Arquitectura  
Carrera de Ciencias Computacionales
