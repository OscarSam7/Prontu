-- Esquema SQL para Pegue y Monte CDE (Ciudad del Este, Paraguay)
-- Ejecutar en el SQL Editor de Supabase

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla de Kits de Decoración y Audiovisual
CREATE TABLE IF NOT EXISTS kits (
  id INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL,
  categoria TEXT NOT NULL,
  subcategoria TEXT NOT NULL,
  precio_publico INTEGER NOT NULL,
  precio_decoradora INTEGER NOT NULL,
  garantia INTEGER NOT NULL DEFAULT 300000,
  descripcion TEXT NOT NULL,
  incluye TEXT[] NOT NULL DEFAULT '{}',
  no_incluye TEXT[] NOT NULL DEFAULT '{}',
  fotos TEXT[] NOT NULL DEFAULT '{}',
  video_url TEXT,
  pasos_montaje TEXT[] DEFAULT '{}',
  tiempo_armado TEXT,
  medidas_transporte TEXT,
  rating NUMERIC(3,2) DEFAULT 4.9,
  resenas INTEGER DEFAULT 15,
  disponible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Clientes / Decoradoras (Membresía)
CREATE TABLE IF NOT EXISTS perfiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  ci TEXT UNIQUE NOT NULL,
  whatsapp TEXT NOT NULL,
  es_decoradora BOOLEAN DEFAULT FALSE,
  membresia_activa BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de Reservas
CREATE TABLE IF NOT EXISTS reservas (
  id TEXT PRIMARY KEY,
  kit_id INTEGER REFERENCES kits(id) ON DELETE RESTRICT,
  kit_nombre TEXT NOT NULL,
  cliente_nombre TEXT NOT NULL,
  cliente_ci TEXT NOT NULL,
  cliente_whatsapp TEXT NOT NULL,
  direccion_fiesta TEXT NOT NULL,
  modalidad_entrega TEXT NOT NULL CHECK (modalidad_entrega IN ('retiro', 'delivery')),
  costo_delivery INTEGER NOT NULL DEFAULT 0,
  agrega_sonido_casa BOOLEAN DEFAULT FALSE,
  costo_upsell INTEGER NOT NULL DEFAULT 0,
  es_tarifa_decoradora BOOLEAN DEFAULT FALSE,
  fecha_retiro DATE NOT NULL,
  fecha_devolucion DATE NOT NULL,
  precio_total INTEGER NOT NULL,
  sena_50 INTEGER NOT NULL,
  saldo_pendiente INTEGER NOT NULL,
  garantia INTEGER NOT NULL,
  metodo_pago TEXT NOT NULL CHECK (metodo_pago IN ('transferencia', 'bancard', 'pix')),
  comprobante_nombre TEXT,
  estado TEXT NOT NULL DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Pagó 50%', 'Retirado', 'Devuelto')),
  estado_devolucion TEXT CHECK (estado_devolucion IN ('OK', 'Roto', 'Sucio')),
  items_rotos TEXT[] DEFAULT '{}',
  descuento_garantia INTEGER DEFAULT 0,
  garantia_devuelta INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para evitar doble reserva y acelerar consultas por fecha y kit
CREATE INDEX IF NOT EXISTS idx_reservas_kit_fechas ON reservas (kit_id, fecha_retiro, fecha_devolucion);
CREATE INDEX IF NOT EXISTS idx_reservas_estado ON reservas (estado);

-- Función RPC para validar que no exista doble reserva en las fechas elegidas
CREATE OR REPLACE FUNCTION verificar_disponibilidad_kit(
  p_kit_id INTEGER,
  p_fecha_retiro DATE,
  p_fecha_devolucion DATE
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM reservas
    WHERE kit_id = p_kit_id
      AND estado != 'Devuelto'
      AND fecha_retiro <= p_fecha_devolucion
      AND fecha_devolucion >= p_fecha_retiro
  );
END;
$$ LANGUAGE plpgsql;

-- Políticas de Row Level Security (RLS) para uso desde navegador con Publishable / Anon Key
ALTER TABLE kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acceso publico lectura kits" ON kits;
CREATE POLICY "Acceso publico lectura kits" ON kits FOR SELECT USING (true);

DROP POLICY IF EXISTS "Acceso publico escritura kits" ON kits;
CREATE POLICY "Acceso publico escritura kits" ON kits FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso publico reservas" ON reservas;
CREATE POLICY "Acceso publico reservas" ON reservas FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso publico perfiles" ON perfiles;
CREATE POLICY "Acceso publico perfiles" ON perfiles FOR ALL USING (true) WITH CHECK (true);

-- Columnas extra por si la tabla kits ya existía previamente
ALTER TABLE kits ADD COLUMN IF NOT EXISTS pasos_montaje TEXT[] DEFAULT '{}';
ALTER TABLE kits ADD COLUMN IF NOT EXISTS tiempo_armado TEXT;
ALTER TABLE kits ADD COLUMN IF NOT EXISTS medidas_transporte TEXT;

-- Bucket público de Storage para fotos y videos tutoriales de kits
INSERT INTO storage.buckets (id, name, public)
VALUES ('kits-media', 'kits-media', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Lectura publica kits-media" ON storage.objects;
CREATE POLICY "Lectura publica kits-media" ON storage.objects FOR SELECT USING (bucket_id = 'kits-media');

DROP POLICY IF EXISTS "Subida publica kits-media" ON storage.objects;
CREATE POLICY "Subida publica kits-media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'kits-media');
