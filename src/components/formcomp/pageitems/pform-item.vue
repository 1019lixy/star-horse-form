<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { fetchData, hasValidApiConfig } from "./composables/useApiData";
import { PageCompInfo } from "@/components/types/PageLayoutComp";

defineOptions({
  name: "PageFormItem",
});

interface FormField {
  label: string;
  prop: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
}

const props = withDefaults(defineProps<PageCompInfo>(), {
  isDesign: () => false,
  preps: () => ({}),
  styles: () => ({}),
});

// Reactive data
const apiData = ref<FormField[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const dataForm = ref<any>({});
// Determine which data to use (API data if available, otherwise static data)
const formData = computed(() => {
  return apiData.value && apiData.value.length > 0
    ? apiData.value
    : props.preps.fields;
});

// Fetch data from API
const fetchApiData = async () => {
  // If no API config, don't fetch and don't set loading state
  if (!hasValidApiConfig(props.preps.apiConfig)) {
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const result: any = await fetchData(props.preps.apiConfig);
    if (!result.error) {
      // Set the fetched data
      apiData.value = result.data;
    } else {
      error.value = result.error;
      console.error("API call failed:", result.error);
    }
  } catch (err: any) {
    error.value = err instanceof Error ? err.message : "Unknown error occurred";
    console.error("API call failed:", err);
  } finally {
    loading.value = false;
  }
};

// Watch for API config changes
watch(
  () => props.preps.apiConfig,
  () => {
    fetchApiData();
  },
  { deep: true },
);

// Fetch initial data
onMounted(() => {
  fetchApiData();
});
</script>

<template>
  <div class="relative flex flex-col flex-wrap w-full">
    <div v-if="loading" class="text-center py-4">
      <el-skeleton :rows="3" animated />
    </div>

    <div v-else-if="error" class="text-center py-4 text-red-500">
      {{ error }}
    </div>
    <sh-form v-else v-bind="preps" v-model="dataForm">
      <template v-for="field in formData" :key="field.prop">
        <el-form-item
          :label="field.label"
          :prop="field.prop"
          :required="field.required"
        >
          <component :is="`el-${field.type}`" v-bind="field" class="w-full" />
        </el-form-item>
      </template>
    </sh-form>
  </div>
</template>

<style scoped lang="scss"></style>
