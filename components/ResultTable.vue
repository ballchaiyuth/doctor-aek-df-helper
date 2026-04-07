<template>
  <div id="result-table" class="space-y-8">
    <div
      v-if="rows.length === 0"
      class="bg-app-card rounded-xl border border-app-surface p-12 text-center shadow-sm"
    >
      <p class="text-slate-500 text-sm">ไม่พบข้อมูล</p>
    </div>

    <!-- Date Groups -->
    <div v-for="(groupRows, date) in groupedRows" :key="date" class="space-y-4">
      <!-- Group header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-xl bg-app-surface border border-white/5 flex items-center justify-center shadow-inner"
          >
            <div
              class="w-5 h-5 bg-app-green mask-[url('/icons/fa-calendar.svg')] mask-contain mask-no-repeat mask-center"
            />
          </div>
          <div>
            <h3 class="text-slate-100 font-bold tracking-tight">
              <template v-if="formatStylishDate(date).suffix">
                <span>{{ formatStylishDate(date).number }}</span
                ><sup class="text-[0.6em] ml-0.5 opacity-60 uppercase">{{
                  formatStylishDate(date).suffix
                }}</sup
                ><span class="ml-1.5">{{ formatStylishDate(date).rest }}</span>
              </template>
              <template v-else>
                {{ date }}
              </template>
            </h3>
            <p
              class="text-xs text-slate-500 font-mono uppercase tracking-widest"
            >
              {{ groupRows.length }}
              {{ mode === "er" ? "ER" : "Ward" }} Patients
            </p>
          </div>
        </div>

        <button
          class="inline-flex items-center gap-2 px-4 py-2 bg-app-surface hover:bg-app-surface-hover text-slate-200 text-sm font-medium rounded-xl shadow-lg ring-1 ring-inset ring-white/5 active:scale-[0.98] transition-all group"
          @click="copyGroupToClipboard(groupRows, date)"
        >
          <div
            :class="[
              'w-4 h-4 mask-contain mask-no-repeat mask-center transition-colors',
              copiedDate === date
                ? 'bg-app-green mask-[url(/icons/fa-check.svg)]'
                : 'bg-slate-400 group-hover:bg-app-green mask-[url(/icons/fa-copy.svg)]',
            ]"
          />
          <span
            :class="
              copiedDate === date
                ? 'text-app-green'
                : 'text-slate-300 group-hover:text-white'
            "
          >
            {{
              copiedDate === date
                ? "คัดลอก " +
                  formatStylishDate(date).number +
                  formatStylishDate(date).suffix +
                  " " +
                  formatStylishDate(date).rest +
                  " แล้ว"
                : "คัดลอกข้อมูล " +
                  formatStylishDate(date).number +
                  formatStylishDate(date).suffix +
                  " " +
                  formatStylishDate(date).rest
            }}
          </span>
        </button>
      </div>

      <!-- Table -->
      <div
        class="bg-app-card rounded-2xl border border-app-surface overflow-hidden shadow-2xl backdrop-blur-sm"
      >
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-app-bg/50 border-b border-app-surface">
              <tr>
                <th
                  class="w-16 px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest"
                >
                  #
                </th>
                <th
                  class="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest"
                >
                  ชื่อ-นามสกุล
                </th>
                <th
                  class="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest"
                >
                  HN
                </th>
                <th
                  class="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest"
                >
                  วัน Admit
                </th>
                <th
                  class="w-32 px-4 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-widest"
                >
                  รหัสหัตถการ
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-app-surface/30">
              <tr
                v-for="(row, index) in groupRows"
                :key="`${row.hn}-${row.admitDate}`"
                class="group/row hover:bg-white/2 transition-colors"
              >
                <td class="px-4 py-4 text-slate-500 font-mono text-xs">
                  {{ index + 1 }}
                </td>
                <td class="px-4 py-4">
                  <div
                    class="text-slate-200 font-medium group-hover/row:text-app-green transition-colors"
                  >
                    {{ row.patientName }}
                  </div>
                </td>
                <td
                  class="px-4 py-4 text-slate-400 font-mono text-xs tracking-wider"
                >
                  {{ row.hn }}
                </td>
                <td class="px-4 py-4 text-slate-400 font-mono text-xs">
                  {{ row.admitDate }}
                </td>
                <td class="px-4 py-4 text-right">
                  <span
                    class="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all"
                    :class="
                      mode === 'er'
                        ? 'bg-amber-500/10 text-amber-400 ring-1 ring-inset ring-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.05)]'
                        : 'bg-blue-500/10 text-blue-400 ring-1 ring-inset ring-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.05)]'
                    "
                  >
                    {{ row.billingCode }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DfReportRow } from "@/composables/useDfCalculator";
import { format, parse } from "date-fns";

const props = defineProps<{
  rows: DfReportRow[];
  mode: "er" | "ward";
}>();

const { toClipboardText } = useDfCalculator();
const copiedDate = ref<string | null>(null);

/**
 * Format a date string (d/M/yyyy) into a stylish display format.
 * Returns an object with the parts to allow superscript rendering.
 */
function formatStylishDate(dateStr: string) {
  try {
    const date = parse(dateStr, "d/M/yyyy", new Date());
    // Format to "do MMM yyyy" -> "2nd Nov 2025"
    const formatted = format(date, "do MMM yyyy");
    // Split into [number, suffix, month/year]
    const match = formatted.match(/^(\d+)(st|nd|rd|th)\s(.+)$/);
    if (match) {
      return {
        number: match[1],
        suffix: match[2],
        rest: match[3],
      };
    }
    return { number: dateStr, suffix: "", rest: "" };
  } catch {
    return { number: dateStr, suffix: "", rest: "" };
  }
}

// Group rows by roundingDate (the shift date from CSV header)
const groupedRows = computed(() => {
  const groups: Record<string, DfReportRow[]> = {};

  if (!props.rows) return groups;

  // Sort rows by rounding date first
  const sortedRows = [...props.rows].sort((a, b) => {
    const dateA = a.roundingDate.split("/").reverse().join("-");
    const dateB = b.roundingDate.split("/").reverse().join("-");

    // Primary sort by rounding date
    const roundComp = dateA.localeCompare(dateB);
    if (roundComp !== 0) return roundComp;

    // Secondary sort by AN (Admission Number) for correct sequential order
    return a.an.localeCompare(b.an);
  });

  for (const row of sortedRows) {
    const date = row.roundingDate;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(row);
  }
  return groups;
});

async function copyGroupToClipboard(groupRows: DfReportRow[], date: string) {
  const text = toClipboardText(groupRows);
  try {
    await navigator.clipboard.writeText(text);
    copiedDate.value = date;
    setTimeout(() => {
      if (copiedDate.value === date) {
        copiedDate.value = null;
      }
    }, 2000);
  } catch (err) {
    console.error("Failed to copy:", err);
    // Fallback for older browsers
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);

    copiedDate.value = date;
    setTimeout(() => {
      if (copiedDate.value === date) {
        copiedDate.value = null;
      }
    }, 2000);
  }
}
</script>
