<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed, watch, Transition } from 'vue'
import { CalendarDays, Filter, PlusCircle, Trash2, Pencil, Tag, X, Loader2, RefreshCw, ChevronUp } from 'lucide-vue-next'
import { useLedgerStore, type LedgerItem } from '../stores/ledger'
import { useTagsStore } from '../stores/tags'
import { useFamilyStore } from '../stores/family'
import LedgerAddModal from '../components/LedgerAddModal.vue'
import LedgerCalendar from '../components/LedgerCalendar.vue'
import TagManageModal from '../components/TagManageModal.vue'

const props = defineProps<{
  searchQuery?: string
}>()

const ledger = useLedgerStore()
const tagsStore = useTagsStore()
const familyStore = useFamilyStore()
const showAdd = ref(false)
const showCalendar = ref(false)
const showTagManage = ref(false)
const showFilterPanel = ref(false)
const showScrollTop = ref(false)
const selectedDate = ref<string | null>(null)
const selectedTag = ref<string | null>(null)
const selectedType = ref<'ALL' | 'IN' | 'OUT'>('ALL')
const editingItem = ref<LedgerItem | null>(null)

const refetchData = () => {
  ledger.fetchAll()
  tagsStore.fetchTags()
}

const handleRefresh = () => {
  refetchData()
}

// 최초 1회는 familyStore 로딩이 끝난 뒤에만 fetch
const hasFetchedOnce = ref(false)

watch(
  () => familyStore.loading,
  (isLoading) => {
    if (!isLoading && !hasFetchedOnce.value) {
      refetchData()
      hasFetchedOnce.value = true
    }
  },
  { immediate: true },
)

// 이후 패밀리 코드가 변경될 때만 다시 fetch
watch(
  () => familyStore.familyCode,
  (code, prev) => {
    if (hasFetchedOnce.value && code && code !== prev) {
      refetchData()
    }
  },
)

const displayCount = ref(10)
const LOAD_MORE_COUNT = 5

const filteredItems = computed(() => {
  let items = ledger.items
  if (props.searchQuery) {
    const query = props.searchQuery.toLowerCase()
    items = items.filter((item) => item.personName.toLowerCase().includes(query))
  }
  if (selectedDate.value) {
    items = items.filter((item) => item.date === selectedDate.value)
  }
  if (selectedTag.value) {
    items = items.filter((item) => item.tag === selectedTag.value)
  }
  if (selectedType.value !== 'ALL') {
    items = items.filter((item) => item.type === selectedType.value)
  }
  return items
})

const displayedItems = computed(() => {
  return filteredItems.value.slice(0, displayCount.value)
})

const hasMore = computed(() => displayCount.value < filteredItems.value.length)

const hasActiveFilter = computed(() => !!selectedDate.value || !!selectedTag.value || selectedType.value !== 'ALL' || !!props.searchQuery)

const handleScroll = () => {
  const scrollY = window.scrollY
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight

  if (scrollY + windowHeight >= documentHeight - 100 && hasMore.value) {
    displayCount.value += LOAD_MORE_COUNT
  }

  // 스크롤이 충분히 내려갔고, 아이템이 어느 정도 이상이면 TOP 버튼 노출
  showScrollTop.value = scrollY > 400 && displayedItems.value.length > 20
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const isModalOpen = computed(() => showAdd.value || showCalendar.value || showTagManage.value)

watch(isModalOpen, (open) => {
  if (open) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

const openAdd = () => {
  editingItem.value = null
  showAdd.value = true
}

const openEdit = (item: LedgerItem) => {
  editingItem.value = item
  showAdd.value = true
}

const closeModal = () => {
  showAdd.value = false
  editingItem.value = null
}

const openCalendar = () => {
  showCalendar.value = true
}

const handleSelectDate = (date: string) => {
  selectedDate.value = date
  showCalendar.value = false
  displayCount.value = 10
}

const clearDateFilter = () => {
  selectedDate.value = null
  displayCount.value = 10
}

const clearTagFilter = () => {
  selectedTag.value = null
  displayCount.value = 10
}

const clearAllFilters = () => {
  selectedDate.value = null
  selectedTag.value = null
  selectedType.value = 'ALL'
  displayCount.value = 10
}

const toggleFilterPanel = () => {
  showFilterPanel.value = !showFilterPanel.value
}

const selectTagFilter = (tagName: string) => {
  selectedTag.value = selectedTag.value === tagName ? null : tagName
  displayCount.value = 10
}

const selectTypeFilter = (type: 'ALL' | 'IN' | 'OUT') => {
  selectedType.value = type
  displayCount.value = 10
}

const getTagColor = (tagName: string) => {
  const tag = tagsStore.tags.find((t) => t.name === tagName)
  return tag?.color || '#94A3B8'
}

const handleSubmit = (payload: {
  date: string
  personName: string
  type: 'IN' | 'OUT'
  amount: number
  tag: string
  memo: string
}) => {
  ledger.addItem(payload)
}

const handleUpdate = (data: { id: string, payload: {
  date: string
  personName: string
  type: 'IN' | 'OUT'
  amount: number
  tag: string
  memo: string
}}) => {
  ledger.updateItem(data.id, data.payload)
}

const handleDelete = (id: string) => {
  if (!confirm('이 내역을 삭제하시겠습니까?')) return
  ledger.deleteItem(id)
}
</script>

<template>
  <div class="space-y-4">
    <!-- 상단: 새 내역 추가 + 새로고침 버튼 -->
    <div class="flex gap-2">
      <button
        type="button"
        class="flex-[8] h-[48px] flex items-center justify-center gap-2 rounded-xl bg-[#00C300] text-white text-[15px] font-semibold"
        @click="openAdd"
      >
        <PlusCircle class="w-[22px] h-[22px]" />
        새 내역 추가
      </button>
      <button
        type="button"
        class="w-[48px] h-[48px] shrink-0 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
        :disabled="ledger.loading"
        title="데이터 새로고침"
        @click="handleRefresh"
      >
        <RefreshCw class="w-[22px] h-[22px]" :class="{ 'animate-spin': ledger.loading }" />
      </button>
    </div>

    <!-- 필터/캘린더 버튼 영역 -->
    <section class="flex items-center gap-2">
      <button
        type="button"
        class="flex-1 inline-flex items-center justify-center gap-[6px] rounded-full border py-[9px] text-[13px] font-medium"
        :class="showFilterPanel || hasActiveFilter ? 'border-[#00C300] bg-[#00C300]/10 text-[#00C300]' : 'border-slate-200 bg-white text-slate-600'"
        @click="toggleFilterPanel"
      >
        <Filter class="w-[18px] h-[18px]" />
        필터
        <span v-if="hasActiveFilter" class="ml-0.5 w-[6px] h-[6px] rounded-full bg-[#00C300]"></span>
      </button>
      <button
        type="button"
        class="flex-1 inline-flex items-center justify-center gap-[6px] rounded-full border border-slate-200 bg-white py-[9px] text-[13px] font-medium text-slate-600"
        @click="openCalendar"
      >
        <CalendarDays class="w-[18px] h-[18px]" />
        캘린더
      </button>
    </section>

    <!-- 필터 패널 (태그 필터 + 태그 관리 통합) -->
    <Transition name="filter">
      <section v-if="showFilterPanel" class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-[13px] space-y-3">
      <!-- 태그 필터 -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <p class="text-[12px] font-medium text-slate-500">태그로 필터</p>
          <button
            v-if="selectedTag"
            type="button"
            class="text-[11px] text-slate-400 hover:text-slate-600"
            @click="clearTagFilter"
          >
            초기화
          </button>
        </div>
        <div class="flex flex-wrap gap-[6px]">
          <button
            v-for="t in tagsStore.tags"
            :key="t.id"
            type="button"
            class="px-[13px] py-[6px] rounded-full text-[12px] font-medium transition-colors"
            :class="selectedTag === t.name
              ? 'text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'"
            :style="selectedTag === t.name ? { backgroundColor: t.color } : {}"
            @click="selectTagFilter(t.name)"
          >
            {{ t.name }}
          </button>
        </div>
      </div>

      <!-- 날짜 필터 (캘린더에서 선택된 경우) -->
      <div v-if="selectedDate" class="pt-3 border-t border-slate-200">
        <div class="flex items-center justify-between">
          <p class="text-[12px] text-slate-500">
            날짜: <span class="font-medium text-slate-700">{{ selectedDate }}</span>
          </p>
          <button
            type="button"
            class="text-[11px] text-slate-400 hover:text-slate-600"
            @click="clearDateFilter"
          >
            해제
          </button>
        </div>
      </div>

      <!-- 태그 관리 링크 -->
      <div class="pt-3 border-t border-slate-200">
        <button
          type="button"
          class="w-full flex items-center justify-center gap-[6px] py-[9px] rounded-lg bg-white border border-slate-200 text-[12px] font-medium text-slate-600 hover:bg-slate-50"
          @click="showTagManage = true"
        >
          <Tag class="w-[15px] h-[15px]" />
          태그 관리
        </button>
      </div>
    </section>
    </Transition>

    <!-- 내역 리스트 헤더 -->
    <section class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <p class="text-[13px] font-medium text-slate-700">
          {{ hasActiveFilter ? '필터된 내역' : '경조사 내역' }}
          <span class="text-slate-400 ml-1">({{ filteredItems.length }}건)</span>
        </p>
        <button
          v-if="hasActiveFilter"
          type="button"
          class="text-[11px] text-slate-400 hover:text-slate-600 underline"
          @click="clearAllFilters"
        >
          초기화
        </button>
      </div>
      <div class="flex rounded-full bg-slate-100 p-[2px] text-[12px]">
        <button
          type="button"
          class="px-[11px] py-[4px] rounded-full transition-colors"
          :class="selectedType === 'ALL' ? 'bg-white text-slate-700 font-medium shadow-sm' : 'text-slate-500'"
          @click="selectTypeFilter('ALL')"
        >
          전체
        </button>
        <button
          type="button"
          class="px-[11px] py-[4px] rounded-full transition-colors"
          :class="selectedType === 'IN' ? 'bg-white text-emerald-600 font-medium shadow-sm' : 'text-slate-500'"
          @click="selectTypeFilter('IN')"
        >
          입금
        </button>
        <button
          type="button"
          class="px-[11px] py-[4px] rounded-full transition-colors"
          :class="selectedType === 'OUT' ? 'bg-white text-rose-600 font-medium shadow-sm' : 'text-slate-500'"
          @click="selectTypeFilter('OUT')"
        >
          출금
        </button>
      </div>
    </section>

    <!-- 로딩 상태 -->
    <section v-if="ledger.loading" class="bg-white rounded-xl border border-slate-100 pt-[160px] pb-[52px]">
      <div class="flex flex-col items-center justify-center gap-2">
        <Loader2 class="w-[26px] h-[26px] text-[#00C300] animate-spin" />
        <p class="text-[13px] text-slate-400">내역을 불러오는 중...</p>
      </div>
    </section>

    <!-- 내역 리스트 -->
    <section v-else class="bg-white rounded-xl border border-slate-100 divide-y divide-slate-100">
      <article
        v-for="item in displayedItems"
        :key="item.id"
        class="flex items-center justify-between px-4 py-[11px]"
      >
        <div class="min-w-0">
          <p class="text-[14px] font-semibold text-slate-900 flex items-center">
            <span class="truncate">{{ item.personName }}</span>
            <span
              class="ml-1 shrink-0 rounded-full px-[6px] py-[2px] text-[11px] font-medium text-white"
              :style="{ backgroundColor: getTagColor(item.tag) }"
            >
              {{ item.tag }}
            </span>
          </p>
          <p class="mt-[2px] text-[12px] text-slate-400">
            {{ item.date }} ·
            <span>{{ item.type === 'IN' ? '받음' : '보냄' }}</span>
          </p>
          <p v-if="item.memo" class="mt-[2px] text-[12px] text-slate-500 line-clamp-1">
            {{ item.memo }}
          </p>
        </div>
        <div class="flex flex-col items-end gap-1">
          <p
            class="text-[15px] font-semibold"
            :class="item.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'"
          >
            <span>{{ item.type === 'IN' ? '+' : '-' }}</span>
            {{ item.amount.toLocaleString() }}
          </p>
          <div class="flex items-center gap-1">
            <button
              type="button"
              class="p-[4px] rounded-full text-slate-300 hover:text-blue-500 hover:bg-blue-50"
              @click="openEdit(item)"
            >
              <Pencil class="w-[15px] h-[15px]" />
            </button>
            <button
              type="button"
              class="p-[4px] rounded-full text-slate-300 hover:text-rose-500 hover:bg-rose-50"
              @click="handleDelete(item.id)"
            >
              <Trash2 class="w-[15px] h-[15px]" />
            </button>
          </div>
        </div>
      </article>

      <!-- 빈 목록 (ledger/family 둘 다 로딩이 아닐 때만 표시) -->
      <div
        v-if="!ledger.loading && !familyStore.loading && displayedItems.length === 0"
        class="py-[34px] text-center text-[14px] text-slate-400"
      >
        내역이 없습니다.
      </div>
    </section>

    <!-- 더 보기 안내 -->
    <div v-if="hasMore" class="py-4 text-center">
      <p class="text-[12px] text-slate-400">
        스크롤하여 더 보기 ({{ displayedItems.length }}/{{ filteredItems.length }})
      </p>
    </div>
  </div>

  <!-- 맨 위로 가기 버튼 (데이터가 많고 아래로 충분히 스크롤된 경우) -->
  <button
    v-if="showScrollTop && !isModalOpen"
    type="button"
    class="fixed right-6 bottom-6 w-[44px] h-[44px] rounded-full bg-[#00C300] shadow-md border border-[#00C300] flex items-center justify-center text-white"
    @click="scrollToTop"
  >
    <ChevronUp class="w-[20px] h-[20px]" />
  </button>

  <!-- 모달들 (space-y-4 밖으로 이동) -->
  <Teleport to="body">
    <Transition name="modal">
      <LedgerAddModal
        v-if="showAdd"
        :editItem="editingItem"
        @close="closeModal"
        @submit="handleSubmit"
        @update="handleUpdate"
      />
    </Transition>

    <Transition name="modal">
      <LedgerCalendar
        v-if="showCalendar"
        :items="ledger.items"
        @close="showCalendar = false"
        @selectDate="handleSelectDate"
      />
    </Transition>

    <Transition name="modal">
      <TagManageModal
        v-if="showTagManage"
        @close="showTagManage = false"
      />
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active :deep(.rounded-2xl),
.modal-leave-active :deep(.rounded-2xl) {
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.modal-enter-from :deep(.rounded-2xl),
.modal-leave-to :deep(.rounded-2xl) {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}

.filter-enter-active,
.filter-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.filter-enter-from,
.filter-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.filter-enter-to,
.filter-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>

