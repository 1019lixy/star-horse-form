<script setup lang="ts">
import {dynamicFormHelpMessage, formActions,} from "@/components/system/items/utils/DynamicForm";
import {i18n} from "@/lang";
import {computed, ref} from "vue";
import {ToolBtnType} from "@/components/types/ToolBtnType";
import {FormConfig} from "@/components/types";
import {getDesignFormStore, StarHorseIcon,} from "star-horse-lowcode";

const emit = defineEmits<{
  (e: "action", action: ToolBtnType | any): void;
  (e: "cacheRestore", event: MouseEvent): void;
  (e: "changeRole", data: any): void;
}>();

const props = defineProps<{
  list: any[];
  optional: FormConfig;
  currentPageStyle: any;
  cacheData: any;
}>();
const designForm = getDesignFormStore();
let formInfo = computed(() => designForm.formInfo);
const activeDropdown = ref<string | null>(null);
const allActions = computed(() => {
  const extra = props.optional?.extendButtons;
  return extra ? formActions().concat(extra) : formActions();
});
const actions = (item: ToolBtnType) => {
  if (item.action) {
    item.action();
  } else {
    emit("action", item);
  }
  closeDropdown();
};

const cacheDataRestore = (evt: MouseEvent) => {
  emit("cacheRestore", evt);
};

const hasComponents = computed(() => props.list.length > 0);

const isDisabled = (item: ToolBtnType) => {
  const alwaysEnabledKeys = ["file", "upload", "newForm", "new", "style", "pc", "pad", "phone"];
  if (!hasComponents.value && !alwaysEnabledKeys.includes(item.key)) {
    return true;
  }
  const permissions = props.optional?.permissions ?? {};
  return !(item.auth == "none" || permissions[item.auth]);
};
const isGroupDisabled = (item: ToolBtnType) => {
  if (!isGroup(item)) return isDisabled(item);
  if (!hasComponents.value) {
    const hasAlwaysEnabled = item.children?.some(child => 
      ["newForm", "upload", "pc", "pad", "phone"].includes(child.key)
    );
    return !hasAlwaysEnabled;
  }
  return false;
};
const isGroup = (item: ToolBtnType) => !!item.children?.length;
const showDividerBefore = (item: ToolBtnType, index: number) => {
  if (index === 0) return false;
  return true;
};
// 页面配置功能
const pageConfig = () => {
  emit("action", {
    key: "formConfig",
  });
};
const closeDropdown = () => {
  activeDropdown.value = null;
};
const cooperationConfigVisible = ref<boolean>(false);
const tempForm = ref<any>({});
const cooperationFormRef = ref();
const roleList: any = [
  {name: i18n("dyform.toolbar.testUser1"), value: "zhangsan", userId: "zhangsan"},
  {name: i18n("dyform.toolbar.testUser2"), value: "lisi", userId: "lisi"},
];
const cooperationConfig = () => {
  cooperationConfigVisible.value = true;
};
const doSave = (flag: boolean) => {
  cooperationFormRef.value?.validate((temp) => {
    if (temp) {
      formInfo.value["cooperation"] = tempForm.value.cooperation ?? "N";
      formInfo.value["formId"] = tempForm.value.formId;
      cooperationConfigVisible.value = false;
    }
  });
  emit(
      "changeRole",
      roleList.find((item) => item.value == tempForm.value.roleId),
  );
  // formInfo.value["formId"]=tempForm.value.formId;
};
// onMounted reserved for future initialization
</script>

<template>
  <star-horse-dialog
      :dialogVisible="cooperationConfigVisible"
      @closeAction="cooperationConfigVisible = false"
      :selfFunc="true"
      compSize="default"
      @merge="() => doSave(false)"
      boxHeight="30%"
      boxWidth="40%"
      :title="i18n('dyform.toolbar.cooperationConfig')"
  >
    <el-form :model="tempForm" ref="cooperationFormRef">
      <el-form-item :label="i18n('dyform.toolbar.isCooperation')" required prop="cooperation">
        <el-input v-model="tempForm.cooperation"/>
      </el-form-item>
      <el-form-item :label="i18n('dyform.toolbar.formId')" required prop="formId">
        <el-input v-model="tempForm.formId"/>
      </el-form-item>
      <el-form-item :label="i18n('dyform.toolbar.role')" required prop="roleId">
        <el-radio-group v-model="tempForm.roleId">
          <el-radio :value="item.value" v-for="item in roleList" :key="item.value">
            {{ item.name }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
  </star-horse-dialog>
  <div class="toolbar-root" @click="closeDropdown">
    <div class="toolbar-left">
      <!-- 工具条分组：文件(下拉) | 编辑(下拉) | 撤销/重做(平铺) | 风格(下拉) | 校验 | 预览 | 保存 -->
      <div class="toolbar-group">
        <template v-for="(item, index) in allActions" :key="'tb_' + index">
          <!-- 组间分隔符（独立渲染，不参与按钮的 v-if 链） -->
          <div
              v-if="showDividerBefore(item, index)"
              class="toolbar-divider"
              :key="'div_' + index"
          ></div>

          <!-- 平铺组：children 依次平铺为普通按钮（高频操作，如撤销/重做） -->
          <template v-if="isGroup(item) && item.flat">
            <template v-for="(child, cidx) in item.children" :key="'flat_' + index + '_' + cidx">
              <el-tooltip
                  :content="child.shortcut ? `${child.label} (${child.shortcut})` : child.label"
                  effect="dark"
                  placement="bottom"
                  :show-after="500"
              >
                <el-button class="tb-btn" @click="actions(child)" :disabled="isDisabled(child)">
                  <template v-if="child.icon === 'ai'">
                    <svg class="ai-toolbar-icon" viewBox="0 0 24 24" fill="none" width="20" height="20">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="url(#ai-grad)" />
                      <path d="M8.5 11a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM15.5 11a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" fill="white"/>
                      <path d="M8 14.5c0 0 1.5 2.5 4 2.5s4-2.5 4-2.5" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                      <defs><linearGradient id="ai-grad" x1="2" y1="2" x2="22" y2="22"><stop stop-color="#667eea"/><stop offset="1" stop-color="#764ba2"/></linearGradient></defs>
                    </svg>
                  </template>
                  <template v-else>
                    <star-horse-icon :icon-class="child.icon" size="20px"/>
                  </template>
                </el-button>
              </el-tooltip>
            </template>
          </template>

          <!-- 下拉组：children 收进下拉菜单（触发器显示 图标+文字+箭头） -->
          <el-dropdown
              v-else-if="isGroup(item)"
              :show-arrow="false"
              trigger="click"
              :key="'dd_' + index"
          >
            <el-button class="tb-btn tb-btn-group" :title="item.label" :disabled="isGroupDisabled(item)">
              <template v-if="item.icon === 'ai'">
                <svg class="ai-toolbar-icon" viewBox="0 0 24 24" fill="none" width="18" height="18">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="url(#ai-grad)" />
                  <path d="M8.5 11a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM15.5 11a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" fill="white"/>
                  <path d="M8 14.5c0 0 1.5 2.5 4 2.5s4-2.5 4-2.5" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                  <defs><linearGradient id="ai-grad" x1="2" y1="2" x2="22" y2="22"><stop stop-color="#667eea"/><stop offset="1" stop-color="#764ba2"/></linearGradient></defs>
                </svg>
              </template>
              <template v-else>
                <star-horse-icon :icon-class="item.icon" size="18px"/>
              </template>
              <span class="tb-btn-label">{{ item.label }}</span>
              <el-icon class="el-icon--right"><arrow-down/></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                    v-for="(sitem, sindex) in item.children"
                    :key="'sub_' + sindex"
                    :disabled="isDisabled(sitem)"
                    @click="actions(sitem)"
                >
                  <div class="dropdown-item-inner">
                    <template v-if="sitem.icon === 'ai'">
                      <svg class="ai-toolbar-icon" viewBox="0 0 24 24" fill="none" width="18" height="18">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="url(#ai-grad)" />
                        <path d="M8.5 11a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM15.5 11a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" fill="white"/>
                        <path d="M8 14.5c0 0 1.5 2.5 4 2.5s4-2.5 4-2.5" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                        <defs><linearGradient id="ai-grad" x1="2" y1="2" x2="22" y2="22"><stop stop-color="#667eea"/><stop offset="1" stop-color="#764ba2"/></linearGradient></defs>
                      </svg>
                    </template>
                    <template v-else>
                      <star-horse-icon :icon-class="sitem.icon" size="18px"/>
                    </template>
                    <span>{{ sitem.label }}</span>
                    <span v-if="sitem.shortcut" class="dropdown-item-shortcut">{{ sitem.shortcut }}</span>
                  </div>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <!-- 普通按钮 -->
          <el-tooltip
              v-else
              :content="item.shortcut ? `${item.label} (${item.shortcut})` : item.label"
              effect="dark"
              placement="bottom"
              :show-after="500"
              :key="'btn_' + index"
          >
            <el-button class="tb-btn" @click="actions(item)" :disabled="isDisabled(item)">
              <template v-if="item.icon === 'ai'">
                <svg class="ai-toolbar-icon" viewBox="0 0 24 24" fill="none" width="20" height="20">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="url(#ai-grad)" />
                  <path d="M8.5 11a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM15.5 11a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" fill="white"/>
                  <path d="M8 14.5c0 0 1.5 2.5 4 2.5s4-2.5 4-2.5" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                  <defs><linearGradient id="ai-grad" x1="2" y1="2" x2="22" y2="22"><stop stop-color="#667eea"/><stop offset="1" stop-color="#764ba2"/></linearGradient></defs>
                </svg>
              </template>
              <template v-else>
                <star-horse-icon :icon-class="item.icon" size="20px"/>
              </template>
            </el-button>
          </el-tooltip>
        </template>
      </div>
    </div>

    <div class="toolbar-right">
      <el-tooltip
          v-if="optional?.cooperationMode ?? false"
          :content="i18n('dyform.toolbar.cooperationConfig')"
          effect="dark"
          placement="bottom"
          :show-after="500"
      >
        <el-button class="tb-btn tb-btn-ghost" @click="cooperationConfig">
          <star-horse-icon icon-class="setting" size="20px"/>
        </el-button>
      </el-tooltip>

      <el-tooltip
          v-if="optional?.hideConfigBtn ?? true"
          :content="i18n('dyform.toolbar.config')"
          effect="dark"
          placement="bottom"
          :show-after="500"
      >
        <el-button class="tb-btn tb-btn-ghost" @click="pageConfig">
          <star-horse-icon icon-class="setting" size="20px"/>
        </el-button>
      </el-tooltip>

      <el-tooltip
          v-if="cacheData?.length > 0"
          :content="i18n('dyform.toolbar.cache.restore')"
          effect="dark"
          placement="bottom"
          :show-after="500"
      >
        <el-button class="tb-btn tb-btn-ghost" @click="cacheDataRestore($event)">
          <star-horse-icon icon-class="reset" size="20px"/>
        </el-button>
      </el-tooltip>

      <help :message="dynamicFormHelpMessage()"/>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ai-toolbar-icon {
  vertical-align: middle;
}

.toolbar-root {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: 0 16px;
  background: linear-gradient(to bottom, #ffffff 0%, #fafbfc 100%);
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  box-sizing: border-box;
  position: relative;
  z-index: 10;
}

.toolbar-left {
  display: flex;
  align-items: center;
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: #c0c4cc transparent;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #c0c4cc;
    border-radius: 2px;

    &:hover {
      background: #909399;
    }
  }
}

/* ====== Toolbar Group ====== */
.toolbar-group {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

/* ====== Divider between groups ====== */
.toolbar-divider {
  width: 1px;
  height: 20px;
  background: #dcdfe6;
  margin: 0 8px;
  flex-shrink: 0;
}

/* ====== Toolbar Button ====== */
.tb-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 34px;
  height: 32px;
  padding: 0 8px;
  border: none !important;
  background: transparent !important;
  border-radius: 6px !important;
  cursor: pointer;
  transition: all 0.18s ease;
  color: #606266;
  margin: 0 1px;

  :deep(.star-horse-icon) {
    font-size: 18px;
    color: var(--star-horse-style);
    transition: color 0.15s ease;
  }

  &:hover {
    background: #eef1f6 !important;
    color: #303133;

    :deep(.star-horse-icon) {
      color: var(--star-horse-style);
    }
  }

  &:active {
    background: #e4e7ed !important;
  }

  &.is-disabled {
    cursor: not-allowed !important;
    opacity: 0.45 !important;

    :deep(.star-horse-icon) {
      color: #c0c4cc !important;
    }

    .tb-btn-label {
      color: #c0c4cc !important;
    }

    .el-icon--right {
      color: #dcdfe6 !important;
    }
  }

  &:deep(.el-button.is-disabled) {
    cursor: not-allowed !important;
    opacity: 0.45 !important;

    :deep(.star-horse-icon) {
      color: #c0c4cc !important;
    }

    .tb-btn-label {
      color: #c0c4cc !important;
    }

    .el-icon--right {
      color: #dcdfe6 !important;
    }
  }

  .el-icon--right {
    margin-left: 2px;
    font-size: 11px;
    color: #909399;
  }
}

/* 下拉组触发器：图标 + 文字 + 箭头 */
.tb-btn-group {
  padding: 0 8px 0 10px;
  gap: 5px;

  .tb-btn-label {
    font-size: 13px;
    font-weight: 500;
    color: #303133;
    line-height: 1;
    white-space: nowrap;
  }

  &:hover {
    background: #eef1f6 !important;

    .tb-btn-label {
      color: var(--star-horse-style);
    }
  }
}

.tb-btn-ghost {
  :deep(.star-horse-icon) {
    color: #909399;
  }

  &:hover {
    :deep(.star-horse-icon) {
      color: var(--star-horse-style);
    }
  }
}

/* ====== Right Side ====== */
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

/* ====== Dropdown Menu Item ====== */
:deep(.dropdown-item-inner) {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 160px;

  .star-horse-icon {
    color: var(--star-horse-style);
    flex-shrink: 0;
  }

  span {
    font-size: 13px;
    color: #303133;

    &:first-of-type {
      flex: 1;
    }
  }

  .dropdown-item-shortcut {
    font-size: 11px;
    color: #c0c4cc;
    margin-left: 12px;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  }
}
</style>
