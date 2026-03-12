# Aura Salud Familiar

Aura Salud Familiar es una aplicación integral diseñada para simplificar la gestión de la salud de toda la familia. Permite llevar un control detallado de historiales clínicos, esquemas de vacunación, consultas médicas, estudios de laboratorio y más.

## Características Principales

- **Perfiles Familiares:** Administra la información de cada miembro de la familia de forma individual.
- **Control de Vacunación:** Seguimiento de vacunas aplicadas y recordatorios de dosis pendientes.
- **Historial de Consultas:** Registro de citas médicas, diagnósticos, médicos tratantes y recetas.
- **Gestión de Estudios:** Almacena y organiza resultados de laboratorio e imagenología.
- **Directorio Médico:** Directorio personal de médicos, laboratorios y hospitales.
- **Reportes Clínicos:** Generación de resúmenes de salud listos para compartir.
- **Seguridad:** Sistema de autenticación con recuperación de contraseña por correo.
- **Modo Oscuro:** Interfaz moderna y adaptable.

## Requisitos Previos

- Node.js (v18 o superior)
- npm o yarn

## Instalación

1. Clona el repositorio:
   ```bash
   git clone <url-del-repositorio>
   cd aura
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura las variables de entorno:
   Copia el archivo `.env.example` a `.env` y completa los valores necesarios (especialmente `JWT_SECRET` y la configuración SMTP si deseas habilitar el envío de correos reales).

   ```bash
   cp .env.example .env
   ```

## Desarrollo

Para iniciar el servidor de desarrollo (Vite + Express):

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

## Construcción para Producción

Para generar la versión optimizada:

```bash
npm run build
```

Para iniciar el servidor en producción:

```bash
npm start
```

## Tecnologías Utilizadas

- **Frontend:** React, Tailwind CSS, Lucide React, Motion.
- **Backend:** Express, SQLite (better-sqlite3), JWT, Bcrypt.
- **Herramientas:** Vite, TypeScript.

## Licencia

Este proyecto está bajo la Licencia Apache 2.0.
