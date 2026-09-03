<script setup lang="ts" name="MyComponentsPanel">
import {computed, ref} from "vue";
import {operationConfirm, StarHorseIcon, success} from "star-horse-lowcode";
import {getDesignFormStore} from "@/store/StoreManager";
import {fieldCopy, loadCustomComponents,} from "@/components/system/items/utils/FieldOperationUtils.js";
import {i18n} from "@/lang/index.js";
import {deleteCustomComponent, deleteLocalCustomComponent,} from "@/api/custom_component_api";

const designForm = getDesignFormStore();
const baseSelfFormDataList = computed(() => designForm.selfFormDataList);
const myCompQuery = ref<string>("");
const myContainerQuery = ref<string>("");
// 我的组件: 所有用户保存的自定义组件
const allMyCustomList = computed(() =>
  baseSelfFormDataList.value.filter((item: any) => item.isCustom),
);
// 我的组件-容器分类
const myCustomContainers = computed(() => {
  let list = allMyCustomList.value.filter(
    (item: any) => item.compType === "container",
  );
  if (!myContainerQuery.value) return list;
  return list.filter((item) =>
    item.itemName.toLowerCase().includes(myContainerQuery.value.toLowerCase()),
  );
});
// 我的组件-表单组件分类
const myCustomFormItems = computed(() => {
  let list = allMyCustomList.value.filter(
    (item: any) => item.compType !== "container",
  );
  if (!myCompQuery.value) return list;
  return list.filter((item) =>
    item.itemName.toLowerCase().includes(myCompQuery.value.toLowerCase()),
  );
});
let list = computed(() => designForm.compList);
let myCompNames = ref<string[]>(["mc", "mf"]);

const toggleMyCompSection = (name: string) => {
  const idx = myCompNames.value.indexOf(name);
  if (idx > -1) {
    myCompNames.value.splice(idx, 1);
  } else {
    myCompNames.value.push(name);
  }
};

const onDataCopy = (data: any, type: string) => {
  let mvData = fieldCopy(data, type);
  designForm.setDraggingItem(mvData);
  return mvData;
};

// 根据组件compType选择正确的clone函数
const onMyCompCopy = (data: any) => {
  return onDataCopy(
    data,
    data.compType === "container" ? "container" : "formItem",
  );
};

const addElement = (element: any, type: string) => {
  let mvData = fieldCopy(element, type);
  list.value.push(mvData);
  if (Array.isArray(mvData)) {
    let temp = mvData[mvData.length - 1];
    designForm.selectItem(temp, temp["itemType"], "");
  } else {
    designForm.selectItem(mvData, mvData["itemType"], "");
  }
};

// 删除自定义组件
const handleDeleteCustomComp = (element: any, e: Event) => {
  e.stopPropagation();
  e.preventDefault();
  const compName = element.itemName || "";
  operationConfirm(
    i18n("dyform.customComp.delete.confirm").replace("{name}", compName),
  )
    .then(() => {
      const id = element.idCustomComponent;
      if (!id) return;
      if (element.storageMode === "local") {
        deleteLocalCustomComponent(id);
        loadCustomComponents();
        success(i18n("dyform.customComp.delete.success"));
      } else {
        deleteCustomComponent(id)
          .then(() => {
            loadCustomComponents();
            success(i18n("dyform.customComp.delete.success"));
          })
          .catch(() => {});
      }
    })
    .catch(() => {});
};
</script>
<template>
  <el-scrollbar height="100%">
    <div class="field-sections">
      <!-- 我的容器 -->
      <div class="field-section">
        <div class="section-header" @click="toggleMyCompSection('mc')">
          <div class="section-title">
            <star-horse-icon
              icon-class="container"
              size="18px"
              class="section-icon"
            />
            <span>{{ i18n("dyform.collapse.myContainer") }}</span>
            <el-tag size="small" type="info" round>{{
              myCustomContainers.length
            }}</el-tag>
          </div>
          <svg
            :class="[
              'section-arrow',
              { expanded: myCompNames.includes('mc') },
            ]"
            viewBox="0 0 10 6"
            fill="none"
          >
            <path
              d="M1 1L5 5L9 1"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <div v-show="myCompNames.includes('mc')" class="section-body">
          <div class="search-box">
            <el-input
              v-model="myContainerQuery"
              :placeholder="i18n('dyform.collapse.myContainer')"
              clearable
              size="small"
            >
              <template #prefix>
                <star-horse-icon iconClass="search" size="14px" />
              </template>
            </el-input>
          </div>
          <draggable
            v-if="myCustomContainers.length > 0"
            :clone="onMyCompCopy"
            :group="{ name: 'starHorseGroup', pull: 'clone', put: false }"
            :sort="false"
            animation="200"
            ghost-class="ghost"
            item-key="idCustomComponent"
            tag="div"
            class="field-grid"
            :list="myCustomContainers"
          >
            <template #item="{ element }">
              <div
                class="field-card custom-card"
                @dblclick="
                  addElement(
                    element,
                    element.compType === 'container'
                      ? 'container'
                      : 'item',
                  )
                "
                :title="element.customDescription || element.itemName"
              >
                <el-tag
                  v-if="element.storageMode === 'local'"
                  size="small"
                  type="warning"
                  class="storage-badge"
                  >L</el-tag
                >
                <el-tag
                  v-else-if="element.isShared === 1"
                  size="small"
                  type="success"
                  class="storage-badge"
                  >S</el-tag
                >
                <star-horse-icon
                  :icon-class="element.itemIcon"
                  size="24px"
                  class="field-card-icon"
                />
                <span class="field-card-name">{{
                  element.itemName
                }}</span>
                <span
                  class="card-delete-btn"
                  @click="handleDeleteCustomComp(element, $event)"
                  :title="i18n('dyform.customComp.delete')"
                >
                  <star-horse-icon icon-class="dustbin" size="14px" />
                </span>
              </div>
            </template>
          </draggable>
          <el-empty
            v-else
            :image-size="60"
            :description="i18n('dyform.customComp.empty')"
          />
        </div>
      </div>

      <!-- 我的表单组件 -->
      <div class="field-section">
        <div class="section-header" @click="toggleMyCompSection('mf')">
          <div class="section-title">
            <star-horse-icon
              icon-class="form"
              size="18px"
              class="section-icon"
            />
            <span>{{ i18n("dyform.collapse.myFormComp") }}</span>
            <el-tag size="small" type="info" round>{{
              myCustomFormItems.length
            }}</el-tag>
          </div>
          <svg
            :class="[
              'section-arrow',
              { expanded: myCompNames.includes('mf') },
            ]"
            viewBox="0 0 10 6"
            fill="none"
          >
            <path
              d="M1 1L5 5L9 1"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <div v-show="myCompNames.includes('mf')" class="section-body">
          <div class="search-box">
            <el-input
              v-model="myCompQuery"
              :placeholder="i18n('dyform.collapse.myFormComp')"
              clearable
              size="small"
            >
              <template #prefix>
                <star-horse-icon iconClass="search" size="14px" />
              </template>
            </el-input>
          </div>
          <draggable
            v-if="myCustomFormItems.length > 0"
            :clone="onMyCompCopy"
            :group="{ name: 'starHorseGroup', pull: 'clone', put: false }"
            :sort="false"
            animation="200"
            ghost-class="ghost"
            item-key="idCustomComponent"
            tag="div"
            class="field-grid"
            :list="myCustomFormItems"
          >
            <template #item="{ element }">
              <div
                class="field-card custom-card"
                @dblclick="
                  addElement(
                    element,
                    element.compType === 'container'
                      ? 'container'
                      : 'item',
                  )
                "
                :title="element.customDescription || element.itemName"
              >
                <el-tag
                  v-if="element.storageMode === 'local'"
                  size="small"
                  type="warning"
                  class="storage-badge"
                  >L</el-tag
                >
                <el-tag
                  v-else-if="element.isShared === 1"
                  size="small"
                  type="success"
                  class="storage-badge"
                  >S</el-tag
                >
                <star-horse-icon
                  :icon-class="element.itemIcon"
                  size="24px"
                  class="field-card-icon"
                />
                <span class="field-card-name">{{
                  element.itemName
                }}</span>
                <span
                  class="card-delete-btn"
                  @click="handleDeleteCustomComp(element, $event)"
                  :title="i18n('dyform.customComp.delete')"
                >
                  <star-horse-icon icon-class="dustbin" size="14px" />
                </span>
              </div>
            </template>
          </draggable>
          <el-empty
            v-else
            :image-size="60"
            :description="i18n('dyform.customComp.empty')"
          />
        </div>
      </div>
      <div style="height: 40px"></div>
    </div>
  </el-scrollbar>
</template>
<style lang="scss" scoped>
.field-sections {
  padding: 8px;
}

.field-section {
  margin-bottom: 8px;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  overflow: hidden;
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }

  &:last-child {
    margin-bottom: 0;
  }
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: #fafbfc;
  cursor: pointer;
  user-select: none;
  transition: background 0.15s ease;

  &:hover {
    background: #f0f2f5;
  }
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.section-icon {
  color: var(--star-horse-style);
}

.section-arrow {
  width: 10px;
  height: 6px;
  color: #c0c4cc;
  transition: transform 0.2s ease;
  transform: rotate(-90deg);

  &.expanded {
    transform: rotate(0deg);
  }
}

.section-body {
  padding: 8px;
  background: #ffffff;
}

.search-box {
  margin-bottom: 8px;

  :deep(.el-input) {
    .el-input__wrapper {
      border-radius: 6px;
      box-shadow: 0 0 0 1px #e4e7ed inset;
      transition: box-shadow 0.15s ease;

      &:hover {
        box-shadow: 0 0 0 1px #c0c4cc inset;
      }

      &.is-focus {
        box-shadow: 0 0 0 1px var(--star-horse-style) inset;
      }
    }

    .el-input__prefix {
      color: #c0c4cc;
    }
  }
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 6px;
}

.field-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 4px;
  height: 68px;
  background: #fafbfc;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  cursor: grab;
  transition: all 0.15s ease;
  user-select: none;

  &:hover {
    background: #f0f7ff;
    border-color: var(--star-horse-style);
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
    transform: translateY(-1px);

    .field-card-icon {
      color: var(--star-horse-style);
    }

    .field-card-name {
      color: #303133;
    }
  }

  &:active {
    cursor: grabbing;
    transform: scale(0.97);
  }
}

.field-card-icon {
  color: var(--star-horse-style);
  transition: color 0.15s ease;
  flex-shrink: 0;
}

.field-card-name {
  font-size: 11px;
  color: #606266;
  text-align: center;
  line-height: 1.3;
  max-height: 2.6em;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  transition: color 0.15s ease;
}

.custom-card {
  position: relative;
  background: linear-gradient(135deg, #f0f9ff 0%, #fafbfc 100%);
  border-color: #d0e8ff;

  &:hover {
    background: linear-gradient(135deg, #e1f3ff 0%, #f0f7ff 100%);
    border-color: var(--star-horse-style);

    .card-delete-btn {
      opacity: 1;
      pointer-events: auto;
    }
  }

  &::after {
    content: "";
    position: absolute;
    top: 4px;
    right: 4px;
    width: 6px;
    height: 6px;
    background: var(--star-horse-style);
    border-radius: 50%;
    opacity: 0.6;
  }
}

.storage-badge {
  position: absolute;
  top: 2px;
  left: 2px;
  font-size: 10px;
  line-height: 1;
  padding: 0 4px;
  height: 14px;
  min-width: 14px;
  text-align: center;
}

.card-delete-btn {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(245, 108, 108, 0.9);
  color: #fff;
  cursor: pointer;
  opacity: 0;
  pointer-events: none;
  transition:
    opacity 0.15s ease,
    background 0.15s ease;
  z-index: 2;

  :deep(.star-horse-icon) {
    color: #fff;
  }

  &:hover {
    background: rgba(245, 108, 108, 1);
  }
}

:deep(.ghost) {
  opacity: 0.4;
  background: #ecf5ff;
  border: 1px dashed var(--star-horse-style);
  border-radius: 8px;
}
</style>