<template>
  <div id="result-table" class="space-y-12 animate-fade-in">
    <!-- Top Action Bar -->
    <div
      class="flex items-center justify-between bg-app-card/50 p-6 rounded-3xl border border-app-surface backdrop-blur-md shadow-xl"
    >
      <div class="flex items-center gap-6">
        <label class="flex items-center gap-3 cursor-pointer group">
          <div
            class="relative w-12 h-6 bg-slate-700 rounded-full transition-all group-hover:bg-slate-600 ring-2 ring-transparent group-focus-within:ring-app-green/30"
            :class="{
              'bg-app-green shadow-[0_0_15px_rgba(34,197,94,0.3)]': showDetails,
            }"
          >
            <div
              class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300"
              :class="{ 'translate-x-6': showDetails }"
            />
            <input v-model="showDetails" type="checkbox" class="hidden" />
          </div>
          <div class="flex flex-col">
            <span
              class="text-sm font-bold text-slate-200 group-hover:text-white transition-colors"
              >แสดงข้อมูลวินิจฉัยทางการแพทย์</span
            >
            <span class="text-[10px] text-slate-500 font-medium"
              >Chief Complaint & ICD-10 Description</span
            >
          </div>
        </label>

        <div class="h-8 w-px bg-app-surface mx-2" />

        <label class="flex items-center gap-3 cursor-pointer group">
          <div
            class="relative w-5 h-5 border-2 rounded-lg transition-all duration-200 flex items-center justify-center"
            :class="
              copyMedicalDetails
                ? 'bg-app-green border-app-green'
                : 'border-slate-600 group-hover:border-slate-500'
            "
          >
            <div
              v-if="copyMedicalDetails"
              class="w-3 h-3 bg-white mask-[url('/icons/fa-check.svg')] mask-contain mask-no-repeat"
            />
            <input
              v-model="copyMedicalDetails"
              type="checkbox"
              class="hidden"
            />
          </div>
          <span
            class="text-xs font-medium text-slate-400 group-hover:text-slate-300"
            >คัดลอกรายละเอียดการแพทย์ไปด้วย</span
          >
        </label>
      </div>

      <div
        class="text-[10px] text-slate-500 font-mono italic text-right max-w-[200px]"
      >
        * ข้อมูลทางการแพทย์ปกติจะไม่ถูกต้องตามรูปแบบ Excel ของโรงพยาบาล
        โปรดตรวจสอบก่อนวาง
      </div>
    </div>

    <div
      v-if="rows.length === 0"
      class="bg-app-card rounded-2xl border border-app-surface p-16 text-center shadow-inner"
    >
      <div
        class="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5 ring-8 ring-white/2"
      >
        <div
          class="w-10 h-10 bg-slate-500 mask-[url('/icons/fa-folder-open.svg')] mask-contain mask-no-repeat mask-center"
        />
      </div>
      <p class="text-slate-500 font-medium tracking-tight">
        ไม่พบข้อมูลที่ตรงตามเงื่อนไขการค้นหาของคุณ
      </p>
    </div>

    <!-- Date Groups -->
    <div
      v-for="(groupRows, date) in groupedRows"
      :key="date"
      class="space-y-10 animate-slide-up"
    >
      <!-- Group header -->
      <div class="flex items-end justify-between px-2">
        <div class="flex items-center gap-4">
          <div
            class="w-14 h-14 rounded-2xl bg-app-surface border border-white/5 flex flex-col items-center justify-center shadow-lg group relative overflow-hidden"
          >
            <div
              class="absolute inset-0 bg-app-green/5 opacity-0 group-hover:opacity-100 transition-opacity"
            />
            <span class="text-[10px] font-bold text-slate-500 uppercase">{{
              formatStylishDate(date).rest.split(" ")[0]
            }}</span>
            <span class="text-xl font-black text-white leading-none">{{
              formatStylishDate(date).number
            }}</span>
          </div>
          <div>
            <h3
              class="text-2xl font-black text-white tracking-tighter flex items-center gap-2"
            >
              {{ date }}
              <span
                class="text-xs font-bold px-2 py-0.5 bg-white/5 rounded-lg border border-white/5 text-slate-500"
                >{{ groupRows.length }} เคสรวม</span
              >
            </h3>
            <p
              class="text-xs text-slate-500 font-mono uppercase tracking-widest mt-0.5"
            >
              {{
                mode === "er" ? "Emergency Room Report" : "Ward Rounding Report"
              }}
            </p>
          </div>
        </div>

        <div class="flex flex-col items-end gap-3">
          <div class="flex items-center gap-3">
            <!-- Copy Raw Data Button -->
            <button
              class="inline-flex items-center gap-3 px-6 py-3 bg-app-surface hover:bg-app-surface-hover text-white text-sm font-bold rounded-2xl shadow-xl ring-1 ring-inset ring-white/10 active:scale-95 transition-all group overflow-hidden relative"
              @click="copyGroupToClipboard(groupRows, date)"
            >
              <div
                class="absolute inset-0 bg-app-green/10 opacity-0 group-hover:opacity-100 transition-opacity"
              />
              <div
                :class="[
                  'w-4 h-4 mask-contain mask-no-repeat mask-center transition-all relative z-10',
                  copiedDate === date
                    ? 'bg-app-green mask-[url(/icons/fa-check.svg)] scale-110'
                    : 'bg-slate-300 group-hover:bg-app-green mask-[url(/icons/fa-copy.svg)]',
                ]"
              />
              <span class="relative z-10">
                {{
                  copiedDate === date
                    ? "คัดลอกข้อมูลเรียบร้อย"
                    : "คัดลอกข้อมูลดิบทั้งวัน"
                }}
              </span>
            </button>

            <!-- Smart Copy Button (ER Only) -->
            <button
              v-if="
                mode === 'er' &&
                getDailyRevenue(groupRows).shifts.some((s) => s.isBelowMinimum)
              "
              class="inline-flex items-center gap-3 px-6 py-3 bg-app-green hover:bg-app-green-hover text-white text-sm font-bold rounded-2xl shadow-xl shadow-app-green/20 active:scale-95 transition-all group overflow-hidden relative"
              @click="copySmartToClipboard(groupRows, date)"
            >
              <div
                class="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
              />
              <div
                class="w-4 h-4 bg-white mask-[url(/icons/fa-wand-magic-sparkles.svg)] mask-contain mask-no-repeat transition-all relative z-10"
                :class="{ 'scale-110': copiedSmartDate === date }"
              />
              <span class="relative z-10">
                {{
                  copiedSmartDate === date
                    ? "คัดลอกแบบ Smart แล้ว!"
                    : "คัดลอกรายงานแบบ Smart"
                }}
              </span>
            </button>
          </div>

          <!-- Disclaimer for ER Claim -->
          <p
            v-if="
              mode === 'er' &&
              getDailyRevenue(groupRows).shifts.some((s) => s.isBelowMinimum)
            "
            class="text-[10px] text-slate-500 font-bold italic tracking-tight"
          >
            * ปุ่ม Smart จะช่วยยุบเวรที่ยอดไม่ถึง 1,200.- ให้อัตโนมัติ
            (อ้างอิงจากฐาน 3 เวร/วัน โปรดตรวจสอบจำนวนเวรจริงก่อนนำไปวาง)
          </p>
        </div>
      </div>

      <!-- Shift Grouping (ER only) -->
      <div v-if="mode === 'er'" class="space-y-6">
        <div
          v-for="shift in getShiftGroups(date)"
          :key="shift.label"
          class="relative p-1 transition-all duration-500 rounded-5xl"
          :class="
            shift.isBelowMinimum
              ? 'ring-2 ring-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.15)] bg-red-500/3'
              : ''
          "
        >
          <!-- Shift Header Badge -->
          <div class="flex items-center justify-between mb-4 px-6">
            <div class="flex items-center gap-3">
              <div
                class="px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase flex items-center gap-2"
                :class="
                  shift.isBelowMinimum
                    ? 'bg-red-500 text-white'
                    : 'bg-app-surface text-slate-400 border border-white/5'
                "
              >
                <div
                  class="w-3 h-3 bg-current"
                  :class="
                    shift.isBelowMinimum
                      ? 'mask-[url(/icons/fa-triangle-exclamation.svg)]'
                      : 'mask-[url(/icons/fa-clock.svg)]'
                  "
                />
                {{ shift.label }}
              </div>
              <div
                v-if="shift.isBelowMinimum"
                class="text-[10px] font-bold text-red-500 animate-pulse"
              >
                ยอดไม่ถึง 1,200.- (ปัจจุบัน {{ shift.subtotal }} THB)
              </div>
            </div>
          </div>

          <!-- Table for this shift -->
          <div
            v-if="shift.rows.length > 0"
            class="bg-app-card rounded-4xl border border-app-surface overflow-hidden shadow-2xl backdrop-blur-sm"
          >
            <div class="overflow-x-auto">
              <table class="w-full text-sm border-collapse">
                <thead class="bg-app-bg/40 border-b border-app-surface">
                  <tr>
                    <th
                      class="w-12 px-6 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest"
                    >
                      #
                    </th>
                    <th
                      class="px-6 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest"
                    >
                      ข้อมูลผู้ป่วย / เวลา
                    </th>
                    <th
                      v-if="showDetails"
                      class="px-6 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest"
                    >
                      การวินิจฉัย (ICD-10)
                    </th>
                    <th
                      class="w-44 px-6 py-5 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest"
                    >
                      หัตถการ
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-app-surface/30">
                  <tr
                    v-for="(row, idx) in shift.rows"
                    :key="row.an"
                    class="group/row hover:bg-white/2 transition-colors"
                    :class="{ 'bg-red-500/2': row.isIncorrect }"
                  >
                    <td
                      class="px-6 py-5 text-slate-600 font-mono text-[10px] align-top font-bold"
                    >
                      {{ (idx + 1).toString().padStart(2, "0") }}
                    </td>
                    <td class="px-6 py-5 align-top">
                      <div class="flex flex-col">
                        <div
                          class="text-slate-100 font-bold group-hover/row:text-app-green transition-colors flex items-center gap-2"
                        >
                          {{ row.patientName }}
                          <span
                            class="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-white/5 rounded text-slate-500 border border-white/5"
                            >{{ row.admitTime }}</span
                          >
                        </div>
                        <div
                          class="text-[10px] text-slate-500 font-mono font-bold tracking-wider opacity-60 mt-1"
                        >
                          HN {{ row.hn }}
                        </div>
                      </div>
                    </td>
                    <td
                      v-if="showDetails"
                      class="px-6 py-5 align-top min-w-[280px]"
                    >
                      <div class="flex flex-col gap-1.5">
                        <div
                          v-if="row.chiefComplaint"
                          class="text-[11px] text-app-green/90 font-bold italic leading-tight"
                        >
                          "{{ row.chiefComplaint }}"
                        </div>
                        <div class="flex items-start gap-2">
                          <span
                            class="px-1.5 py-0.5 bg-slate-800 rounded font-black text-[9px] text-slate-400 mt-0.5"
                            >{{ row.icdCode }}</span
                          >
                          <span
                            class="text-[11px] text-slate-400 leading-normal line-clamp-2"
                            >{{ row.icdDescription }}</span
                          >
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-5 text-right align-top">
                      <div class="flex flex-col items-end gap-1.5">
                        <button
                          class="inline-flex items-center px-3 py-1.5 rounded-xl text-[11px] font-black font-mono transition-all group/code border h-8"
                          :class="[
                            row.isIncorrect
                              ? 'bg-red-500 text-white border-red-400'
                              : 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-400',
                          ]"
                          @click="toggleIncorrect(row)"
                        >
                          <div
                            v-if="row.isIncorrect"
                            class="w-3.5 h-3.5 bg-white mr-1.5 mask-[url('/icons/fa-triangle-exclamation.svg')] mask-contain mask-no-repeat"
                          />
                          <span>{{
                            row.manualBillingCode || row.billingCode
                          }}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Empty Shift State -->
          <div
            v-else
            class="bg-app-card/30 rounded-4xl border border-app-surface/50 border-dashed p-10 text-center flex flex-col items-center justify-center"
          >
            <div
              class="w-12 h-12 bg-app-surface rounded-full flex items-center justify-center mb-4 text-slate-600"
            >
              <div
                class="w-5 h-5 bg-current mask-[url('/icons/fa-user-nurse.svg')] mask-contain mask-no-repeat"
              />
            </div>
            <p
              class="text-xs font-bold text-slate-500 uppercase tracking-widest"
            >
              No patients recorded for this shift
            </p>
            <p class="text-[10px] text-slate-600 mt-1 italic">
              แต่หมอยังสามารถเบิกค่าตอบแทนพื้นฐาน 1,200 บาทได้ตามระเบียบ
            </p>
          </div>
        </div>
      </div>

      <!-- Ward Table (Original simplified grouping) -->
      <div
        v-else
        class="bg-app-card rounded-4xl border border-app-surface overflow-hidden shadow-2xl backdrop-blur-sm transition-all"
      >
        <div class="overflow-x-auto">
          <table class="w-full text-sm border-collapse">
            <thead class="bg-app-bg/40 border-b border-app-surface">
              <tr>
                <th
                  class="w-12 px-6 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest"
                >
                  #
                </th>
                <th
                  class="px-6 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest"
                >
                  ข้อมูลผู้ป่วย / เวลา
                </th>
                <th
                  v-if="showDetails"
                  class="px-6 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest"
                >
                  การวินิจฉัย (ICD-10)
                </th>
                <th
                  class="w-44 px-6 py-5 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest"
                >
                  หัตถการ
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-app-surface/30">
              <tr
                v-for="(row, idx) in groupRows"
                :key="row.an"
                class="group/row hover:bg-white/2 transition-colors"
              >
                <td
                  class="px-6 py-5 text-slate-600 font-mono text-[10px] align-top font-bold"
                >
                  {{ (idx + 1).toString().padStart(2, "0") }}
                </td>
                <td class="px-6 py-5 align-top">
                  <div class="flex flex-col">
                    <div
                      class="text-slate-100 font-bold group-hover/row:text-app-green transition-colors flex items-center gap-2"
                    >
                      {{ row.patientName }}
                      <span
                        class="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-white/5 rounded text-slate-500 border border-white/5"
                        >{{ row.admitTime }}</span
                      >
                    </div>
                  </div>
                </td>
                <td
                  v-if="showDetails"
                  class="px-6 py-5 align-top min-w-[280px]"
                >
                  <div class="flex flex-col gap-1.5">
                    <div
                      v-if="row.chiefComplaint"
                      class="text-[11px] text-app-green/90 font-bold italic leading-tight"
                    >
                      "{{ row.chiefComplaint }}"
                    </div>
                    <div class="flex items-start gap-2">
                      <span
                        class="px-1.5 py-0.5 bg-slate-800 rounded font-black text-[9px] text-slate-400 mt-0.5"
                        >{{ row.icdCode }}</span
                      >
                      <span
                        class="text-[11px] text-slate-400 leading-normal line-clamp-2"
                        >{{ row.icdDescription }}</span
                      >
                    </div>
                  </div>
                </td>
                <td class="px-6 py-5 text-right align-top">
                  <button
                    class="inline-flex items-center px-3 py-1.5 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-xl text-[11px] font-black font-mono"
                  >
                    213
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Ward Daily Revenue Summary -->
        <div
          class="p-6 bg-app-surface/30 border-t border-app-surface flex items-center justify-between"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl bg-app-green/10 flex items-center justify-center border border-app-green/20"
            >
              <div
                class="w-5 h-5 bg-app-green mask-[url('/icons/fa-wallet.svg')] mask-contain mask-no-repeat"
              />
            </div>
            <div>
              <p
                class="text-[10px] font-black text-slate-500 uppercase tracking-widest"
              >
                Daily Revenue Summary
              </p>
              <p class="text-xs font-bold text-slate-300">
                สรุปยอดเงินวันที่ {{ date }}
              </p>
            </div>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-3xl font-black text-white tracking-tighter">{{
              getDailyRevenue(groupRows).total.toLocaleString()
            }}</span>
            <span
              class="text-xs font-black text-app-green uppercase tracking-wider"
              >THB</span
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Revenue Summary Section (Global Overview) -->
    <div class="mt-20 space-y-8 animate-fade-in">
      <div class="flex items-center gap-4 px-2">
        <div
          class="w-10 h-10 rounded-2xl bg-app-green/10 flex items-center justify-center border border-app-green/20"
        >
          <div
            class="w-5 h-5 bg-app-green mask-[url('/icons/fa-chart-pie.svg')] mask-contain mask-no-repeat"
          />
        </div>
        <h3 class="text-2xl font-black text-white tracking-tight">
          สรุปภาพรวมทั้งหมด (Set Summary)
        </h3>
        <div
          class="h-px flex-1 bg-linear-to-r from-app-surface to-transparent"
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <!-- Stat Card: Total Patients -->
        <div
          class="bg-app-card border border-app-surface rounded-4xl p-10 relative overflow-hidden group shadow-2xl"
        >
          <div
            class="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl transition-transform duration-1000 group-hover:scale-150"
          />
          <div class="flex items-center gap-3 mb-6">
            <div
              class="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20"
            >
              <div
                class="w-4 h-4 bg-blue-500 mask-[url('/icons/fa-users.svg')] mask-contain mask-no-repeat"
              />
            </div>
            <p
              class="text-[10px] font-black text-blue-500 uppercase tracking-widest"
            >
              Total Patients
            </p>
          </div>
          <div class="flex items-baseline gap-3">
            <span class="text-6xl font-black text-white tracking-tighter">{{
              rows.length
            }}</span>
            <span
              class="text-blue-500 font-bold text-xl uppercase tracking-widest"
              >เคส</span
            >
          </div>
        </div>

        <!-- Stat Card: Working Days -->
        <div
          class="bg-app-card border border-app-surface rounded-4xl p-10 relative overflow-hidden group shadow-2xl"
        >
          <div
            class="absolute -right-10 -bottom-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl transition-transform duration-1000 group-hover:scale-150"
          />
          <div class="flex items-center gap-3 mb-6">
            <div
              class="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20"
            >
              <div
                class="w-4 h-4 bg-amber-500 mask-[url('/icons/fa-calendar-check.svg')] mask-contain mask-no-repeat"
              />
            </div>
            <p
              class="text-[10px] font-black text-amber-500 uppercase tracking-widest"
            >
              Working Days
            </p>
          </div>
          <div class="flex items-baseline gap-3">
            <span class="text-6xl font-black text-white tracking-tighter">{{
              Object.keys(groupedRows).length
            }}</span>
            <span
              class="text-amber-500 font-bold text-xl uppercase tracking-widest"
              >วัน</span
            >
          </div>
        </div>

        <!-- Stat Card: Total Revenue -->
        <div
          class="bg-app-green/5 border border-app-green/10 rounded-4xl p-10 relative overflow-hidden group shadow-2xl"
        >
          <div
            class="absolute -right-10 -bottom-10 w-40 h-40 bg-app-green/10 rounded-full blur-3xl transition-transform duration-1000 group-hover:scale-150"
          />
          <div class="flex items-center gap-3 mb-6">
            <div
              class="w-8 h-8 rounded-lg bg-app-green/10 flex items-center justify-center border border-app-green/20"
            >
              <div
                class="w-4 h-4 bg-app-green mask-[url('/icons/fa-hand-holding-dollar.svg')] mask-contain mask-no-repeat"
              />
            </div>
            <p
              class="text-[10px] font-black text-app-green uppercase tracking-widest"
            >
              Estimated Real Income (Smart)
            </p>
          </div>
          <div class="flex items-baseline gap-3">
            <span class="text-6xl font-black text-white tracking-tighter">{{
              calculateRevenueSummary(rows, mode).smartTotal.toLocaleString()
            }}</span>
            <span
              class="text-app-green font-bold text-xl uppercase tracking-widest"
              >THB</span
            >
          </div>
          <p
            class="text-[9px] text-slate-500 mt-6 leading-relaxed font-bold italic uppercase tracking-tighter opacity-60"
          >
            * รวมยอดการันตีขั้นต่ำ 1,200.- ในกะที่ยอดรายเคสไม่ถึง
          </p>
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

const { toClipboardText, calculateRevenueSummary } = useDfCalculator();
const copiedDate = ref<string | null>(null);
const copiedSmartDate = ref<string | null>(null);
const showDetails = ref(true); // Auto ON by default
const copyMedicalDetails = ref(false); // Default OFF

/**
 * Get revenue summary for a specific group of rows
 */
function getDailyRevenue(groupRows: DfReportRow[]) {
  return calculateRevenueSummary(groupRows, props.mode);
}

/**
 * NEW: Get rows grouped by shift for a specific date
 */
function getShiftGroups(date: string) {
  const dateRows = groupedRows.value[date] || [];
  const summary = calculateRevenueSummary(dateRows, props.mode);

  return summary.shifts.map((shift) => {
    const shiftRows = dateRows.filter((row) => {
      const timeParts = (row.admitTime || "0:0").split(":");
      const h = parseInt(timeParts[0] || "1", 10);
      const m = parseInt(timeParts[1] || "1", 10);
      const t = h * 60 + m;
      return t >= shift.startMin && t < shift.endMin;
    });

    return {
      ...shift,
      rows: shiftRows,
    };
  });
}

/**
 * Toggle incorrect status and allow manual editing
 */
function toggleIncorrect(row: DfReportRow) {
  if (!row.isIncorrect) {
    const newCode = prompt(
      `ระบุรหัสหัตถการใหม่ (หรือพิมพ์ "ผิด" เพื่อทำเครื่องหมาย):`,
      "ผิด",
    );
    if (newCode !== null) {
      row.isIncorrect = newCode === "ผิด";
      row.manualBillingCode = newCode;
    }
  } else {
    row.isIncorrect = false;
    row.manualBillingCode = undefined;
  }
}

/**
 * Smart Copy for ER: Combine claims for low shifts + raw for high shifts
 */
async function copySmartToClipboard(_groupRows: DfReportRow[], date: string) {
  const shiftGroups = getShiftGroups(date);
  const belowMinShifts = shiftGroups.filter((s) => s.isBelowMinimum);
  const overMinShifts = shiftGroups.filter((s) => !s.isBelowMinimum);

  const finalLines: string[] = [];

  // Add the consolidated claim row if there are low shifts
  if (belowMinShifts.length > 0) {
    const claimText = `รับอัตราค่าตอบแทนปกติตามข้อ 1 จำนวน ${belowMinShifts.length} เวร`;
    finalLines.push(claimText);
  }

  // Add raw patient rows for shifts that are over the minimum
  for (const shift of overMinShifts) {
    if (shift.rows.length > 0) {
      const text = toClipboardText(shift.rows, {
        includeDetails: copyMedicalDetails.value,
      });
      finalLines.push(text);
    }
  }

  const resultText = finalLines.join("\n");

  try {
    await navigator.clipboard.writeText(resultText);
    copiedSmartDate.value = date;
    setTimeout(() => {
      if (copiedSmartDate.value === date) copiedSmartDate.value = null;
    }, 2000);
  } catch (err) {
    console.error("Failed to copy smart report:", err);
  }
}

/**
 * Format a date string (d/M/yyyy) into a stylish display format.
 */
function formatStylishDate(dateStr: string): {
  number: string;
  suffix: string;
  rest: string;
} {
  try {
    const date = parse(dateStr, "d/M/yyyy", new Date());
    const formatted = format(date, "do MMM yyyy");
    const match = formatted.match(/^(\d+)(st|nd|rd|th)\s(.+)$/);
    if (match) {
      return {
        number: match[1] || "",
        suffix: match[2] || "",
        rest: match[3] || "",
      };
    }
  } catch (e) {
    console.error("Date parse error", e);
  }
  return { number: dateStr, suffix: "", rest: "" };
}

// Group rows by roundingDate
const groupedRows = computed(() => {
  const groups: Record<string, DfReportRow[]> = {};
  if (!props.rows) return groups;

  const sortedRows = [...props.rows].sort((a, b) => {
    const dateA = a.roundingDate.split("/").reverse().join("-");
    const dateB = b.roundingDate.split("/").reverse().join("-");
    const roundComp = dateA.localeCompare(dateB);
    if (roundComp !== 0) return roundComp;
    return a.an.localeCompare(b.an);
  });

  for (const row of sortedRows) {
    const date = row.roundingDate;
    if (!groups[date]) groups[date] = [];
    groups[date].push(row);
  }
  return groups;
});

async function copyGroupToClipboard(groupRows: DfReportRow[], date: string) {
  const text = toClipboardText(groupRows, {
    includeDetails: copyMedicalDetails.value,
  });
  try {
    await navigator.clipboard.writeText(text);
    copiedDate.value = date;
    setTimeout(() => {
      if (copiedDate.value === date) copiedDate.value = null;
    }, 2000);
  } catch (err) {
    console.error("Failed to copy:", err);
  }
}
</script>
