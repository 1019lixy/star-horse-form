<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { fetchData, hasValidApiConfig } from "./composables/useApiData";
import { PageCompInfo } from "@/components/types/PageLayoutComp.js";

defineOptions({
  name: "PageTableItem",
});

interface TableColumn {
  prop: string;
  label: string;
  width?: string | number;
  sortable?: boolean;
}

interface TableData {
  [key: string]: any;
}

const props = withDefaults(defineProps<PageCompInfo>(), {
  isDesign: () => false,
  preps: () => ({}),
  styles: () => ({}),
});

// Reactive data
const apiData = ref<TableData[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

// Determine which data to use (API data if available, otherwise static data)
const tableData = computed(() => {
  return apiData.value && apiData.value.length > 0
    ? apiData.value
    : props.preps.data;
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
  <div v-if="loading" class="text-center py-4">
    <el-skeleton :rows="3" animated />
  </div>

  <div v-else-if="error" class="text-center py-4 text-red-500">
    {{ error }}
  </div>

  <el-table
    v-else
    :data="tableData"
    v-bind="preps"
    class="w-full"
    :style="styles"
  >
    <el-table-column
      v-for="column in preps.columns"
      :key="column.prop"
      :prop="column.prop"
      :label="column.label"
      :width="column.width ?? '120px'"
      :sortable="column.sortable"
    />
  </el-table>
</template>

<style scoped lang="scss"></style>
