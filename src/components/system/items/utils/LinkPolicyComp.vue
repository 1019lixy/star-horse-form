<script setup lang="ts">
import {i18n} from "@/lang";
import {linkPolicyTypeEvent, relationDataField} from "@/components/system/items/utils/ItemPreps.js";
import {SelectOption, warning} from "star-horse-lowcode";
import ApiConfigForm from "@/components/system/items/utils/ApiConfigForm.vue";
import ConfigTemplateManager from "@/components/system/items/utils/ConfigTemplateManager.vue";
import {nextTick, PropType, reactive, ref, computed} from "vue";
import type {ConfigTemplateCategory} from "@/components/types/DataSourceTypes";
import {FormConfig} from "@/components/types";

defineOptions({name: "LinkPolicyComp"});

const props = defineProps({
  formProps: {
    type: Object as PropType<any>,
    default: () => ({}),
  },
  model: {
    type: String,
    default: "simple",
  },
  formFields: {
    type: Array as PropType<SelectOption[]>,
    default: () => [],
  },
  optional: {type: Object as PropType<FormConfig>}
});

// ─── Linkage type options ───
const linkageTypeOptions = [
  {
    value: "visibility",
    label: i18n("dyform.unified.linkage.tab.visibility"),
    icon: "View",
    desc: i18n("dyform.unified.linkage.visibility.desc")
  },
  {
    value: "apiFill",
    label: i18n("dyform.unified.linkage.tab.apiFill"),
    icon: "Connection",
    desc: i18n("dyform.unified.linkage.apiFill.desc")
  },
  {
    value: "custom",
    label: i18n("dyform.unified.linkage.tab.custom"),
    icon: "EditPen",
    desc: i18n("dyform.unified.linkage.custom.desc")
  },
];

// ─── Active type ───
const activeType = ref<string>("visibility");
const actionName = ref<string>("change");
// ─── Form refs ───
const visibilityFormRef = ref();
const apiConfigRef = ref();
/** 自定义实现 JS 代码 */
const customCode = ref<string>("");
/** 自定义代码编辑器引用 */
const codeEditorRef = ref();

// ─── Visibility Rule field config ───
const visibilityField = reactive<any>(relationDataField(props.formProps, props.model));


// ─── Public API ───
const setFormData = (data: any) => {
  nextTick(() => {
    if (data?.dataRelation) {
      activeType.value = "visibility";
      nextTick(() => visibilityFormRef.value?.setFormData(data.dataRelation));
    }
    if (data?.dataRelation?.apiLinkage) {
      activeType.value = "apiFill";
      nextTick(() => apiConfigRef.value?.setFormData(data?.dataRelation?.apiLinkage));
    }
    // 自定义实现：读取 customCode
    if (typeof data?.dataRelation?.customCode === "string" && data.dataRelation.customCode.trim()) {
      activeType.value = "custom";
      customCode.value = data.dataRelation.customCode;
    } else {
      customCode.value = "";
    }
    actionName.value = data["dataRelation"]?.["actionName"] ?? "change";
  });
};

const getFormData = () => {
  return {
    dataRelation: visibilityFormRef.value?.getFormData(),
    apiLinkage: apiConfigRef.value?.getFormData(),
    actionName: actionName.value,
  };
};

const submitValid = async () => {
  // 自定义实现：仅需校验 actionName 和代码非空
  if (activeType.value === "custom") {
    if (!actionName.value) {
      warning(i18n("dyform.linkPolicy.warning.triggerEventRequired"));
      return false;
    }
    if (!customCode.value.trim()) {
      warning(i18n("dyform.unified.linkage.custom.warning.empty"));
      return false;
    }
    if (props.formProps) {
      if (!props.formProps["dataRelation"]) {
        props.formProps["dataRelation"] = {};
      }
      props.formProps["dataRelation"]["actionName"] = actionName.value;
      props.formProps["dataRelation"]["customCode"] = customCode.value;
    }
    return true;
  }

  // Save visibility rule
  const visibilityStarForm = visibilityFormRef.value?.$refs?.starHorseFormRef;
  if (visibilityStarForm) {
    let flag = false;
    await visibilityStarForm.validate((res: boolean) => {
      flag = res;
    });
    if (!flag) {
      activeType.value = "visibility";
      return false;
    }
    if (!actionName.value) {
      warning(i18n("dyform.linkPolicy.warning.triggerEventRequired"));
      return false;
    }
  }
  const visibilityData = visibilityFormRef.value?.getFormData();
  if (visibilityData && props.formProps) {
    props.formProps["dataRelation"] = visibilityData.value ?? visibilityData;
  }
  if (props.formProps) {
    props.formProps["dataRelation"]["actionName"] = actionName.value;
    // 切换离开 custom 时清理 customCode
    if (props.formProps["dataRelation"]["customCode"] !== undefined) {
      delete props.formProps["dataRelation"]["customCode"];
    }
  }
  // Save API auto-fill
  const valid = await apiConfigRef.value?.submitValid();
  if (!valid) {
    activeType.value = "apiFill";
    return false;
  }
  const apiData = apiConfigRef.value?.getFormData();
  if (apiData && props.formProps) {
    props.formProps["dataRelation"]["apiLinkage"] = apiData.value ?? apiData;
  }

  return true;
};

// ─── 配置模板 ───
const templateRef = ref();

/** 获取当前模板分类（联动策略固定为 apiLinkage） */
const templateCategory = computed<ConfigTemplateCategory>(() => "apiLinkage");

/** 获取当前配置数据（用于保存模板） */
const getCurrentConfigData = (): Record<string, any> => {
  if (activeType.value === "apiFill") {
    return apiConfigRef.value?.getFormData()?.value ?? apiConfigRef.value?.getFormData() ?? {};
  }
  return visibilityFormRef.value?.getFormData()?.value ?? visibilityFormRef.value?.getFormData() ?? {};
};

/** 从模板加载配置 */
const handleTemplateLoad = (configData: Record<string, any>) => {
  if (activeType.value === "apiFill") {
    nextTick(() => apiConfigRef.value?.setFormData(configData));
  }
};

defineExpose({submitValid, setFormData, getFormData});
</script>

<template>
  <div class="unified-linkage">
    <div class="linkage-selector">
      <div class="selector-header">
        <span class="selector-title">{{ i18n("dyform.unified.linkage.type") }}</span>
        <span class="selector-desc">{{ linkageTypeOptions.find(o => o.value === activeType)?.desc }}</span>
      </div>
      <div class="type-cards">
        <div class="flex flex-row gap-3 flex-1">
          <div
              v-for="opt in linkageTypeOptions"
              :key="opt.value"

              :class="['type-card', { active: activeType === opt.value }]"
              @click="activeType = opt.value"
          >
            <el-icon class="type-icon" :size="18">
              <component :is="opt.icon"/>
            </el-icon>
            <span class="type-label">{{ opt.label }}</span>
          </div>
        </div>
        <div class="w-[30%]">
          <el-form-item :label="i18n('dyform.utils.516')" prop="actionName">
            <el-select v-model="actionName" allow-create clearable filterable>
              <el-option v-for="item in linkPolicyTypeEvent" :value="item.value" :key="item.value" :label="item.name"/>
            </el-select>
          </el-form-item>
        </div>
      </div>

    </div>

    <!-- Template Actions (only show when apiFill is active) -->
    <div v-if="activeType === 'apiFill'" class="template-actions-bar">
      <el-button size="small" type="primary" plain icon="FolderAdd" @click="templateRef?.openSaveDialog()">
        {{ i18n('dyform.template.save') }}
      </el-button>
      <el-button size="small" plain icon="FolderOpened" @click="templateRef?.openLoadDialog()">
        {{ i18n('dyform.template.load') }}
      </el-button>
    </div>

    <!-- Content -->
    <div class="linkage-content">
      <!-- Visibility Rule -->
      <div v-show="activeType === 'visibility'" class="visibility-panel">
        <star-horse-form :fieldList="visibilityField" ref="visibilityFormRef"/>
      </div>

      <div v-show="activeType === 'apiFill'" class="api-fill-panel">
        <ApiConfigForm
            ref="apiConfigRef"
            mode="linkage"
            :currentField="formProps.name"
            :formFields="formFields"
        />
      </div>

      <!-- 自定义实现 -->
      <div v-show="activeType === 'custom'" class="custom-panel">
        <el-alert
            :title="i18n('dyform.unified.linkage.custom.helpMsg')"
            type="info"
            :closable="false"
            show-icon
            style="margin-bottom: 8px;"
        />
        <star-horse-editor
            v-model:value="customCode"
            lang="javascript"
            ref="codeEditorRef"
            style="height: 320px;"
        />
      </div>
    </div>

    <!-- Config Template Manager -->
    <ConfigTemplateManager
        ref="templateRef"
        :optional="optional"
        :category="templateCategory"
        :currentConfigData="getCurrentConfigData()"
        @load="handleTemplateLoad"
    />
  </div>
</template>

<style scoped lang="scss">
.unified-linkage {
  width: 100%;
}

.linkage-selector {
  margin-bottom: 16px;
  padding: 16px;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);

  .selector-header {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin-bottom: 12px;

    .selector-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      white-space: nowrap;
    }

    .selector-desc {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      line-height: 1.4;
    }
  }

  .type-cards {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 8px;
    width: 100%;
  }

  .type-card {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border-radius: 6px;
    border: 1px solid var(--el-border-color);
    background: var(--el-bg-color);
    cursor: pointer;
    transition: all 0.2s ease;
    user-select: none;

    .type-icon {
      color: var(--el-text-color-secondary);
      transition: color 0.2s;
    }

    .type-label {
      font-size: 13px;
      color: var(--el-text-color-regular);
      white-space: nowrap;
    }

    &:hover {
      border-color: var(--el-color-primary-light-5);
      background: var(--el-color-primary-light-9);

      .type-icon {
        color: var(--el-color-primary);
      }
    }

    &.active {
      border-color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
      box-shadow: 0 0 0 1px var(--el-color-primary-light-7);

      .type-icon {
        color: var(--el-color-primary);
      }

      .type-label {
        color: var(--el-color-primary);
        font-weight: 500;
      }
    }
  }
}

.linkage-content {
  min-height: 200px;
  padding: 0 4px;
}

.template-actions-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  padding: 0 4px;
}
</style>
