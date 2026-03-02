<script setup lang="ts">
import { ref } from 'vue'
import { X } from 'lucide-vue-next'
import { useTagsStore } from '../stores/tags'

const emit = defineEmits<{
  (e: 'close'): void
}>()

const tagsStore = useTagsStore()

const newTagName = ref('')
const newTagColor = ref('#00C300')

const colorOptions = [
  '#F43F5E', '#F97316', '#EAB308', '#22C55E', '#00C300',
  '#14B8A6', '#3B82F6', '#8B5CF6', '#EC4899', '#64748B',
]

const handleAddTag = async () => {
  if (!newTagName.value.trim()) {
    alert('태그 이름을 입력해주세요.')
    return
  }
  await tagsStore.addTag(newTagName.value.trim(), newTagColor.value)
  newTagName.value = ''
}

const handleDeleteTag = async (id: string) => {
  if (!confirm('이 태그를 삭제하시겠습니까?')) return
  await tagsStore.deleteTag(id)
}
</script>

<template>
  <div class="fixed top-0 left-0 right-0 bottom-0 z-30 flex items-center justify-center bg-black/40 px-4">
    <div class="w-full max-w-md rounded-2xl bg-white shadow-lg overflow-hidden">
      <header class="flex items-center justify-between px-4 py-[13px] border-b border-slate-100">
        <h2 class="text-[16px] font-semibold text-slate-900">태그 관리</h2>
        <button type="button" class="p-[4px] text-slate-400" @click="emit('close')">
          <X class="w-[18px] h-[18px]" />
        </button>
      </header>

      <div class="px-4 py-[13px]">
        <!-- 새 태그 추가 -->
        <div class="mb-4">
          <p class="text-[13px] font-medium text-slate-700 mb-2">새 태그 추가</p>
          <!-- 1줄: 입력창 + 추가 버튼 -->
          <div class="flex gap-2 mb-2">
            <input
              v-model="newTagName"
              type="text"
              class="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-[13px] py-[9px] text-[14px] outline-none"
              placeholder="태그 이름"
              @keyup.enter="handleAddTag"
            />
            <button
              type="button"
              class="px-[17px] py-[9px] rounded-lg bg-[#00C300] text-white text-[13px] font-medium"
              @click="handleAddTag"
            >
              추가
            </button>
          </div>
          <!-- 2줄: 색상 선택 -->
          <div class="flex gap-2 justify-center">
            <button
              v-for="color in colorOptions"
              :key="color"
              type="button"
              class="w-[34px] h-[34px] rounded-full transition-transform"
              :class="newTagColor === color ? 'scale-110 ring-2 ring-offset-2 ring-slate-400' : ''"
              :style="{ backgroundColor: color }"
              @click="newTagColor = color"
            />
          </div>
        </div>

        <!-- 태그 목록 -->
        <div>
          <p class="text-[13px] font-medium text-slate-700 mb-2">태그 목록</p>
          <div class="flex flex-wrap gap-2">
            <div
              v-for="tag in tagsStore.tags"
              :key="tag.id"
              class="inline-flex items-center gap-[6px] pl-[13px] pr-[6px] py-[6px] rounded-full text-white text-[13px] font-medium"
              :style="{ backgroundColor: tag.color }"
            >
              {{ tag.name }}
              <button
                type="button"
                class="p-[2px] rounded-full hover:bg-white/20"
                @click="handleDeleteTag(tag.id)"
              >
                <X class="w-[15px] h-[15px]" />
              </button>
            </div>
            <p v-if="tagsStore.tags.length === 0" class="text-[13px] text-slate-400 text-center py-4 w-full">
              등록된 태그가 없습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
button {
  transition: all 0.15s ease;
}
button:active {
  transform: scale(0.97);
}
input:focus {
  border-color: #00C300;
  box-shadow: 0 0 0 2px rgba(0, 195, 0, 0.1);
}
</style>
