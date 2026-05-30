# SICOF — Sistema Integral de Control de Flotas
**Red Bus Santiago (Unidades de Servicio US4 y US6)**

SICOF es un sistema completo para el control operacional de flotas de transporte público. Cuenta con una arquitectura Orientada a Servicios (SOA) construida sobre **sockets TCP nativos** a través de un Bus de Servicios (ESB) central en Python, y un frontend moderno y responsivo desarrollado en **Next.js 16 + React 19 + Tailwind CSS v4 + TypeScript**, totalmente integrado con la capa de persistencia relacional.

---

## 🚀 Estado de la Implementación (Integración Completa)

A diferencia del prototipo visual inicial, el sistema se encuentra **100% integrado y funcional**:
* **Base de Datos**: Esquema relacional robusto en SQLite con 9 tablas, integridad referencial (FK), llaves únicas, índices de desempeño y semillas de datos operacionales coherentes.
* **Backend SOA TCP**: 7 servicios autónomos escritos en Python communicados de forma exclusiva mediante sockets TCP nativos a través del BUS (`soa_bus.py`) en el puerto 5000.
* **Integración Frontend**: Las 18 pantallas del frontend consumen datos reales a través de Next.js API routes que actúan como puentes HTTP-to-TCP internos.
* **Control de Acceso**: Autenticación JWT simple y firma digital implementada sin librerías externas. Control de navegación protegido mediante un `AuthGuard` de React que restringe accesos según rol y terminal.
* **Resiliencia**: Mecanismo de fallback automático hacia datos mock locales si la capa de red del backend no está disponible.

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
                                                                                   [ SQLite DB ]
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
│   ├── db/                     # Base de datos (schema.sql, seed.sql, connection.py)
│   ├── services/               # 7 Servicios de negocio (segur, flota, gpssv, carga, frecu, incid, repor)
│   ├── soa_bus.py              # Bus central TCP (Puerto 5000)
│   ├── start_services.py       # Script de arranque unificado
│   └── test_soa.py             # Suite de 10 tests de integración de servicios
├── components/                 # Componentes React compartidos (AuthGuard, FloatingNavbar, UI panels)
├── docs/                       # Documentación técnica
│   └── informe-final/          # Informes finales (informe-final.md y servicios-soa.md)
├── lib/                        # Cliente TCP (soa-client.ts) y mock-data
└── package.json                # Dependencias del proyecto
```

---

## ⚡ Guía de Inicio Rápido

Siga estos pasos para levantar el entorno completo localmente:

### 1. Iniciar el Backend SOA (TCP)
En una terminal nueva, ejecute el script que levanta el Bus ESB y registra los 7 servicios Python:
```bash
python backend/start_services.py
```
*Se visualizará la inicialización del BUS y el registro exitoso (`sinit`) de cada uno de los servicios.*

### 2. Iniciar el Frontend (Next.js)
En una segunda terminal, instale las dependencias de Node y ejecute el servidor de desarrollo:
```bash
npm install
npm run dev
```
Abra [http://localhost:3000](http://localhost:3000) en su navegador.

### 3. Compilación de Producción (Verificación)
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
*Esto validará 10/10 operaciones críticas del flujo (login, validación de token, consulta de flota, GPS, estado de carga, alertas de frecuencia, incidentes y KPIs).*

---

## 🛡️ Credenciales de Demostración
Para iniciar sesión en la plataforma, use la contraseña universal: **`sicof2026`**

* **Despachador (El Roble)**: `cpizarro`
* **Despachador (Colo Colo)**: `rmuñoz`
* **Administrador COF**: `pvera`
* **Administrador TI**: `imella` / `admin`

---

## 📄 Documentación Oficial de Entrega
Los informes finales y diagramas ER de la entrega se encuentran en:
* [Especificación de Servicios SOA](file:///c:/Users/sergi/Desktop/SICOF/docs/informe-final/servicios-soa.md)
* [Informe Final del Proyecto](file:///c:/Users/sergi/Desktop/SICOF/docs/informe-final/informe-final.md)
