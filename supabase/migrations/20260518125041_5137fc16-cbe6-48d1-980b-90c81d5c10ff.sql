
CREATE TABLE public.community_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('pledge', 'wall')),
  name TEXT,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can post community"
ON public.community_posts FOR INSERT
TO anon, authenticated
WITH CHECK (
  (type = 'pledge') OR
  (type = 'wall' AND message IS NOT NULL AND length(message) BETWEEN 5 AND 280)
);

CREATE POLICY "Anyone can read community"
ON public.community_posts FOR SELECT
TO anon, authenticated
USING (true);

CREATE INDEX community_posts_type_created_idx ON public.community_posts (type, created_at DESC);
