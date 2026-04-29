# SICOF · Sistema visual front-only

Sistema visual en **Next.js + React + Tailwind CSS v4** para **SICOF (Sistema Integral de Control de Flotas)** de Red Bus.

## Alcance de esta entrega

- foco exclusivo en **capa visual / front-only**
- shell compartido con navegación por workspaces
- cobertura mockeada de **RF-001 a RF-008**
- 18 pantallas visuales organizadas por rol:
  - Despachador de Terminal
  - Administrador de Operaciones (COF)
  - Administrador de Sistema (TI)
- mock data coherente para validar navegación, jerarquía y criterio operacional
- documentación en **Markdown** como fuente de verdad

## Fuera de alcance por ahora

- base de datos
- modelo de persistencia real
- APIs reales
- autenticación real
- integración GPS / SoC / reportes

## Mapa de rutas

### Centro

- `/` → lobby operacional y punto de entrada del sistema

### Terminal

- `/terminal` → hub del patio
- `/terminal/flota` → gestión visual de flota segmentada
- `/terminal/despacho` → cola de salida y geocercas
- `/terminal/energia` → SoC, cargadores y swaps
- `/terminal/frecuencia` → brechas y presión por servicio
- `/terminal/incidentes` → registro mínimo y escalamiento local

### COF

- `/cof` → hub global multi-terminal
- `/cof/terminales` → comparación entre patios
- `/cof/frecuencia` → control táctico de regularidad
- `/cof/incidentes` → contingencias de red
- `/cof/kpis` → lectura ejecutiva de indicadores
- `/cof/reportes` → exportación visual de packs y cortes

### TI

- `/admin` → hub de gobierno visual
- `/admin/usuarios` → usuarios y sesiones
- `/admin/permisos` → matriz de alcance por rol
- `/admin/auditoria` → feed de trazabilidad
- `/admin/parametros` → grupos de configuración e integración

## Stack

- Next `16.2.3`
- React `19.2.4`
- Tailwind CSS `4`
- TypeScript `5`
- ESLint `9`
- Lucide React para iconografía

## Levantar el proyecto

```bash
npm install
npm run dev
```

## Validación recomendada

```bash
npm run lint
```

## Documentación clave

- `docs/visual-design-system.md` → lenguaje visual, shell, tokens y principios UX
- `docs/module-coverage.md` → mapa de rutas, RF-001..RF-008 y cobertura visual por workspace
- `docs/informe2.md` → base Markdown del informe 2 con puntos 5, 6 y 7
- `docs/fase-2/01-ESTADO-ACTUAL-VISUAL.md` → inventario de la implementación actual
- `docs/fase-2/02-ANALISIS-FUNCIONAL-FASE-2.md` → roadmap hacia un sistema funcional
- `docs/fase-2/03-REQUISITOS-TECNICOS.md` → especificaciones de arquitectura y API
- `docs/fase-2/04-DISENO-TECNICO-DETALLADO.md` → arquitectura SOA, modelo ER y diccionario (Puntos 5, 6 y 7)
- `informe1.md` → contexto del dominio y requerimientos base
- `InstruccionesInforme2.md` → lineamientos del informe 2

## Idea fuerza

Primero validar sistema visual, shell por rol y criterio operacional.
Después recién definir backend real, persistencia, contratos y ejecución técnica con otros equipos.
# SICOF
# SICOF
