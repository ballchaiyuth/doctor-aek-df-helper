<template>
  <div
    class="bg-app-card rounded-2xl border border-app-surface shadow-xl overflow-hidden animate-fade-in"
  >
    <div
      class="p-6 border-b border-app-surface flex items-center justify-between"
    >
      <div>
        <h3 class="text-lg font-bold text-slate-100 flex items-center gap-2">
          <span>ตรวจสอบความถูกต้องข้อมูลต้นฉบับ</span>
          <span
            class="text-xs px-2 py-0.5 bg-app-green/10 text-app-green rounded-full border border-app-green/20"
            >Source Audit</span
          >
        </h3>
        <p class="text-sm text-slate-500 mt-1">
          สีเขียว = นับเข้าบิล, โปร่งใส = ไม่นับ (ข้าม) ·
          คลิกปุ่มด้านหลังเพื่อเปลี่ยนสถานะด้วยมือ
        </p>
      </div>
      <div class="flex items-center gap-4 text-xs">
        <div class="flex items-center gap-2">
          <span
            class="w-3 h-3 rounded-full bg-app-green/40 border border-app-green/30"
          />
          <span class="text-slate-400"
            >ของ {{ doctorName || "แพทย์ที่เลือก" }}</span
          >
        </div>
        <div class="flex items-center gap-2">
          <span
            class="w-3 h-3 rounded-full bg-slate-700/50 border border-slate-600/30"
          />
          <span class="text-slate-400">ของแพทย์ท่านอื่น</span>
        </div>
      </div>
    </div>

    <div class="overflow-x-auto max-h-[600px]">
      <table class="w-full text-left text-sm border-collapse">
        <thead class="sticky top-0 bg-app-card/95 backdrop-blur-md z-10">
          <tr class="text-slate-500 border-b border-app-surface">
            <th
              class="px-4 py-4 font-bold uppercase tracking-wider text-[10px]"
            >
              AN
            </th>
            <th
              class="px-4 py-4 font-bold uppercase tracking-wider text-[10px]"
            >
              เวลาที่รับ
            </th>
            <th
              class="px-4 py-4 font-bold uppercase tracking-wider text-[10px]"
            >
              คนไข้ / HN
            </th>
            <th
              class="px-4 py-4 font-bold uppercase tracking-wider text-[10px]"
            >
              วินิจฉัย (ICD-10)
            </th>
            <th
              class="px-4 py-4 font-bold uppercase tracking-wider text-[10px]"
            >
              แพทย์ผู้รับ
            </th>
            <th
              class="px-4 py-4 font-bold uppercase tracking-wider text-[10px] text-center w-20"
            >
              สถานะ
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-app-surface/30">
          <tr
            v-for="record in records"
            :key="record.an"
            class="transition-all duration-200"
            :class="[
              isIncluded(record)
                ? 'bg-app-green/15 border-l-4 border-l-app-green hover:bg-app-green/25 shadow-inner'
                : 'bg-red-500/10 opacity-70 grayscale-[0.2] hover:opacity-100 hover:bg-red-500/15',
            ]"
          >
            <td class="px-4 py-4 font-mono text-[10px] text-slate-500">
              {{ record.an }}
            </td>
            <td class="px-4 py-4">
              <p class="text-slate-200 font-bold text-xs" :class="{ 'text-slate-500 font-medium': !isIncluded(record) }">
                {{ formatDate(record.admitDate) }}
              </p>
              <p class="text-[10px] text-slate-500 font-mono">
                {{ record.admitTime }}
              </p>
            </td>
            <td class="px-4 py-4">
              <p class="text-slate-100 font-bold" :class="{ 'text-slate-400': !isIncluded(record) }">{{ record.patientName }}</p>
              <p class="text-[10px] text-slate-500 font-mono">
                HN: {{ record.hn }}
              </p>
            </td>
            <td class="px-4 py-4">
              <div class="flex items-center gap-2">
                <span
                  class="px-1.5 py-0.5 bg-slate-800 rounded font-bold text-xs text-slate-300 ring-1 ring-white/5"
                  :class="{ 'opacity-50': !isIncluded(record) }"
                  >{{ record.icdCode }}</span
                >
                <span class="text-xs truncate max-w-[180px]" :class="isIncluded(record) ? 'text-slate-300' : 'text-slate-500'">{{
                  record.icdDescription
                }}</span>
              </div>
              <p
                class="text-[10px] text-slate-600 mt-0.5 italic truncate max-w-[240px]"
              >
                CC: {{ record.chiefComplaint }}
              </p>
            </td>
            <td class="px-4 py-4">
              <p class="text-xs" :class="isIncluded(record) ? 'text-slate-300' : 'text-slate-600'">{{ record.attendingDoctor }}</p>
            </td>
            <td class="px-4 py-4 text-center">
              <button
                class="w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-app-surface ring-1 ring-white/5 hover:ring-app-green/50 active:scale-90 group relative"
                :title="isIncluded(record) ? 'คลิกเพื่อข้ามรายการนี้' : 'คลิกเพื่อรวมรายการนี้'"
                @click="$emit('toggle-record', record.an)"
              >
                <div
                  v-if="isIncluded(record)"
                  class="w-5 h-5 bg-app-green mask-[url('/icons/fa-check-circle.svg')] mask-contain mask-no-repeat mask-center"
                />
                <div
                  v-else
                  class="w-5 h-5 bg-slate-600 mask-[url('/icons/fa-circle.svg')] mask-contain mask-no-repeat mask-center group-hover:bg-app-green/50"
                />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PatientRecord } from "@/composables/useExcelParser";
import { isSameDay } from "date-fns";

const props = defineProps<{
  records: PatientRecord[];
  doctorName: string;
  shiftDates: Date[];
  overrides: Set<string>;
  mode: "er" | "ward";
}>();

defineEmits<{
  (e: "toggle-record", an: string): void;
}>();

function isIncluded(record: PatientRecord): boolean {
  // Check if manually overridden
  const hasOverride = props.overrides.has(record.an);

  // Basic logic match
  const isShiftMatch = props.shiftDates.some((sd) =>
    isSameDay(record.roundingDate, sd),
  );
  let isDocMatch = record.attendingDoctor === props.doctorName;

  // If ward mode, we count all doctors except specific admits (but user can override)
  if (props.mode === "ward") {
    isDocMatch = true; // Wards are typically any doctor rounding the ward section
  }

  // Final status based on logic vs manual override toggle
  const logicMatch = isShiftMatch && isDocMatch;
  return hasOverride ? !logicMatch : logicMatch;
}

function formatDate(date: Date): string {
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}
</script>
