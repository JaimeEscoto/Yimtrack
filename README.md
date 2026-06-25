# Yimtrack — MVP

Red social de entrenamiento. Next.js 14 (App Router) + TypeScript + Tailwind, Drizzle ORM y Neon Postgres. Desplegable en Render como un único Web Service.

## Funcionalidad MVP

- Registro / login con username, email, password (JWT en cookie httpOnly).
- **Propuesta diaria**: elige foco (tren superior, inferior, push, pull, full, mixto, core, cardio) + duración (15–75 min) → el generador devuelve una secuencia de ejercicios ajustada al tiempo.
- **Sesión guiada**: marca sets, reps y peso por ejercicio; cronómetro de la sesión.
- **Historial** de sesiones.
- **Logros** automáticos (primera sesión, racha de días, número de sesiones por foco, etc.).
- **Gimnasio**: registrar, buscar, asignar el principal.
- **Contactos**: buscar usuarios por username, enviar/aceptar solicitudes.
- **Perfil público** por username con estadísticas y logros.

## Setup local

```bash
cp .env.example .env
# rellena DATABASE_URL (Neon) y AUTH_SECRET (32+ bytes random)
npm install
npm run db:push      # crea las tablas en Neon
npm run db:seed      # inserta catálogo de ejercicios y logros
npm run dev
```

## Deploy

### 1) Neon
1. Crea un proyecto en https://neon.tech.
2. Crea branches `main` (prod) y `dev` (opcional).
3. Copia el connection string `postgres://...?sslmode=require`.

### 2) Render
1. Conecta este repo en https://render.com.
2. Render detecta `render.yaml` y crea el servicio.
3. En **Environment**, pega `DATABASE_URL` (Neon prod).
4. `AUTH_SECRET` se autogenera.
5. Primer deploy: tras que termine, ejecuta una vez en Shell de Render:
   ```bash
   npm run db:push && npm run db:seed
   ```

## Estructura

```
src/
  app/
    (app)/                 → rutas autenticadas (dashboard, workout, history, gym, contacts, achievements, profile)
    login/, register/      → auth
    api/                   → route handlers
  db/                      → schema Drizzle + cliente + seed
  lib/                     → auth, validation, workout-generator, achievements
```

## Próximos pasos

- Feed social con actividad de contactos
- Rutinas guardadas (templates reusables)
- Foto de perfil (Cloudinary)
- Push web para recordatorios
- Equipo disponible por gimnasio → filtrar generador
