<script setup lang="ts">
import { computed, ComputedRef, nextTick, ref, watch } from "vue";
import { i18n } from "@/lang";
import { getDesignFormStore } from "@/store/StoreManager";

defineOptions({
  name: "FieldList",
});

const props = withDefaults(
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
let containerDataList: ComputedRef = computed(
  () => designForm.containerDataList,
);
let selfFormDataList: ComputedRef = computed(() => designForm.selfFormDataList);

const searchQuery = ref("");
const activeGroups = ref<string[]>(["container", "basic", "self", "myCustom"]);
const draggingItem = ref<any>(null);

const filterByQuery = (list: any) => {
  if (!searchQuery.value) return list;
  const q = searchQuery.value.toLowerCase();
  return list.filter((item: any) =>
    (item.itemName || "").toLowerCase().includes(q),
  );
};

const filteredContainerList = computed(() =>
  filterByQuery(containerDataList.value),
);
const filteredFormDataList = computed(() => filterByQuery(formDataList.value));
const systemSelfList = computed(() =>
  (selfFormDataList.value || []).filter((item: any) => !item.isCustom),
);
const myCustomList = computed(() =>
  (selfFormDataList.value || []).filter((item: any) => item.isCustom),
);
const filteredSelfFormDataList = computed(() =>
  filterByQuery(systemSelfList.value),
);
const filteredMyCustomList = computed(() => filterByQuery(myCustomList.value));

const totalFiltered = computed(
  () =>
    filteredContainerList.value.length +
    filteredFormDataList.value.length +
    filteredSelfFormDataList.value.length +
    filteredMyCustomList.value.length,
);

watch(searchQuery, (val) => {
  if (val) {
    activeGroups.value = ["container", "basic", "self", "myCustom"];
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

const anchors = computed(() => {
  const list = [
    {
      name: "container",
      label: i18n("form.container"),
      count: filteredContainerList.value.length,
      show: props.showContainer,
    },
    {
      name: "basic",
      label: i18n("form.basicComponents"),
      count: filteredFormDataList.value.length,
      show: props.showFormItems,
    },
    {
      name: "self",
      label: i18n("form.customComponents"),
      count: filteredSelfFormDataList.value.length,
      show: props.showThirdItems,
    },
    {
      name: "myCustom",
      label: i18n("form.myComponents"),
      count: filteredMyCustomList.value.length,
      show: props.showThirdItems,
    },
  ];
  return list.filter((a) => a.show && a.count > 0);
});

const groupRefs: Record<string, HTMLElement> = {};
const scrollToGroup = (name: string) => {
  if (!activeGroups.value.includes(name)) {
    activeGroups.value = [...activeGroups.value, name];
  }
  nextTick(() => {
    groupRefs[name]?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
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

    <div class="panel-anchors" v-if="anchors.length > 1">
      <button
        v-for="a in anchors"
        :key="a.name"
        type="button"
        class="anchor-btn"
        :class="{ active: activeGroups.includes(a.name) }"
        @click="scrollToGroup(a.name)"
      >
        {{ a.label }}<span class="anchor-count">{{ a.count }}</span>
      </button>
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
            <div
              class="group-title"
              :ref="
                (el) => {
                  if (el) groupRefs.container = el as HTMLElement;
                }
              "
            >
              <span class="group-dot"></span>
              <span class="group-name">{{ i18n("form.container") }}</span>
              <span class="group-count">{{
                filteredContainerList.length
              }}</span>
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
              <star-horse-icon :icon-class="item.itemIcon" class="field-icon" />
              <span class="field-name" :title="item.itemName">{{
                item.itemName
              }}</span>
            </div>
          </div>
        </el-collapse-item>

        <el-collapse-item
          name="basic"
          v-if="showFormItems && filteredFormDataList.length"
        >
          <template #title>
            <div
              class="group-title"
              :ref="
                (el) => {
                  if (el) groupRefs.basic = el as HTMLElement;
                }
              "
            >
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
              <star-horse-icon :icon-class="item.itemIcon" class="field-icon" />
              <span class="field-name" :title="item.itemName">{{
                item.itemName
              }}</span>
            </div>
          </div>
        </el-collapse-item>

        <el-collapse-item
          name="self"
          v-if="showThirdItems && filteredSelfFormDataList.length"
        >
          <template #title>
            <div
              class="group-title"
              :ref="
                (el) => {
                  if (el) groupRefs.self = el as HTMLElement;
                }
              "
            >
              <span class="group-dot"></span>
              <span class="group-name">{{
                i18n("form.customComponents")
              }}</span>
              <span class="group-count">{{
                filteredSelfFormDataList.length
              }}</span>
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
              <star-horse-icon :icon-class="item.itemIcon" class="field-icon" />
              <span class="field-name" :title="item.itemName">{{
                item.itemName
              }}</span>
            </div>
          </div>
        </el-collapse-item>

        <el-collapse-item
          name="myCustom"
          v-if="showThirdItems && filteredMyCustomList.length"
        >
          <template #title>
            <div
              class="group-title"
              :ref="
                (el) => {
                  if (el) groupRefs.myCustom = el as HTMLElement;
                }
              "
            >
              <span class="group-dot"></span>
              <span class="group-name">{{ i18n("form.myComponents") }}</span>
              <span class="group-count">{{ filteredMyCustomList.length }}</span>
            </div>
          </template>
          <div class="field-grid">
            <div
              v-for="item in filteredMyCustomList"
              :key="item.idCustomComponent || item.itemName"
              class="field-card"
              @click="selectData(item)"
              draggable="true"
              @dragstart="handleDragStart($event, item)"
              @dragend="handleDragEnd"
            >
              <star-horse-icon :icon-class="item.itemIcon" class="field-icon" />
              <span class="field-name" :title="item.itemName">{{
                item.itemName
              }}</span>
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

.panel-anchors {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  flex-shrink: 0;
}

.anchor-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  background: var(--el-fill-color-blank);
  color: var(--el-text-color-regular);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: var(--el-color-primary);
    color: var(--el-color-primary);
  }

  &.active {
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary);
    color: var(--el-color-primary);
  }
}

.anchor-count {
  font-size: 10px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color);
  border-radius: 8px;
  padding: 0 4px;
  min-width: 14px;
  text-align: center;
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
