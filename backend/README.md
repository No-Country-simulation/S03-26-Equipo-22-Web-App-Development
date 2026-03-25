# Backend - Testimonial CMS API

API principal del proyecto, construida con NestJS, TypeORM y PostgreSQL.

Este servicio centraliza autenticación, usuarios, testimonios, categorías, tags, media, analytics y el sistema de embed para terceros.

## Qué resuelve este backend

- Autenticación con JWT para `ADMIN` y `EDITOR`
- Invitación de editores y setup de cuenta por token
- Gestión de usuarios y categorías asignadas
- Flujo completo de testimonios: creación, edición, revisión, publicación y despublicación
- Subida de imágenes a Cloudinary
- Registro de eventos analytics
- Endpoints públicos y administrativos para widgets embebidos
- Documentación automática con Swagger

## Stack

- NestJS 11
- TypeScript
- TypeORM
- PostgreSQL
- JWT + Passport
- `class-validator` + `class-transformer`
- Swagger
- Helmet
- `@nestjs/throttler`
- Cloudinary
- Resend

## Estructura

```text
backend/
├── src/
│   ├── app.module.ts
│   ├── main.ts
│   ├── modules/
│   │   ├── analytics/
│   │   ├── auth/
│   │   ├── categories/
│   │   ├── config/
│   │   ├── database/
│   │   ├── email/
│   │   ├── embed/
│   │   ├── media/
│   │   ├── moderation/
│   │   ├── tags/
│   │   ├── testimonials/
│   │   └── users/
│   └── types/
└── test/
```

## Módulos principales

- `auth`: login, refresh, logout, forgot/reset password, invitación de editores
- `users`: lectura, actualización y baja lógica/física de usuarios
- `testimonials`: invitaciones, carga pública por token, edición y publicación
- `categories`: catálogo de categorías
- `tags`: catálogo de tags
- `media`: subida y validación de archivos
- `analytics`: registro de eventos y reportes
- `embed`: API keys y endpoints públicos para widgets
- `email`: envío de correos transaccionales
- `database`: configuración de conexión y seed

## Flujo actual del sistema

### 1. Bootstrap inicial

1. El proyecto levanta con [main.ts](/home/linux/Documentos/Github/S03-26-Equipo-22-Web-App-Development/backend/src/main.ts).
2. Se cargan variables de entorno con `ConfigModule`.
3. Se validan variables con Joi desde [env.validation.ts](/home/linux/Documentos/Github/S03-26-Equipo-22-Web-App-Development/backend/src/modules/config/env.validation.ts).
4. Se habilitan `Helmet`, CORS, `ValidationPipe` global y Swagger.
5. La documentación queda disponible en `/api/docs`.

### 2. Flujo de autenticación

1. Un `ADMIN` puede crear o invitar editores desde `POST /auth/admin/invite-editor`.
2. El editor invitado completa su cuenta con `POST /auth/setup-account/:token`.
3. Tanto `ADMIN` como `EDITOR` inician sesión con `POST /auth/login`.
4. El frontend renueva sesión con `POST /auth/refresh`.
5. El perfil actual se obtiene con `GET /auth/profile`.

### 3. Flujo de testimonios

Hoy el flujo principal es este:

1. Un `EDITOR` crea una invitación con `POST /testimonials/invitations`.
2. El invitado completa el formulario público con `POST /testimonials/invitations/:token/complete`.
3. El testimonio queda en estado `DRAFT`.
4. El editor puede editarlo con `PATCH /testimonials/:id`.
5. El editor lo envía a revisión con `POST /testimonials/:id/submit`.
6. Un `ADMIN` lo aprueba o rechaza con `POST /testimonials/:id/moderate`.
7. Si está aprobado, un `ADMIN` lo publica con `POST /testimonials/:id/publish`.
8. Si hace falta retirarlo, puede despublicarlo con `POST /testimonials/:id/unpublish`.

También existe:

- `GET /testimonials/public` para obtener testimonios publicados
- `GET /testimonials/editor` para que el editor vea sus testimonios
- `DELETE /testimonials/:id` para eliminación administrativa

### 4. Flujo de analytics

1. El frontend o widget registra eventos públicos con `POST /analytics`.
2. Se guardan `view`, `like`, `share`, `click` y `embed_load`.
3. Un `ADMIN` puede consultar:
   - `GET /analytics/testimonial/:id/stats`
   - `GET /analytics/testimonial/:id/daily`
   - `GET /analytics/global`
   - `GET /analytics/events`

### 5. Flujo de embed

1. Un `ADMIN` crea API keys con `POST /embed/api-keys`.
2. Las keys pueden quedar ligadas a una categoría o ser globales.
3. Sitios externos consumen testimonios publicados con `GET /embed/testimonials` enviando `X-API-Key`.
4. También pueden cargar el script público desde `GET /embed/script.js`.

## Variables de entorno

Variables requeridas por validación:

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

Variables usadas por el backend que conviene definir:

```env
JWT_REFRESH_SECRET=refresh-secret

FRONTEND_URL=http://localhost:3000

EMAIL_USER=
EMAIL_PASSWORD=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

ADMIN_EMAIL=admin@test.com
ADMIN_PASSWORD=Password123!
```

## Instalación

```bash
pnpm install
```

## Ejecución local

```bash
pnpm start:dev
```

Por defecto:

- API local: `http://localhost:3001`
- Swagger: `http://localhost:3001/api/docs`

## Scripts disponibles

```bash
pnpm build
pnpm start
pnpm start:dev
pnpm start:debug
pnpm start:prod

pnpm test
pnpm test:watch
pnpm test:cov
pnpm test:e2e

pnpm lint
pnpm format

pnpm seed:admin
```

## Seed de administrador

El proyecto incluye un seed para crear el usuario administrador inicial:

```bash
pnpm seed:admin
```

Script: [seed-admin.ts](/home/linux/Documentos/Github/S03-26-Equipo-22-Web-App-Development/backend/src/modules/database/seeds/seed-admin.ts)

Usa estas variables si están disponibles:

```env
ADMIN_EMAIL=admin@test.com
ADMIN_PASSWORD=Password123!
```

Si el admin ya existe, el script no lo vuelve a crear.

## Seguridad y validación

- `ValidationPipe` global con `whitelist`, `forbidNonWhitelisted` y `transform`
- Guards de JWT y roles
- Throttling en endpoints sensibles
- CORS configurado desde [cors.config.ts](/home/linux/Documentos/Github/S03-26-Equipo-22-Web-App-Development/backend/src/modules/config/cors.config.ts)
- `Helmet` para headers de seguridad

## Endpoints importantes

### Auth

- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/profile`
- `POST /auth/admin/invite-editor`
- `POST /auth/setup-account/:token`

### Users

- `GET /users`
- `GET /users/:id`
- `PATCH /users/:id`
- `DELETE /users/:id`

### Testimonials

- `POST /testimonials/invitations`
- `POST /testimonials/invitations/:token/complete`
- `PATCH /testimonials/:id`
- `POST /testimonials/:id/submit`
- `POST /testimonials/:id/moderate`
- `POST /testimonials/:id/publish`
- `POST /testimonials/:id/unpublish`
- `GET /testimonials/public`
- `GET /testimonials/editor`

### Analytics

- `POST /analytics`
- `GET /analytics/global`
- `GET /analytics/events`
- `GET /analytics/testimonial/:id/stats`
- `GET /analytics/testimonial/:id/daily`

### Embed

- `POST /embed/api-keys`
- `GET /embed/api-keys`
- `DELETE /embed/api-keys/:id`
- `GET /embed/testimonials`
- `GET /embed/script.js`

## Documentación

Swagger está habilitado en:

```text
/api/docs
```

En desarrollo normalmente queda en:

```text
http://localhost:3001/api/docs
```

## Estado actual

- La compilación del backend pasa con `pnpm build`
- El proyecto ya usa validación con DTOs y `class-validator`
- El flujo operativo principal hoy pasa por `auth`, `testimonials`, `analytics` y `embed`

