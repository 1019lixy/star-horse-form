<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { hasValidApiConfig, fetchData } from "./composables/useApiData";

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

const props = defineProps({
  columns: {
    type: Array as () => TableColumn[],
    default: () => [
      { prop: "date", label: "日期", width: "180" },
      { prop: "name", label: "姓名", width: "180" },
      { prop: "address", label: "地址" },
    ],
  },
  data: {
    type: Array as () => TableData[],
    default: () => [],
  },
  apiConfig: {
    type: Object,
    default: () => ({}),
  },
  height: {
    type: String,
    default: "",
  },
  stripe: {
    type: Boolean,
    default: false,
  },
  border: {
    type: Boolean,
    default: true,
  },
});

// Reactive data
const apiData = ref<TableData[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

// Determine which data to use (API data if available, otherwise static data)
const tableData = computed(() => {
  return apiData.value && apiData.value.length > 0 ? apiData.value : props.data;
});

// Fetch data from API
const fetchApiData = async () => {
  // If no API config, don't fetch and don't set loading state
  if (!hasValidApiConfig(props.apiConfig)) {
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const result: any = await fetchData(props.apiConfig);
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
  () => props.apiConfig,
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
    :height="height"
    :stripe="stripe"
    :border="border"
    class="w-full"
  >
    <el-table-column
      v-for="column in columns"
      :key="column.prop"
      :prop="column.prop"
      :label="column.label"
      :width="column.width"
      :sortable="column.sortable"
    />
  </el-table>
</template>

<style scoped lang="scss"></style>
