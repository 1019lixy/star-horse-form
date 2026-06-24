<script setup lang="ts">
import {initApi, openDatabase, tableColumns,} from "@/components/system/items/utils/DbSearchUtils";
import {i18n} from "@/lang";
import {
  BtnAuth,
  closeLoad,
  convertToCamelCase,
  getDesignFormStore,
  isJson,
  load,
  PageFieldInfo,
  postRequest,
  SelectOption,
  success,
  warning,
} from "star-horse-lowcode";
import {computed, ComputedRef, nextTick, onMounted, PropType, ref, unref, watch,} from "vue";
import {FormConfig} from "@/components/types";

const props = defineProps({
  optional: {type: Object as PropType<FormConfig>},
});
let designForm = getDesignFormStore();
let allFormDataList = computed(() => designForm.allFormDataList);
let compSize = computed(() => props.optional?.compSize || "default");
let dbIndex = ref<any>(null);
let formData: ComputedRef<any> = computed(() => designForm.formData);
let compList = computed(() => designForm.compList);
const filterTableName = ref<string>("");
const tbTab = ref<string>("tb1");
let assignDataList = ref<Array<any>>([]);
let selectFields = ref<Array<SelectOption>>([]);
let dbList = ref<any>([]);
let tableFieldInfoRef = ref<any>();
let tableAndColumnsList = ref<any>([]);
let currentIndex = ref<any>(null);
let containerTypeList = computed(() => {
  let temp: Array<SelectOption> = [];
  designForm.containerList.forEach((item: any) => {
    temp.push({
      name: item.itemName,
      value: item.itemType,
    });
  });
  return temp;
});
let configData = ref<any>({
  columns: 1,
  commonFieldFlag: "N",
});
let currentData = ref<any>({});
const fieldCompTypesMsg = i18n("dyform.utils.dbList.fieldCompTypesMsg");
let columnsContr = ref<string>("Y");
let added = ref<string>("N");
/**
 * 判断列数是否需要禁用
 * @param val
 */
const containerTypeOperation = (val: any) => {
  columnsContr.value = val["containerType"] == "box" ? "N" : "Y";
};
const configFormRef = ref<any>();
const tableFormRef = ref<any>();
const createMenuFlag = ref<boolean>(false);
const rolesList = ref<Array<SelectOption>>([]);
const appinfoList = ref<SelectOption[]>([]);
const menuList = ref<Array<SelectOption>>([]);
const pageStyleList = ref<Array<SelectOption>>([]);
const dataLoadConditionList = ref<Array<SelectOption>>([]);
const primaryKeyPolicyList = ref<Array<SelectOption>>([]);
const buttonPermissionsList = ref<Array<SelectOption>>([]);
const tableFieldInfo = ref<PageFieldInfo>({
  batchFieldList: [
    {
      batchName: "tableNameList",
      staticData: "N",
      fieldList: [
        {
          label: i18n("dyform.utils.496"),
          fieldName: "tableName",
          type: "input",
          formVisible: true,
          listVisible: true,
          required: true,
        },
        {
          label: i18n("dyform.utils.555"),
          fieldName: "comment",
          type: "input",
          formVisible: true,
          listVisible: true,
          required: true,
        },
      ],
    },
  ],
});
const configFieldInfo = ref<PageFieldInfo>({
  fieldList: [
    [
      {
        label: i18n("dyform.utils.556"),
        fieldName: "idDbConfigInfo",
        type: "select",
        formVisible: true,
        listVisible: true,
        required: true,
        actions: {
          change: (val: any) => {
            dbIndex.value = val["idDbConfigInfo"];
            openDb(true);
          },
        },
        preps: {
          values: dbList,
        },
      },
      {
        label: i18n("dyform.utils.557"),
        fieldName: "containerType",
        type: "select",
        defaultValue: "box",
        formVisible: true,
        listVisible: true,
        preps: {
          values: containerTypeList,
        },
      },
      {
        label: i18n("dyform.utils.558"),
        fieldName: "columns",
        type: "number",
        formVisible: true,
        listVisible: true,
        preps: {
          min: 1,
          max: 12,
          step: 1,
        },
      },
    ],
    [
      {
        label: i18n("dyform.utils.559"),
        fieldName: "commonFieldFlag",
        type: "switch",
        formVisible: true,
        listVisible: true,
        preps: {
          activeValue: "Y",
          inactiveValue: "N",
        },
      },
      {
        label: i18n("dyform.utils.560"),
        fieldName: "isCreateMenu",
        type: "switch",
        formVisible: true,
        defaultValue: false,
        actions: {
          change: (val: any) => {
            createMenuFlag.value = val["isCreateMenu"];
          },
        },
        preps: {
          dataRelation: {
            actionName: "change",
            relationDetails: [
              {
                matchType: "eq",
                controlCondition: "eqVisible",
                relationFields: [
                  "idInformations",
                  "parentNo",
                  "userGroupList",
                  "buttonPermissionsList",
                ],
                matchFieldValue: true,
              },
            ],
          },
        },
      },
    ],
    [
      {
        label: i18n("dyform.utils.561"),
        fieldName: "idInformations",
        type: "tselect",
        required: true,
        formVisible: false,
        actions: {
          change: (val: any) => {
            loadMenuBySystemId(val["idInformations"]);
          },
        },
        preps: {
          props: {
            label: "sysName",
            value: "idInformations",
          },
          checkStrictly: true,
          data: appinfoList,
        },
      },
      {
        label: i18n("dyform.utils.562"),
        fieldName: "parentNo",
        type: "tselect",
        formVisible: false,
        listVisible: true,
        preps: {
          checkStrictly: true,
          data: menuList,
          props: {
            label: "menuName",
            value: "dataNo",
          },
        },
      },
    ],
    [
      {
        label: i18n("dyform.utils.563"),
        fieldName: "userGroupList",
        type: "select",
        formVisible: false,
        listVisible: true,
        preps: {
          multiple: true,
          values: rolesList,
        },
      },
      {
        label: i18n("dyform.utils.564"),
        fieldName: "buttonPermissionsList",
        type: "select",
        required: false,
        formVisible: false,
        listVisible: true,
        preps: {
          multiple: true,
          values: buttonPermissionsList,
        },
      },
    ],

    [
      {
        label: i18n("dyform.utils.565"),
        fieldName: "primaryKeyPolicy",
        type: "select",
        defaultValue: "manual",
        formVisible: true,
        preps: {
          editDisabled: true,
          values: primaryKeyPolicyList,
          colspan: 8,
        },
      },
      {
        label: i18n("dyform.common.432"),
        fieldName: "pageStyle",
        type: "select",
        defaultValue: "general",
        formVisible: true,
        preps: {
          colspan: 8,
          values: pageStyleList,
          dataRelation: {
            actionName: "change",
            relationDetails: [
              {
                matchType: "eq",
                controlCondition: "eqVisible",
                relationFields: ["dataLoadField"],
                matchFieldValue: "form",
              },
            ],
          },
        },
      },
      {
        label: i18n("dyform.utils.566"),
        fieldName: "dataLoadField",
        type: "select",
        formVisible: false,
        preps: {
          colspan: 8,
          values: dataLoadConditionList,
        },
      },
    ],

    {
      label: i18n("dyform.utils.567"),
      fieldName: "tableNameList",
      type: "transfer",
      formVisible: true,
      required: true,
      listVisible: true,
      preps: {
        props: {
          label: "label",
          key: "tableName",
        },
        data: assignDataList,
      },
    },
  ],
});
let dataFieldInfo = ref<PageFieldInfo>({
  fieldList: [
    [
      {
        label: i18n("dyform.utils.568"),
        fieldName: "containerType",
        type: "select",
        formVisible: true,
        listVisible: true,
        actions: {change: (val: any) => containerTypeOperation(val)},
        preps: {
          values: containerTypeList,
        },
      },
      {
        label: i18n("dyform.utils.569"),
        fieldName: "columns",
        type: "number",
        helpMsg: i18n("dyform.utils.570"),
        formVisible: true,
        listVisible: true,
        disabled: columnsContr,
        defaultValue: configData.value.columns,
        preps: {
          min: 1,
          max: 12,
          step: 1,
        },
      },
    ],
    {
      label: i18n("dyform.utils.571"),
      fieldName: "exclusionFields",
      type: "select",
      formVisible: true,
      listVisible: true,
      preps: {
        multiple: true,
        values: selectFields,
      },
    },
    {
      batchFieldList: [
        {
          batchName: "fieldCompTypes",
          title: i18n("dyform.utils.572"),
          helpMsg: fieldCompTypesMsg,
          fieldList: [
            {
              label: i18n("dyform.utils.573"),
              fieldName: "fieldName",
              type: "select",
              formVisible: true,
              listVisible: true,
              preps: {
                values: selectFields,
              },
            },
            {
              label: i18n("dyform.utils.557"),
              fieldName: "fieldType",
              type: "select",
              formVisible: true,
              listVisible: true,
              preps: {
                values: allFormDataList,
              },
            },
          ],
        },
      ],
    },
  ],
});
let currentDataVisible = ref<boolean>(false);
let tableDialogVisible = ref<boolean>(false);
const contextOperation = async (evt: Event, data: any, _index: number) => {
  evt.preventDefault();
  evt.stopPropagation();
  currentData.value = data;
  await tableField(data.tableName);
  currentDataVisible.value = true;
  selectFieldsOperation(data.fields);
  containerTypeOperation(data);
  await nextTick();
  added.value = data["added"];
  nextTick(() => {
    tableFieldInfoRef.value?.setFormData(currentData.value);
  });
};
const dataReset = () => {
  tableFieldInfoRef.value.setFormData(currentData.value);
};
const tableSubmit = async (addFlag: boolean = false) => {
  let data = tableFieldInfoRef.value.getFormData();
  currentData.value["containerType"] = unref(data)["containerType"];
  currentData.value["columns"] = unref(data)["columns"];
  currentData.value["exclusionFields"] = unref(data)["exclusionFields"];
  currentData.value["fieldCompTypes"] = unref(data)["fieldCompTypes"];
  tableOperClose();
  if (addFlag) {
    let datas = await onDataCopy(currentData.value);

    designForm.addComp(datas);
    if (datas instanceof Array) {
      let temp = datas[datas.length - 1];
      designForm.selectItem(temp, temp["itemType"], "");
    } else {
      designForm.selectItem(datas, datas["itemType"], "");
    }
  }
};
const tableOperClose = () => {
  currentDataVisible.value = false;
};
const openDb = (commentAndTableVisible: boolean = false) => {
  if (!dbIndex.value || dbIndex.value == "undefined") {
    return;
  }
  openDatabase(dbIndex.value)?.then((res: any) => {
    tableAndColumnsList.value = res;
    tableAndColumnsList.value.forEach((item: any) => {
      item["visible"] = false;
      item["containerType"] = "box";
      item["columns"] = configData.value.columns;
      if (commentAndTableVisible) {
        item["label"] = item["tableName"] + "(" + item["comment"] + ")";
      }
    });
    assignDataList.value = tableAndColumnsList.value;
  });
  currentIndex.value = dbIndex.value;
};
const selectFieldsOperation = (datas: any) => {
  selectFields.value = [];
  datas?.forEach((item: any) => {
    selectFields.value.push({
      name: item.fieldName + "(" + item.comment + ")",
      value: item.fieldName,
    });
  });
};
const tableField = async (tableName: string) => {
  let fdata = tableAndColumnsList.value.find(
      (item: any) => item.tableName == tableName,
  );
  if (fdata?.fields?.length > 0) {
    //如果已经有值，则不再请求后端
    return fdata;
  } else {
    fdata["fields"] = [];
  }
  fdata["fields"] = await tableColumns(currentIndex.value, tableName);
  return fdata;
};
const filterData = () => {
  if (!filterTableName.value) {
    assignDataList.value = tableAndColumnsList.value;
    return;
  }
  assignDataList.value = tableAndColumnsList.value.filter((item: any) =>
      item.tableName.toLowerCase().match(filterTableName.value.toLowerCase()),
  );
};
const loadMenuBySystemId = (systemId: string) => {
  if (
      props.optional?.loadMenuList &&
      typeof props.optional.loadMenuList == "function"
  ) {
    props.optional?.loadMenuList(systemId).then((res: SelectOption[]) => {
      menuList.value = res;
    });
  }
};

const init = async () => {
  if (
      props.optional?.loadDbList &&
      typeof props.optional.loadDbList == "function"
  ) {
    props.optional?.loadDbList()?.then((res: SelectOption[]) => {
      dbList.value = res;
    });
  }
  if (
      props.optional?.loadAppList &&
      typeof props.optional.loadAppList == "function"
  ) {
    props.optional?.loadAppList()?.then((res: SelectOption[]) => {
      appinfoList.value = res;
    });
  }
  if (
      props.optional?.loadRolesList &&
      typeof props.optional.loadRolesList == "function"
  ) {
    props.optional?.loadRolesList()?.then((res: SelectOption[]) => {
      rolesList.value = res;
    });
  }
  if (
      props.optional?.loadDicts &&
      typeof props.optional.loadDicts == "function"
  ) {
    props.optional?.loadDicts("page_style")?.then((res: SelectOption[]) => {
      pageStyleList.value = res;
    });
    props.optional
        ?.loadDicts("DATA_LOAD_CONDITION")
        ?.then((res: SelectOption[]) => {
          dataLoadConditionList.value = res;
        });
    props.optional
        ?.loadDicts("PRIMARY_KEY_POLICY")
        ?.then((res: SelectOption[]) => {
          primaryKeyPolicyList.value = res;
        });
    props.optional
        ?.loadDicts("button_authority")
        ?.then((res: SelectOption[]) => {
          buttonPermissionsList.value = res;
        });
  }
};
const getDefaultVal = (type: string) => {
  if (type == "number" || type == "slider" || type == "rate") {
    return undefined;
  } else if (type == "checkbox" || type == "transfer") {
    return [];
  } else {
    return "";
  }
};
const getFieldType = (item: any, fieldCompTypes: Array<any>) => {
  if (fieldCompTypes && fieldCompTypes.length > 0) {
    let result = fieldCompTypes.find(
        (temp: any) => temp.fieldName == item.fieldName,
    );
    if (result && result.fieldType) {
      return result.fieldType;
    }
  }
  let type = item.type.toLowerCase();
  if (type.includes("varchar") || type.includes("character")) {
    return "input";
  } else if (
      type.includes("number") ||
      type.includes("int") ||
      type.includes("bigint") ||
      type.includes("serial")
  ) {
    return "number";
  } else if (
      type.includes("date") ||
      type.includes("datetime") ||
      type.includes("timestamp")
  ) {
    return "datetime";
  }
  return "input";
};
const onDataCopy = async (data: any) => {
  console.log(data, data.tableName);
  let tableName = data.tableName;
  let tableInfo = await tableField(tableName);
  if (!tableInfo || !tableInfo.fields) {
    warning(i18n("dyform.utils.574"));
    return {};
  }
  let compLength = compList.value.length;
  let fieldList = JSON.parse(JSON.stringify(tableInfo.fields));
  let mvDataList = [];
  let config = unref(configData);
  let formInfo: any = {
    tbName: tableName,
    formName: data.comment || "",
    needCommonFields:
        data.commonFieldFlag == "Y"
            ? "Y"
            : configData.value.commonFieldFlag == "Y"
                ? "Y"
                : "N",
  };
  data["added"] = "Y";
  for (let i in fieldList) {
    let reData = fieldList[i];
    let fieldName: string = convertToCamelCase(reData.fieldName.toLowerCase())!;
    let ms = formData.value["index"]++;
    if (
        reData.commonFieldFlag?.toLowerCase() == "y" &&
        config.commonFieldFlag?.toLowerCase() == "n"
    ) {
      continue;
    }
    if (reData.primaryKey?.toLowerCase() == "y") {
      formInfo["formId"] = fieldName;
      continue;
    }
    //如果有过滤的字段，则跳过
    let fResult = data.exclusionFields?.find(
        (item: string) => item == reData.fieldName,
    );
    if (fResult) {
      continue;
    }
    let mvData: any = {};
    mvData["id"] = "persistId" + ms;
    /**
     * 处理preps
     */
    mvData["preps"] = {
      clearable: true,
      comment: "",
      controls: true,
      required: reData["nullFlag"] == "N" ? true : false,
      controlsPosition: "",
      disabled: false,
      formVisible: true,
      placeholder: "",
    };
    mvData["itemType"] = getFieldType(reData, data.fieldCompTypes);
    mvData.preps["id"] = mvData["id"];
    let labelName = reData.comment;
    if (labelName && isJson(labelName)) {
      labelName = labelName.replaceAll("“", '"');
      labelName = labelName.replaceAll("”", '"');
      try {
        let jsonData = JSON.parse(labelName);
        labelName = jsonData["desc"];
      } catch (e) {
        labelName = i18n("dyform.utils.575");
      }
    }
    mvData.preps["label"] = labelName;
    mvData.preps["itemNameLabel"] = labelName;
    mvData.preps["name"] = fieldName;
    formData.value[fieldName] = getDefaultVal(mvData["itemType"]);
    mvData["compType"] = "item";
    mvDataList.push(mvData);
  }
  if (compLength == 0 || compLength == 1) {
    designForm.setFormInfo(formInfo);
  }
  let elements = [];
  if ((config.columns > 1 || data.columns > 1) && data.containerType == "box") {
    let boxColumns = data.columns > 1 ? data.columns : config.columns;
    let boxId = "box" + formData.value["index"]++;
    let box: any = {
      id: boxId,
      compType: "container",
      itemType: "box",
      preps: {
        id: boxId,
        formVisible: false,
        gutter: 0,
        justify: "start",
        readonly: false,
        required: false,
        searchVisible: false,
        size: "default",
        listVisible: false,
        tag: "div",
        label: i18n("dyform.container.312"),
        name: "box",
      },
    };
    let col = parseInt(boxColumns);
    let rows =
        mvDataList.length % col == 0
            ? mvDataList.length / col
            : mvDataList.length / col + 1;
    let index = 0;
    for (let r = 1; r <= rows; r++) {
      let columns = [];
      for (let i = 1; i <= col; i++) {
        let temp = mvDataList[index++];
        if (temp) {
          columns.push({
            colIndex: i,
            colspan: 24 / col,
            items: [temp],
            xh: i,
          });
        }
      }
      elements.push({
        rowIndex: r,
        columns: columns,
        xh: r,
      });
    }
    box.preps["elements"] = elements;
    designForm.setDraggingItem(mvDataList[0]);
    return box;
  } else if (data.containerType == "table") {
    let tableId = "table" + formData.value["index"]++;
    let table: any = {
      id: tableId,
      compType: "container",
      itemType: "table",
      preps: {
        id: tableId,
        align: "top",
        batchFieldName: convertToCamelCase(tableName),
        primaryKeyName: formInfo.formId,
        columns: mvDataList.length,
        comment: "",

        readonly: false,
        required: false,
        searchVisible: false,
        size: compSize.value,

        label: i18n("dyform.container.329"),
        templateDownFlag: false,
        importFlag: false,
        name: "table",
      },
    };
    for (let index in mvDataList) {
      let temp = mvDataList[index];
      elements.push({
        colIndex: parseInt(index) + 1,
        items: [temp],
      });
    }
    table.preps["elements"] = elements;
    designForm.setDraggingItem(mvDataList[0]);
    return table;
  } else {
    designForm.setDraggingItem(mvDataList[0]);
    return mvDataList;
  }
};
const configDialogVisible = ref<boolean>(false);
const closeAction = () => {
  configDialogVisible.value = false;
  tableDialogVisible.value = false;
};
const viewConfig = () => {
  configDialogVisible.value = true;
};
const configMsg = i18n("dyform.utils.dbList.configMsg");
const dynamicBtn = () => {
  let userBtn: BtnAuth[] = [];
  userBtn.push({
    btnName: i18n("dyform.utils.576"),
    labelName: i18n("dyform.utils.576"),
    icon: "add",
    disabled: added.value,
    exec: () => {
      tableSubmit(true);
    },
  });
  return userBtn;
};
const parentDialogType = ref<string>("");
const configDataSubmit = (type: string) => {
  // closeAction();
  configFormRef.value.$refs.starHorseFormRef.validate((res: boolean) => {
    // 提交配置数据
    if (!res) {
      return;
    }
    parentDialogType.value = type;
    let tempFormData = configFormRef.value.getFormData().value;
    configData.value = {...tempFormData};
    if (props.optional?.batchCreatePage) {
      let tableInfoList: any = [];
      tempFormData["tableNameList"]?.forEach((item: string) => {
        let findData = assignDataList.value?.find(
            (temp: any) => temp.tableName == item,
        );
        if (findData) {
          let comment = "";
          if (isJson(findData.comment)) {
            comment = JSON.parse(findData.comment)["desc"];
          } else {
            comment = findData.comment;
          }
          tableInfoList.push({
            tableName: findData.tableName,
            comment: comment,
          });
        }
      });
      configData.value["tableNameList"] = tableInfoList;
      if (createMenuFlag.value) {
        tableDialogVisible.value = true;
        return;
      } else {
        execCreateData(type);
      }
    }
  });
};
const execCreateData = (type: string) => {
  tableFormRef.value.$refs.starHorseFormRef.validate((res: boolean) => {
    // 提交配置数据
    if (!res) {
      return;
    }
    doCreateData(parentDialogType.value);
    tableDialogVisible.value = false;
  });
};
const doCreateData = (type: string) => {
  if (!props.optional) {
    warning(i18n("dyform.utils.577"));
    return;
  }
  //创建页面
  load(i18n("dyform.utils.578"));
  postRequest(
      `${props.optional?.api?.basePrefix}/batchCreateForm`,
      configData.value,
  )
      .then((res: any) => {
        if (res.data.code) {
          warning(res.data.cnMessage);
          return;
        } else {
          success(res.data.cnMessage);
          configData.value = {column: 1};
          configFormRef.value.resetForm();
          if (type == "close") {
            closeAction();
          }
        }
      })
      .finally(() => {
        closeLoad();
      });
};
onMounted(() => {
  init();
});
watch(() => props.optional.dbInfoApi, (val) => {
  if (val) {
    initApi(val);
  }
}, {
  immediate: true,
})
defineExpose({});
</script>
<template>
  <star-horse-dialog
      :dialogVisible="tableDialogVisible"
      @closeAction="tableDialogVisible = false"
      :selfFunc="true"
      :isShowBtnContinue="false"
      @resetForm="configData = { columns: 1 }"
      @merge="execCreateData"
      :title="i18n('dyform.utils.579')"
      :box-width="'40%'"
  >
    <star-horse-form
        :size="compSize"
        :outerFormData="configData"
        :fieldList="tableFieldInfo"
        ref="tableFormRef"
    >
    </star-horse-form>
  </star-horse-dialog>
  <star-horse-dialog
      :boxWidth="'40%'"
      :boxHeight="'60%'"
      :dialogVisible="currentDataVisible"
      :selfFunc="true"
      :userBtn="dynamicBtn()"
      @resetForm="dataReset"
      @closeAction="tableOperClose"
      @merge="() => tableSubmit(false)"
  >
    <el-tabs v-model="tbTab">
      <el-tab-pane name="tb1">
        <template #label>
          <div class="flex items-center">
            <star-horse-icon
                icon-class="config"
                color="var(--star-horse-style)"
            />
            {{ i18n('dyform.utils.dbList.styleSetting') }}
            <help :width="400" :message="configMsg"/>
          </div>
        </template>
        <star-horse-form ref="tableFieldInfoRef" :field-list="dataFieldInfo"/>
      </el-tab-pane>
      <el-tab-pane name="tb2" :label="i18n('dyform.utils.580')" class="h-full overflow-hidden">
        <el-scrollbar height="100%">
          <table class="el-table field-table" style="width: 100%">
            <thead>
            <tr class="font-bold size9">
              <th>{{ i18n('dyform.utils.dbList.name') }}</th>
              <th>{{ i18n('dyform.utils.dbList.type') }}</th>
              <th class="w-[60px]">{{ i18n('dyform.utils.dbList.nullFlag') }}</th>
              <th class="w-[40px]">{{ i18n('dyform.utils.dbList.primaryKey') }}</th>
              <th>{{ i18n('dyform.utils.dbList.remark') }}</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="sdata in currentData.fields">
              <td>{{ sdata.fieldName }}</td>
              <td>{{ sdata.type }}</td>
              <td>{{ sdata.nullFlag }}</td>
              <td>{{ sdata.primaryKey }}</td>
              <td>{{ sdata.comment }}</td>
            </tr>
            </tbody>
          </table>
        </el-scrollbar>
      </el-tab-pane>
    </el-tabs>
  </star-horse-dialog>
  <star-horse-dialog
      :dialogVisible="configDialogVisible"
      @closeAction="closeAction"
      :selfFunc="true"
      :isShowBtnContinue="true"
      @resetForm="configData = { columns: 1 }"
      @merge="configDataSubmit"
      :title="i18n('dyform.utils.581')"
      :box-width="'50%'"
  >
    <star-horse-form
        :size="compSize"
        :outerFormData="configData"
        :fieldList="configFieldInfo"
        ref="configFormRef"
    >
    </star-horse-form>
  </star-horse-dialog>
  <div
      class="flex flex-col justify-between mt-5 w-[98%] mx-auto h-full overflow-hidden"
  >
    <div class="flex justify-between items-center">
      <el-select
          :size="compSize"
          @change="openDb"
          clearable
          filterable
          id="dbInfo"
          :placeholder="i18n('dyform.utils.582')"
          v-model="dbIndex"
      >
        <el-option
            :key="sitem.value"
            :label="sitem.name"
            :value="sitem.value"
            v-for="sitem in dbList"
        ></el-option>
      </el-select>
      <el-button link @click="viewConfig" :size="compSize">
        <star-horse-icon icon-class="setting" color="var(--star-horse-style)"/>
        <span>{{ i18n('dyform.utils.dbList.config') }}</span>
      </el-button>
    </div>

    <div style="margin-top: 5px"></div>
    <el-input
        :size="compSize"
        :placeholder="i18n('dyform.utils.583')"
        v-model="filterTableName"
        @keydown.enter="filterData"
    >
      <template #append>
        <star-horse-icon
            @click="filterData"
            icon-class="search"
            color="var(--star-horse-style)"
        />
      </template>
    </el-input>
    <div class="flex flex-1 overflow-hidden">
      <el-scrollbar>
        <draggable
            :clone="onDataCopy"
            :group="{ name: 'starHorseGroup', pull: 'clone', put: false }"
            :sort="false"
            animation="300"
            ghost-class="ghost"
            item-key="id"
            tag="ul"
            :list="assignDataList"
        >
          <template #item="{ element: data, index: idx }">
            <li
                :style="{
                border:
                  currentData.tableName == data.tableName
                    ? '2px dashed var(--star-horse-style)'
                    : 'none',
                'align-items': 'center',
                cursor: 'move',
              }"
            >
              <star-horse-icon icon-class="table" size="18px"/>
              <el-tooltip :content="data.comment">
                {{ data.tableName }}
              </el-tooltip>
              <star-horse-icon
                  :title="i18n('dyform.utils.584')"
                  icon-class="setting"
                  style="color: var(--star-horse-style); cursor: pointer"
                  @click="(evt: Event) => contextOperation(evt, data, idx)"
              />
            </li>
          </template>
        </draggable>
      </el-scrollbar>
    </div>
    <div class="h-[25px]"></div>
  </div>
</template>
<style scoped lang="scss">
:deep(.el-popover) {
  overflow-x: hidden;
}

.popover-header {
  display: flex;
  background: var(--star-horse-style);
  height: 30px;
  justify-content: end;
}

ul {
  margin: 5px;
  display: flex;
  flex-direction: column;

  li {
    height: 30px;
    border-radius: 2px;
    cursor: pointer;
    margin: 1px;
    display: flex;

    :deep(.el-tooltip__trigger) {
      display: inline-flex;
      align-items: center;
      margin-top: 0;
      overflow: hidden;
      vertical-align: middle;
      text-overflow: ellipsis;
      white-space: nowrap;
      text-align: left;
      height: inherit;
      flex: 1;
    }

    .svg-icon {
      width: 18px;
      height: 18px;
    }
  }

  li:nth-child(even) {
    background: #e5e5e5;
  }

  li:nth-child(odd) {
    background: #f1f2f3;
  }
}

.field-table {
  border: 1px solid var(--star-horse-style);

  tr > th,
  tr > td {
    border: 1px solid var(--star-horse-style);
    height: 25px;
    font-size: 12px;
    padding-left: 5px;

    :nth-child(2) {
      width: 120px;
    }
  }
}
</style>
