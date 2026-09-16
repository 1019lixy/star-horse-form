<script setup lang="ts">
/**
 * 流程绑定扩展 Tab（自包含：Tab 字段定义 + 参数绑定表 + 在线流程设计器弹窗）。
 *
 * 本组件封装了表单级流程绑定的全部业务逻辑：
 * - flowFlag / flowBindMode / flowDefineId 字段定义（通过 useFlowBinding 返回 tabConfig 注入 advancedProps）
 * - reuse 模式：从后台流程定义列表选择已有流程 + 流程参数与表单字段映射
 * - design 模式：打开可视化流程设计器在线设计，节点树保存到 formInfo.flowConfigures.process
 *
 * 使用方式：
 * 1. 调用 useFlowBinding(() => optional.value) 获取 { tabConfig, validateFlowDesign, transformFlowConfigures, state }
 * 2. 将 tabConfig 放入 optional.advancedProps
 * 3. 将 validateFlowDesign / transformFlowConfigures 放入 optional 对应回调
 * 4. 在 #property-panel-extra 插槽中渲染 <FlowBindingTab :state="..." :currentTab="..." :allTableFieldList="..."/>
 */
/**
 * useFlowBinding —— 流程绑定扩展 composable。
 *
 * 创建流程绑定全部响应式状态、Tab 字段定义、校验和数据转换函数。
 * 接入方在 setup 中调用，将返回值分别注入 advancedProps 和 FormConfig 回调。
 *
 * @param getOptional 获取 FormConfig 的函数（延迟求值，打破循环依赖）
 * @param tabKey      Tab 唯一标识，默认 "tab3"
 */
import {computed, onMounted, reactive, ref, unref, watch} from "vue";
import {PageFieldInfo, postRequest, SelectOption, uuid, warning} from "star-horse-lowcode";
import {i18n} from "@/lang";
import {getDesignFormStore, getFlowDesignStore} from "@/store/StoreManager";
import FlowDesigner from "@/components/workflow/designer/FlowDesigner.vue";
import FlowParamBindingTable from "@/components/system/items/form/components/FlowParamBindingTable.vue";
import {validateAllNodes} from "@/components/workflow/validator";
import {designDataNames} from "@/api/form_utils";

defineOptions({name: "FlowBindingTab"});
const props = defineProps<{
  /** 组件大小 */
  compSize?: "small" | "default" | "large";
}>();

const designForm = getDesignFormStore();
const formInfo = computed(() => designForm.formInfo);
const flowDesign = getFlowDesignStore();
const flowDesignerVisible = ref(false);
const flowDesigned = ref(false);
const formFlowParamsLoading = ref(false);
const formFlowParamBindings = ref<any>([]);
const formFlowParams = ref<any>([]);
const flowDefineOptions = ref<SelectOption[]>([]);
const flowDesignerRef = ref();
const flowBindingFormRef = ref();
/** 表单级 reuse 模式 + 已选流程时显示参数绑定 */
const showFormFlowParamBinding = computed(
    () =>
        formInfo.value?.flowConfigures?.flowFlag === "Y" &&
        formInfo.value?.flowConfigures?.mode === "reuse" &&
        !!formInfo.value?.flowConfigures?.flowDefineId,
);
const allTableFieldList = computed(() => designDataNames(designForm.compList))
/** 打开在线设计对话框 */
const openFlowDesigner = () => {
  const existed = formInfo.value?.flowConfigures?.process;
  if (existed) {
    flowDesign.flowSetNode(JSON.parse(JSON.stringify(existed)));
  } else {
    flowDesign.flowSetNode(null);
  }
  flowDesignerVisible.value = true;
};

/** 保存在线设计结果 */
const saveFlowDesign = () => {
  const node = unref(flowDesignerRef.value?.nodeData);
  if (!node || !node.childNode) {
    warning(i18n("dyform.step.flowDesignEmpty"));
    return;
  }
  const errors = validateAllNodes(node);
  if (errors.length > 0) {
    warning(errors.map((e) => `[${e.nodeName}] ${e.errors.join("；")}`).join("\n"));
    return;
  }
  formInfo.value.flowConfigures = {
    mode: "design",
    flowFlag: "Y",
    process: JSON.parse(JSON.stringify(node)),
  };
  flowDesigned.value = true;
  flowDesignerVisible.value = false;
};

/** 同步参数绑定到 formInfo.flowConfigures */
const syncFlowParamBindings = () => {
  if (!formInfo.value.flowConfigures) {
    formInfo.value.flowConfigures = {mode: "reuse"};
  }
  formInfo.value.flowConfigures.flowParamBindings = formFlowParamBindings.value;
};
// ==================== 流程绑定回调（接入方自行实现，lib 只提供通道） ====================
const FLOW_OPERATION_PREFIX = "/flow-engine/workflow/flowDefine";
const PARAMS_PREFIX = "/flow-engine/workflow/processNode";

const loadFlowDefines = async (): Promise<SelectOption[]> => {
  const res = await postRequest(`${FLOW_OPERATION_PREFIX}/pageList`, {
    pageNum: 1,
    pageSize: 400,
  });
  if (res?.data?.code !== 200) return [];
  const list = res.data.data?.dataList;
  return list.map((item: any) => ({
    name: item.name || item.flowName,
    value: item.flowDeploymentId,
  }));
};

const loadFlowParams = async (
    flowDefineId: string,
): Promise<
    { name: string; label?: string; required?: boolean; description?: string; type?: string }[]
> => {
  const res = await postRequest(`${PARAMS_PREFIX}/loadByDefineId`, {
    item: flowDefineId
  });
  if (res?.data?.code !== 200) return [];
  const list = res.data.data || [];
  return list.map((item: any) => ({
    name: item.nodeKey,
    label: item.nodeName,
    required: false,
    type: item.nodeType,
    description: undefined,
  }));
};
/** 加载流程定义的参数列表 */
const loadFormFlowParams = async (flowDefineId: string) => {
  if (!flowDefineId) {
    formFlowParams.value = [];
    return;
  }
  formFlowParamsLoading.value = true;
  try {
    const params = await loadFlowParams(flowDefineId);
    formFlowParams.value = params || [];
    const existing = formInfo.value?.flowConfigures?.flowParamBindings || [];
    formFlowParamBindings.value = formFlowParams.value.map((p) => {
      const old = existing.find((b) => b.param === p.name);
      return {
        id: old?.id || uuid(),
        param: p.name,
        fieldName: old?.fieldName || "",
        required: !!p.required,
      };
    });
    syncFlowParamBindings();
  } catch {
    formFlowParams.value = [];
  } finally {
    formFlowParamsLoading.value = false;
  }
};


/** 参数绑定变化时同步到 flowConfigures */
watch(
    () => formFlowParamBindings.value,
    () => {
      if (showFormFlowParamBinding.value) {
        syncFlowParamBindings();
      }
    },
    {deep: true},
);

/** 回显流程绑定状态 */
onMounted(() => {
  if (!flowDefineOptions.value.length) {
    loadFlowDefines().then((list: SelectOption[]) => {
      flowDefineOptions.value = list || [];
    });
  }
  const flowConfigures = formInfo.value?.flowConfigures;
  if (flowConfigures?.mode) {

    if (flowConfigures.mode == "reuse" && flowConfigures.flowDefineId) {
      loadFormFlowParams(flowConfigures.flowDefineId);
    }
    if (flowConfigures.mode == "design" && flowConfigures.process) {
      flowDesigned.value = true;
    }
  }
});

/** 绑定模式字段 */
const bindModeField = {
  label: i18n("dyform.step.flowBindMode"),
  fieldName: "flowBindMode",
  type: "radio",
  defaultValue: "reuse",
  helpMsg: i18n("dyform.step.flowBindMode.helpMsg"),
  formVisible: false,
  preps: {
    values: [
      {name: i18n("dyform.step.flowBindMode.reuse"), value: "reuse"},
      {name: i18n("dyform.step.flowBindMode.design"), value: "design"},
    ],
    dataRelation: {
      actionName: "change",
      relationDetails: [
        {matchType: "eq", controlCondition: "eqVisible", relationFields: ["flowDefineId"], matchFieldValue: "reuse"},
        {
          matchType: "eq",
          controlCondition: "eqExecution",
          relationFields: ["abc"],
          func: (val: any) => {
            formInfo.value.flowConfigures = {
              ...(formInfo.value.flowConfigures || {}),
              flowBindMode: val["flowBindMode"],
              mode: "design",
            };
            openFlowDesigner();
          },
          matchFieldValue: "design",
        },
      ],
    },
  },
};

/** 流程定义选择字段 */
const flowDefineIdField = {
  label: i18n("dyform.step.formFlowDefine"),
  fieldName: "flowDefineId",
  type: "select",
  formVisible: false,
  actions: {
    change: (val: any) => {
      if (val["flowDefineId"]) {
        formInfo.value.flowConfigures = {
          mode: "reuse",
          flowFlag: "Y",
          flowDefineId: val["flowDefineId"],
          flowParamBindings: formInfo.value.flowConfigures?.flowParamBindings || [],
        };
        loadFormFlowParams(val["flowDefineId"]);
      } else {
        formFlowParams.value = [];
        formFlowParamBindings.value = [];
      }
    },
  },
  preps: {values: flowDefineOptions},
};
/** 流程绑定字段列表 */
const flowBindingFields = [
  {
    label: i18n("dyform.step.flowFlag"),
    fieldName: "flowFlag",
    type: "switch",
    defaultValue: "N",
    formVisible: true,
    actions: {
      change: (val: any) => {
        formInfo.value.flowConfigures.flowFlag = val["flowFlag"];
      },
    },
    preps: {
      activeValue: "Y", inactiveValue: "N",
      dataRelation: {
        actionName: "change",
        relationDetails: [
          {
            matchType: "eq",
            controlCondition: "eqVisible",
            relationFields: ["flowBindMode", "flowDefineId", "starterField"],
            matchFieldValue: "Y",
          },
        ],
      },
    },
  },
  bindModeField,
  flowDefineIdField,
];

/** Tab 配置（放入 advancedProps） */
const tabConfig = reactive<PageFieldInfo>({
  fieldList: flowBindingFields,
});
watch(() => flowBindingFormRef.value?.getFormData()?.value, (value) => {
  formInfo.value.flowConfigures = value;
})

</script>

<template>

  <!-- 表单级流程参数绑定（reuse 模式）：选流程后显示参数与表单字段映射表  -->
  <div class="bind-flow-tab">
    <star-horse-form
        ref="flowBindingFormRef"
        :fieldList="tabConfig"
        :compSize="compSize"
        :dynamicForm="true"
    />
    <div
        v-if="showFormFlowParamBinding"
        class="form-flow-param-binding"
    >
      <div class="ffpb-title">
        {{ i18n("dyform.step.flowParamBinding") }}
        <span class="ffpb-tip">{{ i18n("dyform.step.flowParamBindingRemark") }}</span>
      </div>
      <FlowParamBindingTable
          v-model="formFlowParamBindings"
          :params="formFlowParams"
          :fields="allTableFieldList || []"
          :comp-size="compSize ?? 'default'"
          :loading="formFlowParamsLoading"
      />
    </div>
    <!-- 流程在线设计对话框 -->
    <star-horse-panel
        v-model="flowDesignerVisible"
        :title="flowDesigned
        ? i18n('dyform.step.flowDesignerTitle.reedit')
        : i18n('dyform.step.flowDesignerTitle')"
        :userAction="true"
        :fullScreen="true"
        @closeAction="flowDesignerVisible = false"
        @merge="saveFlowDesign"
    >
      <FlowDesigner
          ref="flowDesignerRef"
          :stopInitFormInfo="true"
          :saveBtnVisible="false"
          :mapBtnVisible="false"
          :initialNode="formInfo?.flowConfigures?.process || {}"
      />
    </star-horse-panel>
  </div>
</template>

<style lang="scss" scoped>
.bind-flow-tab {
  display: flex;
  width: 100%;
  flex-direction: column;
  height: 100%;

}

.form-flow-param-binding {
  padding: 8px 16px;
  border-top: 1px solid var(--el-border-color-lighter);

  .ffpb-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-regular);
    margin-bottom: 8px;
  }

  .ffpb-tip {
    font-size: 12px;
    color: var(--el-text-color-placeholder);
    margin-left: 8px;
  }
}
</style>

