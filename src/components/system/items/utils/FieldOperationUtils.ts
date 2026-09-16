import {postRequest, SearchParams, uuid} from "star-horse-lowcode";
import {computed} from "vue";
import {getDesignFormStore} from "@/store/StoreManager";
import camelCase from "camelcase";
import {getCustomComponentList, getLocalCustomComponentList,} from "@/api/custom_component_api";
import {createDefaultElements} from "@/components/formcomp/container/container-types";

const formData = computed(() => getDesignFormStore().formData);
const numField: Array<string> = [
  "minlength",
  "maxLength",
  "step",
  "rows",
  "height",
  "width",
  "columns",
  "gutter",
  "limit",
  "precision",
  "min",
  "max",
  "highThreshold",
  "lowThreshold",
  "multipleLimit",
];

/**
 * 处理默认值
 * @param type
 */
const getDefaultVal = (type: string) => {
  if (type == "number" || type == "slider" || type == "rate") {
    return undefined;
  } else if (type == "checkbox" || type == "transfer") {
    return [];
  } else {
    return "";
  }
};

/**
 * 同步组件来源标识与配置快照到目标实例。
 *
 * 更换/添加组件时,若来源是"我的组件"(isCustom),需把其保存的配置快照
 * (prepSnapshot)写回目标实例的preps,并打上来源标识,使属性面板能按
 * idCustomComponent精确匹配到"我的组件"的配置定义,而非误命中同名系统组件。
 * 若来源是系统组件,清除目标实例上可能残留的自定义来源标识。
 *
 * 排除实例专属字段(id/name/label/itemNameLabel),避免覆盖实例身份。
 *
 * @param target 目标实例(将被原地修改),需已存在preps对象
 * @param source 来源组件(物料区选中项,含isCustom/prepSnapshot等)
 */
export function syncCompSource(target: any, source: any) {
  delete target.isCustom;
  delete target.idCustomComponent;
  delete target.prepSnapshot;
  delete target.storageMode;
  delete target.isShared;
  if (!source?.isCustom || !source.prepSnapshot) return;
  const excludeKeys = ["id", "name", "label", "itemNameLabel"];
  for (const key in source.prepSnapshot) {
    if (!excludeKeys.includes(key)) {
      target.preps[key] = source.prepSnapshot[key];
    }
  }
  target.isCustom = true;
  target.idCustomComponent = source.idCustomComponent;
  target.prepSnapshot = source.prepSnapshot;
  if (source.storageMode) target.storageMode = source.storageMode;
  if (source.isShared !== undefined) target.isShared = source.isShared;
}

/**
 * 复制字段
 * @param data
 * @param type
 */
export function fieldCopy(data: any, type: string) {
  const reData = JSON.parse(JSON.stringify(data));
  //如果数据没有索引，则初始化索引
  // const ms = getDesignFormStore().getFieldDataIndex();
  const mvData: any = {};
  const tempId = uuid();
  mvData["id"] = "Id" + tempId;
  // console.log(reData);
  /**
   * 处理preps
   */
  const preps = reData.preps;
  mvData["preps"] = {};
  for (const key in preps) {
    const temp = preps[key];
    if (numField.includes(temp.fieldName)) {
      try {
        mvData.preps[temp.fieldName] = parseInt(temp.defaultValues);
      } catch (e) {
        mvData.preps[temp.fieldName] = null;
      }
    } else {
      mvData.preps[temp.fieldName] = temp.defaultValues;
    }
  }
  mvData.preps["id"] = mvData["id"];
  mvData.preps["label"] = reData.itemName;
  mvData.preps["itemNameLabel"] = reData.itemName;
  mvData.preps["name"] = camelCase(["field", tempId.substring(0, 6)]);
  formData.value[reData.preps.fieldName] = getDefaultVal(reData.itemType);
  mvData["compType"] = type;
  mvData["fieldName"] = mvData.preps["name"];
  mvData["itemType"] = reData.itemType;
  // 自定义组件: 用配置快照覆盖默认preps并同步来源标识(保留实例专属字段)
  syncCompSource(mvData, reData);
  if (
    reData.itemType == "box" ||
    reData.itemType == "dytable" ||
    reData.itemType == "gridtable"
  ) {
    mvData.rowNums = 1;
    mvData.columnNums = 1;
    const col: any = { id: uuid(), cellVisible: true, colIndex: 1, items: [] };
    if (reData.itemType == "box") {
      col.colspan = 24;
      col.rowspan = 1;
    } else {
      col.colspan = 1;
      col.rowspan = 1;
    }
    mvData.preps["elements"] = [
      {
        id: uuid(),
        rowIndex: 1,
        columns: [col],
      },
    ];
  } else if (reData.itemType == "table") {
    mvData.preps["elements"] = [
      { id: uuid(), colIndex: 1, columns: 1, items: [] },
    ];
  } else if (reData.itemType == "condition") {
    mvData.preps["children"] = [];
    mvData.preps["items"] = [];
  } else if (type == "container") {
    // 扁平型容器(tab-like): elements[].items[] 结构
    const { elements: defaultElements, extraPreps } = createDefaultElements(
      reData.itemType,
      reData.itemName,
    );
    mvData.preps["elements"] = defaultElements;
    if (extraPreps) {
      for (const key in extraPreps) {
        mvData[key] = extraPreps[key];
      }
    }
    // 从fields和advancedFields中提取默认值到preps
    const allFields = [
      ...(reData.fields || []),
      ...(reData.advancedFields || []),
    ];
    allFields.forEach((f: any) => {
      if (
        f.fieldName &&
        f.defaultValues !== "" &&
        f.defaultValues != null &&
        mvData.preps[f.fieldName] === undefined
      ) {
        if (f.fieldType === "switch") {
          mvData.preps[f.fieldName] =
            f.defaultValues === true || f.defaultValues === "true";
        } else if (f.fieldType === "number") {
          try {
            mvData.preps[f.fieldName] = parseInt(f.defaultValues);
          } catch (e) {
            mvData.preps[f.fieldName] = null;
          }
        } else {
          mvData.preps[f.fieldName] = f.defaultValues;
        }
      }
    });
  }
  return mvData;
}

export function compFieldInit() {
  const url = "/userdb-manage/userdb/dynamicFormItems/getAllByCondition";
  const allFormDataList: Array<any> = [];
  const assignData = (datas: any) => {
    datas.forEach((item: any) => {
      allFormDataList.push({
        name: item.itemName,
        value: item.itemType,
      });
    });
  };

  // 合并为一次请求，查询所有分类的数据
  const queryAllData = () => {
    const params: SearchParams[] = [
      /* {
                    propertyName: "category",
                    operation: "in",
                    value: [1, 2, 3] // 一次性获取所有三个分类的数据
                  },*/
      {
        propertyName: "isDel",
        value: 0,
      },
    ];
    const query = {
      fieldList: params,
      orderBy: [{ fieldName: "dataSort", orderBy: "asc" }],
    };
    return new Promise((resolve) => {
      postRequest(url, query).then((res) => {
        resolve(res.data?.data);
      });
    });
  };

  // 发送一次请求，然后在前端进行数据分类
  return queryAllData().then((allData: any) => {
    // 按category字段对数据进行分类
    const containerRes =
      allData?.filter((item: any) => item.category === 2) || [];
    const itemsRes = allData?.filter((item: any) => item.category === 1) || [];
    const selfItemsRes =
      allData?.filter((item: any) => item.category === 3) || [];

    // 处理数据，保持原有逻辑
    assignData(containerRes);
    assignData(itemsRes);
    assignData(selfItemsRes);

    getDesignFormStore().setContainerList(containerRes);
    getDesignFormStore().setFormDataList(itemsRes);
    getDesignFormStore().setSelfFormDataList(selfItemsRes);
    getDesignFormStore().setAllFormDataList(allFormDataList);
  });
}

/**
 * 将后端/本地自定义组件原始数据转换为CompType格式
 */
function buildCustomCompList(list: any[]): any[] {
  const designForm = getDesignFormStore();
  const allComps: any[] = [
    ...designForm.containerDataList,
    ...designForm.formDataList,
    ...designForm.selfFormDataList,
  ];
  const customComps: any[] = [];
  list.forEach((item: any) => {
    const baseComp = allComps.find(
      (c: any) => c.itemType === item.baseItemType,
    );
    if (baseComp) {
      const comp = JSON.parse(JSON.stringify(baseComp));
      comp.itemName = item.compName;
      comp.itemIcon = item.compIcon || baseComp.itemIcon;
      comp.isCustom = true;
      comp.idCustomComponent = item.idCustomComponent;
      comp.customDescription = item.description;
      comp.storageMode = item.storageMode || "db";
      // 基础组件定义中没有compType字段(仅在fieldCopy拖入舞台时才设置),
      // 此处用保存时记录的baseCompType补全,确保容器/组件分类正确
      comp.compType =
        item.baseCompType ||
        (baseComp.category === 2 ? "container" : "formItem");
      comp.isShared = item.isShared;
      let snapshot: Record<string, any> = {};
      try {
        snapshot = JSON.parse(item.prepSnapshot || "{}");
      } catch (_) {
        snapshot = {};
      }
      comp.prepSnapshot = snapshot;
      if (Array.isArray(comp.preps)) {
        comp.preps.forEach((prep: any) => {
          if (
            prep &&
            prep.fieldName &&
            snapshot[prep.fieldName] !== undefined
          ) {
            prep.defaultValues = snapshot[prep.fieldName];
          }
        });
      } else if (comp.preps && typeof comp.preps === "object") {
        for (const key in snapshot) {
          if (
            comp.preps[key] &&
            typeof comp.preps[key] === "object" &&
            "defaultValues" in comp.preps[key]
          ) {
            comp.preps[key].defaultValues = snapshot[key];
          }
        }
      }
      customComps.push(comp);
    }
  });
  return customComps;
}

/**
 * 加载自定义第三方组件(同时从本地缓存和数据库加载),转换为CompType格式追加到selfFormDataList
 */
export function loadCustomComponents() {
  // 先加载本地缓存组件(同步,立即可用)
  const localList = getLocalCustomComponentList();
  const localComps = buildCustomCompList(localList);
  const designForm = getDesignFormStore();
  // 移除旧的自定义组件(保留系统扩展组件),避免重复加载
  const existingNonCustom = designForm.selfFormDataList.filter(
    (c: any) => !c.isCustom,
  );
  designForm.setSelfFormDataList([...existingNonCustom, ...localComps]);
  // 再异步加载数据库组件
  return getCustomComponentList()
    .then((res: any) => {
      const dbList = res?.data?.data || [];
      const dbComps = buildCustomCompList(dbList);
      const currentNonCustom = designForm.selfFormDataList.filter(
        (c: any) => !c.isCustom,
      );
      designForm.setSelfFormDataList([
        ...currentNonCustom,
        ...localComps,
        ...dbComps,
      ]);
    })
    .catch((err) => {
      console.error("加载数据库自定义组件失败:", err);
    });
}

/**
 * Post-process imported container data: ensure box/dytable containers have
 * correct rowNums & columnNums in preps (and top-level) derived from their
 * actual elements grid structure.
 * 供设计器与扩展组件（如 AI 生成表单）共同使用。
 */
export function initContainerDimensions(comps: any[]) {
  if (!Array.isArray(comps)) return;
  for (const comp of comps) {
    // Recurse into nested containers (card, tab, collapse, splitter, condition)
    if (comp.compType === "container" && comp.preps?.elements) {
      for (const element of comp.preps.elements) {
        // tab/collapse/card/splitter elements have .items
        if (element.items && Array.isArray(element.items)) {
          initContainerDimensions(element.items);
        }
        // box/dytable elements have .columns[].items
        if (element.columns && Array.isArray(element.columns)) {
          for (const col of element.columns) {
            if (col.items && Array.isArray(col.items)) {
              initContainerDimensions(col.items);
            }
          }
        }
      }
    }
    // Also handle condition containers with children
    if (comp.children && Array.isArray(comp.children)) {
      initContainerDimensions(comp.children);
    }
    // Fix box/dytable/gridtable dimensions
    if (
      comp.compType === "container" &&
      (comp.itemType === "box" ||
        comp.itemType === "dytable" ||
        comp.itemType === "gridtable")
    ) {
      const elements = comp.preps?.elements;
      if (Array.isArray(elements) && elements.length > 0) {
        const rows = elements.length;
        const cols = elements[0]?.columns?.length || 1;
        // Set in preps (read by property panel)
        if (!comp.preps) comp.preps = {};
        comp.preps.rowNums = rows;
        comp.preps.columnNums = cols;
        // Set at top-level (fallback for property panel)
        comp.rowNums = rows;
        comp.columnNums = cols;
      }
    }
  }
}
