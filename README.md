# RescueLink

Plataforma **offline-first** para coordinación humanitaria durante desastres naturales.

## Estructura del proyecto

```
rescuelink/
├── api/          # Backend NestJS + Prisma + PostgreSQL
├── web/          # Frontend Next.js PWA
└── docker-compose.yml
```

**No es un monorepo.** Son dos aplicaciones independientes que comparten solo este repositorio y se despliegan por separado.

## Requisitos

- Node.js 20+
- Docker Desktop
- npm 10+

## Inicio rápido

### 1. Infraestructura

```bash
docker compose up -d
```

### 2. API

```bash
cd api
cp .env.example .env
npm install
npx prisma migrate dev
npm run start:dev
```

API: http://localhost:3001  
Swagger: http://localhost:3001/api/docs

### 3. Web

```bash
cd web
cp .env.example .env.local
npm install
npm run dev
```

Web: http://localhost:3000

## Arquitectura

- **Offline-first**: la app escribe primero en IndexedDB y sincroniza después.
- **Multi-país**: el país es un dato, no una condición del sistema.
- **Multi-emergencia**: cada desastre es una entidad independiente.

## Licencia

MIT — Open Source
