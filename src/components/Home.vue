<template>
  <div class="home-container h-full w-full relative box-border">
    <!-- Main dashboard area -->
    <div class="dashboard-area h-full relative" v-if="modules.length > 0">
      <!-- Add button in top-right corner -->
      <div class="add-button-container absolute top-5 right-5 z-[1000]">
        <el-tooltip :content="i18n('home.addModule')" placement="top">
          <star-horse-icon icon-class="plus" cursor="pointer" class="text-xl" @click="openModuleSelector"/>
        </el-tooltip>
      </div>

      <!-- Module grid -->
      <div class="module-grid flex flex-wrap gap-5  overflow-y-auto">
        <StarHorseDraggable v-for="(module, index) in modules" :key="module.id" :node="module"
                            :isActive="selectedModuleId == module.id"
                            @selectNode="selectNode">
          <div
              class="module-card w-[300px] h-[200px] "
              :class="{ 'border-2 border-[var(--star-horse-style)]': selectedModuleId === module.id }"
          >
            <div class="module-header flex items-center mb-4">
              <star-horse-icon :icon-class="module.icon"
                               class="module-icon text-2xl text-[var(--star-horse-style)] mr-2.5"/>
              <h3 class="module-title m-0 text-lg font-semibold text-[#303133]">{{ module.title }}</h3>
            </div>
            <div class="module-content flex-1 flex flex-col justify-between">
              <p class="module-description m-0 mb-4 text-sm text-[#606266] leading-normal">{{ module.description }}</p>
              <div class="module-stats flex flex-wrap gap-2.5" v-if="module.stats">
                <span class="stat-item bg-[#f4f4f5] px-2 py-1 rounded text-xs text-[#909399]"
                      v-for="(stat, key) in module.stats" :key="key">
                  {{ key }}: {{ stat }}
                </span>
              </div>
            </div>
          </div>
        </StarHorseDraggable>
      </div>
    </div>

    <!-- Empty state with add button centered -->
    <div class="empty-state flex justify-center items-center h-full w-full" v-else>
      <div class="empty-content text-center max-w-[500px]">
        <div class="empty-illustration mb-5 text-[#c0c4cc]">
          <star-horse-icon icon-class="dashboard" size="64px"/>
        </div>
        <div class="welcome">{{ i18n('home.welcome') }}</div>
        <p class="m-0 mb-5 text-base text-[#606266]">{{ i18n('home.noModules') }}</p>
        <div @click="openModuleSelector" class="field-item flex h-[70px]! home-btn ">
          <star-horse-icon icon-class="plus"/>
          {{ i18n('home.addModule') }}
        </div>
      </div>
    </div>

    <!-- Module selection drawer -->
    <el-drawer v-model="moduleSelectorVisible" :title="i18n('home.selectModule')" direction="rtl" size="40%">
      <div class="module-selector h-full flex flex-col">
        <el-input v-model="searchKeyword" :placeholder="i18n('home.searchModules')" class="search-input mb-5" clearable>
          <template #prefix>
            <star-horse-icon icon-class="search"/>
          </template>
        </el-input>

        <div class="module-categories flex-1 overflow-y-auto">
          <el-tabs v-model="activeCategory">
            <el-tab-pane v-for="category in moduleCategories" :key="category.id" :label="category.name"
                         :name="category.id">
              <div class="module-list flex flex-col gap-2.5">
                <div v-for="module in filteredModulesByCategory(category.id)" :key="module.id"
                     class="module-item flex items-center justify-between p-4 border border-[#ebeef5] rounded cursor-pointer transition-all duration-300 ease-in-out"
                     :class="{ 'border-[var(--star-horse-style)] bg-[#f5f7fa]': selectedModules.includes(module.id), 'border-[var(--star-horse-style)] bg-[#ecf5ff]': selectedModules.includes(module.id) }"
                     @click="toggleModuleSelection(module.id)">
                  <div class="module-item-content flex items-center flex-1">
                    <star-horse-icon :icon-class="module.icon"
                                     class="module-item-icon text-2xl text-[var(--star-horse-style)] mr-4"/>
                    <div class="module-item-info">
                      <h4 class="m-0 mb-1 text-base text-[#303133]">{{ module.title }}</h4>
                      <p class="m-0 text-sm text-[#606266]">{{ module.description }}</p>
                    </div>
                  </div>
                  <el-checkbox :model-value="selectedModules.includes(module.id)"
                               @change="toggleModuleSelection(module.id)"/>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>

      <template #footer>
        <div class="drawer-footer flex justify-end gap-2.5 p-2.5">
          <el-button @click="moduleSelectorVisible = false">{{ i18n('dialog.cancel') }}</el-button>
          <el-button type="primary" @click="addSelectedModules" :disabled="selectedModules.length === 0">
            {{ i18n('home.addSelectedModules') }}
          </el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref} from "vue";
import {i18n} from "@/lang";
import {DynamicNode, piniaInstance, uuid} from "star-horse-lowcode";
import {useFlexDesignStore} from "@/store/FlexDesign";
import {getUserInfo} from "@/utils/auth";

// Stores
const flexDesign = useFlexDesignStore(piniaInstance);

// Reactive data
const modules = ref<Array<DynamicNode>>([]);
const moduleSelectorVisible = ref(false);
const searchKeyword = ref("");
const activeCategory = ref("all");
const selectedModules = ref<Array<string>>([]);
const selectedModuleId = ref<string | null>(null);

// Module categories
const moduleCategories = ref([
  {id: "all", name: i18n('home.category.all')},
  {id: "system", name: i18n('home.category.system')},
  {id: "business", name: i18n('home.category.business')},
  {id: "analytics", name: i18n('home.category.analytics')},
  {id: "tools", name: i18n('home.category.tools')}
]);

// Default modules based on user roles
const defaultModules = computed(() => {
  const user = getUserInfo();
  const userRole = user?.role || "user";

  // Define default modules based on roles
  const roleBasedModules: Record<string, Array<DynamicNode>> = {
    admin: [
      {
        id: uuid(),
        title: i18n('home.module.userManagement'),
        icon: "user",
        description: i18n('home.module.userManagementDesc'),
        category: "system",
        width: 300,
        height: 200,
        left: 50,
        top: 50,
        zIndex: 100
      },
      {
        id: uuid(),
        title: i18n('home.module.systemMonitor'),
        icon: "monitor",
        description: i18n('home.module.systemMonitorDesc'),
        category: "system",
        width: 300,
        height: 200,
        left: 400,
        top: 50,
        zIndex: 101
      }
    ],
    user: [
      {
        id: uuid(),
        title: i18n('home.module.personalCenter'),
        icon: "user-circle",
        description: i18n('home.module.personalCenterDesc'),
        category: "system",
        width: 300,
        height: 200,
        left: 50,
        top: 50,
        zIndex: 100
      }
    ]
  };

  return roleBasedModules[userRole] || roleBasedModules.user;
});

// Filtered modules based on search keyword
const filteredModulesByCategory = (category: string) => {
  let result = defaultModules.value;

  // Filter by category if not "all"
  if (category !== "all") {
    result = result.filter(module => module.category === category);
  }

  // Filter by search keyword
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    result = result.filter(module =>
        module.title.toLowerCase().includes(keyword) ||
        module.description.toLowerCase().includes(keyword)
    );
  }

  return result;
};

// Methods
const openModuleSelector = () => {
  moduleSelectorVisible.value = true;
  selectedModules.value = [];
};
const selectNode = (item: DynamicNode) => {
  selectedModuleId.value = item.id;
};
const toggleModuleSelection = (moduleId: string) => {
  const index = selectedModules.value.indexOf(moduleId);
  if (index > -1) {
    selectedModules.value.splice(index, 1);
  } else {
    selectedModules.value.push(moduleId);
  }
};

const addSelectedModules = () => {
  // Add selected modules to the dashboard
  const selectedModuleData = defaultModules.value.filter(
      module => selectedModules.value.includes(module.id)
  );

  // Add to existing modules
  modules.value = [...modules.value, ...selectedModuleData];

  // Save to backend
  saveModulesToBackend();

  // Close drawer
  moduleSelectorVisible.value = false;
  selectedModules.value = [];
};

const selectModule = (moduleId: string) => {
  selectedModuleId.value = moduleId;
};

const updateModulePosition = (updatedModule: any) => {
  const index = modules.value.findIndex(m => m.id === updatedModule.id);
  if (index > -1) {
    modules.value[index] = updatedModule;
    // Save to backend
    saveModulesToBackend();
  }
};

// Backend integration
const saveModulesToBackend = () => {
  // In a real implementation, this would save to your backend
  console.log("Saving modules to backend:", modules.value);
  // Example API call:
  // postRequest('/api/user-modules', {
  //   userId: getUserInfo().idUsersinfo,
  //   modules: modules.value
  // });
};

const loadModulesFromBackend = () => {
  // In a real implementation, this would load from your backend
  console.log("Loading modules from backend");
  // Example API call:
  // getRequest(`/api/user-modules/${getUserInfo().idUsersinfo}`).then(response => {
  //   modules.value = response.data.modules || [];
  // });

  // For now, we'll use default modules
  // modules.value = defaultModules.value;
  modules.value = [];
};

// Lifecycle
onMounted(() => {
  loadModulesFromBackend();
});
</script>

<style lang="scss" scoped>
.module-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  height: 100%;
  overflow-y: auto;
}

.welcome {
  font-size: 28px;
}

.home-btn {
  height: 90px !important; // Reduced height to match the class
  padding: 8px 6px; // Further reduced padding
  border-radius: 8px;
  background: linear-gradient(145deg, #ffffff, #f8f9fa);
  border: 2px solid #e4e7ed;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; // Center content vertically
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    top: 4px;
    left: 4px;
    right: 4px;
    bottom: 4px;
    border: 1px solid rgba(64, 158, 255, 0.1);
    border-radius: 6px;
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-4px) scale(1.02);
    border-color: #409eff;
    box-shadow: 0 12px 24px rgba(64, 158, 255, 0.2);
    background: linear-gradient(145deg, #ffffff, #f0f8ff);

    &::after {
      border-color: rgba(64, 158, 255, 0.3);
    }
  }

  &:active {
    transform: translateY(-2px) scale(1.01);
    box-shadow: 0 8px 20px rgba(64, 158, 255, 0.25);
  }
}

.empty-content {
  display: flex;
  cursor: pointer;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  /* font-weight: 900; */
  font-size: 16px;
}
</style>
