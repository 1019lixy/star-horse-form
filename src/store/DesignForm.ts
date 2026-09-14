import {defineStore} from "pinia";
import {computed, nextTick, ref, shallowRef, triggerRef, unref} from "vue";
import JSON5 from "json5";
import {CompType, UserInfo} from "@/components/types/DesignFormTypes";
import {analysisCompDatas} from "star-horse-lowcode";

export const useDesignFormStore = defineStore("designForm", () => {
  const containerDataList = ref<CompType[]>([]);
  const formDataList = ref<CompType[]>([]);
  const selfFormDataList = ref<CompType[]>([]);
  const mesFormDataList = ref<CompType[]>([]);
  const allFormDataList = ref<Array<any>>([]);
  const formInfo = ref<any>({});
  const compList = ref<Array<any>>([]);
  const compListNoLayer = shallowRef<Record<string, any>>({});
  const editUserList = shallowRef<Record<string, UserInfo>>({});
  const formData = ref<any>({});
  const currentComp = ref<Array<any> | any>();
  const isCompListUpdated = ref<boolean>(true);
  const cachedCompListNoLayer = shallowRef<Record<string, any>>({});
  const cachedSelectList = shallowRef<any>([]);
  const parentContainer = ref<Record<string, any>>({});
  const currentItemType = ref<string>("");
  const currentCompCategory = ref<string>("");
  const parentCompType = ref<string>("");
  const currentItemId = ref<string>("");
  const currentSubItemId = ref<string>("");
  const currentSubItem = ref<Record<string, any>>({});
  const currentSubTabName = ref<string>("");
  const isEdit = ref<boolean>(false);
  const componentVisible = ref<boolean>(false);
  const batchEditFieldVisible = ref<boolean>(false);
  const previewVisible = ref<boolean>(false);
  const refresh = ref<number>(0);
  const currentFormPreps = computed(() => {
    const comp = currentComp.value;
    return comp?.preps || comp || {};
  });
  const draggingItem = ref<any>({});
  const isDragging = ref<boolean>(false);
  const shortKeyDisabled = ref<boolean>(false);
  const historyRecord = ref<any>({
    index: -1,
    maxStep: 20,
    datas: [],
  });

  const addHistoryRecord = (reOrUnDoFlag: boolean) => {
    if (reOrUnDoFlag || compList.value.length == 0) {
      return;
    }
    const record = historyRecord;
    const recordData: any = {
      complist: unref(compList),
      currentCompCategory: unref(currentCompCategory),
      currentItemId: unref(currentItemId),
      parentCompType: unref(parentCompType),
      currentItemType: unref(currentItemType),
      currentFormPreps: unref(currentFormPreps),
    };
    record.value.index = -1;
    record.value.datas.splice(0, 0, JSON5.stringify(recordData));
    if (record.value.datas.length > record.value.maxStep) {
      record.value.datas.splice(record.value.datas.length - 1, 1);
    }
  };
  const redo = () => {
    if (historyRecord.value.index < 0) {
      return;
    }
    historyRecord.value.index = historyRecord.value.index - 1;
    reAndUnDo();
  };

  const reAndUnDo = () => {
    const record = unref(historyRecord);
    if (!record.datas[record.index]) {
      currentItemType.value = "";
      currentComp.value = {};
      currentItemId.value = "";
      parentCompType.value = "";
      currentCompCategory.value = "";
      compList.value = [];
      isCompListUpdated.value = true;
    } else {
      const data = JSON5.parse(record.datas[record.index]);
      setCompList(data.complist);
      currentCompCategory.value = data.currentCompCategory;
      currentItemId.value = data.currentItemId;
      parentCompType.value = data.parentCompType;
      currentItemType.value = data.currentItemType;
    }
  };

  const undo = () => {
    const record = unref(historyRecord);
    historyRecord.value.index = record.index < 0 ? 1 : record.index + 1;
    if (historyRecord.value.index > record.datas.length) {
      historyRecord.value.index = record.datas.length - 1;
    }
    if (historyRecord.value.index > record.maxStep) {
      historyRecord.value.index = record.maxStep;
    }
    reAndUnDo();
  };
  const selectItem = (data: any, itemType: string, parentType: string) => {
    const itemId = data?.id || data?.preps?.id;
    currentItemId.value = itemId;
    currentCompCategory.value = data?.compType || "";
    parentCompType.value = parentType;
    currentComp.value = null;
    triggerRef(currentComp);
    nextTick(() => {
      currentComp.value = data;
      currentItemType.value = itemType || data?.itemType || "";
      setIsDragging(false);
      setRefresh();
      triggerRef(currentComp);
    });
  };
  const setParentContainer = (item: any) => {
    parentContainer.value = item;
  };
  const getParentContainer = () => {
    return parentContainer.value;
  };
  const setRefresh = () => {
    refresh.value++;
  };
  const setSubItem = (subItem: any) => {
    currentSubItemId.value = subItem.id;
    currentSubItem.value = subItem;
  };
  const setCurrentSubTabName = (subTablePrimaryKey: string) => {
    currentSubTabName.value = subTablePrimaryKey;
  };
  const getParentCompType = () => {
    return parentCompType.value;
  };
  const setFormInfo = (formData: any) => {
    Object.assign(formInfo.value, formData);
  };
  const setCompList = (comps: Array<any>) => {
    compList.value = comps;
    isCompListUpdated.value = true;
  };
  const selectItemById = (itemId: string) => {
    if (
      isCompListUpdated.value ||
      Object.keys(compListNoLayer.value).length == 0
    ) {
      loadCompNames();
    }
    return compListNoLayer.value?.[itemId] || null;
  };

  const loadCompNames = () => {
    if (!isCompListUpdated.value && cachedSelectList.value.length > 0) {
      compListNoLayer.value = cachedCompListNoLayer.value;
      return cachedSelectList.value;
    }
    let { compListResult, selectList } = analysisCompDatas(compList);
    compListNoLayer.value = compListResult;
    cachedCompListNoLayer.value = compListResult;
    cachedSelectList.value = selectList;
    isCompListUpdated.value = false;
    return selectList;
  };

  const addComp = (comp: any) => {
    if (Array.isArray(comp)) {
      compList.value = [...compList.value, ...comp];
    } else {
      compList.value.push(comp);
    }
    isCompListUpdated.value = true;
  };
  const setFormData = (data: any) => {
    formData.value = data;
  };
  const setIsEdit = (editFlag: boolean) => {
    isEdit.value = editFlag;
  };
  const setCurrentComp = (currComp: object) => {
    currentComp.value = currComp;
  };
  const setCurrentItemType = (currItemType: string) => {
    currentItemType.value = currItemType;
  };
  const setParentCompType = (parentType: string) => {
    parentCompType.value = parentType;
  };
  const setCurrentItemId = (currItemId: string) => {
    currentItemId.value = currItemId;
  };
  const setCurrentFormPreps = (currFormPreps: any) => {
    if (currentComp.value) {
      currentComp.value.preps = currFormPreps["preps"] || currFormPreps;
    }
  };
  const setContainerList = (list: CompType[]) => {
    containerDataList.value = list;
  };
  const addContainerList = (list: CompType[]) => {
    if (Array.isArray(list)) {
      containerDataList.value = [...containerDataList.value, ...list];
    } else {
      containerDataList.value.push(list);
    }
  };
  const setFormDataList = (list: CompType[]) => {
    formDataList.value = list;
  };
  const addFormDataList = (list: CompType[]) => {
    if (Array.isArray(list)) {
      formDataList.value = [...formDataList.value, ...list];
    } else {
      formDataList.value.push(list);
    }
  };
  const setSelfFormDataList = (list: CompType[]) => {
    selfFormDataList.value = list;
  };
  const addSelfFormDataList = (list: CompType[]) => {
    if (Array.isArray(list)) {
      selfFormDataList.value = [...selfFormDataList.value, ...list];
    } else {
      selfFormDataList.value.push(list);
    }
  };
  const setMesFormDataList = (list: CompType[]) => {
    mesFormDataList.value = list;
  };
  const addMesFormDataList = (list: CompType[]) => {
    if (Array.isArray(list)) {
      mesFormDataList.value = [...mesFormDataList.value, ...list];
    } else {
      mesFormDataList.value.push(list);
    }
  };
  const setAllFormDataList = (list: CompType[]) => {
    allFormDataList.value = list;
  };
  const setDraggingItem = (dragItem: any) => {
    draggingItem.value = dragItem;
    setIsDragging(true);
  };
  const setIsDragging = (flag: boolean) => {
    isDragging.value = flag;
  };
  const removePromise = () => {
    const comps = unref(compList);
    for (let i = 0; i < comps.length; i++) {
      const temp = comps[i];
      if (temp instanceof Promise) {
        temp.then((res) => {
          if (Array.isArray(res)) {
            comps.splice(i, 1, ...res);
          } else {
            comps.splice(i, 1, res);
          }
        });
      }
    }
  };
  const clearAll = (_initComp: boolean = true) => {
    const ms = new Date().getTime();
    isEdit.value = true;
    isDragging.value = false;
    currentItemType.value = "";
    currentComp.value = {};
    currentItemId.value = "";
    currentItemType.value = "";
    parentCompType.value = "";
    currentCompCategory.value = "";
    editUserList.value = {};
    parentContainer.value = {};
    formInfo.value = {
      rules: "",
      inline: "N",
      labelPosition: "left",
      labelWidth: "",
      labelSuffix: "",
      hideRequiredAsterisk: "N",
      requireAsteriskPosition: "left",
      showMessage: "Y",
      inlineMessage: "N",
      statusIcon: "N",
      primaryKeyPolicy: "manual",
      createTable: "Y",
      validateOnRuleChange: "Y",
      size: "default",
      disabled: "N",
      dataIndex: 1,
      scrollToError: "N",
      formId: "id" + ms,
      tbName: "tb" + ms,
    };
    compList.value = [];
    isCompListUpdated.value = true;
    formData.value = { index: 1 };
    historyRecord.value = {
      index: -1,
      maxStep: 20,
      datas: [],
    };
  };
  const setComponentVisible = (visible: boolean) => {
    componentVisible.value = visible;
  };
  const setBatchEditFieldVisible = (visible: boolean) => {
    batchEditFieldVisible.value = visible;
  };
  const setPreviewVisible = (visible: boolean) => {
    previewVisible.value = visible;
  };
  const setShortKeyDisabled = (disabled: boolean) => {
    shortKeyDisabled.value = disabled;
  };
  const getFieldDataIndex = () => {
    if (!formInfo.value["dataIndex"]) {
      formInfo.value["dataIndex"] = 1;
    }
    return formInfo.value["dataIndex"]++;
  };
  const getCurrentCompEditUserInfo = (compId: string): UserInfo => {
    return editUserList.value && editUserList.value[compId];
  };
  const addCurrentCompEditUserInfo = (compId: string, userinfo: UserInfo) => {
    Object.entries(editUserList.value).forEach(([key, value]) => {
      if (value.userId == userinfo.userId) {
        delete editUserList.value[key];
      }
    });
    editUserList.value[compId] = userinfo;
  };
  const removeCurrentCompEditUserInfo = (compId: string) => {
    editUserList.value && delete editUserList.value[compId];
  };
  return {
    formData,
    formInfo,
    compList,
    containerDataList,
    formDataList,
    selfFormDataList,
    mesFormDataList,
    allFormDataList,
    currentCompCategory,
    currentItemId,
    parentCompType,
    currentItemType,
    currentFormPreps,
    currentSubItemId,
    currentSubItem,
    isEdit,
    isDragging,
    currentComp,
    draggingItem,
    refresh,
    historyRecord,
    componentVisible,
    batchEditFieldVisible,
    previewVisible,
    shortKeyDisabled,
    setCurrentSubTabName,
    selectItemById,
    setAllFormDataList,
    setSelfFormDataList,
    setFormDataList,
    setContainerList,
    setMesFormDataList,
    setParentContainer,
    getParentContainer,
    getParentCompType,
    addSelfFormDataList,
    addContainerList,
    addFormDataList,
    addMesFormDataList,
    addHistoryRecord,
    redo,
    undo,
    selectItem,
    setRefresh,
    setSubItem,
    setFormInfo,
    setCompList,
    loadCompNames,
    addComp,
    setIsDragging,
    setFormData,
    setIsEdit,
    setCurrentComp,
    setCurrentItemType,
    setParentCompType,
    setCurrentItemId,
    setCurrentFormPreps,
    setDraggingItem,
    removePromise,
    clearAll,
    setComponentVisible,
    setBatchEditFieldVisible,
    setPreviewVisible,
    setShortKeyDisabled,
    getFieldDataIndex,
    getCurrentCompEditUserInfo,
    addCurrentCompEditUserInfo,
    removeCurrentCompEditUserInfo,
  };
});
