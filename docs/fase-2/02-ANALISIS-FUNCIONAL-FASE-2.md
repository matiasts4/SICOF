# Análisis Funcional Fase 2: Del Prototipo a la Operación

La Fase 2 tiene como objetivo transformar el prototipo visual de SICOF en una aplicación funcional capaz de gestionar datos reales y persistentes. A continuación, se detallan los pilares de desarrollo para esta etapa.

## 1. Persistencia y Modelado de Datos
Es imperativo migrar de `lib/sicof-data.ts` a una base de datos relacional (PostgreSQL recomendada).

### Entidades Críticas a Implementar:
- **Flota (Buses)**: Patente, modelo, capacidad, estado actual, última geolocalización.
- **Operación (Despachos)**: Horarios programados vs. reales, conductores asignados, terminal de origen.
- **Incidentes**: Tipo, severidad, descripción, evidencia (adjuntos), timestamp.
- **Energía**: Registro histórico de cargas, degradación de batería, autonomía por bus.

## 2. Flujos de Usuario y Lógica de Negocio
Pasar de navegación estática a flujos transaccionales.

- **Autenticación Real**: Implementar Auth (Supabase Auth o JWT) vinculada a los roles definidos (Despachador, Jefe COF, Administrador TI).
- **Gestión de Turnos**: Funcionalidad para "Entrar al turno", lo que debe registrar el inicio de sesión del operador y el terminal asignado.
- **Reporte de Incidentes**: Formulario funcional que guarde en base de datos y dispare notificaciones a otros roles (ej. del Despachador al Jefe COF).
- **Control de Frecuencia**: Algoritmo que compare la posición real de los buses (vía API) con la programación para detectar brechas automáticamente.

## 3. Integración de Datos en Tiempo Real
El mapa debe dejar de ser una simulación.

- **Ingesta de Telemetría**: Integración con el servicio GPS (`gpssv`) mediante sockets TCP a través del Bus SOA.
- **Actualización en tiempo real**: Los cambios en la posición de los buses se obtienen mediante polling al servicio `gpssv` a través del BUS TCP.
- **Monitor de Carga (SoC)**: Integración con el sistema de telemetría de las baterías para mostrar el estado de carga real de los buses eléctricos.

## 4. Workspaces Funcionales
- **Terminal**: El despachador debe poder "validar" salidas y registrar incidentes en tiempo real.
- **COF**: Consolidación automática de métricas (KPIs) basada en los registros de todos los terminales.
- **TI**: Panel de control para crear usuarios, asignar permisos granulares y revisar logs de auditoría técnica.

---
## Prioridades Sugeridas
1. **Sprint 1**: Setup de Base de Datos y Sistema de Autenticación.
2. **Sprint 2**: Implementación de API para Flota e Incidentes (CRUD funcional).
3. **Sprint 3**: Integración de Mapas con datos reales (Real-time).
4. **Sprint 4**: Generación de Reportes dinámicos y Dashboard de Gestión.
