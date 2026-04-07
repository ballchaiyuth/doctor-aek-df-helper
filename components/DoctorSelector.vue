<template>
  <div id="doctor-selector">
    <label class="block text-sm font-medium text-slate-300 mb-2">
      เลือกแพทย์
    </label>
    <select
      v-model="selectedDoctor"
      class="w-full px-4 py-3 bg-app-card border border-app-surface rounded-xl text-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-app-green focus:border-app-green hover:border-slate-500 transition-all cursor-pointer"
    >
      <option value="" disabled class="text-slate-500">-- กรุณาเลือกชื่อแพทย์ --</option>
      <option v-for="doc in doctors" :key="doc" :value="doc" class="text-slate-200">
        {{ doc }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  doctors: string[];
  modelValue: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const selectedDoctor = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});
</script>
