-- Create storage bucket for deep check files
INSERT INTO storage.buckets (id, name, public) VALUES ('deep-checks', 'deep-checks', true);

-- Storage policies for deep-checks bucket
CREATE POLICY "Users can upload deep check images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'deep-checks' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own deep check files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'deep-checks' AND (
    auth.uid()::text = (storage.foldername(name))[1] OR
    (storage.foldername(name))[1] = 'reports'
  ));

CREATE POLICY "Admins can upload reports"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'deep-checks' AND (storage.foldername(name))[1] = 'reports');

CREATE POLICY "Anyone can view reports"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'deep-checks' AND (storage.foldername(name))[1] = 'reports');

-- Create deep_checks table
CREATE TABLE public.deep_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_name TEXT NOT NULL,
  manufacturer_name TEXT NOT NULL,
  product_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
  payment_type TEXT NOT NULL CHECK (payment_type IN ('points', 'payment')),
  points_spent INTEGER DEFAULT 0,
  amount_paid DECIMAL(10, 2) DEFAULT 0,
  admin_notes TEXT,
  result_summary TEXT,
  report_pdf_url TEXT,
  halal_status TEXT CHECK (halal_status IN ('halol', 'haram', 'shubhali')),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on deep_checks
ALTER TABLE public.deep_checks ENABLE ROW LEVEL SECURITY;

-- Deep checks policies
CREATE POLICY "Users can view their own deep checks"
  ON public.deep_checks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own deep checks"
  ON public.deep_checks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create admin role type if not exists (for admin access)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
  END IF;
END $$;

-- Create user_roles table for admin access
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- User roles policies
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Admin policies for deep_checks
CREATE POLICY "Admins can view all deep checks"
  ON public.deep_checks FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update any deep check"
  ON public.deep_checks FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Add trigger for updating deep_checks updated_at
CREATE TRIGGER update_deep_checks_updated_at
  BEFORE UPDATE ON public.deep_checks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();