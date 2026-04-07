<template>
  <div
    id="file-upload-zone"
    class="relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer group"
    :class="[
      isDragging
        ? 'border-app-green bg-app-green scale-[1.01] shadow-xl shadow-app-green/20'
        : 'border-app-surface bg-app-card hover:border-app-green hover:bg-app-green/10',
    ]"
    @dragenter.prevent="onDragEnter"
    @dragover.prevent="onDragOver"
    @dragleave.prevent="onDragLeave"
    @drop.prevent="onDrop"
    @click="openFileDialog"
  >
    <input
      ref="fileInput"
      type="file"
      class="hidden"
      accept=".csv,.xlsx,.xls"
      @change="onFileSelected"
    />

    <!-- Icon -->
    <div class="flex justify-center mb-4">
      <div
        class="w-16 h-16 rounded-2xl flex items-center justify-center transition-all"
        :class="
          isDragging
            ? 'bg-app-green text-white scale-110'
            : 'bg-app-surface text-slate-400 group-hover:bg-app-green/20 group-hover:text-app-green'
        "
      >
        <div
          class="w-8 h-8 bg-current mask-[url('/icons/fa-upload.svg')] mask-contain mask-no-repeat mask-center"
        />
      </div>
    </div>

    <!-- Text -->
    <p class="text-lg font-medium text-slate-200 mb-1">
      {{ isDragging ? "วางไฟล์ที่นี่" : "ลากไฟล์มาวาง หรือ คลิกเพื่อเลือก" }}
    </p>
    <p class="text-sm text-slate-400">รองรับไฟล์ .csv, .xlsx, .xls</p>

    <!-- File name display -->
    <div
      v-if="fileName"
      class="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-app-card rounded-lg border border-app-surface shadow-sm"
    >
      <div
        class="w-4 h-4 bg-app-green mask-[url('/icons/fa-circle-check.svg')] mask-contain mask-no-repeat mask-center"
      />
      <span class="text-sm font-medium text-slate-200">{{ fileName }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: "file-selected", file: File): void;
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);
const fileName = ref("");

function openFileDialog() {
  fileInput.value?.click();
}

function onDragEnter() {
  isDragging.value = true;
}

function onDragOver() {
  isDragging.value = true;
}

function onDragLeave() {
  isDragging.value = false;
}

function onDrop(event: DragEvent) {
  isDragging.value = false;
  const file = event.dataTransfer?.files[0];
  if (file) handleFile(file);
}

function onFileSelected(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) handleFile(file);
}

function handleFile(file: File) {
  const validExtensions = [".csv", ".xlsx", ".xls"];
  const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();

  if (!validExtensions.includes(ext)) {
    alert("กรุณาเลือกไฟล์ .csv, .xlsx, หรือ .xls เท่านั้น");
    return;
  }

  fileName.value = file.name;
  emit("file-selected", file);
}
</script>
