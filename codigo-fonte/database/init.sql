-- =====================================================
-- TechStore - Schema do Banco de Dados
-- Rede de Lojas de Eletrônicos
-- =====================================================

CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sellers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  commission_rate DECIMAL(5,2) DEFAULT 5.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  category VARCHAR(50),
  brand VARCHAR(50),
  low_stock_threshold INTEGER DEFAULT 5,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sales (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  seller_id INTEGER NOT NULL REFERENCES sellers(id),
  status VARCHAR(20) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sale_items (
  id SERIAL PRIMARY KEY,
  sale_id INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sellers_updated_at BEFORE UPDATE ON sellers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DADOS INICIAIS
-- =====================================================

-- 2 Vendedores
INSERT INTO sellers (name, email, phone, commission_rate) VALUES
  ('Marcos Alves',   'marcos.alves@techstore.com',  '(71) 99001-0001', 5.00),
  ('Julia Rodrigues','julia.rodrigues@techstore.com','(71) 99001-0002', 6.00);

-- 5 Clientes
INSERT INTO customers (name, email, phone, address) VALUES
  ('Ana Silva',     'ana.silva@email.com',     '(71) 98001-0001', 'Rua das Flores, 123, Salvador-BA'),
  ('Bruno Santos',  'bruno.santos@email.com',  '(71) 98001-0002', 'Av. Paralela, 456, Salvador-BA'),
  ('Carla Oliveira','carla.oliveira@email.com','(71) 98001-0003', 'Rua do Comercio, 789, Salvador-BA'),
  ('Diego Ferreira','diego.ferreira@email.com','(71) 98001-0004', 'Praca da Se, 101, Salvador-BA'),
  ('Elena Costa',   'elena.costa@email.com',   '(71) 98001-0005', 'Rua Direita, 202, Salvador-BA');

-- 10 Produtos (Eletrônicos)
INSERT INTO products (name, description, price, stock_quantity, category, brand, low_stock_threshold) VALUES
  ('iPhone 15 Pro 256GB',
   'Smartphone Apple com chip A17 Pro, camera 48MP, tela Super Retina XDR 6.1"',
   8999.00, 15, 'Smartphone', 'Apple', 3),

  ('Samsung Galaxy S24 128GB',
   'Smartphone Samsung com Snapdragon 8 Gen 3, camera 50MP, tela Dynamic AMOLED 6.2"',
   6499.00, 20, 'Smartphone', 'Samsung', 3),

  ('MacBook Air M2 8GB/256GB',
   'Notebook Apple com chip M2, tela Liquid Retina 13.6", bateria ate 18 horas',
   12999.00, 8, 'Notebook', 'Apple', 2),

  ('Dell Inspiron 15 i5/16GB/512GB',
   'Notebook Dell com Intel Core i5-1335U, 16GB RAM, SSD 512GB, tela Full HD 15.6"',
   4299.00, 12, 'Notebook', 'Dell', 3),

  ('AirPods Pro 2a Geracao',
   'Fone de ouvido sem fio Apple com cancelamento ativo de ruido e chip H2',
   2199.00, 30, 'Fone de Ouvido', 'Apple', 5),

  ('Samsung Galaxy Buds2 Pro',
   'Fone de ouvido sem fio Samsung com cancelamento de ruido, audio Hi-Fi 24bit',
   1099.00, 25, 'Fone de Ouvido', 'Samsung', 5),

  ('iPad Air 5a Geracao 64GB Wi-Fi',
   'Tablet Apple com chip M1, tela Liquid Retina 10.9", camera traseira 12MP',
   5499.00, 10, 'Tablet', 'Apple', 2),

  ('Monitor LG 27" 4K UHD IPS',
   'Monitor 27 polegadas, resolucao 4K UHD 3840x2160, painel IPS, HDR10, 60Hz',
   3799.00, 6, 'Monitor', 'LG', 2),

  ('Mouse Logitech MX Master 3',
   'Mouse sem fio com receptor USB, scroll magnetico, 4000 DPI, compativel Windows/Mac',
   699.00, 40, 'Periferico', 'Logitech', 8),

  ('Teclado Keychron K8 TKL',
   'Teclado mecanico sem fio, layout TKL 87 teclas, switches Gateron Red, retroiluminado RGB',
   899.00, 35, 'Periferico', 'Keychron', 8);
