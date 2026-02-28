-- ============================================================
-- VIBB RLS 보안 강화 마이그레이션
-- ============================================================
-- 적용 항목:
-- 1. posts: is_published=false는 작성자만 조회 가능
-- 2. reports: reporter 본인만 조회 (service_role은 RLS 우회)
-- 3. users: vibe_score, referral_code는 트리거로만 변경, 클라이언트 직접 update 불가
-- 4. notifications: 본인 알림만 insert/select/update, delete 불가
-- ============================================================

-- ------------------------------------------------------------
-- 1. POSTS: is_published=false인 게시물은 작성자만 조회
-- ------------------------------------------------------------
-- 기존: posts_select USING (is_published = true) → 작성자도 미공개 글 못 봄
-- 변경: (is_published = true OR auth.uid() = user_id)
DROP POLICY IF EXISTS "posts_select" ON public.posts;
CREATE POLICY "posts_select" ON public.posts
  FOR SELECT
  USING (
    is_published = true
    OR auth.uid() = user_id
  );

-- ------------------------------------------------------------
-- 2. REPORTS: reporter 본인만 조회
-- ------------------------------------------------------------
-- 현재 정책이 이미 reporter_id = auth.uid()로 제한됨. 유지.
-- service_role은 Supabase에서 RLS를 우회하므로 관리자 조회 가능.
-- 추가: reports에 update/delete 정책이 없음 → 이미 deny 상태. 유지.

-- ------------------------------------------------------------
-- 3. USERS: vibe_score, referral_code 클라이언트 직접 수정 방지
-- ------------------------------------------------------------
-- RLS는 컬럼 단위 제한 불가 → BEFORE UPDATE 트리거로 처리
-- 본인 행을 수정할 때만 vibe_score, referral_code를 OLD 값으로 고정
-- (트리거/다른 사용자 행 수정 시에는 변경 허용 - vibe_score 트리거용)

CREATE OR REPLACE FUNCTION public.users_protect_system_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 본인이 자신의 행을 수정하는 경우: vibe_score, referral_code 변경 차단
  IF auth.uid() = OLD.id THEN
    NEW.vibe_score := OLD.vibe_score;
    NEW.referral_code := OLD.referral_code;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS users_protect_system_columns_trigger ON public.users;
CREATE TRIGGER users_protect_system_columns_trigger
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.users_protect_system_columns();

-- 추천인 보너스: referred_by 설정 시 referrer에게 +20 vibe_score
-- (기존 Callback.tsx에서 클라이언트가 직접 vibe_score 업데이트 → RLS로 실패 가능성 있음)
-- 트리거로 이전하여 SECURITY DEFINER로 안전하게 처리

CREATE OR REPLACE FUNCTION public.handle_referral_vibe_bonus()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.referred_by IS NOT NULL
     AND (OLD.referred_by IS NULL OR OLD.referred_by IS DISTINCT FROM NEW.referred_by) THEN
    UPDATE public.users
    SET vibe_score = vibe_score + 20
    WHERE id = NEW.referred_by;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_referral_vibe_bonus ON public.users;
CREATE TRIGGER on_referral_vibe_bonus
  AFTER UPDATE OF referred_by ON public.users
  FOR EACH ROW
  WHEN (OLD.referred_by IS DISTINCT FROM NEW.referred_by)
  EXECUTE FUNCTION public.handle_referral_vibe_bonus();

-- ------------------------------------------------------------
-- 4. NOTIFICATIONS: 본인 알림만 insert/select/update, delete 불가
-- ------------------------------------------------------------
-- select: 이미 auth.uid() = user_id
-- update: 이미 auth.uid() = user_id
-- insert: 기존 auth.role() = 'authenticated' → 어떤 user_id든 insert 가능 (취약)
--         변경: auth.uid() = actor_id (알림 생성 시 행위자 본인만 가능)
-- delete: 정책 없음 = deny (이미 삭제 불가)

DROP POLICY IF EXISTS "notifications_insert" ON public.notifications;
CREATE POLICY "notifications_insert" ON public.notifications
  FOR INSERT
  WITH CHECK (
    auth.uid() = actor_id
    OR (actor_id IS NULL AND auth.uid() = user_id)
  );

-- challenge 타입 등 actor_id가 null인 경우: user_id = auth.uid()만 허용
-- (위 정책에서 actor_id IS NULL AND auth.uid() = user_id 처리)
