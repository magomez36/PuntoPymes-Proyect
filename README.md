# TalentTrack

Sistema web para la gestión del talento humano, orientado a centralizar la información del personal y facilitar el control de usuarios, roles y accesos dentro de una organización.

---

## Descripción

TalentTrack surge como una solución a la gestión manual o fragmentada del talento humano, la cual suele generar desorganización, duplicidad de datos y riesgos de seguridad. El sistema permite administrar usuarios, roles y accesos mediante una plataforma web estructurada, segura y escalable.

---

## Problemática

En muchas organizaciones, la información del personal se gestiona mediante hojas de cálculo, documentos físicos u otras herramientas no integradas, lo que provoca inconsistencias en los datos, dificultad para actualizar la información, falta de control de accesos y riesgos en la confidencialidad. TalentTrack centraliza estos procesos en una única plataforma web.

---

## Objetivos

### Objetivo General
Desarrollar un sistema web que permita gestionar eficientemente la información del talento humano y el control de accesos.

### Objetivos Específicos
- Centralizar la información del personal  
- Gestionar usuarios, roles y permisos  
- Optimizar procesos internos  
- Garantizar la seguridad de la información  
- Ofrecer una interfaz clara y fácil de usar  

---

## Alcance

- Aplicación web (no móvil)  
- Usuarios internos: administradores, responsables de área y empleados  
- Gestión de usuarios, roles y permisos  
- Arquitectura preparada para futuras ampliaciones  

---

## Arquitectura del Sistema

El sistema sigue una arquitectura cliente-servidor organizada en tres capas:
- Frontend  
- Backend  
- Base de datos  

Esta separación mejora la mantenibilidad y escalabilidad del proyecto.

---

## Frontend

Desarrollado con React, siguiendo el enfoque de Single Page Application (SPA). La navegación entre vistas se gestiona mediante React Router DOM y la comunicación con el backend se realiza mediante Axios. La interfaz utiliza estilos personalizados y la librería Boxicons para la iconografía.

---

## Dependencias y Configuración del Frontend

Las dependencias del frontend se definen en el archivo `package.json`:
- React y React DOM  
- React Router DOM  
- Axios  
- Boxicons  
- React Scripts  
- Testing Library (DOM, React, Jest-DOM y User Event)  
- Web Vitals  

El proyecto incluye scripts para desarrollo, compilación y pruebas automatizadas, además de ESLint y Browserslist para garantizar compatibilidad con navegadores modernos.

---

## Diseño Tipográfico (Frontend)

El sistema implementa una estrategia tipográfica diferenciada:
- La fuente Inter se utiliza exclusivamente en el menú lateral (Sidebar), importada en `index.html` y aplicada mediante `sidebar.css`, con el objetivo de reforzar la identidad visual del sistema.
- El resto de la aplicación utiliza la fuente predeterminada del sistema operativo del usuario (System Font Stack), aplicada desde `global.css` o `index.css`, priorizando la legibilidad y el rendimiento.

---

## Backend

El backend fue desarrollado utilizando Django y Django REST Framework, permitiendo la construcción de una API REST organizada y segura. Esta capa procesa las solicitudes del frontend, valida datos, aplica reglas de negocio y gestiona la autenticación y autorización de usuarios mediante JSON Web Tokens (JWT).

---

## Dependencias del Backend

- Django  
- Django REST Framework  
- JSON Web Tokens (JWT)  
- psycopg2  
- Variables de entorno (dotenv)  

---

## Base de Datos

La base de datos utilizada es PostgreSQL. El acceso se realiza exclusivamente a través del backend utilizando el ORM de Django, garantizando la integridad, seguridad y consistencia de la información.

---

## Funcionalidades

- Gestión de usuarios  
- Asignación de roles y permisos  
- Control de accesos  
- Centralización de la información del talento humano  
- Protección de datos sensibles  

---

## Conclusiones

TalentTrack evidencia la importancia de centralizar la gestión del talento humano mediante sistemas web estructurados. La arquitectura empleada permite un desarrollo organizado, seguro y escalable, constituyéndose como una base sólida para futuras mejoras.

---

## Proyecto Académico

Desarrollado como parte de la carrera de Ciencias Computacionales, aplicando buenas prácticas de desarrollo web y arquitectura de software.

**Autores**

- Manuel Gómez
- Víctor Mendoza
- Juan Diego Villamagua
- David León

--- 
