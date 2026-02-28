
-- Fix function search paths
ALTER FUNCTION handle_like_vibe_score() SET search_path = public;
ALTER FUNCTION handle_bookmark_vibe_score() SET search_path = public;
ALTER FUNCTION handle_follow_vibe_score() SET search_path = public;
ALTER FUNCTION handle_post_vibe_score() SET search_path = public;
ALTER FUNCTION update_trending_scores() SET search_path = public;

-- Fix permissive notifications insert policy
DROP POLICY "notifications_insert" ON public.notifications;
CREATE POLICY "notifications_insert" ON public.notifications FOR INSERT WITH CHECK (auth.role() = 'authenticated');
