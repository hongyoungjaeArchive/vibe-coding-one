# VIBB RLS 보안 강화 보고서

## 적용된 변경 사항

### 1. posts 테이블
| 항목 | 기존 | 변경 후 |
|------|------|---------|
| SELECT | `is_published = true` (모든 공개 글만) | `is_published = true OR auth.uid() = user_id` |
| 효과 | 작성자도 미공개 글 조회 불가 | 작성자만 미공개 글 조회 가능 |

### 2. reports 테이블
| 항목 | 상태 |
|------|------|
| SELECT | 이미 `auth.uid() = reporter_id`로 제한됨 |
| service_role | Supabase에서 RLS 우회 → 관리자 조회 가능 |
| UPDATE/DELETE | 정책 없음 = deny (변경 없음) |

### 3. users 테이블
| 항목 | 내용 |
|------|------|
| vibe_score, referral_code | `users_protect_system_columns` 트리거로 클라이언트 직접 수정 차단 |
| 추천인 보너스 | `handle_referral_vibe_bonus` 트리거로 referred_by 설정 시 +20 자동 부여 |
| Callback.tsx | vibe_score 직접 업데이트 제거 (트리거로 대체) |

### 4. notifications 테이블
| 항목 | 기존 | 변경 후 |
|------|------|---------|
| INSERT | `auth.role() = 'authenticated'` (임의 user_id 삽입 가능) | `auth.uid() = actor_id OR (actor_id IS NULL AND auth.uid() = user_id)` |
| DELETE | 정책 없음 = deny | 유지 |

---

## 기존 정책과의 충돌 여부

| 정책 | 충돌 | 비고 |
|------|------|------|
| posts_select | 없음 | DROP 후 재생성 |
| reports | 없음 | 변경 없음 |
| users | 없음 | 트리거 추가만 |
| notifications_insert | 없음 | DROP 후 재생성 |

---

## 추가로 확인된 보안 취약점 및 권고

### 1. likes 테이블 — SELECT 정책 과도하게 개방
- **현재**: `USING (true)` → 비로그인 사용자도 모든 좋아요 조회 가능
- **권고**: 특별한 이유가 없다면 `auth.role() = 'authenticated'`로 제한 검토

### 2. follows 테이블 — SELECT 정책 과도하게 개방
- **현재**: `USING (true)` → 모든 팔로우 관계 공개
- **권고**: 서비스 정책에 따라 유지 또는 `authenticated`로 제한 검토

### 3. posts — like_count, view_count 등 집계 컬럼
- **현재**: 클라이언트에서 `view_count` 직접 업데이트 (PostDetail.tsx)
- **권고**: 조회수는 트리거 또는 Edge Function으로 처리하는 것이 안전함 (부풀리기 방지)

### 4. Storage — post-images
- **현재**: `storage.foldername(name)[1]`이 user_id로 가정
- **권고**: 경로 규칙(`user_id/...`)이 엄격히 지켜지는지 확인 필요

### 5. notifications — INSERT 정책과 트리거
- **현재**: 클라이언트에서 알림 생성 코드 없음
- **권고**: likes, follows, bookmarks에 알림 생성 트리거 추가 권장 (클라이언트 생성 시 actor_id 검증 필요)

### 6. weekly_challenges
- **현재**: SELECT만 허용, INSERT/UPDATE/DELETE 정책 없음
- **권고**: 관리자만 수정 가능하도록 service_role 또는 전용 admin 역할 사용

---

## 마이그레이션 적용 방법

```bash
supabase db push
# 또는
supabase migration up
```
