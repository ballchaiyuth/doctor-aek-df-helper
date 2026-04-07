<template>
  <div id="result-table">
    <!-- Summary bar -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-3">
        <span
          class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
          :class="
            mode === 'er'
              ? 'bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20'
              : 'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20'
          "
        >
          {{ mode === "er" ? "ER" : "Ward" }}
        </span>
        <span class="text-sm text-slate-400"> {{ rows.length }} รายการ </span>
      </div>

      <button
        class="inline-flex items-center gap-2 px-4 py-2 bg-app-green hover:bg-app-green-hover text-white text-sm font-medium rounded-xl shadow-lg ring-1 ring-inset ring-white/10 active:scale-[0.98] transition-all"
        @click="copyToClipboard"
      >
        <div
          class="w-4 h-4 bg-current mask-[url('/icons/fa-copy.svg')] mask-contain mask-no-repeat mask-center"
        />
        {{ copied ? "คัดลอกแล้ว ✓" : "คัดลอกทั้งหมด" }}
      </button>
    </div>

    <!-- Table -->
    <div
      class="bg-app-card rounded-xl border border-app-surface overflow-hidden shadow-sm"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-app-bg border-b border-app-surface">
            <tr>
              <th
                class="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider"
              >
                #
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider"
              >
                ชื่อ-นามสกุล
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider"
              >
                HN
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider"
              >
                วันที่รับ
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider"
              >
                รหัสหัตถการ
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-app-surface">
            <tr
              v-for="(row, index) in rows"
              :key="`${row.hn}-${row.admitDate}`"
              class="hover:bg-app-surface/50 transition-colors"
            >
              <td class="px-4 py-3 text-slate-500 font-mono text-xs">
                {{ index + 1 }}
              </td>
              <td class="px-4 py-3 text-slate-200 font-medium">
                {{ row.patientName }}
              </td>
              <td class="px-4 py-3 text-slate-400 font-mono">
                {{ row.hn }}
              </td>
              <td class="px-4 py-3 text-slate-400">
                {{ row.admitDate }}
              </td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold"
                  :class="
                    mode === 'er'
                      ? 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20'
                      : 'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20'
                  "
                >
                  {{ row.billingCode }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty state -->
      <div v-if="rows.length === 0" class="p-12 text-center">
        <p class="text-slate-500 text-sm">ไม่พบข้อมูล</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DfReportRow } from "@/composables/useDfCalculator";

const props = defineProps<{
  rows: DfReportRow[];
  mode: "er" | "ward";
}>();

const { toClipboardText } = useDfCalculator();
const copied = ref(false);

async function copyToClipboard() {
  const text = toClipboardText(props.rows);
  try {
    await navigator.clipboard.writeText(text);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  }
}
</script>
