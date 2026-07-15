-- Product reviews table with auto-rating trigger
CREATE TABLE public.product_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  body TEXT,
  is_verified_purchase BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (product_id, user_id)
);

CREATE INDEX idx_product_reviews_product ON public.product_reviews(product_id);
CREATE INDEX idx_product_reviews_user ON public.product_reviews(user_id);

ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read reviews
CREATE POLICY "Reviews are publicly viewable"
ON public.product_reviews FOR SELECT
USING (true);

-- Authenticated users can insert their own review IF they have a paid order containing this product
CREATE POLICY "Verified purchasers can create their own review"
ON public.product_reviews FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1
    FROM public.order_items oi
    JOIN public.orders o ON o.id = oi.order_id
    WHERE oi.product_id = product_reviews.product_id
      AND o.user_id = auth.uid()
      AND o.payment_status = 'paid'
  )
);

CREATE POLICY "Users can update their own review"
ON public.product_reviews FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own review"
ON public.product_reviews FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Touch updated_at
CREATE TRIGGER trg_product_reviews_updated_at
BEFORE UPDATE ON public.product_reviews
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Recalculate aggregate rating on the product
CREATE OR REPLACE FUNCTION public.recalc_product_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pid UUID := COALESCE(NEW.product_id, OLD.product_id);
  avg_rating NUMERIC;
  total INT;
BEGIN
  SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0), COUNT(*)
  INTO avg_rating, total
  FROM public.product_reviews
  WHERE product_id = pid;

  UPDATE public.products
  SET rating = avg_rating,
      total_reviews = total
  WHERE id = pid;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_product_reviews_recalc
AFTER INSERT OR UPDATE OR DELETE ON public.product_reviews
FOR EACH ROW EXECUTE FUNCTION public.recalc_product_rating();