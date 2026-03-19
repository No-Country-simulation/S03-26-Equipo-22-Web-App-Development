# Arquitectura de la plataforma

Este repositorio contiene los distintos servicios que conforman la plataforma.
La arquitectura está basada en **servicios separados por dominio** y un **Backend For Frontend (BFF)** para la aplicación web.

El objetivo de esta arquitectura es:

- Separar responsabilidades entre dominios.
- Permitir que distintos equipos trabajen en paralelo.
- Facilitar la escalabilidad del sistema.
- Mantener independencia tecnológica entre servicios.

---

# Repository Structure

```
apps/
 ├ web
 ├ auth-service
 └ testimonial-service
```

Cada proyecto tiene una responsabilidad específica dentro del sistema.

---

# 1. Web (Next.js)

**Ubicación**

```
/web
```

**Tecnología**

- Next.js
- App Router

**Rol en la arquitectura**

Este proyecto actúa como:

- **Frontend principal de la plataforma**
- **Backend For Frontend (BFF)**

El BFF funciona como una capa intermedia entre el frontend y los servicios internos.

**Responsabilidades**

- Renderizar la interfaz de usuario.
- Manejar la sesión del usuario.
- Consumir APIs internas.
- Componer datos provenientes de múltiples servicios.
- Simplificar la lógica del frontend.
- Widgets embebidos

**Importante**

El frontend **no consume directamente los microservicios**.
Todas las llamadas pasan por el BFF.

---

# 2. Auth Service

**Ubicación**

```
/auth-service
```

**Tecnología**

- NestJS
- Turborepo (monorepo interno)

**Rol en la arquitectura**

Este servicio es responsable de **identidad, autenticación y gestión de tenants**.

Centraliza toda la lógica relacionada con cuentas de usuario y acceso al sistema.

**Responsabilidades**

- Registro de usuarios
- Login
- Gestión de sesiones
- Autenticación
- Gestión de tenants
- Gestión de roles y permisos
- (Futuro) Suscripciones y billing

**Arquitectura interna**

El servicio utiliza una estructura basada en capas:

```
auth-service/
 ├ apps/
 │   └ web-api
 │
 └ packages/
     ├ domain
     ├ application
     └ infrastructure
```

### Packages

**Domain**

Contiene la lógica de negocio pura:

- Entidades
- Value Objects
- Reglas de negocio
- Interfaces de repositorios

No depende de ninguna tecnología externa.

---

**Application**

Contiene los **casos de uso** de la aplicación.

Ejemplos:

- RegisterUser
- LoginUser
- CreateTenant

Orquesta el dominio pero no implementa detalles técnicos.

---

**Infrastructure**

Implementaciones técnicas necesarias para ejecutar la aplicación.

Ejemplos:

- Repositorios de base de datos
- Integraciones externas
- Adaptadores de persistencia

---

### App

**web-api**

Aplicación NestJS que expone la API HTTP del servicio.

Es responsable de:

- Controladores
- DTOs
- Middleware
- Integración con las capas internas

---

# 3. Testimonial Service

**Ubicación**

```
/testimonial-service
```

**Tecnología**

- .NET 8
- ASP.NET Core

**Rol en la arquitectura**

Este servicio contiene el **dominio principal del producto**: la gestión de testimonios.

Se encarga de toda la lógica relacionada con:

- creación de testimonios
- almacenamiento
- procesamiento de archivos

---

**Responsabilidades**

- Creación y gestión de testimonios
- Subida de archivos
- Procesamiento de contenido (imágenes, videos, etc.)

---

**Arquitectura interna**

El servicio utiliza una arquitectura en capas basada en **Clean Architecture**.

```
testimonial-service/
 ├ Domain
 ├ Application
 ├ Infrastructure
 └ WebApi
```

### Domain

Contiene:

- Entidades
- Value Objects
- Reglas de negocio
- Interfaces de repositorios

No depende de frameworks.

---

### Application

Contiene:

- Casos de uso
- Servicios de aplicación
- Interfaces necesarias para ejecutar los flujos del sistema

---

### Infrastructure

Implementaciones técnicas como:

- Persistencia
- Integraciones externas
- Adaptadores

---

### WebApi

Aplicación ASP.NET Core que expone la API HTTP del servicio.

Responsable de:

- Controllers
- DTOs
- Middleware
- Configuración de dependencias

---

# Arquitectura General

La comunicación entre los componentes se realiza de la siguiente forma:

```
Browser
   │
   ▼
Next.js (BFF)
   │
   ├── Auth Service
   │
   └── Testimonial Service
```

El **BFF centraliza las llamadas a los servicios internos** y simplifica la interacción del frontend con el backend.

---

# Embedded Widgets

Los widgets de testimonios que se integran en sitios externos **no pasan por el BFF**.

Flujo:

```
Website cliente
       │
       ▼
BFF (Next.js)
       │
       ▼
Testimonial Service
```

---

# Guiding Principles

Este repositorio sigue los siguientes principios:

- Separación clara de dominios.
- Independencia entre servicios.
- Arquitectura basada en capas.
- Escalabilidad horizontal.
- Facilidad para trabajo en equipo.

---
