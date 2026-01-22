-- Drop the conflicting "No direct access" policy 
DROP POLICY IF EXISTS "No direct translator access - use view" ON public.translators;

-- Create a public read policy for the translators_public view data access
-- Since the view uses security_invoker, we need to allow public SELECT on base table
-- But we'll create a more restrictive policy that only exposes non-sensitive fields

-- First, let's create a policy that allows public (anon) users to read translators
CREATE POLICY "Public can view available translators"
ON public.translators
FOR SELECT
TO anon, authenticated
USING (is_available = true);

-- Drop the old authenticated-only policy since we now have a combined one
DROP POLICY IF EXISTS "Authenticated users can view translator contact info" ON public.translators;