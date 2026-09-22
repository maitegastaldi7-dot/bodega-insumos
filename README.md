# Bodega · Insumos

Dashboard de gestión de inventario conectado a un proyecto **Supabase real**
(no se crea ninguna base nueva). Cada categoría de insumo vive en su propia
tabla, tal como ya las tenés cargadas: `botellas`, `tapones`, `tapas`,
`capsulas`, `etiquetas`, `contraetiquetas`, `cajas`, `separadores`.

**Stack:** React 19 + TypeScript + Vite + Tailwind · TanStack Query v5 ·
Node.js/Express · Supabase (PostgreSQL). Sin Next.js, Angular, Prisma, MUI
ni Bootstrap.

## Estructura modular

```
web/src/modules/insumos/
  pages/        InsumosPage, DashboardPage, AlertasPage, RecepcionesInfoPage
  components/   InsumoTable, CategoriaTabs, FichaInsumoModal, EscanerModal,
                CameraScanner, BarcodeImage, DiagnosticoBanner
  hooks/        useInsumosPorTabla, useInsumosTodasLasTablas, useInsumoReal,
                useBuscarInsumoPorCodigo, useRegistrarRecepcion, useDiagnosticoConexion
  services/     insumosService.ts (llamadas HTTP a la API)
  types/        insumo.types.ts (columnas reales de Supabase)
  lib/          pdf.ts (ficha imprimible)

server/src/modules/insumos/
  insumos.types.ts     columnas reales + DTO
  insumos.service.ts   consultas/escrituras a Supabase
  insumos.errors.ts    clasificación de errores (conexión/auth/RLS/tabla)
  insumos.routes.ts    endpoints REST
```

## 1. Configurar y correr

```bash
# Backend
cd server
cp .env.example .env
# completar SUPABASE_URL y SUPABASE_PUBLISHABLE_KEY reales
npm install && npm run dev        # http://localhost:4000

# Frontend (otra terminal)
cd web
cp .env.example .env              # VITE_API_URL=http://localhost:4000/api
npm install && npm run dev        # http://localhost:5173
```

## 2. Diagnóstico de conexión

`GET /api/insumos/diagnostico?tabla=botellas` — corre **en el servidor Node**
(sin el sandbox de un navegador), y devuelve una de estas categorías si algo
falla, en vez de un error genérico:

| categoría         | significa |
|---|---|
| `conexion`        | no hubo respuesta HTTP (DNS/red/TLS) — el error `Failed to fetch` que vimos en la página de prueba anterior fue **causado por el sandbox de las páginas publicadas de Claude, no por tu Supabase**: no permiten `fetch` a dominios de terceros. El servidor Node no tiene esa restricción. |
| `autenticacion`   | la Publishable Key fue rechazada (401) |
| `permisos_rls`    | la key es válida pero RLS bloquea la operación |
| `tabla_no_existe` | el nombre de tabla no existe en ese schema |

El Dashboard y la sección Insumos muestran este diagnóstico como un banner
(`DiagnosticoBanner`) apenas abrís la app.

## 3. Qué es real y qué es "pendiente"

**Conectado a Supabase, 100% real (sin datos de ejemplo):**
- Dashboard, Insumos (8 categorías), Alertas de stock, Ficha de insumo,
  búsqueda global, escáner (cámara + lector USB), código de barras real
  (CODE128), impresión/PDF, registro de recepción (UPDATE real de `stock` y
  `recepcion`).

**Pendiente — requiere una decisión tuya antes de programarlo (para no
inventar estructura que no existe):**
- **Historial de recepciones** con fecha/usuario por evento: necesita una
  tabla nueva de auditoría (no existe hoy; no se creó sin confirmar).
- **Órdenes de Producción**: tampoco existía en el Excel original; se dejó
  fuera hasta definir cómo debe relacionarse con las 8 tablas reales.
- **`stock_piso` / `stock_minimo`**: la interfaz los soporta *si* esas
  columnas existen en una tabla — si no existen, se muestra "No disponible
  en esta tabla" en vez de inventar un valor.

**Legacy (no se usa, no se borró):** los archivos bajo `web/src/components/`
(fuera de `modules/`) y `server/src/routes/` son del prototipo anterior con
una tabla unificada `insumos` ficticia. Tienen un comentario de advertencia
al inicio y no están importados desde `App.tsx` ni desde `index.ts`.
