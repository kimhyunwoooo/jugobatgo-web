import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://amptmecpkntlirefuybp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtcHRtZWNwa250bGlyZWZ1eWJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwOTEyOTcsImV4cCI6MjA4NzY2NzI5N30.m79rCOTQlg8Jm026fhXOSJPPy58VpDOfxp2ZVPa05h0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const dummyData = [
  {
    date: '2026-02-25',
    person_name: '김철수',
    type: 'OUT',
    amount: 100000,
    tag: '결혼',
    memo: '대학 동기 결혼식',
    family_code: 'SINGLE_USER',
  },
  {
    date: '2026-02-22',
    person_name: '이영희',
    type: 'IN',
    amount: 50000,
    tag: '결혼',
    memo: '우리 결혼식 축의금',
    family_code: 'SINGLE_USER',
  },
  {
    date: '2026-02-20',
    person_name: '박민수',
    type: 'OUT',
    amount: 50000,
    tag: '장례',
    memo: '직장 동료 부친상',
    family_code: 'SINGLE_USER',
  },
  {
    date: '2026-02-18',
    person_name: '정수진',
    type: 'IN',
    amount: 100000,
    tag: '돌잔치',
    memo: '아기 돌잔치 선물',
    family_code: 'SINGLE_USER',
  },
  {
    date: '2026-02-15',
    person_name: '최동욱',
    type: 'OUT',
    amount: 30000,
    tag: '생일',
    memo: '친구 생일 선물',
    family_code: 'SINGLE_USER',
  },
  {
    date: '2026-02-10',
    person_name: '강미영',
    type: 'IN',
    amount: 70000,
    tag: '결혼',
    memo: '고등학교 친구',
    family_code: 'SINGLE_USER',
  },
  {
    date: '2026-02-08',
    person_name: '윤재호',
    type: 'OUT',
    amount: 100000,
    tag: '결혼',
    memo: '사촌 형 결혼',
    family_code: 'SINGLE_USER',
  },
  {
    date: '2026-02-05',
    person_name: '한소희',
    type: 'OUT',
    amount: 50000,
    tag: '출산',
    memo: '회사 선배 출산 축하',
    family_code: 'SINGLE_USER',
  },
  {
    date: '2026-02-03',
    person_name: '임현우',
    type: 'IN',
    amount: 30000,
    tag: '생일',
    memo: '생일 축하금',
    family_code: 'SINGLE_USER',
  },
  {
    date: '2026-01-28',
    person_name: '송지원',
    type: 'OUT',
    amount: 70000,
    tag: '장례',
    memo: '이모님 장례식',
    family_code: 'SINGLE_USER',
  },
]

async function seed() {
  console.log('더미 데이터 삽입 중...')
  
  const { data, error } = await supabase
    .from('ledgers')
    .insert(dummyData)
    .select()

  if (error) {
    console.error('오류 발생:', error.message)
    process.exit(1)
  }

  console.log(`✅ ${data.length}개의 더미 데이터가 삽입되었습니다.`)
  process.exit(0)
}

seed()
