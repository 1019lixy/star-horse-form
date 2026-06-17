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
  return formActions().concat(props.optional?.extendButtons);
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

const permissionCheck = (item: ToolBtnType) => {
  if (!item) return false;
  const permissions = props.optional?.permissions ?? {};
  return (
      (props.list.length > 0 || item.defaultEdit) &&
      (item.auth == "none" || permissions[item.auth]) &&
      !item.children
  );
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
      <!-- Group 1: 页面视图 + 新建/导入/编辑/图层/清空 -->
      <div class="toolbar-group">
        <template v-for="(item, index) in allActions" :key="'tb_' + index">
          <!-- 在 undo 前插入分隔 -->
          <div v-if="item.key === 'undo'" class="toolbar-divider" :key="'div_undo_' + index"></div>
          <!-- 在 valid 前插入分隔 -->
          <div v-if="item.key === 'valid'" class="toolbar-divider" :key="'div_valid_' + index"></div>
          <!-- 在 save 前插入分隔 -->
          <div v-if="item.key === 'save'" class="toolbar-divider" :key="'div_save_' + index"></div>

          <!-- 有子菜单的下拉按钮 -->
          <el-dropdown
              v-if="item?.children?.length > 0"
              :show-arrow="false"
              trigger="click"
              :key="'dd_' + index"
          >
            <el-button class="tb-btn" :title="item.label">
              <star-horse-icon :icon-class="item.icon" size="20px"/>
              <el-icon class="el-icon--right"><arrow-down/></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                    v-for="(sitem, sindex) in item.children"
                    :key="'sub_' + sindex"
                    @click="actions(sitem)"
                >
                  <div class="dropdown-item-inner">
                    <star-horse-icon :icon-class="sitem.icon" size="18px"/>
                    <span>{{ sitem.label }}</span>
                  </div>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <!-- 普通按钮 -->
          <el-tooltip
              v-else-if="permissionCheck(item)"
              :content="item.shortcut ? `${item.label} (${item.shortcut})` : item.label"
              effect="dark"
              placement="bottom"
              :show-after="500"
              :key="'btn_' + index"
          >
            <el-button class="tb-btn" @click="actions(item)">
              <star-horse-icon :icon-class="item.icon" size="20px"/>
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
.toolbar-root {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 12px;
  background: #ffffff;
  border-bottom: 1px solid #e8eaed;
  box-sizing: border-box;
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
  height: 22px;
  background: #dcdfe6;
  margin: 0 10px;
  flex-shrink: 0;
}

/* ====== Toolbar Button ====== */
.tb-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  padding: 0 8px;
  border: none !important;
  background: transparent !important;
  border-radius: 6px !important;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #606266;
  margin: 0 2px;

  :deep(.star-horse-icon) {
    font-size: 20px;
    color: var(--star-horse-style);
    transition: color 0.15s ease;
  }

  &:hover {
    background: #f0f2f5 !important;
    color: #303133;

    :deep(.star-horse-icon) {
      color: var(--star-horse-style);
    }
  }

  &:active {
    background: #e4e7ed !important;
  }

  .el-icon--right {
    margin-left: 2px;
    font-size: 12px;
    color: #909399;
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

  .star-horse-icon {
    color: var(--star-horse-style);
  }

  span {
    font-size: 13px;
    color: #303133;
  }
}
</style>
