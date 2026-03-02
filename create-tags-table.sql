-- Supabase SQL Editor에서 실행하세요
CREATE TABLE IF NOT EXISTS tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  color VARCHAR(10) NOT NULL DEFAULT '#94A3B8',
  family_code VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 정책 활성화
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기/쓰기 가능 (개발용, 프로덕션에서는 수정 필요)
CREATE POLICY "Allow all operations for tags" ON tags
  FOR ALL USING (true) WITH CHECK (true);
