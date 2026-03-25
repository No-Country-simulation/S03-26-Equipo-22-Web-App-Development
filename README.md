# Testimonial CMS

Aplicación web para gestión de testimonios con panel administrativo, autenticación por roles, analíticas y sistema de embebido para terceros.

El repositorio está dividido en dos apps principales:

- `web`: frontend en Next.js.
- `backend`: API en NestJS con PostgreSQL.

## Stack

- Frontend: Next.js 16, React 19, TypeScript
- Backend: NestJS 11, TypeORM, PostgreSQL
- Validación: `class-validator` + `class-transformer`
- Documentación API: Swagger
- Seguridad: JWT, Helmet, CORS, Throttling
- Media: Cloudinary
- Email: Resend

## Estructura del proyecto

```text
.
├── backend
│   ├── src
│   │   └── modules
│   │       ├── analytics
│   │       ├── auth
│   │       ├── categories
│   │       ├── config
│   │       ├── database
│   │       ├── email
│   │       ├── embed
│   │       ├── media
│   │       ├── moderation
│   │       ├── tags
│   │       ├── testimonials
│   │       └── users
│   └── test
└── web
    ├── app
    └── public
```

## Funcionalidades principales

- Login y autenticación con JWT
- Roles de usuario (`ADMIN`, `EDITOR`)
- Gestión de usuarios
- Gestión de categorías y tags
- Creación, edición, moderación y publicación de testimonios
- Carga de imágenes y manejo de media
- Invitaciones para completar testimonios
- Analytics por testimonial y métricas globales
- API pública para widgets embebidos con API Keys
- Documentación Swagger

## Requisitos

- Node.js 20 o superior
- `pnpm`
- PostgreSQL

## Instalación

Instalar dependencias del backend:

```bash
cd backend
pnpm install
```

Instalar dependencias del frontend:

```bash
cd web
pnpm install
```

## Variables de entorno

El backend usa variables de entorno para base de datos, JWT y servicios externos.

Variables mínimas requeridas:

```env
NODE_ENV=development
PORT=3001

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=testimonial_cms

JWT_SECRET=super-secret
JWT_EXPIRATION=7d
```

Variables opcionales usadas por el proyecto:

```env
JWT_REFRESH_SECRET=refresh-secret

FRONTEND_URL=http://localhost:3000

EMAIL_USER=
EMAIL_PASSWORD=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Nota: el proyecto también integra `Resend` y otras configuraciones de email/media. Si vas a probar flujos reales de correo o archivos, revisá las implementaciones en [email.service.ts](/home/linux/Documentos/Github/S03-26-Equipo-22-Web-App-Development/backend/src/modules/email/email.service.ts) y [media.service.ts](/home/linux/Documentos/Github/S03-26-Equipo-22-Web-App-Development/backend/src/modules/media/media.service.ts).

## Ejecutar en desarrollo

Backend:

```bash
cd backend
pnpm start:dev
```

Frontend:

```bash
cd web
pnpm dev
```

URLs locales por defecto:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`
- Swagger: `http://localhost:3001/api/docs`

## Scripts útiles

Backend:

```bash
pnpm build
pnpm start
pnpm start:dev
pnpm start:prod
pnpm test
pnpm test:e2e
pnpm lint
```

Frontend:

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
```

## Módulos del backend

- `auth`: login, refresh token, recuperación de contraseña, invitación de editores
- `users`: administración de usuarios y categorías asignadas
- `testimonials`: creación y ciclo de vida de testimonios
- `moderation`: revisión, aprobación y rechazo
- `categories`: categorías de testimonios
- `tags`: etiquetas
- `media`: subida y gestión de archivos
- `analytics`: registro de eventos y reportes
- `embed`: API keys y endpoints públicos para widgets embebidos

## Endpoints destacados

- `POST /auth/login`
- `GET /auth/profile`
- `POST /testimonials/invitations`
- `POST /testimonials/invitations/:token/complete`
- `POST /analytics`
- `GET /analytics/events`
- `GET /embed/testimonials`
- `GET /embed/script.js`

La referencia completa de endpoints está disponible en Swagger:

```text
/api/docs
```

## Seguridad y validaciones

- Validación global con `ValidationPipe`
- Sanitización por `whitelist`
- Rechazo de propiedades no permitidas con `forbidNonWhitelisted`
- Conversión automática de tipos en DTOs
- Protección HTTP con `helmet`
- CORS configurable
- Rate limiting con `@nestjs/throttler`

## Estado actual

Actualmente el backend compila correctamente con:

```bash
cd backend
pnpm build
```

## Posibles siguientes mejoras

- Agregar `.env.example` para backend y frontend
- Documentar flujo de base de datos y migraciones
- Documentar despliegue en Render/Vercel
- Agregar capturas del frontend
- Unificar README raíz con los README internos de `backend` y `web`

## Equipo

Proyecto desarrollado para el equipo `S03-26-Equipo-22-Web-App-Development`.
