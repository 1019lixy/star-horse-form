<script setup lang="ts" name="step-container">
import {computed, onMounted, PropType, ref, watch} from "vue";
import {compKey, itemCheck, operationConfirm, warning,} from "star-horse-lowcode";
import {getDesignFormStore} from "@/store/StoreManager";
import {i18n} from "@/lang";
import {quickAddItem} from "@/api/form_utils";
import DesignItemWrapper from "@/components/formcomp/utils/DesignItemWrapper.vue";
import {ensureDefaultElements, isContainer} from "./container-types";
import {ensureItems, useDragAdd} from "./container-utils";
import {useInlineEdit} from "./useInlineEdit";

const props = defineProps({
  parentField: { type: Object as PropType<any> },
  isDesign: { type: Boolean, default: false },
  showFormItem: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  formInfo: { type: Object as PropType<any> },
  field: { type: Object as PropType<any> },
});
let designForm = getDesignFormStore();
const isDragging = computed(() => designForm.isDragging);
const formData = defineModel("formData");

const { onDragAdd } = useDragAdd(designForm);
const checkItem = (adata: any) => ensureItems(adata);
const { editingId, editingText, startEditName, finishEditName } = useInlineEdit(
  () => props.isDesign,
  "step-edit-input",
);

// 当前激活的步骤索引
const activeStepIndex = ref<number>(0);
// 步骤校验状态：valid=通过(绿色打钩), invalid=失败(红色打叉), undefined=未校验
const stepValidationState = ref<Record<number, "valid" | "invalid">>({});
// 是否已完成所有步骤（最后一步通过校验后置为 true，用于显示全部完成）
const allStepsCompleted = ref<boolean>(false);

const elements = computed(() => props.field?.preps?.elements || []);

const activeStepName = computed(() => {
  const el = elements.value[activeStepIndex.value];
  return el?.subTablePrimaryKey || "";
});

watch(
  () => activeStepName.value,
  (val) => {
    if (val) {
      props.field["activeItemName"] = val;
      designForm.setCurrentSubTabName(val);
    }
  },
  { immediate: true },
);

// 是否同属一个表单
const sameForm = computed(() => {
  return props.field?.preps?.sameForm === "Y" || !props.field?.preps?.sameForm;
});

// 步骤风格：steps(头部步骤条) / pager(底部导航分页) / flat(平铺单页)
const stepStyle = computed(() => props.field?.preps?.stepStyle || "steps");

// 平铺单页模式：所有分段同页纵向展示
const flatMode = computed(() => stepStyle.value === "flat");

// 流程上下文（运行时由后端注入 formInfo.flow；设计态/无流程时为 null，回退原有行为）
const flow = computed(() =>
  !props.isDesign && props.formInfo?.flow?.enabled ? props.formInfo.flow : null,
);

// 段级权限：editable 可编辑 / readonly 只读 / hidden 不渲染；无流程时按 disabled 降级
const segPermission = (key: string): "editable" | "readonly" | "hidden" => {
  if (flow.value?.segments?.[key]) return flow.value.segments[key];
  return props.disabled ? "readonly" : "editable";
};

// 段内组件禁用状态：平铺只读段强制禁用（disabled 链路已贯穿所有容器）
const segDisabled = (key: string): boolean =>
  props.disabled || (flatMode.value && segPermission(key) === "readonly");

// 平铺段折叠状态：显式操作记录在 map；未记录时默认已完成段折叠、其余展开
const flatCollapsed = ref<Record<string, boolean>>({});
const isFlatCollapsed = (adata: any): boolean => {
  const key = adata?.subTablePrimaryKey;
  if (key != null && key in flatCollapsed.value) {
    return !!flatCollapsed.value[key];
  }
  const st = flow.value?.nodeStates?.[key];
  return st?.status === "done";
};
const toggleFlatCollapse = (adata: any) => {
  const key = adata?.subTablePrimaryKey;
  if (key != null) flatCollapsed.value[key] = !isFlatCollapsed(adata);
};

// 平铺段标题点击：设计态首次点击选中该段（管理栏增删作用于所选段），再次点击折叠
const handleFlatHeadClick = (adata: any, idx: number) => {
  if (props.isDesign && activeStepIndex.value !== idx) {
    activeStepIndex.value = idx;
    return;
  }
  toggleFlatCollapse(adata);
};

// 平铺段状态标签文案
const flatStatusText = (adata: any): string => {
  const st = flow.value?.nodeStates?.[adata?.subTablePrimaryKey];
  if (st?.status === "done") {
    return (
      i18n("dyform.step.flatFilled") +
      (st.assignee?.name ? ` · ${st.assignee.name}` : "")
    );
  }
  if (st?.status === "active") return i18n("dyform.step.flatCurrent");
  if (flow.value) return i18n("dyform.step.flatLocked");
  return "";
};

// 平铺段状态标签样式类
const flatTagState = (adata: any): string =>
  flow.value?.nodeStates?.[adata?.subTablePrimaryKey]?.status || "";

// 平铺流转记录条节点（张三 → 李四(当前) → 待定）
const flowTrail = computed(() => {
  if (!flatMode.value || !flow.value?.nodeStates) return [];
  return Object.keys(flow.value.nodeStates).map((key) => {
    const el = elements.value.find(
      (e: any) => e.subTablePrimaryKey === key,
    );
    return {
      key,
      label: el?.label || key,
      status: flow.value.nodeStates[key]?.status,
      assignee: flow.value.nodeStates[key]?.assignee,
    };
  });
});
const trailAvatar = (node: any): string =>
  (node.assignee?.name || "?").charAt(0);

// 流程模式下初始定位到当前待办节点
watch(
  flow,
  (f) => {
    if (!f?.currentNode) return;
    const idx = elements.value.findIndex(
      (e: any) => e.subTablePrimaryKey === f.currentNode,
    );
    if (idx >= 0) activeStepIndex.value = idx;
  },
  { immediate: true },
);

// 是否每步必须完成才能进入下一步
const mustCompleteStep = computed(
  () => props.field?.preps?.mustCompleteStep === "Y",
);

// 步骤条方向
const stepDirection = computed(
  () => props.field?.preps?.direction || "horizontal",
);

// 是否显示步骤条：pager/flat 风格强制隐藏
const showStepBar = computed(() => {
  if (stepStyle.value === "pager" || flatMode.value) return false;
  return props.field?.preps?.showStepBar !== "N";
});

// 是否显示导航按钮
const showNavButtons = computed(
  () => props.field?.preps?.showNavButtons !== "N",
);

// 平铺单页无上一步/下一步概念，隐藏导航栏
const showNavBar = computed(() => showNavButtons.value && !flatMode.value);

// 简洁模式
const stepSimple = computed(() => props.field?.preps?.simple === "Y");

// 居中对齐
const alignCenter = computed(() => props.field?.preps?.alignCenter === "Y");

// 步骤间距
const stepSpace = computed(() => {
  const space = props.field?.preps?.space;
  return space ? `${space}px` : undefined;
});

// 完成图标
const finishIcon = computed(() => props.field?.preps?.finishIcon || "");

// ==================== 每步必填验证 ====================
/**
 * 递归收集 items 中所有必填字段
 * 支持嵌套容器(box/table/dytable/tab/card/collapse/splitter/step/condition)
 */
const collectRequiredFields = (items: any[], result: any[] = []): any[] => {
  if (!items || !items.length) return result;
  items.forEach((item: any) => {
    if (!item) return;
    if (isContainer(item)) {
      // 容器类型：递归处理子元素
      if (item.itemType === "condition") {
        collectRequiredFields(item.items || item.preps?.items || [], result);
        const children = item.children || item.preps?.children || [];
        children.forEach((child: any) =>
          collectRequiredFields([child], result),
        );
      } else if (item.preps?.elements) {
        item.preps.elements.forEach((el: any) => {
          if (el.columns) {
            el.columns.forEach((col: any) => {
              collectRequiredFields(col.items || [], result);
            });
          }
          collectRequiredFields(el.items || [], result);
        });
      }
    } else if (item.compType === "formItem" || item.fieldName) {
      // 叶子字段
      if (item.preps?.required === true && item.fieldName) {
        result.push({
          fieldName: item.fieldName,
          label: item.label || item.preps?.label || item.fieldName,
        });
      }
    }
  });
  return result;
};

/**
 * 判断字段值是否为空
 */
const isEmptyValue = (val: any): boolean => {
  if (val === null || val === undefined) return true;
  if (typeof val === "string") return val.trim() === "";
  if (Array.isArray(val)) return val.length === 0;
  if (typeof val === "object") return Object.keys(val).length === 0;
  return false;
};

/**
 * 验证指定步骤的必填字段
 */
const validateStep = (
  stepIndex: number,
): { valid: boolean; missingFields: any[] } => {
  const step = elements.value[stepIndex];
  if (!step) return { valid: true, missingFields: [] };
  const requiredFields = collectRequiredFields(step.items || []);
  const missing: any[] = [];
  requiredFields.forEach((f: any) => {
    const val = sameForm.value
      ? formData.value?.[f.fieldName]
      : formData.value?.[step.subTableName]?.[f.fieldName];
    if (isEmptyValue(val)) {
      missing.push(f);
    }
  });
  return { valid: missing.length === 0, missingFields: missing };
};

/**
 * 校验并提示缺失字段
 */
const checkBeforeForward = (fromIndex: number, toIndex: number): boolean => {
  if (!mustCompleteStep.value || props.isDesign) return true;
  for (let i = fromIndex; i < toIndex; i++) {
    const { valid, missingFields } = validateStep(i);
    if (!valid) {
      warning(
        i18n("dyform.step.validateFailed", [
          missingFields.map((f: any) => f.label).join("、"),
        ]),
      );
      return false;
    }
  }
  return true;
};

const goPrev = () => {
  if (activeStepIndex.value > 0) {
    // 回退时清除当前步骤的错误状态（用户回去修改）
    delete stepValidationState.value[activeStepIndex.value];
    allStepsCompleted.value = false;
    activeStepIndex.value--;
  }
};
const goNext = () => {
  if (activeStepIndex.value >= elements.value.length - 1) {
    // 已是最后一步：校验通过则标记全部完成
    if (mustCompleteStep.value && !props.isDesign) {
      const { valid, missingFields } = validateStep(activeStepIndex.value);
      if (!valid) {
        stepValidationState.value[activeStepIndex.value] = "invalid";
        warning(
          i18n("dyform.step.validateFailed", [
            missingFields.map((f: any) => f.label).join("、"),
          ]),
        );
        return;
      }
    }
    stepValidationState.value[activeStepIndex.value] = "valid";
    allStepsCompleted.value = true;
    return;
  }
  if (!checkBeforeForward(activeStepIndex.value, activeStepIndex.value + 1)) {
    stepValidationState.value[activeStepIndex.value] = "invalid";
    return;
  }
  stepValidationState.value[activeStepIndex.value] = "valid";
  activeStepIndex.value++;
};

const handleStepClick = (index: number) => {
  if (index === activeStepIndex.value) return;
  // 向前跳转需校验中间所有步骤
  if (index > activeStepIndex.value) {
    if (!checkBeforeForward(activeStepIndex.value, index)) {
      stepValidationState.value[activeStepIndex.value] = "invalid";
      return;
    }
    // 中间步骤全部校验通过，标记为 valid
    for (let i = activeStepIndex.value; i < index; i++) {
      stepValidationState.value[i] = "valid";
    }
  }
  // 清除目标步骤的错误状态（重新进入给修改机会）
  delete stepValidationState.value[index];
  allStepsCompleted.value = false;
  activeStepIndex.value = index;
};

// ==================== 步骤条状态计算 ====================
type StepStatus = "finish" | "process" | "wait" | "error" | "success";

const getStepStatus = (idx: number): StepStatus => {
  const i = Number(idx);
  // 校验失败的步骤显示错误（红色打叉）
  if (stepValidationState.value[i] === "invalid") {
    return "error";
  }
  // 全部完成时，所有步骤显示 finish
  if (allStepsCompleted.value) {
    return "finish";
  }
  // 当前激活步骤
  if (i === activeStepIndex.value) {
    return "process";
  }
  // 已越过的步骤显示完成（绿色打钩）
  if (i < activeStepIndex.value) {
    return "finish";
  }
  return "wait";
};

const isStepClickable = (idx: number): boolean => {
  // 设计模式可任意点击；运行时向后回退可点击，向前需校验
  if (props.isDesign) return true;
  const i = Number(idx);
  if (i < activeStepIndex.value) return true;
  if (i === activeStepIndex.value) return false;
  // 向前：未开启必填校验时可点击
  if (!mustCompleteStep.value) return true;
  // 开启必填校验时，仅允许点击下一步相邻步骤（运行时由 handleStepClick 再校验）
  return i === activeStepIndex.value + 1;
};

// 添加新步骤
const addStep = () => {
  if (!props.field.preps) props.field.preps = {};
  if (!props.field.preps.elements) props.field.preps.elements = [];
  const len = props.field.preps.elements.length;
  const newStep = {
    label: i18n("dyform.step.defaultName") + (len + 1),
    subTablePrimaryKey: "step" + (len + 1),
    subTableName: "step" + (len + 1),
    subFormFlag: sameForm.value ? "N" : "Y",
    items: [],
  };
  props.field.preps.elements.push(newStep);
  activeStepIndex.value = len;
};

// 删除当前步骤
const removeStep = (index: number) => {
  if (elements.value.length <= 1) return;
  operationConfirm(i18n("dyform.step.confirmDelete")).then((res: boolean) => {
    if (res) {
      props.field.preps.elements.splice(index, 1);
      if (activeStepIndex.value >= elements.value.length) {
        activeStepIndex.value = elements.value.length - 1;
      }
    }
  });
};

onMounted(() => {
  const isFirstInit = !props.field["preps"]?.["elements"];
  ensureDefaultElements(props.field, "step");
  if (isFirstInit) {
    props.field["preps"]["sameForm"] = "Y";
    props.field["preps"]["showStepBar"] = "Y";
    props.field["preps"]["showNavButtons"] = "Y";
    props.field["preps"]["direction"] = "horizontal";
    props.field["preps"]["stepStyle"] = "steps";
    props.field["preps"]["mustCompleteStep"] = "N";
  }
  // 确保 activeStepIndex 在有效范围内
  if (activeStepIndex.value >= elements.value.length) {
    activeStepIndex.value = 0;
  }
  if (elements.value[activeStepIndex.value]?.subTablePrimaryKey) {
    props.field["activeItemName"] =
      elements.value[activeStepIndex.value].subTablePrimaryKey;
    designForm.setCurrentSubTabName(props.field["activeItemName"]);
  }
});

// 同属表单切换时，同步所有步骤的 subFormFlag
watch(
  () => props.field?.preps?.sameForm,
  (val) => {
    const flag = val === "Y" ? "N" : "Y";
    const els = props.field?.preps?.elements || [];
    els.forEach((el: any) => {
      el.subFormFlag = flag;
    });
  },
);
</script>
<template>
  <group-container
    class="star-horse-form-container"
    :showFormItem="showFormItem"
    :isDesign="isDesign"
    :disabled="disabled"
    :parentField="parentField"
    :form-item="field"
  >
    <div class="step-wrapper">
      <!-- 自定义专业步骤条 -->
      <div
        v-if="showStepBar"
        class="sh-step-bar"
        :class="[
          `sh-step-bar--${stepDirection}`,
          {
            'sh-step-bar--simple': stepSimple,
            'sh-step-bar--align-center': alignCenter,
          },
        ]"
        :style="{ gap: stepSpace }"
      >
        <div
          v-for="(adata, idx) in elements"
          :key="compKey(adata, idx)"
          class="sh-step-item"
          :class="[
            `sh-step-item--${getStepStatus(Number(idx))}`,
            { 'is-clickable': isStepClickable(Number(idx)) },
          ]"
          @click="isStepClickable(Number(idx)) && handleStepClick(Number(idx))"
        >
          <!-- 圆形指示器 -->
          <div class="sh-step-indicator">
            <div class="sh-step-circle">
              <span
                v-if="
                  getStepStatus(Number(idx)) === 'finish' ||
                  getStepStatus(Number(idx)) === 'success'
                "
                class="sh-step-icon"
              >
                <star-horse-icon
                  v-if="finishIcon"
                  :icon-class="finishIcon"
                  size="20px"
                />
                <svg
                  v-else
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <span
                v-else-if="getStepStatus(Number(idx)) === 'error'"
                class="sh-step-icon"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </span>
              <span v-else class="sh-step-number">{{ Number(idx) + 1 }}</span>
            </div>
            <!-- 脉冲环（仅进行中） -->
            <span
              v-if="getStepStatus(Number(idx)) === 'process'"
              class="sh-step-pulse"
            ></span>
          </div>

          <!-- 标题 -->
          <div class="sh-step-content">
            <span
              v-if="editingId !== adata.subTablePrimaryKey"
              class="sh-step-title editable-name"
              @dblclick.stop="startEditName(adata)"
              >{{ adata.label }}</span
            >
            <el-input
              v-else
              class="step-edit-input"
              v-model="editingText"
              size="small"
              @blur="finishEditName(adata)"
              @keyup.enter="finishEditName(adata)"
              @click.stop
              style="width: 120px"
            />
            <span class="sh-step-index"
              >{{ Number(idx) + 1 }} / {{ elements.length }}</span
            >
          </div>
        </div>
      </div>

      <!-- 平铺单页模式：流转记录条（有流程上下文时显示） -->
      <div v-if="flatMode && flowTrail.length" class="flat-flow-trail">
        <template v-for="(node, nIdx) in flowTrail" :key="node.key">
          <svg
            v-if="nIdx > 0"
            class="trail-arrow"
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
          <span class="trail-node" :class="`is-${node.status || 'pending'}`">
            <span class="trail-avatar">{{ trailAvatar(node) }}</span>
            <span class="trail-info">
              <span class="trail-label">{{ node.label }}</span>
              <span class="trail-name">{{
                node.assignee?.name || i18n("dyform.step.flatLocked")
              }}</span>
            </span>
          </span>
        </template>
      </div>

      <!-- 步骤内容区域：steps/pager 单段切换；flat 全部已到段平铺 -->
      <div class="step-content-wrapper" :class="{ 'is-flat': flatMode }">
        <template
          v-for="(adata, idx) in elements"
          :key="adata.subTablePrimaryKey"
        >
          <!-- flat 段标题栏（hidden 段不渲染标题） -->
          <div
            v-if="flatMode && segPermission(adata.subTablePrimaryKey) !== 'hidden'"
            class="flat-section-head"
            :class="{ 'is-active': isDesign && Number(idx) === activeStepIndex }"
            @click="handleFlatHeadClick(adata, Number(idx))"
          >
            <svg
              class="flat-caret"
              :class="{ 'is-collapsed': isFlatCollapsed(adata) }"
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <span
              v-if="editingId !== adata.subTablePrimaryKey"
              class="flat-section-title editable-name"
              @dblclick.stop="startEditName(adata)"
              >{{ adata.label }}</span
            >
            <el-input
              v-else
              class="step-edit-input"
              v-model="editingText"
              size="small"
              @blur="finishEditName(adata)"
              @keyup.enter="finishEditName(adata)"
              @click.stop
              style="width: 120px"
            />
            <span
              v-if="flatStatusText(adata)"
              class="flat-section-tag"
              :class="`is-${flatTagState(adata)}`"
              >{{ flatStatusText(adata) }}</span
            >
          </div>

          <!-- 段内容：flat 按权限+折叠控制；hidden 段不渲染（防数据泄露） -->
          <div
            v-if="!flatMode || segPermission(adata.subTablePrimaryKey) !== 'hidden'"
            v-show="flatMode ? !isFlatCollapsed(adata) : idx === activeStepIndex"
            class="step-pane"
            :class="flatMode ? ['flat-section', `flat-${segPermission(adata.subTablePrimaryKey)}`] : []"
          >
            <draggable
              @add="(evt: Event) => onDragAdd(evt, adata['items'])"
              @dragover="checkItem(adata)"
              class="step-design"
              :class="{ 'dragging-area': isDragging }"
              group="starHorseGroup"
              animation="100"
              item-key="id"
              ghostClass="ghost"
              :list="adata['items']"
            >
              <template #item="{ element: data }">
                <div
                  class="comp-item my-[5px]"
                  :data-field-id="data.id"
                  :style="{ marginTop: isContainer(data) ? '25px' : '10px' }"
                >
                  <DesignItemWrapper
                    :field="data"
                    :isDesign="isDesign"
                    :parentField="field"
                    :disabled="segDisabled(adata.subTablePrimaryKey)"
                  >
                    <component
                      :key="data.id"
                      :field="data"
                      :isDesign="isDesign"
                      :disabled="segDisabled(adata.subTablePrimaryKey)"
                      :showFormItem="showFormItem"
                      :formInfo="formInfo"
                      :is="itemCheck(data)"
                      :parentField="field"
                      v-model:formData="formData"
                    />
                  </DesignItemWrapper>
                </div>
              </template>
            </draggable>

            <!-- 快捷添加组件按钮 -->
            <div v-if="isDesign" class="quick-add-bar">
              <el-button
                size="small"
                type="info"
                plain
                @click.stop="quickAddItem(adata.items)"
                icon="Plus"
              >
                {{ i18n("dyform.condition.addLeaf") }}
              </el-button>
            </div>
          </div>

          <!-- flat 未开始段：仅锁定占位，不渲染任何字段 -->
          <div
            v-if="flatMode && segPermission(adata.subTablePrimaryKey) === 'hidden'"
            class="flat-locked"
          >
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            >
              <rect x="4" y="11" width="16" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
            <span>{{ adata.label }}（{{ i18n("dyform.step.flatLocked") }}）</span>
          </div>
        </template>
      </div>

      <!-- 导航按钮：首尾页隐藏对应按钮（flat 模式无导航） -->
      <div v-if="showNavBar" class="step-nav-bar">
        <el-button
          v-if="activeStepIndex > 0"
          size="default"
          @click.stop="goPrev"
        >
          {{ i18n("dyform.step.prev") }}
        </el-button>
        <span class="step-indicator"
          >{{ activeStepIndex + 1 }} / {{ elements.length }}</span
        >
        <el-button
          v-if="activeStepIndex < elements.length - 1"
          size="default"
          type="primary"
          @click.stop="goNext"
        >
          {{ i18n("dyform.step.next") }}
        </el-button>
      </div>

      <!-- 设计模式下的步骤管理 -->
      <div v-if="isDesign" class="step-manage-bar">
        <el-button
          size="small"
          type="primary"
          plain
          @click.stop="addStep"
          icon="Plus"
        >
          {{ i18n("dyform.step.add") }}
        </el-button>
        <el-button
          size="small"
          type="danger"
          plain
          :disabled="elements.length <= 1"
          @click.stop="removeStep(activeStepIndex)"
          icon="Delete"
        >
          {{ i18n("dyform.step.delete") }}
        </el-button>
        <span class="step-same-form-hint">
          {{ i18n("dyform.step.styleLabel") }}:
          {{
            stepStyle === "steps"
              ? i18n("dyform.step.styleSteps")
              : stepStyle === "pager"
                ? i18n("dyform.step.stylePager")
                : i18n("dyform.step.styleFlat")
          }}
          ｜ {{ i18n("dyform.step.sameFormHint") }}:
          {{
            sameForm
              ? i18n("dyform.step.sameFormYes")
              : i18n("dyform.step.sameFormNo")
          }}
          ｜ {{ i18n("dyform.step.mustCompleteStep") }}:
          {{
            mustCompleteStep ? i18n("dyform.step.yes") : i18n("dyform.step.no")
          }}
        </span>
      </div>
    </div>
  </group-container>
</template>
<style lang="scss" scoped>
.step-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

// ==================== 自定义专业步骤条 ====================
.sh-step-bar {
  display: flex;
  width: 100%;
  padding: 16px 8px 8px;
  position: relative;

  // 横向布局
  &--horizontal {
    flex-direction: row;
    align-items: flex-start;
    .sh-step-item {
      flex: 1;
      flex-direction: column;
      align-items: center;
      text-align: center;
      &:not(:last-child)::after {
        content: "";
        position: absolute;
        top: 17px;
        left: calc(50% + 22px);
        right: calc(-50% + 22px);
        height: 2px;
        background: #e4e7ed;
        transition: background 0.4s ease;
        z-index: 0;
      }
      &:not(:last-child).sh-step-item--finish::after,
      &:not(:last-child).sh-step-item--success::after {
        background: linear-gradient(90deg, #67c23a 0%, #95d475 100%);
      }
    }
  }

  // 纵向布局
  &--vertical {
    flex-direction: column;
    min-height: 200px;
    .sh-step-item {
      flex-direction: row;
      align-items: flex-start;
      min-height: 64px;
      padding: 0 0 24px 0;
      position: relative;
      &:not(:last-child)::after {
        content: "";
        position: absolute;
        top: 36px;
        left: 17px;
        width: 2px;
        bottom: 4px;
        background: #e4e7ed;
        transition: background 0.4s ease;
        z-index: 0;
      }
      &:not(:last-child).sh-step-item--finish::after,
      &:not(:last-child).sh-step-item--success::after {
        background: linear-gradient(180deg, #67c23a 0%, #95d475 100%);
      }
      .sh-step-content {
        margin-left: 12px;
        padding-bottom: 4px;
        flex: 1;
      }
    }
  }

  // 简洁模式：紧凑横向条形
  &--simple {
    padding: 6px 4px;
    .sh-step-item {
      flex-direction: row;
      align-items: center;
      gap: 8px;
      padding: 4px 12px;
      border-radius: 16px;
      &::after {
        display: none !important;
      }
      .sh-step-indicator {
        width: auto;
        height: auto;
      }
      .sh-step-circle {
        width: 22px !important;
        height: 22px !important;
        border-radius: 6px !important;
        font-size: 11px !important;
      }
      .sh-step-content {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .sh-step-index {
        font-size: 11px;
      }
      .sh-step-title {
        font-size: 13px;
      }
    }
  }

  // 居中对齐模式
  &--align-center {
    .sh-step-item--horizontal .sh-step-content {
      align-items: center;
    }
  }
}

.sh-step-item {
  position: relative;
  display: flex;
  cursor: default;
  z-index: 1;
  transition: transform 0.2s ease;

  &.is-clickable {
    cursor: pointer;
    &:hover {
      .sh-step-circle {
        transform: scale(1.1);
        box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
      }
    }
  }

  // 圆角矩形指示器容器
  .sh-step-indicator {
    position: relative;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    flex-shrink: 0;
  }

  // 圆角矩形主体
  .sh-step-circle {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    font-weight: 600;
    border: 2px solid #c0c4cc;
    background: #fff;
    color: #909399;
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    box-sizing: border-box;
  }

  .sh-step-number {
    line-height: 1;
  }
  .sh-step-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  // 标题与副信息
  .sh-step-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin-top: 8px;
    .sh-step-title {
      font-size: 14px;
      font-weight: 500;
      color: #606266;
      line-height: 1.4;
      transition: color 0.3s ease;
    }
    .sh-step-index {
      font-size: 11px;
      color: #c0c4cc;
      line-height: 1;
    }
  }

  // ===== 状态：等待 =====
  &--wait {
    .sh-step-circle {
      border-color: #dcdfe6;
      background: #f9fafc;
      color: #a8abb2;
    }
    .sh-step-title {
      color: #a8abb2;
    }
  }

  // ===== 状态：进行中 =====
  &--process {
    .sh-step-circle {
      border-color: transparent;
      background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
      color: #fff;
      box-shadow: 0 0 0 4px rgba(64, 158, 255, 0.15);
    }
    .sh-step-title {
      color: #303133;
      font-weight: 600;
    }
    .sh-step-index {
      color: #409eff;
    }
  }

  // ===== 状态：完成 =====
  &--finish {
    .sh-step-circle {
      border-color: transparent;
      background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
      color: #fff;
      box-shadow: 0 2px 8px rgba(103, 194, 58, 0.3);
    }
    .sh-step-title {
      color: #606266;
    }
    .sh-step-index {
      color: #67c23a;
    }
  }

  // ===== 状态：成功 =====
  &--success {
    .sh-step-circle {
      border-color: transparent;
      background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
      color: #fff;
      box-shadow: 0 2px 8px rgba(103, 194, 58, 0.3);
    }
    .sh-step-title {
      color: #67c23a;
    }
    .sh-step-index {
      color: #67c23a;
    }
  }

  // ===== 状态：错误 =====
  &--error {
    .sh-step-circle {
      border-color: transparent;
      background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
      color: #fff;
      box-shadow: 0 2px 8px rgba(245, 108, 108, 0.3);
    }
    .sh-step-title {
      color: #f56c6c;
    }
    .sh-step-index {
      color: #f56c6c;
    }
  }
}

// 进行中脉冲动画环
.sh-step-pulse {
  position: absolute;
  top: 0;
  left: 0;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 2px solid #409eff;
  animation: sh-step-pulse-anim 1.8s ease-out infinite;
  pointer-events: none;
}

@keyframes sh-step-pulse-anim {
  0% {
    transform: scale(1);
    opacity: 0.7;
  }
  70% {
    transform: scale(1.6);
    opacity: 0;
  }
  100% {
    transform: scale(1.6);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .sh-step-pulse {
    animation: none;
    display: none;
  }
}

.step-content-wrapper {
  min-height: 80px;
  border: 1px dashed #d9ecff;
  border-radius: 6px;
  padding: 12px;
  background: #fafcff;
  transition: all 0.2s;
  &:hover {
    border-color: #409eff;
  }
}

.step-pane {
  min-height: 60px;
}

.step-design {
  min-height: 40px;
}

.step-nav-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 12px 16px;
  margin-top: 4px;
  border-top: 1px solid #ebeef5;
  background: linear-gradient(180deg, #fafcff 0%, #f5f7fa 100%);
  border-radius: 0 0 6px 6px;

  .step-indicator {
    font-size: 14px;
    color: #303133;
    font-weight: 600;
    min-width: 56px;
    text-align: center;
    padding: 4px 12px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  }

  :deep(.el-button) {
    border-radius: 18px;
    padding: 8px 24px;
    transition: all 0.25s ease;
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(64, 158, 255, 0.25);
    }
  }
}

.step-manage-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border: 1px dashed #f3d19e;
  border-radius: 4px;
  background: #fffbf0;

  .step-same-form-hint {
    margin-left: auto;
    font-size: 12px;
    color: #909399;
  }
}

.editable-name {
  cursor: text;
  border-bottom: 1px dashed transparent;
  transition: border-color 0.2s;
  &:hover {
    border-bottom-color: #409eff;
  }
}

.quick-add-bar {
  display: flex;
  justify-content: center;
  padding: 4px 0;
  margin-top: 4px;
  border: 1px dashed #d9ecff;
  border-radius: 4px;
  transition: all 0.2s;
  &:hover {
    border-color: #409eff;
    background: #ecf5ff;
  }
}

// ==================== 平铺单页（flat）模式 ====================
// 流转记录条：张三 → 李四(当前) → 待定
.flat-flow-trail {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px 12px;
  background: #fafcff;
  border: 1px solid #ebeef5;
  border-radius: 6px;

  .trail-arrow {
    color: #c0c4cc;
    flex-shrink: 0;
  }

  .trail-node {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 10px 3px 4px;
    border-radius: 14px;
    background: #fff;
    border: 1px solid #e4e7ed;
    transition: all 0.25s ease;

    .trail-avatar {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      background: #f4f4f5;
      color: #909399;
      flex-shrink: 0;
    }

    .trail-info {
      display: flex;
      flex-direction: column;
      line-height: 1.2;

      .trail-label {
        font-size: 12px;
        font-weight: 600;
        color: #606266;
      }

      .trail-name {
        font-size: 11px;
        color: #a8abb2;
      }
    }

    // 当前节点高亮
    &.is-active {
      border-color: var(--star-horse-style, #409eff);
      background: #ecf5ff;

      .trail-avatar {
        background: var(--star-horse-style, #409eff);
        color: #fff;
      }

      .trail-name {
        color: var(--star-horse-style, #409eff);
      }
    }

    // 已完成节点
    &.is-done {
      .trail-avatar {
        background: #f0f9eb;
        color: #67c23a;
      }
    }
  }
}

// flat 模式内容区：去掉外层虚线框，改为分段卡片纵列
.step-content-wrapper.is-flat {
  padding: 0;
  border: none;
  background: transparent;
  display: flex;
  flex-direction: column;
  gap: 10px;

  &:hover {
    border-color: transparent;
  }
}

// 段标题栏
.flat-section-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f5f7fa;
  border: 1px solid #ebeef5;
  border-bottom: none;
  border-radius: 6px 6px 0 0;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;

  &:hover {
    background: #ecf5ff;
  }

  &.is-active {
    background: #ecf5ff;
    border-color: var(--star-horse-style, #409eff);
  }

  .flat-caret {
    color: #909399;
    transition: transform 0.2s ease;
    flex-shrink: 0;

    &.is-collapsed {
      transform: rotate(-90deg);
    }
  }

  .flat-section-title {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
  }

  .flat-section-tag {
    margin-left: auto;
    font-size: 12px;
    padding: 1px 10px;
    border-radius: 10px;
    white-space: nowrap;
    background: #f4f4f5;
    color: #909399;

    &.is-done {
      background: #f0f9eb;
      color: #67c23a;
    }

    &.is-active {
      background: #ecf5ff;
      color: var(--star-horse-style, #409eff);
    }

    &.is-pending {
      background: #f4f4f5;
      color: #c0c4cc;
    }
  }
}

// flat 段内容：与标题栏拼接成卡片
.step-pane.flat-section {
  border-radius: 0 0 6px 6px;

  // 当前可编辑段：左侧高亮边
  &.flat-editable {
    box-shadow: inset 3px 0 0 0 var(--star-horse-style, #409eff);
  }

  // 只读段：整体弱化
  &.flat-readonly {
    background: #fafafa;
  }
}

// flat 未开始段锁定占位
.flat-locked {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px dashed #e4e7ed;
  border-radius: 6px;
  font-size: 13px;
  color: #a8abb2;
  background: #fafafa;
}

.dragging-area {
  background:
    linear-gradient(45deg, #e6f7ff 25%, transparent 25%),
    linear-gradient(-45deg, #e6f7ff 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #e6f7ff 75%),
    linear-gradient(-45deg, transparent 75%, #e6f7ff 75%);
  background-size: 20px 20px;
  background-position:
    0 0,
    0 10px,
    10px -10px,
    -10px 0px;
}

.ghost {
  opacity: 0.5;
  background: #c8e6c9;
}
</style>
