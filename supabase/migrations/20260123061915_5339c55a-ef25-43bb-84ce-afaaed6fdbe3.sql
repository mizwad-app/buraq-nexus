-- Create user_interests table for storing business survey results
CREATE TABLE public.user_interests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  main_category TEXT NOT NULL,
  sub_categories TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own interests" 
ON public.user_interests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own interests" 
ON public.user_interests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interests" 
ON public.user_interests 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_interests_updated_at
BEFORE UPDATE ON public.user_interests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();