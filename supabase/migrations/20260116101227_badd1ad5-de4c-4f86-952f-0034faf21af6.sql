-- Create table for user points/rewards
CREATE TABLE public.user_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  total_points INTEGER NOT NULL DEFAULT 0,
  lifetime_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_points
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;

-- User points policies
CREATE POLICY "Users can view their own points"
  ON public.user_points FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own points"
  ON public.user_points FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own points"
  ON public.user_points FOR UPDATE
  USING (auth.uid() = user_id);

-- Create table for cargo tracking
CREATE TABLE public.cargo_trackings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tracking_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'factory_departed',
  volume_m3 DECIMAL(10, 3),
  points_earned INTEGER NOT NULL DEFAULT 0,
  origin TEXT DEFAULT 'China',
  destination TEXT DEFAULT 'Tashkent',
  estimated_delivery DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on cargo_trackings
ALTER TABLE public.cargo_trackings ENABLE ROW LEVEL SECURITY;

-- Cargo tracking policies
CREATE POLICY "Users can view their own cargo trackings"
  ON public.cargo_trackings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cargo trackings"
  ON public.cargo_trackings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cargo trackings"
  ON public.cargo_trackings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cargo trackings"
  ON public.cargo_trackings FOR DELETE
  USING (auth.uid() = user_id);

-- Create table for points transactions
CREATE TABLE public.points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earned', 'redeemed')),
  description TEXT NOT NULL,
  reference_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on points_transactions
ALTER TABLE public.points_transactions ENABLE ROW LEVEL SECURITY;

-- Points transactions policies
CREATE POLICY "Users can view their own transactions"
  ON public.points_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
  ON public.points_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create table for redeemable gifts
CREATE TABLE public.gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  points_required INTEGER NOT NULL,
  image_url TEXT,
  category TEXT DEFAULT 'general',
  stock INTEGER DEFAULT 100,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on gifts
ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;

-- Gifts are viewable by everyone
CREATE POLICY "Gifts are viewable by everyone"
  ON public.gifts FOR SELECT
  USING (true);

-- Create table for gift redemptions
CREATE TABLE public.gift_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  gift_id UUID REFERENCES public.gifts(id) ON DELETE SET NULL,
  points_spent INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on gift_redemptions
ALTER TABLE public.gift_redemptions ENABLE ROW LEVEL SECURITY;

-- Gift redemption policies
CREATE POLICY "Users can view their own redemptions"
  ON public.gift_redemptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own redemptions"
  ON public.gift_redemptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add trigger for updating user_points updated_at
CREATE TRIGGER update_user_points_updated_at
  BEFORE UPDATE ON public.user_points
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for updating cargo_trackings updated_at
CREATE TRIGGER update_cargo_trackings_updated_at
  BEFORE UPDATE ON public.cargo_trackings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to auto-create user_points on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_points()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_points (user_id, total_points, lifetime_points)
  VALUES (NEW.id, 0, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to auto-create user_points on signup
CREATE TRIGGER on_auth_user_created_points
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_points();

-- Insert default gifts
INSERT INTO public.gifts (name, description, points_required, category) VALUES
  ('Power Bank', '10000 mAh tezkor quvvatlash', 800, 'electronics'),
  ('Elektr Choynak', 'Smart termostat bilan', 1200, 'home'),
  ('Smartphone', 'Zamonaviy smartfon', 2500, 'electronics'),
  ('Bluetooth Quloqchin', 'Shovqinni bekor qiluvchi', 600, 'electronics'),
  ('Smart Soat', 'Fitness tracker bilan', 1800, 'electronics'),
  ('Laptop Sumka', 'Premium ko''nchilik', 400, 'accessories');