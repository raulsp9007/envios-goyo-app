-- Provincias de Cuba con precio base de envío
CREATE TABLE provinces (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  base_price_usd NUMERIC(10,4) NOT NULL DEFAULT 0,
  position INT NOT NULL DEFAULT 0
);

-- Municipios agrupados por provincia con recargo adicional
CREATE TABLE municipalities (
  id SERIAL PRIMARY KEY,
  province_id INT NOT NULL REFERENCES provinces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  surcharge_usd NUMERIC(10,4) NOT NULL DEFAULT 0
);

-- Configuración global de envío (siempre una sola fila con id=1)
CREATE TABLE shipping_config (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  fuel_cost_usd NUMERIC(10,4) NOT NULL DEFAULT 0,
  pickup_enabled BOOLEAN NOT NULL DEFAULT true,
  delivery_enabled BOOLEAN NOT NULL DEFAULT true,
  pickup_address TEXT NOT NULL DEFAULT ''
);

-- Fila inicial obligatoria
INSERT INTO shipping_config (id, fuel_cost_usd, pickup_enabled, delivery_enabled, pickup_address)
VALUES (1, 0, true, true, '');

-- Precio rebajado opcional en productos (NULL = sin descuento)
ALTER TABLE products ADD COLUMN price_usd_sale NUMERIC(10,4) NULL;

-- Datos de envío en órdenes
ALTER TABLE orders
  ADD COLUMN shipping_method TEXT NOT NULL DEFAULT 'delivery',
  ADD COLUMN shipping_cost_usd NUMERIC(10,4) NOT NULL DEFAULT 0,
  ADD COLUMN customer_municipio TEXT NOT NULL DEFAULT '',
  ADD COLUMN customer_provincia TEXT NOT NULL DEFAULT '';
