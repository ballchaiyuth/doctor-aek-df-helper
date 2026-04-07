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
        <div
          class="flex gap-1 bg-app-card ring-1 ring-app-surface p-1 rounded-xl mb-6 max-w-xs"
        >
          <button
            class="flex-1 py-2.5 px-4 text-sm font-medium rounded-lg transition-all"
            :class="
              activeTab === 'er'
                ? 'bg-app-surface text-app-green shadow-sm border border-app-surface'
                : 'text-slate-400 hover:text-slate-200'
            "
            @click="activeTab = 'er'"
          >
            🏥 ER
          </button>
          <button
            class="flex-1 py-2.5 px-4 text-sm font-medium rounded-lg transition-all"
            :class="
              activeTab === 'ward'
                ? 'bg-app-surface text-app-green shadow-sm border border-app-surface'
                : 'text-slate-400 hover:text-slate-200'
            "
            @click="activeTab = 'ward'"
          >
            🛏️ Ward
          </button>
        </div>

        <!-- File info -->
        <div
          class="mb-6 p-4 bg-app-card rounded-xl border border-app-surface flex items-center justify-between"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 bg-app-green/10 rounded-lg flex items-center justify-center border border-app-green/20"
            >
              <div
                class="w-5 h-5 bg-app-green mask-[url('/icons/fa-circle-check.svg')] mask-contain mask-no-repeat mask-center"
              />
            </div>
            <div>
              <p class="text-sm font-medium text-slate-200">อ่านไฟล์สำเร็จ</p>
              <p class="text-xs text-slate-400">
                {{ parsedData?.records.length }} รายการ ·
                {{ parsedData?.doctors.length }} แพทย์ ·
                {{ parsedData?.shiftDates.length }} วันเวร
              </p>
            </div>
          </div>
          <button
            class="text-xs text-slate-400 hover:text-red-400 font-medium transition-colors"
            @click="reset"
          >
            เปลี่ยนไฟล์
          </button>
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
            class="w-full py-3 px-6 bg-app-green text-white font-semibold rounded-xl ring-1 ring-inset ring-white/10 hover:bg-app-green-hover active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-app-green disabled:active:scale-100"
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
            class="w-full py-3 px-6 bg-app-green text-white font-semibold rounded-xl ring-1 ring-inset ring-white/10 hover:bg-app-green-hover active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-app-green disabled:active:scale-100"
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
          class="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 font-medium mb-6 transition-colors"
          @click="currentStep = 'config'"
        >
          <div
            class="w-4 h-4 bg-current mask-[url('/icons/fa-arrow-left.svg')] mask-contain mask-no-repeat mask-center"
          />
          ย้อนกลับ
        </button>

        <ResultTable :rows="reportRows" :mode="activeTab" />
      </section>
    </main>

    <!-- Footer -->
    <footer class="text-center py-8 text-xs text-slate-400">
      Made with ❤️ for Dr. Aek — Wiset Chai Chan Hospital
    </footer>
  </div>
</template>

<script setup lang="ts">
import type { ParsedData } from "@/composables/useExcelParser";
import type { DfReportRow } from "@/composables/useDfCalculator";

const { parseFile, isLoading, error: parseError } = useExcelParser();
const { calculateER, calculateWard } = useDfCalculator();

const currentStep = ref<"upload" | "config" | "results">("upload");
const activeTab = ref<"er" | "ward">("er");
const parsedData = ref<ParsedData | null>(null);
const selectedDoctor = ref("");
const selectedShiftDates = ref<Date[]>([]);
const reportRows = ref<DfReportRow[]>([]);

async function onFileSelected(file: File) {
  try {
    const data = await parseFile(file);
    parsedData.value = data;
    currentStep.value = "config";
  } catch {
    // error is already set in the composable
  }
}

function generateERReport() {
  if (!parsedData.value || !selectedDoctor.value) return;

  reportRows.value = calculateER(
    parsedData.value.records,
    selectedDoctor.value,
    selectedShiftDates.value,
  );
  currentStep.value = "results";
}

function generateWardReport() {
  if (!parsedData.value) return;

  reportRows.value = calculateWard(
    parsedData.value.records,
    selectedShiftDates.value,
  );
  currentStep.value = "results";
}

function reset() {
  currentStep.value = "upload";
  parsedData.value = null;
  selectedDoctor.value = "";
  selectedShiftDates.value = [];
  reportRows.value = [];
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
