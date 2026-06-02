# SICOF — Sistema Integral de Control de Flotas

**Red Bus Santiago (Unidades de Servicio US4 y US6)**

SICOF es un sistema completo para el control operacional de flotas de transporte público. Cuenta con una arquitectura Orientada a Servicios (SOA) construida sobre **sockets TCP nativos** a través de un Bus de Servicios (ESB) central en Python, y un frontend moderno y responsivo desarrollado en **Next.js 16 + React 19 + Tailwind CSS v4 + TypeScript**, totalmente integrado con la capa de persistencia relacional.

---

## 🚀 Estado de la Implementación (Integración Completa)

A diferencia del prototipo visual inicial, el sistema se encuentra **100% integrado y funcional**:

- **Base de Datos**: Arquitectura dual — **SQLite** para desarrollo local sin dependencias y **PostgreSQL + TimescaleDB** para staging/producción. La selección de motor es automática mediante la variable de entorno `SICOF_USE_POSTGRES`. Las tablas de series temporales (`registro_gps`, `estado_carga`) se implementan como **hypertables** de TimescaleDB.
- **Backend SOA TCP**: 7 servicios autónomos escritos en Python communicados de forma exclusiva mediante sockets TCP nativos a través del BUS (`soa_bus.py`) en el puerto 5000.
- **Integración Frontend**: Las 18 pantallas del frontend consumen datos reales a través de Next.js API routes que actúan como puentes HTTP-to-TCP internos.
- **Control de Acceso**: Autenticación JWT simple y firma digital implementada sin librerías externas. Control de navegación protegido mediante un `AuthGuard` de React que restringe accesos según rol y terminal.
- **Resiliencia**: Mecanismo de fallback automático hacia datos mock locales si la capa de red del backend no está disponible.

---

## 🛠️ Arquitectura del Sistema

La topología de comunicación sigue un diseño desacoplado:

```
[ Navegador Web ]
       │
     (HTTP)
       ▼
[ Next.js API Route ] --(TCP Socket)--> [ Bus SOA (Puerto 5000) ] --(TCP Socket)--> [ Servicio Python ]
                                                                                           │
                                                                                           ▼
                                                                              ┌───────────────────────────────┐
                                                                              │ connection.py (fachada) │
                                                                              ├───────────────────────────────┤
                                                                              │ Dev   → SQLite          │
                                                                              │ Prod  → TimescaleDB    │
                                                                              └───────────────────────────────┘
```

### Protocolo de Intercambio TCP (Trama)

La comunicación a través del Bus de Servicios se realiza mediante tramas binarias de tres segmentos consecutivos:
`[LONGITUD (5 bytes)][SERVICIO (5 bytes)][PAYLOAD JSON]`

---

## 📂 Estructura del Proyecto

```
SICOF/
├── app/                        # Aplicación Next.js (App Router)
│   ├── admin/                  # Workspace Administrador TI (Usuarios, Permisos, Auditoría)
│   ├── api/                    # API Routes (Puentes HTTP a sockets TCP del BUS)
│   ├── cof/                    # Workspace Administrador COF (Frecuencia, KPIs, Terminales)
│   ├── login/                  # Pantalla de Inicio de Sesión premium
│   └── terminal/               # Workspace Despachador (Flota, Energía, Frecuencia, Incidentes)
├── backend/                    # Backend SOA en Python
│   ├── db/                     # Base de datos
│   │   ├── schema.sql          #   Esquema SQLite (desarrollo)
│   │   ├── seed.sql            #   Datos iniciales SQLite
│   │   ├── schema_pg.sql       #   Esquema PostgreSQL + TimescaleDB (producción)
│   │   ├── seed_pg.sql         #   Datos iniciales PostgreSQL
│   │   └── connection.py       #   Fachada de acceso: abstrae SQLite/PostgreSQL
│   ├── services/               # 7 Servicios de negocio (segur, flota, gpssv, carga, frecu, incid, repor)
│   ├── soa_bus.py              # Bus central TCP (Puerto 5000)
│   ├── start_services.py       # Script de arranque unificado (carga .env automáticamente)
│   └── test_soa.py             # Suite de 10 tests de integración de servicios
├── components/                 # Componentes React compartidos (AuthGuard, FloatingNavbar, UI panels)
├── docs/                       # Documentación técnica
│   └── informe-final/          # Informes finales (informe-final.md y servicios-soa.md)
├── lib/                        # Cliente TCP (soa-client.ts) y mock-data
└── package.json                # Dependencias del proyecto
```

---

## 📋 Prerequisitos

### Python

- **Versión mínima**: Python 3.8+
- **Probado con**: Python 3.14
- **Driver de BD**: `psycopg[binary]>=3.1` (psycopg**3**, NO psycopg2)

> [!IMPORTANT]
> **psycopg2 NO funciona en Python 3.14** — lanza `UnicodeDecodeError` al instalarse. El proyecto usa **psycopg3** (`psycopg[binary]`). Instalar las dependencias Python con:
>
> ```bash
> pip install -r requirements.txt
> ```

### Node.js

- **Versión mínima**: Node.js 18+
- Instalar dependencias con `npm install`

### Docker Desktop _(solo para modo PostgreSQL)_

- Requerido únicamente si quieres correr con **PostgreSQL + TimescaleDB**
- Si no tienes Docker, el sistema cae automáticamente a **SQLite** (sin configuración)

---

## ⚡ Guía de Inicio Rápido

SICOF detecta automáticamente qué motor de base de datos usar según el entorno.

### Modo Desarrollo — SQLite (sin dependencias externas)

No requiere Docker ni configuración adicional. El sistema usa una BD SQLite local:

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) en su navegador.

---

### Modo Producción/Staging — PostgreSQL + TimescaleDB

#### Prerequisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y corriendo
- Archivo `.env` en la raíz del proyecto (copiar desde `.env.example`)

#### 1. Configurar variables de entorno

```bash
copy .env.example .env
```

El `.env` ya viene con `SICOF_USE_POSTGRES=true` y las credenciales para el contenedor Docker.

#### 2. Levantar la base de datos

```bash
docker-compose up -d
```

Esto inicia un contenedor TimescaleDB en el puerto `5433`.

#### 3. Arrancar la aplicación

```bash
npm run dev
```

`start_services.py` carga el `.env` automáticamente e inicializa el esquema PostgreSQL si es la primera vez.

> **¿Cómo saber qué motor está activo?**
> La consola SOA mostrará al arrancar:
>
> - `[DB] Datos iniciales cargados en PostgreSQL` → modo PostgreSQL
> - `[DB] Base de datos SQLite lista` → modo SQLite

### Compilación de Producción (Verificación)

Para verificar la ausencia de errores de tipado TypeScript y optimizar el bundle:

```bash
npm run build
```

---

## 🧪 Pruebas y Evidencias

El sistema cuenta con una suite de pruebas de integración completa. Con los servicios corriendo, ejecute:

```bash
# Configura encoding UTF-8 para consolas de Windows
set PYTHONIOENCODING=utf-8
python backend/test_soa.py
```

_Esto validará 10/10 operaciones críticas del flujo (login, validación de token, consulta de flota, GPS, estado de carga, alertas de frecuencia, incidentes y KPIs)._

---

## 🛡️ Credenciales de Demostración

Para iniciar sesión en la plataforma, use la contraseña universal: **`sicof2026`**

- **Despachador (El Roble)**: `cpizarro`
- **Despachador (Colo Colo)**: `rmuñoz`
- **Administrador COF**: `pvera`
- **Administrador TI**: `imella` / `admin`

---

## 📄 Documentación Oficial de Entrega

Los informes finales y diagramas ER de la entrega se encuentran en:

- [Especificación de Servicios SOA](file:///c:/Users/sergi/Desktop/SICOF/docs/informe-final/servicios-soa.md)
- [Informe Final del Proyecto](file:///c:/Users/sergi/Desktop/SICOF/docs/informe-final/informe-final.md)
