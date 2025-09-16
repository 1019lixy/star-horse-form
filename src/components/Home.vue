<script setup lang="ts">
import { onMounted, ref } from "vue";
import { i18n } from "@/lang";
import { apiInstance, ApiUrls, createCondition, loadData, postRequest, warning } from "star-horse-lowcode";
import { getUserInfo } from "@/utils/auth.js";
import StarHorseSidebar from "./StarHorseSidebar.vue";
// Reactive data
const modules = ref<Array<any>>([]);
const moduleSelectorVisible = ref<boolean>(false);
const isDesign = ref<boolean>(false);
const searchKeyword = ref("");
const activeCategory = ref("all");
const selectedModules = ref<Array<string>>([]);
const selectedModuleId = ref<string | null>(null);
const dataUrl: ApiUrls = apiInstance("system-config", "system/indexModules");
const userConfigUrl: ApiUrls = apiInstance("system-config", "system/indexUserConfigs");
// Module categories
const moduleCategories = ref([
  { id: "all", name: i18n("home.category.all") },
  { id: "system", name: i18n("home.category.system") },
  { id: "business", name: i18n("home.category.business") },
  { id: "analytics", name: i18n("home.category.analytics") },
  { id: "tools", name: i18n("home.category.tools") }
]);
const allModules = ref<Array<any>>([]);


// Filtered modules based on search keyword
const filteredModulesByCategory = (category: string) => {
  let result = allModules.value;

  // Filter by category if not "all"
  if (category !== "all") {
    result = result.filter(module => module.moduleType === category);
  }

  // Filter by search keyword
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    result = result.filter((module: any) =>
      module.title.toLowerCase().includes(keyword) ||
      module.description.toLowerCase().includes(keyword)
    );
  }

  return result;
};

// Methods
const openModuleSelector = () => {
  moduleSelectorVisible.value = true;
  // Pre-select modules that are already added to the dashboard
  selectedModules.value = modules.value.map((module: any) => module.idIndexModule);
};
const selectNode = (item: any) => {
  selectedModuleId.value = item.idIndexModule;
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
  const selectedModuleData = allModules.value.filter(
    (module: any) => selectedModules.value.includes(module.idIndexModule)
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
  const index = modules.value.findIndex((m: any) => m.idIndexModule === updatedModule.idIndexModule);
  if (index > -1) {
    modules.value[index] = updatedModule;
    // Save to backend
    saveModulesToBackend();
  }
};

// Backend integration
const saveModulesToBackend = () => {
  const user = getUserInfo();
  if (!user) {
    warning("请先登录");
    return;
  }
  if (modules.value?.length == 0) {
    return;
  }
  let datas: Array<any> = [];
  modules.value.forEach((module, index) => {
    datas.push({
      idIndexModule: module.idIndexModule,
      idUsersinfo: user.idUsersinfo,
      rowNum: index,
      colNum: 1,
      height: 300,
      width: 400
    });
  });
  postRequest(userConfigUrl.batchMergeUrl!, datas).then(res => {
    if (res.data.code != 0) {
      warning(res.data.cnMessage);
      return;
    }
  });
};

const loadModulesFromBackend = () => {
  loadData(dataUrl.listConditionUrl!, {
    fieldList: [createCondition("isDel", 0)]
  }).then(response => {
    if (response.error) {
      warning(response.error);
      return;
    }
    allModules.value = response.data || [];
    const user = getUserInfo();
    modules.value = [];
    loadData(userConfigUrl.listConditionUrl!, {
      fieldList: [createCondition("idUsersinfo", user.idUsersinfo)]
    }).then(res => {
      if (res.error) {
        warning(res.error);
        return;
      }
      modules.value = allModules.value.filter((module: any) =>
        res.data.map((item: any) =>
          item.idIndexModule).includes(module.idIndexModule));
    });
  });

};

// Lifecycle
onMounted(() => {
  loadModulesFromBackend();
});
</script>
<template>
  <div class="home-container h-full w-full relative box-border overflow-hidden">
    <div class="dashboard-area h-full relative" v-if="modules.length > 0">
      <div class="module-grid w-full overflow-y-auto h-full">
        <star-horse-draggable v-for="(module, index) in modules" :key="module.idIndexModule" :node="module"
          :isActive="selectedModuleId == module.idIndexModule && isDesign" :isDesign="isDesign" :styles="{
            height: module.height ? module.height + 'px' : '380px',
            width: module.width ? module.width + 'px' : '400px'
          }" @selectNode="selectNode">
          <div class="module-card w-full h-full "
            :class="{ 'border-2 border-[var(--star-horse-style)]': selectedModuleId === module.idIndexModule && isDesign }">
            <div class="module-header flex items-center mb-4">
              <star-horse-icon :icon-class="module.moduleIcon"
                class="module-icon text-2xl text-[var(--star-horse-style)] mr-2.5" />
              <h3 class="module-title m-0 text-lg font-semibold text-[#303133]">{{ module.title }}</h3>
            </div>
            <div class="module-content flex-1 flex flex-col justify-between">
              <p class="module-description m-0 mb-4 text-sm text-[#606266] leading-normal">{{ module.description }}
              </p>
            </div>
          </div>
        </star-horse-draggable>
        <!-- 插入指示线 -->
        <div id="insertLine" class="insert-line"></div>
      </div>
    </div>

    <div class="empty-state flex justify-center items-center h-full w-full" v-else>
      <div class="empty-content text-center max-w-[500px]">
        <div class="empty-illustration mb-5 text-[#c0c4cc]">
          <star-horse-icon icon-class="dashboard" size="64px" />
        </div>
        <div class="welcome">{{ i18n('home.welcome') }}</div>
        <p class="m-0 mb-5 text-base text-[#606266]">{{ i18n('home.noModules') }}</p>
        <div @click="openModuleSelector" class="field-item flex h-[70px]! home-btn ">
          <star-horse-icon icon-class="plus" />
          {{ i18n('home.addModule') }}
        </div>
      </div>
    </div>
    <el-drawer v-model="moduleSelectorVisible" :title="i18n('home.selectModule')" direction="rtl" size="40%">
      <div class="module-selector h-full flex flex-col">
        <el-input v-model="searchKeyword" :placeholder="i18n('home.searchModules')" class="search-input mb-5" clearable>
          <template #prefix>
            <star-horse-icon icon-class="search" />
          </template>
        </el-input>
        <div class="module-categories flex-1 overflow-y-auto">
          <el-tabs v-model="activeCategory">
            <el-tab-pane v-for="category in moduleCategories" :key="category.id" :label="category.name"
              :name="category.id">
              <div class="module-list flex flex-col gap-2.5">
                <div v-for="module in filteredModulesByCategory(category.id)" :key="module.idIndexModule"
                  class="module-item flex items-center justify-between p-4 border border-[#ebeef5] rounded cursor-pointer transition-all duration-300 ease-in-out"
                  :class="{
                    'border-[var(--star-horse-style)] bg-[#f5f7fa]': selectedModules.includes(module.idIndexModule),
                    'border-[var(--star-horse-style)] bg-[#ecf5ff]': selectedModules.includes(module.idIndexModule)
                  }" @click="toggleModuleSelection(module.idIndexModule)">
                  <div class="module-item-content flex items-center flex-1 h-full">
                    <star-horse-icon :icon-class="module.moduleIcon"
                      class="module-item-icon text-2xl text-[var(--star-horse-style)] mr-4" />
                    <div class="border-[var(--star-horse-style)] border-1 border-solid w-[1px] h-[36px] mx-2"></div>
                    <div class="module-item-info">
                      <h4 class="m-0 ml-1 mb-1 text-base text-[#303133]">{{ module.title }}</h4>
                      <p class="m-0 ml-5 text-sm text-[#606266]">{{ module.description }}</p>
                    </div>
                  </div>
                  <el-checkbox :model-value="selectedModules.includes(module.idIndexModule)"
                    @change="toggleModuleSelection(module.idIndexModule)" />
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


    <StarHorseSidebar>
      <div class="quick-actions">
        <h4 class="text-md font-semibold mb-3">快捷操作</h4>
        <div class="action-item mb-2">
          <el-form-item>
            <el-switch v-model="isDesign" active-text="编辑模式" inactive-text="只读模式" />
          </el-form-item>
          <el-form-item v-if="isDesign">
            <el-button :disabled="!isDesign" type="primary" @click="openModuleSelector">
              <star-horse-icon icon-class="plus" cursor="pointer" color="var(--star-horse-white)" />
              {{ i18n('home.addModule') }}
            </el-button>
          </el-form-item>
        </div>
      </div>

      <div class="recent-modules mt-4">
        <h4 class="text-md font-semibold mb-3">最近使用</h4>
        <div class="module-list">
          <div v-for="module in modules.slice(0, 3)" :key="module.idIndexModule"
            class="module-item flex items-center p-2 mb-2 rounded cursor-pointer hover:bg-gray-100"
            @click="selectModule(module.idIndexModule)">
            <star-horse-icon :icon-class="module.moduleIcon" class="text-lg mr-2" />
            <span class="text-sm">{{ module.title }}</span>
          </div>
        </div>
      </div>
    </StarHorseSidebar>
  </div>
</template>
<style lang="scss" scoped>
.module-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, auto));
  gap: 20px;
  background: #f5f5f5;
  align-items: start;
  padding: 20px;
  border-radius: 8px;
  position: relative;
}

.module-card {
  background: white;
  border-radius: 6px;
  padding: 20px;
  min-height: 150px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: grab;
  transition: all 0.2s ease;
  /* 确保元素尺寸计算准确 */
  box-sizing: border-box;
}

.module-card:active {
  cursor: grabbing;
}

.module-card.dragging {
  position: fixed;
  z-index: 100;
  opacity: 0.8;
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  background: #e6f7ff;
  border: 2px solid #1890ff;
}

/* 插入指示线：与元素完全同高对齐 */
.insert-line {
  position: absolute;
  width: 3px;
  background: #faad14;
  border-radius: 2px;
  z-index: 50;
  display: none;
  transition: all 0.1s ease;
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

/* Chinese sidebar content styles */
.quick-actions,
.recent-modules {
  padding: 0 12px;
}

.module-item {
  transition: background-color 0.2s ease;
}

.module-item:hover {
  background-color: #f5f7fa;
}
</style>
