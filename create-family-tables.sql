-- 패밀리 테이블 생성
-- Supabase SQL Editor에서 실행하세요

-- 1. families 테이블
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(6) UNIQUE NOT NULL,
  created_by VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. family_members 테이블
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  user_id VARCHAR NOT NULL,
  nickname VARCHAR,
  profile_image VARCHAR,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(family_id, user_id)
);

-- 3. 인덱스 생성
CREATE INDEX idx_families_code ON families(code);
CREATE INDEX idx_family_members_user_id ON family_members(user_id);
CREATE INDEX idx_family_members_family_id ON family_members(family_id);

-- 4. RLS 정책 (Row Level Security)
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 families 테이블 조회 가능 (코드로 검색)
CREATE POLICY "Anyone can read families" ON families
  FOR SELECT USING (true);

-- 모든 사용자가 families 생성 가능
CREATE POLICY "Anyone can create families" ON families
  FOR INSERT WITH CHECK (true);

-- 모든 사용자가 family_members 조회 가능
CREATE POLICY "Anyone can read family_members" ON family_members
  FOR SELECT USING (true);

-- 모든 사용자가 family_members 생성 가능
CREATE POLICY "Anyone can create family_members" ON family_members
  FOR INSERT WITH CHECK (true);

-- 모든 사용자가 family_members 삭제 가능 (본인 탈퇴)
CREATE POLICY "Anyone can delete family_members" ON family_members
  FOR DELETE USING (true);
