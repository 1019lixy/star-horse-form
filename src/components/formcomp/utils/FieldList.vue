<script setup lang="ts">
import {computed, ComputedRef, ref, watch} from "vue";
import {i18n} from "@/lang";
import {getDesignFormStore} from "@/store/StoreManager";

defineOptions({
  name: "FieldList",
});

withDefaults(
    defineProps<{
      showContainer?: boolean;
      showFormItems?: boolean;
      showThirdItems?: boolean;
    }>(),
    {
      showContainer: true,
      showFormItems: true,
      showThirdItems: true,
    },
);

const emits = defineEmits(["selectData"]);
let designForm = getDesignFormStore();
let formDataList: ComputedRef = computed(() => designForm.formDataList);
let containerDataList: ComputedRef = computed(() => designForm.containerDataList);
let selfFormDataList: ComputedRef = computed(() => designForm.selfFormDataList);

const searchQuery = ref("");
const activeGroups = ref<string[]>(["container", "basic", "self"]);
const draggingItem = ref<any>(null);

const filterByQuery = (list: any) => {
  if (!searchQuery.value) return list;
  const q = searchQuery.value.toLowerCase();
  return list.filter((item: any) =>
      (item.itemName || "").toLowerCase().includes(q),
  );
};

const filteredContainerList = computed(() => filterByQuery(containerDataList.value));
const filteredFormDataList = computed(() => filterByQuery(formDataList.value));
const filteredSelfFormDataList = computed(() => filterByQuery(selfFormDataList.value));

const totalFiltered = computed(
    () =>
        filteredContainerList.value.length +
        filteredFormDataList.value.length +
        filteredSelfFormDataList.value.length,
);

watch(searchQuery, (val) => {
  if (val) {
    activeGroups.value = ["container", "basic", "self"];
  }
});

const selectData = (item: any) => {
  emits("selectData", item);
};

const handleDragStart = (e: DragEvent, item: any) => {
  draggingItem.value = item;
  e.dataTransfer?.setData("text/plain", JSON.stringify(item));
};
const handleDragEnd = () => {
  draggingItem.value = null;
};
</script>

<template>
  <div class="field-list-panel">
    <div class="panel-search">
      <el-input
          v-model="searchQuery"
          :placeholder="i18n('form.searchPlaceholder')"
          clearable
          size="default"
      >
        <template #prefix>
          <svg class="search-icon" viewBox="0 0 24 24" width="14" height="14">
            <path
                fill="currentColor"
                d="M9.5 3A6.5 6.5 0 0 1 16 9.5a6.5 6.5 0 0 1-1.31 3.95l4.93 4.93a1 1 0 0 1-1.42 1.42l-4.93-4.93A6.5 6.5 0 0 1 9.5 16 6.5 6.5 0 0 1 3 9.5 6.5 6.5 0 0 1 9.5 3m0 2A4.5 4.5 0 0 0 5 9.5 4.5 4.5 0 0 0 9.5 14 4.5 4.5 0 0 0 14 9.5 4.5 4.5 0 0 0 9.5 5Z"
            />
          </svg>
        </template>
      </el-input>
    </div>

    <el-scrollbar class="panel-scroll">
      <el-empty
          v-if="totalFiltered === 0"
          :image-size="56"
          description="无匹配项"
          class="panel-empty"
      />

      <el-collapse v-else v-model="activeGroups" class="field-collapse">
        <el-collapse-item
            name="container"
            v-if="showContainer && filteredContainerList.length"
        >
          <template #title>
            <div class="group-title">
              <span class="group-dot"></span>
              <span class="group-name">{{ i18n("form.container") }}</span>
              <span class="group-count">{{ filteredContainerList.length }}</span>
            </div>
          </template>
          <div class="field-grid">
            <div
                v-for="item in filteredContainerList"
                :key="item.itemName"
                class="field-card"
                @click="selectData(item)"
                draggable="true"
                @dragstart="handleDragStart($event, item)"
                @dragend="handleDragEnd"
            >
              <star-horse-icon :icon-class="item.itemIcon" class="field-icon"/>
              <span class="field-name" :title="item.itemName">{{ item.itemName }}</span>
            </div>
          </div>
        </el-collapse-item>

        <el-collapse-item
            name="basic"
            v-if="showFormItems && filteredFormDataList.length"
        >
          <template #title>
            <div class="group-title">
              <span class="group-dot"></span>
              <span class="group-name">{{ i18n("form.basicComponents") }}</span>
              <span class="group-count">{{ filteredFormDataList.length }}</span>
            </div>
          </template>
          <div class="field-grid">
            <div
                v-for="item in filteredFormDataList"
                :key="item.itemName"
                class="field-card"
                @click="selectData(item)"
                draggable="true"
                @dragstart="handleDragStart($event, item)"
                @dragend="handleDragEnd"
            >
              <star-horse-icon :icon-class="item.itemIcon" class="field-icon"/>
              <span class="field-name" :title="item.itemName">{{ item.itemName }}</span>
            </div>
          </div>
        </el-collapse-item>

        <el-collapse-item
            name="self"
            v-if="showThirdItems && filteredSelfFormDataList.length"
        >
          <template #title>
            <div class="group-title">
              <span class="group-dot"></span>
              <span class="group-name">{{ i18n("form.customComponents") }}</span>
              <span class="group-count">{{ filteredSelfFormDataList.length }}</span>
            </div>
          </template>
          <div class="field-grid">
            <div
                v-for="item in filteredSelfFormDataList"
                :key="item.itemName"
                class="field-card"
                @click="selectData(item)"
                draggable="true"
                @dragstart="handleDragStart($event, item)"
                @dragend="handleDragEnd"
            >
              <star-horse-icon :icon-class="item.itemIcon" class="field-icon"/>
              <span class="field-name" :title="item.itemName">{{ item.itemName }}</span>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </el-scrollbar>
  </div>
</template>

<style scoped lang="scss">
.field-list-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;
  background: var(--el-bg-color);
}

.panel-search {
  padding: 10px 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  flex-shrink: 0;

  .search-icon {
    color: var(--el-text-color-placeholder);
  }
}

.panel-scroll {
  flex: 1;
  overflow: hidden;
}

.panel-empty {
  padding: 32px 0;
}

:deep(.field-collapse) {
  border: none;

  .el-collapse-item {
    border-bottom: 1px solid var(--el-border-color-lighter);

    &:last-child {
      border-bottom: none;
    }
  }

  .el-collapse-item__header {
    height: 38px;
    line-height: 38px;
    padding: 0 12px;
    border-bottom: none;
    font-size: 13px;
    background: transparent;
  }

  .el-collapse-item__wrap {
    border-bottom: none;
  }

  .el-collapse-item__content {
    padding: 8px 10px 12px;
  }
}

.group-title {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
}

.group-dot {
  width: 3px;
  height: 12px;
  border-radius: 2px;
  background: var(--el-color-primary);
  flex-shrink: 0;
}

.group-name {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.group-count {
  margin-left: auto;
  min-width: 18px;
  height: 18px;
  line-height: 18px;
  text-align: center;
  padding: 0 5px;
  border-radius: 9px;
  font-size: 11px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color);
}

.field-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.field-card {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 8px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: var(--el-fill-color-blank);
  cursor: pointer;
  user-select: none;
  transition: all 0.18s ease;
  min-width: 0;

  &:hover {
    border-color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  }

  &:active {
    transform: translateY(0);
    background: var(--el-color-primary-light-8);
  }
}

.field-icon {
  font-size: 16px;
  color: var(--el-text-color-regular);
  flex-shrink: 0;
}

.field-card:hover .field-icon {
  color: var(--el-color-primary);
}

.field-name {
  font-size: 13px;
  color: var(--el-text-color-regular);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.field-card:hover .field-name {
  color: var(--el-color-primary);
}
</style>
