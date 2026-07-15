-- Products catalog
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  price INT NOT NULL,
  discount_price INT,
  stock INT NOT NULL DEFAULT 0,
  unit TEXT,
  image_url TEXT,
  rating NUMERIC(2,1) NOT NULL DEFAULT 4.7,
  total_reviews INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are viewable by everyone"
  ON public.products FOR SELECT
  USING (true);

CREATE INDEX idx_products_category ON public.products(category);

-- Orders
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subtotal INT NOT NULL,
  shipping INT NOT NULL DEFAULT 0,
  total INT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','failed','refunded')),
  order_status TEXT NOT NULL DEFAULT 'placed' CHECK (order_status IN ('placed','processing','shipped','delivered','cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
  ON public.orders FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_orders_user ON public.orders(user_id);

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Order items
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view items of own orders"
  ON public.order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND o.user_id = auth.uid()));

CREATE POLICY "Users can insert items for own orders"
  ON public.order_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND o.user_id = auth.uid()));

CREATE INDEX idx_order_items_order ON public.order_items(order_id);

-- Seed products
INSERT INTO public.products (name, brand, category, description, price, discount_price, stock, unit, rating, total_reviews) VALUES
('Ashwagandha Churna', 'Ayuzee Classical', 'Churna', 'Pure ashwagandha root powder — natural stress relief and vitality support. Traditional Rasayana herb.', 499, 349, 120, '200g', 4.8, 312),
('Triphala Tablets', 'Ayuzee Daily', 'Tablets', 'Daily digestion and detox. Classical three-fruit formulation of Amalaki, Bibhitaki, and Haritaki.', 320, 249, 200, '60 tablets', 4.7, 189),
('Brahmi Hair Oil', 'Vaidya Herbs', 'Hair Care', 'Cold-pressed Brahmi and Bhringraj oil for scalp nourishment and healthy hair growth.', 599, 449, 85, '200ml', 4.9, 422),
('Chyawanprash Premium', 'Ayuzee Classical', 'Rasayana', 'Traditional immunity rasayana with 40+ herbs, pure cow ghee, and wild honey.', 699, 549, 60, '500g', 4.9, 567),
('Kumkumadi Tailam', 'Vaidya Herbs', 'Skin Care', 'Luxurious night serum for radiant skin. Saffron, sandalwood, and 16 precious herbs.', 899, 749, 40, '30ml', 4.8, 201),
('Shatavari Powder', 'Ayuzee Classical', 'Churna', 'Womens wellness powder — hormonal balance and reproductive health support.', 449, 319, 95, '200g', 4.7, 156),
('Triphala Ghrita', 'Vaidya Herbs', 'Ghee', 'Medicated ghee for eye health and mental clarity. Classical Ayurvedic preparation.', 849, 699, 30, '150g', 4.8, 88),
('Arjuna Tablets', 'Ayuzee Daily', 'Tablets', 'Heart health support. Arjuna bark extract for cardiovascular wellness.', 399, 299, 150, '60 tablets', 4.6, 134),
('Mahanarayan Tailam', 'Vaidya Herbs', 'Massage Oil', 'Joint pain relief massage oil. Classical formulation with 50+ herbs.', 649, 499, 70, '200ml', 4.8, 245),
('Giloy Juice', 'Ayuzee Daily', 'Juices', 'Immunity-boosting Giloy (Guduchi) juice. Cold-pressed from fresh stems.', 349, 259, 110, '500ml', 4.7, 178);