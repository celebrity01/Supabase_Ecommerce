CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- sellers table
CREATE TABLE IF NOT EXISTS sellers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_uid uuid UNIQUE,
  email text UNIQUE NOT NULL,
  shop_name text NOT NULL,
  shop_location text NOT NULL,
  owner_number text NOT NULL,
  is_approved boolean DEFAULT false,
  daily_upload_limit integer DEFAULT 5,
  created_at timestamp with time zone DEFAULT now()
);

-- products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid REFERENCES sellers(id) ON DELETE CASCADE,
  product_image text NOT NULL,
  product_details text NOT NULL,
  price numeric NOT NULL,
  shop_location text NOT NULL,
  shop_name text NOT NULL,
  owner_number text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- upload logs for enforcing daily limits
CREATE TABLE IF NOT EXISTS upload_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid REFERENCES sellers(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  upload_date date NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- admins table (simple admin registry)
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_uid uuid UNIQUE,
  email text UNIQUE NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Example: public select policy for products so anonymous users can view products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public select products" ON products
  FOR SELECT
  USING (true);

-- Seller inserts must be authenticated and seller must be approved (enforced in function/policies or via RPC)
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Insert own seller row" ON sellers
  FOR INSERT
  WITH CHECK (auth.uid() = auth_uid::text OR auth.uid()::text IS NOT NULL);