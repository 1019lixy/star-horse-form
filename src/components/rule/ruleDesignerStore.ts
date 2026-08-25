/**
 * 规则设计器共享 Store
 *
 * 设计器内跨组件共享的数据统一走本 Store：
 * - 规则元数据（ruleData）：名称/编码/分类/变量库等；
 * - 表单字段上下文（formFields）：供编辑器/字段选择器使用；
 * - 统一编辑器状态（editor）：任意节点的属性编辑入口，
 *   设计器不再维护每节点的 visible/editing 状态组。
 *
 * 画布 nodes/edges 仍归 Vue Flow 管理，本 Store 通过
 * setCanvasApi 注入的访问器读写，避免双数据源。
 */
import {defineStore} from "pinia";
import {computed, reactive, ref, shallowRef} from "vue";
import {getDefaultRuleType} from "./designerConfig";

/** 画布数据访问器（由 RuleDesigner 注入实现） */
export interface RuleCanvasApi {
  getNode(id: string): any | undefined;
  getNodeData(id: string): Record<string, any>;
  updateNodeData(id: string, patch: Record<string, any>): void;
}

export const useRuleDesignerStore = defineStore("ruleDesigner", () => {
  // ══════════ 画布访问器 ══════════
  const canvasApi = shallowRef<RuleCanvasApi | null>(null);
  const setCanvasApi = (api: RuleCanvasApi) => {
    canvasApi.value = api;
  };

  // ══════════ 规则元数据 ══════════
  /** 规则文档级元数据（设计器与各编辑弹窗共享） */
  const ruleData = reactive({
    idRuleDefinition: "",
    ruleCode: "",
    ruleName: "",
    ruleDesc: "",
    ruleType: getDefaultRuleType(),
    ruleCategory: "",
    priority: 0,
    enabled: "Y",
    conditionLogic: "AND",
    status: "DRAFT",
    formId: "",
    flowContent: "",
    // 变量库：入参/上下文/常量统一管理，供条件编辑与表达式引用
    variables: [] as Array<{
      field: string;
      label: string;
      type: "STRING" | "NUMBER" | "DATE" | "BOOLEAN" | "ARRAY";
      source: "INPUT" | "CONTEXT" | "CONSTANT";
      defaultValue?: string;
      desc?: string;
    }>,
  });

  /** 表单字段上下文（props 或按 formId 自动加载的结果） */
  const formFields = ref<any[]>([]);

  // ══════════ 统一节点编辑器状态 ══════════
  const editor = reactive({
    visible: false,
    nodeId: "",
    /** 编辑节点 data 中的某个列表时传入，如 conditions/actions */
    listKey: undefined as string | undefined,
    itemIndex: -1,
  });

  /** 当前正在编辑的节点数据快照 */
  const editingNodeData = computed<Record<string, any> | null>(() =>
    editor.visible && canvasApi.value
      ? canvasApi.value.getNodeData(editor.nodeId)
      : null,
  );

  /**
   * 打开节点编辑器。
   * 编辑哪种编辑器由该节点注册表定义的 editor 决定，
   * 本 Store 与设计器均不做类型分发。
   */
  function openEditor(
    nodeId: string,
    listKey?: string,
    itemIndex = -1,
  ): boolean {
    if (!canvasApi.value?.getNode(nodeId)) return false;
    editor.nodeId = nodeId;
    editor.listKey = listKey;
    editor.itemIndex = itemIndex;
    editor.visible = true;
    return true;
  }

  function closeEditor(): void {
    editor.visible = false;
  }

  /** 应用编辑器产出的数据补丁（merge 进节点 data） */
  function saveEditor(patch: Record<string, any>): void {
    if (!editor.visible || !canvasApi.value || !patch) return;
    canvasApi.value.updateNodeData(editor.nodeId, patch);
  }

  /** 删除节点 data 中某列表的一项 */
  function deleteListItem(nodeId: string, listKey: string, index: number): void {
    const api = canvasApi.value;
    if (!api) return;
    const data = api.getNodeData(nodeId);
    const list = [...(data?.[listKey] || [])];
    list.splice(index, 1);
    api.updateNodeData(nodeId, {[listKey]: list});
  }

  return {
    canvasApi,
    setCanvasApi,
    ruleData,
    formFields,
    editor,
    editingNodeData,
    openEditor,
    closeEditor,
    saveEditor,
    deleteListItem,
  };
});