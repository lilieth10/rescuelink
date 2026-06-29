# Arquitectura RescueLink

## ¿Por qué NO es un monorepo?

Usamos **dos aplicaciones independientes** en un solo repositorio Git:

| Carpeta | Stack | Puerto | Despliegue |
|---------|-------|--------|------------|
| `api/`  | NestJS + Prisma + PostgreSQL | 3001 | Railway / VPS |
| `web/`  | Next.js PWA + Dexie.js | 3000 | Vercel / Cloudflare |

**Ventajas:**
- Cada app tiene su propio `package.json`, build y despliegue
- Sin complejidad de Turborepo/Nx
- Un gobierno puede desplegar solo la API; una ONG solo el frontend
- Ideal para portafolio: demuestras full-stack con separación real

## Capas (backend)

```
Presentation   → Controllers, DTOs, Guards
Application    → Services, use cases
Domain         → Prisma models, enums, reglas de negocio
Infrastructure → Prisma, Redis, BullMQ (futuro)
Persistence    → PostgreSQL
Synchronization → sync_queue, endpoints de reconciliación
```

## Capas (frontend)

```
Presentation   → Pages, components (React)
Application    → Hooks, TanStack Query
Domain         → Zod schemas, tipos
Infrastructure → API client, Dexie (IndexedDB)
Synchronization → sync-queue, background sync (futuro)
```

## Modelo geográfico

```
Country → Region → Municipality → City → Shelter / Hospital
```

El país es un **dato**, no una condición del código.

## Emergencias

Cada desastre (`Emergency`) agrupa:
- Personas desaparecidas
- Personas encontradas
- Niños protegidos
- Refugios
- Hospitales

## Offline-first

```
Usuario → PWA → IndexedDB → Cola sync → API → PostgreSQL
```

La app **siempre escribe primero en el dispositivo**.

## Próximos pasos (Semana 2)

1. Auth JWT + roles
2. CRUD Emergencias
3. Seed de países/regiones
4. Módulo Personas Desaparecidas
