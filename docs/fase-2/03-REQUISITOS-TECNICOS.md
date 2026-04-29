# Requisitos Técnicos y Arquitectura (Fase 2)

Para soportar la carga funcional de la Fase 2, se propone la siguiente arquitectura técnica.

## 1. Stack Tecnológico Recomendado
- **Frontend**: Next.js (App Router) - *Mantenido de Fase 1*.
- **Backend/BaaS**: Supabase (PostgreSQL + Auth + Realtime). Proporciona persistencia y actualizaciones en tiempo real de forma nativa.
- **State Management**: React Context API para estados globales simples; TanStack Query (React Query) para sincronización de datos con el servidor.
- **Mapas**: MapLibre GL JS + Tilesets de Mapbox o Stadia Maps (para producción).

## 2. Definición de API (Contratos de Servicio)
Se deben implementar los siguientes endpoints (conceptuales):

### `GET /api/fleet`
Retorna el estado actual de toda la flota, incluyendo posición y SoC.
- Soporta filtros por terminal y estado del bus.

### `POST /api/incidents`
Permite reportar un nuevo incidente desde el workspace de Terminal.
- Payload: `id_bus`, `tipo_incidente`, `descripcion`, `lat/lng`.

### `GET /api/operations/summary`
Retorna los KPIs agregados para el dashboard del COF.
- Métricas: Cumplimiento de salidas, buses en ruta, alertas activas.

## 3. Estrategia de Tiempo Real
- **Postgres Changes**: Suscripción a cambios en la tabla `bus_locations` para mover los pines en el mapa de forma fluida.
- **Broadcast**: Canal de mensajería rápida para alertas críticas que deben aparecer instantáneamente en la navbar del jefe COF.

## 4. Seguridad y Roles
Implementar RLS (*Row Level Security*) en la base de datos para asegurar que:
- Un despachador solo pueda ver/editar datos de **su terminal**.
- El jefe COF tenga acceso de lectura **global**.
- El admin TI sea el único capaz de modificar la **tabla de usuarios**.

## 5. Pruebas y Validación
- **Unit Testing**: Vitest para lógica de negocio y utilidades.
- **E2E Testing**: Playwright para flujos críticos (Login -> Despacho -> Registro incidente).
