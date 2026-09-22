-- ============================================================================
-- BODEGA · INSUMOS — esquema inicial (Supabase / PostgreSQL)
-- ============================================================================
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- INSUMOS (tabla principal, une las 8 categorías del Excel original)
-- ----------------------------------------------------------------------------
create table if not exists insumos (
  id uuid primary key default gen_random_uuid(),
  categoria text not null check (categoria in (
    'Botellas', 'Tapones', 'Tapas', 'Cápsulas', 'Etiquetas',
    'Contraetiqueta', 'Cajas', 'Separadores'
  )),
  descripcion text not null,
  codigo_interno text not null,
  codigo_interno_barras text,
  codigo_busqueda text,
  tipo text,
  color text,
  dimensiones text,
  stock_sistema numeric not null default 0,
  stock_piso numeric,
  stock_minimo numeric,
  recepcion numeric, -- acumulado histórico de unidades recibidas
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint insumos_codigo_interno_unique unique (codigo_interno)
);

create index if not exists idx_insumos_categoria on insumos (categoria);
create index if not exists idx_insumos_activo on insumos (activo);
create index if not exists idx_insumos_codigo_interno on insumos (upper(codigo_interno));
create index if not exists idx_insumos_codigo_barras on insumos (upper(codigo_interno_barras));
create index if not exists idx_insumos_descripcion_trgm on insumos using gin (descripcion gin_trgm_ops);
create extension if not exists pg_trgm;

-- ----------------------------------------------------------------------------
-- PROVEEDORES POR INSUMO (un insumo puede tener varios; Código de Proveedor
-- es SIEMPRE un dato distinto de codigo_interno y de codigo_interno_barras)
-- ----------------------------------------------------------------------------
create table if not exists insumo_proveedores (
  id uuid primary key default gen_random_uuid(),
  insumo_id uuid not null references insumos(id) on delete cascade,
  nombre text,
  codigo text,
  created_at timestamptz not null default now()
);
create index if not exists idx_insumo_proveedores_insumo on insumo_proveedores (insumo_id);
create index if not exists idx_insumo_proveedores_codigo on insumo_proveedores (upper(codigo));

-- ----------------------------------------------------------------------------
-- RECEPCIONES (ingresos de insumos — suman a stock_sistema y a recepcion)
-- ----------------------------------------------------------------------------
create table if not exists recepciones (
  id uuid primary key default gen_random_uuid(),
  insumo_id uuid references insumos(id) on delete set null,
  cantidad numeric not null check (cantidad > 0),
  foto_url text,
  usuario text,
  orden_id uuid, -- referencia opcional a ordenes_produccion (fk agregada más abajo)
  fecha timestamptz not null default now()
);
create index if not exists idx_recepciones_insumo on recepciones (insumo_id);
create index if not exists idx_recepciones_fecha on recepciones (fecha desc);

-- ----------------------------------------------------------------------------
-- AUDITORÍA (alta / edición / ajuste de stock / baja / alta de insumo)
-- Registra siempre usuario, fecha y motivo, tal como se requiere.
-- ----------------------------------------------------------------------------
create table if not exists auditoria (
  id uuid primary key default gen_random_uuid(),
  insumo_id uuid references insumos(id) on delete set null,
  tipo text not null check (tipo in ('creacion', 'edicion', 'ajuste_stock', 'baja', 'alta')),
  usuario text not null default 'Sin identificar',
  motivo text,
  detalle jsonb,
  fecha timestamptz not null default now()
);
create index if not exists idx_auditoria_insumo on auditoria (insumo_id);
create index if not exists idx_auditoria_fecha on auditoria (fecha desc);
create index if not exists idx_auditoria_tipo on auditoria (tipo);

-- ----------------------------------------------------------------------------
-- ESCANEOS (registro de cada lectura de código, exista o no el insumo)
-- ----------------------------------------------------------------------------
create table if not exists escaneos (
  id uuid primary key default gen_random_uuid(),
  codigo text not null,
  insumo_id uuid references insumos(id) on delete set null,
  encontrado boolean not null default false,
  fecha timestamptz not null default now()
);
create index if not exists idx_escaneos_fecha on escaneos (fecha desc);

-- ----------------------------------------------------------------------------
-- ÓRDENES DE PRODUCCIÓN (no existían en el Excel original: módulo nuevo)
-- ----------------------------------------------------------------------------
create table if not exists ordenes_produccion (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  producto text not null,
  cantidad numeric not null,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'en_proceso', 'completada')),
  fecha_creacion timestamptz not null default now()
);

create table if not exists orden_insumos (
  id uuid primary key default gen_random_uuid(),
  orden_id uuid not null references ordenes_produccion(id) on delete cascade,
  insumo_id uuid not null references insumos(id),
  cantidad_necesaria numeric not null,
  cantidad_entregada numeric not null default 0,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'abastecido', 'insuficiente'))
);
create index if not exists idx_orden_insumos_orden on orden_insumos (orden_id);

alter table recepciones
  add constraint recepciones_orden_fk foreign key (orden_id) references ordenes_produccion(id) on delete set null;

-- ----------------------------------------------------------------------------
-- VISTA UNIFICADA DE HISTORIAL (recepciones + auditoría) — usada por la API
-- para el módulo "Historial de Movimientos" y la ficha de cada insumo.
-- ----------------------------------------------------------------------------
create or replace view v_historial_movimientos as
  select
    r.id, 'recepcion'::text as tipo, r.insumo_id, r.cantidad,
    null::text as usuario, null::text as motivo, null::jsonb as detalle, r.fecha
  from recepciones r
  union all
  select
    a.id, a.tipo, a.insumo_id, null::numeric as cantidad,
    a.usuario, a.motivo, a.detalle, a.fecha
  from auditoria a;

-- ----------------------------------------------------------------------------
-- updated_at automático en insumos
-- ----------------------------------------------------------------------------
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_insumos_updated_at on insumos;
create trigger trg_insumos_updated_at
  before update on insumos
  for each row execute function set_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY
-- Habilitado para uso vía Supabase. Este es un panel interno de planta: se
-- deja una política permisiva para el rol autenticado como punto de partida.
-- ANTES DE PRODUCCIÓN: reemplazar por políticas según roles reales (operario,
-- supervisor, admin) usando Supabase Auth. La API (server/) usa la
-- service_role key y no depende de estas políticas.
-- ============================================================================
alter table insumos enable row level security;
alter table insumo_proveedores enable row level security;
alter table recepciones enable row level security;
alter table auditoria enable row level security;
alter table escaneos enable row level security;
alter table ordenes_produccion enable row level security;
alter table orden_insumos enable row level security;

create policy "authenticated_read_insumos" on insumos for select to authenticated using (true);
create policy "authenticated_read_proveedores" on insumo_proveedores for select to authenticated using (true);
create policy "authenticated_read_recepciones" on recepciones for select to authenticated using (true);
create policy "authenticated_read_auditoria" on auditoria for select to authenticated using (true);
create policy "authenticated_read_escaneos" on escaneos for select to authenticated using (true);
create policy "authenticated_read_ordenes" on ordenes_produccion for select to authenticated using (true);
create policy "authenticated_read_orden_insumos" on orden_insumos for select to authenticated using (true);
-- Escrituras: solo a través de la API (service_role bypassa RLS). No se agregan
-- políticas de insert/update/delete para "authenticated" a propósito.
