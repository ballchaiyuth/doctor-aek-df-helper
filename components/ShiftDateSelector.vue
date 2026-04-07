<template>
  <div id="shift-date-selector">
    <label class="block text-sm font-medium text-slate-300 mb-2">
      เลือกวันที่อยู่เวร
    </label>
    <div class="space-y-2">
      <label
        v-for="date in dates"
        :key="date.toISOString()"
        class="flex items-center gap-3 px-4 py-3 bg-app-card border rounded-xl cursor-pointer transition-all hover:border-app-green/50 hover:bg-app-green/5"
        :class="
          isSelected(date)
            ? 'border-app-green bg-app-green/10 ring-1 ring-app-green'
            : 'border-app-surface'
        "
      >
        <input
          type="checkbox"
          :checked="isSelected(date)"
          class="w-4 h-4 text-app-green rounded border-app-surface bg-app-bg focus:ring-app-green focus:ring-offset-app-bg"
          @change="toggleDate(date)"
        />
        <span class="text-sm font-medium text-slate-200">
          {{ formatDateDisplay(date) }}
        </span>
      </label>
    </div>

    <!-- Select all / deselect all -->
    <div class="flex items-center gap-2 mt-4 px-1">
      <button
        class="flex-1 py-2 px-4 rounded-lg bg-white/5 border border-white/5 text-xs font-bold text-slate-400 hover:text-app-green hover:bg-app-green/5 hover:border-app-green/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        @click="selectAll"
      >
        <div
          class="w-3.5 h-3.5 bg-current mask-[url('/icons/fa-circle-check.svg')] mask-contain mask-no-repeat mask-center"
        />
        เลือกทั้งหมด
      </button>
      <button
        class="flex-1 py-2 px-4 rounded-lg bg-white/5 border border-white/5 text-xs font-bold text-slate-400 hover:text-red-400 hover:bg-red-400/5 hover:border-red-400/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        @click="deselectAll"
      >
        <div
          class="w-3.5 h-3.5 bg-current mask-[url('/icons/fa-circle-notch.svg')] mask-contain mask-no-repeat mask-center"
        />
        ยกเลิกทั้งหมด
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { format, isSameDay } from "date-fns";
import { th } from "date-fns/locale";

const props = defineProps<{
  dates: Date[];
  modelValue: Date[];
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: Date[]): void;
}>();

function isSelected(date: Date): boolean {
  return props.modelValue.some((d) => isSameDay(d, date));
}

function toggleDate(date: Date) {
  if (isSelected(date)) {
    emit(
      "update:modelValue",
      props.modelValue.filter((d) => !isSameDay(d, date)),
    );
  } else {
    emit("update:modelValue", [...props.modelValue, date]);
  }
}

function selectAll() {
  emit("update:modelValue", [...props.dates]);
}

function deselectAll() {
  emit("update:modelValue", []);
}

function formatDateDisplay(date: Date): string {
  return format(date, "EEEE d MMMM yyyy", { locale: th });
}
</script>
