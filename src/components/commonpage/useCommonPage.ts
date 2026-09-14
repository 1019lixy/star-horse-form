/**
 * 通用页面 Composable - 抽取 commonpage 所有页面的公共逻辑
 *
 * 统一模式：
 * 1. props: { currentPageClass, preview, compList }
 * 2. analysisCompDatas 解析字段 + 移动端 convertCompToAppComps
 * 3. dialogPreps + provide("dialogProps")
 * 4. 规则引擎 useFormRuleRuntime 集成（ON_LOAD / ON_SUBMIT / ON_CHANGE / ON_VALIDATE）
 * 5. CommonSkeleton 骨架屏状态
 * 6. dataFormat / dataRecall 数据格式化与回调
 * 7. watch compList + currentPageClass 触发 reload
 *
 * ON_CHANGE 通用化：通过 enableOnChange 开关启用，内置 300ms 防抖 watch
 */
import {computed, nextTick, onMounted, provide, ref, type Ref, watch,} from "vue";
import {
    analysisCompDatas,
    apiInstance,
    ApiUrls,
    convertCompToAppComps,
    createDatetime,
    dialogPreps,
    SearchFields,
    UserFuncInfo,
} from "star-horse-lowcode";
import {i18n} from "@/lang";
import {useFormRuleRuntime} from "@/components/rule/useFormRuleRuntime";

export interface CommonPageProps {
  currentPageClass: string;
  preview: boolean;
  compList: any[];
}

export interface CommonPageOptions {
  props: CommonPageProps;
  formRef: Ref<any>;
  /** 是否启用 ON_CHANGE 规则引擎（300ms 防抖 watch formData） */
  enableOnChange?: boolean;
  /** 默认数据源 URL */
  defaultApiEndpoints?: ApiUrls;
  /** 加载完成后是否自动调用 tableRef.loadByPage */
  autoLoad?: boolean;
  tableRef?: Ref<any>;
}

/** 默认按钮权限：增/改/查/删 */
export const DEFAULT_BTN_PERMISSIONS = {
  add: "add",
  edit: "edit",
  view: "view",
  delete: "delete",
};

export const useCommonPage = (options: CommonPageOptions) => {
  const {
    props,
    formRef,
    enableOnChange = false,
    defaultApiEndpoints,
    autoLoad = false,
    tableRef,
  } = options;

  const isLoading = ref(true);
  const hasData = ref(true);
  const errorMsg = ref(i18n("commonPage.dataLoading"));
  const primaryKey = ref("id");
  const rules = ref<any>({});
  const relationTables = ref<any>({});
  const tableFieldList = ref<any>({ fieldList: [], stopAutoLoad: true });
  const searchFormData = ref<SearchFields | any>({ fieldList: [] });
  const apiEndpoints = ref<ApiUrls>(defaultApiEndpoints ?? apiInstance("", ""));
  const dateFields = ref<string[]>([]);
  const fieldMappingList = ref<any>([]);
  const dataSource = ref<any>({});
  const extBtns = ref<UserFuncInfo[]>([]);

  const dialogProps = dialogPreps();
  provide("dialogProps", dialogProps);

  // ==================== 规则引擎集成 ====================
  const ruleFormId = computed(() => {
    const list = props.compList as any[];
    if (!list || list.length === 0) return "";
    return list[0]?.formId || list[0]?.preps?.formId || "";
  });

  const ruleFormData = computed(
    () => formRef.value?.getFormData()?.value ?? {},
  );

  const {
    triggerOnLoad,
    triggerOnSubmit,
    triggerOnChange,
    triggerOnValidate,
    triggerButtonClick,
    loading: ruleLoading,
    currentFormId,
    isEnabled,
  } = useFormRuleRuntime({
    formId: ruleFormId,
    formFields: tableFieldList,
    formData: ruleFormData,
    enabled: computed(() => !!ruleFormId.value),
  });

  // ON_LOAD
  const onFormDataLoaded = async () => {
    if (isEnabled.value && currentFormId.value) {
      await nextTick();
      await triggerOnLoad();
    }
  };

  // ON_SUBMIT
  const handleBeforeSubmit = async ({
    type,
    formData: fd,
  }: {
    type: string;
    formData: any;
  }) => {
    if (isEnabled.value && currentFormId.value) {
      const ok = await triggerOnSubmit();
      if (!ok) return false;
    }
  };

  // ON_CHANGE 通用化（300ms 防抖，与 FormPage 现有逻辑一致）
  let changeTimer: ReturnType<typeof setTimeout> | null = null;
  if (enableOnChange) {
    watch(
      () => ruleFormData.value,
      () => {
        if (!isEnabled.value || !currentFormId.value) return;
        if (changeTimer) clearTimeout(changeTimer);
        changeTimer = setTimeout(() => triggerOnChange(), 300);
      },
      { deep: true },
    );
  }

  // ==================== 加载 ====================
  const loadFormData = async () => {
    isLoading.value = true;
    primaryKey.value = "id";
    tableFieldList.value = analysisCompDatas(props.compList);
    if (props.currentPageClass == "main-design-phone") {
      tableFieldList.value = convertCompToAppComps(tableFieldList.value);
    }
    await nextTick();
    hasData.value = true;
    if (autoLoad && tableRef?.value) {
      tableRef.value.loadByPage?.();
    }
    isLoading.value = false;
  };

  // ==================== 数据格式化 ====================
  const dataFormat = (name: string, cellValue: any, row?: any): any => {
    if (dateFields.value?.length > 0 && dateFields.value.includes(name)) {
      return createDatetime(cellValue);
    }
    const subFormat = (n: string, v: any, r: any) => {
      if (dataSource.value && Object.keys(dataSource.value).length > 0) {
        const temp = dataSource.value[n];
        if (temp) {
          const stemp = temp.datas?.find(
            (item: any) => item[temp.valueField] == v,
          );
          return stemp ? stemp[temp.labelField] : v || "--";
        }
      }
      return "null" == v ? "--" : v || "--";
    };
    if (fieldMappingList.value?.length > 0) {
      const temp = fieldMappingList.value.find(
        (item: any) => item.fieldName == name,
      );
      if (temp)
        return row[temp.mappingDisplayField] || subFormat(name, cellValue, row);
    }
    return subFormat(name, cellValue, row);
  };

  // ==================== 提交后回调 ====================
  const dataRecall = (formData: any, _result?: any, tr?: Ref<any>) => {
    const ref = tr?.value ?? tableRef?.value;
    if (props.preview) {
      ref?.assignStaticData?.(formData?.dataMap ?? formData);
    } else {
      ref?.loadByPage?.();
    }
  };

  // ==================== 删除确认（二次确认） ====================
  const deleteVisible = ref(false);
  const deleteLoading = ref(false);
  const pendingDeleteRows = ref<any[]>([]);
  const handleDelete = (rows: any | any[]) => {
    pendingDeleteRows.value = Array.isArray(rows) ? rows : [rows];
    deleteVisible.value = true;
  };
  const confirmDelete = async (deleteFn?: (rows: any[]) => Promise<any>) => {
    if (!deleteFn) {
      deleteVisible.value = false;
      return;
    }
    deleteLoading.value = true;
    try {
      await deleteFn(pendingDeleteRows.value);
      const ref = tableRef?.value;
      if (props.preview) {
        ref?.assignStaticData?.([]);
      } else {
        ref?.loadByPage?.();
      }
      deleteVisible.value = false;
    } catch (e) {
      console.error("[useCommonPage] delete error:", e);
    } finally {
      deleteLoading.value = false;
    }
  };

  // ==================== 生命周期 ====================
  const init = async () => {
    await loadFormData();
  };
  onMounted(() => {
    init();
  });
  watch(
    () => props.compList,
    () => {
      loadFormData();
    },
    { deep: true },
  );
  watch(
    () => props.currentPageClass,
    () => {
      loadFormData();
    },
    { deep: true },
  );

  return {
    // 状态
    isLoading,
    hasData,
    errorMsg,
    primaryKey,
    rules,
    relationTables,
    tableFieldList,
    searchFormData,
    apiEndpoints,
    dateFields,
    fieldMappingList,
    dataSource,
    extBtns,
    dialogProps,
    // 规则引擎
    ruleFormId,
    ruleFormData,
    ruleLoading,
    currentFormId,
    isEnabled,
    triggerOnLoad,
    triggerOnSubmit,
    triggerOnChange,
    triggerOnValidate,
    triggerButtonClick,
    onFormDataLoaded,
    handleBeforeSubmit,
    // 方法
    loadFormData,
    dataFormat,
    dataRecall,
    init,
    // 删除
    deleteVisible,
    deleteLoading,
    pendingDeleteRows,
    handleDelete,
    confirmDelete,
  };
};
