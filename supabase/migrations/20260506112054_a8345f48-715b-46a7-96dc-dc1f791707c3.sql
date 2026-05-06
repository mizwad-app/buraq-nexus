ALTER TABLE public.wholesale_markets
  ADD COLUMN IF NOT EXISTS nearest_metro text,
  ADD COLUMN IF NOT EXISTS metro_exit text,
  ADD COLUMN IF NOT EXISTS metro_walk_minutes integer,
  ADD COLUMN IF NOT EXISTS nearest_airport text,
  ADD COLUMN IF NOT EXISTS airport_taxi_cost_yuan text,
  ADD COLUMN IF NOT EXISTS airport_taxi_minutes integer,
  ADD COLUMN IF NOT EXISTS transport_notes text;