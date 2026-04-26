<template>
  <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" @keydown.esc="close">
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm animate-fade-in" @click="close"/>

    <!-- Dialog Panel -->
    <div class="relative bg-app-card w-full max-w-4xl max-h-[85vh] rounded-3xl border border-app-surface shadow-2xl flex flex-col overflow-hidden animate-zoom-in">
      <!-- Header -->
      <div class="p-6 border-b border-app-surface flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-app-green/10 flex items-center justify-center border border-app-green/20">
            <div class="w-5 h-5 bg-app-green mask-[url('/icons/fa-file-invoice-dollar.svg')] mask-contain mask-no-repeat" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-white tracking-tight">เรทอัตราค่าตอบแทนแพทย์</h2>
            <p class="text-xs text-slate-500 mt-0.5 italic">อ้างอิงข้อมูลปี 2566 · โรงพยาบาลวิเศษชัยชาญ</p>
          </div>
        </div>
        <button class="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors" @click="close">
          <div class="w-5 h-5 bg-current mask-[url('/icons/fa-xmark.svg')] mask-contain mask-no-repeat" />
        </button>
      </div>

      <!-- Search Bar -->
      <div class="px-6 py-4 bg-app-bg/50 border-b border-app-surface">
        <div class="relative group">
          <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <div class="w-4 h-4 bg-slate-500 group-focus-within:bg-app-green transition-colors mask-[url('/icons/fa-search.svg')] mask-contain mask-no-repeat" />
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="ค้นหารหัส หรือ ชื่อหัตถการ..."
            class="w-full bg-app-card border border-app-surface rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-app-green/20 focus:border-app-green/50 transition-all"
          />
        </div>
      </div>

      <!-- Table Body -->
      <div class="flex-1 overflow-y-auto custom-scrollbar">
        <table class="w-full text-sm border-collapse">
          <thead class="sticky top-0 bg-app-card/95 backdrop-blur-md z-10">
            <tr class="text-slate-500 border-b border-app-surface">
              <th class="px-6 py-4 text-left font-bold uppercase tracking-wider text-[10px] w-24">รหัส</th>
              <th class="px-6 py-4 text-left font-bold uppercase tracking-wider text-[10px]">ชื่อหัตถการ / ภาระงาน</th>
              <th class="px-6 py-4 text-right font-bold uppercase tracking-wider text-[10px] w-32">ค่าตอบแทน (บาท)</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-app-surface/30">
            <tr
              v-for="fee in filteredFees"
              :key="fee.code"
              class="group hover:bg-white/2 transition-colors"
            >
              <td class="px-6 py-4 font-mono text-xs text-app-green font-bold">{{ fee.code }}</td>
              <td class="px-6 py-4 text-slate-300 leading-relaxed">{{ fee.name }}</td>
              <td class="px-6 py-4 text-right font-mono font-bold text-white">{{ fee.rate.toLocaleString() }}</td>
            </tr>
            <tr v-if="filteredFees.length === 0">
              <td colspan="3" class="px-6 py-12 text-center text-slate-500 italic">ไม่พบข้อมูลที่ค้นหา...</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer -->
      <div class="p-4 bg-app-bg/50 border-t border-app-surface flex items-center justify-between text-[10px]">
        <span class="text-slate-600 uppercase tracking-widest font-bold">Total codes: {{ fees.length }}</span>
        <button class="px-6 py-2 bg-app-surface hover:bg-slate-700 text-slate-300 font-bold rounded-xl border border-white/5 transition-all" @click="close">ปิดหน้าต่าง (ESC)</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getAllFees } from '@/utils/fee-rates'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
}>()

const searchQuery = ref('')
const fees = computed(() => getAllFees())

const filteredFees = computed(() => {
  if (!searchQuery.value.trim()) return fees.value
  const query = searchQuery.value.toLowerCase()
  return fees.value.filter(f => 
    f.code.toLowerCase().includes(query) || 
    f.name.toLowerCase().includes(query)
  )
})

function close() {
  emit('update:visible', false)
}

// Global ESC listener
onMounted(() => {
  window.addEventListener('keydown', handleEsc)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleEsc)
})

function handleEsc(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.visible) close()
}
</script>

<style scoped>
.animate-zoom-in {
  animation: zoomIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes zoomIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
