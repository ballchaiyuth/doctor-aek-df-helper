<template>
  <div class="min-h-screen bg-app-bg text-slate-200 selection:bg-app-green/30">
    <AppHeader />

    <main class="max-w-5xl mx-auto px-6 py-8">
      <!-- Step 1: File Upload -->
      <section v-if="currentStep === 'upload'" class="animate-fade-in">
        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold text-slate-100 mb-2">
            อัปโหลดไฟล์ข้อมูล
          </h2>
          <p class="text-slate-400">
            ลากไฟล์ CSV หรือ Excel จากระบบโรงพยาบาลมาวางที่นี่
          </p>
        </div>

        <FileUploadZone @file-selected="onFileSelected" />

        <div
          v-if="parseError"
          class="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-red-400 text-sm"
        >
          {{ parseError }}
        </div>

        <!-- Loading state -->
        <div v-if="isLoading" class="mt-8 text-center">
          <div
            class="inline-flex items-center gap-3 px-6 py-3 bg-app-card rounded-xl border border-app-surface shadow-sm"
          >
            <div
              class="animate-spin w-5 h-5 bg-app-green mask-[url('/icons/fa-circle-notch.svg')] mask-contain mask-no-repeat mask-center"
            />
            <span class="text-sm text-slate-400">กำลังอ่านไฟล์...</span>
          </div>
        </div>
      </section>

      <!-- Step 2: Configuration -->
      <section v-if="currentStep === 'config'" class="animate-fade-in">
        <!-- Tab navigation -->
        <div class="flex justify-center mb-8">
          <div
            class="flex items-center gap-1 bg-app-card ring-1 ring-app-surface p-1.5 rounded-2xl shadow-xl max-w-sm w-full"
          >
            <button
              class="flex-1 py-3 px-6 text-sm font-bold rounded-xl transition-all duration-300 relative group overflow-hidden"
              :class="
                activeTab === 'er'
                  ? 'bg-app-surface text-app-green shadow-[0_0_20px_rgba(34,197,94,0.15)] ring-1 ring-white/5'
                  : 'text-slate-500 hover:text-slate-300'
              "
              @click="activeTab = 'er'"
            >
              <span
                class="relative z-10 flex items-center justify-center gap-2"
              >
                <span class="text-lg">🏥</span>
                <span>ER</span>
              </span>
            </button>
            <button
              class="flex-1 py-3 px-6 text-sm font-bold rounded-xl transition-all duration-300 relative group overflow-hidden"
              :class="
                activeTab === 'ward'
                  ? 'bg-app-surface text-app-green shadow-[0_0_20px_rgba(34,197,94,0.15)] ring-1 ring-white/5'
                  : 'text-slate-500 hover:text-slate-300'
              "
              @click="activeTab = 'ward'"
            >
              <span
                class="relative z-10 flex items-center justify-center gap-2"
              >
                <span class="text-lg">🛏️</span>
                <span>Ward</span>
              </span>
            </button>
          </div>
        </div>

        <!-- File info -->
        <div
          class="mb-8 p-5 bg-app-card rounded-2xl border border-app-surface flex items-center justify-between shadow-lg relative overflow-hidden"
        >
          <div class="absolute top-0 left-0 w-1 h-full bg-app-green/50" />
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 bg-app-green/10 rounded-xl flex items-center justify-center border border-app-green/20"
            >
              <div
                class="w-6 h-6 bg-app-green mask-[url('/icons/fa-circle-check.svg')] mask-contain mask-no-repeat mask-center"
              />
            </div>
            <div>
              <p
                class="text-sm font-bold text-slate-100 flex items-center gap-2"
              >
                <span>อ่านไฟล์สำเร็จ</span>
                <span
                  v-if="selectedFileName"
                  class="text-xs font-mono font-normal px-2 py-0.5 bg-white/5 rounded-full text-slate-400 border border-white/5"
                >
                  {{ selectedFileName }}
                </span>
              </p>
              <p class="text-xs text-slate-500 mt-1">
                {{ parsedData?.records.length }} รายการ ·
                {{ parsedData?.doctors.length }} แพทย์
              </p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <button
              class="px-4 py-2 text-xs text-app-green hover:bg-app-green/10 rounded-lg border border-app-green/20 font-medium transition-all"
              @click="showAudit = !showAudit"
            >
              {{ showAudit ? "ซ่อนข้อมูลดิบ" : "ตรวจสอบข้อมูลดิบ" }}
            </button>
            <button
              class="px-4 py-2 text-xs text-slate-400 hover:bg-white/5 rounded-lg border border-white/5 font-medium transition-all"
              @click="showFeeRates = true"
            >
              ตรวจสอบเรทค่าตอบแทน
            </button>
            <button
              class="px-4 py-2 text-xs text-slate-400 hover:text-red-400 hover:bg-red-400/5 rounded-lg border border-transparent hover:border-red-400/20 font-medium transition-all"
              @click="reset"
            >
              เปลี่ยนไฟล์
            </button>
          </div>
        </div>

        <!-- Source Audit View -->
        <div v-if="showAudit" class="mb-12">
          <SourceAuditTable
            :records="parsedData?.records || []"
            :doctor-name="selectedDoctor"
            :shift-dates="selectedShiftDates"
            :overrides="manualOverrides"
            :mode="activeTab"
            @toggle-record="toggleRecordOverride"
          />
        </div>

        <!-- ER Config -->
        <div v-if="activeTab === 'er'" class="space-y-6">
          <DoctorSelector
            v-model="selectedDoctor"
            :doctors="parsedData?.doctors || []"
          />
          <ShiftDateSelector
            v-model="selectedShiftDates"
            :dates="parsedData?.shiftDates || []"
          />
          <button
            class="w-full py-3 px-6 bg-app-green text-white font-semibold rounded-xl ring-1 ring-inset ring-white/10 hover:bg-app-green-hover active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!selectedDoctor || selectedShiftDates.length === 0"
            @click="generateERReport"
          >
            สร้างรายงาน ER
          </button>
        </div>

        <!-- Ward Config -->
        <div v-if="activeTab === 'ward'" class="space-y-6">
          <ShiftDateSelector
            v-model="selectedShiftDates"
            :dates="parsedData?.shiftDates || []"
          />
          <button
            class="w-full py-3 px-6 bg-app-green text-white font-semibold rounded-xl ring-1 ring-inset ring-white/10 hover:bg-app-green-hover active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="selectedShiftDates.length === 0"
            @click="generateWardReport"
          >
            สร้างรายงาน Ward
          </button>
        </div>
      </section>

      <!-- Step 3: Results -->
      <section v-if="currentStep === 'results'" class="animate-fade-in">
        <!-- Back button -->
        <button
          class="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 font-medium mb-6 transition-colors group"
          @click="currentStep = 'config'"
        >
          <div
            class="w-4 h-4 bg-current mask-[url('/icons/fa-arrow-left.svg')] mask-contain mask-no-repeat mask-center group-hover:-translate-x-1 transition-transform"
          />
          ย้อนกลับไปตั้งค่า
        </button>

        <ResultTable :rows="reportRows" :mode="activeTab" />
      </section>
    </main>

    <!-- Footer -->
    <footer
      class="text-center py-12 text-xs text-slate-500 border-t border-app-surface mt-12"
    >
      Made with ❤️ For Dr. Aek — Wiset Chai Chan Hospital
    </footer>

    <!-- Dialogs -->
    <FeeRateDialog v-model:visible="showFeeRates" />
  </div>
</template>

<script setup lang="ts">
import feeRatesRaw from "@/assets/data/wiset-doctor-fee-rates.csv?raw";
import type { DfReportRow } from "@/composables/useDfCalculator";
import type { ParsedData, PatientRecord } from "@/composables/useExcelParser";
import { initFeeRates } from "@/utils/fee-rates";
import { isSameDay } from "date-fns";

const { parseFile, isLoading, error: parseError } = useExcelParser();
const { calculateER, calculateWard } = useDfCalculator();

const currentStep = ref<"upload" | "config" | "results">("upload");
const activeTab = ref<"er" | "ward">("er");
const parsedData = ref<ParsedData | null>(null);
const selectedFileName = ref("");
const selectedDoctor = ref("");
const selectedShiftDates = ref<Date[]>([]);
const reportRows = ref<DfReportRow[]>([]);
const showAudit = ref(false);
const showFeeRates = ref(false);
const manualOverrides = ref(new Set<string>());

const AEK_NAME = "นายแพทย์สรวิชญ์ สอาดสุด";

onMounted(() => {
  initFeeRates(feeRatesRaw).catch(console.error);
});

async function onFileSelected(file: File) {
  try {
    selectedFileName.value = file.name;
    const data = await parseFile(file);
    parsedData.value = data;

    if (data.doctors.includes(AEK_NAME)) {
      selectedDoctor.value = AEK_NAME;
    }

    selectedShiftDates.value = [...data.shiftDates];
    currentStep.value = "config";
  } catch {
    // error handled in composable
  }
}

function toggleRecordOverride(an: string) {
  if (manualOverrides.value.has(an)) {
    manualOverrides.value.delete(an);
  } else {
    manualOverrides.value.add(an);
  }
}

/**
 * Applying overrides before generating reports
 */
function getProcessedRecords(): PatientRecord[] {
  if (!parsedData.value) return [];

  return parsedData.value.records.filter((r) => {
    // Logic match
    const isShiftMatch = selectedShiftDates.value.some((sd) =>
      isSameDay(r.roundingDate, sd),
    );
    const isDocMatch =
      activeTab.value === "er"
        ? r.attendingDoctor === selectedDoctor.value
        : true;

    const logicMatch = isShiftMatch && isDocMatch;
    const hasOverride = manualOverrides.value.has(r.an);

    // Final inclusion status (XOR)
    return hasOverride ? !logicMatch : logicMatch;
  });
}

function generateERReport() {
  if (!parsedData.value || !selectedDoctor.value) return;

  // We use the filtered records for the calculator
  const processed = getProcessedRecords();

  reportRows.value = calculateER(
    processed,
    selectedDoctor.value,
    selectedShiftDates.value,
  );
  currentStep.value = "results";
  showAudit.value = false;
}

function generateWardReport() {
  if (!parsedData.value) return;

  const processed = getProcessedRecords();

  reportRows.value = calculateWard(processed, selectedShiftDates.value);
  currentStep.value = "results";
  showAudit.value = false;
}

function reset() {
  currentStep.value = "upload";
  parsedData.value = null;
  selectedFileName.value = "";
  selectedDoctor.value = "";
  selectedShiftDates.value = [];
  reportRows.value = [];
  showAudit.value = false;
  manualOverrides.value.clear();
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
