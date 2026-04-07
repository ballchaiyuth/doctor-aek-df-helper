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
        >
        <span class="text-sm font-medium text-slate-200">
          {{ formatDateDisplay(date) }}
        </span>
      </label>
    </div>

    <!-- Select all / deselect all -->
    <div class="flex gap-3 mt-3">
      <button
        class="text-xs text-app-green hover:text-app-green-hover font-medium"
        @click="selectAll"
      >
        เลือกทั้งหมด
      </button>
      <button
        class="text-xs text-slate-400 hover:text-slate-300 font-medium"
        @click="deselectAll"
      >
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
