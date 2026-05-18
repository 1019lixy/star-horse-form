<script setup lang="ts">
import {dynamicFormHelpMessage, formActions,} from "@/components/system/items/utils/DynamicForm";
import {i18n} from "@/lang";
import {computed, onMounted, ref} from "vue";
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
  {name: "张三", value: "zhangsan", userId: "zhangsan"},
  {name: "李四", value: "lisi", userId: "lisi"},
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
onMounted(() => {
});
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
      title="协作配置"
  >
    <el-form :model="tempForm" ref="cooperationFormRef">
      <el-form-item label="是否协作" required prop="cooperation">
        <el-input v-model="tempForm.cooperation"/>
      </el-form-item>
      <el-form-item label="表单Id" required prop="formId">
        <el-input v-model="tempForm.formId"/>
      </el-form-item>
      <el-form-item label="角色" required prop="roleId">
        <el-radio-group v-model="tempForm.roleId">
          <el-radio :value="item.value" v-for="item in roleList">
            {{ item.name }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
  </star-horse-dialog>
  <div class="inner_button" @click="closeDropdown">
    <div class="toolbar-container">
      <el-button-group class="toolbar-group">
        <template v-for="(item, index) in allActions">
          <el-button
              v-if="permissionCheck(item)"
              :key="'1_' + index"
              @click="actions(item)"
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
          <el-dropdown :show-arrow="false" v-else-if="item?.children?.length > 0">

            <el-button class="toolbar-button">
              <star-horse-icon
                  :icon-class="item.icon"
                  size="24px"
                  style="color: var(--star-horse-style)"
              />
              <el-icon class="el-icon--right">
                <arrow-down/>
              </el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-for="(sitem, sindex) in item.children"
                                  @click="actions(sitem)"
                >
                  <div class="flex items-center justify-center">
                    <star-horse-icon
                        :icon-class="sitem.icon"
                        size="24px"
                        style="color: var(--star-horse-style)"
                    />
                    <span class="dropdown-label">{{ sitem.label }}</span>
                  </div>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

        </template>
      </el-button-group>
    </div>

    <div class="toolbar-right">
      <el-tooltip
          class="item"
          content="协作配置"
          effect="dark"
          placement="bottom"
      >
        <star-horse-icon
            icon-class="setting"
            @click="cooperationConfig"
            cursor="pointer"
            v-if="optional?.cooperationMode ?? false"
        />
      </el-tooltip>
      <el-tooltip class="item" content="配置" effect="dark" placement="bottom">
        <star-horse-icon
            v-if="optional?.hideConfigBtn ?? true"
            icon-class="setting"
            @click="pageConfig"
            cursor="pointer"
        />
      </el-tooltip>
      <el-tooltip
          :content="i18n('dyform.toolbar.cache.restore')"
          v-if="cacheData?.length > 0"
          class="cache-button"
      >
        <star-horse-icon icon-class="reset" @click="cacheDataRestore($event)"/>
      </el-tooltip>

      <help :message="dynamicFormHelpMessage()"/>
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
