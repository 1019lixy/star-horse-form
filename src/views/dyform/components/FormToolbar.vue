<script setup lang="ts">
import { dynamicFormContextMenuData } from "@/plugins/AblesPlugin.ts";
import {
  dynamicFormHelpMessage,
  formActions,
} from "@/views/dyform/utils/DynamicForm.ts";
import { i18n } from "@/lang";
import { ref } from "vue";

const emit = defineEmits<{
  (e: "action", action: string): void;
  (e: "styleChange", style: any): void;
  (e: "cacheRestore", event: MouseEvent): void;
  (e: "contextMenu", event: MouseEvent): void;
}>();

const props = defineProps<{
  list: any[];
  permissions: any;
  currentPageStyle: any;
  cacheData: any;
}>();

// For handling dropdown menus
const activeDropdown = ref<string | null>(null);

const actions = (action: string) => {
  emit("action", action);
};

const actionsStyle = (item: any) => {
  emit("styleChange", item);
};

const cacheDataRestore = (evt: MouseEvent) => {
  emit("cacheRestore", evt);
};

const contextMenu = (evt: MouseEvent) => {
  emit("contextMenu", evt);
};

// Toggle dropdown visibility
const toggleDropdown = (key: string) => {
  activeDropdown.value = activeDropdown.value === key ? null : key;
};

// Close dropdown when clicking outside
const closeDropdown = () => {
  activeDropdown.value = null;
};

// Close dropdown when an item is selected
const handleDropdownSelect = (item: any) => {
  actionsStyle(item);
  closeDropdown();
};
</script>

<template>
  <div class="inner_button" @click="closeDropdown">
    <div class="toolbar-container">
      <el-button-group class="toolbar-group">
        <template v-for="(item, index) in formActions">
          <!-- Regular button without children -->
          <el-button
            v-if="
              (list.length > 0 || item.defaultEdit) &&
              (item.auth == 'none' || permissions[item.auth]) &&
              !item.children
            "
            :key="'1_' + index"
            @click="actions(item.key)"
            :title="`${item.label} (${item.shortcut || ''})`"
            class="toolbar-button"
          >
            <el-tooltip
              class="item"
              :content="`${item.label} (${item.shortcut || ''})`"
              effect="dark"
              placement="bottom"
            >
              <star-horse-icon
                :icon-class="item.icon"
                size="24px"
                style="color: var(--star-horse-style)"
              />
            </el-tooltip>
          </el-button>

          <!-- Button with dropdown for children -->
          <div
            v-else-if="item.children && item.children.length > 0"
            :key="'1_' + index"
            class="dropdown-container"
          >
            <el-button
              @click.stop="toggleDropdown(item.key)"
              :title="item.label"
              class="toolbar-button with-dropdown"
            >
              <el-tooltip
                class="item"
                :content="item.label"
                effect="dark"
                placement="bottom"
              >
                <star-horse-icon
                  :icon-class="item.icon"
                  size="24px"
                  style="color: var(--star-horse-style)"
                />
              </el-tooltip>
              <el-icon class="dropdown-arrow">
                <arrow-down />
              </el-icon>
            </el-button>

            <!-- Dropdown menu -->
            <div
              v-show="activeDropdown === item.key"
              class="dropdown-menu"
              @click.stop
            >
              <div
                v-for="(sitem, sindex) in item.children"
                :key="'2_' + sindex"
                class="dropdown-item"
                @click="handleDropdownSelect(sitem)"
                :title="`${sitem.label} (${sitem.shortcut || ''})`"
              >
                <star-horse-icon
                  :icon-class="sitem.icon"
                  size="24px"
                  style="color: var(--star-horse-style)"
                />
                <span class="dropdown-label">{{ sitem.label }}</span>
              </div>
            </div>
          </div>
        </template>
      </el-button-group>
    </div>

    <div class="toolbar-right">
      <el-tooltip
        :content="i18n('dyform.toolbar.cache.restore')"
        v-if="cacheData?.length > 0"
        class="cache-button"
      >
        <star-horse-icon icon-class="reset" @click="cacheDataRestore($event)" />
      </el-tooltip>
      <help :message="dynamicFormHelpMessage" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.inner_button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 42px !important;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);

  .toolbar-container {
    display: flex;
    align-items: center;

    .toolbar-group {
      display: flex;
      align-items: center;

      .toolbar-button {
        border: none !important;
        background: transparent;
        padding: 8px 12px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: all 0.2s ease;
        margin: 0 2px;

        &:hover {
          background-color: #ecf5ff;
          color: #409eff;
        }

        &:active {
          background-color: #d9ecff;
        }

        &.with-dropdown {
          display: flex;
          align-items: center;
          gap: 4px;

          .dropdown-arrow {
            font-size: 12px;
            transition: transform 0.3s;
          }
        }
      }
    }
  }

  .dropdown-container {
    position: relative;
    display: flex;
    height: 40px;
    margin: 0 2px;

    .dropdown-menu {
      position: absolute;
      top: 100%;
      left: 0;
      z-index: 1000;
      background: white;
      border: 1px solid #e4e7ed;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      min-width: 140px;
      padding: 6px 0;
      margin-top: 6px;

      .dropdown-item {
        display: flex;
        align-items: center;
        padding: 10px 16px;
        cursor: pointer;
        gap: 8px;
        transition: background-color 0.2s;

        &:hover {
          background-color: #f5f7fa;
        }

        .dropdown-label {
          font-size: 14px;
          color: #606266;
        }
      }
    }
  }

  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 12px;

    .cache-button {
      display: flex;
      align-items: center;
      padding: 8px;
      height: 40px;
      border-radius: 4px;
      transition: background-color 0.2s;

      &:hover {
        background-color: #ecf5ff;
      }

      :deep(.star-horse-icon) {
        cursor: pointer;
        font-size: 20px;
        color: #606266;

        &:hover {
          color: #409eff;
        }
      }
    }
  }
}
</style>
