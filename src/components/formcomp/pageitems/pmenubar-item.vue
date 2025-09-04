<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { hasValidApiConfig, fetchData } from './composables/useApiData';

defineOptions({
  name: "PageMenubarItem",
});

interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  url?: string;
  children?: MenuItem[];
}

const props = defineProps({
  menuItems: {
    type: Array as () => MenuItem[],
    default: () => []
  },
  mode: {
    type: String,
    default: "horizontal" // horizontal, vertical
  },
  backgroundColor: {
    type: String,
    default: "#ffffff"
  },
  textColor: {
    type: String,
    default: "#303133"
  },
  activeTextColor: {
    type: String,
    default: "#409eff"
  },
  apiConfig: {
    type: Object,
    default: () => ({})
  }
});

// Reactive data
const apiData = ref<MenuItem[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

// Determine which data to use (API data if available, otherwise static data)
const menuData = computed(() => {
  return apiData.value && apiData.value.length > 0 ? apiData.value : props.menuItems;
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
      console.error('API call failed:', result.error);
    }
  } catch (err: any) {
    error.value = err instanceof Error ? err.message : 'Unknown error occurred';
    console.error('API call failed:', err);
  } finally {
    loading.value = false;
  }
};

// Watch for API config changes
watch(() => props.apiConfig, () => {
  fetchApiData();
}, { deep: true });

// Fetch initial data
onMounted(() => {
  fetchApiData();
});
</script>

<template>
  <div v-if="loading" class="text-center py-4">
    <el-skeleton animated />
  </div>
  
  <div v-else-if="error" class="text-center py-4 text-red-500">
    {{ error }}
  </div>
  
  <el-menu
    v-else
    :mode="mode"
    :background-color="backgroundColor"
    :text-color="textColor"
    :active-text-color="activeTextColor"
    class="w-full"
  >
    <template v-for="item in menuData" :key="item.id">
      <el-menu-item 
        v-if="!item.children || item.children.length === 0" 
        :index="item.id"
      >
        <el-icon v-if="item.icon">
          <component :is="item.icon" />
        </el-icon>
        <span>{{ item.label }}</span>
      </el-menu-item>
      
      <el-sub-menu 
        v-else 
        :index="item.id"
      >
        <template #title>
          <el-icon v-if="item.icon">
            <component :is="item.icon" />
          </el-icon>
          <span>{{ item.label }}</span>
        </template>
        <el-menu-item 
          v-for="child in item.children" 
          :key="child.id" 
          :index="child.id"
        >
          <el-icon v-if="child.icon">
            <component :is="child.icon" />
          </el-icon>
          <span>{{ child.label }}</span>
        </el-menu-item>
      </el-sub-menu>
    </template>
  </el-menu>
</template>

<style scoped lang="scss"></style>