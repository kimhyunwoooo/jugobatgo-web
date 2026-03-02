import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://amptmecpkntlirefuybp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtcHRtZWNwa250bGlyZWZ1eWJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwOTEyOTcsImV4cCI6MjA4NzY2NzI5N30.m79rCOTQlg8Jm026fhXOSJPPy58VpDOfxp2ZVPa05h0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const names = [
  '김민수', '이영희', '박지훈', '최수진', '정현우', '강미영', '조성민', '윤서연', '장동혁', '임수빈',
  '한지민', '오준호', '신예진', '권태우', '홍승아', '류민재', '배수현', '문정호', '손지영', '황인성',
  '전소희', '안재현', '송민지', '유승준', '노은정', '하지훈', '서민아', '차도윤', '고은비', '남궁현',
  '김태희', '이준혁', '박서윤', '최민혁', '정다은', '강현수', '조아라', '윤재민', '장수진', '임도현'
]

const tags = ['결혼', '장례', '돌잔치', '생일', '출산', '기타']
const types = ['IN', 'OUT']
const amounts = [30000, 50000, 70000, 100000, 150000, 200000, 300000]

const memos = {
  '결혼': ['축의금', '결혼식 참석', '청첩장 받음', '대학 동기 결혼', '회사 동료 결혼', '사촌 결혼'],
  '장례': ['조의금', '부친상', '모친상', '조문', '장례식장 방문'],
  '돌잔치': ['돌잔치 선물', '아기 돌잔치', '돌잔치 참석'],
  '생일': ['생일 선물', '생일 축하금', '환갑 잔치', '칠순 잔치'],
  '출산': ['출산 축하금', '출산 선물', '산후조리원 방문'],
  '기타': ['집들이', '승진 축하', '개업 축하', '졸업 축하', '합격 축하']
}

function randomDate(start, end) {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
  return date.toISOString().slice(0, 10)
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

const dummyData = []

for (let i = 0; i < 100; i++) {
  const tag = randomItem(tags)
  const type = randomItem(types)
  
  dummyData.push({
    date: randomDate(new Date('2024-01-01'), new Date('2026-02-27')),
    person_name: randomItem(names),
    type: type,
    amount: randomItem(amounts),
    tag: tag,
    memo: randomItem(memos[tag]),
    family_code: '4775847678',
  })
}

async function seed() {
  console.log('더미 데이터 100개 삽입 중...')
  
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
