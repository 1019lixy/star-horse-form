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
import {computed, onMounted, ref, unref, watch} from "vue";
import {SelectOption, uuid, warning} from "star-horse-lowcode";
import {i18n} from "@/lang";
import {getDesignFormStore, getFlowDesignStore} from "@/store/StoreManager";
import FlowDesigner from "@/components/workflow/designer/FlowDesigner.vue";
import FlowParamBindingTable from "@/components/system/items/form/components/FlowParamBindingTable.vue";
import type {FlowParam, FlowParamBinding} from "@/components/workflow/types";
import {validateAllNodes} from "@/components/workflow/validator";
import {FormConfig, FormExtraTab} from "@/components/types";

defineOptions({name: "FlowBindingTab"});

const props = defineProps<{
  /** useFlowBinding 返回的 state 对象 */
  state: FlowBindingState;
  /** 当前激活的 Tab 标识（来自 FormPropertyPanel 插槽 prop） */
  currentTab?: string;
  /** 全表字段列表（来自 FormPropertyPanel 插槽 prop，供参数绑定表使用） */
  allTableFieldList?: SelectOption[];
  /** 组件大小 */
  compSize?: "small" | "default" | "large";
}>();

const designForm = getDesignFormStore();
const formInfo = computed(() => designForm.formInfo);
const flowDesign = getFlowDesignStore();

/** 表单级 reuse 模式 + 已选流程时显示参数绑定 */
const showFormFlowParamBinding = computed(
    () =>
        formInfo.value?.flowFlag === "Y" &&
        formInfo.value?.flowBindMode === "reuse" &&
        !!formInfo.value?.flowDefineId,
);

/** 打开在线设计对话框 */
const openFlowDesigner = () => {
  const existed = formInfo.value?.flowConfigures?.process;
  if (existed) {
    flowDesign.flowSetNode(JSON.parse(JSON.stringify(existed)));
  } else {
    flowDesign.flowSetNode(null);
  }
  props.state.flowDesignerVisible.value = true;
};

/** 保存在线设计结果 */
const saveFlowDesign = () => {
  const node = unref(props.state.flowDesignerRef.value?.nodeData);
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
    process: JSON.parse(JSON.stringify(node)),
  };
  formInfo.value.flowFlag = "Y";
  formInfo.value.flowBindMode = "design";
  props.state.flowDesigned.value = true;
  props.state.flowDesignerVisible.value = false;
};

/** 同步参数绑定到 formInfo.flowConfigures */
const syncFlowParamBindings = () => {
  if (!formInfo.value.flowConfigures) {
    formInfo.value.flowConfigures = {mode: "reuse"};
  }
  formInfo.value.flowConfigures.flowParamBindings = props.state.formFlowParamBindings.value;
};

/** 加载流程定义的参数列表 */
const loadFormFlowParams = async (flowDefineId: string) => {
  const opt = props.state.getOptional();
  if (!flowDefineId || !opt?.loadFlowParams) {
    props.state.formFlowParams.value = [];
    return;
  }
  props.state.formFlowParamsLoading.value = true;
  try {
    const params = await opt.loadFlowParams(flowDefineId);
    props.state.formFlowParams.value = params || [];
    const existing = formInfo.value?.flowConfigures?.flowParamBindings || [];
    props.state.formFlowParamBindings.value = props.state.formFlowParams.value.map((p) => {
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
    props.state.formFlowParams.value = [];
  } finally {
    props.state.formFlowParamsLoading.value = false;
  }
};

/** 暴露给字段 actions 调用的方法 */
props.state.openFlowDesigner = openFlowDesigner;
props.state.loadFormFlowParams = loadFormFlowParams;
props.state.syncFlowParamBindings = syncFlowParamBindings;

/** 参数绑定变化时同步到 flowConfigures */
watch(
    () => props.state.formFlowParamBindings.value,
    () => {
      if (showFormFlowParamBinding.value) {
        syncFlowParamBindings();
      }
    },
    {deep: true},
);

/** 回显流程绑定状态 */
onMounted(() => {
  const opt = props.state.getOptional();
  if (!props.state.flowDefineOptions.value.length && opt?.loadFlowDefines) {
    opt.loadFlowDefines().then((list: SelectOption[]) => {
      props.state.flowDefineOptions.value = list || [];
    });
  }
  const flowConfigures = formInfo.value?.flowConfigures;
  if (flowConfigures?.mode) {
    formInfo.value.flowBindMode = flowConfigures.mode;
    formInfo.value.flowFlag = "Y";
    if (flowConfigures.mode == "reuse" && flowConfigures.flowDefineId) {
      formInfo.value.flowDefineId = flowConfigures.flowDefineId;
      loadFormFlowParams(flowConfigures.flowDefineId);
    }
    if (flowConfigures.mode == "design" && flowConfigures.process) {
      props.state.flowDesigned.value = true;
    }
  }
});
</script>

<template>
  <!-- 表单级流程参数绑定（reuse 模式）：选流程后显示参数与表单字段映射表  -->
  <div
      v-if="showFormFlowParamBinding && currentTab === state.tabKey"
      class="form-flow-param-binding"
  >
    <div class="ffpb-title">
      {{ i18n("dyform.step.flowParamBinding") }} {{currentTab}} {{state.tabKey}}
      <span class="ffpb-tip">{{ i18n("dyform.step.flowParamBindingRemark") }}</span>
    </div>
    <FlowParamBindingTable
        v-model="state.formFlowParamBindings.value"
        :params="state.formFlowParams.value"
        :fields="allTableFieldList || []"
        :comp-size="compSize ?? 'default'"
        :loading="state.formFlowParamsLoading.value"
    />
  </div>
  <!-- 流程在线设计对话框 -->
  <star-horse-panel
      v-model="state.flowDesignerVisible.value"
      :title="state.flowDesigned.value
        ? i18n('dyform.step.flowDesignerTitle.reedit')
        : i18n('dyform.step.flowDesignerTitle')"
      :selfFunc="true"
      :fullScreen="true"
      @closeAction="state.flowDesignerVisible.value = false"
      @merge="saveFlowDesign"
  >
    <FlowDesigner
        ref="state.flowDesignerRef"
        :stopInitFormInfo="true"
        :saveBtnVisible="false"
        :mapBtnVisible="false"
        :initialNode="formInfo?.flowConfigures?.process || {}"
    />
  </star-horse-panel>
</template>

<style lang="scss" scoped>
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

<script lang="ts">
/**
 * useFlowBinding —— 流程绑定扩展 composable。
 *
 * 创建流程绑定全部响应式状态、Tab 字段定义、校验和数据转换函数。
 * 接入方在 setup 中调用，将返回值分别注入 advancedProps 和 FormConfig 回调。
 *
 * @param getOptional 获取 FormConfig 的函数（延迟求值，打破循环依赖）
 * @param tabKey      Tab 唯一标识，默认 "tab3"
 */
import {ref as ref2, computed as computed2} from "vue";
import {i18n as i18n2} from "@/lang";
import type {SelectOption} from "star-horse-lowcode";
import {getDesignFormStore as getDesignFormStore2} from "@/store/StoreManager";
import {validateAllNodes as validateAllNodes2} from "@/components/workflow/validator";
import type {FormConfig as FormConfig2, FormExtraTab as FormExtraTab2} from "@/components/types";
import type {FlowParam, FlowParamBinding} from "@/components/workflow/types";

export interface FlowBindingState {
  tabKey: string;
  getOptional: () => FormConfig2 | undefined;
  flowDefineOptions: ReturnType<typeof ref2<SelectOption[]>>;
  flowDesignerVisible: ReturnType<typeof ref2<boolean>>;
  flowDesigned: ReturnType<typeof ref2<boolean>>;
  flowDesignerRef: ReturnType<typeof ref2>;
  formFlowParams: ReturnType<typeof ref2<FlowParam[]>>;
  formFlowParamBindings: ReturnType<typeof ref2<FlowParamBinding[]>>;
  formFlowParamsLoading: ReturnType<typeof ref2<boolean>>;
  openFlowDesigner: () => void;
  loadFormFlowParams: (flowDefineId: string) => Promise<void>;
  syncFlowParamBindings: () => void;
}

export function useFlowBinding(
    getOptional: () => FormConfig2 | undefined,
    tabKey: string = "tab3",
) {
  const designForm = getDesignFormStore2();
  const formInfo = computed2(() => designForm.formInfo);

  const flowDefineOptions = ref2<SelectOption[]>(getOptional()?.flowDefineOptions || []);
  const flowDesignerVisible = ref2<boolean>(false);
  const flowDesigned = ref2<boolean>(false);
  const flowDesignerRef = ref2();
  const formFlowParams = ref2<FlowParam[]>([]);
  const formFlowParamBindings = ref2<FlowParamBinding[]>([]);
  const formFlowParamsLoading = ref2<boolean>(false);

  const state: FlowBindingState = {
    tabKey,
    getOptional,
    flowDefineOptions,
    flowDesignerVisible,
    flowDesigned,
    flowDesignerRef,
    formFlowParams,
    formFlowParamBindings,
    formFlowParamsLoading,
    openFlowDesigner: () => {
    },
    loadFormFlowParams: async () => {
    },
    syncFlowParamBindings: () => {
    },
  };

  /** 绑定模式字段 */
  const bindModeField = {
    label: i18n2("dyform.step.flowBindMode"),
    fieldName: "flowBindMode",
    type: "radio",
    defaultValue: "reuse",
    helpMsg: i18n2("dyform.step.flowBindMode.helpMsg"),
    formVisible: false,
    preps: {
      values: [
        {name: i18n2("dyform.step.flowBindMode.reuse"), value: "reuse"},
        {name: i18n2("dyform.step.flowBindMode.design"), value: "design"},
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
              formInfo.value.flowBindMode = val["flowBindMode"];
              formInfo.value.flowConfigures = {
                ...(formInfo.value.flowConfigures || {}),
                mode: "design",
              };
              state.openFlowDesigner();
            },
            matchFieldValue: "design",
          },
        ],
      },
    },
  };

  /** 流程定义选择字段 */
  const flowDefineIdField = {
    label: i18n2("dyform.step.formFlowDefine"),
    fieldName: "flowDefineId",
    type: "select",
    formVisible: false,
    actions: {
      change: (val: any) => {
        if (val["flowDefineId"]) {
          formInfo.value.flowConfigures = {
            mode: "reuse",
            flowDefineId: val["flowDefineId"],
            flowParamBindings: formInfo.value.flowConfigures?.flowParamBindings || [],
          };
          state.loadFormFlowParams(val["flowDefineId"]);
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
      label: i18n2("dyform.step.flowFlag"),
      fieldName: "flowFlag",
      type: "switch",
      defaultValue: "N",
      formVisible: true,
      actions: {
        change: (val: any) => {
          formInfo.value.flowFlag = val["flowFlag"];
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
  const tabConfig: FormExtraTab2 = {
    title: i18n2("dyform.step.formFlowBind"),
    subTablePrimaryKey: tabKey,
    fieldList: flowBindingFields,
  };

  /** 保存前校验流程设计完整性 */
  const validateFlowDesign = (data: any): string | null => {
    if (data?.flowFlag != "Y" || data?.flowBindMode != "design") {
      return null;
    }
    const process = data?.flowConfigures?.process;
    if (!process || !process.childNode) {
      return i18n2("dyform.step.flowDesignNotComplete");
    }
    const errors = validateAllNodes2(process);
    if (errors.length > 0) {
      return errors.map((e) => `[${e.nodeName}] ${e.errors.join("；")}`).join("\n");
    }
    return null;
  };

  /** 保存前转换流程绑定数据为后端格式 */
  const transformFlowConfigures = (data: any) => {
    const fc = data["flowConfigures"];
    if (fc) {
      if (fc.mode == "reuse" && fc.flowDefineId) {
        data["flowDefineIds"] = Array.isArray(fc.flowDefineId) ? fc.flowDefineId.join(";") : fc.flowDefineId;
      } else if (fc.mode == "design" && fc.process) {
        data["pendingFlowProcess"] = JSON.stringify(fc.process);
      }
      delete data["flowConfigures"];
    }
  };

  return {
    state,
    tabConfig,
    validateFlowDesign,
    transformFlowConfigures,
  };
}
</script>
