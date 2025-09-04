<script setup lang="ts">
import { onMounted, ref, toRef, onUnmounted } from "vue";
import {
  createData,
  dataSourceFields,
  validInterface,
} from "@/views/dyform/utils/ItemPreps";
import { searchMatchList, SelectOption, warning } from "star-horse-lowcode";
import { loadDict } from "@/api/star_horse_apis";

defineOptions({
  name: "DataSource",
});
const props = defineProps({
  recall: {
    type: Function,
    default: () => {},
  },
  formProps: {
    type: Object,
    default: () => {},
  },
});
const dataSourceFormRef = ref();
let envList = ref<Array<SelectOption>>([]);
// Add ref for refresh timer
const refreshTimer = ref<NodeJS.Timeout | null>(null);

const getFormData = async (extendErrorMsg?: string) => {
  let reData = toRef(props.formProps ?? {});
  let flag = true;
  await validInterface(
    reData,
    dataSourceFormRef,
    (dataList: any, _successMsg: string, errorMsg: string) => {
      if (!errorMsg) {
        //只保存静态数据,
        reData["values"] = createData(dataSourceFormRef, dataList).reDataList;
      } else {
        flag = false;
        warning(extendErrorMsg ?? errorMsg);
      }
    },
  );
  if (flag) return reData;
  return false;
};

const setFormData = (data: any) => {
  dataSourceFormRef.value?.setFormData(data);
  
  // Check if periodic refresh is enabled and set up the timer
  setupPeriodicRefresh(data);
};

// Function to set up periodic refresh
const setupPeriodicRefresh = (data: any) => {
  // Clear any existing timer
  if (refreshTimer.value) {
    clearInterval(refreshTimer.value);
    refreshTimer.value = null;
  }
  
  // Set up new timer if auto refresh is enabled
  if (data && data.enableAutoRefresh && data.refreshInterval) {
    const intervalMs = data.refreshInterval * 1000; // Convert seconds to milliseconds
    refreshTimer.value = setInterval(async () => {
      try {
        // Re-fetch data when timer triggers
        await getFormData();
        // Optionally trigger a recall function if provided
        if (props.recall) {
          props.recall();
        }
      } catch (error) {
        console.error('Periodic refresh failed:', error);
      }
    }, intervalMs);
  }
};

// Clean up timer when component is unmounted
onUnmounted(() => {
  if (refreshTimer.value) {
    clearInterval(refreshTimer.value);
    refreshTimer.value = null;
  }
});

onMounted(async () => {
  // matchTypeList.value = searchMatchList();
  envList.value = await loadDict("system_environment");
});

defineExpose({
  getFormData,
  setFormData,
});
</script>

<template>
  <star-horse-form
    :outerFormData="formProps"
    primary-key=""
    ref="dataSourceFormRef"
    :fieldList="dataSourceFields(dataSourceFormRef, envList, recall)"
  />
</template>

<style scoped lang="scss"></style>