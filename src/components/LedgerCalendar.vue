<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { X } from 'lucide-vue-next'
import type { LedgerItem } from '../stores/ledger'

const props = defineProps<{
  items: LedgerItem[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'selectDate', date: string): void
}>()

const today = new Date()
const currentYear = ref(today.getFullYear())
const currentMonth = ref(today.getMonth())

const yearScrollRef = ref<HTMLElement | null>(null)
const monthScrollRef = ref<HTMLElement | null>(null)
const calendarGridRef = ref<HTMLElement | null>(null)

const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
const dayNames = ['일', '월', '화', '수', '목', '금', '토']

// 스와이프 관련
const touchStartX = ref(0)
const touchCurrentX = ref(0)
const isSwiping = ref(false)
const swipeOffset = ref(0)
const isAnimating = ref(false)
const slideDirection = ref<'left' | 'right' | null>(null)
const enableTransition = ref(true)

const handleTouchStart = (e: TouchEvent) => {
  if (isAnimating.value) return
  touchStartX.value = e.touches[0].clientX
  touchCurrentX.value = e.touches[0].clientX
  isSwiping.value = true
}

const handleTouchMove = (e: TouchEvent) => {
  if (!isSwiping.value || isAnimating.value) return
  touchCurrentX.value = e.touches[0].clientX
  const diff = touchCurrentX.value - touchStartX.value
  swipeOffset.value = diff
}

const handleTouchEnd = () => {
  if (!isSwiping.value || isAnimating.value) return
  isSwiping.value = false
  
  const diff = touchCurrentX.value - touchStartX.value
  const threshold = 60
  
  if (diff > threshold) {
    // 오른쪽 스와이프 (이전 달) - 최소 연도/월 체크
    if (canGoPrev.value) {
      slideToMonth('right')
    } else {
      swipeOffset.value = 0
    }
  } else if (diff < -threshold) {
    // 왼쪽 스와이프 (다음 달) - 최대 연도/월 체크
    if (canGoNext.value) {
      slideToMonth('left')
    } else {
      swipeOffset.value = 0
    }
  } else {
    swipeOffset.value = 0
  }
}

const slideToMonth = (direction: 'left' | 'right') => {
  isAnimating.value = true
  slideDirection.value = direction
  enableTransition.value = true
  
  const containerWidth = calendarGridRef.value?.offsetWidth || 300
  
  // 1단계: 현재 달이 나가는 방향으로 슬라이드 (트랜지션 있음)
  swipeOffset.value = direction === 'left' ? -containerWidth : containerWidth
  
  setTimeout(() => {
    // 2단계: 트랜지션 없이 월 변경 + 새 달을 반대쪽에 위치
    enableTransition.value = false
    
    if (direction === 'left') {
      nextMonth()
    } else {
      prevMonth()
    }
    
    // 새 달이 들어올 시작 위치
    swipeOffset.value = direction === 'left' ? containerWidth : -containerWidth
    
    // 3단계: 트랜지션 켜고 중앙으로 슬라이드
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        enableTransition.value = true
        swipeOffset.value = 0
        
        setTimeout(() => {
          isAnimating.value = false
          slideDirection.value = null
        }, 150)
      })
    })
  }, 150)
}

const minYear = computed(() => {
  if (props.items.length === 0) return today.getFullYear()
  let min = today.getFullYear()
  props.items.forEach((item) => {
    const year = parseInt(item.date.split('-')[0], 10)
    if (year < min) min = year
  })
  return min
})

const maxYear = computed(() => today.getFullYear())

const canGoPrev = computed(() => {
  // 이전 달로 갈 수 있는지: 현재가 최소 연도의 1월이 아니면 가능
  if (currentYear.value > minYear.value) return true
  if (currentYear.value === minYear.value && currentMonth.value > 0) return true
  return false
})

const canGoNext = computed(() => {
  // 다음 달로 갈 수 있는지: 현재가 최대 연도의 12월이 아니면 가능
  if (currentYear.value < maxYear.value) return true
  if (currentYear.value === maxYear.value && currentMonth.value < 11) return true
  return false
})

const availableYears = computed(() => {
  const currentYearValue = maxYear.value
  const minYearValue = minYear.value
  
  // 데이터가 없으면 현재 연도만
  if (props.items.length === 0) {
    return [currentYearValue]
  }
  
  const years: number[] = []
  for (let y = currentYearValue; y >= minYearValue; y--) {
    years.push(y)
  }
  return years
})

const selectYear = (year: number) => {
  currentYear.value = year
  scrollToActiveYear()
}

const selectMonth = (monthIndex: number) => {
  currentMonth.value = monthIndex
  scrollToActiveMonth()
}

const scrollToActiveYear = () => {
  nextTick(() => {
    const activeYearBtn = yearScrollRef.value?.querySelector('[data-active-year="true"]')
    if (activeYearBtn) {
      activeYearBtn.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
    }
  })
}

const scrollToActiveMonth = () => {
  nextTick(() => {
    const activeMonthBtn = monthScrollRef.value?.querySelector('[data-active-month="true"]')
    if (activeMonthBtn) {
      activeMonthBtn.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
    }
  })
}

const goToToday = () => {
  currentYear.value = today.getFullYear()
  currentMonth.value = today.getMonth()
  scrollToActiveYear()
  scrollToActiveMonth()
}

onMounted(() => {
  nextTick(() => {
    const activeYearBtn = yearScrollRef.value?.querySelector('[data-active-year="true"]')
    if (activeYearBtn) {
      activeYearBtn.scrollIntoView({ inline: 'center', block: 'nearest' })
    }
    const activeMonthBtn = monthScrollRef.value?.querySelector('[data-active-month="true"]')
    if (activeMonthBtn) {
      activeMonthBtn.scrollIntoView({ inline: 'center', block: 'nearest' })
    }
  })
})

const daysInMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
})

const firstDayOfMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value, 1).getDay()
})

const calendarDays = computed(() => {
  const days: (number | null)[] = []
  for (let i = 0; i < firstDayOfMonth.value; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth.value; i++) {
    days.push(i)
  }
  return days
})

const itemsByDate = computed(() => {
  const map: Record<string, { inTotal: number; outTotal: number; count: number }> = {}
  props.items.forEach((item) => {
    if (!map[item.date]) {
      map[item.date] = { inTotal: 0, outTotal: 0, count: 0 }
    }
    if (item.type === 'IN') {
      map[item.date].inTotal += item.amount
    } else {
      map[item.date].outTotal += item.amount
    }
    map[item.date].count++
  })
  return map
})

const getDateString = (day: number) => {
  const month = String(currentMonth.value + 1).padStart(2, '0')
  const dayStr = String(day).padStart(2, '0')
  return `${currentYear.value}-${month}-${dayStr}`
}

const getDateData = (day: number) => {
  const dateStr = getDateString(day)
  return itemsByDate.value[dateStr]
}

const isToday = (day: number) => {
  return (
    day === today.getDate() &&
    currentMonth.value === today.getMonth() &&
    currentYear.value === today.getFullYear()
  )
}

const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
    scrollToActiveYear()
  } else {
    currentMonth.value--
  }
  scrollToActiveMonth()
}

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
    scrollToActiveYear()
  } else {
    currentMonth.value++
  }
  scrollToActiveMonth()
}

const handleDateClick = (day: number | null) => {
  if (!day) return
  emit('selectDate', getDateString(day))
}

const formatAmount = (amount: number) => {
  if (amount >= 10000) {
    return `${Math.floor(amount / 10000)}만`
  }
  return amount.toLocaleString()
}
</script>

<template>
  <div class="fixed top-0 left-0 right-0 bottom-0 z-30 flex items-center justify-center bg-black/40 px-4">
    <div class="w-full max-w-md rounded-2xl bg-white shadow-lg overflow-hidden">
      <header class="flex items-center justify-between px-4 py-[13px] border-b border-slate-100">
        <div class="flex items-center gap-2">
          <h2 class="text-[16px] font-semibold text-slate-900">캘린더</h2>
          <span class="text-[14px] text-slate-500">{{ currentYear }}년 {{ currentMonth + 1 }}월</span>
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="px-[13px] py-[4px] rounded-full text-[12px] font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            @click="goToToday"
          >
            오늘
          </button>
          <button type="button" class="p-[4px] text-slate-400" @click="emit('close')">
            <X class="w-[18px] h-[18px]" />
          </button>
        </div>
      </header>

      <div class="px-4 py-[13px]">
        <!-- 연도 선택 -->
        <div class="mb-[13px]">
          <div 
            ref="yearScrollRef"
            class="flex gap-[6px] overflow-x-auto pb-2 scrollbar-hide"
          >
            <button
              v-for="year in availableYears"
              :key="year"
              type="button"
              :data-active-year="currentYear === year"
              class="flex-shrink-0 px-[13px] py-[6px] rounded-full text-[13px] font-medium transition-colors"
              :class="currentYear === year 
                ? 'bg-[#00C300] text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
              @click="selectYear(year)"
            >
              {{ year }}
            </button>
          </div>
        </div>

        <!-- 월 선택 -->
        <div class="mb-[13px]">
          <div 
            ref="monthScrollRef"
            class="flex gap-[6px] overflow-x-auto pb-2 scrollbar-hide"
          >
            <button
              v-for="(month, index) in monthNames"
              :key="index"
              type="button"
              :data-active-month="currentMonth === index"
              class="flex-shrink-0 px-[13px] py-[6px] rounded-full text-[13px] font-medium transition-colors"
              :class="currentMonth === index
                ? 'bg-[#00C300] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
              @click="selectMonth(index)"
            >
              {{ index + 1 }}월
            </button>
          </div>
        </div>

        <div class="grid grid-cols-7 gap-1 mb-2">
          <div
            v-for="day in dayNames"
            :key="day"
            class="text-center text-[12px] font-medium py-[4px]"
            :class="day === '일' ? 'text-rose-500' : day === '토' ? 'text-blue-500' : 'text-slate-500'"
          >
            {{ day }}
          </div>
        </div>

        <div class="calendar-grid-wrapper">
          <div 
            ref="calendarGridRef"
            class="grid grid-cols-7 gap-1 calendar-grid"
            :class="{ 'transitioning': enableTransition && !isSwiping }"
            :style="{ transform: `translateX(${swipeOffset}px)` }"
            @touchstart="handleTouchStart"
            @touchmove="handleTouchMove"
            @touchend="handleTouchEnd"
          >
            <div
              v-for="(day, index) in calendarDays"
              :key="index"
              class="h-[60px] p-[2px]"
            >
            <button
              v-if="day"
              type="button"
              class="w-full h-full rounded-lg flex flex-col items-center justify-start pt-[4px] text-[13px] transition-colors"
              :class="[
                isToday(day) ? 'bg-[#00C300] text-white' : 'hover:bg-slate-100',
                getDateData(day) ? 'font-semibold' : ''
              ]"
              @click="handleDateClick(day)"
            >
              <span>{{ day }}</span>
              <div v-if="getDateData(day)" class="mt-[2px] space-y-[1px]">
                <!-- 건수가 1~2건일 때: 입금/출금 각각 한 줄씩 표시 -->
                <p
                  v-if="getDateData(day).count <= 2 && getDateData(day).inTotal > 0"
                  class="text-[8px] leading-tight"
                  :class="isToday(day) ? 'text-white/90' : 'text-emerald-600'"
                >
                  +{{ formatAmount(getDateData(day).inTotal) }}
                </p>
                <p
                  v-if="getDateData(day).count <= 2 && getDateData(day).outTotal > 0"
                  class="text-[8px] leading-tight"
                  :class="isToday(day) ? 'text-white/90' : 'text-rose-600'"
                >
                  -{{ formatAmount(getDateData(day).outTotal) }}
                </p>

                <!-- 건수가 3건 이상일 때: 상위 1개(+입금 or -출금)만 표시 -->
                <p
                  v-if="getDateData(day).count >= 3 && (getDateData(day).inTotal > 0 || getDateData(day).outTotal > 0)"
                  class="text-[8px] leading-tight"
                  :class="isToday(day)
                    ? 'text-white/90'
                    : getDateData(day).inTotal >= getDateData(day).outTotal
                      ? 'text-emerald-600'
                      : 'text-rose-600'"
                >
                  {{
                    getDateData(day).inTotal >= getDateData(day).outTotal
                      ? '+' + formatAmount(getDateData(day).inTotal)
                      : '-' + formatAmount(getDateData(day).outTotal)
                  }}
                </p>

                <!-- 2건까지는 건수 표시 없음, 3건 이상에서만 건수 추가 -->
                <p
                  v-if="getDateData(day).count >= 3"
                  class="text-[8px] leading-tight"
                  :class="isToday(day) ? 'text-white/70' : 'text-slate-400'"
                >
                  {{ getDateData(day).count }}건
                </p>
              </div>
            </button>
            </div>
          </div>
        </div>

        <div class="pt-[13px] border-t border-slate-100">
          <div class="flex justify-center gap-4 text-[12px] text-slate-500">
            <span class="flex items-center gap-1">
              <span class="w-[9px] h-[9px] rounded-full bg-emerald-500"></span>
              입금
            </span>
            <span class="flex items-center gap-1">
              <span class="w-[9px] h-[9px] rounded-full bg-rose-500"></span>
              출금
            </span>
            <span class="flex items-center gap-1">
              <span class="w-[9px] h-[9px] rounded-full bg-slate-400"></span>
              건수
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

button {
  transition: all 0.15s ease;
}

button:active {
  transform: scale(0.97);
}

.calendar-grid-wrapper {
  min-height: 380px;
  overflow: hidden;
}

.calendar-grid {
  touch-action: pan-y;
  will-change: transform;
}

.calendar-grid.transitioning {
  transition: transform 0.15s ease-out;
}
</style>
