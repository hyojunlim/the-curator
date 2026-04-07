---
name: add-migration
description: Generate a new Supabase migration SQL file with The Curator's Clerk RLS pattern and proper indexes. Use when adding or modifying database tables.
disable-model-invocation: true
argument-hint: [description of change]
---

# New Supabase Migration: $ARGUMENTS

`supabase/migrations/00X_<description>.sql`을 생성한다.
X는 현재 최신 마이그레이션 번호 + 1.

## 현재 마이그레이션 현황
- `001_create_contracts.sql`
- `002_create_subscriptions.sql`
- `003_atomic_increment_usage.sql`
- `004_add_perspective_column.sql`

→ 다음 번호: **005**

## 표준 테이블 패턴

```sql
-- 005_<description>.sql

-- 테이블 생성
CREATE TABLE IF NOT EXISTS <table_name> (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  -- 컬럼들
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스 (항상 user_id와 created_at)
CREATE INDEX idx_<table_name>_user_id ON <table_name>(user_id);
CREATE INDEX idx_<table_name>_created_at ON <table_name>(created_at DESC);

-- Row Level Security (필수)
ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY;

-- RLS 정책 4종 세트 (Clerk JWT 패턴)
CREATE POLICY "<table_name>_select" ON <table_name>
  FOR SELECT USING (
    user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  );

CREATE POLICY "<table_name>_insert" ON <table_name>
  FOR INSERT WITH CHECK (
    user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  );

CREATE POLICY "<table_name>_update" ON <table_name>
  FOR UPDATE USING (
    user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  );

CREATE POLICY "<table_name>_delete" ON <table_name>
  FOR DELETE USING (
    user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  );
```

## 컬럼 추가 패턴
```sql
-- 005_add_<column>_to_<table>.sql
ALTER TABLE <table_name> ADD COLUMN IF NOT EXISTS <column_name> <type> DEFAULT <value>;
```

## 원자적 함수 패턴 (race condition 방지)
```sql
CREATE OR REPLACE FUNCTION <function_name>(p_user_id TEXT)
RETURNS void AS $$
BEGIN
  UPDATE <table_name>
  SET <column> = <column> + 1
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 주의사항
- `current_setting('request.jwt.claims', true)::json->>'sub'` = Clerk userId
- 항상 `IF NOT EXISTS` / `IF EXISTS` 사용 (idempotent)
- 서버 코드에서는 `supabaseAdmin` (service role) 사용하므로 RLS 우회됨 — API route에서 직접 `.eq("user_id", userId)` 필터 추가 필수

마이그레이션 파일을 `supabase/migrations/` 폴더에 생성하고, 관련 TypeScript 타입도 `src/types/index.ts`에 업데이트 필요 여부를 알려줄 것.
